# Barbershop OS

A barbershop-native management system focused on utilization, intelligent backup booking, and profit-per-chair analytics.

## Architecture

This is a monorepo containing:

- **apps/backend** - Node.js + TypeScript API (GraphQL/REST + WebSockets)
- **apps/web** - React web application (Owner Dashboard)
- **apps/mobile** - React Native mobile app (Barber + Client apps)
- **packages/shared** - Shared types, utilities, and business logic
- **packages/database** - Database schema and migrations (PostgreSQL)

## Tech Stack

- **Backend**: Node.js, TypeScript, Express, GraphQL, WebSockets
- **Frontend**: React, TypeScript, Tailwind CSS
- **Mobile**: React Native, Expo
- **Database**: PostgreSQL (primary), Redis (real-time/caching)
- **Auth**: JWT + OAuth
- **Payments**: Stripe

## Getting Started

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Build all packages
npm run build

# Run tests
npm run test
```

## Pricing Tiers

- **Starter** ($79/month): 1-2 barbers, core booking, walk-in queue
- **Pro** ($149/month): Up to 5 barbers, backup booking, loyalty, automation
- **Elite** ($299/month): Unlimited barbers, advanced analytics, dynamic pricing

## Core Features

1. **Intelligent Backup Booking** - Automatically fill cancellation gaps
2. **Profit-per-Chair Analytics** - Track revenue, utilization, and margins per chair
3. **Three Apps**: Owner Dashboard, Barber App, Client App
4. **Automation Engine** - Retention, reactivation, and upsell campaigns
5. **No-Show Prevention** - Deposits, backup slots, reliability scoring

## Development Roadmap

### Month 1 - Functional Spine
- Week 1: Data models, core booking API, queue model
- Week 2: Backup booking logic, basic Owner dashboard
- Week 3: Barber app MVP, no-show rules engine
- Week 4: Client booking UI, notifications

### Month 2 - Real OS
- Week 5: Cancellation matching algorithm, owner controls
- Week 6: Loyalty, referrals, review routing
- Week 7: Automation flows, expanded analytics
- Week 8: Beta testing with 2-5 live shops

## License

Proprietary
