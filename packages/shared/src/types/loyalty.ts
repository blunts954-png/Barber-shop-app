export type LoyaltyEventType =
  | 'booking'
  | 'show_up'
  | 'backup_accept'
  | 'review'
  | 'referral'
  | 'no_show_penalty'
  | 'cancellation_penalty';

export interface LoyaltyEvent {
  id: string;
  clientId: string;
  shopId: string;
  eventType: LoyaltyEventType;
  points: number;
  appointmentId?: string;
  referralId?: string;
  description?: string;
  createdAt: Date;
}

export interface Referral {
  id: string;
  shopId: string;
  referrerClientId: string;
  referredClientId: string;
  referrerPointsAwarded: number;
  referredPointsAwarded: number;
  firstAppointmentId?: string;
  firstAppointmentCompleted: boolean;
  createdAt: Date;
}

export const LOYALTY_POINTS = {
  booking: 10,
  showUp: 20,
  backupAccept: 50,
  review: 30,
  referral: 100,
  noShowPenalty: -50,
  cancellationPenalty: -20
} as const;

export const LOYALTY_TIER_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 3000
} as const;
