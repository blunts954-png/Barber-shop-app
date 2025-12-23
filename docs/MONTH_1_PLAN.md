# Month 1 Implementation Plan - "Functional Spine"

## Overview

This document outlines the detailed technical implementation plan for Month 1 of the Barbershop OS project. The goal is to build the "functional spine" - the core booking system with backup booking logic that differentiates this product from competitors.

## Week-by-Week Breakdown

### Week 1: Data Models & Core Booking API

**Goal**: Establish database foundation and basic booking functionality

#### Tasks

1. **Database Setup** ✅ DONE
   - [x] PostgreSQL schema with all core tables
   - [x] Redis setup for real-time operations
   - [ ] Migration scripts and seed data
   - [ ] Database connection pooling optimization

2. **Core API Endpoints**
   - [ ] POST `/api/appointments` - Create appointment
   - [ ] GET `/api/appointments/:id` - Get appointment details
   - [ ] GET `/api/appointments/shop/:shopId` - List shop appointments
   - [ ] GET `/api/appointments/barber/:barberId` - List barber appointments
   - [ ] PATCH `/api/appointments/:id` - Update appointment
   - [ ] DELETE `/api/appointments/:id` - Cancel appointment

3. **Authentication System**
   - [ ] JWT token generation and validation
   - [ ] Password hashing with bcrypt
   - [ ] POST `/api/auth/register` - User registration
   - [ ] POST `/api/auth/login` - User login
   - [ ] GET `/api/auth/me` - Current user profile
   - [ ] Middleware for protected routes

4. **Basic Models & Services**
   - [ ] Shop model and CRUD operations
   - [ ] Barber model and CRUD operations
   - [ ] Client model and CRUD operations
   - [ ] Service model and CRUD operations
   - [ ] Appointment model with validation

**Deliverables**:
- Functional auth system
- Basic booking API (primary appointments only, no backup yet)
- Seed data for 1-2 test shops with barbers and services

---

### Week 2: Backup Booking Logic & Owner Dashboard

**Goal**: Implement the core differentiator - intelligent backup booking

#### Tasks

1. **Backup Slot Creation**
   - [ ] POST `/api/appointments/:id/backup-slots` - Add backup preferences
   - [ ] GET `/api/backup-slots/client/:clientId` - List client's backup slots
   - [ ] DELETE `/api/backup-slots/:id` - Remove backup slot
   - [ ] Validation: ensure backup dates within 2-3 days of primary
   - [ ] Client UI integration (add backup during booking flow)

2. **Cancellation → Backup Matching Algorithm**
   - [ ] Service: `BackupMatchingService`
   - [ ] Functions:
     ```typescript
     findEligibleCandidates(cancelledAppointment): BackupCandidate[]
     rankCandidates(candidates): RankedBackupCandidate[]
     createBackupOffer(topCandidate, slot): BackupOffer
     ```
   - [ ] Ranking logic implementation (reliability, loyalty, service/barber fit)
   - [ ] Redis caching for fast candidate lookup

3. **Backup Offer Flow**
   - [ ] Create backup offer when appointment cancelled
   - [ ] POST `/api/backup-offers/:id/accept` - Client accepts offer
   - [ ] POST `/api/backup-offers/:id/decline` - Client declines offer
   - [ ] Expiry logic (15-minute timeout)
   - [ ] Cascade to next candidate on decline/expiry
   - [ ] WebSocket notifications for real-time offers

4. **Owner Dashboard MVP**
   - [ ] GET `/api/analytics/dashboard/:shopId` - Dashboard metrics
   - [ ] Metrics calculated:
     - Total revenue (today, week, month)
     - Utilization rate per barber
     - No-show count and cost
     - Appointments completed vs scheduled
   - [ ] Frontend: Dashboard page with StatCards
   - [ ] Real-time updates via WebSocket

**Deliverables**:
- Working backup booking system
- Cancellation triggers backup offer to ranked candidates
- Basic owner dashboard showing key metrics

---

### Week 3: Barber App & No-Show Rules Engine

**Goal**: Build barber-facing tools and no-show prevention

#### Tasks

1. **Barber Today View**
   - [ ] GET `/api/barber/:barberId/schedule/today` - Today's schedule
   - [ ] Mixed view: appointments + walk-ins
   - [ ] Realistic ETAs based on service duration
   - [ ] Mobile UI: Today tab with appointment cards
   - [ ] Status updates: start, complete, running late

2. **Walk-In Queue Management**
   - [ ] POST `/api/queue` - Add walk-in to queue
   - [ ] GET `/api/queue/shop/:shopId` - Get shop queue
   - [ ] PATCH `/api/queue/:id` - Update queue entry (status, position)
   - [ ] DELETE `/api/queue/:id` - Remove from queue
   - [ ] Queue position calculation and ETA updates
   - [ ] WebSocket for real-time queue updates

3. **Client Card & Checkout**
   - [ ] GET `/api/clients/:id/history` - Client appointment history
   - [ ] Client card component showing:
     - Last cuts (date, service, notes)
     - Preferred style/notes
     - Reliability score
     - Loyalty tier
   - [ ] Checkout flow with upsell prompts
   - [ ] POST `/api/appointments/:id/complete` - Mark complete, process payment

4. **No-Show Rules Engine**
   - [ ] Shop-level no-show rule configuration
   - [ ] POST/PATCH `/api/shops/:shopId/no-show-rules`
   - [ ] Rules:
     - Require deposit (threshold hours)
     - No-show fee
     - Cancellation window
     - Deposit requirement after X no-shows
   - [ ] Service: `NoShowRulesService.applyRules(appointment)`
   - [ ] Integration with Stripe for deposits

**Deliverables**:
- Barber mobile app with today view and queue management
- No-show rules configured per shop
- Deposit collection integrated

---

### Week 4: Client Booking UI & Notifications

**Goal**: Client-facing booking experience with backup selection

#### Tasks

1. **Client Booking Flow**
   - [ ] Service selection screen
   - [ ] Barber selection (preferred or any)
   - [ ] Date/time selection with availability check
   - [ ] GET `/api/availability/:barberId` - Available time slots
   - [ ] Backup date selection UI
     - [ ] "Add backup dates" toggle
     - [ ] Clear explanation of benefits (faster cut, bonus points)
     - [ ] 1-2 backup slot selection
   - [ ] Booking confirmation screen
   - [ ] Deposit payment if required

2. **Availability Calculation**
   - [ ] Service: `AvailabilityService`
   - [ ] Functions:
     ```typescript
     getAvailableSlots(barberId, date): TimeSlot[]
     isSlotAvailable(barberId, startTime, duration): boolean
     ```
   - [ ] Consider: barber working hours, existing appointments, buffer time
   - [ ] Cache in Redis for performance

3. **Notification System**
   - [ ] SMS notifications (Twilio integration)
   - [ ] Email notifications (SendGrid integration)
   - [ ] Notification templates:
     - Appointment confirmation
     - Reminder (24h before)
     - Backup offer available
     - Appointment cancelled
   - [ ] Service: `NotificationService.send(userId, template, data)`
   - [ ] Notification log table tracking

4. **Loyalty Points**
   - [ ] POST `/api/loyalty/events` - Record loyalty event
   - [ ] Automatic points on:
     - Booking (10 pts)
     - Show up (20 pts)
     - Accept backup (50 pts)
   - [ ] GET `/api/clients/:id/loyalty` - Get points and tier
   - [ ] Tier calculation based on thresholds

**Deliverables**:
- Client mobile app with full booking flow
- Backup slot selection integrated
- Notifications for confirmations, reminders, backup offers
- Loyalty points tracking

---

## Technical Priorities

### Performance Targets
- API response time: < 200ms (p95)
- Backup matching: < 500ms
- Real-time updates: < 100ms latency

### Testing Strategy
- Unit tests for business logic (scoring, availability, matching)
- Integration tests for API endpoints
- E2E tests for critical flows (booking, cancellation→backup)

### DevOps
- Docker setup for local development
- CI/CD pipeline (GitHub Actions)
- Staging environment deployment
- Error tracking (Sentry or similar)

---

## Success Criteria for Month 1

By end of Week 4, we must have:

1. ✅ Core booking system working (create, view, cancel appointments)
2. ✅ Backup booking fully functional:
   - Clients can add 1-2 backup dates during booking
   - Cancellations trigger ranked backup offers
   - Offers expire after 15 minutes, cascade to next candidate
3. ✅ Owner dashboard shows:
   - Revenue (net, gross)
   - Utilization per barber
   - No-show cost
   - Backup fill rate
4. ✅ Barber app has:
   - Today view with appointments + walk-ins
   - Queue management
   - Checkout with upsell prompts
5. ✅ Client app has:
   - Full booking flow
   - Backup slot selection
   - Loyalty points display
6. ✅ Notifications working:
   - SMS/email for confirmations, reminders
   - Real-time push for backup offers

---

## Key Metrics to Track

From Day 1, instrument these metrics:

1. **Backup Booking Metrics**
   - % of bookings with backup slots added
   - Backup offer acceptance rate
   - Slots filled via backup (count & revenue)
   - Time to fill cancelled slot

2. **Utilization Metrics**
   - Scheduled minutes / available minutes (per barber, per day)
   - Idle time per barber
   - Walk-in wait time

3. **Revenue Metrics**
   - Gross revenue per day
   - Discounts and no-show costs
   - Net revenue
   - Revenue per chair per hour

4. **Client Behavior**
   - No-show rate
   - Cancellation rate
   - Loyalty tier distribution
   - Avg appointment interval

These metrics feed directly into Month 2's advanced analytics and automation engine.

---

## Next Steps After Month 1

Once functional spine is complete, Month 2 will add:

- Advanced profit-per-chair analytics
- Automation engine (reviews, reactivation, upsells)
- Referral system
- Dynamic pricing rules
- Beta testing with 2-5 live shops

---

## Notes & Assumptions

1. **Stripe Integration**: Assumes Stripe Connect for multi-shop support
2. **Timezones**: All times stored in UTC, converted to shop timezone for display
3. **Mobile**: Using Expo for faster development; can eject if needed
4. **Real-time**: WebSockets for queue updates and backup offers; fallback to polling
5. **Scaling**: PostgreSQL + Redis sufficient for 100+ shops; consider sharding after 1000+

---

## Development Environment Setup

```bash
# Install dependencies
npm install

# Start PostgreSQL and Redis
docker-compose up -d

# Run migrations
cd packages/database
npm run migrate:up

# Seed test data
npm run seed

# Start backend dev server
cd apps/backend
npm run dev

# Start web frontend (in another terminal)
cd apps/web
npm run dev

# Start mobile app (in another terminal)
cd apps/mobile
npm start
```

Visit:
- Backend API: http://localhost:3001
- GraphQL Playground: http://localhost:3001/graphql
- Web Dashboard: http://localhost:3000
- Mobile: Expo Go app

---

**Document Version**: 1.0
**Last Updated**: 2025-12-23
**Owner**: Development Team
