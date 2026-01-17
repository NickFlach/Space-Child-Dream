import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { buildPoseidon } from "circomlibjs";
import { storage } from "../storage";
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from "./email";
import type { User, ZkCredential, ProofSession } from "@shared/models/auth";

const JWT_ISSUER = "space-child-auth";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_EXPIRY = 15 * 60 * 1000; // 15 minutes

const envSecret = process.env.SESSION_SECRET;
if (!envSecret) {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: SESSION_SECRET is required in production. Exiting.");
    process.exit(1);
  }
  console.warn("WARNING: SESSION_SECRET not set. Using development-only fallback. Set SESSION_SECRET before deploying to production!");
}

function getJwtSecret(): string {
  if (!envSecret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET is required in production");
    }
    return "space-child-dev-only-secret-do-not-use-in-production";
  }
  return envSecret;
}

let poseidonHash: any = null;

async function getPoseidon() {
  if (!poseidonHash) {
    poseidonHash = await buildPoseidon();
  }
  return poseidonHash;
}

export interface SpaceChildTokenPayload {
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  subdomain?: string;
  type: "access" | "refresh";
}

export interface AuthResult {
  success: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

export interface ZKProofRequest {
  sessionId: string;
  challenge: string;
  expiresAt: Date;
}

export interface ZKProofResponse {
  sessionId: string;
  proof: {
    commitment: string;
    response: string;
    publicSignals: string[];
  };
}

export class SpaceChildAuthService {
  private static instance: SpaceChildAuthService;

  private constructor() {}

  static getInstance(): SpaceChildAuthService {
    if (!SpaceChildAuthService.instance) {
      SpaceChildAuthService.instance = new SpaceChildAuthService();
    }
    return SpaceChildAuthService.instance;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateZkCredential(userId: string, secretData: string): Promise<{ commitment: string; credentialHash: string }> {
    const poseidon = await getPoseidon();
    const encoder = new TextEncoder();
    const secretBytes = encoder.encode(secretData);
    const secretBigInt = BigInt("0x" + Buffer.from(secretBytes).toString("hex").slice(0, 62));
    const saltBigInt = BigInt("0x" + Buffer.from(uuidv4().replace(/-/g, "")).toString("hex"));
    const commitment = poseidon.F.toString(poseidon([secretBigInt, saltBigInt]));
    const credentialHash = poseidon.F.toString(poseidon([BigInt(commitment), BigInt("0x" + userId.replace(/-/g, "").slice(0, 30))]));
    return { commitment, credentialHash };
  }

  async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<AuthResult & { requiresVerification?: boolean }> {
    try {
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return { success: false, error: "Email already registered" };
      }

      const passwordHash = await this.hashPassword(password);
      const userId = uuidv4();
      const { commitment, credentialHash } = await this.generateZkCredential(userId, password + email);

      const user = await storage.upsertUser({
        id: userId,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        passwordHash,
        zkCredentialHash: credentialHash,
        isEmailVerified: false,
      });

      await storage.createZkCredential({
        userId: user.id,
        credentialType: "space_child_identity",
        publicCommitment: commitment,
        credentialHash,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });

      // Generate verification token and send email
      const verificationToken = uuidv4();
      const tokenHash = await this.hashPassword(verificationToken);
      await storage.createEmailVerificationToken({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY),
      });

      await sendVerificationEmail(email, verificationToken, firstName);

      return {
        success: true,
        user,
        requiresVerification: true,
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      return { success: false, error: error.message || "Registration failed" };
    }
  }

  async login(email: string, password: string): Promise<AuthResult & { requiresVerification?: boolean }> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return { success: false, error: "Invalid email or password" };
      }

      if (!user.passwordHash) {
        return { success: false, error: "Account requires password reset" };
      }

      const isValid = await this.verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return { success: false, error: "Invalid email or password" };
      }

      // Block login for unverified users
      if (!user.isEmailVerified) {
        return { 
          success: false, 
          error: "Please verify your email before logging in. Check your inbox for the verification link.",
          requiresVerification: true,
          user,
        };
      }

      await storage.updateUser(user.id, { lastLoginAt: new Date() });
      const { accessToken, refreshToken } = await this.generateTokens(user);

      return {
        success: true,
        user,
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: error.message || "Login failed" };
    }
  }

  async generateTokens(user: User, subdomain?: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessPayload: SpaceChildTokenPayload = {
      userId: user.id,
      email: user.email || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      subdomain,
      type: "access",
    };

    const refreshPayload: SpaceChildTokenPayload = {
      userId: user.id,
      email: user.email || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      subdomain,
      type: "refresh",
    };

    const accessToken = jwt.sign(accessPayload, getJwtSecret(), {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: JWT_ISSUER,
    });

    const refreshToken = jwt.sign(refreshPayload, getJwtSecret(), {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: JWT_ISSUER,
    });

    const refreshTokenHash = await this.hashPassword(refreshToken);
    await storage.createRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      subdomain,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<SpaceChildTokenPayload | null> {
    try {
      const payload = jwt.verify(token, getJwtSecret(), {
        issuer: JWT_ISSUER,
      }) as SpaceChildTokenPayload;

      if (payload.type !== "access") {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthResult> {
    try {
      if (!refreshToken) {
        return { success: false, error: "Refresh token required" };
      }

      const payload = jwt.verify(refreshToken, getJwtSecret(), {
        issuer: JWT_ISSUER,
      }) as SpaceChildTokenPayload;

      if (payload.type !== "refresh") {
        return { success: false, error: "Invalid token type" };
      }

      const user = await storage.getUser(payload.userId);
      if (!user) {
        return { success: false, error: "User not found" };
      }

      const storedTokens = await storage.getRefreshTokensByUser(payload.userId);
      let validToken = false;
      let matchedTokenId: number | undefined;
      
      for (const storedToken of storedTokens) {
        if (storedToken.isRevoked) continue;
        if (new Date() > storedToken.expiresAt) continue;
        
        const isMatch = await this.verifyPassword(refreshToken, storedToken.tokenHash);
        if (isMatch) {
          validToken = true;
          matchedTokenId = storedToken.id;
          break;
        }
      }

      if (!validToken) {
        return { success: false, error: "Refresh token revoked or invalid" };
      }

      if (matchedTokenId) {
        await storage.revokeRefreshToken(matchedTokenId);
      }

      const tokens = await this.generateTokens(user, payload.subdomain);
      return {
        success: true,
        user,
        ...tokens,
      };
    } catch {
      return { success: false, error: "Invalid or expired refresh token" };
    }
  }

  async revokeUserTokens(userId: string): Promise<void> {
    await storage.revokeAllUserRefreshTokens(userId);
  }

  async createZkProofRequest(userId?: string): Promise<ZKProofRequest> {
    const sessionId = uuidv4();
    const challenge = uuidv4() + "-" + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await storage.createProofSession({
      sessionId,
      userId: userId || null,
      challenge,
      proofType: "auth",
      status: "pending",
      expiresAt,
    });

    return { sessionId, challenge, expiresAt };
  }

  async verifyZkProof(proofResponse: ZKProofResponse): Promise<AuthResult> {
    try {
      const session = await storage.getProofSession(proofResponse.sessionId);
      if (!session) {
        return { success: false, error: "Invalid proof session" };
      }

      if (session.status !== "pending") {
        return { success: false, error: "Proof session already used" };
      }

      if (new Date() > session.expiresAt) {
        return { success: false, error: "Proof session expired" };
      }

      const poseidon = await getPoseidon();
      const challengeHash = poseidon.F.toString(
        poseidon([BigInt("0x" + Buffer.from(session.challenge).toString("hex").slice(0, 62))])
      );

      const expectedResponse = poseidon.F.toString(
        poseidon([BigInt(proofResponse.proof.commitment), BigInt(challengeHash)])
      );

      // First, look up the credential by commitment
      const credential = await storage.getZkCredentialByCommitment(proofResponse.proof.commitment);
      if (!credential) {
        return { success: false, error: "Invalid proof - credential not found" };
      }

      if (credential.isRevoked) {
        return { success: false, error: "Credential has been revoked" };
      }

      if (credential.expiresAt && new Date() > credential.expiresAt) {
        return { success: false, error: "Credential has expired" };
      }

      // Verify the proof response matches the expected value
      if (proofResponse.proof.response !== expectedResponse) {
        return { success: false, error: "Proof verification failed" };
      }

      const user = await storage.getUser(credential.userId);
      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Check email verification status
      if (!user.isEmailVerified) {
        return { success: false, error: "Please verify your email before using ZKP authentication" };
      }

      await storage.updateProofSession(session.id, {
        status: "verified",
        userId: user.id,
        verifiedAt: new Date(),
      });

      const { accessToken, refreshToken } = await this.generateTokens(user);
      return { success: true, user, accessToken, refreshToken };
    } catch (error: any) {
      console.error("ZK proof verification error:", error);
      return { success: false, error: error.message || "Proof verification failed" };
    }
  }

  getJwksPublicKey(): object {
    return {
      keys: [
        {
          kty: "oct",
          kid: "space-child-auth-key-1",
          alg: "HS256",
          use: "sig",
        },
      ],
    };
  }

  // Email verification
  async verifyEmail(token: string): Promise<AuthResult> {
    try {
      // Find all users with pending verification tokens
      const users = await storage.getUserByEmail(""); // We need to find by token
      // Since we can't query by token directly, we need to iterate through users
      // This is a simplified implementation - in production, you'd want to index tokens
      
      // For now, we decode the token to find the user via a different approach
      // Actually, let's use a different strategy - store the plaintext token temporarily
      // and match against the hash
      
      // This requires us to find a way to look up tokens - let's query all active tokens
      // and check each one. In a real app, you'd want better indexing.
      
      // Simplified approach: try to find matching token for any user
      const allUsers = await this.findUserByVerificationToken(token);
      if (!allUsers) {
        return { success: false, error: "Invalid or expired verification link" };
      }

      const { user, tokenRecord } = allUsers;

      // Mark email as verified
      await storage.updateUser(user.id, { isEmailVerified: true });
      await storage.consumeEmailVerificationToken(tokenRecord.id);

      // Send welcome email
      await sendWelcomeEmail(user.email!, user.firstName || undefined);

      // Generate tokens so user is logged in after verification
      const { accessToken, refreshToken } = await this.generateTokens(user);

      return {
        success: true,
        user: { ...user, isEmailVerified: true },
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      console.error("Email verification error:", error);
      return { success: false, error: error.message || "Verification failed" };
    }
  }

  private async findUserByVerificationToken(token: string): Promise<{ user: User; tokenRecord: any } | null> {
    // Get all users and check their verification tokens
    // In production, this should be optimized with proper token indexing
    const db = await import("../db").then(m => m.db);
    const { emailVerificationTokens, users } = await import("@shared/models/auth");
    const { sql, gte, and } = await import("drizzle-orm");
    
    const tokens = await db.select()
      .from(emailVerificationTokens)
      .where(and(
        sql`${emailVerificationTokens.consumedAt} IS NULL`,
        gte(emailVerificationTokens.expiresAt, new Date())
      ));

    for (const tokenRecord of tokens) {
      const isMatch = await this.verifyPassword(token, tokenRecord.tokenHash);
      if (isMatch) {
        const user = await storage.getUser(tokenRecord.userId);
        if (user) {
          return { user, tokenRecord };
        }
      }
    }
    return null;
  }

  async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists
        return { success: true };
      }

      if (user.isEmailVerified) {
        return { success: false, error: "Email is already verified" };
      }

      // Invalidate old tokens
      await storage.invalidateUserVerificationTokens(user.id);

      // Generate new token
      const verificationToken = uuidv4();
      const tokenHash = await this.hashPassword(verificationToken);
      await storage.createEmailVerificationToken({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY),
      });

      await sendVerificationEmail(email, verificationToken, user.firstName || undefined);

      return { success: true };
    } catch (error: any) {
      console.error("Resend verification error:", error);
      return { success: false, error: error.message || "Failed to resend verification" };
    }
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists - always return success
        return { success: true };
      }

      // Invalidate old reset tokens
      await storage.invalidateUserPasswordResetTokens(user.id);

      // Generate new token
      const resetToken = uuidv4();
      const tokenHash = await this.hashPassword(resetToken);
      await storage.createPasswordResetToken({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_EXPIRY),
      });

      await sendPasswordResetEmail(email, resetToken, user.firstName || undefined);

      return { success: true };
    } catch (error: any) {
      console.error("Password reset request error:", error);
      return { success: false, error: error.message || "Failed to send reset email" };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    try {
      if (newPassword.length < 8) {
        return { success: false, error: "Password must be at least 8 characters" };
      }

      // Find user by reset token
      const result = await this.findUserByResetToken(token);
      if (!result) {
        return { success: false, error: "Invalid or expired reset link" };
      }

      const { user, tokenRecord } = result;

      // Update password
      const passwordHash = await this.hashPassword(newPassword);
      await storage.updateUser(user.id, { passwordHash });

      // Consume the token
      await storage.consumePasswordResetToken(tokenRecord.id);

      // Revoke all existing refresh tokens for security
      await storage.revokeAllUserRefreshTokens(user.id);

      // If email wasn't verified, verify it now (they clicked a valid email link)
      if (!user.isEmailVerified) {
        await storage.updateUser(user.id, { isEmailVerified: true });
      }

      // Generate new tokens so user is logged in
      const { accessToken, refreshToken } = await this.generateTokens(user);

      return {
        success: true,
        user,
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      console.error("Password reset error:", error);
      return { success: false, error: error.message || "Password reset failed" };
    }
  }

  private async findUserByResetToken(token: string): Promise<{ user: User; tokenRecord: any } | null> {
    const db = await import("../db").then(m => m.db);
    const { passwordResetTokens } = await import("@shared/models/auth");
    const { sql, gte, and } = await import("drizzle-orm");
    
    const tokens = await db.select()
      .from(passwordResetTokens)
      .where(and(
        sql`${passwordResetTokens.consumedAt} IS NULL`,
        gte(passwordResetTokens.expiresAt, new Date())
      ));

    for (const tokenRecord of tokens) {
      const isMatch = await this.verifyPassword(token, tokenRecord.tokenHash);
      if (isMatch) {
        const user = await storage.getUser(tokenRecord.userId);
        if (user) {
          return { user, tokenRecord };
        }
      }
    }
    return null;
  }
}

export const spaceChildAuth = SpaceChildAuthService.getInstance();
