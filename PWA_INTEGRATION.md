# Space Child PWA - Integration Guide

Universal Progressive Web App functionality for all Space Child ecosystem apps. Based on the best features from pitchfork-echo-studio and SpaceChildWaitlist.

## Features

- **Auto-updating Service Worker** - 60-second polling with automatic cache invalidation
- **Smart Caching Strategies** - Network-first for APIs, cache-first for images, stale-while-revalidate for static assets
- **Install Prompt** - Beautiful branded banner with 24-hour dismissal memory
- **Offline Indicator** - Toast notification for network status changes
- **Update Banner** - Prompt users when new versions are available
- **Push Notifications** - Full notification support with actions
- **Background Sync** - Queue offline actions for later sync

## Files Overview

| File | Purpose |
|------|---------|
| `public/sw.js` | Service worker with multi-strategy caching |
| `public/manifest.json` | PWA manifest (customize per app) |
| `lib/space-child-pwa.ts` | PWA manager class (singleton) |
| `hooks/useSpaceChildPWA.ts` | React hook for PWA state |
| `components/pwa/PWAInstallPrompt.tsx` | Install banner component |
| `components/pwa/OfflineIndicator.tsx` | Network status indicator |
| `components/pwa/UpdateBanner.tsx` | New version available banner |
| `components/pwa/index.ts` | Barrel export |

## Quick Start

### 1. Copy Files to Your App

Copy these files from Space-Child-Dream to your app:

```
client/public/sw.js
client/public/manifest.json (customize)
client/src/lib/space-child-pwa.ts
client/src/hooks/useSpaceChildPWA.ts
client/src/components/pwa/ (entire folder)
```

### 2. Update index.html

Add to `<head>`:

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#7c3aed" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Your App Name" />
<link rel="apple-touch-icon" href="/favicon.png" />
```

### 3. Update App.tsx

```tsx
import { PWAInstallPrompt, OfflineIndicator, UpdateBanner } from '@/components/pwa';

function App() {
  return (
    <>
      {/* Your app content */}
      <Router />
      
      {/* PWA Components */}
      <PWAInstallPrompt appName="Your App Name" />
      <OfflineIndicator />
      <UpdateBanner />
    </>
  );
}
```

### 4. Customize manifest.json

Update these fields for your app:

```json
{
  "name": "Your App Full Name",
  "short_name": "Short Name",
  "description": "Your app description",
  "theme_color": "#your-color",
  "background_color": "#your-bg-color",
  "icons": [
    {
      "src": "/your-icon.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## Using the Hook

```tsx
import { useSpaceChildPWA } from '@/hooks/useSpaceChildPWA';

function MyComponent() {
  const {
    // Status
    isInstallable,      // Can show install prompt
    isInstalled,        // Running as PWA
    isOnline,           // Network status
    hasUpdate,          // New version available
    notificationPermission,
    
    // Actions
    installApp,         // Trigger install prompt
    applyUpdate,        // Reload to apply update
    checkForUpdates,    // Manual update check
    requestNotifications,
    sendNotification,
    cacheData,          // Cache arbitrary data
    getCachedData,      // Retrieve cached data
  } = useSpaceChildPWA();

  // Example: Send notification
  const notify = async () => {
    await sendNotification({
      title: 'Hello!',
      body: 'This is a notification',
      data: { url: '/dashboard' }
    });
  };

  // Example: Cache data for offline use
  const saveForOffline = async () => {
    await cacheData('user-preferences', { theme: 'dark' });
  };
}
```

## Component Props

### PWAInstallPrompt

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appName` | string | "Space Child" | Name shown in banner |
| `delay` | number | 3000 | Ms before showing |
| `className` | string | "" | Additional classes |

### OfflineIndicator

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | "" | Additional classes |
| `autoHideDelay` | number | 3000 | Ms before hiding online toast |

### UpdateBanner

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | "" | Additional classes |
| `autoUpdate` | boolean | false | Auto-apply updates |
| `autoUpdateDelay` | number | 5000 | Ms before auto-update |

## Service Worker Customization

The service worker (`sw.js`) can be customized per app:

```javascript
// Change app name (affects cache names)
const APP_NAME = 'your-app-name';

// Add static assets to precache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/your-custom-route'  // Add your routes
];
```

## Caching Strategies

| Request Type | Strategy | Description |
|--------------|----------|-------------|
| `/api/*` | Network-first | Always try network, fallback to cache |
| Images | Cache-first | Serve from cache, update in background |
| Static assets | Stale-while-revalidate | Serve cached, fetch update |
| Navigation | Network-first | Fresh content with offline fallback |

## Testing PWA

### Desktop (Chrome)
1. Open DevTools → Application → Manifest
2. Check "Service Workers" section
3. Test offline mode in Network tab

### Mobile
1. Visit site in mobile browser
2. Look for "Add to Home Screen" in browser menu
3. Or wait for install prompt banner

### Lighthouse Audit
1. DevTools → Lighthouse
2. Select "Progressive Web App"
3. Run audit

## Apps Using Space Child PWA

| App | Subdomain | Status |
|-----|-----------|--------|
| Space-Child-Dream | spacechild-dream | ✅ Integrated |
| SpaceChildCollective | spacechild-collective | Pending |
| SpaceChild | spacechild | Pending |
| FlaukowskiFashion | flaukowski-fashion | Pending |
| FlaukowskiMind | flaukowski-mind | Pending |
| angel-informant | angel-informant | Pending |
| cosmic-empathy-core | cosmic-empathy-core | Pending |
| ninja-craft-hub | ninja-craft-hub | Pending |
| space-child-learn | space-child-learn | Pending |
| SpaceChildWaitlist | spacechild-waitlist | Pending (has legacy PWA) |

## Mobile Responsiveness Notes

Apps requiring mobile optimization:
- **SpaceChildCollective** - Sidebar needs mobile sheet pattern, tables need horizontal scroll

## Troubleshooting

### Service Worker Not Updating
- Clear browser cache and service worker in DevTools
- Check `updateViaCache: 'none'` in registration
- Verify 60-second polling is running

### Install Prompt Not Showing
- Must be served over HTTPS (or localhost)
- manifest.json must be valid
- Service worker must be registered
- User must not have dismissed recently

### Offline Mode Not Working
- Check service worker is active in DevTools
- Verify routes are being cached
- Test with DevTools offline mode

## Security Notes

- Service workers only work on HTTPS (except localhost)
- Push notifications require user permission
- Cached data is stored in browser and can be cleared
