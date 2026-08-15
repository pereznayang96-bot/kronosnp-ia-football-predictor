import { useState, useEffect, useCallback } from 'react'
import { blink } from '@/blink/client'
import type { AIPerformanceLog } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import { LeagueSuccessBarChart, TrendLineChart } from '@/components/admin/AICharts'

const perfTable = blink.db.table<AIPerformanceLog>('ai_performance_logs')

export function AITab() {
  const [logs, setLogs] = useState<AIPerformanceLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try { setLogs(await perfTable.list({ orderBy: { createdAt: 'desc' }, limit: 200 })) }
    catch { toast.error('Erreur lors du chargement des logs IA'); setLogs([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const leagueStats = (() => {
    const map = new Map<string, { total: number; correct: number }>()
    for (const log of logs) {
      if (!log.league) continue
      const e = map.get(log.league) ?? { total: 0, correct: 0 }
      e.total++
      if (Number(log.outcomeCorrect) > 0) e.correct++
      map.set(log.league, e)
    }
    return Array.from(map.entries())
      .map(([league, s]) => ({ league, successRate: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0, total: s.total }))
      .sort((a, b) => b.successRate - a.successRate)
  })()

  const overallRate = logs.length > 0 ? Math.round((logs.filter(l => Number(l.outcomeCorrect) > 0).length / logs.length) * 100) : 0
  const scoreExactRate = logs.length > 0 ? Math.round((logs.filter(l => Number(l.scoreCorrect) > 0).length / logs.length) * 100) : 0

  const trendData = (() => {
    const recent = [...logs].slice(0, 30).reverse()
    const pts: { index: number; rate: number }[] = []
    for (let i = 1; i <= recent.length; i++) {
      const slice = recent.slice(0, i)
      pts.push({ index: i, rate: slice.length > 0 ? Math.round((slice.filter(l => Number(l.outcomeCorrect) > 0).length / slice.length) * 100) : 0 })
    }
    return pts
  })()

  const top5 = leagueStats.slice(0, 5)
  const criticalLeagues = leagueStats.filter(l => l.successRate < 50 && l.total >= 5)
  const leagueChartData = top5.map(l => ({ name: l.league.length > 12 ? l.league.slice(0, 12) + '…' : l.league, rate: l.successRate, full: l.league }))

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-6 w-6 border-2 border-neon-green border-t-transparent" /></div>
  }

  const kpiCards = [
    { label: 'Réussite 1N2', value: `${overallRate}%`, sub: `${logs.length} matchs analysés`, borderClass: 'border-neon-green/30 bg-neon-green/5', valueClass: 'text-neon-green' },
    { label: 'Scores Exactes', value: `${scoreExactRate}%`, sub: 'prédictions exactes', borderClass: 'border-premium-gold/30 bg-premium-gold/5', valueClass: 'text-premium-gold' },
    { label: 'Ligues actives', value: leagueStats.length.toString(), sub: "couvertes par l'IA", borderClass: 'border-electric-blue/30 bg-electric-blue/5', valueClass: 'text-electric-blue' },
  ]

  return (
    <div className="space-y-6">
      {criticalLeagues.length > 0 && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Alerte de performance</h3>
              <p className="text-sm text-foreground/80">Les ligues suivantes ont un taux de réussite inférieur à 50% :</p>
              <ul className="mt-2 space-y-1">
                {criticalLeagues.map(l => (<li key={l.league} className="text-sm text-destructive/90 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-destructive" />{l.league} — <strong>{l.successRate}%</strong> ({l.total} matchs)</li>))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {kpiCards.map(c => (
          <div key={c.label} className={`rounded-xl border p-4 ${c.borderClass}`}>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{c.label}</div>
            <div className={`text-3xl font-display font-bold ${c.valueClass}`}>{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base font-display">Taux de réussite par ligue (Top 5)</CardTitle></CardHeader><CardContent><LeagueSuccessBarChart data={leagueChartData} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base font-display">Tendance du taux de réussite</CardTitle></CardHeader><CardContent><TrendLineChart data={trendData} /></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-display">Top ligues par précision</CardTitle></CardHeader>
        <CardContent>
          {top5.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Aucune donnée disponible</p> : (
            <div className="space-y-2">
              {top5.map((l, i) => (
                <div key={l.league} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${i === 0 ? 'bg-premium-gold text-background' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
                    <span className="text-sm font-medium text-foreground">{l.league}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{l.total} matchs</span>
                    <span className={`text-sm font-bold ${l.successRate >= 70 ? 'text-neon-green' : l.successRate >= 50 ? 'text-premium-gold' : 'text-destructive'}`}>{l.successRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
