/** KronosNP IA — Shared TypeScript types */

export type UserRole = 'super_admin' | 'user_free' | 'user_premium' | 'club_pro';
export type Currency = 'XOF' | 'EUR' | 'USD';
export type PaymentMethod = 'stripe' | 'orange_money' | 'mtn_momo';
export type SubscriptionPlan = 'weekly' | 'monthly' | 'quarterly';
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type ChallengeStatus = 'active' | 'closed' | 'archived';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  leagueCountry: string;
  kickoffTime: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  aiHomeScorePred: number | null;
  aiAwayScorePred: number | null;
  ai1n2Pred: string | null;
  confidenceScore: number;
  oddsHome: number | null;
  oddsDraw: number | null;
  oddsAway: number | null;
  valueBet: string | null;
  mediaSources: string;
  liveMinute: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleRecord {
  id: string;
  userId: string;
  role: UserRole;
  premiumExpiresAt: string | null;
  premiumPlan: SubscriptionPlan | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  currency: Currency;
  amount: number;
  status: 'active' | 'cancelled' | 'expired';
  stripeSessionId: string | null;
  stripeCustomerId: string | null;
  paymentMethod: string;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predHomeScore: number | null;
  predAwayScore: number | null;
  pred1n2: string | null;
  isCorrect: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  weekStart: string;
  weekEnd: string;
  matchIds: string;
  status: ChallengeStatus;
  createdAt: string;
}

export interface ChallengeEntry {
  id: string;
  challengeId: string;
  userId: string;
  predictions: string;
  score: number;
  prizeTimeHours: number;
  createdAt: string;
}

export interface AIPerformanceLog {
  id: string;
  matchId: string;
  actualHomeScore: number | null;
  actualAwayScore: number | null;
  predictedHomeScore: number | null;
  predictedAwayScore: number | null;
  predicted1n2: string | null;
  actual1n2: string | null;
  scoreCorrect: string;
  outcomeCorrect: string;
  confidenceScore: number | null;
  league: string | null;
  createdAt: string;
}

export interface AdminAlert {
  id: string;
  alertType: string;
  severity: AlertSeverity;
  message: string;
  metadata: string;
  acknowledged: string;
  createdAt: string;
}

export interface ParieurGuideSection {
  id: string;
  title: string;
  content: string;
  sortOrder: number;
  isActive: string;
  createdAt: string;
}

export interface GeoPricing {
  currency: Currency;
  symbol: string;
  country: string;
  paymentMethods: PaymentMethod[];
  plans: Record<SubscriptionPlan, { price: number; label: string }>;
}

export const PRICING_BY_ZONE: Record<string, GeoPricing> = {
  XOF: {
    currency: 'XOF',
    symbol: 'FCFA',
    country: 'Zone CFA',
    paymentMethods: ['orange_money', 'mtn_momo', 'stripe'],
    plans: {
      weekly: { price: 2000, label: '2 000 FCFA / Semaine' },
      monthly: { price: 5000, label: '5 000 FCFA / Mois' },
      quarterly: { price: 12000, label: '12 000 FCFA / Trimestre' },
    },
  },
  EUR: {
    currency: 'EUR',
    symbol: '€',
    country: 'Europe',
    paymentMethods: ['stripe'],
    plans: {
      weekly: { price: 4.99, label: '4,99 € / Semaine' },
      monthly: { price: 14.99, label: '14,99 € / Mois' },
      quarterly: { price: 29.99, label: '29,99 € / Trimestre' },
    },
  },
  USD: {
    currency: 'USD',
    symbol: '$',
    country: 'International',
    paymentMethods: ['stripe'],
    plans: {
      weekly: { price: 4.99, label: '$4.99 / Week' },
      monthly: { price: 14.99, label: '$14.99 / Month' },
      quarterly: { price: 29.99, label: '$29.99 / Quarter' },
    },
  },
};

/** Separate Pro Tariffs for Football Clubs */
export const CLUB_PRO_PRICING_BY_ZONE: Record<string, GeoPricing> = {
  EUR: {
    currency: 'EUR',
    symbol: '€',
    country: 'Europe',
    paymentMethods: ['stripe'],
    plans: {
      weekly: { price: 100, label: '100 € / Semaine' },
      monthly: { price: 400, label: '400 € / Mois' },
      quarterly: { price: 1200, label: '1 200 € / Trimestre' },
    },
  },
  XOF: {
    currency: 'XOF',
    symbol: 'FCFA',
    country: 'Zone CFA',
    paymentMethods: ['orange_money', 'mtn_momo', 'stripe'],
    plans: {
      weekly: { price: 65000, label: '65 000 FCFA / Semaine' },
      monthly: { price: 260000, label: '260 000 FCFA / Mois' },
      quarterly: { price: 780000, label: '780 000 FCFA / Trimestre' },
    },
  },
  USD: {
    currency: 'USD',
    symbol: '$',
    country: 'International',
    paymentMethods: ['stripe'],
    plans: {
      weekly: { price: 100, label: '$100 / Week' },
      monthly: { price: 400, label: '$400 / Month' },
      quarterly: { price: 1200, label: '$1,200 / Quarter' },
    },
  },
};

/** CFA franc zone country codes that map to XOF pricing */
export const CFA_COUNTRY_CODES = new Set([
  'BJ','BF','CI','GW','ML','NE','SN','TG','CM','CF','TD','CG','GQ','GA',
]);
