-- Initial Database Schema for Barbershop OS
-- Core tables for shops, users, appointments, and backup booking

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('owner', 'barber', 'client');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE subscription_tier AS ENUM ('starter', 'pro', 'elite');
CREATE TYPE backup_offer_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE queue_status AS ENUM ('waiting', 'called', 'in_progress', 'completed', 'left');
CREATE TYPE notification_type AS ENUM ('sms', 'email', 'push');
CREATE TYPE automation_type AS ENUM ('review_request', 'reactivation', 'birthday', 'upsell', 'membership');

-- ============================================================================
-- SHOPS & SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'America/New_York',

  -- Business hours (JSON: {monday: {open: "09:00", close: "18:00"}, ...})
  business_hours JSONB DEFAULT '{}'::jsonb,

  -- Settings
  settings JSONB DEFAULT '{}'::jsonb, -- walk-in enabled, booking buffer, etc.

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'starter',

  -- Stripe data
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),

  -- Pricing
  monthly_price DECIMAL(10, 2) NOT NULL, -- $79, $149, or $299

  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, cancelled, past_due
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_shop ON subscriptions(shop_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- ============================================================================
-- USERS (Owners, Barbers, Clients)
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255), -- bcrypt hash

  -- Profile
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,

  -- Role
  role user_role NOT NULL,

  -- Auth
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- BARBERS
-- ============================================================================

CREATE TABLE barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

  -- Profile
  bio TEXT,
  specialties TEXT[], -- ["fades", "beard", "lineup"]

  -- Scheduling
  -- Working hours per day (JSON: {monday: {slots: ["09:00-12:00", "13:00-18:00"]}, ...})
  working_hours JSONB DEFAULT '{}'::jsonb,

  -- Performance metrics (calculated)
  avg_rating DECIMAL(3, 2) DEFAULT 5.0,
  total_reviews INTEGER DEFAULT 0,
  total_appointments INTEGER DEFAULT 0,
  utilization_rate DECIMAL(5, 2) DEFAULT 0, -- percentage

  -- Settings
  accepts_walk_ins BOOLEAN DEFAULT TRUE,
  booking_buffer_minutes INTEGER DEFAULT 15, -- time between appointments

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, shop_id)
);

CREATE INDEX idx_barbers_user ON barbers(user_id);
CREATE INDEX idx_barbers_shop ON barbers(shop_id);
CREATE INDEX idx_barbers_active ON barbers(is_active);

-- ============================================================================
-- CLIENTS
-- ============================================================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

  -- Preferences
  preferred_barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL,
  notes TEXT, -- client notes/preferences

  -- Reliability scoring
  total_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  no_show_count INTEGER DEFAULT 0,
  cancellation_count INTEGER DEFAULT 0,
  reliability_score DECIMAL(3, 2) DEFAULT 1.0, -- 0.0 to 1.0

  -- Loyalty
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier VARCHAR(50) DEFAULT 'bronze', -- bronze, silver, gold, platinum

  -- Metrics
  lifetime_value DECIMAL(10, 2) DEFAULT 0,
  avg_appointment_interval_days INTEGER, -- typical cadence
  last_appointment_at TIMESTAMPTZ,
  next_expected_appointment_at TIMESTAMPTZ, -- for reactivation

  -- Referral
  referral_code VARCHAR(20) UNIQUE,
  referred_by_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, shop_id)
);

CREATE INDEX idx_clients_user ON clients(user_id);
CREATE INDEX idx_clients_shop ON clients(shop_id);
CREATE INDEX idx_clients_preferred_barber ON clients(preferred_barber_id);
CREATE INDEX idx_clients_referral_code ON clients(referral_code);
CREATE INDEX idx_clients_reliability ON clients(reliability_score DESC);

-- ============================================================================
-- SERVICES
-- ============================================================================

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL, -- "Fade", "Lineup", "Beard Trim"
  description TEXT,

  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL,

  -- Duration
  duration_minutes INTEGER NOT NULL, -- typical duration

  -- Economics
  margin_percentage DECIMAL(5, 2), -- profit margin

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_shop ON services(shop_id);
CREATE INDEX idx_services_active ON services(is_active);

-- ============================================================================
-- APPOINTMENTS (Core booking with backup fields)
-- ============================================================================

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- Timing
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,

  -- Status
  status appointment_status DEFAULT 'scheduled',

  -- Pricing
  price DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_price DECIMAL(10, 2) NOT NULL,

  -- Payment
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT FALSE,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded
  stripe_payment_intent_id VARCHAR(255),

  -- Backup booking fields
  is_backup_fill BOOLEAN DEFAULT FALSE, -- was this slot filled from backup?
  original_client_id UUID REFERENCES clients(id) ON DELETE SET NULL, -- who cancelled
  backup_bonus_points INTEGER DEFAULT 0, -- loyalty points for accepting backup

  -- Notes
  client_notes TEXT,
  barber_notes TEXT,

  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_shop ON appointments(shop_id);
CREATE INDEX idx_appointments_barber ON appointments(barber_id);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_scheduled_start ON appointments(scheduled_start);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_backup ON appointments(is_backup_fill);

-- ============================================================================
-- BACKUP SLOTS (Client backup date preferences)
-- ============================================================================

CREATE TABLE backup_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  primary_appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,

  -- Backup preferences
  preferred_start_time TIMESTAMPTZ NOT NULL,
  preferred_end_time TIMESTAMPTZ NOT NULL,
  flexible_time BOOLEAN DEFAULT FALSE, -- "anytime within these hours"

  -- Barber preference
  preferred_barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL,
  any_barber BOOLEAN DEFAULT FALSE,

  -- Service
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- Status
  is_active BOOLEAN DEFAULT TRUE, -- inactive after primary appointment passes
  priority_rank INTEGER DEFAULT 0, -- for ranking multiple backups

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_backup_slots_client ON backup_slots(client_id);
CREATE INDEX idx_backup_slots_appointment ON backup_slots(primary_appointment_id);
CREATE INDEX idx_backup_slots_time ON backup_slots(preferred_start_time, preferred_end_time);
CREATE INDEX idx_backup_slots_active ON backup_slots(is_active);

-- ============================================================================
-- BACKUP OFFERS (When cancellation matched to backup)
-- ============================================================================

CREATE TABLE backup_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_slot_id UUID NOT NULL REFERENCES backup_slots(id) ON DELETE CASCADE,
  cancelled_appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Offered slot details
  offered_start_time TIMESTAMPTZ NOT NULL,
  offered_end_time TIMESTAMPTZ NOT NULL,
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,

  -- Status
  status backup_offer_status DEFAULT 'pending',

  -- Incentive
  bonus_points INTEGER DEFAULT 50, -- loyalty points for accepting

  -- Response
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL, -- auto-expire after X minutes

  -- If accepted, link to new appointment
  accepted_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_backup_offers_slot ON backup_offers(backup_slot_id);
CREATE INDEX idx_backup_offers_client ON backup_offers(client_id);
CREATE INDEX idx_backup_offers_status ON backup_offers(status);
CREATE INDEX idx_backup_offers_expires ON backup_offers(expires_at);

-- ============================================================================
-- WALK-IN QUEUE
-- ============================================================================

CREATE TABLE queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  -- Walk-in details
  walk_in_name VARCHAR(255), -- for unregistered walk-ins
  walk_in_phone VARCHAR(20),

  -- Service & barber preference
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  preferred_barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL,
  any_barber BOOLEAN DEFAULT TRUE,

  -- Queue management
  position INTEGER,
  status queue_status DEFAULT 'waiting',
  estimated_wait_minutes INTEGER,

  -- Assignment
  assigned_barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,

  -- Completion
  called_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_queue_shop ON queue(shop_id);
CREATE INDEX idx_queue_status ON queue(status);
CREATE INDEX idx_queue_position ON queue(position);
CREATE INDEX idx_queue_created ON queue(created_at);

-- ============================================================================
-- LOYALTY & REFERRALS
-- ============================================================================

CREATE TABLE loyalty_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

  -- Event
  event_type VARCHAR(100) NOT NULL, -- booking, show_up, backup_accept, review, referral
  points INTEGER NOT NULL, -- positive or negative

  -- Reference
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  referral_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loyalty_events_client ON loyalty_events(client_id);
CREATE INDEX idx_loyalty_events_shop ON loyalty_events(shop_id);
CREATE INDEX idx_loyalty_events_created ON loyalty_events(created_at DESC);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  referrer_client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  referred_client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Reward tracking
  referrer_points_awarded INTEGER DEFAULT 0,
  referred_points_awarded INTEGER DEFAULT 0,

  -- First appointment tracking
  first_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  first_appointment_completed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_client_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_client_id);
CREATE INDEX idx_referrals_shop ON referrals(shop_id);

-- ============================================================================
-- NO-SHOW RULES
-- ============================================================================

CREATE TABLE no_show_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

  -- Rule configuration
  require_deposit BOOLEAN DEFAULT FALSE,
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  deposit_threshold_hours INTEGER DEFAULT 24, -- require deposit if booking within X hours

  -- Penalties
  no_show_fee DECIMAL(10, 2) DEFAULT 0,
  cancellation_window_hours INTEGER DEFAULT 24, -- free cancel if > X hours before
  late_cancellation_fee DECIMAL(10, 2) DEFAULT 0,

  -- Restrictions
  max_no_shows_before_deposit_required INTEGER DEFAULT 2,
  ban_after_no_shows INTEGER, -- optional: ban after X no-shows

  -- Backup booking settings
  backup_booking_enabled BOOLEAN DEFAULT TRUE,
  backup_auto_fill BOOLEAN DEFAULT TRUE,
  backup_offer_timeout_minutes INTEGER DEFAULT 15,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_no_show_rules_shop ON no_show_rules(shop_id);

-- ============================================================================
-- AUTOMATIONS
-- ============================================================================

CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

  -- Automation config
  type automation_type NOT NULL,
  name VARCHAR(255) NOT NULL,

  -- Trigger conditions (JSON)
  -- e.g., {days_after_appointment: 1, min_rating: 4} for review requests
  trigger_conditions JSONB DEFAULT '{}'::jsonb,

  -- Message template
  message_template TEXT,

  -- Channels
  send_sms BOOLEAN DEFAULT FALSE,
  send_email BOOLEAN DEFAULT FALSE,
  send_push BOOLEAN DEFAULT FALSE,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automations_shop ON automations(shop_id);
CREATE INDEX idx_automations_type ON automations(type);
CREATE INDEX idx_automations_active ON automations(is_active);

CREATE TABLE automation_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Execution details
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN,
  error_message TEXT,

  -- Tracking
  opened BOOLEAN DEFAULT FALSE,
  clicked BOOLEAN DEFAULT FALSE,
  converted BOOLEAN DEFAULT FALSE -- e.g., booked appointment, left review
);

CREATE INDEX idx_automation_executions_automation ON automation_executions(automation_id);
CREATE INDEX idx_automation_executions_client ON automation_executions(client_id);
CREATE INDEX idx_automation_executions_executed ON automation_executions(executed_at DESC);

-- ============================================================================
-- NOTIFICATIONS LOG
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  type notification_type NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,

  -- Delivery
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,

  -- Reference
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

  -- External IDs
  twilio_sid VARCHAR(255), -- for SMS
  sendgrid_message_id VARCHAR(255), -- for email

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_sent ON notifications(sent_at DESC);
CREATE INDEX idx_notifications_appointment ON notifications(appointment_id);

-- ============================================================================
-- REVIEWS
-- ============================================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,

  -- Rating
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  -- Routing
  is_public BOOLEAN DEFAULT FALSE, -- if true, pushed to Google/Yelp
  is_private BOOLEAN DEFAULT FALSE, -- if true, owner-only feedback

  -- External
  google_review_url TEXT,
  yelp_review_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_shop ON reviews(shop_id);
CREATE INDEX idx_reviews_barber ON reviews(barber_id);
CREATE INDEX idx_reviews_client ON reviews(client_id);
CREATE INDEX idx_reviews_appointment ON reviews(appointment_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================================================
-- ANALYTICS TABLES (Pre-aggregated for performance)
-- ============================================================================

CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE, -- null = shop-level
  date DATE NOT NULL,

  -- Appointments
  total_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  cancellations INTEGER DEFAULT 0,

  -- Revenue
  gross_revenue DECIMAL(10, 2) DEFAULT 0,
  discounts DECIMAL(10, 2) DEFAULT 0,
  net_revenue DECIMAL(10, 2) DEFAULT 0,

  -- Utilization
  scheduled_minutes INTEGER DEFAULT 0,
  available_minutes INTEGER DEFAULT 0,
  utilization_rate DECIMAL(5, 2) DEFAULT 0,

  -- Backup booking
  slots_filled_by_backup INTEGER DEFAULT 0,
  revenue_recovered DECIMAL(10, 2) DEFAULT 0,

  -- No-show costs
  no_show_cost DECIMAL(10, 2) DEFAULT 0, -- lost revenue

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(shop_id, barber_id, date)
);

CREATE INDEX idx_daily_metrics_shop_date ON daily_metrics(shop_id, date DESC);
CREATE INDEX idx_daily_metrics_barber_date ON daily_metrics(barber_id, date DESC);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON barbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backup_slots_updated_at BEFORE UPDATE ON backup_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queue_updated_at BEFORE UPDATE ON queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_no_show_rules_updated_at BEFORE UPDATE ON no_show_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
