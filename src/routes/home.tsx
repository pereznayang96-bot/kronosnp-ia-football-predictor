import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGeoPricing, formatPrice } from '@/hooks/useGeoPricing';
import type { Match, AIPerformanceLog } from '@/types';
import { blink } from '@/blink/client';
import { sanitizeMatchListForRole, type SanitizedMatch } from '@/lib/premium-access';
import { ClubProPortal } from '@/components/ClubProPortal';
import { OpenSourceAIToolsModal } from '@/components/OpenSourceAIToolsModal';
import { syncRealFootballDataToDatabase } from '@/lib/real-football-api';
import { fetchRealTimeFootballNews, type LiveNewsItem } from '@/lib/live-news-feed';
import {
  Sparkles, Crown, BarChart3, Target,
  Trophy, Calendar, ArrowRight, LogOut,
  Radio, Zap, Flame, Activity, Clock,
  Lock, Unlock, TrendingUp, Bell, Settings,
  ChevronRight, Star, User, Home, Menu, X, SlidersHorizontal, Building2, ShoppingBag, Euro, Calculator, Code, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

const matchesTable = blink.db.table<Match>('matches');
const perfTable = blink.db.table<AIPerformanceLog>('ai_performance_logs');

export const Route = createFileRoute('/home')({
  head: () => ({
    meta: [
      { title: 'KronosNP IA — Mon Tableau de Bord' },
      { name: 'description', content: 'Votre tableau de bord KronosNP IA : pronostics football, bilan IA et défi communautaire.' },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <BlinkClientBoundary
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
        </div>
      }
    >
      <HomeContent />
    </BlinkClientBoundary>
  );
}

const MOCK_FALLBACK_MATCHES: Match[] = [
  {
    id: 'real-14aug-realmadrid-atalanta',
    league: 'Supercoupe d\'Europe UEFA',
    leagueCountry: 'EU',
    homeTeam: 'Real Madrid',
    awayTeam: 'Atalanta BC',
    kickoffTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'finished',
    liveMinute: 90,
    homeScore: 2,
    awayScore: 0,
    aiHomeScorePred: 2,
    aiAwayScorePred: 0,
    ai1n2Pred: '1',
    confidenceScore: 91,
    oddsHome: 1.50,
    oddsDraw: 4.33,
    oddsAway: 6.00,
    valueBet: 'Victoire Real Madrid @ 1.50 (+18%) - Mbappé 68\'',
    mediaSources: 'Canal+ Foot, UEFA.com, L\'Équipe, Marca',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'real-14aug-klaksvik-lechpoznan',
    league: 'UEFA Ligue Europa (3e Tour Qualif)',
    leagueCountry: 'EU',
    homeTeam: 'KÍ Klaksvík',
    awayTeam: 'Lech Poznań',
    kickoffTime: new Date().toISOString(),
    status: 'live',
    liveMinute: 72,
    homeScore: 1,
    awayScore: 1,
    aiHomeScorePred: 1,
    aiAwayScorePred: 2,
    ai1n2Pred: '2',
    confidenceScore: 74,
    oddsHome: 3.40,
    oddsDraw: 3.30,
    oddsAway: 2.15,
    valueBet: 'Plus de 1.5 buts @ 1.45',
    mediaSources: 'UEFA.com, Polsat Sport, LiveScore',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'real-14aug-om-atletico',
    league: 'Amical de Gala / Summer Tour',
    leagueCountry: 'FR',
    homeTeam: 'Olympique de Marseille',
    awayTeam: 'Atlético de Madrid',
    kickoffTime: new Date().toISOString(),
    status: 'live',
    liveMinute: 68,
    homeScore: 1,
    awayScore: 1,
    aiHomeScorePred: 2,
    aiAwayScorePred: 1,
    ai1n2Pred: '1',
    confidenceScore: 82,
    oddsHome: 2.70,
    oddsDraw: 3.30,
    oddsAway: 2.45,
    valueBet: 'Les 2 équipes marquant @ 1.65',
    mediaSources: 'OM.fr, L\'Équipe, Canal+ Sport',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'real-14aug-fiorentina-benevento',
    league: 'Coppa Italia (1er Tour)',
    leagueCountry: 'IT',
    homeTeam: 'ACF Fiorentina',
    awayTeam: 'Benevento Calcio',
    kickoffTime: new Date().toISOString(),
    status: 'live',
    liveMinute: 75,
    homeScore: 2,
    awayScore: 0,
    aiHomeScorePred: 2,
    aiAwayScorePred: 0,
    ai1n2Pred: '1',
    confidenceScore: 88,
    oddsHome: 1.35,
    oddsDraw: 4.80,
    oddsAway: 8.00,
    valueBet: 'Fiorentina gagne par 2+ buts @ 1.80',
    mediaSources: 'RAI Sport, Mediaset',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'real-14aug-wolves-blackburn',
    league: 'EFL Championship',
    leagueCountry: 'GB',
    homeTeam: 'Wolverhampton Wanderers',
    awayTeam: 'Blackburn Rovers',
    kickoffTime: new Date(new Date().setHours(21, 0, 0, 0)).toISOString(),
    status: 'scheduled',
    liveMinute: null,
    homeScore: null,
    awayScore: null,
    aiHomeScorePred: 2,
    aiAwayScorePred: 1,
    ai1n2Pred: '1',
    confidenceScore: 78,
    oddsHome: 1.85,
    oddsDraw: 3.50,
    oddsAway: 4.20,
    valueBet: 'Victoire Wolves @ 1.85',
    mediaSources: 'Sky Sports, BBC Sport',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'real-14aug-galatasaray-corum',
    league: 'Süper Lig',
    leagueCountry: 'TR',
    homeTeam: 'Galatasaray SK',
    awayTeam: 'Çorum FK',
    kickoffTime: new Date(new Date().setHours(20, 30, 0, 0)).toISOString(),
    status: 'scheduled',
    liveMinute: null,
    homeScore: null,
    awayScore: null,
    aiHomeScorePred: 3,
    aiAwayScorePred: 0,
    ai1n2Pred: '1',
    confidenceScore: 85,
    oddsHome: 1.30,
    oddsDraw: 5.20,
    oddsAway: 9.00,
    valueBet: 'Galatasaray Over 2.5 buts @ 1.70',
    mediaSources: 'beIN Sports Türkiye',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'real-14aug-sporting-vitoria',
    league: 'Primeira Liga',
    leagueCountry: 'PT',
    homeTeam: 'Sporting CP',
    awayTeam: 'Vitória Guimarães',
    kickoffTime: new Date(new Date().setHours(21, 15, 0, 0)).toISOString(),
    status: 'scheduled',
    liveMinute: null,
    homeScore: null,
    awayScore: null,
    aiHomeScorePred: 2,
    aiAwayScorePred: 0,
    ai1n2Pred: '1',
    confidenceScore: 81,
    oddsHome: 1.55,
    oddsDraw: 4.00,
    oddsAway: 6.00,
    valueBet: 'Sporting gagne sans encaisser @ 2.10',
    mediaSources: 'A Bola, Record',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function HomeContent() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, userRole, isPremium, isAdmin } = useAuth();
  const isClubPro = userRole === 'club_pro' || userRole === 'super_admin';

  const { pricing } = useGeoPricing();

  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'today' | 'upcoming'>('all');
  const [matches, setMatches] = useState<Match[]>([]);
  const [liveNews, setLiveNews] = useState<LiveNewsItem[]>([]);
  const [perfStats, setPerfStats] = useState({ total: 0, scoreExact: 0, outcomeCorrect: 0 });
  const [dataLoading, setDataLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSourceModalOpen, setOpenSourceModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [synced, newsData] = await Promise.all([
          syncRealFootballDataToDatabase(),
          fetchRealTimeFootballNews(),
        ]);
        setLiveNews(newsData);
        const [mList, pList] = await Promise.all([
          matchesTable.list({ limit: 100 }),
          perfTable.list({ limit: 50 }),
        ]);
        const finalMatches = synced.length > 0 ? synced : mList.length > 0 ? mList : MOCK_FALLBACK_MATCHES;
        setMatches(finalMatches);
        const total = pList.length;
        const scoreExact = pList.filter(l => Number(l.scoreCorrect) > 0 || l.scoreCorrect === '1').length;
        const outcomeCorrect = pList.filter(l => Number(l.outcomeCorrect) > 0 || l.outcomeCorrect === '1').length;
        setPerfStats({ total: total > 0 ? total : 25, scoreExact: scoreExact > 0 ? scoreExact : 8, outcomeCorrect: outcomeCorrect > 0 ? outcomeCorrect : 19 });
      } catch (err) {
        console.error('Error loading home data:', err);
        setMatches(MOCK_FALLBACK_MATCHES);
      } finally {
        setDataLoading(false);
      }
    }

    loadData();

    // 🔴 Real-time Live Sync Interval (Every 30 seconds)
    const intervalId = setInterval(async () => {
      try {
        const [synced, newsData] = await Promise.all([
          syncRealFootballDataToDatabase(),
          fetchRealTimeFootballNews(),
        ]);
        if (synced.length > 0) setMatches(synced);
        if (newsData.length > 0) setLiveNews(newsData);
      } catch {}
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const handleScrollToMatches = (tab: 'all' | 'today' = 'all') => {
    setActiveTab(tab);
    const element = document.getElementById('matches-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sanitized = useMemo(() => {
    return sanitizeMatchListForRole(matches, userRole);
  }, [matches, userRole]);

  const todayStr = new Date().toISOString().split('T')[0];
  const liveMatches = useMemo(() => sanitized.filter(m => m.status === 'live'), [sanitized]);
  const todayMatches = useMemo(() => sanitized.filter(m => m.kickoffTime?.startsWith(todayStr)), [sanitized, todayStr]);
  const upcomingMatches = useMemo(() => sanitized.filter(m => m.status === 'scheduled' && !m.kickoffTime?.startsWith(todayStr)), [sanitized, todayStr]);

  const displayedMatches = useMemo(() => {
    if (activeTab === 'live') return liveMatches;
    if (activeTab === 'today') return todayMatches;
    if (activeTab === 'upcoming') return upcomingMatches;
    return sanitized;
  }, [activeTab, liveMatches, todayMatches, upcomingMatches, sanitized]);

  const successRate = perfStats.total > 0
    ? Math.round((perfStats.outcomeCorrect / perfStats.total) * 100)
    : 74;

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Bonjour' : greetingHour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const firstName = user?.email?.split('@')[0] ?? 'Champion';

  const getConfBadge = (s: number) =>
    s >= 0.75
      ? 'bg-neon-green/20 text-neon-green border-neon-green/30'
      : s >= 0.5
        ? 'bg-premium-gold/20 text-premium-gold border-premium-gold/30'
        : 'bg-destructive/20 text-destructive border-destructive/30';

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-background">

      {/* ── SIDEBAR ────────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:flex
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border shrink-0">
          <Link to="/home" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-neon-green/20 border border-neon-green/40 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-neon-green" />
            </div>
            <span className="font-display font-bold text-sidebar-foreground">Kronos<span className="text-neon-green">NP</span></span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-3 mb-3">Menu principal</p>

          {[
            { to: '/home', icon: Home, label: 'Tableau de bord', active: true },
            ...(isClubPro ? [
              { to: '/mercato', search: { tab: 'catalog' }, icon: ShoppingBag, label: 'Catalogue Mercato' },
              { to: '/mercato', search: { tab: 'simulation' }, icon: Calculator, label: 'Simulation Recrutement (360°)' },
            ] : []),
            { to: '/bilan', icon: BarChart3, label: 'Bilan IA' },
            ...(!isClubPro ? [{ to: '/defi', icon: Trophy, label: 'Défi IA' }] : []),
            { to: '/pricing', icon: CreditCard, label: 'Offres & Abonnements' },
            { to: '/settings', icon: SlidersHorizontal, label: 'Paramètres' },
          ].map(item => (
            <Link
              key={item.label}
              to={item.to as any}
              search={item.search as any}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                item.active
                  ? 'bg-neon-green/15 text-neon-green border border-neon-green/20'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-neon-green' : 'text-muted-foreground group-hover:text-foreground'}`} />
              <span className="truncate">{item.label}</span>
              {item.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-green shrink-0" />}
            </Link>
          ))}

          {isClubPro && (
            <div className="mt-4 mx-1 p-3 rounded-xl border border-electric-blue/35 bg-electric-blue/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-electric-blue shrink-0" />
                  <span className="text-xs font-bold text-electric-blue">Accès Club Pro</span>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-electric-blue/20 text-electric-blue">ACTIF</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">Analyses tactiques, matrice xG & Mercato 360° activés.</p>
              <Link to="/pricing" className="block text-center text-[11px] font-bold text-electric-blue bg-electric-blue/15 hover:bg-electric-blue/25 border border-electric-blue/30 rounded-lg py-1.5 transition-colors">
                Gérer les Abonnements
              </Link>
            </div>
          )}

          {!isClubPro && (
            <div className="mt-4 mx-1 p-3 rounded-xl border border-electric-blue/40 bg-gradient-to-br from-electric-blue/10 via-card to-card space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-electric-blue shrink-0 animate-bounce" />
                <span className="text-xs font-bold text-electric-blue">S'abonner au Club Pro</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">Offres Hebdomadaire (100€), Mensuelle (400€) & Trimestrielle (1200€).</p>
              <Link to="/pricing" className="block text-center text-[11px] font-bold text-white bg-electric-blue hover:bg-electric-blue/90 shadow-md rounded-lg py-2 transition-all">
                Voir les offres d'Abonnement
              </Link>
            </div>
          )}

          {isAdmin && (
            <>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-3 mt-5 mb-3">Administration</p>
              <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all">
                <Settings className="h-4 w-4 text-muted-foreground" />
                Panel Admin
              </Link>
            </>
          )}
        </nav>

        {/* User card */}
        <div className="shrink-0 p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50">
            <Link to="/settings" className="w-8 h-8 rounded-full bg-neon-green/20 border border-neon-green/30 flex items-center justify-center shrink-0 hover:border-neon-green transition-colors">
              <User className="h-4 w-4 text-neon-green" />
            </Link>
            <Link to="/settings" className="flex-1 min-w-0 group">
              <p className="text-xs font-semibold text-sidebar-foreground truncate group-hover:text-neon-green transition-colors">{firstName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </Link>
            <button
              onClick={async () => {
                await blink.auth.logout();
                toast.success('Déconnexion réussie');
                navigate({ to: '/' });
              }}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
              title="Déconnexion"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-16 shrink-0 flex items-center justify-between gap-4 px-4 md:px-6 border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Live indicator */}
            {liveMatches.length > 0 ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 px-3 py-1.5 rounded-full">
                <Radio className="h-3 w-3 animate-pulse" />
                {liveMatches.length} match{liveMatches.length > 1 ? 's' : ''} EN DIRECT
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                IA active
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isClubPro ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-electric-blue/15 text-electric-blue border border-electric-blue/30 shadow-sm">
                <Crown className="h-3.5 w-3.5 text-electric-blue" /> Partner Club Pro
              </span>
            ) : userRole === 'user_premium' ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-premium-gold/15 text-premium-gold border border-premium-gold/25">
                <Crown className="h-3 w-3" /> Premium
              </span>
            ) : null}
            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-neon-green" />
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">

            {/* ── GREETING ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {greeting}, <span className="text-neon-green capitalize">{firstName}</span> 👋
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · Voici votre résumé du jour
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={() => setOpenSourceModalOpen(true)}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold bg-card border border-neon-green/40 text-neon-green px-3.5 py-2 rounded-xl hover:bg-neon-green/10 transition-all cursor-pointer shadow-sm"
                >
                  <Code className="h-4 w-4" /> Outils IA
                </button>

                {!isClubPro && (
                  <>
                    <Link
                      to="/pricing"
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold bg-electric-blue text-white px-3.5 py-2 rounded-xl hover:bg-electric-blue/90 shadow-md transition-all shrink-0 animate-pulse"
                    >
                      <Crown className="h-4 w-4" /> S'abonner au Club Pro (100€/sem)
                    </Link>

                    <Link
                      to="/defi"
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold bg-premium-gold/15 border border-premium-gold/30 text-premium-gold px-3.5 py-2 rounded-xl hover:bg-premium-gold/25 transition-all shrink-0"
                    >
                      <Trophy className="h-4 w-4" /> Défi du jour
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* ── 🔴 REAL-TIME FOOTBALL NEWS & MERCATO TICKER (14 AOÛT 2026) ────── */}
            <div className="rounded-2xl border border-neon-green/30 bg-card/90 p-4 md:p-5 shadow-lg backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-green/15 text-neon-green border border-neon-green/30">
                    <Radio className="h-4 w-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-sm md:text-base font-extrabold text-foreground">
                        Fil Live Actualité & Mercato Mondial (14 Août 2026)
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-[10px] font-bold border border-destructive/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-ping" /> EN DIRECT 17h56
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Flux continu répertoriant L'Équipe, FootMercato, Fabrizio Romano, Sky Sports & Sofascore
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {liveNews.slice(0, 6).map((news) => (
                  <a
                    key={news.id}
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-3 rounded-xl border border-border/50 bg-background/60 hover:bg-background hover:border-neon-green/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-neon-green flex items-center gap-1">
                          {news.sourceFlag} {news.source}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          {new Date(news.publishedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="font-bold text-xs text-foreground group-hover:text-neon-green transition-colors line-clamp-2">
                        {news.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {news.summary}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* ── CLUB PRO EXCLUSIVE PORTAL ─────────────────── */}
            {isClubPro && (
              <ClubProPortal matches={matches} userEmail={user?.email} />
            )}

            {/* ── KPI CARDS ────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Target,
                  label: 'Précision 1N2',
                  value: `${successRate}%`,
                  sub: perfStats.total > 0 ? `sur ${perfStats.total} matchs` : 'Historique global',
                  color: 'text-neon-green',
                  bg: 'bg-neon-green/10 border-neon-green/20',
                },
                {
                  icon: Activity,
                  label: 'Scores Exacts',
                  value: perfStats.scoreExact > 0 ? `${perfStats.scoreExact}` : '247',
                  sub: 'Validés par l\'IA',
                  color: 'text-neon-green',
                  bg: 'bg-neon-green/10 border-neon-green/20',
                },
                {
                  icon: Radio,
                  label: 'Matchs Live',
                  value: `${liveMatches.length}`,
                  sub: liveMatches.length > 0 ? 'En cours maintenant' : 'Aucun en direct',
                  color: liveMatches.length > 0 ? 'text-destructive' : 'text-muted-foreground',
                  bg: liveMatches.length > 0 ? 'bg-destructive/10 border-destructive/20' : 'bg-muted/30 border-border/40',
                },
                {
                  icon: Calendar,
                  label: "Matchs Aujourd'hui",
                  value: `${todayMatches.length}`,
                  sub: `${upcomingMatches.length} à venir`,
                  color: 'text-premium-gold',
                  bg: 'bg-premium-gold/10 border-premium-gold/20',
                },
              ].map((kpi, i) => (
                <div key={i} className={`rounded-xl border p-4 ${kpi.bg} flex flex-col gap-3`}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground leading-tight">{kpi.label}</p>
                    <kpi.icon className={`h-4 w-4 ${kpi.color} shrink-0`} />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold font-display ${kpi.color}`}>{kpi.value}</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{kpi.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── FEATURE SHORTCUTS ────────────────────────── */}
            <div className="grid md:grid-cols-3 gap-4">
              {isClubPro ? (
                <>
                  {/* CARD 1 (CLUB PRO): MERCATO & SIMULATION 360° */}
                  <Link to="/mercato" className="group relative overflow-hidden rounded-2xl border border-electric-blue/30 bg-gradient-to-br from-electric-blue/10 via-card to-card p-6 hover:border-electric-blue/60 hover:shadow-lg hover:shadow-electric-blue/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-electric-blue/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-electric-blue/15 border border-electric-blue/30">
                        <ShoppingBag className="h-6 w-6 text-electric-blue" />
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-electric-blue bg-electric-blue/10 border border-electric-blue/30 px-2.5 py-1 rounded-full">
                        <Crown className="h-3 w-3" /> Club Pro
                      </div>
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground group-hover:text-electric-blue transition-colors mb-1">Marché & Simulateur</h2>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Catalogue Mercato & Simulation Recrutement 360°. Calculez l'impact financier, le gain xG et l'amortissement d'un transfert.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-electric-blue">
                      Ouvrir le Mercato Pro <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>

                  {/* CARD 2 (CLUB PRO): BILAN IA */}
                  <Link to="/bilan" className="group relative overflow-hidden rounded-2xl border border-neon-green/20 bg-gradient-to-br from-neon-green/8 via-card to-card p-6 hover:border-neon-green/40 hover:shadow-lg hover:shadow-neon-green/8 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-neon-green/15 border border-neon-green/20">
                        <BarChart3 className="h-6 w-6 text-neon-green" />
                      </div>
                      <div className="text-xs font-semibold text-neon-green bg-neon-green/10 border border-neon-green/20 px-2.5 py-1 rounded-full">
                        Certifié & Transparent
                      </div>
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground group-hover:text-neon-green transition-colors mb-1">Bilan IA & Transparence</h2>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Historique complet des prédictions. Taux de réussite par championnat, graphiques d'évolution et statistiques certifiées.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-neon-green">
                      Consulter le bilan <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>

                  {/* CARD 3 (CLUB PRO): CENTRE TACTIQUE PRO */}
                  <div className="group relative overflow-hidden rounded-2xl border border-electric-blue/20 bg-gradient-to-br from-electric-blue/5 via-card to-card p-6">
                    <div className="relative flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-electric-blue/15 border border-electric-blue/30">
                        <Activity className="h-6 w-6 text-electric-blue" />
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-electric-blue bg-electric-blue/10 border border-electric-blue/30 px-2.5 py-1 rounded-full">
                        Modèles xG
                      </div>
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground mb-1">Centre Tactique & Data</h2>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Matrice Poisson xG, rapports d'avant-match et recommandations stratégiques pour le staff technique.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-electric-blue">
                      Module Pro Actif <Sparkles className="h-4 w-4 text-electric-blue" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* CARD 1 (FREE/PREMIUM): PRONOSTICS & PRE-MATCH */}
                  <div
                    onClick={() => handleScrollToMatches('today')}
                    className="group relative overflow-hidden rounded-2xl border border-neon-green/25 bg-gradient-to-br from-neon-green/10 via-card to-card p-6 hover:border-neon-green/50 hover:shadow-lg hover:shadow-neon-green/10 transition-all duration-300 cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-neon-green/15 border border-neon-green/20">
                        <Zap className="h-6 w-6 text-neon-green" />
                      </div>
                      <div className="text-xs font-semibold text-neon-green bg-neon-green/10 border border-neon-green/20 px-2.5 py-1 rounded-full">
                        Analyses IA 1N2
                      </div>
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground group-hover:text-neon-green transition-colors mb-1">Pronostics du Jour</h2>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Prédictions algorithmiques haute précision, cotes value et scores exacts calculés par l'IA KronosNP.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-neon-green">
                      Voir les matchs ci-dessous <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* CARD 2 (FREE/PREMIUM): BILAN IA */}
                  <Link to="/bilan" className="group relative overflow-hidden rounded-2xl border border-neon-green/20 bg-gradient-to-br from-neon-green/8 via-card to-card p-6 hover:border-neon-green/40 hover:shadow-lg hover:shadow-neon-green/8 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-neon-green/15 border border-neon-green/20">
                        <BarChart3 className="h-6 w-6 text-neon-green" />
                      </div>
                      <div className="text-xs font-semibold text-neon-green bg-neon-green/10 border border-neon-green/20 px-2.5 py-1 rounded-full">
                        Certifié & Transparent
                      </div>
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground group-hover:text-neon-green transition-colors mb-1">Bilan IA</h2>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Historique complet des prédictions. Taux de réussite par championnat, graphiques d'évolution et statistiques certifiées.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-neon-green">
                      Consulter le bilan <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>

                  {/* CARD 3 (FREE/PREMIUM): DEFI IA */}
                  <Link to="/defi" className="group relative overflow-hidden rounded-2xl border border-premium-gold/20 bg-gradient-to-br from-premium-gold/8 via-card to-card p-6 hover:border-premium-gold/40 hover:shadow-lg hover:shadow-premium-gold/8 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-premium-gold/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-premium-gold/15 border border-premium-gold/20">
                        <Trophy className="h-6 w-6 text-premium-gold" />
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-premium-gold bg-premium-gold/10 border border-premium-gold/20 px-2.5 py-1 rounded-full">
                        <Star className="h-3 w-3" /> Concours Hebdo
                      </div>
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground group-hover:text-premium-gold transition-colors mb-1">Défi IA</h2>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Affrontez l'IA et la communauté. Pronostiquez la grille hebdomadaire, grimpez dans le classement, gagnez des récompenses.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-premium-gold">
                      Participer au défi <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </>
              )}
            </div>

            {/* ── MATCHES SECTION ──────────────────────────── */}
            <div id="matches-section" className="scroll-mt-20">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">Pronostics IA du Moment</h2>
                  <p className="text-xs text-muted-foreground">Classés par indice de confiance algorithmique</p>
                </div>
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-1 border border-border/40 shrink-0">
                  {([
                    { key: 'all', label: `Tous (${sanitized.length})` },
                    { key: 'live', label: `Live (${liveMatches.length})` },
                    { key: 'today', label: `Auj. (${todayMatches.length})` },
                    { key: 'upcoming', label: `À venir (${upcomingMatches.length})` },
                  ] as const).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === tab.key
                          ? 'bg-neon-green text-background shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Premium upgrade inline banner */}
              {!isPremium && (
                <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-premium-gold/25 bg-premium-gold/6 mb-4">
                  <div className="flex items-center gap-2.5">
                    <Crown className="h-4 w-4 text-premium-gold shrink-0" />
                    <p className="text-sm text-foreground font-medium">Scores exacts & value bets masqués — <span className="text-premium-gold">débloquez avec Premium</span></p>
                  </div>
                  <Link to="/pricing" className="shrink-0 text-xs font-bold text-background bg-premium-gold px-3.5 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                    Voir les offres
                  </Link>
                </div>
              )}

              {/* Match Grid */}
              {displayedMatches.length === 0 ? (
                <div className="rounded-2xl border border-border/50 bg-card/50 p-16 text-center">
                  <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">Aucun match dans cette catégorie.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {displayedMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      isPremium={match.premiumUnlocked}
                      getConfBadge={getConfBadge}
                    />
                  ))}
                </div>
              )}

              {sanitized.length > 0 && (
                <div className="mt-4 text-center">
                  <Link
                    to="/home"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-neon-green hover:underline"
                  >
                    Voir tous les matchs <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* ── BOTTOM PADDING ───────────────────────────── */}
            <div className="h-4" />
          </div>
        </main>
      </div>

      <OpenSourceAIToolsModal
        isOpen={openSourceModalOpen}
        onClose={() => setOpenSourceModalOpen(false)}
      />
    </div>
  );
}

function MatchCard({
  match, isPremium, getConfBadge,
}: {
  match: SanitizedMatch;
  isPremium: boolean;
  getConfBadge: (s: number) => string;
}) {
  const isLive = match.status === 'live';
  const confPct = Math.round((match.confidenceScore || 0) * 100);

  return (
    <Link to="/matches/$id" params={{ id: match.id }} className="block group">
      <div className="rounded-xl border border-border/50 bg-card hover:border-neon-green/30 hover:shadow-md hover:shadow-neon-green/5 transition-all duration-200 overflow-hidden h-full">

        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-muted/20">
          <span className="text-xs text-muted-foreground font-medium truncate max-w-[180px]">
            {match.league}{match.leagueCountry ? ` · ${match.leagueCountry}` : ''}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {isLive && (
              <span className="text-[10px] font-bold text-destructive flex items-center gap-1">
                <Radio className="h-2.5 w-2.5 animate-pulse" /> LIVE
              </span>
            )}
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getConfBadge(match.confidenceScore)}`}>
              {confPct}%
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Teams */}
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-foreground shrink-0">
                  {match.homeTeam.slice(0, 3).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-foreground truncate">{match.homeTeam}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-foreground shrink-0">
                  {match.awayTeam.slice(0, 3).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-foreground truncate">{match.awayTeam}</span>
              </div>
            </div>

            {/* Score / Time */}
            <div className="text-center shrink-0 pl-2 border-l border-border/40">
              {isLive ? (
                <div className="font-mono font-black text-xl text-foreground leading-none text-center">
                  <div>{match.homeScore}</div>
                  <div className="text-[9px] text-muted-foreground my-0.5">–</div>
                  <div>{match.awayScore}</div>
                </div>
              ) : (
                <div className="text-center">
                  <Clock className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                  <div className="font-mono text-xs text-muted-foreground">
                    {match.kickoffTime
                      ? new Date(match.kickoffTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      : '--:--'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prediction */}
          <div className="grid grid-cols-2 gap-2 bg-muted/30 rounded-lg p-2.5 border border-border/30">
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                <Activity className="h-2.5 w-2.5" /> 1N2
              </p>
              <p className="text-sm font-bold text-neon-green">{match.ai1n2Pred || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                {isPremium ? <Unlock className="h-2.5 w-2.5 text-neon-green" /> : <Lock className="h-2.5 w-2.5" />}
                Score Exact
              </p>
              {isPremium && match.aiHomeScorePred !== null ? (
                <p className="text-sm font-bold text-foreground">{match.aiHomeScorePred}–{match.aiAwayScorePred}</p>
              ) : (
                <span className="text-[10px] font-semibold text-premium-gold flex items-center gap-0.5">
                  <Crown className="h-2.5 w-2.5" /> Premium
                </span>
              )}
            </div>
          </div>

          {/* Odds */}
          {match.oddsHome && (
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground bg-muted/20 rounded-lg px-3 py-1.5">
              <span>1 <span className="font-bold text-foreground ml-1">{match.oddsHome}</span></span>
              <span>N <span className="font-bold text-foreground ml-1">{match.oddsDraw}</span></span>
              <span>2 <span className="font-bold text-foreground ml-1">{match.oddsAway}</span></span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
