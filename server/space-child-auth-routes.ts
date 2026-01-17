import type { Express, Request, Response, NextFunction } from "express";
import { spaceChildAuth } from "./services/space-child-auth";
import { storage } from "./storage";
import { z } from "zod";

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
      const result = await spaceChildAuth.login(email, password);

      if (!result.success) {
        return res.status(401).json({ 
          error: result.error,
          requiresVerification: result.requiresVerification,
        });
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

      const result = await spaceChildAuth.verifyZkProof({ sessionId, proof });

      if (!result.success) {
        return res.status(401).json({ error: result.error });
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
  app.get("/api/space-child-auth/sso/authorize", isSpaceChildAuthenticated, async (req: Request, res: Response) => {
    try {
      const { subdomain, callback } = req.query;
      const claims = (req as any).user?.claims;

      if (!subdomain || !callback) {
        return res.status(400).json({ error: "Missing subdomain or callback URL" });
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

      // Redirect back to the app with tokens
      const callbackUrl = new URL(callback as string);
      callbackUrl.searchParams.set("access_token", accessToken);
      callbackUrl.searchParams.set("refresh_token", refreshToken);
      
      res.redirect(callbackUrl.toString());
    } catch (error: any) {
      console.error("SSO authorize error:", error);
      res.status(500).json({ error: "SSO authorization failed" });
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
  app.put("/api/notification-preferences", isSpaceChildAuthenticated, async (req: Request, res: Response) => {
    try {
      const claims = (req as any).user?.claims;
      if (!claims) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { notificationEmail, newAppsEnabled, updatesEnabled, marketingEnabled } = req.body;

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
}
