import { vi } from "vitest";
import type { User, ZkCredential, ProofSession, RefreshToken, EmailVerificationToken, PasswordResetToken } from "@shared/models/auth";

// In-memory storage for tests
let users: Map<string, User> = new Map();
let zkCredentials: Map<number, ZkCredential> = new Map();
let proofSessions: Map<string, ProofSession> = new Map();
let refreshTokens: Map<number, RefreshToken> = new Map();
let emailVerificationTokens: Map<number, EmailVerificationToken> = new Map();
let passwordResetTokens: Map<number, PasswordResetToken> = new Map();

let idCounters = {
  zkCredential: 1,
  proofSession: 1,
  refreshToken: 1,
  emailVerificationToken: 1,
  passwordResetToken: 1,
};

export function resetMockStorage() {
  users = new Map();
  zkCredentials = new Map();
  proofSessions = new Map();
  refreshTokens = new Map();
  emailVerificationTokens = new Map();
  passwordResetTokens = new Map();
  idCounters = {
    zkCredential: 1,
    proofSession: 1,
    refreshToken: 1,
    emailVerificationToken: 1,
    passwordResetToken: 1,
  };
}

export const mockStorage = {
  // User methods
  getUser: vi.fn(async (id: string): Promise<User | undefined> => {
    return users.get(id);
  }),

  getUserByEmail: vi.fn(async (email: string): Promise<User | undefined> => {
    for (const user of users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  }),

  upsertUser: vi.fn(async (userData: Partial<User>): Promise<User> => {
    const user: User = {
      id: userData.id || crypto.randomUUID(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      passwordHash: userData.passwordHash || null,
      zkCredentialHash: userData.zkCredentialHash || null,
      isEmailVerified: userData.isEmailVerified ?? false,
      role: userData.role || "user",
      lastLoginAt: userData.lastLoginAt || null,
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    users.set(user.id, user);
    return user;
  }),

  updateUser: vi.fn(async (id: string, data: Partial<User>): Promise<User | undefined> => {
    const user = users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data, updatedAt: new Date() };
    users.set(id, updated);
    return updated;
  }),

  getAllUsers: vi.fn(async (): Promise<User[]> => {
    return Array.from(users.values());
  }),

  // ZK Credentials
  createZkCredential: vi.fn(async (credential: Partial<ZkCredential>): Promise<ZkCredential> => {
    const id = idCounters.zkCredential++;
    const zkCred: ZkCredential = {
      id,
      userId: credential.userId!,
      credentialType: credential.credentialType || "space_child_identity",
      publicCommitment: credential.publicCommitment!,
      credentialHash: credential.credentialHash!,
      issuedAt: new Date(),
      expiresAt: credential.expiresAt || null,
      isRevoked: false,
      metadata: credential.metadata || null,
    };
    zkCredentials.set(id, zkCred);
    return zkCred;
  }),

  getZkCredentialByCommitment: vi.fn(async (commitment: string): Promise<ZkCredential | undefined> => {
    for (const cred of zkCredentials.values()) {
      if (cred.publicCommitment === commitment) return cred;
    }
    return undefined;
  }),

  getZkCredentialsByUser: vi.fn(async (userId: string): Promise<ZkCredential[]> => {
    return Array.from(zkCredentials.values()).filter(c => c.userId === userId);
  }),

  // Proof Sessions
  createProofSession: vi.fn(async (session: Partial<ProofSession>): Promise<ProofSession> => {
    const id = idCounters.proofSession++;
    const proofSession: ProofSession = {
      id,
      sessionId: session.sessionId!,
      userId: session.userId || null,
      challenge: session.challenge!,
      proofType: session.proofType || "auth",
      status: session.status || "pending",
      expiresAt: session.expiresAt!,
      verifiedAt: null,
      createdAt: new Date(),
    };
    proofSessions.set(session.sessionId!, proofSession);
    return proofSession;
  }),

  getProofSession: vi.fn(async (sessionId: string): Promise<ProofSession | undefined> => {
    return proofSessions.get(sessionId);
  }),

  updateProofSession: vi.fn(async (id: number, data: Partial<ProofSession>): Promise<ProofSession | undefined> => {
    for (const [key, session] of proofSessions) {
      if (session.id === id) {
        const updated = { ...session, ...data };
        proofSessions.set(key, updated);
        return updated;
      }
    }
    return undefined;
  }),

  // Refresh Tokens
  createRefreshToken: vi.fn(async (token: Partial<RefreshToken>): Promise<RefreshToken> => {
    const id = idCounters.refreshToken++;
    const refreshToken: RefreshToken = {
      id,
      userId: token.userId!,
      tokenHash: token.tokenHash!,
      deviceInfo: token.deviceInfo || null,
      subdomain: token.subdomain || null,
      expiresAt: token.expiresAt!,
      isRevoked: false,
      createdAt: new Date(),
    };
    refreshTokens.set(id, refreshToken);
    return refreshToken;
  }),

  getRefreshTokensByUser: vi.fn(async (userId: string): Promise<RefreshToken[]> => {
    return Array.from(refreshTokens.values()).filter(t => t.userId === userId);
  }),

  revokeRefreshToken: vi.fn(async (id: number): Promise<void> => {
    const token = refreshTokens.get(id);
    if (token) {
      token.isRevoked = true;
      refreshTokens.set(id, token);
    }
  }),

  revokeAllUserRefreshTokens: vi.fn(async (userId: string): Promise<void> => {
    for (const [id, token] of refreshTokens) {
      if (token.userId === userId) {
        token.isRevoked = true;
        refreshTokens.set(id, token);
      }
    }
  }),

  // Email Verification Tokens
  createEmailVerificationToken: vi.fn(async (token: Partial<EmailVerificationToken>): Promise<EmailVerificationToken> => {
    const id = idCounters.emailVerificationToken++;
    const verificationToken: EmailVerificationToken = {
      id,
      userId: token.userId!,
      tokenHash: token.tokenHash!,
      expiresAt: token.expiresAt!,
      consumedAt: null,
      sentAt: new Date(),
    };
    emailVerificationTokens.set(id, verificationToken);
    return verificationToken;
  }),

  consumeEmailVerificationToken: vi.fn(async (id: number): Promise<void> => {
    const token = emailVerificationTokens.get(id);
    if (token) {
      token.consumedAt = new Date();
      emailVerificationTokens.set(id, token);
    }
  }),

  invalidateUserVerificationTokens: vi.fn(async (userId: string): Promise<void> => {
    for (const [id, token] of emailVerificationTokens) {
      if (token.userId === userId) {
        token.consumedAt = new Date();
        emailVerificationTokens.set(id, token);
      }
    }
  }),

  // Password Reset Tokens
  createPasswordResetToken: vi.fn(async (token: Partial<PasswordResetToken>): Promise<PasswordResetToken> => {
    const id = idCounters.passwordResetToken++;
    const resetToken: PasswordResetToken = {
      id,
      userId: token.userId!,
      tokenHash: token.tokenHash!,
      expiresAt: token.expiresAt!,
      consumedAt: null,
      createdAt: new Date(),
    };
    passwordResetTokens.set(id, resetToken);
    return resetToken;
  }),

  consumePasswordResetToken: vi.fn(async (id: number): Promise<void> => {
    const token = passwordResetTokens.get(id);
    if (token) {
      token.consumedAt = new Date();
      passwordResetTokens.set(id, token);
    }
  }),

  invalidateUserPasswordResetTokens: vi.fn(async (userId: string): Promise<void> => {
    for (const [id, token] of passwordResetTokens) {
      if (token.userId === userId) {
        token.consumedAt = new Date();
        passwordResetTokens.set(id, token);
      }
    }
  }),

  // Subdomain Access
  getSubdomainAccess: vi.fn(async (_userId: string, _subdomain: string) => undefined),
  createSubdomainAccess: vi.fn(async (access: any) => ({ id: 1, ...access, grantedAt: new Date(), lastAccessAt: null })),
  updateSubdomainLastAccess: vi.fn(async () => {}),

  // Notification methods
  getNotificationPreferences: vi.fn(async () => undefined),
  upsertNotificationPreferences: vi.fn(async (prefs: any) => prefs),
  getPlatformUpdateSubscribers: vi.fn(async () => []),
  getNewAppSubscribers: vi.fn(async () => []),
};

// Helper to get internal state for assertions
export function getMockStorageState() {
  return {
    users: Array.from(users.values()),
    zkCredentials: Array.from(zkCredentials.values()),
    proofSessions: Array.from(proofSessions.values()),
    refreshTokens: Array.from(refreshTokens.values()),
    emailVerificationTokens: Array.from(emailVerificationTokens.values()),
    passwordResetTokens: Array.from(passwordResetTokens.values()),
  };
}
