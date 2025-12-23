export type QueueStatus = 'waiting' | 'called' | 'in_progress' | 'completed' | 'left';

export interface QueueEntry {
  id: string;
  shopId: string;
  clientId?: string;
  walkInName?: string;
  walkInPhone?: string;
  serviceId?: string;
  preferredBarberId?: string;
  anyBarber: boolean;
  position: number;
  status: QueueStatus;
  estimatedWaitMinutes?: number;
  assignedBarberId?: string;
  assignedAt?: Date;
  calledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  leftAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQueueEntryInput {
  shopId: string;
  clientId?: string;
  walkInName?: string;
  walkInPhone?: string;
  serviceId?: string;
  preferredBarberId?: string;
  anyBarber?: boolean;
}

export interface QueueUpdate {
  queueId: string;
  status?: QueueStatus;
  position?: number;
  estimatedWaitMinutes?: number;
  assignedBarberId?: string;
}
