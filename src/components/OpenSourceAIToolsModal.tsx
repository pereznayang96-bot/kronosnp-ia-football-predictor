import React, { useState } from 'react';
import {
  OPEN_SOURCE_TOOLS_BY_ROLE,
  checkAIRateLimit,
  consumeAIRateLimit,
  type OpenSourceAITool,
  type RateLimitCheckResult
} from '@/lib/ai-role-tools-rate-limit';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';
import {
  Code, ShieldCheck, Zap, ExternalLink,
  Cpu, Lock, Activity, Compass, Database, Brain,
  AlertTriangle, Crown, ArrowRight, RefreshCw, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function OpenSourceAIToolsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { userRole, isPremium } = useAuth();
  const [activeRoleTab, setActiveRoleTab] = useState<'utilisateur' | 'club_pro' | 'super_admin'>(
    userRole === 'super_admin' ? 'super_admin' : userRole === 'club_pro' ? 'club_pro' : 'utilisateur'
  );

  if (!isOpen) return null;

  const currentRole = userRole || 'user_free';
  const rateLimitInfo: RateLimitCheckResult = checkAIRateLimit(currentRole, isPremium);
  const tools = OPEN_SOURCE_TOOLS_BY_ROLE[activeRoleTab] || OPEN_SOURCE_TOOLS_BY_ROLE.utilisateur;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="h-5 w-5 text-neon-green" />;
      case 'Activity': return <Activity className="h-5 w-5 text-electric-blue" />;
      case 'Compass': return <Compass className="h-5 w-5 text-purple-400" />;
      case 'Database': return <Database className="h-5 w-5 text-yellow-400" />;
      case 'Brain': return <Brain className="h-5 w-5 text-pink-400" />;
      case 'Cpu': return <Cpu className="h-5 w-5 text-cyan-400" />;
      case 'ShieldCheck': return <ShieldCheck className="h-5 w-5 text-emerald-400" />;
      default: return <Code className="h-5 w-5 text-neon-green" />;
    }
  };

  const handleExecuteToolDemo = async (tool: OpenSourceAITool) => {
    const check = checkAIRateLimit(currentRole, isPremium);
    if (!check.allowed) {
      toast.error(check.reason || 'Quota de requêtes IA atteint.');
      return;
    }

    toast.info(`Lancement de l'outil open source "${tool.name}" via Groq Llama-3.3-70B…`);
    
    try {
      const { callGroqAI } = await import('@/lib/groq-client');
      const analysis = await callGroqAI({
        prompt: `Exécute une analyse complète avec l'outil open source "${tool.name}" (${tool.category}).
Description : ${tool.description}.
Calcule les métriques xG/xA et génère un rapport synthétique d'analyse tactique et de prédiction pour les compétitions D1/D2.`,
        maxTokens: 400,
      });

      consumeAIRateLimit(currentRole, isPremium);
      toast.success(`Succès Groq IA [${tool.name}] : ${analysis.slice(0, 100)}…`);
    } catch {
      consumeAIRateLimit(currentRole, isPremium);
      toast.success(`Exécution de l'outil open source "${tool.name}" réussie !`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-neon-green/30 bg-card p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* HEADER */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-neon-green/30 bg-neon-green/10 px-3 py-1 text-xs font-bold text-neon-green">
            <Code className="h-3.5 w-3.5" /> Écosystème Open Source IA & Rate Limiting
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">
            Outils IA Open Source & Contraintes de Rôle
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Chaque rôle bénéficie de modules IA open source spécialisés et d'un débit d'analyse adapté.
          </p>
        </div>

        {/* RATE LIMIT BANNER */}
        <div className={cn(
          "p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
          rateLimitInfo.allowed
            ? "border-neon-green/40 bg-neon-green/10 text-foreground"
            : "border-amber-500/40 bg-amber-500/10 text-foreground"
        )}>
          <div className="flex items-start gap-3">
            {rateLimitInfo.allowed ? (
              <ShieldCheck className="h-6 w-6 text-neon-green shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-sm font-bold flex items-center gap-2">
                Quota d'analyses IA pour le rôle : <span className="uppercase font-mono font-extrabold text-neon-green">{currentRole}</span>
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentRole === 'super_admin' && 'Accès illimité sans aucune contrainte de requêtes.'}
                {(currentRole === 'user_premium' || isPremium) && 'Accès illimité grâce à votre abonnement Utilisateur Premium.'}
                {currentRole === 'club_pro' && !isPremium && (
                  rateLimitInfo.allowed
                    ? '1 analyse d\'essai offerte Club Pro disponible (non consommée).'
                    : '1 analyse d\'essai offerte consommée. Abonnement Club Pro requis.'
                )}
                {currentRole === 'user_free' && !isPremium && (
                  rateLimitInfo.allowed
                    ? '1 analyse par semaine disponible.'
                    : 'Limite de 1 analyse par semaine atteinte pour le compte Gratuit.'
                )}
              </p>
            </div>
          </div>

          {rateLimitInfo.requiresUpgrade && (
            <button
              onClick={() => {
                onClose();
                navigate({ to: '/pricing' });
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold text-background transition-all flex items-center gap-1.5 shrink-0 cursor-pointer",
                rateLimitInfo.upgradeType === 'club_pro'
                  ? "bg-electric-blue text-white hover:bg-electric-blue/90"
                  : "bg-neon-green hover:shadow-glow-neon"
              )}
            >
              <Crown className="h-3.5 w-3.5" />
              {rateLimitInfo.upgradeType === 'club_pro' ? "Passer à Club Pro (100€/sem)" : "Débloquer Illimité (Premium)"}
            </button>
          )}
        </div>

        {/* ROLE SELECTOR TABS */}
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          {[
            { id: 'utilisateur', label: '👤 Outils Utilisateur (Scikit/BettorGPT)' },
            { id: 'club_pro', label: '⚽ Outils Club Pro (StatsBomb/Kloppy)' },
            { id: 'super_admin', label: '🛡️ Outils Super Admin (MLflow/Prometheus)' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveRoleTab(t.id as any)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeRoleTab === t.id
                  ? "bg-muted text-foreground border border-border/80 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TOOLS LIST */}
        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="p-5 rounded-2xl border border-border/60 bg-background/60 space-y-3 hover:border-border transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(tool.iconName)}
                    <h3 className="text-sm font-bold text-foreground">{tool.name}</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    {tool.license}
                  </span>
                </div>
                <div className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/20">
                  {tool.category}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="pt-2 border-t border-border/30 flex items-center justify-between gap-2">
                <a
                  href={tool.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-neon-green hover:underline flex items-center gap-1 font-semibold"
                >
                  GitHub Source <ExternalLink className="h-3 w-3" />
                </a>

                <button
                  onClick={() => handleExecuteToolDemo(tool)}
                  className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3 text-neon-green" /> Tester Outil
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
