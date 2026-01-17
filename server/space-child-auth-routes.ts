import type { Express, Request, Response, NextFunction } from "express";
import { spaceChildAuth } from "./services/space-child-auth";
import { storage } from "./storage";
import { z } from "zod";

const adminNotificationRateLimit = new Map<string, number>();
const ADMIN_NOTIFICATION_COOLDOWN_MS = 5 * 60 * 1000;

function checkAdminNotificationRateLimit(adminId: string): { allowed: boolean; remainingSeconds?: number } {
  const lastSent = adminNotificationRateLimit.get(adminId);
  const now = Date.now();

  if (lastSent && now - lastSent < ADMIN_NOTIFICATION_COOLDOWN_MS) {
    const remainingSeconds = Math.ceil((ADMIN_NOTIFICATION_COOLDOWN_MS - (now - lastSent)) / 1000);
    return { allowed: false, remainingSeconds };
  }

  adminNotificationRateLimit.set(adminId, now);
  return { allowed: true };
}

// Rate limiting for authentication endpoints to prevent brute-force attacks
interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const authRateLimits = new Map<string, RateLimitEntry>();
const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const AUTH_MAX_ATTEMPTS = 5;
const AUTH_BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes block after max attempts

function checkAuthRateLimit(identifier: string): { allowed: boolean; remainingSeconds?: number; attemptsLeft?: number } {
  const now = Date.now();
  const entry = authRateLimits.get(identifier);

  // Clean up old entries periodically
  if (authRateLimits.size > 10000) {
    const keysToDelete: string[] = [];
    authRateLimits.forEach((val, key) => {
      if (now - val.firstAttempt > AUTH_RATE_LIMIT_WINDOW_MS * 2) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => authRateLimits.delete(key));
  }

  if (!entry) {
    authRateLimits.set(identifier, { attempts: 1, firstAttempt: now });
    return { allowed: true, attemptsLeft: AUTH_MAX_ATTEMPTS - 1 };
  }

  // Check if currently blocked
  if (entry.blockedUntil && now < entry.blockedUntil) {
    const remainingSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  // Reset if window has passed
  if (now - entry.firstAttempt > AUTH_RATE_LIMIT_WINDOW_MS) {
    authRateLimits.set(identifier, { attempts: 1, firstAttempt: now });
    return { allowed: true, attemptsLeft: AUTH_MAX_ATTEMPTS - 1 };
  }

  // Increment attempts
  entry.attempts++;

  if (entry.attempts > AUTH_MAX_ATTEMPTS) {
    entry.blockedUntil = now + AUTH_BLOCK_DURATION_MS;
    const remainingSeconds = Math.ceil(AUTH_BLOCK_DURATION_MS / 1000);
    return { allowed: false, remainingSeconds };
  }

  return { allowed: true, attemptsLeft: AUTH_MAX_ATTEMPTS - entry.attempts };
}

function clearAuthRateLimit(identifier: string): void {
  authRateLimits.delete(identifier);
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export function isSpaceChildAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if ((req as any).user) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  
  spaceChildAuth.verifyAccessToken(token).then((payload) => {
    if (!payload) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    (req as any).user = {
      claims: {
        sub: payload.userId,
        email: payload.email,
        first_name: payload.firstName,
        last_name: payload.lastName,
      },
    };
    next();
  }).catch(() => {
    res.status(401).json({ message: "Token verification failed" });
  });
}

export function optionalSpaceChildAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  
  spaceChildAuth.verifyAccessToken(token).then((payload) => {
    if (payload) {
      (req as any).user = {
        claims: {
          sub: payload.userId,
          email: payload.email,
          first_name: payload.firstName,
          last_name: payload.lastName,
        },
      };
    }
    next();
  }).catch(() => {
    next();
  });
}

export function registerSpaceChildAuthRoutes(app: Express) {
  app.post("/api/space-child-auth/register", async (req: Request, res: Response) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const { email, password, firstName, lastName } = parsed.data;
      const result = await spaceChildAuth.register(email, password, firstName, lastName);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      // Registration now requires email verification
      res.json({
        user: {
          id: result.user?.id,
          email: result.user?.email,
          firstName: result.user?.firstName,
          lastName: result.user?.lastName,
        },
        requiresVerification: result.requiresVerification,
        message: "Please check your email to verify your account before logging in.",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/space-child-auth/login", async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const { email, password } = parsed.data;

      // Rate limit by email and IP to prevent brute-force attacks
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      const rateLimitKey = `login:${email.toLowerCase()}:${clientIp}`;
      const rateCheck = checkAuthRateLimit(rateLimitKey);

      if (!rateCheck.allowed) {
        return res.status(429).json({
          error: `Too many login attempts. Please try again in ${rateCheck.remainingSeconds} seconds.`,
        });
      }

      const result = await spaceChildAuth.login(email, password);

      if (!result.success) {
        return res.status(401).json({
          error: result.error,
          requiresVerification: result.requiresVerification,
        });
      }

      // Clear rate limit on successful login
      clearAuthRateLimit(rateLimitKey);

      res.json({
        user: {
          id: result.user?.id,
          email: result.user?.email,
          firstName: result.user?.firstName,
          lastName: result.user?.lastName,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Email verification
  app.post("/api/space-child-auth/verify-email", async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "Verification token required" });
      }

      const result = await spaceChildAuth.verifyEmail(token);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        user: {
          id: result.user?.id,
          email: result.user?.email,
          firstName: result.user?.firstName,
          lastName: result.user?.lastName,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        message: "Email verified successfully! Welcome to Space Child Dream.",
      });
    } catch (error: any) {
      console.error("Email verification error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Resend verification email
  app.post("/api/space-child-auth/resend-verification", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }

      const result = await spaceChildAuth.resendVerificationEmail(email);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        message: "If an account exists with this email, a verification link has been sent.",
      });
    } catch (error: any) {
      console.error("Resend verification error:", error);
      res.status(500).json({ error: "Failed to resend verification" });
    }
  });

  // Forgot password
  app.post("/api/space-child-auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }

      const result = await spaceChildAuth.requestPasswordReset(email);

      // Always return success to not reveal if user exists
      res.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // Reset password
  app.post("/api/space-child-auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ error: "Token and password required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const result = await spaceChildAuth.resetPassword(token, password);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        user: {
          id: result.user?.id,
          email: result.user?.email,
          firstName: result.user?.firstName,
          lastName: result.user?.lastName,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        message: "Password reset successfully!",
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Password reset failed" });
    }
  });

  app.post("/api/space-child-auth/refresh", async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token required" });
      }

      const result = await spaceChildAuth.refreshAccessToken(refreshToken);

      if (!result.success) {
        return res.status(401).json({ error: result.error });
      }

      res.json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error: any) {
      console.error("Token refresh error:", error);
      res.status(500).json({ error: "Token refresh failed" });
    }
  });

  app.get("/api/space-child-auth/user", isSpaceChildAuthenticated, async (req: Request, res: Response) => {
    try {
      const claims = (req as any).user?.claims;
      if (!claims) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(claims.sub);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
      });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.post("/api/space-child-auth/logout", isSpaceChildAuthenticated, async (req: Request, res: Response) => {
    try {
      const claims = (req as any).user?.claims;
      if (claims?.sub) {
        await storage.revokeAllUserRefreshTokens(claims.sub);
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.post("/api/space-child-auth/zk/request", async (req: Request, res: Response) => {
    try {
      const proofRequest = await spaceChildAuth.createZkProofRequest();
      res.json(proofRequest);
    } catch (error: any) {
      console.error("ZK proof request error:", error);
      res.status(500).json({ error: "Failed to create proof request" });
    }
  });

  app.post("/api/space-child-auth/zk/verify", async (req: Request, res: Response) => {
    try {
      const { sessionId, proof } = req.body;
      if (!sessionId || !proof) {
        return res.status(400).json({ error: "Session ID and proof required" });
      }

      // Rate limit ZKP verification attempts by IP
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      const rateLimitKey = `zkp:${clientIp}`;
      const rateCheck = checkAuthRateLimit(rateLimitKey);

      if (!rateCheck.allowed) {
        return res.status(429).json({
          error: `Too many verification attempts. Please try again in ${rateCheck.remainingSeconds} seconds.`,
        });
      }

      const result = await spaceChildAuth.verifyZkProof({ sessionId, proof });

      if (!result.success) {
        return res.status(401).json({ error: result.error });
      }

      // Clear rate limit on successful verification
      clearAuthRateLimit(rateLimitKey);

      res.json({
        user: {
          id: result.user?.id,
          email: result.user?.email,
          firstName: result.user?.firstName,
          lastName: result.user?.lastName,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error: any) {
      console.error("ZK proof verification error:", error);
      res.status(500).json({ error: "Proof verification failed" });
    }
  });

  app.get("/api/space-child-auth/.well-known/jwks.json", (_req: Request, res: Response) => {
    res.json(spaceChildAuth.getJwksPublicKey());
  });

  app.get("/api/space-child-auth/credentials", isSpaceChildAuthenticated, async (req: Request, res: Response) => {
    try {
      const claims = (req as any).user?.claims;
      if (!claims) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const credentials = await storage.getZkCredentialsByUser(claims.sub);
      res.json(credentials.map(c => ({
        id: c.id,
        type: c.credentialType,
        issuedAt: c.issuedAt,
        expiresAt: c.expiresAt,
        isRevoked: c.isRevoked,
      })));
    } catch (error: any) {
      console.error("Get credentials error:", error);
      res.status(500).json({ error: "Failed to get credentials" });
    }
  });

  // ============================================
  // SSO ENDPOINTS FOR EXTERNAL APPS
  // ============================================

  // SSO token exchange - external apps redirect here to get tokens
  // SECURITY: Only allow callbacks to trusted domains
  const TRUSTED_SSO_DOMAINS = [
    "spacechild.io",
    "localhost",
    "127.0.0.1",
  ];

  function isValidSsoCallback(callbackUrl: string): boolean {
    try {
      const url = new URL(callbackUrl);
      const hostname = url.hostname.toLowerCase();

      // Check if hostname matches or is a subdomain of trusted domains
      return TRUSTED_SSO_DOMAINS.some(trusted => {
        if (trusted === "localhost" || trusted === "127.0.0.1") {
          return hostname === trusted;
        }
        return hostname === trusted || hostname.endsWith(`.${trusted}`);
      });
    } catch {
      return false;
    }
  }

  app.get("/api/space-child-auth/sso/authorize", isSpaceChildAuthenticated, async (req: Request, res: Response) => {
    try {
      const { subdomain, callback } = req.query;
      const claims = (req as any).user?.claims;

      if (!subdomain || !callback) {
        return res.status(400).json({ error: "Missing subdomain or callback URL" });
      }

      // Validate callback URL against trusted domains
      if (!isValidSsoCallback(callback as string)) {
        console.warn(`SSO callback rejected - untrusted domain: ${callback}`);
        return res.status(400).json({ error: "Invalid callback URL - untrusted domain" });
      }

      if (!claims) {
        // Redirect to login with return URL
        return res.redirect(`/?sso_callback=${encodeURIComponent(callback as string)}&subdomain=${subdomain}`);
      }

      const user = await storage.getUser(claims.sub);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate tokens for the subdomain
      const { accessToken, refreshToken } = await spaceChildAuth.generateTokens(user, subdomain as string);

      // Track subdomain access
      const existingAccess = await storage.getSubdomainAccess(user.id, subdomain as string);
      if (!existingAccess) {
        await storage.createSubdomainAccess({
          userId: user.id,
          subdomain: subdomain as string,
          accessLevel: "user",
        });
      } else {
        await storage.updateSubdomainLastAccess(user.id, subdomain as string);
      }

      // Generate a one-time authorization code instead of passing tokens in URL
      // This prevents token leakage in browser history, server logs, and referrer headers
      const authCode = await spaceChildAuth.generateAuthorizationCode(user.id, subdomain as string);

      const callbackUrl = new URL(callback as string);
      callbackUrl.searchParams.set("code", authCode);
      callbackUrl.searchParams.set("subdomain", subdomain as string);

      res.redirect(callbackUrl.toString());
    } catch (error: any) {
      console.error("SSO authorize error:", error);
      res.status(500).json({ error: "SSO authorization failed" });
    }
  });

  // SSO authorization code exchange endpoint - exchange one-time code for tokens
  // This is called by external apps after receiving the authorization code via redirect
  app.post("/api/space-child-auth/sso/token", async (req: Request, res: Response) => {
    try {
      // Rate limit by IP
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      const rateLimitResult = checkAuthRateLimit(`sso_token:${clientIp}`);
      if (!rateLimitResult.allowed) {
        return res.status(429).json({
          error: "Too many requests",
          retryAfter: rateLimitResult.remainingSeconds,
        });
      }

      const { code, subdomain } = req.body;

      if (!code) {
        return res.status(400).json({ error: "Authorization code required" });
      }

      if (!subdomain) {
        return res.status(400).json({ error: "Subdomain required" });
      }

      const result = await spaceChildAuth.exchangeAuthorizationCode(code, subdomain);

      if (!result.success) {
        return res.status(401).json({ error: result.error });
      }

      // Return tokens via POST response body (not URL) - secure!
      res.json({
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
        token_type: "Bearer",
        expires_in: 900, // 15 minutes
        user: {
          id: result.user!.id,
          email: result.user!.email,
          firstName: result.user!.firstName,
          lastName: result.user!.lastName,
        },
      });
    } catch (error: any) {
      console.error("SSO token exchange error:", error);
      res.status(500).json({ error: "Token exchange failed" });
    }
  });

  // SSO token verification endpoint - external apps call this to verify tokens
  app.post("/api/space-child-auth/sso/verify", async (req: Request, res: Response) => {
    try {
      const { token, subdomain } = req.body;

      if (!token) {
        return res.status(400).json({ error: "Token required" });
      }

      const payload = await spaceChildAuth.verifyAccessToken(token);
      if (!payload) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      // Optionally verify subdomain matches
      if (subdomain && payload.subdomain && payload.subdomain !== subdomain) {
        return res.status(403).json({ error: "Token not valid for this subdomain" });
      }

      res.json({
        valid: true,
        userId: payload.userId,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        subdomain: payload.subdomain,
      });
    } catch (error: any) {
      console.error("SSO verify error:", error);
      res.status(500).json({ error: "Token verification failed" });
    }
  });

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  // Check if user is admin (uses role field from database, not email pattern matching)
  async function isAdmin(req: Request, res: Response, next: NextFunction) {
    const claims = (req as any).user?.claims;
    if (!claims) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUser(claims.sub);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (user.role === "admin" || user.role === "super_admin") {
        (req as any).userRole = user.role;
        return next();
      }

      return res.status(403).json({ message: "Forbidden - Admin access required" });
    } catch (error) {
      console.error("Admin check error:", error);
      return res.status(500).json({ message: "Failed to verify admin access" });
    }
  }

  // Get all users (admin only)
  app.get("/api/admin/users", isSpaceChildAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        isEmailVerified: u.isEmailVerified,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
      })));
    } catch (error: any) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // Revoke all tokens for a user (admin only)
  app.post("/api/admin/users/:userId/revoke-tokens", isSpaceChildAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      await spaceChildAuth.revokeUserTokens(userId);
      res.json({ success: true, message: "All user tokens revoked" });
    } catch (error: any) {
      console.error("Revoke tokens error:", error);
      res.status(500).json({ error: "Failed to revoke tokens" });
    }
  });

  // ============================================
  // NOTIFICATION PREFERENCES
  // ============================================

  // Get notification preferences
  app.get("/api/notification-preferences", isSpaceChildAuthenticated, async (req: Request, res: Response) => {
    try {
      const claims = (req as any).user?.claims;
      if (!claims) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const prefs = await storage.getNotificationPreferences(claims.sub);
      const user = await storage.getUser(claims.sub);
      
      res.json({
        notificationEmail: prefs?.notificationEmail || user?.email || null,
        newAppsEnabled: prefs?.newAppsEnabled ?? true,
        updatesEnabled: prefs?.updatesEnabled ?? true,
        marketingEnabled: prefs?.marketingEnabled ?? false,
        accountEmail: user?.email || null,
      });
    } catch (error: any) {
      console.error("Get notification preferences error:", error);
      res.status(500).json({ error: "Failed to get notification preferences" });
    }
  });

  // Update notification preferences
  const notificationPreferencesSchema = z.object({
    notificationEmail: z.string().email().optional().nullable(),
    newAppsEnabled: z.boolean().optional(),
    updatesEnabled: z.boolean().optional(),
    marketingEnabled: z.boolean().optional(),
  });

  app.put("/api/notification-preferences", isSpaceChildAuthenticated, async (req: Request, res: Response) => {
    try {
      const claims = (req as any).user?.claims;
      if (!claims) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const parsed = notificationPreferencesSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const { notificationEmail, newAppsEnabled, updatesEnabled, marketingEnabled } = parsed.data;

      const prefs = await storage.upsertNotificationPreferences({
        userId: claims.sub,
        notificationEmail: notificationEmail || null,
        newAppsEnabled: newAppsEnabled ?? true,
        updatesEnabled: updatesEnabled ?? true,
        marketingEnabled: marketingEnabled ?? false,
      });

      res.json({
        success: true,
        preferences: {
          notificationEmail: prefs.notificationEmail,
          newAppsEnabled: prefs.newAppsEnabled,
          updatesEnabled: prefs.updatesEnabled,
          marketingEnabled: prefs.marketingEnabled,
        },
      });
    } catch (error: any) {
      console.error("Update notification preferences error:", error);
      res.status(500).json({ error: "Failed to update notification preferences" });
    }
  });

  // ============================================
  // ADMIN NOTIFICATION ENDPOINTS
  // ============================================

  const platformUpdateSchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(5000),
  });

  app.post("/api/admin/notifications/platform-update", isSpaceChildAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const adminId = (req as any).user?.claims?.sub;
      const rateCheck = checkAdminNotificationRateLimit(`platform-update:${adminId}`);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          error: `Rate limited. Please wait ${rateCheck.remainingSeconds} seconds before sending another notification.` 
        });
      }

      const parsed = platformUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const { title, content } = parsed.data;
      const subscribers = await storage.getPlatformUpdateSubscribers();
      
      let sent = 0;
      let failed = 0;

      const { sendPlatformUpdateEmail } = await import("./services/email");
      
      for (const subscriber of subscribers) {
        const email = subscriber.notificationEmail || subscriber.email;
        const success = await sendPlatformUpdateEmail(email, subscriber.firstName, title, content);
        if (success) sent++;
        else failed++;
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      res.json({ success: true, sent, failed, total: subscribers.length });
    } catch (error: any) {
      console.error("Platform update notification error:", error);
      res.status(500).json({ error: "Failed to send platform update notifications" });
    }
  });

  const newAppNotificationSchema = z.object({
    appName: z.string().min(1).max(100),
    appDescription: z.string().min(1).max(500),
    category: z.string().min(1).max(50),
    appUrl: z.string().url(),
  });

  app.post("/api/admin/notifications/new-app", isSpaceChildAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const adminId = (req as any).user?.claims?.sub;
      const rateCheck = checkAdminNotificationRateLimit(`new-app:${adminId}`);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          error: `Rate limited. Please wait ${rateCheck.remainingSeconds} seconds before sending another notification.` 
        });
      }

      const parsed = newAppNotificationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const { appName, appDescription, category, appUrl } = parsed.data;
      const subscribers = await storage.getNewAppSubscribers();
      
      let sent = 0;
      let failed = 0;

      const { sendNewAppNotification } = await import("./services/email");
      
      for (const subscriber of subscribers) {
        const email = subscriber.notificationEmail || subscriber.email;
        const success = await sendNewAppNotification(email, subscriber.firstName, appName, appDescription, category, appUrl);
        if (success) sent++;
        else failed++;
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      res.json({ success: true, sent, failed, total: subscribers.length });
    } catch (error: any) {
      console.error("New app notification error:", error);
      res.status(500).json({ error: "Failed to send new app notifications" });
    }
  });

  app.post("/api/admin/notifications/test-marketing", isSpaceChildAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const adminId = (req as any).user?.claims?.sub;
      const rateCheck = checkAdminNotificationRateLimit(`marketing:${adminId}`);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          error: `Rate limited. Please wait ${rateCheck.remainingSeconds} seconds before triggering another marketing email.` 
        });
      }

      const { sendWeeklyMarketingEmails } = await import("./scheduled-jobs");
      await sendWeeklyMarketingEmails();
      res.json({ success: true, message: "Marketing email job triggered" });
    } catch (error: any) {
      console.error("Test marketing notification error:", error);
      res.status(500).json({ error: "Failed to trigger marketing emails" });
    }
  });
}
