/**
 * Types TypeScript pour les tables Supabase de KronosNP IA.
 * Aligné sur le script SQL fourni dans `supabase/schema.sql`.
 */

export type SubscriptionPlan = 'user_free' | 'premium_basic' | 'premium_pro' | 'club_pro'
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending'
export type PaymentMethod = 'stripe' | 'orange_money' | 'mtn_momo' | 'wave' | 'paypal' | null

/** Profils utilisateurs — table `user_profiles` */
export interface UserProfile {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  phone: string | null
  country: string | null
  preferredCurrency: string | null
  marketingConsent: boolean
  createdAt: string
  updatedAt: string
}

/** Rôles premium et abonnements — table `user_roles` */
export interface UserRole {
  id: string
  userId: string
  role: SubscriptionPlan
  premiumExpiresAt: string | null
  premiumPlan: string | null
  createdAt: string
  updatedAt: string
}

/** Historique des prédictions — table `predictions` */
export interface Prediction {
  id: string
  userId: string
  matchId: string
  predHomeScore: number | null
  predAwayScore: number | null
  pred1N2: string | null
  isCorrect: boolean
  createdAt: string
}

/** Abonnements payants — table `subscriptions` */
export interface Subscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  currency: string
  amount: number
  status: SubscriptionStatus
  stripeSessionId: string | null
  stripeCustomerId: string | null
  paymentMethod: PaymentMethod
  startsAt: string
  expiresAt: string
  createdAt: string
}

/** Défi gamifié — entrées utilisateur */
export interface ChallengeEntry {
  id: string
  challengeId: string
  userId: string
  predictions: unknown[]
  score: number
  prizeTimeHours: number
  createdAt: string
}

/** Défi (hebdomadaire) */
export interface Challenge {
  id: string
  weekStart: string
  weekEnd: string
  matchIds: string[]
  status: 'active' | 'closed' | 'archived'
  createdAt: string
}
