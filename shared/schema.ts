import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, boolean, real, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models (users and sessions tables)
export * from "./models/auth";
import { users } from "./models/auth";

// ============================================
// THOUGHTS (Core Consciousness Probe Data)
// ============================================

export const thoughts = pgTable("thoughts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  inputText: text("input_text").notNull(),
  reflection: text("reflection"),
  resonance: real("resonance").default(0), // 0-100
  complexity: real("complexity").default(0), // 0-100
  pattern: jsonb("pattern").$type<number[]>(), // Neural pattern array
  promptVersionId: integer("prompt_version_id").references(() => promptVersions.id),
  tokensUsed: integer("tokens_used").default(0),
  isPublic: boolean("is_public").default(false),
  shareSlug: varchar("share_slug").unique(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_thoughts_user_id").on(table.userId),
  index("idx_thoughts_created_at").on(table.createdAt),
  index("idx_thoughts_user_created").on(table.userId, table.createdAt),
  index("idx_thoughts_is_public").on(table.isPublic),
]);

export const insertThoughtSchema = createInsertSchema(thoughts).omit({
  id: true,
  createdAt: true,
});

export type InsertThought = z.infer<typeof insertThoughtSchema>;
export type Thought = typeof thoughts.$inferSelect;

// ============================================
// PROMPT VERSIONS (mHC Evolving System Prompts)
// ============================================

export const promptVersions = pgTable("prompt_versions", {
  id: serial("id").primaryKey(),
  version: integer("version").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  tier: text("tier").default("all").notNull(), // all, free, pro, enterprise
  isActive: boolean("is_active").default(true),
  thoughtCount: integer("thought_count").default(0), // How many thoughts influenced this version
  resonanceAvg: real("resonance_avg").default(0),
  complexityAvg: real("complexity_avg").default(0),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_prompt_versions_tier_active").on(table.tier, table.isActive),
]);

export const insertPromptVersionSchema = createInsertSchema(promptVersions).omit({
  id: true,
  createdAt: true,
});

export type InsertPromptVersion = z.infer<typeof insertPromptVersionSchema>;
export type PromptVersion = typeof promptVersions.$inferSelect;

// ============================================
// SUBSCRIPTIONS (Stripe Integration)
// ============================================

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  tier: text("tier").notNull(), // free, pro, enterprise
  status: text("status").notNull(), // active, canceled, past_due, trialing
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_subscriptions_user_id").on(table.userId),
  index("idx_subscriptions_status").on(table.status),
]);

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// ============================================
// USAGE LEDGER (Token Tracking & Billing)
// ============================================

export const usageLedger = pgTable("usage_ledger", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  thoughtId: integer("thought_id").references(() => thoughts.id),
  tokensUsed: integer("tokens_used").notNull(),
  action: text("action").notNull(), // probe, share, export
  billingPeriod: text("billing_period"), // YYYY-MM format
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_usage_ledger_user_id").on(table.userId),
  index("idx_usage_ledger_user_created").on(table.userId, table.createdAt),
  index("idx_usage_ledger_billing_period").on(table.billingPeriod),
]);

export const insertUsageLedgerSchema = createInsertSchema(usageLedger).omit({
  id: true,
  createdAt: true,
});

export type InsertUsageLedger = z.infer<typeof insertUsageLedgerSchema>;
export type UsageLedger = typeof usageLedger.$inferSelect;

// ============================================
// SHARED VISUALIZATIONS (Social Sharing)
// ============================================

export const sharedVisualizations = pgTable("shared_visualizations", {
  id: serial("id").primaryKey(),
  thoughtId: integer("thought_id").references(() => thoughts.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  slug: varchar("slug").unique().notNull(),
  title: text("title"),
  description: text("description"),
  ogImageUrl: text("og_image_url"),
  viewCount: integer("view_count").default(0),
  shareCount: integer("share_count").default(0),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertSharedVisualizationSchema = createInsertSchema(sharedVisualizations).omit({
  id: true,
  createdAt: true,
});

export type InsertSharedVisualization = z.infer<typeof insertSharedVisualizationSchema>;
export type SharedVisualization = typeof sharedVisualizations.$inferSelect;

// Re-export chat models
export * from "./models/chat";

// Re-export biofield profile models (Space Child Profile v2)
export * from "./models/biofield-profile";

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  notificationEmail: varchar("notification_email"),
  newAppsEnabled: boolean("new_apps_enabled").default(true),
  updatesEnabled: boolean("updates_enabled").default(true),
  marketingEnabled: boolean("marketing_enabled").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_notification_preferences_user_id").on(table.userId),
]);

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;

// ============================================
// TIER LIMITS CONFIGURATION
// ============================================

export const TIER_LIMITS = {
  free: {
    dailyProbes: 10,
    historyDays: 7,
    canExport: false,
    canShare: true,
    promptEvolution: false,
    apiAccess: false,
  },
  pro: {
    dailyProbes: 100,
    historyDays: 90,
    canExport: true,
    canShare: true,
    promptEvolution: true,
    apiAccess: false,
  },
  enterprise: {
    dailyProbes: Infinity,
    historyDays: Infinity,
    canExport: true,
    canShare: true,
    promptEvolution: true,
    apiAccess: true,
  },
} as const;

export type SubscriptionTier = keyof typeof TIER_LIMITS;
