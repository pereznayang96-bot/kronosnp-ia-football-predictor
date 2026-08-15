import { createFileRoute } from '@tanstack/react-router'
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { UsersTab } from '@/components/admin/UsersTab'
import { RevenueTab } from '@/components/admin/RevenueTab'
import { AITab } from '@/components/admin/AITab'
import { AlertsTab } from '@/components/admin/AlertsTab'
import { MatchesTab } from '@/components/admin/MatchesTab'
import {
  Users,
  DollarSign,
  Activity,
  Bell,
  Database,
  Shield,
  ArrowLeft,
} from 'lucide-react'

export const Route = createFileRoute('/admin')({
  ssr: false,
  head: () => ({ meta: [{ title: 'Admin · KronosNP IA' }] }),
  component: AdminDashboard,
})

// ── Tab config ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'users', label: 'Utilisateurs', icon: <Users className="h-4 w-4" /> },
  { id: 'revenue', label: 'Revenus', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'ai', label: "État de l'IA", icon: <Activity className="h-4 w-4" /> },
  { id: 'alerts', label: 'Alertes & Logs', icon: <Bell className="h-4 w-4" /> },
  { id: 'matches', label: 'Matches', icon: <Database className="h-4 w-4" /> },
] as const

type TabId = (typeof TABS)[number]['id']

// ── Sub-components ─────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
    </div>
  )
}

function AccessDenied() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <Card className="max-w-md w-full mx-4 border-destructive/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15">
            <Shield className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle className="font-display text-xl text-foreground">Accès refusé</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Vous n'avez pas les droits super_admin nécessaires pour accéder au tableau de bord d'administration.
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/'} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
        active
          ? 'bg-neon-green/15 text-neon-green border border-neon-green/30 shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

// ── Route component ───────────────────────────────────────────────────────
function AdminDashboard() {
  return (
    <BlinkClientBoundary fallback={<Spinner />}>
      <AdminContent />
    </BlinkClientBoundary>
  )
}

// ── Content (client-only) ──────────────────────────────────────────────────
function AdminContent() {
  const { isLoading, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('users')

  if (isLoading) return <Spinner />
  if (!isAdmin) return <AccessDenied />

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-premium-gold" />
            <span className="font-display text-lg font-bold text-foreground">
              KronosNP <span className="text-premium-gold">Admin</span>
            </span>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Retour au site
          </a>
        </div>
      </header>

      <div className="border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-1 py-3 overflow-x-auto">
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
                label={tab.label}
              />
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 animate-fade-in">
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'revenue' && <RevenueTab />}
        {activeTab === 'ai' && <AITab />}
        {activeTab === 'alerts' && <AlertsTab />}
        {activeTab === 'matches' && <MatchesTab />}
      </main>
    </div>
  )
}
