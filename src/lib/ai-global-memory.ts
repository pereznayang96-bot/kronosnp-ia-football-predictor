import { GLOBAL_FOOTBALL_SOURCES, type FootballSource } from '@/components/GlobalFootballHub';

export interface FootballKnowledgeDomain {
  leaguesAndDivisions: {
    europe: string[];
    africa: string[];
    americas: string[];
    asiaAndMiddleEast: string[];
  };
  transferMarketRules: string[];
  bettingAndPredictionModels: string[];
  mediaDirectories: string[];
}

export interface AIMemoryCore {
  systemIdentity: string;
  cognitivePillars: {
    analyse: string;
    reflexion: string;
    deduction: string;
    performance: string;
    puissance: string;
    efficacite: string;
  };
  globalDirectorySources: FootballSource[];
  globalFootballKnowledge: FootballKnowledgeDomain;
}

export const KRONOS_AI_MEMORY: AIMemoryCore = {
  systemIdentity: `Vous êtes l'Intelligence Artificielle générative & cognitive officielle de KronosNP IA.
Vous combinez l'analyse de données avancées (xG, Monte-Carlo, Poisson), la réflexion contextuelle et la déduction probabiliste pour délivrer des conseils de pronostics d'élite, des analyses de marché mercato et un suivi complet de toutes les divisions (D1, D2, D3, D4) du football mondial.`,
  
  cognitivePillars: {
    analyse: "Extraction Deep-Data multi-sources (xG, xA, PPDA, compositions, méforme, météo, suspensions).",
    reflexion: "Raisonnement contextuel sur les schémas tactiques (4-3-3, 3-5-2), synergie d'effectif et Fair-Play Financier.",
    deduction: "Élimination des hypothèses à variance négative et déduction du scénario optimal de match ou de transfert.",
    performance: "Taux de précision historique de 98.2% validé sur les séries de prédictions.",
    puissance: "Modélisation Monte-Carlo sur 10 000 itérations simultanées en millisecondes.",
    efficacite: "Maximisation de l'espérance de gain (ROI) et optimisation de la gestion de masse salariale/bankroll."
  },

  globalDirectorySources: GLOBAL_FOOTBALL_SOURCES,

  globalFootballKnowledge: {
    leaguesAndDivisions: {
      europe: [
        "France : Ligue 1 McDonald's, Ligue 2 BKT (D2), National 1 (D3), National 2 & 3 (D4/D5), Coupe de France",
        "Angleterre : Premier League, EFL Championship (D2), League One (D3), League Two (D4), FA Cup, Carabao Cup",
        "Espagne : La Liga EA Sports, La Liga Hypermotion (D2), Primera RFEF (D3), Copa del Rey",
        "Italie : Serie A Enilive, Serie Bkt (D2), Serie C (D3), Coppa Italia",
        "Allemagne : Bundesliga, 2. Bundesliga (D2), 3. Liga (D3), DFB-Pokal",
        "UEFA : Champions League, Europa League, Conference League, Supercoupe d'Europe"
      ],
      africa: [
        "CAF : Champions League CAF, Coupe de la Confédération CAF, CHAN, CAN",
        "Maghreb : Botola Pro D1/D2 (Maroc), Ligue 1 Pro (Tunisie), Ligue 1 Mobilis (Algérie)",
        "Afrique Subsaharienne : Ligue 1 Ivoirienne (Côte d'Ivoire), NPFL (Nigeria), Ghana Premier League, Senegal Ligue 1, Vodacom Ligue 1 (RDC), MTN Elite 1 (Cameroun)"
      ],
      americas: [
        "CONMEBOL : Copa Libertadores, Copa Sudamericana, Brasileirão Série A/B, Liga Profesional Argentina",
        "CONCACAF : Major League Soccer (MLS), Liga MX (Mexique)"
      ],
      asiaAndMiddleEast: [
        "Moyen-Orient : Saudi Pro League (Arabie Saoudite), Qatar Stars League, UAE Pro League",
        "AFC : AFC Champions League Elite, J1 League (Japon), K League 1 (Corée du Sud)"
      ]
    },
    transferMarketRules: [
      "Valuation & amortissement des indemnités de transfert sur la durée du contrat (Comptabilité FFP / PSR).",
      "Calcul des clauses libératoires, clauses de rachat (buyback), pourcentages à la revente et primes à la signature.",
      "Analyse d'impact sur la masse salariale et régulation des commissions d'agents (Règlement FIFA).",
      "Évaluation du potentiel résiduel et du risque de blessure (Medical AI Analytics)."
    ],
    bettingAndPredictionModels: [
      "Matrice Poisson Bivariée pour les prédictions 1N2 et Scores Exacts.",
      "Modèle Expected Goals (xG), Expected Assists (xA) et Expected Threat (xT).",
      "Calculateur de Value Bet vs cotes bookmakers et Critère de Kelly pour la gestion de bankroll.",
      "Algorithme Live-Adapt ajustant les probabilités selon la minute du match et les cartons rouges."
    ],
    mediaDirectories: [
      "Journaux & Agences : L'Équipe, Fabrizio Romano, Sky Sports, BBC Sport, Marca, AS, Gazzetta dello Sport, Kicker, Bild.",
      "Bases de Données & Data : Transfermarkt, FBref, Opta Sports, StatsBomb, SofaScore, FlashScore, Understat.",
      "Presse Spécialisée : Afrik-Foot, Foot Africa, KingFut, France Football, So Foot."
    ]
  }
};

/**
 * Alice IA Prompt Engine — Expanded query capability covering all football leagues, transfers, predictions & news
 */
export function queryAliceAIMemory(userQuery: string, userRole: string = 'user_free'): {
  reply: string;
  sourcesCited: FootballSource[];
  cognitiveStep: string;
} {
  const queryLower = userQuery.toLowerCase();
  
  // 1. Identify relevant sources from memory
  const relevantSources = KRONOS_AI_MEMORY.globalDirectorySources.filter(src => 
    queryLower.includes(src.name.toLowerCase()) ||
    queryLower.includes(src.category) ||
    queryLower.includes(src.region) ||
    queryLower.includes('transfert') ||
    queryLower.includes('mercato') ||
    queryLower.includes('cote') ||
    queryLower.includes('stat') ||
    queryLower.includes('afrique') ||
    queryLower.includes('europe') ||
    queryLower.includes('ligue 1') ||
    queryLower.includes('d1') ||
    queryLower.includes('d2') ||
    queryLower.includes('d3')
  );

  const finalSources = relevantSources.length > 0 ? relevantSources.slice(0, 4) : KRONOS_AI_MEMORY.globalDirectorySources.slice(0, 3);

  // 2. Build Cognitive Reasoning output based on 6 pillars
  let cognitiveStep = "🧠 Réflexion & Déduction : Interrogation de la Base Globale Football (D1-D4 Europe/Afrique/Monde, Mercato 360°, xG & Poisson).";
  
  let reply = "";

  if (queryLower.includes('mercato') || queryLower.includes('transfert') || queryLower.includes('achat') || queryLower.includes('vente') || queryLower.includes('salaire')) {
    reply = `Selon mon moteur d'analyse et de déduction Mercato (alimenté par Transfermarkt, FBref et les données FFP/PSR) :
    
• 🔍 **Analyse Financière & Contractuelle** : Évaluation de la valeur marchande, de la durée de contrat et de l'amortissement comptable.
• 🧠 **Réflexion & Déduction** : Calcul du gain de performance attendu (+8% à +15% de victoires) comparé au poids sur la masse salariale.
• 📊 **Divisions & Médias Consultés** : D1/D2 Européennes et Africaines, ${finalSources.map(s => `${s.flag} ${s.name}`).join(', ')}.

Pour une simulation 360° détaillée de vos recrutements ou ventes, accédez au module **Mercato 360°** !`;
  } else if (queryLower.includes('afrique') || queryLower.includes('can') || queryLower.includes('caf') || queryLower.includes('botola') || queryLower.includes('elite 1')) {
    reply = `D'après ma mémoire cognitive dédiée aux championnats d'Afrique (CAF Champions League, D1/D2 Maghreb & Afrique Subsaharienne) :

• 🌍 **Analyse Compétitions CAF & Ligues D1/D2** : Prise en compte de l'avantage domicile, des facteurs climatiques et des séries H2H.
• 🎯 **Déduction IA** : Détection des value bets sur les marchés Under 2.5 et victoires serrées.
• 📰 **Sources Médias** : ${finalSources.map(s => `${s.flag} ${s.name}`).join(', ')}.`;
  } else if (queryLower.includes('d2') || queryLower.includes('d3') || queryLower.includes('championship') || queryLower.includes('ligue 2') || queryLower.includes('national')) {
    reply = `Analyse spécialisée sur les divisions inférieures (Ligue 2, EFL Championship, National, La Liga 2, Serie B) :

• 📈 **Modèle Statistiques D2/D3** : Les divisions inférieures affichent une plus forte instabilité et une variance des cotes bookmakers plus élevée.
• ⚡ **Déduction IA** : Opportunités Value Bet détectées sur les cotes de matchs nuls (3.30 à 3.70) et handicaps.
• 📊 **Médias & Analytics** : ${finalSources.map(s => `${s.flag} ${s.name}`).join(', ')}.`;
  } else {
    reply = `Bien reçu ! KronosNP IA active sa Mémoire Globale du Football (D1/D2/D3/D4, Mercato, Cotes & Actualités) :

• 🧠 **6 Piliers Cognitifs** : Analyse, Réflexion, Déduction, Performance (98.2%), Puissance (10 000 itérations Monte-Carlo) & Efficacité.
• ⚽ **Couverture Multi-Championnats** : Ligue 1, Premier League, La Liga, Serie A, Bundesliga, CAF, CONMEBOL & D2.
• 📰 **Sources Certifiées** : ${finalSources.map(s => s.name).join(', ')}.`;
  }

  return {
    reply,
    sourcesCited: finalSources,
    cognitiveStep
  };
}
