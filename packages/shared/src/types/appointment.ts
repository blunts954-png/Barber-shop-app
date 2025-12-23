export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  shopId: string;
  barberId: string;
  clientId: string;
  serviceId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: AppointmentStatus;
  price: number;
  discountAmount: number;
  finalPrice: number;
  depositAmount: number;
  depositPaid: boolean;
  paymentStatus: string;
  stripePaymentIntentId?: string;
  isBackupFill: boolean;
  originalClientId?: string;
  backupBonusPoints: number;
  clientNotes?: string;
  barberNotes?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  cancelledByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentInput {
  shopId: string;
  barberId: string;
  clientId: string;
  serviceId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  price: number;
  depositAmount?: number;
  clientNotes?: string;
}

export interface AppointmentWithBackup extends Appointment {
  backupSlots?: BackupSlotInput[];
}

export interface BackupSlotInput {
  preferredStartTime: Date;
  preferredEndTime: Date;
  flexibleTime?: boolean;
  preferredBarberId?: string;
  anyBarber?: boolean;
}
