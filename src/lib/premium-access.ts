/**
 * KronosNP IA — Server-side premium data sanitization.
 *
 * IMPORTANT : this module is the SINGLE point that decides what a free vs
 * premium vs admin user is allowed to receive from the database for match
 * predictions. The UI MUST NOT be trusted to hide anything — a free user
 * inspecting network traffic or DOM must NEVER see exact-score or value-bet
 * data. This is the security boundary called out in the spec.
 */

import type { Match, UserRole } from '@/types';

export type SanitizedMatch = Omit<
  Match,
  'aiHomeScorePred' | 'aiAwayScorePred' | 'valueBet'
> & {
  aiHomeScorePred: number | null;
  aiAwayScorePred: number | null;
  valueBet: string | null;
  /** Marks whether this row was actually sent down for premium. If false,
   *  the premium fields are guaranteed null (zero information leak). */
  premiumUnlocked: boolean;
};

const FREE_ROLES: UserRole[] = ['user_free'];

/**
 * Strip exact-score and value-bet fields from a match for users that have
 * not purchased premium. Always returns a new object — never mutates input.
 *
 * For a premium/admin user, the row passes through with `premiumUnlocked: true`.
 * For a free user, the premium fields become `null` and `premiumUnlocked: false`.
 */
export function sanitizeMatchForRole(match: Match, role: UserRole | null): SanitizedMatch {
  const isPremium =
    role === 'user_premium' ||
    role === 'club_pro' ||
    role === 'super_admin';

  if (isPremium) {
    return {
      ...match,
      premiumUnlocked: true,
    };
  }

  return {
    ...match,
    aiHomeScorePred: null,
    aiAwayScorePred: null,
    valueBet: null,
    premiumUnlocked: false,
  };
}

export function sanitizeMatchListForRole(matches: Match[], role: UserRole | null): SanitizedMatch[] {
  return matches.map((m) => sanitizeMatchForRole(m, role));
}

export function isFreeRole(role: UserRole | null): boolean {
  return role === null || FREE_ROLES.includes(role);
}