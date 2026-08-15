import { createFileRoute, Link } from '@tanstack/react-router';
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGeoPricing, formatPrice } from '@/hooks/useGeoPricing';
import type { Match, AIPerformanceLog } from '@/types';
import { blink } from '@/blink/client';
import { sanitizeMatchListForRole, type SanitizedMatch } from '@/lib/premium-access';
import {
  Sparkles, TrendingUp, Shield, Zap, Crown,
  BarChart3, Target, EyeOff, Trophy, ChevronRight,
  LogIn, Calendar, HelpCircle, FileText,
  Users, Mail, Info, X, ChevronDown, CheckCircle2,
  Send, BookOpen, ArrowUpRight, UserCheck, Activity,
  ArrowRight, ShieldCheck, UserPlus, LogOut, Check
} from 'lucide-react';
import { toast } from 'sonner';

const matchesTable = blink.db.table<Match>('matches');
const perfTable = blink.db.table<AIPerformanceLog>('ai_performance_logs');

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'KronosNP IA — Plateforme de Prédictions Football' },
      { name: 'description', content: 'Plateforme de prédiction de football basée sur l\'IA. Scores exacts, analyses live, value bets. Découvrez la puissance de KronosNP.' },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <BlinkClientBoundary
      fallback={<div className="flex min-h-dvh items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" /></div>}
    >
      <HomeContent />
    </BlinkClientBoundary>
  );
}

type ModalType = 'about' | 'terms' | 'community' | 'help' | 'faq' | 'contact' | null;

function HomeContent() {
  const { user, isLoading: authLoading, isAuthenticated, userRole } = useAuth();
  const { pricing, refresh: refreshGeo } = useGeoPricing();
  const [matches, setMatches] = useState<Match[]>([]);
  const [perfStats, setPerfStats] = useState({ total: 0, scoreExact: 0, outcomeCorrect: 0 });
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('general');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      window.location.href = '/home';
    }
  }, [isAuthenticated]);

  useEffect(() => {
    matchesTable.list({ orderBy: { kickoffTime: 'asc' }, limit: 20 }).then(setMatches).catch(() => setMatches([]));
    perfTable.list({ limit: 500 }).then((logs) => {
      const total = logs.length;
      const scoreExact = logs.filter(l => Number(l.scoreCorrect) > 0).length;
      const outcomeCorrect = logs.filter(l => Number(l.outcomeCorrect) > 0).length;
      setPerfStats({ total, scoreExact, outcomeCorrect });
    }).catch(() => {});
  }, []);

  const sanitizedMatches: SanitizedMatch[] = useMemo(
    () => sanitizeMatchListForRole(matches, userRole),
    [matches, userRole],
  );

  const todayMatches = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return sanitizedMatches.filter(m => m.kickoffTime?.startsWith(today)).sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0));
  }, [sanitizedMatches]);

  const upcomingMatches = useMemo(
    () => sanitizedMatches.filter(m => m.status === 'scheduled' && !todayMatches.includes(m)).slice(0, 6),
    [sanitizedMatches, todayMatches],
  );

  const successRate = perfStats.total > 0 ? Math.round((perfStats.outcomeCorrect / perfStats.total) * 100) : 0;

  const handleLogin = async () => {
    if (isAuthenticated) return;
    blink.auth.login();
  };

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      blink.auth.login();
      return;
    }
    window.location.href = '/pricing';
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMessage) {
      toast.error('Veuillez remplir votre email et votre message.');
      return;
    }
    setContactSubmitted(true);
    toast.success('Message envoyé avec succès ! Notre équipe vous répondra sous 24h.');
    setTimeout(() => {
      setContactSubmitted(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setActiveModal(null);
    }, 2000);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.75) return 'text-neon-green';
    if (score >= 0.5) return 'text-premium-gold';
    return 'text-destructive';
  };

  if (authLoading) {
    return <div className="flex min-h-dvh items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" /></div>;
  }

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col justify-between">
      <div>
        {/* NAVBAR */}
        <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-16">
            <Link to="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-neon-green" />
              <span className="font-display text-xl font-bold text-foreground">KronosNP<span className="text-neon-green"> IA</span></span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <Link to="/bilan" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-neon-green px-3 py-1.5 rounded-md hover:bg-neon-green/10 transition-colors">
                  <BarChart3 className="h-4 w-4 text-neon-green" /> Bilan IA
                </Link>
                <Link to="/defi" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-premium-gold px-3 py-1.5 rounded-md hover:bg-premium-gold/10 transition-colors">
                  <Trophy className="h-4 w-4 text-premium-gold" /> Défi IA
                </Link>
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted/30 transition-colors">Tarifs</Link>
              </div>

              {isAuthenticated ? (
                <div className="flex items-center gap-2.5">
                  {userRole === 'club_pro' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-electric-blue/15 text-electric-blue border border-electric-blue/30">
                      <Crown className="h-3.5 w-3.5" /> Club Pro
                    </span>
                  )}
                  {userRole === 'user_premium' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-premium-gold/10 text-premium-gold border border-premium-gold/30">
                      <Crown className="h-3.5 w-3.5" /> Premium
                    </span>
                  )}
                  {userRole === 'super_admin' && (
                    <Link to="/admin" className="text-sm font-medium text-premium-gold hover:text-premium-gold/80 px-2.5 py-1 rounded-md hover:bg-premium-gold/10 transition-colors">Admin</Link>
                  )}
                  <span className="hidden sm:inline text-sm font-medium text-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50">
                    <UserCheck className="inline h-3.5 w-3.5 text-neon-green mr-1.5" />
                    {user?.email}
                  </span>
                  <button
                    onClick={() => blink.auth.logout()}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted/30"
                    title="Déconnexion"
                  >
                    <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Déconnexion</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground px-3 py-2 transition-colors">
                    <LogIn className="h-4 w-4" /> Connexion
                  </Link>
                  <Link to="/register" className="inline-flex items-center gap-1.5 rounded-lg bg-neon-green px-4 py-2 text-sm font-semibold text-background hover:shadow-glow-neon transition-all">
                    <UserPlus className="h-4 w-4" /> Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* -------------------------------------------------------------------
            AUTHENTICATED HOME DASHBOARD VIEW (WHEN USER IS CONNECTED)
           ------------------------------------------------------------------- */}
        {isAuthenticated ? (
          <div>
            {/* CONNECTED USER BANNER */}
            <section className="relative overflow-hidden border-b border-border/30 bg-gradient-to-r from-card/80 via-background to-card/80">
              <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-neon-green/30 bg-neon-green/10 px-3.5 py-1 text-xs font-semibold text-neon-green mb-3">
                      <UserCheck className="h-3.5 w-3.5" /> Compte Membre Connecté · Zone {pricing.country}
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                      Bienvenue sur votre <span className="text-neon-green">Espace IA</span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                      Accédez immédiatement aux analyses de matchs en direct, votre participation au Défi IA et au bilan algorithmique.
                    </p>
                  </div>

                  {/* QUICK LAUNCH ACTION BUTTONS */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to="/bilan"
                      className="inline-flex items-center gap-2 rounded-xl bg-neon-green px-5 py-3 text-sm font-bold text-background hover:shadow-glow-neon transition-all transform hover:-translate-y-0.5"
                    >
                      <BarChart3 className="h-4 w-4" /> Bilan IA
                    </Link>

                    {userRole !== 'club_pro' && (
                      <Link
                        to="/defi"
                        className="inline-flex items-center gap-2 rounded-xl border border-premium-gold/50 bg-premium-gold/15 px-5 py-3 text-sm font-bold text-premium-gold hover:bg-premium-gold/25 hover:shadow-glow-gold transition-all transform hover:-translate-y-0.5"
                      >
                        <Trophy className="h-4 w-4" /> Défi IA
                      </Link>
                    )}

                    {userRole === 'user_free' && (
                      <button
                        onClick={handleUpgrade}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-premium-gold to-amber-500 px-5 py-3 text-sm font-bold text-background hover:opacity-95 transition-opacity shadow-md"
                      >
                        <Crown className="h-4 w-4" /> Passer Premium
                      </button>
                    )}
                  </div>
                </div>

                {/* STATS OVERVIEW CARDS */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-border/60 bg-card/60 p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Taux de Succès 1N2</span>
                      <Activity className="h-4 w-4 text-neon-green" />
                    </div>
                    <div className="text-2xl font-bold text-neon-green">{successRate}%</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Sur l'ensemble des matchs</div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-card/60 p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Scores Exacts Trouvés</span>
                      <Target className="h-4 w-4 text-neon-green" />
                    </div>
                    <div className="text-2xl font-bold text-neon-green">{perfStats.scoreExact}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Pronostics validés</div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-card/60 p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Matchs Analysés</span>
                      <BarChart3 className="h-4 w-4 text-premium-gold" />
                    </div>
                    <div className="text-2xl font-bold text-premium-gold">{perfStats.total}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Dans la base de données</div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-card/60 p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Statut de votre Compte</span>
                      <Crown className="h-4 w-4 text-electric-blue" />
                    </div>
                    <div className="text-lg font-bold text-foreground capitalize mt-0.5">
                      {userRole === 'club_pro' ? 'Partenaire Club Pro 🏛️' : userRole === 'user_premium' ? 'Membre Premium 👑' : userRole === 'super_admin' ? 'Administrateur ⚡' : 'Membre Gratuit'}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {userRole === 'user_free' ? 'Accès 1N2 basique' : 'Accès illimité actif'}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* -------------------------------------------------------------------
              PUBLIC WELCOME LANDING VIEW (UNAUTHENTICATED VISITORS)
             ------------------------------------------------------------------- */
          <div>
            {/* HERO SECTION */}
            <section className="relative overflow-hidden border-b border-border/30">
              <div className="absolute inset-0 bg-gradient-to-b from-neon-green/5 via-transparent to-transparent pointer-events-none" />
              <div className="mx-auto max-w-7xl px-4 py-12 md:py-20">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-neon-green/30 bg-neon-green/10 px-3.5 py-1.5 text-xs font-semibold text-neon-green mb-6">
                    <Sparkles className="h-4 w-4" /> IA de Prédiction Football · Zone {pricing.country}
                  </div>
                  <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight">
                    L'IA qui <span className="text-neon-green">prédit</span> le football avec précision
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    Analyses prédictives en temps réel, scores exacts, historique certifié et compétitions communautaires. KronosNP IA vous donne un avantage décisionnel inégalé.
                  </p>

                  {/* ACTION BUTTONS: REGISTER, LOGIN, BILAN, DEFI */}
                  <div className="mt-8 flex flex-wrap gap-4 items-center">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2.5 rounded-xl bg-neon-green px-6 py-3.5 text-base font-bold text-background hover:shadow-glow-neon transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <UserPlus className="h-5 w-5" /> S'inscrire Gratuitement
                    </Link>

                    <button
                      onClick={handleLogin}
                      className="inline-flex items-center gap-2.5 rounded-xl border border-border/80 bg-card/80 px-6 py-3.5 text-base font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      <LogIn className="h-5 w-5 text-neon-green" /> Se Connecter
                    </button>

                    <Link
                      to="/bilan"
                      className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-5 py-3.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <BarChart3 className="h-4 w-4 text-neon-green" /> Bilan IA
                    </Link>
                  </div>

                  {/* Stats strip */}
                  <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                    <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur p-3.5 text-center">
                      <div className="text-2xl font-bold text-neon-green">{successRate}%</div>
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">Réussite 1N2</div>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur p-3.5 text-center">
                      <div className="text-2xl font-bold text-neon-green">{perfStats.scoreExact}</div>
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">Scores Exacts</div>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur p-3.5 text-center">
                      <div className="text-2xl font-bold text-premium-gold">{perfStats.total}</div>
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">Matchs Analysés</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* -------------------------------------------------------------------
            SHARED MAIN CONTENT: MODULE CARDS & MATCHES
           ------------------------------------------------------------------- */}

        {/* QUICK MODULE LAUNCHER CARDS */}
        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Modules Principaux IA</h2>
              <p className="text-sm text-muted-foreground">Accédez directement aux fonctionnalités d'analyse et de compétition</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* BILAN IA CARD */}
            <div className="relative overflow-hidden rounded-2xl border border-neon-green/30 bg-gradient-to-br from-neon-green/10 via-card/80 to-card p-6 md:p-8 hover:border-neon-green/60 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-neon-green/20 text-neon-green">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neon-green/20 text-neon-green border border-neon-green/30">
                  Temps Réel
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2 group-hover:text-neon-green transition-colors">
                Bilan IA
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Suivez en temps réel la transparence totale de notre algorithme. Historique certifié des pronostics, statistiques par championnat, taux de succès sur les cotes et graphiques de performance.
              </p>
              <Link
                to="/bilan"
                className="inline-flex items-center gap-2 rounded-xl bg-neon-green px-5 py-2.5 text-sm font-bold text-background hover:shadow-glow-neon transition-all"
              >
                Consulter le Bilan IA <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {/* DEFI IA CARD (FOR FREE & PREMIUM USERS) / CLUB PRO RECRUITMENT HUB */}
            {userRole !== 'club_pro' ? (
              <div className="relative overflow-hidden rounded-2xl border border-premium-gold/30 bg-gradient-to-br from-premium-gold/10 via-card/80 to-card p-6 md:p-8 hover:border-premium-gold/60 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-premium-gold/20 text-premium-gold">
                    <Trophy className="h-7 w-7" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-premium-gold/20 text-premium-gold border border-premium-gold/30">
                    Compétition
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2 group-hover:text-premium-gold transition-colors">
                  Défi IA
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Défiez l'Intelligence Artificielle et la communauté KronosNP ! Pronostiquez la grille de matchs de la semaine, cumulez des points et gagnez des accès Premium gratuits.
                </p>
                <Link
                  to="/defi"
                  className="inline-flex items-center gap-2 rounded-xl border border-premium-gold/60 bg-premium-gold/20 px-5 py-2.5 text-sm font-bold text-premium-gold hover:bg-premium-gold/30 hover:shadow-glow-gold transition-all"
                >
                  Relever le Défi IA <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-electric-blue/40 bg-gradient-to-br from-electric-blue/15 via-card/80 to-card p-6 md:p-8 hover:border-electric-blue/70 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-electric-blue/20 text-electric-blue">
                    <Crown className="h-7 w-7" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/30">
                    Club Pro Exclusif
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2 group-hover:text-electric-blue transition-colors">
                  Simulateur Mercato 360°
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Banc d'analyse décisionnelle pour directeurs sportifs : modélisez le transfert, l'amortissement, l'impact xG et les liquidités nettes de votre club.
                </p>
                <Link
                  to="/mercato"
                  search={{ tab: 'simulation' }}
                  className="inline-flex items-center gap-2 rounded-xl bg-electric-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-electric-blue/90 shadow-md transition-all"
                >
                  Lancer la Simulation 360° <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* TODAY'S MATCHES */}
        <section className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Matchs du Jour</h2>
              <p className="text-sm text-muted-foreground">Triés par indice de confiance IA</p>
            </div>
            {userRole === 'user_free' && (
              <button onClick={handleUpgrade} className="inline-flex items-center gap-1.5 rounded-lg border border-premium-gold/50 bg-premium-gold/10 px-3 py-1.5 text-xs font-semibold text-premium-gold hover:bg-premium-gold/20 transition-colors">
                <Crown className="h-3.5 w-3.5" /> Débloquer Scores Exacts
              </button>
            )}
          </div>

          {todayMatches.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-card/50 p-12 text-center">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Aucun match prévu aujourd'hui. Revenez plus tard !</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {todayMatches.map((match) => (
                <Link key={match.id} to="/matches/$id" params={{ id: match.id }} className="block group">
                  <MatchCard
                    match={match}
                    isPremium={match.premiumUnlocked}
                    onUpgrade={handleUpgrade}
                    confidenceColor={getConfidenceColor(match.confidenceScore)}
                  />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* UPCOMING MATCHES */}
        {upcomingMatches.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-6">À Venir</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingMatches.map((match) => (
                <Link key={match.id} to="/matches/$id" params={{ id: match.id }} className="block group">
                  <MatchCard
                    match={match}
                    isPremium={match.premiumUnlocked}
                    onUpgrade={handleUpgrade}
                    confidenceColor={getConfidenceColor(match.confidenceScore)}
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FEATURES */}
        <section className="border-t border-border/30 mx-auto max-w-7xl px-4 py-16">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-10">Pourquoi KronosNP IA ?</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BarChart3, title: 'IA Transparente', desc: 'Statistiques de réussite réelles et vérifiables en temps réel via le Bilan IA.' },
              { icon: Target, title: 'Scores Exacts', desc: 'Prédictions de scores exacts avec indice de confiance algorithmique.' },
              { icon: Shield, title: 'Value Bet', desc: 'Comparaison automatique avec les cotes des bookmakers.' },
              { icon: Trophy, title: 'Défi Communautaire', desc: 'Défiez l\'IA chaque semaine pour gagner des récompenses et badges.' },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-6 hover:border-neon-green/30 hover:shadow-md transition-all">
                <f.icon className="h-8 w-8 text-neon-green mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        {(!isAuthenticated || userRole === 'user_free') && (
          <section className="border-t border-border/30 mx-auto max-w-7xl px-4 py-16 text-center">
            <div className="rounded-2xl border border-premium-gold/20 bg-gradient-to-b from-premium-gold/5 to-transparent p-10">
              <Crown className="mx-auto h-10 w-10 text-premium-gold mb-4" />
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">Passez à la Vitesse Supérieure</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Débloquez les scores exacts, le simulateur What If, les value bets et le guide anti-limitation.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {Object.entries(pricing.plans).map(([plan, info]) => (
                  <div key={plan} className="rounded-xl border border-border/50 bg-card p-5 text-center min-w-[160px]">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{plan === 'weekly' ? 'Hebdo' : plan === 'monthly' ? 'Mensuel' : 'Trimestre'}</div>
                    <div className="text-2xl font-bold text-foreground">{formatPrice(info.price, pricing.currency)}</div>
                    <button onClick={handleUpgrade} className="mt-3 w-full rounded-lg bg-neon-green px-3 py-1.5 text-xs font-semibold text-background hover:shadow-glow-neon transition-all">
                      Choisir
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Paiement sécurisé via {pricing.paymentMethods.includes('orange_money') ? 'Orange Money, MTN MoMo, ' : ''}Stripe
                <button onClick={refreshGeo} className="ml-3 underline hover:text-foreground transition-colors">
                  Changer de zone ({pricing.country})
                </button>
              </p>
            </div>
          </section>
        )}
      </div>

      {/* ENHANCED FOOTER */}
      <footer className="border-t border-border/40 bg-card/60 pt-12 pb-8 mt-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 mb-12">
            {/* BRAND COL */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-neon-green" />
                <span className="font-display text-xl font-bold text-foreground">KronosNP<span className="text-neon-green"> IA</span></span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Plateforme d'Intelligence Artificielle dédiée aux prédictions football, analyses 1N2, scores exacts, value bets et bilans certifiés.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/20">
                  <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" /> IA Modèle v2.4 Actif
                </span>
              </div>
            </div>

            {/* NAV LINKS */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-4">Fonctionnalités</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/bilan" className="text-muted-foreground hover:text-neon-green transition-colors inline-flex items-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5" /> Bilan IA
                  </Link>
                </li>
                <li>
                  <Link to="/defi" className="text-muted-foreground hover:text-premium-gold transition-colors inline-flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5" /> Défi IA
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                    Tarifs & Abonnements
                  </Link>
                </li>
                {userRole === 'super_admin' && (
                  <li>
                    <Link to="/admin" className="text-premium-gold hover:underline transition-colors">
                      Espace Admin
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* LEGAL & COMPANY */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-4">Informations</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => setActiveModal('about')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    À propos
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('terms')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    Conditions & Confidentialité
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('community')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    Règles de la communauté
                  </button>
                </li>
              </ul>
            </div>

            {/* SUPPORT */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-4">Aide & Support</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => setActiveModal('help')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    Centre d'aide
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('faq')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    FAQ
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('contact')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/30 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} KronosNP IA. Tous droits réservés.</p>
            <p className="text-center md:text-right">
              Les paris sportifs comportent des risques (endettement, dépendance). Jouez de façon responsable (18+).
            </p>
          </div>
        </div>
      </footer>

      {/* FOOTER MODALS OVERLAY */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            {activeModal === 'about' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-neon-green mb-2">
                  <Info className="h-6 w-6" />
                  <h3 className="font-display text-2xl font-bold text-foreground">À propos de KronosNP IA</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  KronosNP IA est une plateforme de pointe dédiée aux pronostics football par Intelligence Artificielle. Notre mission est d'apporter une transparence totale et une précision inégalée aux passionnés de statistiques sportives.
                </p>
                <div className="grid gap-3 md:grid-cols-2 pt-2">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                    <h4 className="font-semibold text-foreground text-sm mb-1">Algorithmes Avancés</h4>
                    <p className="text-xs text-muted-foreground">Analyse de millions de points de données, formes des équipes, expected goals (xG) et historiques de confrontations.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                    <h4 className="font-semibold text-foreground text-sm mb-1">Transparence 100%</h4>
                    <p className="text-xs text-muted-foreground">Tous nos pronostics sont enregistrés et consultables dans notre Bilan IA certifié et infalsifiable.</p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'terms' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-neon-green mb-2">
                  <FileText className="h-6 w-6" />
                  <h3 className="font-display text-2xl font-bold text-foreground">Conditions & Confidentialité</h3>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
                  <h4 className="font-semibold text-foreground">1. Conditions Générales d'Utilisation</h4>
                  <p>KronosNP IA fournit des outils d'analyse statistique et des prédictions basées sur l'intelligence artificielle à titre informatif et récréatif. L'accès à la plateforme est strictement réservé aux personnes majeures (18+).</p>

                  <h4 className="font-semibold text-foreground">2. Avertissement sur les Jeux d'Argent</h4>
                  <p>Les prédictions fournies ne garantissent en aucun cas des gains financiers. Les paris sportifs comportent des risques importants de perte en capital et de dépendance. Pariez toujours de manière responsable et dans la limite de vos moyens.</p>

                  <h4 className="font-semibold text-foreground">3. Protection des Données (RGPD)</h4>
                  <p>Vos données personnelles (email, identifiants) sont cryptées et traitées dans le strict respect de la réglementation RGPD. Aucune donnée personnelle n'est vendue ou transmise à des tiers.</p>
                </div>
              </div>
            )}

            {activeModal === 'community' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-premium-gold mb-2">
                  <Users className="h-6 w-6" />
                  <h3 className="font-display text-2xl font-bold text-foreground">Règles de la Communauté</h3>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>Afin d'assurer un environnement sain et équitable au sein du <strong>Défi IA</strong> et des espaces d'échange KronosNP, chaque utilisateur s'engage à respecter les règles suivantes :</p>
                  <ul className="space-y-2 list-disc pl-5">
                    <li><strong>Fair-Play au Défi IA :</strong> Une seule participation par personne physique et par session de compétition.</li>
                    <li><strong>Anti-Bot & Anti-Cheat :</strong> Tout recours à des scripts de pronostics automatisés entraînera un bannissement définitif.</li>
                    <li><strong>Respect & Courtoisie :</strong> Les propos haineux, diffamatoires ou promotionnels non autorisés sont proscrits.</li>
                    <li><strong>Conseils responsables :</strong> Ne partagez aucun conseil d'investissement financier trompeur.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeModal === 'help' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-neon-green mb-2">
                  <BookOpen className="h-6 w-6" />
                  <h3 className="font-display text-2xl font-bold text-foreground">Centre d'aide</h3>
                </div>
                <p className="text-sm text-muted-foreground">Découvrez comment tirer le meilleur parti de KronosNP IA :</p>
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
                    <h4 className="font-semibold text-foreground text-sm">Comment lire l'Indice de Confiance IA ?</h4>
                    <p className="text-xs text-muted-foreground mt-1">L'indice exprimé en % (ex: 82%) calcule la certitude mathématique de notre algorithme basée sur la cohérence des données récentes.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
                    <h4 className="font-semibold text-foreground text-sm">Quelle est la différence entre Bilan IA et Défi IA ?</h4>
                    <p className="text-xs text-muted-foreground mt-1">Le <strong>Bilan IA</strong> affiche les statistiques globales certifiées de notre IA. Le <strong>Défi IA</strong> est un concours interactif où vous affrontez l'IA et les autres membres pour gagner des récompenses.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
                    <h4 className="font-semibold text-foreground text-sm">Moyens de paiement acceptés</h4>
                    <p className="text-xs text-muted-foreground mt-1">Nous acceptons les cartes bancaires via Stripe ainsi que Mobile Money (Orange Money, MTN MoMo) selon votre région géographique.</p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'faq' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-neon-green mb-2">
                  <HelpCircle className="h-6 w-6" />
                  <h3 className="font-display text-2xl font-bold text-foreground">Foire Aux Questions (FAQ)</h3>
                </div>
                <div className="space-y-3 pt-2 max-h-[60vh] overflow-y-auto pr-2">
                  {[
                    {
                      q: "Comment fonctionne l'IA de KronosNP ?",
                      r: "KronosNP combine le machine learning et l'analyse prédictive bayésienne sur les statistiques de matchs (xG, possessions, attaques dangereuses, blessures, conditions météo) pour générer des probabilités 1N2 et des scores exacts."
                    },
                    {
                      q: "Comment participer au Défi IA ?",
                      r: "Rendez-vous sur la page Défi IA via le bouton principal. Soumettez vos pronostics pour la grille de matchs en cours avant le coup d'envoi. Accumulez des points pour figurer au classement !"
                    },
                    {
                      q: "Les pronostics sont-ils garantis à 100% ?",
                      r: "Non. Le football comporte une part d'aléatoire inhérente. L'IA optimise les probabilités et trouve les 'Value Bets' (cotes surévaluées par les bookmakers), mais ne garantit jamais des gains certains."
                    },
                    {
                      q: "Puis-je annuler mon abonnement Premium à tout moment ?",
                      r: "Absolument. Vous pouvez gérer ou suspendre votre abonnement en un clic depuis votre espace membre sans frais cachés."
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-border/60 bg-muted/30 overflow-hidden">
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <span>{item.q}</span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openFaqIndex === idx ? 'rotate-180 text-neon-green' : ''}`} />
                      </button>
                      {openFaqIndex === idx && (
                        <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/30">
                          {item.r}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'contact' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-neon-green mb-2">
                  <Mail className="h-6 w-6" />
                  <h3 className="font-display text-2xl font-bold text-foreground">Contactez l'Équipe KronosNP</h3>
                </div>
                <p className="text-sm text-muted-foreground">Une question, un partenariat ou un problème d'accès ? Envoyez-nous un message :</p>

                {contactSubmitted ? (
                  <div className="p-6 text-center rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green my-4">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2" />
                    <p className="font-semibold text-base">Message Transmis !</p>
                    <p className="text-xs text-muted-foreground mt-1">Merci, nous traitons votre demande dans les plus brefs délais.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 pt-2">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Votre Nom</label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Ex: Alexandre"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-neon-green focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Votre Email *</label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="exemple@email.com"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-neon-green focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Sujet</label>
                      <select
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-neon-green focus:outline-none"
                      >
                        <option value="general">Question générale</option>
                        <option value="support">Support technique / Compte</option>
                        <option value="billing">Facturation / Abonnements</option>
                        <option value="partnership">Partenariat</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Votre Message *</label>
                      <textarea
                        required
                        rows={4}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Comment pouvons-nous vous aider ?"
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-neon-green focus:outline-none resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neon-green px-5 py-3 text-sm font-bold text-background hover:shadow-glow-neon transition-all"
                    >
                      <Send className="h-4 w-4" /> Envoyer le Message
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  isPremium,
  onUpgrade,
  confidenceColor,
}: {
  match: SanitizedMatch;
  isPremium: boolean;
  onUpgrade: () => void;
  confidenceColor: string;
}) {
  const isLive = match.status === 'live';
  const confPct = Math.round((match.confidenceScore || 0) * 100);

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden hover:border-neon-green/30 transition-all group h-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">{match.league} {match.leagueCountry && `· ${match.leagueCountry}`}</span>
          <span className={`text-xs font-semibold ${confidenceColor}`}>
            <Target className="inline h-3 w-3 mr-1" />{confPct}% confiance
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="text-center flex-1">
            <div className="w-10 h-10 mx-auto rounded-full bg-muted flex items-center justify-center font-bold text-sm text-foreground mb-1">
              {match.homeTeam.slice(0, 3).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-foreground">{match.homeTeam}</span>
          </div>
          <div className="px-3 text-center">
            {isLive ? (
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-lg font-bold text-foreground">{match.homeScore} - {match.awayScore}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground font-mono">{match.kickoffTime ? new Date(match.kickoffTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
            )}
          </div>
          <div className="text-center flex-1">
            <div className="w-10 h-10 mx-auto rounded-full bg-muted flex items-center justify-center font-bold text-sm text-foreground mb-1">
              {match.awayTeam.slice(0, 3).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-foreground">{match.awayTeam}</span>
          </div>
        </div>

        {/* AI Prediction */}
        <div className="rounded-lg bg-muted/50 p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Prédiction IA 1N2</span>
            <span className="text-sm font-bold text-neon-green">{match.ai1n2Pred || '—'}</span>
          </div>
          {isPremium ? (
            <div className="mt-2 pt-2 border-t border-border/30">
              <span className="text-xs text-muted-foreground">Score Exact</span>
              <div className="text-lg font-bold text-foreground mt-0.5">
                {match.aiHomeScorePred !== null ? `${match.aiHomeScorePred} - ${match.aiAwayScorePred}` : '—'}
              </div>
            </div>
          ) : (
            <div className="mt-2 pt-2 border-t border-border/30 relative">
              <div className="blur-sm select-none">
                <span className="text-xs text-muted-foreground">Score Exact</span>
                <div className="text-lg font-bold text-foreground">X - X</div>
              </div>
              <button onClick={onUpgrade} className="absolute inset-0 flex flex-col items-center justify-center rounded bg-background/80 hover:bg-background/90 transition-colors">
                <EyeOff className="h-5 w-5 text-premium-gold mb-1" />
                <span className="text-xs font-semibold text-premium-gold">Débloquer Premium</span>
              </button>
            </div>
          )}
        </div>

        {/* Value Bet (premium only) */}
        {match.valueBet && isPremium && (
          <div className="rounded-lg bg-premium-gold/10 border border-premium-gold/20 p-2.5">
            <div className="flex items-center gap-1.5 text-xs text-premium-gold font-semibold mb-1">
              <TrendingUp className="h-3.5 w-3.5" /> Value Bet
            </div>
            <p className="text-xs text-foreground line-clamp-2">{match.valueBet}</p>
          </div>
        )}

        {/* Odds */}
        {match.oddsHome && (
          <div className="flex justify-between mt-3 text-xs text-muted-foreground">
            <span>1: {match.oddsHome}</span>
            <span>N: {match.oddsDraw}</span>
            <span>2: {match.oddsAway}</span>
          </div>
        )}
      </div>
    </div>
  );
}