import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import express, { type Express } from "express";
import { mockStorage, resetMockStorage } from "./mocks/storage.mock";

// Mock storage and email before importing routes
vi.mock("../storage", () => {
  return {
    storage: {
      getUser: vi.fn(),
      getUserByEmail: vi.fn(),
      upsertUser: vi.fn(),
      updateUser: vi.fn(),
      getAllUsers: vi.fn(),
      createZkCredential: vi.fn(),
      getZkCredentialByCommitment: vi.fn(),
      getZkCredentialsByUser: vi.fn(),
      createProofSession: vi.fn(),
      getProofSession: vi.fn(),
      updateProofSession: vi.fn(),
      createRefreshToken: vi.fn(),
      getRefreshTokensByUser: vi.fn(),
      revokeRefreshToken: vi.fn(),
      revokeAllUserRefreshTokens: vi.fn(),
      createEmailVerificationToken: vi.fn(),
      consumeEmailVerificationToken: vi.fn(),
      invalidateUserVerificationTokens: vi.fn(),
      createPasswordResetToken: vi.fn(),
      consumePasswordResetToken: vi.fn(),
      invalidateUserPasswordResetTokens: vi.fn(),
      getSubdomainAccess: vi.fn(),
      createSubdomainAccess: vi.fn(),
      updateSubdomainLastAccess: vi.fn(),
      getNotificationPreferences: vi.fn(),
      upsertNotificationPreferences: vi.fn(),
      getPlatformUpdateSubscribers: vi.fn(),
      getNewAppSubscribers: vi.fn(),
    },
  };
});

vi.mock("../services/email", () => ({
  sendVerificationEmail: vi.fn(async () => true),
  sendPasswordResetEmail: vi.fn(async () => true),
  sendWelcomeEmail: vi.fn(async () => true),
  sendPlatformUpdateEmail: vi.fn(async () => true),
  sendNewAppNotification: vi.fn(async () => true),
}));

vi.mock("circomlibjs", () => {
  // Create a mock poseidon function that's callable
  const mockPoseidonFn = vi.fn((inputs: bigint[]) => BigInt(12345));
  (mockPoseidonFn as any).F = {
    toString: (val: any) => String(val || "mock-hash-result"),
  };

  return {
    buildPoseidon: vi.fn(async () => mockPoseidonFn),
  };
});

import { storage } from "../storage";
import { registerSpaceChildAuthRoutes, isSpaceChildAuthenticated, optionalSpaceChildAuth } from "../space-child-auth-routes";
import { spaceChildAuth } from "../services/space-child-auth";
import bcrypt from "bcryptjs";

// Set test environment
process.env.SESSION_SECRET = "test-secret-key-for-unit-tests-only";

// Helper to make requests
function createTestApp(): Express {
  const app = express();
  app.use(express.json());
  registerSpaceChildAuthRoutes(app);
  return app;
}

// Simple request helper (not using supertest to minimize dependencies)
async function makeRequest(app: Express, method: string, path: string, body?: any, headers?: Record<string, string>) {
  return new Promise<{ status: number; body: any; headers: Record<string, string> }>((resolve) => {
    const req: any = {
      method,
      url: path,
      path,
      body: body || {},
      headers: headers || {},
      query: {},
      params: {},
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" },
      get: (name: string) => headers?.[name.toLowerCase()],
    };

    // Parse query string
    const [basePath, queryString] = path.split("?");
    req.path = basePath;
    if (queryString) {
      const params = new URLSearchParams(queryString);
      req.query = Object.fromEntries(params.entries());
    }

    const res: any = {
      statusCode: 200,
      _headers: {} as Record<string, string>,
      _body: null,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(data: any) {
        this._body = data;
        resolve({ status: this.statusCode, body: data, headers: this._headers });
      },
      redirect(url: string) {
        this.statusCode = 302;
        this._headers["location"] = url;
        resolve({ status: this.statusCode, body: null, headers: this._headers });
      },
      setHeader(name: string, value: string) {
        this._headers[name] = value;
      },
    };

    // Find matching route handler
    const stack = (app as any)._router?.stack || [];
    let handled = false;

    for (const layer of stack) {
      if (layer.route) {
        const routePath = layer.route.path;
        const routeMethod = Object.keys(layer.route.methods)[0]?.toUpperCase();

        if (routeMethod === method.toUpperCase() && matchPath(routePath, basePath)) {
          // Extract params
          const paramNames = routePath.match(/:([^/]+)/g) || [];
          const pathParts = basePath.split("/");
          const routeParts = routePath.split("/");

          for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(":")) {
              const paramName = routeParts[i].slice(1);
              req.params[paramName] = pathParts[i];
            }
          }

          const handlers = layer.route.stack.map((l: any) => l.handle);
          executeMiddleware(handlers, req, res, () => {});
          handled = true;
          break;
        }
      }
    }

    if (!handled) {
      resolve({ status: 404, body: { error: "Not found" }, headers: {} });
    }
  });
}

function matchPath(routePath: string, actualPath: string): boolean {
  const routeParts = routePath.split("/");
  const pathParts = actualPath.split("/");

  if (routeParts.length !== pathParts.length) return false;

  return routeParts.every((part, i) => part.startsWith(":") || part === pathParts[i]);
}

function executeMiddleware(handlers: Function[], req: any, res: any, done: () => void) {
  let index = 0;

  function next(err?: any) {
    if (err || index >= handlers.length) {
      return done();
    }
    const handler = handlers[index++];
    try {
      const result = handler(req, res, next);
      if (result instanceof Promise) {
        result.catch(next);
      }
    } catch (e) {
      next(e);
    }
  }

  next();
}

// Wire up the mock storage functions
function setupStorageMocks() {
  (storage.getUser as any).mockImplementation(mockStorage.getUser);
  (storage.getUserByEmail as any).mockImplementation(mockStorage.getUserByEmail);
  (storage.upsertUser as any).mockImplementation(mockStorage.upsertUser);
  (storage.updateUser as any).mockImplementation(mockStorage.updateUser);
  (storage.getAllUsers as any).mockImplementation(mockStorage.getAllUsers);
  (storage.createZkCredential as any).mockImplementation(mockStorage.createZkCredential);
  (storage.getZkCredentialByCommitment as any).mockImplementation(mockStorage.getZkCredentialByCommitment);
  (storage.getZkCredentialsByUser as any).mockImplementation(mockStorage.getZkCredentialsByUser);
  (storage.createProofSession as any).mockImplementation(mockStorage.createProofSession);
  (storage.getProofSession as any).mockImplementation(mockStorage.getProofSession);
  (storage.updateProofSession as any).mockImplementation(mockStorage.updateProofSession);
  (storage.createRefreshToken as any).mockImplementation(mockStorage.createRefreshToken);
  (storage.getRefreshTokensByUser as any).mockImplementation(mockStorage.getRefreshTokensByUser);
  (storage.revokeRefreshToken as any).mockImplementation(mockStorage.revokeRefreshToken);
  (storage.revokeAllUserRefreshTokens as any).mockImplementation(mockStorage.revokeAllUserRefreshTokens);
  (storage.createEmailVerificationToken as any).mockImplementation(mockStorage.createEmailVerificationToken);
  (storage.consumeEmailVerificationToken as any).mockImplementation(mockStorage.consumeEmailVerificationToken);
  (storage.invalidateUserVerificationTokens as any).mockImplementation(mockStorage.invalidateUserVerificationTokens);
  (storage.createPasswordResetToken as any).mockImplementation(mockStorage.createPasswordResetToken);
  (storage.consumePasswordResetToken as any).mockImplementation(mockStorage.consumePasswordResetToken);
  (storage.invalidateUserPasswordResetTokens as any).mockImplementation(mockStorage.invalidateUserPasswordResetTokens);
  (storage.getSubdomainAccess as any).mockImplementation(mockStorage.getSubdomainAccess);
  (storage.createSubdomainAccess as any).mockImplementation(mockStorage.createSubdomainAccess);
  (storage.updateSubdomainLastAccess as any).mockImplementation(mockStorage.updateSubdomainLastAccess);
  (storage.getNotificationPreferences as any).mockImplementation(mockStorage.getNotificationPreferences);
  (storage.upsertNotificationPreferences as any).mockImplementation(mockStorage.upsertNotificationPreferences);
  (storage.getPlatformUpdateSubscribers as any).mockImplementation(mockStorage.getPlatformUpdateSubscribers);
  (storage.getNewAppSubscribers as any).mockImplementation(mockStorage.getNewAppSubscribers);
}

describe("Space Child Auth Routes", () => {
  let app: Express;

  beforeEach(() => {
    resetMockStorage();
    vi.clearAllMocks();
    setupStorageMocks();
    app = createTestApp();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/space-child-auth/register", () => {
    it("should register a new user", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/register", {
        email: "test@example.com",
        password: "securePassword123",
        firstName: "John",
        lastName: "Doe",
      });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe("test@example.com");
      expect(response.body.requiresVerification).toBe(true);
    });

    it("should reject invalid email format", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/register", {
        email: "invalid-email",
        password: "securePassword123",
      });

      expect(response.status).toBe(400);
    });

    it("should reject password shorter than 8 characters", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/register", {
        email: "test@example.com",
        password: "short",
      });

      expect(response.status).toBe(400);
    });

    it("should reject duplicate email registration", async () => {
      // First registration
      await makeRequest(app, "POST", "/api/space-child-auth/register", {
        email: "duplicate@example.com",
        password: "securePassword123",
      });

      // Second registration with same email
      const response = await makeRequest(app, "POST", "/api/space-child-auth/register", {
        email: "duplicate@example.com",
        password: "differentPassword123",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("already registered");
    });
  });

  describe("POST /api/space-child-auth/login", () => {
    beforeEach(async () => {
      // Create a verified user for login tests
      const hash = await bcrypt.hash("correctPassword123", 12);
      await mockStorage.upsertUser({
        id: "login-test-user",
        email: "login@example.com",
        passwordHash: hash,
        isEmailVerified: true,
        firstName: "Login",
        lastName: "User",
      });
    });

    it("should login with correct credentials", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/login", {
        email: "login@example.com",
        password: "correctPassword123",
      });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user.email).toBe("login@example.com");
    });

    it("should reject incorrect password", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/login", {
        email: "login@example.com",
        password: "wrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain("Invalid");
    });

    it("should reject non-existent user", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/login", {
        email: "nonexistent@example.com",
        password: "anyPassword123",
      });

      expect(response.status).toBe(401);
    });

    it("should indicate if email verification is required", async () => {
      // Create unverified user
      const hash = await bcrypt.hash("password123", 12);
      await mockStorage.upsertUser({
        id: "unverified-login-user",
        email: "unverified@example.com",
        passwordHash: hash,
        isEmailVerified: false,
      });

      const response = await makeRequest(app, "POST", "/api/space-child-auth/login", {
        email: "unverified@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.requiresVerification).toBe(true);
    });
  });

  describe("POST /api/space-child-auth/refresh", () => {
    it("should refresh tokens with valid refresh token", async () => {
      // Create user and get tokens
      const hash = await bcrypt.hash("password123", 12);
      const user = await mockStorage.upsertUser({
        id: "refresh-test-user",
        email: "refresh@example.com",
        passwordHash: hash,
        isEmailVerified: true,
      });

      const { refreshToken } = await spaceChildAuth.generateTokens(user);

      const response = await makeRequest(app, "POST", "/api/space-child-auth/refresh", {
        refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it("should reject missing refresh token", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/refresh", {});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("required");
    });

    it("should reject invalid refresh token", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/refresh", {
        refreshToken: "invalid-token",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/space-child-auth/forgot-password", () => {
    it("should always return success (security)", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/forgot-password", {
        email: "nonexistent@example.com",
      });

      // Should not reveal if user exists
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should send reset email for existing user", async () => {
      await mockStorage.upsertUser({
        id: "reset-user",
        email: "reset@example.com",
        isEmailVerified: true,
      });

      const response = await makeRequest(app, "POST", "/api/space-child-auth/forgot-password", {
        email: "reset@example.com",
      });

      expect(response.status).toBe(200);
      expect(storage.createPasswordResetToken).toHaveBeenCalled();
    });
  });

  describe("POST /api/space-child-auth/reset-password", () => {
    it("should reject missing token or password", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/reset-password", {
        token: "some-token",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("required");
    });

    it("should reject short passwords", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/reset-password", {
        token: "some-token",
        password: "short",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("8 characters");
    });
  });

  describe("POST /api/space-child-auth/resend-verification", () => {
    it("should return success for any email (security)", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/resend-verification", {
        email: "nonexistent@example.com",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should require email parameter", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/resend-verification", {});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("required");
    });
  });

  describe("POST /api/space-child-auth/zk/request", () => {
    it("should create a ZKP challenge", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/zk/request", {});

      expect(response.status).toBe(200);
      expect(response.body.sessionId).toBeDefined();
      expect(response.body.challenge).toBeDefined();
      expect(response.body.expiresAt).toBeDefined();
    });
  });

  describe("POST /api/space-child-auth/zk/verify", () => {
    it("should require sessionId and proof", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/zk/verify", {});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("required");
    });

    it("should reject invalid session", async () => {
      const response = await makeRequest(app, "POST", "/api/space-child-auth/zk/verify", {
        sessionId: "invalid-session",
        proof: {
          commitment: "test",
          response: "test",
          publicSignals: [],
        },
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/space-child-auth/.well-known/jwks.json", () => {
    it("should return JWKS", async () => {
      const response = await makeRequest(app, "GET", "/api/space-child-auth/.well-known/jwks.json");

      expect(response.status).toBe(200);
      expect(response.body.keys).toBeDefined();
      expect(Array.isArray(response.body.keys)).toBe(true);
    });
  });

  describe("Rate Limiting", () => {
    it("should rate limit after too many failed login attempts", async () => {
      // Make multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        await makeRequest(app, "POST", "/api/space-child-auth/login", {
          email: "ratelimit@example.com",
          password: "wrongPassword",
        });
      }

      const response = await makeRequest(app, "POST", "/api/space-child-auth/login", {
        email: "ratelimit@example.com",
        password: "wrongPassword",
      });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain("Too many");
    });
  });

  describe("SSO Validation", () => {
    it("should reject untrusted SSO callback domains", async () => {
      // Create authenticated user
      const hash = await bcrypt.hash("password123", 12);
      const user = await mockStorage.upsertUser({
        id: "sso-test-user",
        email: "sso@example.com",
        passwordHash: hash,
        isEmailVerified: true,
      });

      const { accessToken } = await spaceChildAuth.generateTokens(user);

      const response = await makeRequest(
        app,
        "GET",
        "/api/space-child-auth/sso/authorize?subdomain=test&callback=https://malicious-site.com/callback",
        undefined,
        { authorization: `Bearer ${accessToken}` }
      );

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("untrusted");
    });
  });
});

describe("Auth Middleware", () => {
  describe("isSpaceChildAuthenticated", () => {
    it("should reject requests without auth header", async () => {
      const req: any = { headers: {} };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      isSpaceChildAuthenticated(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });

    it("should pass through for valid tokens", async () => {
      const user = await mockStorage.upsertUser({
        id: "middleware-test-user",
        email: "middleware@example.com",
        isEmailVerified: true,
      });

      const { accessToken } = await spaceChildAuth.generateTokens(user);

      const req: any = {
        headers: { authorization: `Bearer ${accessToken}` },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await new Promise<void>((resolve) => {
        isSpaceChildAuthenticated(req, res, () => {
          next();
          resolve();
        });
        // Give async operation time to complete
        setTimeout(resolve, 100);
      });

      // Should have called next or set user
      expect(req.user || next.mock.calls.length > 0).toBeTruthy();
    });
  });

  describe("optionalSpaceChildAuth", () => {
    it("should allow requests without auth header", async () => {
      const req: any = { headers: {} };
      const res: any = {};
      const next = vi.fn();

      optionalSpaceChildAuth(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should attach user for valid tokens", async () => {
      const user = await mockStorage.upsertUser({
        id: "optional-middleware-user",
        email: "optional@example.com",
        isEmailVerified: true,
      });

      const { accessToken } = await spaceChildAuth.generateTokens(user);

      const req: any = {
        headers: { authorization: `Bearer ${accessToken}` },
      };
      const res: any = {};
      const next = vi.fn();

      await new Promise<void>((resolve) => {
        optionalSpaceChildAuth(req, res, () => {
          next();
          resolve();
        });
        setTimeout(resolve, 100);
      });

      expect(next).toHaveBeenCalled();
    });
  });
});
