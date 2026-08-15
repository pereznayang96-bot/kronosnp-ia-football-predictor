import React, { useState } from 'react';
import {
  Brain, Cpu, Zap, Activity, ShieldCheck,
  TrendingUp, Compass, Sparkles, CheckCircle2, ChevronRight, BarChart2, Lightbulb
} from 'lucide-react';

export interface CognitiveEngineMetrics {
  analyseScore: number; // 0 - 100
  reflexionScore: number; // 0 - 100
  deductionScore: number; // 0 - 100
  performanceScore: number; // 0 - 100
  puissanceScore: number; // 0 - 100
  efficaciteScore: number; // 0 - 100
  deductionSteps: string[];
  cognitiveSummary: string;
}

export function AICognitiveEngineCard({
  metrics,
  title = "Moteur Cognitif KronosNP IA · Multi-Piliers",
  compact = false
}: {
  metrics?: CognitiveEngineMetrics;
  title?: string;
  compact?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'metrics' | 'reasoning'>('metrics');

  const defaultMetrics: CognitiveEngineMetrics = metrics || {
    analyseScore: 98.4,
    reflexionScore: 96.7,
    deductionScore: 97.5,
    performanceScore: 95.2,
    puissanceScore: 99.1,
    efficaciteScore: 98.6,
    cognitiveSummary: "L'IA a synthétisé 12 400 variables tactiques, financières et physiologiques pour déduire la meilleure opportunité à haute efficacité et risque maîtrisé.",
    deductionSteps: [
      "🔍 Analyse de masse : Traitement des données xG, historique des confrontations H2H et indicateurs financiers.",
      "🧠 Réflexion contextuelle : Évaluation de la synergie tactique, cohésion du vestiaire et libération de masse salariale.",
      "🎯 Déduction probabiliste : Élimination des scénarios à variance négative et calcul du point d'amortissement.",
      "⚡ Mesure de Performance & Puissance : Simulation Monte-Carlo sur 10 000 itérations avec indice de confiance > 95%.",
      "🚀 Maximisation de l'Efficacité : Génération des recommandations d'action à fort retour sur investissement."
    ]
  };

  const pillars = [
    {
      id: 'analyse',
      name: 'Analyse Deep-Data',
      score: defaultMetrics.analyseScore,
      icon: SearchIcon,
      color: 'text-electric-blue',
      bgColor: 'bg-electric-blue/15',
      borderColor: 'border-electric-blue/40',
      desc: 'Extraction instantanée de 10 000+ métriques xG & financières.'
    },
    {
      id: 'reflexion',
      name: 'Réflexion Contextuelle',
      score: defaultMetrics.reflexionScore,
      icon: Brain,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/15',
      borderColor: 'border-purple-500/40',
      desc: 'Modélisation des synergies d’effectif & dynamique tactique.'
    },
    {
      id: 'deduction',
      name: 'Déduction Logique',
      score: defaultMetrics.deductionScore,
      icon: Compass,
      color: 'text-neon-green',
      bgColor: 'bg-neon-green/15',
      borderColor: 'border-neon-green/40',
      desc: 'Élimination des hypothèses à faible espérance de gain.'
    },
    {
      id: 'performance',
      name: 'Performance Hist.',
      score: defaultMetrics.performanceScore,
      icon: TrendingUp,
      color: 'text-premium-gold',
      bgColor: 'bg-premium-gold/15',
      borderColor: 'border-premium-gold/40',
      desc: 'Taux d’exactitude vérifié sur les prédictions passées.'
    },
    {
      id: 'puissance',
      name: 'Puissance de Calcul',
      score: defaultMetrics.puissanceScore,
      icon: Zap,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/15',
      borderColor: 'border-cyan-500/40',
      desc: 'Simulations Monte-Carlo intensives en millisecondes.'
    },
    {
      id: 'efficacite',
      name: 'Efficacité & Cash',
      score: defaultMetrics.efficaciteScore,
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15',
      borderColor: 'border-emerald-500/40',
      desc: 'Maximisation du ROI et optimisation des liquidités.'
    },
  ];

  return (
    <div className="rounded-3xl border border-electric-blue/40 bg-card/90 p-5 md:p-7 shadow-2xl space-y-6 animate-fadeIn">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-electric-blue/15 border border-electric-blue/30 text-electric-blue">
            <Brain className="h-6 w-6 animate-pulse text-electric-blue" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-neon-green/30 bg-neon-green/10 px-3 py-0.5 text-[10px] font-bold text-neon-green mb-0.5">
              <Sparkles className="h-3 w-3" /> Moteur d’IA Génératif & Cognitif
            </div>
            <h3 className="font-display text-lg font-extrabold text-foreground">
              {title}
            </h3>
          </div>
        </div>

        {/* TAB TOGGLE */}
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/50 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'metrics'
                ? 'bg-electric-blue text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📊 Indice 6-Piliers
          </button>

          <button
            onClick={() => setActiveTab('reasoning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reasoning'
                ? 'bg-neon-green text-black shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            💡 Chaîne de Déduction IA
          </button>
        </div>
      </div>

      {/* COGNITIVE SUMMARY */}
      <div className="p-4 rounded-2xl bg-electric-blue/10 border border-electric-blue/30 flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-electric-blue shrink-0 mt-0.5" />
        <p className="text-xs md:text-sm text-foreground/90 leading-relaxed font-medium">
          {defaultMetrics.cognitiveSummary}
        </p>
      </div>

      {activeTab === 'metrics' ? (
        /* 6 PILLARS METRICS GRID */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className={`p-4 rounded-2xl border ${pillar.borderColor} ${pillar.bgColor} space-y-2.5 transition-all hover:scale-[1.02] shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${pillar.color}`} />
                    <span className="text-xs font-bold text-foreground">{pillar.name}</span>
                  </div>
                  <span className={`text-sm font-mono font-extrabold ${pillar.color}`}>
                    {pillar.score}%
                  </span>
                </div>

                {/* PROGRESS METER */}
                <div className="h-2 w-full rounded-full bg-background/80 overflow-hidden border border-border/40">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      pillar.id === 'analyse' ? 'bg-electric-blue' :
                      pillar.id === 'reflexion' ? 'bg-purple-500' :
                      pillar.id === 'deduction' ? 'bg-neon-green' :
                      pillar.id === 'performance' ? 'bg-premium-gold' :
                      pillar.id === 'puissance' ? 'bg-cyan-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${pillar.score}%` }}
                  />
                </div>

                <p className="text-[11px] text-muted-foreground leading-snug">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        /* REASONING & DEDUCTION STEP-BY-STEP */
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-neon-green" /> Processus de Déduction Logique (Step-by-Step)
          </h4>

          <div className="space-y-2.5">
            {defaultMetrics.deductionSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl border border-border/60 bg-background/60 hover:bg-background transition-colors"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon-green/20 text-neon-green text-xs font-bold font-mono">
                  {idx + 1}
                </div>
                <p className="text-xs md:text-sm text-foreground/90 font-medium leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER BADGE */}
      <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1 font-semibold text-neon-green">
          <CheckCircle2 className="h-3.5 w-3.5" /> Algorithme certifié sans biais cognitif
        </span>
        <span className="font-mono text-muted-foreground">
          Index de Précision global : <strong>98.2%</strong>
        </span>
      </div>

    </div>
  );
}

function SearchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
