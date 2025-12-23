/**
 * Scoring and ranking utilities for backup booking matching
 */

import type { Client } from '../types/client';
import type { LoyaltyTier } from '../types/client';

/**
 * Calculate reliability score based on appointment history
 * Returns a value between 0.0 (unreliable) and 1.0 (very reliable)
 */
export function calculateReliabilityScore(
  completedAppointments: number,
  noShowCount: number,
  cancellationCount: number,
  totalAppointments: number
): number {
  if (totalAppointments === 0) return 1.0; // New clients start with perfect score

  const completionRate = completedAppointments / totalAppointments;
  const noShowPenalty = noShowCount * 0.15;
  const cancellationPenalty = cancellationCount * 0.05;

  const score = Math.max(0, completionRate - noShowPenalty - cancellationPenalty);
  return Math.min(1.0, score);
}

/**
 * Calculate loyalty tier based on points
 */
export function calculateLoyaltyTier(points: number): LoyaltyTier {
  if (points >= 3000) return 'platinum';
  if (points >= 1500) return 'gold';
  if (points >= 500) return 'silver';
  return 'bronze';
}

/**
 * Get tier multiplier for backup booking ranking
 */
export function getLoyaltyTierMultiplier(tier: LoyaltyTier): number {
  const multipliers = {
    platinum: 1.5,
    gold: 1.3,
    silver: 1.1,
    bronze: 1.0
  };
  return multipliers[tier];
}

/**
 * Calculate backup booking candidate score
 * Higher score = better candidate for backup slot
 */
export function calculateBackupScore(
  reliabilityScore: number,
  loyaltyTier: LoyaltyTier,
  serviceFit: number, // 0.0 to 1.0
  barberFit: number // 0.0 to 1.0
): number {
  const tierMultiplier = getLoyaltyTierMultiplier(loyaltyTier);

  // Weighted scoring:
  // - Reliability: 40%
  // - Service fit: 25%
  // - Barber fit: 20%
  // - Loyalty tier: 15%

  const baseScore =
    reliabilityScore * 0.4 +
    serviceFit * 0.25 +
    barberFit * 0.2 +
    (tierMultiplier - 1.0) * 0.15;

  return Math.min(1.0, baseScore * tierMultiplier);
}

/**
 * Calculate service fit score
 * 1.0 = exact same service, 0.5 = similar duration, 0.0 = completely different
 */
export function calculateServiceFit(
  requestedServiceId: string,
  requestedDuration: number,
  availableServiceId: string,
  availableDuration: number
): number {
  if (requestedServiceId === availableServiceId) return 1.0;

  const durationDiff = Math.abs(requestedDuration - availableDuration);
  const durationFit = Math.max(0, 1 - durationDiff / 60); // Penalty per minute difference

  return durationFit * 0.5; // Different service but similar duration = 0.5 max
}

/**
 * Calculate barber fit score
 * 1.0 = preferred barber, 0.7 = any barber acceptable, 0.0 = wrong barber
 */
export function calculateBarberFit(
  preferredBarberId: string | undefined,
  availableBarberId: string,
  anyBarberAcceptable: boolean
): number {
  if (preferredBarberId === availableBarberId) return 1.0;
  if (anyBarberAcceptable) return 0.7;
  return 0.0;
}
