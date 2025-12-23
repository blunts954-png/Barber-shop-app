# Barbershop OS - Technical Architecture

## System Overview

Barbershop OS is a barbershop-native management platform focused on maximizing chair utilization through intelligent backup booking and profit-per-chair analytics.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                           │
├─────────────────────────┬───────────────────────────────────┤
│   Web Dashboard         │     Mobile App (iOS/Android)       │
│   (Owner)               │     (Barber + Client)             │
│   - React               │     - React Native + Expo          │
│   - Tailwind CSS        │     - Expo Router                  │
│   - React Query         │     - React Query                  │
└───────────┬─────────────┴──────────────┬────────────────────┘
            │                            │
            └────────────┬───────────────┘
                         │ HTTPS / WebSocket
            ┌────────────┴────────────────────────────────────┐
            │           API Gateway / Backend                  │
            │           - Node.js + TypeScript                 │
            │           - Express                              │
            │           - GraphQL (Yoga)                       │
            │           - WebSocket (ws)                       │
            └────────────┬───────────────┬────────────────────┘
                         │               │
            ┌────────────┴───────┐   ┌───┴──────────────────┐
            │   PostgreSQL       │   │   Redis              │
            │   (Primary DB)     │   │   (Cache + Queue)    │
            │   - Shops          │   │   - Sessions         │
            │   - Users          │   │   - Real-time data   │
            │   - Appointments   │   │   - Backup matching  │
            │   - Analytics      │   │   - Rate limiting    │
            └────────────────────┘   └──────────────────────┘
                         │
            ┌────────────┴────────────────────────────────────┐
            │         External Services                        │
            │   - Stripe (Payments & Subscriptions)           │
            │   - Twilio (SMS Notifications)                  │
            │   - SendGrid (Email Notifications)              │
            │   - AWS S3 (File Storage - optional)            │
            └─────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

**Web Dashboard (Owner)**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React

**Mobile App (Barber + Client)**
- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based)
- **State Management**: React Query
- **Navigation**: React Navigation (via Expo Router)
- **UI**: React Native built-in components

### Backend

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3+
- **Framework**: Express.js
- **GraphQL**: GraphQL Yoga
- **WebSocket**: ws library
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Zod

### Database

**PostgreSQL 16**
- Primary data store for all persistent data
- Tables: shops, users, barbers, clients, appointments, backup_slots, queue, loyalty_events, etc.
- Connection pooling via pg library
- Migrations via node-pg-migrate

**Redis 7**
- Session storage
- Real-time queue management
- Backup matching candidate cache
- Rate limiting
- WebSocket connection tracking

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **Hosting**: AWS / Heroku / Railway (TBD)
- **CI/CD**: GitHub Actions
- **Monitoring**: TBD (Sentry, DataDog, etc.)

## Core Business Logic Modules

### 1. Booking Engine

**Purpose**: Core appointment scheduling with availability checking

**Key Functions**:
```typescript
createAppointment(data): Appointment
checkAvailability(barberId, startTime, duration): boolean
getAvailableSlots(barberId, date): TimeSlot[]
cancelAppointment(appointmentId, reason): void
```

**Business Rules**:
- Respect barber working hours and booking buffer
- Prevent double-booking
- Calculate deposit requirements based on no-show rules
- Handle walk-in → appointment conversion

### 2. Backup Booking System

**Purpose**: Intelligently fill cancelled slots from backup preferences

**Key Components**:

**BackupMatchingService**
```typescript
findEligibleCandidates(cancelledAppointment): BackupCandidate[]
rankCandidates(candidates): RankedBackupCandidate[]
createBackupOffer(topCandidate, slot): BackupOffer
handleOfferResponse(offerId, accepted): void
```

**Ranking Algorithm**:
1. **Reliability Score** (40% weight)
   - Completion rate
   - No-show history
   - Cancellation history

2. **Service Fit** (25% weight)
   - Exact match = 1.0
   - Similar duration = 0.5

3. **Barber Fit** (20% weight)
   - Preferred barber = 1.0
   - Any barber OK = 0.7

4. **Loyalty Tier** (15% weight)
   - Platinum: 1.5x multiplier
   - Gold: 1.3x
   - Silver: 1.1x
   - Bronze: 1.0x

**Flow**:
```
Appointment Cancelled
    ↓
Find eligible backup slots (same service, within time window)
    ↓
Rank candidates by score
    ↓
Create offer for top candidate (15-min expiry)
    ↓
Send push notification
    ↓
IF accepted → create new appointment, award bonus points
IF declined/expired → offer to next candidate
```

### 3. No-Show Prevention

**Purpose**: Minimize revenue loss from no-shows

**NoShowRulesService**
```typescript
applyRules(appointment): DepositRequirement
calculatePenalty(client): number
requiresDeposit(client, appointment): boolean
```

**Rules**:
- Require deposit if booking within X hours (default: 24h)
- Require deposit if client has > Y no-shows (default: 2)
- Charge no-show fee on failure to appear
- Allow free cancellation if > Z hours before (default: 24h)

### 4. Queue Management

**Purpose**: Manage walk-in queue with real-time updates

**QueueService**
```typescript
addToQueue(walkIn): QueueEntry
updatePosition(queueId, newPosition): void
assignBarber(queueId, barberId): void
calculateWaitTime(queueId): number
```

**Features**:
- Auto-calculate wait times based on current appointments
- Allow barbers to accept/skip walk-ins
- WebSocket updates for live queue changes
- Smart insertion: fill short gaps between appointments

### 5. Analytics Engine

**Purpose**: Calculate profit-per-chair and utilization metrics

**AnalyticsService**
```typescript
calculateProfitPerChair(shopId, dateRange): ProfitPerChair[]
calculateUtilization(barberId, dateRange): number
getShopAnalytics(shopId, dateRange): ShopAnalytics
```

**Key Metrics**:
1. **Revenue**
   - Gross revenue
   - Discounts
   - No-show cost (lost revenue)
   - Net revenue

2. **Utilization**
   - Scheduled minutes / available minutes
   - Per barber, per day/week/month

3. **Backup Booking Impact**
   - Slots filled by backup
   - Revenue recovered
   - Fill rate %

4. **Service Economics**
   - Revenue per service type
   - Avg duration
   - Margin
   - Revenue per hour

### 6. Loyalty & Referral System

**LoyaltyService**
```typescript
awardPoints(clientId, eventType, points): void
calculateTier(points): LoyaltyTier
processReferral(referrerId, referredId): void
```

**Point Events**:
- Booking: +10
- Show up: +20
- Accept backup: +50
- Review: +30
- Referral (both parties): +100
- No-show penalty: -50
- Late cancellation: -20

**Tiers**:
- Bronze: 0-499 pts
- Silver: 500-1499 pts
- Gold: 1500-2999 pts
- Platinum: 3000+ pts

### 7. Automation Engine

**Purpose**: Automated campaigns for retention and reactivation

**AutomationService**
```typescript
triggerAutomation(type, clientId): void
scheduleReactivation(clientId): void
sendReviewRequest(appointmentId): void
```

**Automation Types**:
1. **Review Request**: 24h after appointment, if rating likely > 4
2. **Reactivation**: When client is "due" (based on avg interval + 7 days)
3. **Birthday/Seasonal**: On birthdays or holidays
4. **Upsell**: Recommend add-ons based on history

## Data Flow Examples

### Example 1: Client Books Appointment with Backup

```
1. Client opens booking screen
2. Selects service: "Fade" (30 min, $35)
3. Selects barber: "John"
4. Selects primary time: "Friday 2:00 PM"
5. App offers: "Add backup dates for faster appointment + bonus points?"
6. Client selects backup: "Thursday 3:00 PM" and "Friday 4:00 PM"
7. App checks availability for all 3 slots
8. App calculates deposit requirement (booking is within 24h)
9. Client pays deposit: $10 via Stripe
10. Backend creates:
    - 1 Appointment (scheduled for Friday 2PM)
    - 2 BackupSlots (Thursday 3PM, Friday 4PM)
11. Client receives confirmation SMS/email
12. Loyalty points awarded: +10 for booking
```

### Example 2: Cancellation Triggers Backup Fill

```
1. Client A cancels Friday 2:00 PM appointment
2. Backend triggers: BackupMatchingService.findCandidates()
3. System finds 3 clients with backup slots matching:
   - Client B: Friday 4:00 PM backup (reliability: 0.95, tier: Gold)
   - Client C: Thursday 3:00 PM backup (reliability: 0.80, tier: Silver)
   - Client D: Friday 3:30 PM backup (reliability: 0.85, tier: Bronze)
4. Ranking algorithm scores:
   - Client B: 0.92 (highest)
   - Client C: 0.78
   - Client D: 0.72
5. System creates BackupOffer for Client B
6. Push notification sent: "Slot available Friday 2PM with John! Accept within 15 min for +50 pts"
7. Client B accepts within 5 minutes
8. Backend:
   - Creates new Appointment for Client B at Friday 2PM
   - Deactivates Client B's backup slots
   - Awards +50 loyalty points
   - Marks original appointment as "backup filled"
9. Shop owner sees in dashboard: "1 slot recovered, $35 revenue saved"
```

### Example 3: Barber Manages Queue

```
1. Walk-in arrives at shop
2. Receptionist adds to queue via tablet/mobile
3. Walk-in name: "Mike", service: "Lineup"
4. System calculates wait time: 25 minutes (based on current appointments)
5. WebSocket broadcasts queue update to all connected barbers
6. Barber "John" finishes current client early
7. John's app shows: "2 people in queue, Mike is next"
8. John taps "Call Next"
9. System updates queue status: Mike → "called"
10. System inserts appointment for Mike in John's schedule
11. John completes cut, checks out via app
12. Checkout shows upsell: "Add beard trim? (+$15)"
13. Mike accepts, total: $35
14. John processes payment, Mike earns loyalty points
```

## Security Considerations

1. **Authentication**
   - JWT tokens with 7-day expiry
   - Secure password hashing (bcrypt, cost factor 10)
   - Role-based access control (owner, barber, client)

2. **Authorization**
   - Owners can only access their own shop data
   - Barbers can only view/edit appointments for their shop
   - Clients can only view/edit their own appointments

3. **Data Protection**
   - HTTPS only in production
   - Environment variables for secrets
   - Stripe for PCI-compliant payment handling
   - No storing of credit card details

4. **Rate Limiting**
   - API rate limits via Redis
   - 100 requests/minute per user
   - 1000 requests/minute per shop

## Scaling Considerations

### Current Capacity (Phase 1)
- Target: 100 shops, ~500 barbers, ~50,000 clients
- PostgreSQL: Single instance, sufficient for this load
- Redis: Single instance
- Backend: Horizontal scaling via load balancer

### Future Scaling (Phase 2: 1000+ shops)
- PostgreSQL: Read replicas for analytics queries
- Redis: Cluster mode for high availability
- Backend: Multi-region deployment
- Caching: CDN for static assets, Redis for hot data

## Deployment Architecture

```
GitHub
  ↓ (push to main)
GitHub Actions CI/CD
  ↓
  - Run tests
  - Build Docker images
  - Push to registry
  ↓
Deploy to Staging
  ↓ (manual approval)
Deploy to Production
  ↓
  - Blue/green deployment
  - Health checks
  - Rollback on failure
```

## Monitoring & Observability

**Metrics to Track**:
- API response times (p50, p95, p99)
- Error rates
- Database query performance
- WebSocket connection count
- Backup booking metrics (fill rate, acceptance rate)
- Revenue metrics

**Logging**:
- Structured logging (JSON)
- Centralized log aggregation
- Error tracking (Sentry or similar)

**Alerts**:
- API error rate > 5%
- Database connection pool exhausted
- Redis connection lost
- Payment processing failures

---

**Document Version**: 1.0
**Last Updated**: 2025-12-23
