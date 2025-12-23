export type BackupOfferStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface BackupSlot {
  id: string;
  clientId: string;
  primaryAppointmentId?: string;
  preferredStartTime: Date;
  preferredEndTime: Date;
  flexibleTime: boolean;
  preferredBarberId?: string;
  anyBarber: boolean;
  serviceId: string;
  isActive: boolean;
  priorityRank: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackupOffer {
  id: string;
  backupSlotId: string;
  cancelledAppointmentId: string;
  clientId: string;
  offeredStartTime: Date;
  offeredEndTime: Date;
  barberId: string;
  status: BackupOfferStatus;
  bonusPoints: number;
  respondedAt?: Date;
  expiresAt: Date;
  acceptedAppointmentId?: string;
  createdAt: Date;
}

export interface BackupMatchingParams {
  cancelledAppointmentId: string;
  barberId: string;
  startTime: Date;
  endTime: Date;
  serviceId: string;
  shopId: string;
}

export interface BackupMatchResult {
  candidates: ClientRanking[];
  topCandidate?: ClientRanking;
  matchFound: boolean;
}

interface ClientRanking {
  clientId: string;
  score: number;
  reliabilityScore: number;
  loyaltyTier: string;
  serviceFit: number;
  barberFit: number;
}
