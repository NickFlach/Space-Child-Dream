# Space Child Auth - Unified Authentication Guide

This document describes how to use Space Child Auth across all applications in the Source directory. Each app supports **both** direct authentication (login/register forms) **and** SSO (redirect to Space-Child-Dream).

## Architecture Overview

**Space-Child-Dream** serves as the central authentication server. All authentication requests (login, register, password reset, etc.) go through Space-Child-Dream's API endpoints.

### Authentication Modes

1. **Direct Auth**: User logs in/registers directly within any app using the auth modal
2. **SSO Auth**: User clicks "Sign in with Space Child Hub" and is redirected to Space-Child-Dream

### User Flow (Direct Auth)
1. User visits any app in the ecosystem
2. Clicks "Sign In" to open the auth modal
3. Enters email/password or creates new account
4. Receives verification email, clicks link
5. Logged in with JWT tokens stored locally

### User Flow (SSO)
1. User visits any app, clicks "Sign in with Space Child Hub"
2. Redirected to Space-Child-Dream
3. Sees starfield splash → Neural Interface → Dashboard
4. Can launch any app with SSO tokens passed via URL

## API Endpoints (Space-Child-Dream)

### Direct Authentication
```
POST /api/space-child-auth/register
Body: { email, password, firstName?, lastName? }
Response: { user, requiresVerification, message }

POST /api/space-child-auth/login
Body: { email, password }
Response: { user, accessToken, refreshToken }

POST /api/space-child-auth/verify-email
Body: { token }
Response: { user, accessToken, refreshToken, message }

POST /api/space-child-auth/resend-verification
Body: { email }
Response: { success, message }

POST /api/space-child-auth/forgot-password
Body: { email }
Response: { success, message }

POST /api/space-child-auth/reset-password
Body: { token, password }
Response: { user, accessToken, refreshToken, message }

POST /api/space-child-auth/refresh
Body: { refreshToken }
Response: { accessToken, refreshToken }

GET /api/space-child-auth/user
Headers: Authorization: Bearer {accessToken}
Response: { id, email, firstName, lastName, ... }

POST /api/space-child-auth/logout
Headers: Authorization: Bearer {accessToken}
```

### SSO Endpoints
```
GET /api/space-child-auth/sso/authorize?subdomain={app}&callback={url}
Redirects authenticated users back to callback with tokens.

POST /api/space-child-auth/sso/verify
Body: { token, subdomain }
Response: { valid, userId, email, firstName, lastName, subdomain }
```

## App Integration

### Files Added to Each App

Each app now has these files:

| File | Purpose |
|------|---------|
| `lib/space-child-auth.ts` | Core auth client library |
| `hooks/useSpaceChildAuth.ts` | React hook for auth state |
| `components/space-child-auth-modal.tsx` | Login/register modal component |
| `pages/reset-password.tsx` | Password reset page |
| `pages/verify-email.tsx` | Email verification page |

### Environment Variable
```env
VITE_SPACE_CHILD_AUTH_URL=https://space-child-dream.replit.app
```

### Using the Auth Hook
```tsx
import { useSpaceChildAuth } from '@/hooks/useSpaceChildAuth';

function MyComponent() {
  const { 
    user, 
    isLoading, 
    isAuthenticated,
    login,           // Direct login
    register,        // Direct register
    loginWithSSO,    // SSO redirect
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
  } = useSpaceChildAuth();

  // Direct login example
  const handleLogin = async () => {
    const result = await login({ email: 'user@example.com', password: 'password' });
    if (result.requiresVerification) {
      // Show verification pending UI
    }
  };
}
```

### Using the Auth Modal
```tsx
import { useState } from 'react';
import { SpaceChildAuthModal } from '@/components/space-child-auth-modal';
import { useSpaceChildAuth } from '@/hooks/useSpaceChildAuth';

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const { login, register, forgotPassword, resendVerification, loginWithSSO } = useSpaceChildAuth();

  return (
    <>
      <Button onClick={() => setAuthOpen(true)}>Sign In</Button>
      <SpaceChildAuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onLogin={login}
        onRegister={register}
        onForgotPassword={forgotPassword}
        onResendVerification={resendVerification}
        onLoginWithSSO={loginWithSSO}
        appName="Your App Name"
      />
    </>
  );
}
```

### Adding Routes
Add these routes to your app's router:

```tsx
<Route path="/verify-email" element={<VerifyEmailPage />} />
<Route path="/reset-password" element={<ResetPasswordPage />} />
<Route path="/sso/callback" element={<SSOCallbackPage />} />
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
