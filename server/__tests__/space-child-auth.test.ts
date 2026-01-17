import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { mockStorage, resetMockStorage, getMockStorageState } from "./mocks/storage.mock";

// Mock the storage module before importing the auth service
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
    },
  };
});

// Mock the email service
vi.mock("../services/email", () => ({
  sendVerificationEmail: vi.fn(async () => true),
  sendPasswordResetEmail: vi.fn(async () => true),
  sendWelcomeEmail: vi.fn(async () => true),
}));

// Mock circomlibjs for ZKP tests
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
import { spaceChildAuth, SpaceChildAuthService } from "../services/space-child-auth";

// Set test environment
process.env.SESSION_SECRET = "test-secret-key-for-unit-tests-only";

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
}

describe("SpaceChildAuthService", () => {
  beforeEach(() => {
    resetMockStorage();
    vi.clearAllMocks();
    setupStorageMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Password Hashing", () => {
    it("should hash passwords securely", async () => {
      const password = "testPassword123";
      const hash = await spaceChildAuth.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.startsWith("$2")).toBe(true); // bcrypt hash prefix
    });

    it("should verify correct passwords", async () => {
      const password = "testPassword123";
      const hash = await spaceChildAuth.hashPassword(password);

      const isValid = await spaceChildAuth.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect passwords", async () => {
      const password = "testPassword123";
      const hash = await spaceChildAuth.hashPassword(password);

      const isValid = await spaceChildAuth.verifyPassword("wrongPassword", hash);
      expect(isValid).toBe(false);
    });
  });

  describe("User Registration", () => {
    it("should register a new user successfully", async () => {
      const email = "test@example.com";
      const password = "securePassword123";
      const firstName = "John";
      const lastName = "Doe";

      const result = await spaceChildAuth.register(email, password, firstName, lastName);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(email);
      expect(result.user?.firstName).toBe(firstName);
      expect(result.user?.lastName).toBe(lastName);
      expect(result.user?.isEmailVerified).toBe(false);
      expect(result.requiresVerification).toBe(true);
    });

    it("should not return tokens on registration (requires verification)", async () => {
      const result = await spaceChildAuth.register("test@example.com", "password123");

      expect(result.success).toBe(true);
      expect(result.accessToken).toBeUndefined();
      expect(result.refreshToken).toBeUndefined();
      expect(result.requiresVerification).toBe(true);
    });

    it("should reject registration with existing email", async () => {
      const email = "existing@example.com";

      // Register first user
      await spaceChildAuth.register(email, "password123");

      // Try to register with same email
      const result = await spaceChildAuth.register(email, "differentPassword");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Email already registered");
    });

    it("should create ZK credential on registration", async () => {
      await spaceChildAuth.register("test@example.com", "password123");

      expect(storage.createZkCredential).toHaveBeenCalled();
      const state = getMockStorageState();
      expect(state.zkCredentials.length).toBe(1);
      expect(state.zkCredentials[0].credentialType).toBe("space_child_identity");
    });

    it("should create email verification token on registration", async () => {
      await spaceChildAuth.register("test@example.com", "password123");

      expect(storage.createEmailVerificationToken).toHaveBeenCalled();
    });
  });

  describe("User Login", () => {
    const testEmail = "login@example.com";
    const testPassword = "loginPassword123";

    beforeEach(async () => {
      // Create a verified user for login tests
      const hash = await bcrypt.hash(testPassword, 12);
      await mockStorage.upsertUser({
        id: "test-user-id",
        email: testEmail,
        passwordHash: hash,
        isEmailVerified: true,
        firstName: "Test",
        lastName: "User",
      });
    });

    it("should login verified user successfully", async () => {
      const result = await spaceChildAuth.login(testEmail, testPassword);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it("should reject login with wrong password", async () => {
      const result = await spaceChildAuth.login(testEmail, "wrongPassword");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid email or password");
    });

    it("should reject login with non-existent email", async () => {
      const result = await spaceChildAuth.login("nonexistent@example.com", testPassword);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid email or password");
    });

    it("should reject login for unverified users", async () => {
      // Create unverified user
      const hash = await bcrypt.hash("password123", 12);
      await mockStorage.upsertUser({
        id: "unverified-user-id",
        email: "unverified@example.com",
        passwordHash: hash,
        isEmailVerified: false,
      });

      const result = await spaceChildAuth.login("unverified@example.com", "password123");

      expect(result.success).toBe(false);
      expect(result.requiresVerification).toBe(true);
      expect(result.error).toContain("verify your email");
    });

    it("should update lastLoginAt on successful login", async () => {
      await spaceChildAuth.login(testEmail, testPassword);

      expect(storage.updateUser).toHaveBeenCalledWith(
        "test-user-id",
        expect.objectContaining({ lastLoginAt: expect.any(Date) })
      );
    });
  });

  describe("Token Management", () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await mockStorage.upsertUser({
        id: "token-test-user",
        email: "token@example.com",
        isEmailVerified: true,
      });
    });

    it("should generate valid access and refresh tokens", async () => {
      const { accessToken, refreshToken } = await spaceChildAuth.generateTokens(testUser);

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();

      // Verify access token structure
      const decoded = jwt.decode(accessToken) as any;
      expect(decoded.userId).toBe(testUser.id);
      expect(decoded.type).toBe("access");
    });

    it("should verify valid access tokens", async () => {
      const { accessToken } = await spaceChildAuth.generateTokens(testUser);

      const payload = await spaceChildAuth.verifyAccessToken(accessToken);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe(testUser.id);
      expect(payload?.type).toBe("access");
    });

    it("should reject expired access tokens", async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: testUser.id, type: "access" },
        process.env.SESSION_SECRET!,
        { expiresIn: "-1h", issuer: "space-child-auth" }
      );

      const payload = await spaceChildAuth.verifyAccessToken(expiredToken);

      expect(payload).toBeNull();
    });

    it("should reject refresh tokens used as access tokens", async () => {
      const { refreshToken } = await spaceChildAuth.generateTokens(testUser);

      const payload = await spaceChildAuth.verifyAccessToken(refreshToken);

      expect(payload).toBeNull();
    });

    it("should refresh tokens successfully", async () => {
      const { refreshToken } = await spaceChildAuth.generateTokens(testUser);

      const result = await spaceChildAuth.refreshAccessToken(refreshToken);

      expect(result.success).toBe(true);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it("should revoke old refresh token on refresh", async () => {
      const { refreshToken } = await spaceChildAuth.generateTokens(testUser);

      await spaceChildAuth.refreshAccessToken(refreshToken);

      expect(storage.revokeRefreshToken).toHaveBeenCalled();
    });

    it("should reject revoked refresh tokens", async () => {
      const { refreshToken } = await spaceChildAuth.generateTokens(testUser);

      // Revoke all tokens
      await spaceChildAuth.revokeUserTokens(testUser.id);

      const result = await spaceChildAuth.refreshAccessToken(refreshToken);

      expect(result.success).toBe(false);
      expect(result.error).toContain("revoked");
    });
  });

  describe("Password Reset", () => {
    let testUser: any;
    const testEmail = "reset@example.com";

    beforeEach(async () => {
      const hash = await bcrypt.hash("oldPassword", 12);
      testUser = await mockStorage.upsertUser({
        id: "reset-test-user",
        email: testEmail,
        passwordHash: hash,
        isEmailVerified: true,
      });
    });

    it("should create password reset token", async () => {
      const result = await spaceChildAuth.requestPasswordReset(testEmail);

      expect(result.success).toBe(true);
      expect(storage.createPasswordResetToken).toHaveBeenCalled();
    });

    it("should not reveal if email exists (security)", async () => {
      const result = await spaceChildAuth.requestPasswordReset("nonexistent@example.com");

      // Should return success even for non-existent emails
      expect(result.success).toBe(true);
    });

    it("should invalidate old reset tokens before creating new one", async () => {
      await spaceChildAuth.requestPasswordReset(testEmail);

      expect(storage.invalidateUserPasswordResetTokens).toHaveBeenCalledWith(testUser.id);
    });

    it("should reject password reset with short password", async () => {
      const result = await spaceChildAuth.resetPassword("any-token", "short");

      expect(result.success).toBe(false);
      expect(result.error).toContain("8 characters");
    });
  });

  describe("Email Verification", () => {
    it("should resend verification email for unverified users", async () => {
      await mockStorage.upsertUser({
        id: "unverified-user",
        email: "unverified@example.com",
        isEmailVerified: false,
      });

      const result = await spaceChildAuth.resendVerificationEmail("unverified@example.com");

      expect(result.success).toBe(true);
      expect(storage.invalidateUserVerificationTokens).toHaveBeenCalled();
      expect(storage.createEmailVerificationToken).toHaveBeenCalled();
    });

    it("should reject resend for already verified users", async () => {
      await mockStorage.upsertUser({
        id: "verified-user",
        email: "verified@example.com",
        isEmailVerified: true,
      });

      const result = await spaceChildAuth.resendVerificationEmail("verified@example.com");

      expect(result.success).toBe(false);
      expect(result.error).toContain("already verified");
    });

    it("should not reveal if email exists on resend (security)", async () => {
      const result = await spaceChildAuth.resendVerificationEmail("nonexistent@example.com");

      // Should return success even for non-existent emails
      expect(result.success).toBe(true);
    });
  });

  describe("ZK Proof Verification", () => {
    it("should create proof request with challenge", async () => {
      const request = await spaceChildAuth.createZkProofRequest();

      expect(request.sessionId).toBeDefined();
      expect(request.challenge).toBeDefined();
      expect(request.expiresAt).toBeInstanceOf(Date);
      expect(storage.createProofSession).toHaveBeenCalled();
    });

    it("should reject proof for non-existent session", async () => {
      const result = await spaceChildAuth.verifyZkProof({
        sessionId: "non-existent-session",
        proof: {
          commitment: "test",
          response: "test",
          publicSignals: [],
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid proof session");
    });

    it("should reject expired proof sessions", async () => {
      // Create an expired session
      const expiredSession = await mockStorage.createProofSession({
        sessionId: "expired-session",
        challenge: "test-challenge",
        expiresAt: new Date(Date.now() - 1000), // Already expired
        status: "pending",
      });

      const result = await spaceChildAuth.verifyZkProof({
        sessionId: "expired-session",
        proof: {
          commitment: "test",
          response: "test",
          publicSignals: [],
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("expired");
    });

    it("should reject already used proof sessions", async () => {
      await mockStorage.createProofSession({
        sessionId: "used-session",
        challenge: "test-challenge",
        expiresAt: new Date(Date.now() + 300000),
        status: "verified", // Already used
      });

      const result = await spaceChildAuth.verifyZkProof({
        sessionId: "used-session",
        proof: {
          commitment: "test",
          response: "test",
          publicSignals: [],
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("already used");
    });
  });

  describe("JWKS Endpoint", () => {
    it("should return JWKS public key structure", () => {
      const jwks = spaceChildAuth.getJwksPublicKey();

      expect(jwks).toHaveProperty("keys");
      expect(Array.isArray((jwks as any).keys)).toBe(true);
      expect((jwks as any).keys[0]).toHaveProperty("kty");
      expect((jwks as any).keys[0]).toHaveProperty("alg", "HS256");
    });
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = SpaceChildAuthService.getInstance();
      const instance2 = SpaceChildAuthService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
