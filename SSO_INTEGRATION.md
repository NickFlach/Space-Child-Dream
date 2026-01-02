# Space Child Auth SSO Integration Guide

This document describes how to integrate Space Child Auth SSO into all applications in the Source directory.

## Architecture Overview

**Space-Child-Dream** serves as the central authentication server. All other apps redirect to Space-Child-Dream for login, then receive tokens back via URL callback.

### User Flow
1. User visits any app in the ecosystem
2. If not authenticated, clicks "Sign in with Space Child"
3. Redirected to Space-Child-Dream
4. Sees starfield splash screen (9 seconds)
5. Enters thought into Neural Interface
6. After resonance response, clicks "Entry Granted"
7. Lands on Dashboard with access to all apps
8. Can click to launch any app (SSO tokens passed)

## SSO Endpoints (Space-Child-Dream)

### Authorization
```
GET /api/space-child-auth/sso/authorize?subdomain={app}&callback={url}
```
Redirects authenticated users back to callback with tokens.

### Token Verification
```
POST /api/space-child-auth/sso/verify
Body: { token: string, subdomain: string }
Response: { valid: boolean, userId, email, firstName, lastName, subdomain }
```

### Token Refresh
```
POST /api/space-child-auth/refresh
Body: { refreshToken: string }
Response: { accessToken, refreshToken }
```

## App Integration

### 1. Add SSO Client Library
Copy `space-child-sso.ts` to your app's lib folder (already done for all repos).

### 2. Add Environment Variable
```env
VITE_SPACE_CHILD_AUTH_URL=https://space-child-dream.replit.app
```

### 3. Create SSO Hook
Create `useSpaceChildAuth.ts` with your app's subdomain:

```typescript
import { getSpaceChildSSO } from '@/lib/space-child-sso';

const SUBDOMAIN = 'your-app-name'; // e.g., 'spacechild', 'angel-informant'

// ... rest of hook (see SpaceChild for example)
```

### 4. Add SSO Callback Route
Add route `/sso/callback` that handles token extraction from URL.

### 5. Add Login Button
```tsx
const { login, logout, user, isLoading } = useSpaceChildAuth();

return user ? (
  <button onClick={logout}>Logout</button>
) : (
  <button onClick={login}>Sign in with Space Child</button>
);
```

## Subdomain Mappings

| App | Subdomain | Category |
|-----|-----------|----------|
| SpaceChild | `spacechild` | Development |
| SpaceChildCollective | `spacechild-collective` | Research |
| FlaukowskiFashion | `flaukowski-fashion` | Fashion |
| FlaukowskiMind | `flaukowski-mind` | Experimental |
| angel-informant | `angel-informant` | Investing |
| cosmic-empathy-core | `cosmic-empathy-core` | Experimental |
| ninja-craft-hub | `ninja-craft-hub` | Development |
| space-child-learn | `space-child-learn` | Learning |

## Dashboard Categories

- **Art**: SpaceChildWaitlist (coming soon)
- **Research**: SpaceChildCollective
- **Fashion**: FlaukowskiFashion
- **Learning**: space-child-learn
- **Investing**: angel-informant
- **Development**: ninja-craft-hub, SpaceChild
- **Experimental**: cosmic-empathy-core, FlaukowskiMind

## Admin Management

Admins (email contains "admin" or "flaukowski") can access the management portal from the Neural Interface page. Features:
- View all users
- Revoke user sessions
- Resend verification emails
- View connected apps status

## Security Notes

- All apps must use the same `SESSION_SECRET` environment variable
- Tokens are JWT with issuer `space-child-auth`
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Subdomain is embedded in tokens for validation

## Files Created/Modified

### Space-Child-Dream
- `client/src/components/starfield-splash.tsx` - 3D starfield splash screen
- `client/src/pages/neural-interface.tsx` - Entry point with splash + Entry Granted
- `client/src/pages/dashboard.tsx` - Unified dashboard with app categories
- `client/src/components/admin-portal.tsx` - Admin management modal
- `server/space-child-auth-routes.ts` - Added SSO + admin endpoints
- `server/storage.ts` - Added getAllUsers method

### All Other Apps
- `*/lib/space-child-sso.ts` - SSO client library (copied to all)

## Next Steps

1. Update `VITE_SPACE_CHILD_AUTH_URL` in each app's .env
2. Create app-specific `useSpaceChildAuth.ts` hooks with correct subdomain
3. Update each app's login UI to use SSO
4. Update dashboard.tsx with actual deployment URLs
5. Test SSO flow end-to-end
