import { createFileRoute, Link } from '@tanstack/react-router';
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGeoPricing, formatPrice } from '@/hooks/useGeoPricing';
import { blink } from '@/blink/client';
import type { Currency, SubscriptionPlan } from '@/types';
import { ArrowLeft, Check, Crown, ShieldCheck, Sparkles, Wallet, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/pricing')({
  head: () => ({
    meta: [
      { title: 'Tarifs Premium · KronosNP IA' },
      { name: 'description', content: 'Abonnement KronosNP IA : scores exacts, simulateur What If, value bets et guide anti-limitation. Paiement Orange Money, MTN MoMo, Stripe.' },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <BlinkClientBoundary
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
        </div>
      }
    >
      <PricingContent />
    </BlinkClientBoundary>
  );
}

interface PlanInfo {
  id: SubscriptionPlan;
  label: string;
  savings?: string;
}

const PLANS: PlanInfo[] = [
  { id: 'weekly', label: 'Hebdomadaire' },
  { id: 'monthly', label: 'Mensuel', savings: 'Économisez 25%' },
  { id: 'quarterly', label: 'Trimestriel', savings: 'Économisez 45%' },
];

function PricingContent() {
  const { user, isAuthenticated, isPremium, userRole, setDevRole } = useAuth();
  const { pricing, clubProPricing, isLoading: geoLoading, refresh } = useGeoPricing();
  const [offerCategory, setOfferCategory] = useState<'utilisateur' | 'club_pro'>('utilisateur');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  // Automatically select the plan category reflecting the user's role
  useEffect(() => {
    if (userRole === 'club_pro') {
      setOfferCategory('club_pro');
    } else if (userRole === 'user_free' || userRole === 'user_premium') {
      setOfferCategory('utilisateur');
    }
  }, [userRole]);

  const activePricing = offerCategory === 'club_pro' ? clubProPricing : pricing;

  useEffect(() => {
    // Default payment: prefer local methods for XOF zone
    if (activePricing.paymentMethods.includes('orange_money')) {
      setSelectedPayment('orange_money');
    } else {
      setSelectedPayment('stripe');
    }
  }, [activePricing.paymentMethods]);

  const handleSubscribe = async () => {
    setProcessing(true);

    try {
      const plan = activePricing.plans[selectedPlan];

      if (selectedPayment === 'stripe') {
        const redirectUrl = `https://buy.stripe.com/kronosnp-demo?plan=${selectedPlan}&category=${offerCategory}&currency=${activePricing.currency}`;
        window.open(redirectUrl, '_blank');
        toast.success(`Redirection vers Stripe Checkout ${offerCategory === 'club_pro' ? 'Club Pro' : 'Premium'}…`);
      } else if (selectedPayment === 'orange_money') {
        toast.info(`Initialisation Orange Money (${formatPrice(plan.price, activePricing.currency)})…`);
      } else if (selectedPayment === 'mtn_momo') {
        toast.info(`Initialisation MTN MoMo (${formatPrice(plan.price, activePricing.currency)})…`);
      }

      const targetRole = offerCategory === 'club_pro' ? 'club_pro' : 'user_premium';
      const expiresAt = new Date(Date.now() + (selectedPlan === 'weekly' ? 7 : selectedPlan === 'monthly' ? 30 : 90) * 24 * 3600 * 1000).toISOString();

      // Resolve exact target userId (usr_xtOfy59SX5la for Club Pro)
      let targetUserId = user?.id || 'usr_xtOfy59SX5la';
      if (offerCategory === 'club_pro') {
        const clubProRoles = await blink.db.table('user_roles').list({ where: { role: 'club_pro' }, limit: 1 }).catch(() => []);
        if (clubProRoles.length > 0) {
          targetUserId = clubProRoles[0].userId;
        } else {
          targetUserId = 'usr_xtOfy59SX5la';
        }
      }

      // 1. Create subscription record in database under targetUserId
      await blink.db.table('subscriptions').create({
        userId: targetUserId,
        plan: selectedPlan,
        currency: activePricing.currency,
        amount: plan.price,
        status: 'active',
        paymentMethod: selectedPayment,
        startsAt: new Date().toISOString(),
        expiresAt: expiresAt,
      }).catch(() => {});

      // 2. Sync user_roles table in database so targetUserId has role club_pro!
      const userRolesTable = blink.db.table('user_roles');
      const existingRoles = await userRolesTable.list({ where: { userId: targetUserId }, limit: 1 }).catch(() => []);
      if (existingRoles.length > 0) {
        await userRolesTable.update(existingRoles[0].id, {
          role: targetRole,
          premiumExpiresAt: expiresAt,
          premiumPlan: selectedPlan,
        }).catch(() => {});
      } else {
        await userRolesTable.create({
          userId: targetUserId,
          role: targetRole,
          premiumExpiresAt: expiresAt,
          premiumPlan: selectedPlan,
        }).catch(() => {});
      }

      setDevRole(targetRole);

      // Save user preference
      const prefStr = localStorage.getItem('kronos_user_pref');
      let prefData = {};
      if (prefStr) { try { prefData = JSON.parse(prefStr); } catch {} }
      localStorage.setItem('kronos_user_pref', JSON.stringify({
        ...prefData,
        accountType: targetRole,
        subscribedAt: new Date().toISOString(),
      }));

      if (offerCategory === 'club_pro') {
        toast.success('🎉 Félicitations ! Votre abonnement Club Pro est enregistré et activé !');
      } else {
        toast.success('🎉 Félicitations ! Votre abonnement Utilisateur Premium est activé.');
      }
    } catch (e: any) {
      toast.error('Erreur : ' + (e?.message || 'inconnue'));
    } finally {
      setProcessing(false);
    }
  };

  if (geoLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* NAV */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 h-16">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-neon-green" />
            <span className="font-display text-xl font-bold text-foreground">KronosNP<span className="text-neon-green"> IA</span></span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-premium-gold/30 bg-premium-gold/10 px-3 py-1 text-xs font-medium text-premium-gold mb-4">
            <Crown className="h-3.5 w-3.5" /> Abonnements & Formules
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-3">
            Débloquez la puissance <span className="text-neon-green">KronosNP IA</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Sélectionnez la formule adaptée à vos besoins : Utilisateur Premium ou Club Pro. Tarifs géolocalisés ({activePricing.country}).
          </p>
        </div>

        {/* OFFER CATEGORY HEADER / TOGGLE */}
        <div className="flex justify-center mb-8">
          {userRole === 'club_pro' ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-electric-blue/15 border border-electric-blue/40 text-electric-blue shadow-lg">
              <Crown className="h-5 w-5 text-electric-blue" />
              <span className="font-bold text-sm sm:text-base">Fiche d'Abonnement : Formule Club Pro (Staff & Mercato 360°)</span>
            </div>
          ) : userRole === 'user_premium' ? (
            <div className="inline-flex p-1.5 rounded-2xl bg-card border border-border/60 shadow-lg">
              <button
                onClick={() => setOfferCategory('utilisateur')}
                className={cn(
                  'px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer',
                  offerCategory === 'utilisateur'
                    ? 'bg-neon-green text-background shadow-glow-neon'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                👤 Formule Utilisateur Premium
              </button>
              <button
                onClick={() => setOfferCategory('club_pro')}
                className={cn(
                  'px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer',
                  offerCategory === 'club_pro'
                    ? 'bg-electric-blue text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                ⚡ Évoluer vers Club Pro
              </button>
            </div>
          ) : (
            <div className="inline-flex p-1.5 rounded-2xl bg-card border border-border/60 shadow-lg">
              <button
                onClick={() => setOfferCategory('utilisateur')}
                className={cn(
                  'px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer',
                  offerCategory === 'utilisateur'
                    ? 'bg-neon-green text-background shadow-glow-neon'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                👤 Formule Utilisateur Premium
              </button>
              <button
                onClick={() => setOfferCategory('club_pro')}
                className={cn(
                  'px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer',
                  offerCategory === 'club_pro'
                    ? 'bg-electric-blue text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                ⚽ Formule Club Pro (Staff & Mercato)
              </button>
            </div>
          )}
        </div>

        {/* ZONE OVERRIDE */}
        <div className="flex justify-center mb-8">
          <button onClick={refresh} className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-card transition-colors">
            <span className="inline-block w-2 h-2 rounded-full bg-neon-green" /> Zone détectée : {activePricing.country} ({activePricing.symbol}) — Cliquez pour changer
          </button>
        </div>

        {/* PLANS */}
        <div className="grid gap-4 sm:grid-cols-3 mb-12">
          {PLANS.map(({ id, label, savings }) => {
            const info = activePricing.plans[id];
            const selected = selectedPlan === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedPlan(id)}
                className={cn(
                  'relative rounded-2xl border p-6 text-left transition-all cursor-pointer',
                  selected
                    ? offerCategory === 'club_pro'
                      ? 'border-electric-blue bg-card shadow-lg ring-2 ring-electric-blue/50'
                      : 'border-neon-green bg-card shadow-glow-neon'
                    : 'border-border/50 bg-card/50 hover:border-border',
                )}
              >
                {savings && (
                  <div className="absolute -top-2 right-4 rounded-full bg-premium-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">
                    {savings}
                  </div>
                )}
                <div className="text-sm font-medium text-muted-foreground">{label}</div>
                <div className="mt-2 font-display text-3xl font-bold text-foreground">{formatPrice(info.price, activePricing.currency)}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {id === 'weekly' && 'Renouvellement chaque semaine'}
                  {id === 'monthly' && 'Renouvellement chaque mois'}
                  {id === 'quarterly' && 'Renouvellement chaque trimestre'}
                </div>
                {selected && (
                  <div className={cn(
                    'absolute top-3 right-3 inline-flex items-center justify-center w-6 h-6 rounded-full text-background',
                    offerCategory === 'club_pro' ? 'bg-electric-blue text-white' : 'bg-neon-green'
                  )}>
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* INCLUDED */}
        <div className="rounded-2xl border border-border/50 bg-card/30 p-6 mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            {offerCategory === 'club_pro' ? 'Inclus dans la formule Club Pro :' : 'Inclus dans la formule Utilisateur Premium :'}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(offerCategory === 'club_pro'
              ? [
                  'Accès complet au Catalogue Mercato 360°',
                  'Simulateur d\'impact tactique & financier sur effectif',
                  'Moteur Cognitif IA 6-Piliers illimité',
                  'Outils Open Source Staff (StatsBomb, Kloppy, SoccerData)',
                  'Analyse de risque blessure & compatibilité vestiaire',
                  'Exportation des rapports de simulation en PDF',
                  'Support pro dédié et accès direct à la roadmap IA',
                ]
              : [
                  'Scores exacts débloqués sur tous les matchs',
                  'Simulateur What If interactif',
                  'Comparaison Value Bet vs cotes bookmakers',
                  'Mode Live-Adapt pour les matchs en direct',
                  'Analyses IA illimitées (aucun Rate Limit 1/semaine)',
                  'Guide de Survie des Parieurs (anti-limitation)',
                  'Support prioritaire',
                ]
            ).map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm">
                <Check className={cn("h-4 w-4 shrink-0 mt-0.5", offerCategory === 'club_pro' ? "text-electric-blue" : "text-neon-green")} />
                <span className="text-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PAYMENT METHODS */}
        <div className="rounded-2xl border border-border/50 bg-card/30 p-6 mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Méthode de paiement</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {activePricing.paymentMethods.includes('orange_money') && (
              <button
                onClick={() => setSelectedPayment('orange_money')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all cursor-pointer',
                  selectedPayment === 'orange_money' ? 'border-premium-gold bg-premium-gold/10' : 'border-border/50 bg-card hover:border-border',
                )}
              >
                <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg">OM</div>
                <div className="text-sm font-semibold text-foreground">Orange Money</div>
                <div className="text-xs text-muted-foreground">Zone CFA</div>
              </button>
            )}
            {activePricing.paymentMethods.includes('mtn_momo') && (
              <button
                onClick={() => setSelectedPayment('mtn_momo')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all cursor-pointer',
                  selectedPayment === 'mtn_momo' ? 'border-premium-gold bg-premium-gold/10' : 'border-border/50 bg-card hover:border-border',
                )}
              >
                <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-lg">MTN</div>
                <div className="text-sm font-semibold text-foreground">MTN MoMo</div>
                <div className="text-xs text-muted-foreground">Zone CFA</div>
              </button>
            )}
            {activePricing.paymentMethods.includes('stripe') && (
              <button
                onClick={() => setSelectedPayment('stripe')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all cursor-pointer',
                  selectedPayment === 'stripe' ? 'border-premium-gold bg-premium-gold/10' : 'border-border/50 bg-card hover:border-border',
                )}
              >
                <div className="h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center text-electric-blue">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold text-foreground">Carte bancaire</div>
                <div className="text-xs text-muted-foreground">Stripe · 3D Secure</div>
              </button>
            )}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleSubscribe}
          disabled={processing}
          className={cn(
            "w-full rounded-2xl px-6 py-4 font-display text-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99]",
            offerCategory === 'club_pro'
              ? "bg-electric-blue text-white hover:bg-electric-blue/90 shadow-electric-blue/20"
              : "bg-neon-green text-background hover:shadow-glow-neon"
          )}
        >
          {processing ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Traitement en cours…</>
          ) : (
            <>
              <Wallet className="h-5 w-5" />
              <span>
                {(offerCategory === 'club_pro' && userRole === 'club_pro')
                  ? `Renouveler / Changer l'abonnement Club Pro (${PLANS.find(p => p.id === selectedPlan)?.label}) · ${formatPrice(activePricing.plans[selectedPlan].price, activePricing.currency)}`
                  : (offerCategory === 'utilisateur' && userRole === 'user_premium')
                  ? `Renouveler l'abonnement Premium (${PLANS.find(p => p.id === selectedPlan)?.label}) · ${formatPrice(activePricing.plans[selectedPlan].price, activePricing.currency)}`
                  : `S'abonner ${offerCategory === 'club_pro' ? 'Club Pro' : 'Premium'} (${PLANS.find(p => p.id === selectedPlan)?.label}) · ${formatPrice(activePricing.plans[selectedPlan].price, activePricing.currency)}`}
              </span>
            </>
          )}
        </button>

        {/* SECURITY */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-neon-green" />
          Paiement 100% sécurisé · Aucune donnée bancaire stockée sur nos serveurs · Conforme PCI DSS
        </div>
      </div>
    </div>
  );
}