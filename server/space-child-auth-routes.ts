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
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
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
}
