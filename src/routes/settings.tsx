import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { blink } from '@/blink/client';
import type { UserRole, UserRoleRecord } from '@/types';
import { OpenSourceAIToolsModal } from '@/components/OpenSourceAIToolsModal';
import { checkAIRateLimit, OPEN_SOURCE_TOOLS_BY_ROLE } from '@/lib/ai-role-tools-rate-limit';
import {
  Sparkles, User, Mail, Shield, Crown, Bell,
  LogOut, ArrowLeft, Save, CheckCircle2, Moon, Sun,
  Globe, Lock, Code, Cpu, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/settings')({
  head: () => ({
    meta: [
      { title: 'KronosNP IA — Paramètres & Profil' },
      { name: 'description', content: 'Gérez vos paramètres de compte, notifications et abonnements KronosNP IA.' },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <BlinkClientBoundary
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
        </div>
      }
    >
      <SettingsContent />
    </BlinkClientBoundary>
  );
}

function SettingsContent() {
  const { user, userRole, roleRecord, isPremium, isAuthenticated, isLoading, refreshRole, setDevRole } = useAuth();
  const navigate = useNavigate();

  const [notificationsEmail, setNotificationsEmail] = useState(true);
  const [notificationsMatches, setNotificationsMatches] = useState(true);
  const [favoriteLeague, setFavoriteLeague] = useState('Ligue 1');
  const [openSourceModalOpen, setOpenSourceModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
      </div>
    );
  }

  const handleLogout = async () => {
    await blink.auth.logout();
    toast.success('Déconnexion réussie');
    navigate({ to: '/' });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Paramètres sauvegardés avec succès !');
  };

  const handleRoleChange = async (newRole: UserRole) => {
    setDevRole(newRole);
    if (!user) {
      toast.success(`Rôle actif basculé sur : ${newRole.toUpperCase()}`);
      return;
    }
    try {
      const records = await blink.db.table<UserRoleRecord>('user_roles').list({ where: { userId: user.id }, limit: 1 });
      const expiresAt = (newRole === 'user_premium' || newRole === 'club_pro')
        ? new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
        : null;

      if (records.length > 0) {
        await blink.db.table<UserRoleRecord>('user_roles').update(records[0].id, {
          role: newRole,
          premiumExpiresAt: expiresAt,
          premiumPlan: newRole === 'user_premium' ? 'monthly' : null,
        });
      } else {
        await blink.db.table<UserRoleRecord>('user_roles').create({
          userId: user.id,
          role: newRole,
          premiumExpiresAt: expiresAt,
          premiumPlan: newRole === 'user_premium' ? 'monthly' : null,
        });
      }
      await refreshRole();
      toast.success(`Rôle mis à jour : ${newRole.toUpperCase()}`);
    } catch (e: any) {
      toast.error('Erreur lors du changement de rôle : ' + (e?.message || 'Inconnue'));
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/home" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link to="/home" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-neon-green/20 border border-neon-green/40 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-neon-green" />
              </div>
              <span className="font-display font-bold text-foreground">Kronos<span className="text-neon-green">NP</span></span>
            </Link>
          </div>
          <span className="text-sm font-semibold text-muted-foreground">Paramètres du compte</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Paramètres & Profil</h1>
          <p className="text-sm text-muted-foreground">Gérez vos informations personnelles, vos rôles et vos préférences</p>
        </div>

        {/* User Card Header */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-neon-green/15 border border-neon-green/30 flex items-center justify-center text-neon-green font-display font-bold text-xl">
              {user?.email ? user.email.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-foreground">{user?.email?.split('@')[0] || 'Membre'}</h2>
                {userRole === 'super_admin' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neon-green/15 text-neon-green border border-neon-green/30">
                    <Shield className="h-3 w-3" /> Super Admin
                  </span>
                ) : userRole === 'club_pro' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-electric-blue/15 text-electric-blue border border-electric-blue/30">
                    <Crown className="h-3 w-3" /> Club Pro
                  </span>
                ) : isPremium ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-premium-gold/15 text-premium-gold border border-premium-gold/30">
                    <Crown className="h-3 w-3" /> Utilisateur (Premium)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                    Utilisateur (Gratuit)
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-xs font-semibold text-destructive border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 px-4 py-2 rounded-xl transition-colors"
          >
            <LogOut className="h-4 w-4" /> Se déconnecter
          </button>
        </div>

        {/* Subscription Status & Role Switcher */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-neon-green" /> Rôle & Statut de l'abonnement
            </h3>
            {!isPremium && (
              <Link to="/pricing" className="text-xs font-bold text-background bg-premium-gold px-3.5 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                Passer Premium
              </Link>
            )}
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Rôle actif : <span className="text-neon-green font-mono uppercase font-extrabold">
                    {userRole === 'club_pro' ? 'CLUB_PRO' : userRole === 'super_admin' ? 'SUPER_ADMIN' : 'UTILISATEUR'}
                  </span>
                  {userRole === 'user_premium' && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-premium-gold/20 text-premium-gold border border-premium-gold/30">
                      Abonnement Premium
                    </span>
                  )}
                  {(!userRole || userRole === 'user_free') && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/40">
                      Compte Gratuit
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {userRole === 'super_admin' && 'Rôle Administrateur : accès complet à la console de gestion, matchs et logs.'}
                  {userRole === 'club_pro' && 'Rôle Club Pro : accès exclusif au Catalogue Mercato, Simulateur 360° et Moteur Cognitif.'}
                  {userRole === 'user_premium' && 'Rôle Utilisateur (Option Premium active) : accès aux Scores Exacts, Value Bets et Live-Adapt.'}
                  {(!userRole || userRole === 'user_free') && 'Rôle Utilisateur (Compte Gratuit) : accès aux pronostics 1N2 et au Défi IA hebdomadaire.'}
                </p>
              </div>
            </div>

            {/* Role Switcher Selector */}
            <div className="pt-3 border-t border-border/30 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Changer ou tester un rôle :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { role: 'user_free', label: 'Utilisateur (Gratuit)', color: 'border-border text-muted-foreground' },
                  { role: 'user_premium', label: 'Utilisateur (Premium)', color: 'border-premium-gold/40 text-premium-gold' },
                  { role: 'club_pro', label: 'Club Pro', color: 'border-electric-blue/40 text-electric-blue' },
                  { role: 'super_admin', label: 'Super Admin', color: 'border-neon-green/40 text-neon-green' },
                ].map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleRoleChange(r.role as UserRole)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center',
                      userRole === r.role
                        ? 'bg-muted/80 ring-2 ring-neon-green/60 font-extrabold shadow-sm'
                        : 'bg-muted/20 hover:bg-muted/50',
                      r.color
                    )}
                  >
                    {r.role === userRole && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ROLE-SPECIFIC DEDICATED SETTINGS & PRIVILEGES PANEL               */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {(!userRole || userRole === 'user_free') && (
          <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> Privilèges du Compte Gratuit
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Accès limité (1 requête IA par semaine). Passez au Club Pro pour un accès illimité.</p>
              </div>

              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 bg-electric-blue text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-electric-blue/90 shadow-md transition-all shrink-0"
              >
                <Crown className="h-4 w-4 text-yellow-300" /> S'abonner au Club Pro (100€/sem)
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-muted/20 border border-border/30 space-y-1">
                <p className="font-bold text-foreground flex items-center gap-1.5 text-neon-green">
                  <CheckCircle2 className="h-4 w-4" /> Pronostics 1N2
                </p>
                <p className="text-muted-foreground">Accès aux probabilités de victoires de base pour tous les championnats.</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/20 border border-border/30 space-y-1">
                <p className="font-bold text-foreground flex items-center gap-1.5 text-premium-gold">
                  <CheckCircle2 className="h-4 w-4" /> Défi IA Hebdomadaire
                </p>
                <p className="text-muted-foreground">Participation au concours de pronostics communautaire pour gagner des pass.</p>
              </div>
            </div>
          </div>
        )}

        {userRole === 'user_premium' && (
          <div className="rounded-2xl border border-premium-gold/30 bg-gradient-to-br from-premium-gold/10 via-card to-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <Crown className="h-4 w-4 text-premium-gold" /> Configuration Membre Premium
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-premium-gold/20 text-premium-gold border border-premium-gold/30">
                Abonnement Actif
              </span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-background/60 border border-premium-gold/20 space-y-1">
                <p className="font-bold text-foreground">🎯 Scores Exacts & Value Bets</p>
                <p className="text-muted-foreground">Déblocage des cotes à valeur et scores prédictifs.</p>
              </div>
              <div className="p-3 rounded-xl bg-background/60 border border-premium-gold/20 space-y-1">
                <p className="font-bold text-foreground">⚡ Live-Adapt & What-If</p>
                <p className="text-muted-foreground">Simulateur de matchs et alertes en direct.</p>
              </div>
              <div className="p-3 rounded-xl bg-background/60 border border-premium-gold/20 space-y-1">
                <p className="font-bold text-foreground">🏆 Défi IA Boosté</p>
                <p className="text-muted-foreground">Multiplicateur de points pour le classement général.</p>
              </div>
            </div>
          </div>
        )}

        {userRole === 'club_pro' && (
          <div className="rounded-2xl border border-electric-blue/40 bg-gradient-to-br from-electric-blue/15 via-card to-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <Crown className="h-4 w-4 text-electric-blue" /> Profil & Paramètres Club Professionnel
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/30">
                Rôle Club Pro
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-background/70 border border-electric-blue/30 space-y-1">
                <p className="font-bold text-electric-blue">🛍️ Catalogue Mercato</p>
                <p className="text-muted-foreground">Base exhaustive de joueurs et entraîneurs.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-background/70 border border-electric-blue/30 space-y-1">
                <p className="font-bold text-electric-blue">🧮 Simulateur 360°</p>
                <p className="text-muted-foreground">Impact sur masse salariale, xG & maillots.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-background/70 border border-electric-blue/30 space-y-1">
                <p className="font-bold text-electric-blue">🧠 Moteur Cognitif 6-Piliers</p>
                <p className="text-muted-foreground">Analyse, Réflexion, Déduction, Efficacité.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-background/70 border border-electric-blue/30 space-y-1">
                <p className="font-bold text-electric-blue">🌍 Hub Foot Mondial</p>
                <p className="text-muted-foreground">Annuaire mondial des médias & cotes.</p>
              </div>
            </div>
          </div>
        )}

        {userRole === 'super_admin' && (
          <div className="rounded-2xl border border-neon-green/40 bg-gradient-to-br from-neon-green/15 via-card to-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-neon-green" /> Console Administrateur Système
              </h3>
              <Link
                to="/admin"
                className="text-xs font-bold text-background bg-neon-green px-3.5 py-1.5 rounded-lg hover:shadow-glow-neon transition-all"
              >
                Ouvrir la Console Admin →
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Vous possédez un accès illimité. Vous pouvez gérer les matchs, modifier les rôles des utilisateurs, paramétrer l'algorithme de prédiction et consulter les logs.
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* OPEN SOURCE AI TOOLS & RATE LIMIT PANEL                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-neon-green/30 bg-card p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-neon-green/15 border border-neon-green/30 text-neon-green">
                <Code className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Écosystème IA Open Source & Débit Rôle
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Consultez les algorithmes open source et la politique de Rate Limit (1 req/semaine Gratuit, Illimité Premium, Trial Club Pro).
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpenSourceModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-neon-green text-background font-bold text-xs px-4 py-2.5 rounded-xl hover:shadow-glow-neon transition-all cursor-pointer shrink-0"
            >
              <Cpu className="h-4 w-4" /> Explorer les Outils Open Source
            </button>
          </div>
        </div>

        {/* PREFERENCES FORM */}
        <form onSubmit={handleSaveSettings} className="rounded-2xl border border-border/50 bg-card p-6 space-y-6">
          <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <Bell className="h-4 w-4 text-neon-green" /> Préférences & Notifications
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <div>
                <p className="text-sm font-semibold text-foreground">Alertes email matchs</p>
                <p className="text-xs text-muted-foreground">Recevoir les alertes IA avant le coup d'envoi des matchs</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsMatches}
                onChange={e => setNotificationsMatches(e.target.checked)}
                className="w-5 h-5 accent-neon-green rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <div>
                <p className="text-sm font-semibold text-foreground">Nouveautés & Offres</p>
                <p className="text-xs text-muted-foreground">Recevoir la newsletter et le bilan de performance hebdomadaire</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsEmail}
                onChange={e => setNotificationsEmail(e.target.checked)}
                className="w-5 h-5 accent-neon-green rounded cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-semibold text-foreground block">Championnat favori</label>
              <select
                value={favoriteLeague}
                onChange={e => setFavoriteLeague(e.target.value)}
                className="w-full max-w-sm rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-neon-green focus:outline-none cursor-pointer"
              >
                <optgroup label="Coupes d'Europe">
                  <option value="Champions League">UEFA Champions League</option>
                  <option value="Europa League">UEFA Europa League</option>
                </optgroup>
                <optgroup label="France (1ère & Divisions Inférieures)">
                  <option value="Ligue 1">Ligue 1 McDonald's</option>
                  <option value="Ligue 2">Ligue 2 BKT (D2)</option>
                  <option value="National">National 1 & 2 (D3/D4)</option>
                </optgroup>
                <optgroup label="Angleterre (1ère & Divisions Inférieures)">
                  <option value="Premier League">Premier League</option>
                  <option value="EFL Championship">EFL Championship (D2)</option>
                  <option value="League One/Two">EFL League One & Two (D3/D4)</option>
                </optgroup>
                <optgroup label="Espagne (1ère & Divisions Inférieures)">
                  <option value="La Liga">La Liga EA Sports</option>
                  <option value="La Liga 2">La Liga Hypermotion (D2)</option>
                </optgroup>
                <optgroup label="Italie (1ère & Divisions Inférieures)">
                  <option value="Serie A">Serie A Enilive</option>
                  <option value="Serie B">Serie B (D2)</option>
                </optgroup>
                <optgroup label="Allemagne (1ère & Divisions Inférieures)">
                  <option value="Bundesliga">Bundesliga</option>
                  <option value="2. Bundesliga">2. Bundesliga (D2)</option>
                </optgroup>
                <optgroup label="Afrique & International">
                  <option value="Ligue 1 Africaine">Ligue 1 / Élite Africaine</option>
                  <option value="Division 2 Africaine">Division 2 Africaine</option>
                  <option value="Autre">Autre Championnat / Division Inférieure</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-neon-green text-background font-bold text-sm px-6 py-2.5 rounded-xl hover:shadow-glow-neon transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" /> Enregistrer les modifications
            </button>
          </div>
        </form>

        <OpenSourceAIToolsModal
          isOpen={openSourceModalOpen}
          onClose={() => setOpenSourceModalOpen(false)}
        />
      </main>
    </div>
  );
}
