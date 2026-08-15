import { createFileRoute, Link } from '@tanstack/react-router'
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { blink } from '@/blink/client'
import type { Challenge, ChallengeEntry, Match } from '@/types'
import {
  Trophy, Clock, Gift, Send, Users, Star, Calendar,
  ChevronRight, Sparkles, LogIn, ArrowLeft, Check, Edit3,
} from 'lucide-react'
import { toast } from 'sonner'

const challengesTable = blink.db.table<Challenge>('challenges')
const entriesTable = blink.db.table<ChallengeEntry>('challenge_entries')
const matchesTable = blink.db.table<Match>('matches')

export const Route = createFileRoute('/defi')({
  head: () => ({
    meta: [{ title: 'Défi IA · KronosNP' }],
  }),
  component: DefiPage,
})

function DefiPage() {
  return (
    <BlinkClientBoundary
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
        </div>
      }
    >
      <DefiContent />
    </BlinkClientBoundary>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */

interface MatchPrediction {
  matchId: string
  homeScore: number | ''
  awayScore: number | ''
}

interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  score: number
  prizeTimeHours: number
  isCurrentUser: boolean
}

function DefiContent() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [challengeMatches, setChallengeMatches] = useState<Match[]>([])
  const [userEntry, setUserEntry] = useState<ChallengeEntry | null>(null)
  const [allEntries, setAllEntries] = useState<ChallengeEntry[]>([])
  const [pastChallenges, setPastChallenges] = useState<Challenge[]>([])
  const [pastEntries, setPastEntries] = useState<ChallengeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)

  /* ---- Predictions state ------------------------------------------------ */
  const [predictions, setPredictions] = useState<MatchPrediction[]>([])

  /* ---- Fetch active challenge + matches --------------------------------- */
  const fetchActiveChallenge = useCallback(async () => {
    try {
      const [activeChallenges, allMatches] = await Promise.all([
        challengesTable.list({
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          limit: 1,
        }),
        matchesTable.list(),
      ])

      const active = activeChallenges[0] ?? null
      setChallenge(active)

      if (active) {
        let matchIds: string[] = []
        try {
          matchIds = JSON.parse(active.matchIds)
        } catch {
          matchIds = []
        }

        const filtered = allMatches.filter(m => matchIds.includes(m.id))
        setChallengeMatches(filtered)

        // Init predictions
        setPredictions(
          filtered.map(m => ({ matchId: m.id, homeScore: '', awayScore: '' }))
        )
      }
    } catch {
      toast.error('Impossible de charger le défi')
    }
  }, [])

  /* ---- Fetch user entry ------------------------------------------------- */
  const fetchUserEntry = useCallback(async (challengeId: string, userId: string) => {
    try {
      const entries = await entriesTable.list({
        where: { userId, challengeId },
      })
      const entry = entries[0] ?? null
      setUserEntry(entry)

      if (entry) {
        let parsed: Record<string, { homeScore: number; awayScore: number }> = {}
        try {
          parsed = JSON.parse(entry.predictions)
        } catch { /* keep empty */ }

        setPredictions(prev =>
          prev.map(p => {
            const saved = parsed[p.matchId]
            return saved
              ? { ...p, homeScore: saved.homeScore, awayScore: saved.awayScore }
              : p
          })
        )
        setEditing(false)
      }
    } catch {
      // noop
    }
  }, [])

  /* ---- Fetch leaderboard ------------------------------------------------- */
  const fetchLeaderboard = useCallback(async (challengeId: string) => {
    try {
      const entries = await entriesTable.list({ where: { challengeId } })
      setAllEntries(entries)
    } catch {
      setAllEntries([])
    }
  }, [])

  /* ---- Fetch past challenges -------------------------------------------- */
  const fetchPastChallenges = useCallback(async (userId?: string) => {
    try {
      const past = await challengesTable.list({
        where: { status: 'closed' },
        orderBy: { createdAt: 'desc' },
        limit: 10,
      })
      setPastChallenges(past)

      if (userId && past.length > 0) {
        const pastIds = past.map(c => c.id)
        // Fetch entries for all past challenges for this user
        const allUserEntries = await entriesTable.list({
          where: { userId },
        })
        setPastEntries(allUserEntries.filter(e => pastIds.includes(e.challengeId)))
      }
    } catch {
      // noop
    }
  }, [])

  /* ---- Bootstrap -------------------------------------------------------- */
  useEffect(() => {
    fetchActiveChallenge().finally(() => setLoading(false))
    fetchPastChallenges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (challenge && user?.id) {
      fetchUserEntry(challenge.id, user.id)
      fetchLeaderboard(challenge.id)
    }
  }, [challenge, user?.id, fetchUserEntry, fetchLeaderboard])

  useEffect(() => {
    if (user?.id) {
      fetchPastChallenges(user.id)
    }
  }, [user?.id, fetchPastChallenges])

  /* ---- Handlers --------------------------------------------------------- */
  const updatePrediction = (
    matchId: string,
    field: 'homeScore' | 'awayScore',
    raw: string,
  ) => {
    const num = raw === '' ? '' : Math.max(0, Math.min(99, parseInt(raw, 10) || 0))
    setPredictions(prev =>
      prev.map(p => (p.matchId === matchId ? { ...p, [field]: num } : p))
    )
  }

  const canSubmit = useMemo(() => {
    if (!isAuthenticated) return false
    if (!challenge) return false
    return predictions.every(
      p => p.homeScore !== '' && p.awayScore !== ''
    )
  }, [isAuthenticated, challenge, predictions])

  const handleSubmit = async () => {
    if (!canSubmit || !user || !challenge) return

    setSubmitting(true)
    try {
      const predObj: Record<string, { homeScore: number; awayScore: number }> = {}
      predictions.forEach(p => {
        if (p.homeScore !== '' && p.awayScore !== '') {
          predObj[p.matchId] = {
            homeScore: Number(p.homeScore),
            awayScore: Number(p.awayScore),
          }
        }
      })

      const payload = {
        challengeId: challenge.id,
        userId: user.id,
        predictions: JSON.stringify(predObj),
        score: 0,
        prizeTimeHours: 0,
      }

      if (userEntry) {
        await entriesTable.update(userEntry.id, payload)
        toast.success('Pronostics mis à jour !')
      } else {
        await entriesTable.create(payload)
        toast.success('Pronostics soumis ! Bonne chance !')
      }

      setEditing(false)
      await fetchUserEntry(challenge.id, user.id)
      await fetchLeaderboard(challenge.id)
    } catch {
      toast.error('Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogin = () => {
    blink.auth.login()
  }

  /* ---- Derived state ---------------------------------------------------- */
  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    const sorted = [...allEntries].sort((a, b) => b.score - a.score)
    return sorted.map((e, i) => ({
      rank: i + 1,
      userId: e.userId,
      userName: e.userId === user?.id ? 'Vous' : e.userId.slice(0, 8) + '…',
      score: e.score,
      prizeTimeHours: e.prizeTimeHours,
      isCurrentUser: e.userId === user?.id,
    }))
  }, [allEntries, user?.id])

  const challengeWeekLabel = useMemo(() => {
    if (!challenge) return ''
    const start = challenge.weekStart
      ? new Date(challenge.weekStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      : '?'
    const end = challenge.weekEnd
      ? new Date(challenge.weekEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
      : '?'
    return `${start} → ${end}`
  }, [challenge])

  /* ---- Loading ---------------------------------------------------------- */
  if (authLoading || loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-premium-gold/30 bg-premium-gold/10 text-sm font-semibold text-premium-gold hover:bg-premium-gold/20 hover:border-premium-gold/50 transition-all shadow-sm"
              title="Retour au Tableau de Bord"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Link>
            <div className="h-4 w-px bg-border/60 hidden sm:block" />
            <Link to="/home" className="hidden sm:flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-neon-green/20 border border-neon-green/40 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-neon-green" />
              </div>
              <span className="font-display font-bold text-foreground">Kronos<span className="text-neon-green">NP</span></span>
            </Link>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">Défi IA</span>
        </div>
      </header>

      {/* Header section */}
      <section className="border-b border-border/30">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-premium-gold/10 border border-premium-gold/20">
              <Trophy className="h-5 w-5 text-premium-gold" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Défi IA
            </h1>
          </div>
          <p className="text-muted-foreground max-w-xl">
            Devinez les scores exacts et gagnez du temps Premium gratuit ! Chaque semaine,
            un nouveau défi vous attend. Les meilleurs pronostiqueurs remportent des heures de Premium.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">

        {/* ═══════ Unauthenticated CTA ═══════ */}
        {!isAuthenticated && (
          <div className="rounded-2xl border border-premium-gold/20 bg-gradient-to-b from-premium-gold/5 to-transparent p-10 text-center">
            <Trophy className="mx-auto h-12 w-12 text-premium-gold mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Participez au Défi IA
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Connectez-vous pour soumettre vos pronostics et tenter de gagner du temps Premium gratuit chaque semaine.
            </p>
            <button
              onClick={handleLogin}
              className="inline-flex items-center gap-2 rounded-lg bg-neon-green px-6 py-3 font-semibold text-background hover:shadow-glow-neon transition-all"
            >
              <LogIn className="h-4 w-4" />
              Se connecter pour participer
            </button>
          </div>
        )}

        {/* ═══════ No Active Challenge ═══════ */}
        {isAuthenticated && !challenge && (
          <div className="rounded-xl border border-border/50 bg-card p-10 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground text-lg mb-1">
              Aucun défi actif
            </h3>
            <p className="text-muted-foreground">
              Revenez bientôt pour le prochain défi hebdomadaire !
            </p>
          </div>
        )}

        {/* ═══════ Active Challenge Card ═══════ */}
        {isAuthenticated && challenge && (
          <div className="rounded-xl border border-premium-gold/20 bg-card overflow-hidden">
            <div className="bg-premium-gold/5 border-b border-premium-gold/10 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-premium-gold/20">
                  <Trophy className="h-4 w-4 text-premium-gold" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-foreground text-lg">
                    Défi de la semaine
                  </h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {challengeWeekLabel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-premium-gold/10 border border-premium-gold/20 px-3 py-1 text-xs font-semibold text-premium-gold">
                  <Gift className="h-3.5 w-3.5" />
                  Prix: temps Premium gratuit
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Prize info row */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4 text-premium-gold" />
                  <span>1er: <strong className="text-foreground">24h Premium</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4 text-electric-blue" />
                  <span>2ème: <strong className="text-foreground">12h Premium</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span>3ème: <strong className="text-foreground">6h Premium</strong></span>
                </div>
              </div>

              {/* Submitted banner */}
              {userEntry && !editing && (
                <div className="mb-5 flex items-center justify-between rounded-lg bg-neon-green/5 border border-neon-green/20 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-neon-green" />
                    <span className="text-sm text-foreground font-medium">
                      Vos pronostics ont été enregistrés
                    </span>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1.5 text-sm text-electric-blue hover:text-neon-green transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                </div>
              )}

              {/* Match list with prediction inputs */}
              <div className="space-y-4">
                <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {challengeMatches.length} match{challengeMatches.length > 1 ? 's' : ''} à pronostiquer
                </h3>

                {challengeMatches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Les matchs de ce défi ne sont pas encore disponibles.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {challengeMatches.map(match => {
                      const pred = predictions.find(p => p.matchId === match.id)
                      const isSubmitted = userEntry && !editing

                      return (
                        <div
                          key={match.id}
                          className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-4 flex-wrap"
                        >
                          {/* Match info */}
                          <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-muted-foreground">{match.league}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-foreground text-sm">
                                {match.homeTeam}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">vs</span>
                              <span className="font-semibold text-foreground text-sm">
                                {match.awayTeam}
                              </span>
                            </div>
                            {match.kickoffTime && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {new Date(match.kickoffTime).toLocaleDateString('fr-FR', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            )}
                          </div>

                          {/* Score inputs */}
                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="number"
                              min={0}
                              max={99}
                              placeholder="?"
                              disabled={!!isSubmitted}
                              value={pred?.homeScore ?? ''}
                              onChange={e => updatePrediction(match.id, 'homeScore', e.target.value)}
                              className="w-14 h-10 rounded-lg border border-border bg-input/30 text-center font-mono text-lg font-bold text-foreground placeholder:text-muted-foreground/40 focus:border-neon-green focus:ring-1 focus:ring-neon-green/30 outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-muted-foreground font-mono text-sm">-</span>
                            <input
                              type="number"
                              min={0}
                              max={99}
                              placeholder="?"
                              disabled={!!isSubmitted}
                              value={pred?.awayScore ?? ''}
                              onChange={e => updatePrediction(match.id, 'awayScore', e.target.value)}
                              className="w-14 h-10 rounded-lg border border-border bg-input/30 text-center font-mono text-lg font-bold text-foreground placeholder:text-muted-foreground/40 focus:border-neon-green focus:ring-1 focus:ring-neon-green/30 outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Submit button */}
              {(!userEntry || editing) && (
                <div className="mt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-neon-green px-6 py-3 font-semibold text-background hover:shadow-glow-neon transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
                        Envoi…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {userEntry ? 'Mettre à jour mes pronostics' : 'Soumettre mes pronostics'}
                      </>
                    )}
                  </button>
                  {editing && (
                    <button
                      onClick={() => setEditing(false)}
                      className="ml-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Annuler
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════ Leaderboard ═══════ */}
        {isAuthenticated && challenge && leaderboard.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-electric-blue" />
              Classement
            </h2>
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 px-5 py-3 border-b border-border/30 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span className="w-8 text-center">#</span>
                <span>Joueur</span>
                <span className="text-right w-16">Score</span>
                <span className="text-right w-20">Gain</span>
              </div>
              <div className="divide-y divide-border/20">
                {leaderboard.slice(0, 20).map(entry => (
                  <div
                    key={entry.userId}
                    className={`grid grid-cols-[auto_1fr_auto_auto] gap-3 px-5 py-3 items-center text-sm transition-colors ${
                      entry.isCurrentUser
                        ? 'bg-neon-green/5 border-l-2 border-l-neon-green'
                        : 'hover:bg-muted/20'
                    }`}
                  >
                    {/* Rank */}
                    <span className="w-8 text-center">
                      {entry.rank <= 3 ? (
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            entry.rank === 1
                              ? 'bg-premium-gold/20 text-premium-gold'
                              : entry.rank === 2
                                ? 'bg-electric-blue/20 text-electric-blue'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {entry.rank}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{entry.rank}</span>
                      )}
                    </span>

                    {/* Name */}
                    <span className={`font-medium truncate ${
                      entry.isCurrentUser ? 'text-neon-green' : 'text-foreground'
                    }`}>
                      {entry.userName}
                    </span>

                    {/* Score */}
                    <span className="text-right w-16 font-mono font-semibold text-foreground">
                      {entry.score}
                    </span>

                    {/* Prize */}
                    <span className="text-right w-20 text-premium-gold font-medium text-xs">
                      {entry.prizeTimeHours > 0 ? `+${entry.prizeTimeHours}h` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ History ═══════ */}
        {isAuthenticated && pastChallenges.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Défis précédents
            </h2>
            <div className="space-y-3">
              {pastChallenges.map(pc => {
                const entry = pastEntries.find(e => e.challengeId === pc.id)
                const weekLabel = pc.weekStart
                  ? new Date(pc.weekStart).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'

                return (
                  <div
                    key={pc.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-5 py-4 hover:border-neon-green/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Défi du {weekLabel}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pc.status === 'closed' ? 'Terminé' : pc.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {entry ? (
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">
                            Score: {entry.score}
                          </p>
                          {entry.prizeTimeHours > 0 && (
                            <p className="text-xs text-premium-gold font-medium">
                              +{entry.prizeTimeHours}h Premium
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Non participé
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="rounded-xl border border-border/30 bg-muted/30 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Les pronostics doivent être soumis avant le coup d'envoi du premier match du défi.
            Une fois le défi clôturé, les scores sont calculés automatiquement et les gagnants
            reçoivent leur temps Premium.
          </p>
        </div>
      </div>
    </div>
  )
}
