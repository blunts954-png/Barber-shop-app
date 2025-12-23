/**
 * Shared constants across the application
 */

export const APP_NAME = 'Barbershop OS';

export const DEFAULT_TIMEZONE = 'America/New_York';

export const BACKUP_OFFER_TIMEOUT_MINUTES = 15;

export const DEFAULT_BOOKING_BUFFER_MINUTES = 15;

export const DEPOSIT_THRESHOLD_HOURS = 24;

export const CANCELLATION_WINDOW_HOURS = 24;

export const MIN_RELIABILITY_SCORE_FOR_BACKUP = 0.5;

// Pricing (in cents for Stripe)
export const PRICING = {
  starter: {
    name: 'Starter',
    monthlyPrice: 7900,
    displayPrice: '$79/month',
    maxBarbers: 2
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 14900,
    displayPrice: '$149/month',
    maxBarbers: 5
  },
  elite: {
    name: 'Elite',
    monthlyPrice: 29900,
    displayPrice: '$299/month',
    maxBarbers: null
  }
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  SHOP_NOT_FOUND: 'Shop not found',
  BARBER_NOT_FOUND: 'Barber not found',
  CLIENT_NOT_FOUND: 'Client not found',
  APPOINTMENT_NOT_FOUND: 'Appointment not found',
  SLOT_UNAVAILABLE: 'This time slot is no longer available',
  DUPLICATE_EMAIL: 'Email already exists',
  INVALID_TOKEN: 'Invalid or expired token'
} as const;
