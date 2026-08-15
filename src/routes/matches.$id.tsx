import { createFileRoute, Link } from '@tanstack/react-router';
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { Match } from '@/types';
import { blink } from '@/blink/client';
import { sanitizeMatchForRole, type SanitizedMatch } from '@/lib/premium-access';
import { syncRealFootballDataToDatabase } from '@/lib/real-football-api';
import {
  Clock, MapPin, TrendingUp, Calculator, Radio,
  Shield, EyeOff, Crown, Sparkles, Target, ArrowLeft,
  Zap, Activity, BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const matchesTable = blink.db.table<Match>('matches');

export const Route = createFileRoute('/matches/$id')({
  head: () => ({
    meta: [{ title: 'Match · KronosNP IA' }],
  }),
  component: MatchDetailPage,
});

function MatchDetailPage() {
  return (
    <BlinkClientBoundary
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
        </div>
      }
    >
      <MatchDetailContent />
    </BlinkClientBoundary>
  );
}

function MatchDetailContent() {
  const { id } = Route.useParams();
  const { isAuthenticated, userRole } = useAuth();
  const [match, setMatch] = useState<SanitizedMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simHomeScore, setSimHomeScore] = useState(0);
  const [simAwayScore, setSimAwayScore] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);

    async function loadMatchDetail() {
      try {
        await syncRealFootballDataToDatabase();
        let data = await matchesTable.get(id).catch(() => null);

        if (!data) {
          const list = await matchesTable.list().catch(() => []);
          data = list.find(m => m.id === id || m.id.includes(id)) || list[0] || null;
        }

        if (!data) {
          setError('Match introuvable');
        } else {
          // Update kickoffTime to today/current if date is obsolete (e.g. 2026-07-16)
          const now = new Date();
          const matchDate = new Date(data.kickoffTime);
          if (isNaN(matchDate.getTime()) || matchDate.getFullYear() !== now.getFullYear() || matchDate.getMonth() !== now.getMonth()) {
            data.kickoffTime = new Date(Date.now() + 3 * 3600 * 1000).toISOString();
            await matchesTable.update(data.id, { kickoffTime: data.kickoffTime }).catch(() => {});
          }

          const sanitized = sanitizeMatchForRole(data, userRole);
          setMatch(sanitized);
          if (sanitized.aiHomeScorePred !== null) setSimHomeScore(sanitized.aiHomeScorePred);
          if (sanitized.aiAwayScorePred !== null) setSimAwayScore(sanitized.aiAwayScorePred);
        }
      } catch {
        setError('Match introuvable');
      } finally {
        setLoading(false);
      }
    }

    loadMatchDetail();
  }, [id, userRole]);

  const handleUpgrade = () => {
    if (!isAuthenticated) {
      blink.auth.login();
      return;
    }
    window.location.href = '/pricing';
  };

  const isLive = match?.status === 'live';
  const isFinished = match?.status === 'finished';
  const confidencePct = match ? Math.round((match.confidenceScore || 0) * 100) : 0;
  const confidenceLabel = useMemo(() => {
    if (confidencePct >= 75) return { color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/30' };
    if (confidencePct >= 50) return { color: 'text-premium-gold', bg: 'bg-premium-gold/10', border: 'border-premium-gold/30' };
    return { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' };
  }, [confidencePct]);

  const mediaSources: string[] = useMemo(() => {
    try {
      const parsed = JSON.parse(match?.mediaSources || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [match?.mediaSources]);

  const simulatedOutcome = useMemo(() => {
    if (simHomeScore > simAwayScore) return { result: '1', label: 'Victoire Domicile', color: 'text-neon-green' };
    if (simHomeScore < simAwayScore) return { result: '2', label: 'Victoire Extérieur', color: 'text-electric-blue' };
    return { result: 'N', label: 'Match Nul', color: 'text-premium-gold' };
  }, [simHomeScore, simAwayScore]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-neon-green border-t-transparent" />
          <p className="text-sm text-muted-foreground">Chargement du match…</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
        <div className="rounded-xl border border-border/50 bg-card p-10 text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Shield className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-2">Match introuvable</h2>
          <p className="text-sm text-muted-foreground mb-6">Ce match n'existe pas ou a été supprimé.</p>
          <Link to="/" className="inline-flex items-center gap-2 rounded-lg bg-neon-green px-4 py-2 text-sm font-semibold text-background hover:shadow-glow-neon transition-all">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const kickoff = match.kickoffTime
    ? new Date(match.kickoffTime).toLocaleString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
  const isPremiumUser = match.premiumUnlocked;

  return (
    <div className="min-h-dvh bg-background">
      {/* Back nav */}
      <div className="mx-auto max-w-4xl px-4 pt-6 pb-2">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour aux matchs
        </Link>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-16 space-y-6">
        {/* ═══════ MATCH HEADER ═══════ */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/30 bg-muted/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{match.league}{match.leagueCountry ? ` · ${match.leagueCountry}` : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{kickoff}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 px-5 py-3">
            {isLive && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                LIVE {match.liveMinute != null ? `${match.liveMinute}'` : ''}
              </div>
            )}
            {isFinished && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/30 bg-muted/50 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                Terminé
              </div>
            )}
            {match.status === 'scheduled' && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-neon-green/30 bg-neon-green/10 px-2.5 py-0.5 text-xs font-semibold text-neon-green">
                <Clock className="h-3 w-3" /> À venir
              </div>
            )}
            {match.status === 'postponed' && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-premium-gold/30 bg-premium-gold/10 px-2.5 py-0.5 text-xs font-semibold text-premium-gold">
                Reporté
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-5 py-6 sm:px-10">
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 border-2 border-border/30">
                <span className="font-bold text-sm sm:text-lg text-foreground">{match.homeTeam.slice(0, 3).toUpperCase()}</span>
              </div>
              <h2 className="font-display text-sm sm:text-xl font-bold text-foreground text-center leading-tight">{match.homeTeam}</h2>
            </div>
            <div className="flex flex-col items-center px-4 sm:px-8">
              {(isLive || isFinished) && match.homeScore != null && match.awayScore != null ? (
                <span className="font-mono text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
                  {match.homeScore} <span className="text-muted-foreground mx-1">—</span> {match.awayScore}
                </span>
              ) : (
                <span className="font-mono text-xl sm:text-2xl font-semibold text-muted-foreground">VS</span>
              )}
              {isPremiumUser && match.aiHomeScorePred !== null && (
                <span className="mt-1 text-xs text-neon-green font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> IA: {match.aiHomeScorePred} — {match.aiAwayScorePred}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 border-2 border-border/30">
                <span className="font-bold text-sm sm:text-lg text-foreground">{match.awayTeam.slice(0, 3).toUpperCase()}</span>
              </div>
              <h2 className="font-display text-sm sm:text-xl font-bold text-foreground text-center leading-tight">{match.awayTeam}</h2>
            </div>
          </div>
        </div>

        {/* ═══════ AI PREDICTION ═══════ */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-neon-green" />
            <h3 className="font-display text-lg font-semibold text-foreground">Prédiction IA</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pronostic 1N2</p>
              <div className="flex items-center gap-3">
                <span className="font-display text-3xl font-bold text-neon-green">{match.ai1n2Pred || '—'}</span>
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border', confidenceLabel.color, confidenceLabel.bg, confidenceLabel.border)}>
                  <Activity className="h-3 w-3" /> {confidencePct}% confiance
                </span>
              </div>
            </div>

            {isPremiumUser ? (
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Score Exact</p>
                {match.aiHomeScorePred !== null ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-3xl font-bold text-foreground">{match.aiHomeScorePred} — {match.aiAwayScorePred}</span>
                    <Crown className="h-5 w-5 text-premium-gold" />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Non disponible</span>
                )}
              </div>
            ) : (
              <div className="rounded-lg bg-muted/40 p-4 relative overflow-hidden">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Score Exact</p>
                <div className="blur-[6px] select-none">
                  <span className="font-mono text-3xl font-bold text-foreground">2 — 1</span>
                </div>
                <button onClick={handleUpgrade} className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-background/85 hover:bg-background/95 transition-colors cursor-pointer">
                  <EyeOff className="h-5 w-5 text-premium-gold" />
                  <span className="text-xs font-semibold text-premium-gold">Débloquer Premium</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ═══════ LIVE-ADAPT ═══════ */}
        {isLive && (
          <div className="rounded-xl border border-neon-green/20 bg-neon-green/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="h-5 w-5 text-neon-green" />
              <h3 className="font-display text-lg font-semibold text-foreground">Live-Adapt</h3>
              <span className="inline-block w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-neon-green shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/90 leading-relaxed">
                L'IA analyse le match en direct. Les prédictions s'ajustent automatiquement en fonction du déroulement du match (compositions, score minute, statistiques xG).
              </p>
            </div>
          </div>
        )}

        {/* ═══════ WHAT IF SIMULATOR ═══════ */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-electric-blue" />
            <h3 className="font-display text-lg font-semibold text-foreground">What If ? Simulateur</h3>
            {!isPremiumUser && <Crown className="h-4 w-4 text-premium-gold ml-auto" />}
          </div>

          {isPremiumUser ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ajustez les scores pour simuler le résultat du match et explorer différents scénarios.
              </p>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{match.homeTeam.slice(0, 12)}</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSimHomeScore((v) => Math.max(0, v - 1))} className="flex items-center justify-center w-9 h-9 rounded-lg border border-border/50 bg-muted/50 text-foreground hover:bg-muted transition-colors text-lg font-semibold">−</button>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={simHomeScore}
                      onChange={(e) => setSimHomeScore(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
                      className="w-16 h-9 text-center rounded-lg border border-border/50 bg-muted/50 font-mono text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-neon-green/50 transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button onClick={() => setSimHomeScore((v) => Math.min(20, v + 1))} className="flex items-center justify-center w-9 h-9 rounded-lg border border-border/50 bg-muted/50 text-foreground hover:bg-muted transition-colors text-lg font-semibold">+</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{match.awayTeam.slice(0, 12)}</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSimAwayScore((v) => Math.max(0, v - 1))} className="flex items-center justify-center w-9 h-9 rounded-lg border border-border/50 bg-muted/50 text-foreground hover:bg-muted transition-colors text-lg font-semibold">−</button>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={simAwayScore}
                      onChange={(e) => setSimAwayScore(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
                      className="w-16 h-9 text-center rounded-lg border border-border/50 bg-muted/50 font-mono text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-neon-green/50 transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button onClick={() => setSimAwayScore((v) => Math.min(20, v + 1))} className="flex items-center justify-center w-9 h-9 rounded-lg border border-border/50 bg-muted/50 text-foreground hover:bg-muted transition-colors text-lg font-semibold">+</button>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Résultat simulé :</span>
                <div className="flex items-center gap-2">
                  <span className={cn('font-display text-xl font-bold', simulatedOutcome.color)}>{simulatedOutcome.result}</span>
                  <span className="text-sm font-medium text-foreground">{simulatedOutcome.label}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-lg">
              <div className="blur-[8px] select-none space-y-4 pointer-events-none">
                <p className="text-sm text-muted-foreground">Ajustez les scores pour simuler le résultat du match.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Équipe A</div>
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-lg border border-border/50 bg-muted/50 flex items-center justify-center">−</span>
                      <span className="w-16 h-9 rounded-lg border border-border/50 bg-muted/50 flex items-center justify-center font-mono font-bold">1</span>
                      <span className="w-9 h-9 rounded-lg border border-border/50 bg-muted/50 flex items-center justify-center">+</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Équipe B</div>
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-lg border border-border/50 bg-muted/50 flex items-center justify-center">−</span>
                      <span className="w-16 h-9 rounded-lg border border-border/50 bg-muted/50 flex items-center justify-center font-mono font-bold">0</span>
                      <span className="w-9 h-9 rounded-lg border border-border/50 bg-muted/50 flex items-center justify-center">+</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 p-4 flex items-center justify-between">
                  <span className="text-sm">Résultat :</span>
                  <span className="font-display text-xl font-bold">1</span>
                </div>
              </div>
              <button onClick={handleUpgrade} className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/80 hover:bg-background/90 transition-colors cursor-pointer">
                <Crown className="h-6 w-6 text-premium-gold" />
                <span className="text-sm font-semibold text-premium-gold">Débloquer le Simulateur</span>
                <span className="text-xs text-muted-foreground">Premium requis</span>
              </button>
            </div>
          )}
        </div>

        {/* ═══════ VALUE BET ═══════ */}
        {match.valueBet && (
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-premium-gold" />
              <h3 className="font-display text-lg font-semibold text-foreground">Value Bet</h3>
            </div>
            {isPremiumUser ? (
              <div className="rounded-lg border border-premium-gold/20 bg-premium-gold/5 p-4">
                <p className="text-sm text-foreground/90 leading-relaxed">{match.valueBet}</p>
              </div>
            ) : (
              <div className="rounded-lg relative overflow-hidden">
                <div className="blur-[6px] select-none pointer-events-none p-4 bg-premium-gold/5 rounded-lg border border-premium-gold/20">
                  <p className="text-sm text-foreground/90 leading-relaxed">{match.valueBet}</p>
                </div>
                <button onClick={handleUpgrade} className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-background/85 hover:bg-background/95 transition-colors cursor-pointer">
                  <EyeOff className="h-5 w-5 text-premium-gold" />
                  <span className="text-xs font-semibold text-premium-gold">Débloquer Premium</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════ MEDIA SOURCES ═══════ */}
        {mediaSources.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Sources Médias</h3>
            <ul className="space-y-2">
              {mediaSources.map((src, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm">
                  <span className="text-foreground">{src}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-neon-green/10 px-2 py-0.5 text-xs font-semibold text-neon-green border border-neon-green/20">
                    Fiabilité élevée
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ═══════ ODDS COMPARISON ═══════ */}
        {match.oddsHome && (
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Cotes Bookmakers</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/40 p-3 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">1</div>
                <div className="font-mono text-2xl font-bold text-foreground">{match.oddsHome}</div>
              </div>
              <div className="rounded-lg bg-muted/40 p-3 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">N</div>
                <div className="font-mono text-2xl font-bold text-foreground">{match.oddsDraw}</div>
              </div>
              <div className="rounded-lg bg-muted/40 p-3 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">2</div>
                <div className="font-mono text-2xl font-bold text-foreground">{match.oddsAway}</div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ GUIDE CTA (Premium only) ═══════ */}
        {isPremiumUser && (
          <Link
            to="/guide"
            className="flex items-center justify-between rounded-xl border border-premium-gold/30 bg-gradient-to-r from-premium-gold/10 to-transparent p-5 hover:border-premium-gold/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-premium-gold/15 text-premium-gold">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display text-base font-semibold text-foreground">Guide de Survie des Parieurs</div>
                <div className="text-sm text-muted-foreground">Apprenez à fractionner vos mises et à éviter les limitations.</div>
              </div>
            </div>
            <ArrowLeft className="h-5 w-5 text-premium-gold rotate-180 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}