import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'oklch(0.17 0.02 250)',
    border: '1px solid oklch(0.28 0.025 250)',
    borderRadius: '0.5rem',
    color: 'oklch(0.92 0.005 250)',
    fontSize: '0.8rem',
  } as React.CSSProperties,
}

const BAR_COLORS = [
  'oklch(0.72 0.28 155)',
  'oklch(0.55 0.22 240)',
  'oklch(0.75 0.18 85)',
  'oklch(0.55 0.15 290)',
  'oklch(0.6 0.22 20)',
]

interface LeagueBarData { name: string; rate: number; full: string }
interface TrendPoint { index: number; rate: number }

export function LeagueSuccessBarChart({ data }: { data: LeagueBarData[] }) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">Aucune donnée</div>
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.025 250 / 0.3)" />
        <XAxis dataKey="name" tick={{ fill: 'oklch(0.6 0.02 250)', fontSize: 11 }} axisLine={{ stroke: 'oklch(0.28 0.025 250)' }} />
        <YAxis domain={[0, 100]} tick={{ fill: 'oklch(0.6 0.02 250)', fontSize: 11 }} axisLine={{ stroke: 'oklch(0.28 0.025 250)' }} />
        <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [`${value}%`, 'Réussite']} />
        <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (<Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TrendLineChart({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">Aucune donnée</div>
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.025 250 / 0.3)" />
        <XAxis dataKey="index" tick={{ fill: 'oklch(0.6 0.02 250)', fontSize: 11 }} axisLine={{ stroke: 'oklch(0.28 0.025 250)' }} />
        <YAxis domain={[0, 100]} tick={{ fill: 'oklch(0.6 0.02 250)', fontSize: 11 }} axisLine={{ stroke: 'oklch(0.28 0.025 250)' }} />
        <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [`${value}%`, 'Réussite cumulée']} />
        <Line type="monotone" dataKey="rate" stroke="oklch(0.72 0.28 155)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
