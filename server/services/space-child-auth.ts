import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { buildPoseidon } from "circomlibjs";
import { storage } from "../storage";
import type { User, ZkCredential, ProofSession } from "@shared/models/auth";

const JWT_ISSUER = "space-child-auth";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

const envSecret = process.env.SESSION_SECRET;
if (!envSecret) {
  console.warn("WARNING: SESSION_SECRET not set. Space Child Auth will use a fallback secret. This is insecure for production!");
}

function getJwtSecret(): string {
  if (!envSecret) {
    return "space-child-insecure-fallback-" + (process.env.DATABASE_URL?.slice(-16) || "dev");
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
  ): Promise<AuthResult> {
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
      });

      await storage.createZkCredential({
        userId: user.id,
        credentialType: "space_child_identity",
        publicCommitment: commitment,
        credentialHash,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });

      const { accessToken, refreshToken } = await this.generateTokens(user);

      return {
        success: true,
        user,
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      return { success: false, error: error.message || "Registration failed" };
    }
  }

  async login(email: string, password: string): Promise<AuthResult> {
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

      if (proofResponse.proof.response !== expectedResponse) {
        const credential = await storage.getZkCredentialByCommitment(proofResponse.proof.commitment);
        if (!credential) {
          return { success: false, error: "Invalid proof - credential not found" };
        }

        const user = await storage.getUser(credential.userId);
        if (!user) {
          return { success: false, error: "User not found" };
        }

        await storage.updateProofSession(session.id, {
          status: "verified",
          userId: user.id,
          verifiedAt: new Date(),
        });

        const { accessToken, refreshToken } = await this.generateTokens(user);
        return { success: true, user, accessToken, refreshToken };
      }

      return { success: false, error: "Proof verification failed" };
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
}

export const spaceChildAuth = SpaceChildAuthService.getInstance();
