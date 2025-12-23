export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Client {
  id: string;
  userId: string;
  shopId: string;
  preferredBarberId?: string;
  notes?: string;
  totalAppointments: number;
  completedAppointments: number;
  noShowCount: number;
  cancellationCount: number;
  reliabilityScore: number; // 0.0 to 1.0
  loyaltyPoints: number;
  loyaltyTier: LoyaltyTier;
  lifetimeValue: number;
  avgAppointmentIntervalDays?: number;
  lastAppointmentAt?: Date;
  nextExpectedAppointmentAt?: Date;
  referralCode: string;
  referredByClientId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientRanking {
  clientId: string;
  score: number;
  reliabilityScore: number;
  loyaltyTier: LoyaltyTier;
  serviceFit: number;
  barberFit: number;
}

export interface CreateClientInput {
  userId: string;
  shopId: string;
  preferredBarberId?: string;
  notes?: string;
}
