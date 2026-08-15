import { useState } from 'react'
import { blink } from '@/blink/client'
import type { Match } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

const matchesTable = blink.db.table<Match>('matches')

interface AddMatchFormProps {
  onMatchAdded: () => void
  onCancel: () => void
}

export function AddMatchForm({ onMatchAdded, onCancel }: AddMatchFormProps) {
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [league, setLeague] = useState('')
  const [kickoffTime, setKickoffTime] = useState('')

  const addMatch = async () => {
    if (!homeTeam.trim() || !awayTeam.trim() || !league.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    try {
      await matchesTable.create({
        homeTeam: homeTeam.trim(),
        awayTeam: awayTeam.trim(),
        league: league.trim(),
        leagueCountry: '',
        kickoffTime: kickoffTime || new Date().toISOString(),
        status: 'scheduled',
        homeScore: null, awayScore: null,
        aiHomeScorePred: null, aiAwayScorePred: null, ai1n2Pred: null,
        confidenceScore: 0,
        oddsHome: null, oddsDraw: null, oddsAway: null,
        valueBet: null, mediaSources: '', liveMinute: null,
      })
      toast.success('Match ajouté')
      onMatchAdded()
    } catch {
      toast.error("Erreur lors de l'ajout du match")
    }
  }

  return (
    <Card className="border-neon-green/30">
      <CardHeader>
        <CardTitle className="text-base font-display">Nouveau match</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="home">Équipe domicile *</Label>
            <Input id="home" value={homeTeam} onChange={e => setHomeTeam(e.target.value)} placeholder="PSG" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="away">Équipe extérieure *</Label>
            <Input id="away" value={awayTeam} onChange={e => setAwayTeam(e.target.value)} placeholder="Marseille" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="league">Ligue *</Label>
            <Input id="league" value={league} onChange={e => setLeague(e.target.value)} placeholder="Ligue 1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kickoff">Date & Heure</Label>
            <Input id="kickoff" type="datetime-local" value={kickoffTime} onChange={e => setKickoffTime(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <Button variant="outline" onClick={onCancel}>Annuler</Button>
          <Button onClick={addMatch} className="gap-2"><Plus className="h-4 w-4" /> Créer le match</Button>
        </div>
      </CardContent>
    </Card>
  )
}
