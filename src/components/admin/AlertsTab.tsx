import { useState, useEffect, useCallback } from 'react'
import { blink } from '@/blink/client'
import type { AdminAlert, AlertSeverity } from '@/types'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Bell, RefreshCw, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react'

const alertsTable = blink.db.table<AdminAlert>('admin_alerts')

const SEVERITY_BADGE: Record<AlertSeverity, { icon: React.ReactNode; className: string }> = {
  info: { icon: <Info className="h-3.5 w-3.5" />, className: 'bg-muted/50 text-muted-foreground border-border' },
  warning: { icon: <AlertTriangle className="h-3.5 w-3.5" />, className: 'bg-premium-gold/15 text-premium-gold border-premium-gold/30' },
  critical: { icon: <XCircle className="h-3.5 w-3.5" />, className: 'bg-destructive/15 text-destructive border-destructive/30' },
}

function fmtDateTime(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function AlertsTab() {
  const [alerts, setAlerts] = useState<AdminAlert[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await alertsTable.list({ orderBy: { createdAt: 'desc' } })
      setAlerts(data)
    } catch {
      toast.error('Erreur lors du chargement des alertes')
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAlerts() }, [fetchAlerts])

  const generateTestAlert = async () => {
    try {
      await alertsTable.create({
        alertType: 'test',
        severity: 'info',
        message: 'Alerte test générée manuellement',
        acknowledged: '0',
        metadata: '',
      })
      toast.success('Alerte test créée')
      fetchAlerts()
    } catch {
      toast.error("Erreur lors de la création de l'alerte")
    }
  }

  const acknowledgeAlert = async (alert: AdminAlert) => {
    try {
      await alertsTable.update(alert.id, { acknowledged: '1' })
      toast.success('Alerte acquittée')
      fetchAlerts()
    } catch {
      toast.error("Erreur lors de l'acquittement")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-neon-green border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {alerts.length} alerte{alerts.length !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={generateTestAlert} className="gap-2">
            <Bell className="h-3.5 w-3.5" /> Générer une alerte de test
          </Button>
          <Button variant="outline" size="sm" onClick={fetchAlerts} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Actualiser
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-xl border border-border py-12 text-center text-muted-foreground">
            <Bell className="mx-auto h-8 w-8 mb-2 opacity-40" />
            Aucune alerte
          </div>
        ) : (
          alerts.map((a) => {
            const sev = SEVERITY_BADGE[a.severity] ?? SEVERITY_BADGE.info
            return (
              <div
                key={a.id}
                className={`rounded-xl border p-4 transition-colors ${
                  a.acknowledged === '1'
                    ? 'bg-card border-border opacity-60'
                    : 'bg-card border-border hover:border-neon-green/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium shrink-0 ${sev.className}`}>
                      {sev.icon} {a.severity}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground break-words">{a.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {fmtDateTime(a.createdAt)}
                        {a.alertType !== 'test' && ` · ${a.alertType}`}
                        {a.acknowledged === '1' && (
                          <span className="ml-2 inline-flex items-center gap-1 text-neon-green">
                            <CheckCircle className="h-3 w-3" /> Acquittée
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {a.acknowledged !== '1' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => acknowledgeAlert(a)}
                      className="shrink-0 gap-1.5"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Acquitter
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
