# Space Child Dream

## Overview
Space Child Dream is a consciousness exploration platform based on the mHC (Manifold-Constrained Hyper-Connections) research paper from DeepSeek-AI. Users can explore consciousness through interactive AI-powered "consciousness probes" that generate poetic reflections with resonance and complexity scores.

## Recent Changes (January 2026)

### Authentication & Users
- Integrated Replit Auth for user signup/login (supports Google, GitHub, Apple, email)
- User sessions stored in PostgreSQL via connect-pg-simple
- User profile includes first/last name, email, profile image

### Account Management
- Account page at `/account` with tabs: Profile, Usage, History, Subscription
- Usage dashboard showing daily probes, total explorations, plan features
- Thought history with resonance/complexity scores and reflections

### mHC Adaptive Prompt Engine
- System prompts stored in `prompt_versions` table and evolve over time
- Prompts can be tier-specific (free/pro/enterprise) or universal ("all")
- Safety constraints preserved during evolution
- Located in `server/services/prompt-evolution.ts`

### Subscription System (Stripe)
- Three tiers: Free ($0), Pro ($9/mo), Enterprise ($29/mo)
- Stripe Checkout integration for upgrades
- Customer portal for subscription management
- Webhook handler at `/api/webhooks/stripe` with signature verification
- Requires: `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_ENTERPRISE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`

### Plan Entitlements
- Rate limiting middleware in `server/middleware/entitlements.ts`
- Free: 10 daily probes, 7 days history
- Pro: 100 daily probes, 90 days history, export, prompt evolution
- Enterprise: Unlimited probes, unlimited history, API access, custom prompts

### Social Sharing
- Share page at `/share/:slug` for shared thoughts
- Twitter and LinkedIn share buttons
- Copy link functionality
- Public gallery endpoint (stub for future expansion)

### SEO Improvements
- Dynamic meta tags in `client/index.html`
- JSON-LD structured data for WebApplication schema
- Sitemap at `/sitemap.xml`
- Robots.txt at `/robots.txt`
- OG meta endpoint at `/api/og/:slug`

## Project Architecture

### Frontend (React + Vite)
- `client/src/pages/` - Page components (home, account, share)
- `client/src/components/` - Reusable UI components
- `client/src/hooks/` - Custom React hooks (use-auth, use-toast)
- `client/src/lib/` - Utilities (queryClient, auth-utils)

### Backend (Express + TypeScript)
- `server/routes.ts` - API route definitions
- `server/storage.ts` - Database operations via Drizzle ORM
- `server/services/` - Business logic (stripe, prompt-evolution)
- `server/middleware/` - Express middleware (entitlements)
- `server/replit_integrations/` - Replit Auth, Chat, Image integrations

### Database (PostgreSQL)
- `users` - User accounts (Replit Auth)
- `sessions` - Session storage
- `thoughts` - Consciousness probe results
- `prompt_versions` - Evolving system prompts
- `subscriptions` - Stripe subscription data
- `usage_ledger` - Token usage tracking
- `shared_visualizations` - Public share records

### Schema Location
- `shared/schema.ts` - Drizzle schema definitions
- `shared/models/auth.ts` - Auth-related tables (users, sessions)

## Environment Variables

### Required for Authentication
- `SESSION_SECRET` - Session encryption key (auto-provided by Replit)

### Required for AI Features
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI base URL

### Required for Payments (Optional)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PRO_PRICE_ID` - Stripe price ID for Pro plan
- `STRIPE_ENTERPRISE_PRICE_ID` - Stripe price ID for Enterprise plan
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

## User Preferences
- Dark theme with cyan/purple gradient aesthetic
- Space/neural network visual motifs
- Scientific/research-oriented language

## Running the Application
```bash
npm run dev      # Development server
npm run db:push  # Push schema changes to database
```

## Key Endpoints
- `POST /api/consciousness/probe` - Generate consciousness probe (rate-limited)
- `GET /api/thoughts/history` - User's thought history (authenticated)
- `GET /api/usage/stats` - User usage statistics (authenticated)
- `POST /api/billing/checkout` - Create Stripe checkout session
- `POST /api/billing/portal` - Create Stripe customer portal session
- `POST /api/thoughts/:id/share` - Share a thought publicly
- `GET /api/share/:slug` - Get shared thought data
