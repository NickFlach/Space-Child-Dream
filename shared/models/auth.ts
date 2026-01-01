import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, text, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table - core identity for Space Child Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: text("password_hash"),
  zkCredentialHash: text("zk_credential_hash"),
  isEmailVerified: boolean("is_email_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ============================================
// SPACE CHILD AUTH - ZKP CREDENTIALS
// ============================================

export const zkCredentials = pgTable("zk_credentials", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  credentialType: text("credential_type").notNull().default("space_child_identity"),
  publicCommitment: text("public_commitment").notNull(),
  credentialHash: text("credential_hash").notNull(),
  issuedAt: timestamp("issued_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  expiresAt: timestamp("expires_at"),
  isRevoked: boolean("is_revoked").default(false),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
});

export const insertZkCredentialSchema = createInsertSchema(zkCredentials).omit({
  id: true,
  issuedAt: true,
});

export type InsertZkCredential = z.infer<typeof insertZkCredentialSchema>;
export type ZkCredential = typeof zkCredentials.$inferSelect;

// ============================================
// SPACE CHILD AUTH - PROOF SESSIONS
// ============================================

export const proofSessions = pgTable("proof_sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id").unique().notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  challenge: text("challenge").notNull(),
  proofType: text("proof_type").notNull().default("auth"),
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertProofSessionSchema = createInsertSchema(proofSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertProofSession = z.infer<typeof insertProofSessionSchema>;
export type ProofSession = typeof proofSessions.$inferSelect;

// ============================================
// SPACE CHILD AUTH - REFRESH TOKENS
// ============================================

export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  deviceInfo: text("device_info"),
  subdomain: text("subdomain"),
  expiresAt: timestamp("expires_at").notNull(),
  isRevoked: boolean("is_revoked").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertRefreshTokenSchema = createInsertSchema(refreshTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;
export type RefreshToken = typeof refreshTokens.$inferSelect;

// ============================================
// SPACE CHILD AUTH - SUBDOMAIN ACCESS
// ============================================

export const subdomainAccess = pgTable("subdomain_access", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  subdomain: text("subdomain").notNull(),
  grantedAt: timestamp("granted_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  lastAccessAt: timestamp("last_access_at"),
  accessLevel: text("access_level").default("user"),
});

export const insertSubdomainAccessSchema = createInsertSchema(subdomainAccess).omit({
  id: true,
  grantedAt: true,
});

export type InsertSubdomainAccess = z.infer<typeof insertSubdomainAccessSchema>;
export type SubdomainAccess = typeof subdomainAccess.$inferSelect;

// ============================================
// SPACE CHILD AUTH - EMAIL VERIFICATION TOKENS
// ============================================

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  consumedAt: timestamp("consumed_at"),
  sentAt: timestamp("sent_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertEmailVerificationTokenSchema = createInsertSchema(emailVerificationTokens).omit({
  id: true,
  sentAt: true,
});

export type InsertEmailVerificationToken = z.infer<typeof insertEmailVerificationTokenSchema>;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;

// ============================================
// SPACE CHILD AUTH - PASSWORD RESET TOKENS
// ============================================

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  consumedAt: timestamp("consumed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
