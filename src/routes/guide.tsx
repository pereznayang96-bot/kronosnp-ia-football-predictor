import { createFileRoute, Link } from '@tanstack/react-router';
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { blink } from '@/blink/client';
import type { ParieurGuideSection } from '@/types';
import { ArrowLeft, BookOpen, ShieldAlert, Crown, Lock, Lightbulb, TrendingUp, Wallet, AlertTriangle } from 'lucide-react';

export const Route = createFileRoute('/guide')({
  head: () => ({
    meta: [
      { title: 'Guide de Survie · KronosNP IA' },
      { name: 'description', content: 'Apprenez à fractionner vos mises sur plusieurs plateformes et à préserver votre rentabilité. Guide complet anti-limitation bookmaker.' },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  return (
    <BlinkClientBoundary
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
        </div>
      }
    >
      <GuideContent />
    </BlinkClientBoundary>
  );
}

function GuideContent() {
  const { userRole, isLoading } = useAuth();
  const [sections, setSections] = useState<ParieurGuideSection[]>([]);
  const [loading, setLoading] = useState(true);

  const isPremium = userRole === 'user_premium' || userRole === 'club_pro' || userRole === 'super_admin';

  useEffect(() => {
    blink.db.table<ParieurGuideSection>('parieur_guide_sections').list({ orderBy: { sortOrder: 'asc' } })
      .then(setSections)
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 h-16">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-neon-green" />
            <span className="font-display text-xl font-bold text-foreground">Guide de Survie</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-premium-gold/30 bg-premium-gold/10 px-3 py-1 text-xs font-medium text-premium-gold mb-4">
            <Crown className="h-3.5 w-3.5" /> Réservé aux membres Premium
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Guide de Survie des <span className="text-premium-gold">Parieurs</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Apprenez à préserver votre rentabilité en fractionnant vos mises et en évitant les limitations des bookmakers.
          </p>
        </div>

        {/* PREMIUM GATE */}
        {!isPremium && (
          <div className="relative overflow-hidden rounded-2xl border border-premium-gold/30 bg-gradient-to-b from-premium-gold/10 to-transparent p-10 text-center mb-8">
            <div className="absolute inset-0 backdrop-blur-md bg-background/30 pointer-events-none" />
            <div className="relative">
              <Lock className="mx-auto h-12 w-12 text-premium-gold mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Contenu Premium</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Accédez à l'intégralité du guide de survie et apprenez les techniques utilisées par les parieurs professionnels pour rester rentable.
              </p>
              <Link to="/pricing" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold px-6 py-3 font-semibold text-background hover:shadow-glow-gold transition-all">
                <Crown className="h-4 w-4" /> Débloquer Premium
              </Link>
            </div>
          </div>
        )}

        {/* SECTIONS */}
        {isPremium && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
              </div>
            ) : sections.length === 0 ? (
              <div className="rounded-xl border border-border/50 bg-card p-8 text-center text-muted-foreground">
                Aucune section disponible pour le moment.
              </div>
            ) : (
              sections.map((section, idx) => (
                <div key={section.id} className="rounded-xl border border-border/50 bg-card overflow-hidden">
                  <div className="border-b border-border/30 bg-muted/30 px-5 py-3 flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green font-bold text-sm">
                      {idx + 1}
                    </span>
                    <h2 className="font-display text-lg font-semibold text-foreground">{section.title}</h2>
                  </div>
                  <div className="p-5 space-y-3 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
              ))
            )}

            {/* Tips card */}
            <div className="rounded-xl border border-electric-blue/30 bg-electric-blue/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-electric-blue" />
                <h3 className="font-display text-base font-semibold text-foreground">Conseil KronosNP</h3>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Fractionnez toujours vos mises et variez les plateformes. La discipline bat l'intuition : même avec une IA à 75% de réussite, une mauvaise gestion de bankroll peut vous ruiner. Suivez la règle 2-5-10% selon votre profil de risque.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}