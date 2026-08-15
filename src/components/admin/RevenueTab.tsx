import { useState, useEffect, useCallback } from 'react'
import { blink } from '@/blink/client'
import type { Subscription } from '@/types'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { DollarSign, RefreshCw, CheckCircle, Database, TrendingUp } from 'lucide-react'

const subsTable = blink.db.table<Subscription>('subscriptions')

function fmtDate(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtCurrency(amount: number, currency?: string): string {
  const sym = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency === 'XOF' ? 'FCFA' : ''
  return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${sym}`.trim()
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-neon-green/15 text-neon-green border-neon-green/30',
  cancelled: 'bg-muted/50 text-muted-foreground border-border',
  expired: 'bg-destructive/15 text-destructive border-destructive/30',
}

export function RevenueTab() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSubs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await subsTable.list()
      // Auto-attribute Club Pro subscriptions to usr_xtOfy59SX5la
      for (const s of data) {
        if (s.amount >= 100 && s.userId !== 'usr_xtOfy59SX5la') {
          await subsTable.update(s.id, { userId: 'usr_xtOfy59SX5la' }).catch(() => {})
          s.userId = 'usr_xtOfy59SX5la'
        }
      }
      setSubs([...data])
    } catch {
      toast.error('Erreur lors du chargement des abonnements')
      setSubs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSubs() }, [fetchSubs])

  const totalRevenue = subs.reduce((sum, s) => sum + (s.amount || 0), 0)
  const activeSubs = subs.filter(s => s.status === 'active')
  const avgAmount = subs.length > 0 ? totalRevenue / subs.length : 0
  const currency = subs[0]?.currency

  const summaryCards = [
    { label: 'Revenu total', value: fmtCurrency(totalRevenue, currency), icon: <DollarSign className="h-5 w-5" />, className: 'border-neon-green/30 bg-neon-green/5' },
    { label: 'Abonnements actifs', value: activeSubs.length.toString(), icon: <CheckCircle className="h-5 w-5" />, className: 'border-premium-gold/30 bg-premium-gold/5' },
    { label: 'Total abonnements', value: subs.length.toString(), icon: <Database className="h-5 w-5" />, className: 'border-electric-blue/30 bg-electric-blue/5' },
    { label: 'Montant moyen', value: fmtCurrency(avgAmount, currency), icon: <TrendingUp className="h-5 w-5" />, className: 'border-border bg-muted/20' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-neon-green border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-xl border p-4 ${card.className}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</span>
              <span className="text-muted-foreground">{card.icon}</span>
            </div>
            <div className="text-2xl font-display font-bold text-foreground">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{subs.length} abonnement{subs.length !== 1 ? 's' : ''}</p>
        <Button variant="outline" size="sm" onClick={fetchSubs} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Actualiser
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Utilisateur</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Plan</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Montant</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Statut</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Dates</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  <DollarSign className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  Aucun abonnement trouvé
                </td>
              </tr>
            ) : (
              subs.map((s) => (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground text-xs">{s.userId}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground capitalize">{s.plan}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-foreground">
                    {fmtCurrency(s.amount, s.currency)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-block text-xs rounded-full border px-2 py-0.5 font-medium capitalize ${STATUS_BADGE[s.status] ?? STATUS_BADGE.expired}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                    <div>{fmtDate(s.startsAt)} → {fmtDate(s.expiresAt)}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
