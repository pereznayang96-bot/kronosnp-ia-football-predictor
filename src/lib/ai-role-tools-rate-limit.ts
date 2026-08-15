import type { UserRole } from '@/types';

export interface OpenSourceAITool {
  id: string;
  name: string;
  category: string;
  description: string;
  repoUrl: string;
  status: 'active' | 'integrated' | 'ready';
  iconName: string;
  license: string;
}

export const OPEN_SOURCE_TOOLS_BY_ROLE: Record<string, OpenSourceAITool[]> = {
  utilisateur: [
    {
      id: 'scikit-poisson',
      name: 'Scikit-Learn Poisson Engine',
      category: 'Prédiction & Modélisation',
      description: 'Moteur open source de modélisation Poisson et calcul des probabilités de victoires 1N2.',
      repoUrl: 'https://github.com/scikit-learn/scikit-learn',
      status: 'integrated',
      iconName: 'Zap',
      license: 'BSD-3-Clause',
    },
    {
      id: 'understat-scraper',
      name: 'Open Football Stats Scraper',
      category: 'Données & Statistics',
      description: 'Module d\'extraction open-source pour les données xG, tirs etExpected Goals.',
      repoUrl: 'https://github.com/understat/understat-parser',
      status: 'integrated',
      iconName: 'BarChart2',
      license: 'MIT',
    },
    {
      id: 'bettorgpt-core',
      name: 'BettorGPT Bankroll Optimizer',
      category: 'Gestion de Mise & Value',
      description: 'Calculateur open-source de critère de Kelly et détection des cotes surévaluées.',
      repoUrl: 'https://github.com/bettorgpt/bankroll-optimizer',
      status: 'integrated',
      iconName: 'TrendingUp',
      license: 'MIT',
    },
  ],
  club_pro: [
    {
      id: 'statsbomb-parser',
      name: 'StatsBomb Open Data Parser',
      category: 'Scouting & Événements',
      description: 'Parser officiel open source pour événements de matchs (passes, pressings, interceptions, duels).',
      repoUrl: 'https://github.com/statsbomb/statsbombpy',
      status: 'integrated',
      iconName: 'Activity',
      license: 'MIT',
    },
    {
      id: 'kloppy-tracking',
      name: 'Kloppy Tactical Tracking Reader',
      category: 'Tactique & Pitch Control',
      description: 'Bibliothèque d\'analyse des données de tracking GPS & vidéo (Metrica, TRACAB, ChyronHego).',
      repoUrl: 'https://github.com/py-sport/kloppy',
      status: 'integrated',
      iconName: 'Compass',
      license: 'BSD-3-Clause',
    },
    {
      id: 'soccerdata-pipe',
      name: 'SoccerData Python Pipeline',
      category: 'Data Pipeline Mercato',
      description: 'Connecteur unifié pour intégrer les historiques de transferts, salaires et valeur marchande.',
      repoUrl: 'https://github.com/proceedings/soccerdata',
      status: 'integrated',
      iconName: 'Database',
      license: 'GPL-3.0',
    },
    {
      id: 'xg-pitch-engine',
      name: 'Open xG & Scouting Engine',
      category: 'Recrutement 360°',
      description: 'Modèle prédictif de synergie tactique et de valeur marchande résiduelle des recrues.',
      repoUrl: 'https://github.com/soccermatics/xg-models',
      status: 'integrated',
      iconName: 'Brain',
      license: 'MIT',
    },
  ],
  super_admin: [
    {
      id: 'mlflow-tracking',
      name: 'MLflow AI Model Lifecycle & Audit',
      category: 'Supervision System',
      description: 'Suivi open source des versions de modèles IA, dérive des données (drift) et audit de précision.',
      repoUrl: 'https://github.com/mlflow/mlflow',
      status: 'integrated',
      iconName: 'Cpu',
      license: 'Apache-2.0',
    },
    {
      id: 'prometheus-ai-exporter',
      name: 'Prometheus AI Metrics Exporter',
      category: 'Performance & Temps Réel',
      description: 'Monitoring open source du temps de réponse, taux de succès et débit d\'inférence.',
      repoUrl: 'https://github.com/prometheus/prometheus',
      status: 'integrated',
      iconName: 'ShieldCheck',
      license: 'Apache-2.0',
    },
    {
      id: 'openllm-evaluator',
      name: 'OpenLLM Evaluator & Bias Checker',
      category: 'Sécurité & Biais',
      description: 'Outil de vérification automatique de non-baisement et de sécurité des réponses générées.',
      repoUrl: 'https://github.com/huggingface/lighteval',
      status: 'integrated',
      iconName: 'Lock',
      license: 'Apache-2.0',
    },
  ],
};

/** RATE LIMITING SPECIFICATION:
 * - Utilisateur Gratuit: 1 request / week (1 requête par semaine).
 * - Utilisateur Premium: Unlimited.
 * - Club Pro: 1 free trial request, then requires a paid Club Pro Subscription.
 * - Super Admin: Unlimited.
 */

export interface RateLimitCheckResult {
  allowed: boolean;
  role: UserRole;
  remainingQuota: number;
  resetDateMs?: number;
  reason?: string;
  requiresUpgrade: boolean;
  upgradeType?: 'premium' | 'club_pro';
}

const STORAGE_KEY_FREE_USER = 'kronosnp_rate_limit_user_free';
const STORAGE_KEY_CLUB_PRO = 'kronosnp_rate_limit_club_pro';

export function checkAIRateLimit(userRole: UserRole, isPremium: boolean): RateLimitCheckResult {
  // Super Admin: unlimited
  if (userRole === 'super_admin') {
    return {
      allowed: true,
      role: userRole,
      remainingQuota: 9999,
      requiresUpgrade: false,
    };
  }

  // Utilisateur Premium: unlimited
  if (userRole === 'user_premium' || (userRole === 'user_free' && isPremium)) {
    return {
      allowed: true,
      role: 'user_premium',
      remainingQuota: 9999,
      requiresUpgrade: false,
    };
  }

  // Club Pro Role Check
  if (userRole === 'club_pro') {
    const raw = localStorage.getItem(STORAGE_KEY_CLUB_PRO);
    let usedCount = 0;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        usedCount = parsed.usedCount || 0;
      } catch {
        usedCount = 0;
      }
    }

    // 1 free trial request for Club Pro
    if (usedCount < 1) {
      return {
        allowed: true,
        role: 'club_pro',
        remainingQuota: 1 - usedCount,
        requiresUpgrade: false,
      };
    }

    return {
      allowed: false,
      role: 'club_pro',
      remainingQuota: 0,
      reason: "Vous avez consommé votre analyse d'essai offerte Club Pro. Abonnez-vous à la formule Club Pro (100 €/semaine, 400 €/mois ou 1200 €/trimestre) pour débloquer l'accès illimité.",
      requiresUpgrade: true,
      upgradeType: 'club_pro',
    };
  }

  // Utilisateur Gratuit (user_free): 1 request per week (7 days = 604,800,000 ms)
  const ONE_WEEK_MS = 7 * 24 * 3600 * 1000;
  const rawFree = localStorage.getItem(STORAGE_KEY_FREE_USER);
  let lastUsedTime = 0;

  if (rawFree) {
    try {
      const parsed = JSON.parse(rawFree);
      lastUsedTime = parsed.lastUsedTime || 0;
    } catch {
      lastUsedTime = 0;
    }
  }

  const now = Date.now();
  const timeElapsed = now - lastUsedTime;

  if (lastUsedTime > 0 && timeElapsed < ONE_WEEK_MS) {
    const resetDateMs = lastUsedTime + ONE_WEEK_MS;
    return {
      allowed: false,
      role: 'user_free',
      remainingQuota: 0,
      resetDateMs,
      reason: "Limite de 1 requête IA gratuite par semaine atteinte. Passez au compte Premium pour effectuer des analyses illimitées.",
      requiresUpgrade: true,
      upgradeType: 'premium',
    };
  }

  return {
    allowed: true,
    role: 'user_free',
    remainingQuota: 1,
    requiresUpgrade: false,
  };
}

export function consumeAIRateLimit(userRole: UserRole, isPremium: boolean): void {
  if (userRole === 'super_admin' || isPremium) return;

  if (userRole === 'club_pro') {
    const raw = localStorage.getItem(STORAGE_KEY_CLUB_PRO);
    let usedCount = 0;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        usedCount = parsed.usedCount || 0;
      } catch {
        usedCount = 0;
      }
    }
    localStorage.setItem(STORAGE_KEY_CLUB_PRO, JSON.stringify({ usedCount: usedCount + 1, lastUsedTime: Date.now() }));
    return;
  }

  // user_free
  localStorage.setItem(STORAGE_KEY_FREE_USER, JSON.stringify({ lastUsedTime: Date.now() }));
}
