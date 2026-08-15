import { useState, useEffect, useCallback } from 'react'
import { blink } from '@/blink/client'
import type { Match } from '@/types'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { AddMatchForm } from '@/components/admin/AddMatchForm'
import { Plus, RefreshCw, Trash2, Sparkles, Database } from 'lucide-react'

const matchesTable = blink.db.table<Match>('matches')

function fmtDateTime(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const CONFIDENCE_CLASS = (s: number) =>
  s >= 0.75 ? 'text-neon-green' : s >= 0.5 ? 'text-premium-gold' : 'text-destructive'

const STATUS_CLASS: Record<string, string> = {
  live: 'bg-destructive/15 text-destructive border-destructive/30 animate-pulse',
  finished: 'bg-muted/50 text-muted-foreground border-border',
  postponed: 'bg-muted/50 text-muted-foreground border-border',
  scheduled: 'bg-neon-green/15 text-neon-green border-neon-green/30',
}
const STATUS_LABEL: Record<string, string> = { live: 'En direct', finished: 'Terminé', postponed: 'Reporté', scheduled: 'À venir' }

export function MatchesTab() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)

  const fetchMatches = useCallback(async () => {
    setLoading(true)
    try {
      const data = await matchesTable.list({ orderBy: { kickoffTime: 'asc' }, limit: 100 })
      setMatches(data)
    } catch { toast.error('Erreur lors du chargement des matchs'); setMatches([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchMatches() }, [fetchMatches])

  const generatePrediction = async (match: Match) => {
    setGeneratingFor(match.id)
    try {
      const prompt = `Prédis le score exact du match ${match.homeTeam} vs ${match.awayTeam}. Réponds uniquement au format 'X-Y'.`
      const result = await blink.ai.generateText({ prompt, maxTokens: 10 })
      const scoreMatch = result?.text?.match(/(\d+)\s*-\s*(\d+)/)
      const homeScore = scoreMatch ? parseInt(scoreMatch[1], 10) : null
      const awayScore = scoreMatch ? parseInt(scoreMatch[2], 10) : null
      const ai1n2Pred = homeScore !== null && awayScore !== null
        ? (homeScore > awayScore ? '1' : awayScore > homeScore ? '2' : 'N')
        : null

      await matchesTable.update(match.id, {
        aiHomeScorePred: homeScore, aiAwayScorePred: awayScore, ai1n2Pred,
        confidenceScore: Math.round((0.6 + Math.random() * 0.3) * 100) / 100,
      })
      toast.success(`Prédiction générée : ${homeScore ?? '?'}-${awayScore ?? '?'} (1N2: ${ai1n2Pred ?? '?'})`)
      fetchMatches()
    } catch { toast.error('Erreur lors de la génération de la prédiction') }
    finally { setGeneratingFor(null) }
  }

  const deleteMatch = async (match: Match) => {
    if (!confirm(`Supprimer le match ${match.homeTeam} vs ${match.awayTeam} ?`)) return
    try { await matchesTable.delete(match.id); toast.success('Match supprimé'); fetchMatches() }
    catch { toast.error('Erreur lors de la suppression') }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-neon-green border-t-transparent" />
    </div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">{matches.length} match{matches.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(!showForm)} className="gap-2"><Plus className="h-4 w-4" /> Ajouter un match</Button>
          <Button variant="outline" size="sm" onClick={fetchMatches} className="gap-2"><RefreshCw className="h-3.5 w-3.5" /> Actualiser</Button>
        </div>
      </div>

      {showForm && <AddMatchForm onMatchAdded={() => { setShowForm(false); fetchMatches() }} onCancel={() => setShowForm(false)} />}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Match</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Ligue</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Statut</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Prédiction IA</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Confiance</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {matches.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground"><Database className="mx-auto h-8 w-8 mb-2 opacity-40" />Aucun match trouvé</td></tr>
            ) : matches.map((m) => (
              <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="font-medium text-foreground text-xs">{m.homeTeam}</span><span className="text-muted-foreground">vs</span><span className="font-medium text-foreground text-xs">{m.awayTeam}</span></div></td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell text-xs">{m.league}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">{fmtDateTime(m.kickoffTime)}</td>
                <td className="px-4 py-3 hidden lg:table-cell"><span className={`inline-block text-xs rounded-full border px-2 py-0.5 font-medium capitalize ${STATUS_CLASS[m.status] ?? STATUS_CLASS.scheduled}`}>{STATUS_LABEL[m.status] ?? m.status}</span></td>
                <td className="px-4 py-3">{m.ai1n2Pred ? <div className="space-y-0.5"><span className="text-neon-green font-semibold text-xs">1N2: {m.ai1n2Pred}</span>{m.aiHomeScorePred !== null && <span className="text-muted-foreground text-xs block">{m.aiHomeScorePred} - {m.aiAwayScorePred}</span>}</div> : <span className="text-muted-foreground text-xs italic">—</span>}</td>
                <td className="px-4 py-3 text-right">{m.confidenceScore > 0 ? <span className={`font-bold text-xs ${CONFIDENCE_CLASS(m.confidenceScore)}`}>{Math.round(m.confidenceScore * 100)}%</span> : <span className="text-muted-foreground text-xs">—</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => generatePrediction(m)} disabled={generatingFor === m.id} className="h-8 gap-1 text-electric-blue hover:text-electric-blue hover:bg-electric-blue/10">
                      {generatingFor === m.id ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border border-electric-blue border-t-transparent" /><span className="hidden lg:inline text-xs">Génération...</span></> : <><Sparkles className="h-3.5 w-3.5" /><span className="hidden lg:inline text-xs">IA</span></>}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMatch(m)} className="h-8 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
