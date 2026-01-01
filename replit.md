# Space Child Dream

## Overview
Space Child Dream is a consciousness exploration platform based on the mHC (Manifold-Constrained Hyper-Connections) research paper from DeepSeek-AI. Users can explore consciousness through interactive AI-powered "consciousness probes" that generate poetic reflections with resonance and complexity scores.

## Recent Changes (January 2026)

### Space Child Auth (NEW - Replaces Replit Auth)
- Custom authentication system with ZKP (zero-knowledge proof) foundation
- JWT-based authentication with access/refresh token rotation
- Password hashing using bcrypt (12 rounds)
- ZK credentials generated using circomlibjs (Poseidon hashing)
- Cross-subdomain SSO support with JWKS endpoint
- Token refresh with rotation and revocation
- Frontend auth modal with login/register forms
- Located in `server/services/space-child-auth.ts` and `server/space-child-auth-routes.ts`

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
- `client/src/components/` - Reusable UI components (auth-modal, user-nav)
- `client/src/hooks/` - Custom React hooks (use-auth, use-toast)
- `client/src/lib/` - Utilities (queryClient, auth-utils)

### Backend (Express + TypeScript)
- `server/routes.ts` - API route definitions
- `server/storage.ts` - Database operations via Drizzle ORM
- `server/services/` - Business logic (space-child-auth, stripe, prompt-evolution)
- `server/space-child-auth-routes.ts` - Space Child Auth API routes
- `server/middleware/` - Express middleware (entitlements)
- `server/replit_integrations/` - Chat and Image AI integrations

### Database (PostgreSQL)
- `users` - User accounts with password hash and ZK credentials
- `zk_credentials` - Zero-knowledge proof credentials
- `proof_sessions` - ZKP authentication sessions
- `refresh_tokens` - JWT refresh token storage with revocation
- `subdomain_access` - Cross-subdomain access records
- `sessions` - Legacy session storage (kept for compatibility)
- `thoughts` - Consciousness probe results
- `prompt_versions` - Evolving system prompts
- `subscriptions` - Stripe subscription data
- `usage_ledger` - Token usage tracking
- `shared_visualizations` - Public share records

### Schema Location
- `shared/schema.ts` - Drizzle schema definitions
- `shared/models/auth.ts` - Auth-related tables (users, zk_credentials, proof_sessions, refresh_tokens)

## Environment Variables

### Required for Authentication
- `SESSION_SECRET` - JWT signing key (auto-provided by Replit)

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

### Space Child Auth
- `POST /api/space-child-auth/register` - Create new account
- `POST /api/space-child-auth/login` - Login with email/password
- `POST /api/space-child-auth/refresh` - Refresh access token
- `GET /api/space-child-auth/user` - Get current user (requires Bearer token)
- `POST /api/space-child-auth/logout` - Logout and revoke tokens
- `GET /api/space-child-auth/.well-known/jwks.json` - JWKS endpoint for cross-domain verification
- `POST /api/space-child-auth/zk/request` - Create ZKP auth session
- `POST /api/space-child-auth/zk/verify` - Verify ZKP and authenticate

### Application
- `POST /api/consciousness/probe` - Generate consciousness probe (rate-limited)
- `GET /api/thoughts/history` - User's thought history (authenticated)
- `GET /api/usage/stats` - User usage statistics (authenticated)
- `POST /api/billing/checkout` - Create Stripe checkout session
- `POST /api/billing/portal` - Create Stripe customer portal session
- `POST /api/thoughts/:id/share` - Share a thought publicly
- `GET /api/share/:slug` - Get shared thought data

## Future Enhancements
- Integration with Google's longfellow-zk library for production ZKP
- Wallet-based authentication using ZKP credentials
- Complete proof session verification flow
