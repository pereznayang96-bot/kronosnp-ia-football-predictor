import { createFileRoute, Link } from '@tanstack/react-router'
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary'
import { useState, useEffect, useMemo } from 'react'
import { blink } from '@/blink/client'
import type { AIPerformanceLog, Match } from '@/types'
import {
  Sparkles, Target, CheckCircle2, XCircle,
  TrendingUp, Brain, Percent, Hash, ArrowLeft,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'

const perfTable = blink.db.table<AIPerformanceLog>('ai_performance_logs')
const matchesTable = blink.db.table<Match>('matches')

export const Route = createFileRoute('/bilan')({
  head: () => ({
    meta: [{ title: 'Bilan IA · KronosNP' }],
  }),
  component: BilanPage,
})

function BilanPage() {
  return (
    <BlinkClientBoundary
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
        </div>
      }
    >
      <BilanContent />
    </BlinkClientBoundary>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */

interface LeagueStat {
  league: string
  total: number
  correct: number
  rate: number
}

interface CumulativePoint {
  index: number
  rate: number
  label: string
}

function BilanContent() {
  const [logs, setLogs] = useState<AIPerformanceLog[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      perfTable.list({ orderBy: { createdAt: 'desc' }, limit: 500 }),
      matchesTable.list(),
    ])
      .then(([fetchedLogs, fetchedMatches]) => {
        setLogs(fetchedLogs)
        setMatches(fetchedMatches)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  /* ---- Global KPI ------------------------------------------------------ */
  const total = logs.length
  const outcomeCorrectCount = logs.filter(l => l.outcomeCorrect === '1').length
  const scoreCorrectCount = logs.filter(l => l.scoreCorrect === '1').length
  const avgConfidence = total > 0
    ? logs.reduce((sum, l) => sum + (l.confidenceScore ?? 0), 0) / total
    : 0

  const outcomeRate = total > 0 ? Math.round((outcomeCorrectCount / total) * 100) : 0
  const scoreRate = total > 0 ? Math.round((scoreCorrectCount / total) * 100) : 0

  /* ---- Bar chart: success rate by league -------------------------------- */
  const leagueStats = useMemo<LeagueStat[]>(() => {
    const map = new Map<string, { total: number; correct: number }>()
    logs.forEach(l => {
      const league = l.league || 'Inconnu'
      const entry = map.get(league) ?? { total: 0, correct: 0 }
      entry.total++
      if (l.outcomeCorrect === '1') entry.correct++
      map.set(league, entry)
    })
    return Array.from(map.entries())
      .map(([league, { total, correct }]) => ({
        league,
        total,
        correct,
        rate: total > 0 ? Math.round((correct / total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
  }, [logs])

  /* ---- Cumulative line: last 50 matches --------------------------------- */
  const cumulativeData = useMemo<CumulativePoint[]>(() => {
    const subset = [...logs]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-50)

    let cumCorrect = 0
    return subset.map((l, i) => {
      if (l.outcomeCorrect === '1') cumCorrect++
      return {
        index: i + 1,
        rate: Math.round((cumCorrect / (i + 1)) * 100),
        label: `M${i + 1}`,
      }
    })
  }, [logs])

  /* ---- Match lookup ---------------------------------------------------- */
  const matchMap = useMemo(() => {
    const m = new Map<string, Match>()
    matches.forEach(match => m.set(match.id, match))
    return m
  }, [matches])

  /* ---- Recent 20 rows --------------------------------------------------- */
  const recentLogs = useMemo(() => logs.slice(0, 20), [logs])

  /* ---- Loading state ---------------------------------------------------- */
  if (loading) {
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
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neon-green/30 bg-neon-green/10 text-sm font-semibold text-neon-green hover:bg-neon-green/20 hover:border-neon-green/50 transition-all shadow-sm"
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
          <span className="text-xs font-semibold text-muted-foreground">Bilan IA</span>
        </div>
      </header>

      {/* Header section */}
      <section className="border-b border-border/30">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-green/10 border border-neon-green/20">
              <Sparkles className="h-5 w-5 text-neon-green" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Bilan de l'IA
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Statistiques de performance réelles et transparentes de KronosNP IA.
            Tous les résultats sont vérifiables — nous publions 100% de nos prédictions passées.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 space-y-12">

        {/* ═══════ KPI Cards ═══════ */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={<Target className="h-5 w-5" />}
            label="Taux de réussite 1N2"
            value={`${outcomeRate}%`}
            detail={`${outcomeCorrectCount} / ${total} matchs`}
            color="neon-green"
          />
          <KpiCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Scores exacts"
            value={`${scoreRate}%`}
            detail={`${scoreCorrectCount} / ${total} matchs`}
            color="electric-blue"
          />
          <KpiCard
            icon={<Hash className="h-5 w-5" />}
            label="Matchs analysés"
            value={String(total)}
            detail="depuis le lancement"
            color="premium-gold"
          />
          <KpiCard
            icon={<Brain className="h-5 w-5" />}
            label="Confiance moyenne"
            value={`${Math.round(avgConfidence * 100)}%`}
            detail="indice IA moyen"
            color="neon-green"
          />
        </div>

        {/* ═══════ Charts ═══════ */}
        {logs.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Bar chart — per league */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h2 className="font-display text-lg font-semibold text-foreground mb-1">
                Réussite par championnat
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Taux de réussite 1N2 groupé par ligue
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={leagueStats} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.025 250 / 0.5)" />
                  <XAxis
                    dataKey="league"
                    tick={{ fill: 'oklch(0.6 0.02 250)', fontSize: 11 }}
                    axisLine={{ stroke: 'oklch(0.28 0.025 250)' }}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: 'oklch(0.6 0.02 250)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'oklch(0.19 0.025 250)',
                      border: '1px solid oklch(0.28 0.025 250)',
                      borderRadius: '0.625rem',
                      fontSize: '0.8125rem',
                      color: 'oklch(0.92 0.005 250)',
                    }}
                    formatter={(_v: number, _name: string, props: { payload?: LeagueStat }) => [
                      props?.payload ? `${props.payload.rate}%` : '',
                      'Réussite',
                    ]}
                    labelFormatter={(label: string) => `Championnat: ${label}`}
                  />
                  <Bar
                    dataKey="rate"
                    fill="var(--color-chart-1)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line chart — cumulative */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h2 className="font-display text-lg font-semibold text-foreground mb-1">
                Évolution du taux de réussite
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Taux cumulé 1N2 sur les 50 derniers matchs
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={cumulativeData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.025 250 / 0.5)" />
                  <XAxis
                    dataKey="index"
                    tick={{ fill: 'oklch(0.6 0.02 250)', fontSize: 11 }}
                    axisLine={{ stroke: 'oklch(0.28 0.025 250)' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: 'oklch(0.6 0.02 250)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'oklch(0.19 0.025 250)',
                      border: '1px solid oklch(0.28 0.025 250)',
                      borderRadius: '0.625rem',
                      fontSize: '0.8125rem',
                      color: 'oklch(0.92 0.005 250)',
                    }}
                    formatter={(_v: number) => {
                      // returned by the labelFormatter override below
                      return undefined
                    }}
                    labelFormatter={(_label: string, payload: readonly { payload?: CumulativePoint }[]) => {
                      const p = payload?.[0]?.payload;
                      if (p) return `Match ${p.index} · ${p.rate}%`
                      return ''
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="var(--color-chart-2)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: 'var(--color-chart-2)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
            <TrendingUp className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Aucune donnée de performance disponible pour le moment.
            </p>
          </div>
        )}

        {/* ═══════ Recent Performance Table ═══════ */}
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Dernières prédictions
          </h2>
          {recentLogs.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-card p-10 text-center">
              <p className="text-muted-foreground">Aucun résultat enregistré.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Match
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Score Réel
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Score Prédit IA
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      1N2
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Score Exact
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {recentLogs.map(log => {
                    const match = matchMap.get(log.matchId)
                    const dateStr = log.createdAt
                      ? new Date(log.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                        })
                      : '—'

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground font-mono text-xs">
                          {dateStr}
                        </td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <span className="text-foreground font-medium truncate block">
                            {match
                              ? `${match.homeTeam} vs ${match.awayTeam}`
                              : 'Match inconnu'}
                          </span>
                          {log.league && (
                            <span className="text-xs text-muted-foreground">
                              {log.league}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-mono font-semibold text-foreground">
                            {log.actualHomeScore ?? '—'} - {log.actualAwayScore ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-mono text-muted-foreground">
                            {log.predictedHomeScore ?? '—'} - {log.predictedAwayScore ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {log.outcomeCorrect === '1' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-neon-green/10 border border-neon-green/20 px-2.5 py-0.5 text-xs font-semibold text-neon-green">
                              <CheckCircle2 className="h-3 w-3" />
                              Oui
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/20 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                              <XCircle className="h-3 w-3" />
                              Non
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {log.scoreCorrect === '1' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-neon-green/10 border border-neon-green/20 px-2.5 py-0.5 text-xs font-semibold text-neon-green">
                              <CheckCircle2 className="h-3 w-3" />
                              Oui
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/20 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                              <XCircle className="h-3 w-3" />
                              Non
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="rounded-xl border border-border/30 bg-muted/30 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Toutes les prédictions sont enregistrées avant le coup d'envoi et ne peuvent être modifiées.
            Les résultats sont vérifiables publiquement. Dernière mise à jour :{' '}
            {logs.length > 0 && logs[0].createdAt
              ? new Date(logs[0].createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */

function KpiCard({
  icon,
  label,
  value,
  detail,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
  color: 'neon-green' | 'electric-blue' | 'premium-gold'
}) {
  const colorMap = {
    'neon-green': {
      icon: 'text-neon-green',
      bg: 'bg-neon-green/10',
      border: 'border-neon-green/20',
      value: 'text-neon-green',
    },
    'electric-blue': {
      icon: 'text-electric-blue',
      bg: 'bg-electric-blue/10',
      border: 'border-electric-blue/20',
      value: 'text-electric-blue',
    },
    'premium-gold': {
      icon: 'text-premium-gold',
      bg: 'bg-premium-gold/10',
      border: 'border-premium-gold/20',
      value: 'text-premium-gold',
    },
  } as const

  const c = colorMap[color]

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 hover:border-neon-green/20 transition-all group">
      <div className="flex items-center gap-3 mb-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.bg} border ${c.border} ${c.icon}`}>
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className={`font-display text-3xl font-bold ${c.value} mb-1`}>
        {value}
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}
