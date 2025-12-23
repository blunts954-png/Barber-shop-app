export type SubscriptionTier = 'starter' | 'pro' | 'elite';

export interface BusinessHours {
  [day: string]: {
    open: string; // "09:00"
    close: string; // "18:00"
    closed?: boolean;
  };
}

export interface ShopSettings {
  walkInsEnabled?: boolean;
  bookingBufferMinutes?: number;
  requireDeposit?: boolean;
  allowBackupBooking?: boolean;
  timezone?: string;
}

export interface Shop {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  timezone: string;
  businessHours: BusinessHours;
  settings: ShopSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  shopId: string;
  tier: SubscriptionTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  monthlyPrice: number;
  status: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const PRICING_TIERS = {
  starter: {
    name: 'Starter',
    price: 79,
    maxBarbers: 2,
    features: [
      'Core booking system',
      'Walk-in queue',
      'Reminders',
      'Basic reports'
    ]
  },
  pro: {
    name: 'Pro',
    price: 149,
    maxBarbers: 5,
    features: [
      'All Starter features',
      'Backup booking',
      'No-show rules',
      'Loyalty & referrals',
      'Basic automation'
    ]
  },
  elite: {
    name: 'Elite',
    price: 299,
    maxBarbers: null, // unlimited
    features: [
      'All Pro features',
      'Advanced analytics (profit per chair)',
      'Full marketing automation',
      'Dynamic pricing',
      'Integrations'
    ]
  }
} as const;
