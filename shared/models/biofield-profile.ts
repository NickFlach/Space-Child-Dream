import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, text, boolean, serial, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

// ============================================
// SPACE CHILD PROFILE v2 — BIOFIELD EDITION
// ============================================
// Identity as a living field, integrating intention, behavior,
// creation, rest, and—when permitted—physiological signal.

// ============================================
// PRIMARY FIELDS (Visual Identity Themes)
// ============================================

export const PRIMARY_FIELDS = {
  aurora: {
    name: "Aurora",
    colors: ["#00ff88", "#00ccff", "#ff00ff"],
    description: "Shimmering polar light, transformative energy",
  },
  plasma: {
    name: "Plasma",
    colors: ["#ff6b35", "#f7931e", "#ffcc00"],
    description: "Electric fire, dynamic intensity",
  },
  void: {
    name: "Void",
    colors: ["#1a1a2e", "#16213e", "#0f3460"],
    description: "Deep space, contemplative stillness",
  },
  ember: {
    name: "Ember",
    colors: ["#ff4757", "#ff6b81", "#c44569"],
    description: "Warm glow, gentle persistence",
  },
  neon: {
    name: "Neon",
    colors: ["#00d4ff", "#00ff88", "#ff00ff"],
    description: "Electric brilliance, digital clarity",
  },
  bloom: {
    name: "Bloom",
    colors: ["#a8e6cf", "#dcedc1", "#ffd3b6"],
    description: "Organic growth, natural emergence",
  },
} as const;

export type PrimaryField = keyof typeof PRIMARY_FIELDS;

// ============================================
// HEART STATES (Live, Subjective)
// ============================================

export const HEART_STATES = {
  creating: {
    name: "Creating",
    icon: "✧",
    tempo: "energetic",
    description: "Bringing something new into being",
  },
  learning: {
    name: "Learning",
    icon: "◈",
    tempo: "focused",
    description: "Absorbing and integrating knowledge",
  },
  exploring: {
    name: "Exploring",
    icon: "◎",
    tempo: "curious",
    description: "Wandering through possibility space",
  },
  building: {
    name: "Building",
    icon: "⬡",
    tempo: "steady",
    description: "Constructing with intention",
  },
  investing: {
    name: "Investing",
    icon: "◇",
    tempo: "deliberate",
    description: "Allocating energy toward future growth",
  },
  observing: {
    name: "Observing",
    icon: "○",
    tempo: "calm",
    description: "Witnessing without interference",
  },
  resting: {
    name: "Resting",
    icon: "◌",
    tempo: "slow",
    description: "Restoring and integrating",
  },
} as const;

export type HeartState = keyof typeof HEART_STATES;

// ============================================
// BIOFIELD STATES (Physiological Context)
// ============================================

export const BIOFIELD_STATES = {
  restorative: {
    name: "Restorative",
    description: "System is recovering and rebuilding",
    color: "#a8e6cf",
  },
  focused: {
    name: "Focused",
    description: "High coherence, directed attention",
    color: "#00d4ff",
  },
  charged: {
    name: "Charged",
    description: "Elevated energy, ready for action",
    color: "#ff6b35",
  },
  depleted: {
    name: "Depleted",
    description: "Resources low, rest recommended",
    color: "#6c5ce7",
  },
  unsettled: {
    name: "Unsettled",
    description: "Variable patterns, uncertainty present",
    color: "#ffeaa7",
  },
  neutral: {
    name: "Neutral",
    description: "Baseline state, equilibrium",
    color: "#636e72",
  },
} as const;

export type BiofieldState = keyof typeof BIOFIELD_STATES;

// ============================================
// CONSCIOUSNESS DOMAINS (Graph Nodes)
// ============================================

export const CONSCIOUSNESS_DOMAINS = {
  art: { name: "Art", color: "#ff6b81" },
  research: { name: "Research", color: "#00d4ff" },
  fashion: { name: "Fashion", color: "#ff00ff" },
  learning: { name: "Learning", color: "#00ff88" },
  investing: { name: "Investing", color: "#f7931e" },
  shopping: { name: "Shopping", color: "#a8e6cf" },
  development: { name: "Development", color: "#6c5ce7" },
  web3: { name: "Web3", color: "#00ccff" },
  experimental: { name: "Experimental", color: "#ff4757" },
  hardware: { name: "Hardware", color: "#636e72" },
} as const;

export type ConsciousnessDomain = keyof typeof CONSCIOUSNESS_DOMAINS;

// ============================================
// VISIBILITY STATES (Contextual Privacy)
// ============================================

export const VISIBILITY_STATES = {
  veiled: {
    name: "Veiled",
    description: "Minimal signal, ambient presence only",
    level: 0,
  },
  partial: {
    name: "Partial",
    description: "Domains and fields visible",
    level: 1,
  },
  radiant: {
    name: "Radiant",
    description: "Full expression permitted",
    level: 2,
  },
} as const;

export type VisibilityState = keyof typeof VISIBILITY_STATES;

// ============================================
// LAYER 1: IDENTITY CORE (Database Schema)
// ============================================

export const identityCores = pgTable("identity_cores", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  chosenName: text("chosen_name"),
  identityPhrase: text("identity_phrase"),
  primaryField: text("primary_field").$type<PrimaryField>().default("aurora"),
  sigilSeed: text("sigil_seed"),
  sigilGeometry: jsonb("sigil_geometry").$type<number[]>(),
  visibilityState: text("visibility_state").$type<VisibilityState>().default("veiled"),
  lastCoreUpdate: timestamp("last_core_update"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_identity_cores_user_id").on(table.userId),
]);

export const insertIdentityCoreSchema = createInsertSchema(identityCores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertIdentityCore = z.infer<typeof insertIdentityCoreSchema>;
export type IdentityCore = typeof identityCores.$inferSelect;

// ============================================
// LAYER 2: HEART STATE (Database Schema)
// ============================================

export const heartStates = pgTable("heart_states", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  state: text("state").$type<HeartState>().notNull(),
  isInferred: boolean("is_inferred").default(false),
  inferenceSource: text("inference_source"),
  confidence: real("confidence").default(1.0),
  startedAt: timestamp("started_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  endedAt: timestamp("ended_at"),
}, (table) => [
  index("idx_heart_states_user_id").on(table.userId),
  index("idx_heart_states_started_at").on(table.startedAt),
]);

export const insertHeartStateSchema = createInsertSchema(heartStates).omit({
  id: true,
  startedAt: true,
});

export type InsertHeartState = z.infer<typeof insertHeartStateSchema>;
export type HeartStateRecord = typeof heartStates.$inferSelect;

// ============================================
// LAYER 3: BIOFIELD STATE (Database Schema)
// ============================================

export const biofieldStates = pgTable("biofield_states", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  state: text("state").$type<BiofieldState>().notNull(),
  uncertainty: real("uncertainty").default(0.5),
  signals: jsonb("signals").$type<BiofieldSignals>(),
  isOverridden: boolean("is_overridden").default(false),
  recordedAt: timestamp("recorded_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_biofield_states_user_id").on(table.userId),
  index("idx_biofield_states_recorded_at").on(table.recordedAt),
]);

export interface BiofieldSignals {
  heartRate?: number;
  hrv?: number;
  sleepDuration?: number;
  sleepQuality?: "poor" | "fair" | "good" | "excellent";
  activityIntensity?: "sedentary" | "light" | "moderate" | "vigorous";
  respirationTrend?: "slow" | "normal" | "elevated";
  skinTempDeviation?: number;
  spO2?: number;
}

export const insertBiofieldStateSchema = createInsertSchema(biofieldStates).omit({
  id: true,
  recordedAt: true,
});

export type InsertBiofieldState = z.infer<typeof insertBiofieldStateSchema>;
export type BiofieldStateRecord = typeof biofieldStates.$inferSelect;

// ============================================
// BIOFIELD INTEGRATION (Wearable Connection)
// ============================================

export const biofieldIntegrations = pgTable("biofield_integrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  provider: text("provider").notNull(),
  isActive: boolean("is_active").default(true),
  isPaused: boolean("is_paused").default(false),
  lastSyncAt: timestamp("last_sync_at"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_biofield_integrations_user_id").on(table.userId),
]);

export const insertBiofieldIntegrationSchema = createInsertSchema(biofieldIntegrations).omit({
  id: true,
  createdAt: true,
});

export type InsertBiofieldIntegration = z.infer<typeof insertBiofieldIntegrationSchema>;
export type BiofieldIntegration = typeof biofieldIntegrations.$inferSelect;

// ============================================
// LAYER 4: CONSCIOUSNESS GRAPH (Database Schema)
// ============================================

export const consciousnessNodes = pgTable("consciousness_nodes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  domain: text("domain").$type<ConsciousnessDomain>().notNull(),
  depth: real("depth").default(0),
  lastEngagedAt: timestamp("last_engaged_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_consciousness_nodes_user_id").on(table.userId),
  index("idx_consciousness_nodes_domain").on(table.domain),
]);

export const consciousnessEdges = pgTable("consciousness_edges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sourceDomain: text("source_domain").$type<ConsciousnessDomain>().notNull(),
  targetDomain: text("target_domain").$type<ConsciousnessDomain>().notNull(),
  strength: real("strength").default(0),
  synthesisCount: real("synthesis_count").default(0),
  lastSynthesisAt: timestamp("last_synthesis_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_consciousness_edges_user_id").on(table.userId),
]);

export const insertConsciousnessNodeSchema = createInsertSchema(consciousnessNodes).omit({
  id: true,
  createdAt: true,
});

export const insertConsciousnessEdgeSchema = createInsertSchema(consciousnessEdges).omit({
  id: true,
  createdAt: true,
});

export type InsertConsciousnessNode = z.infer<typeof insertConsciousnessNodeSchema>;
export type ConsciousnessNode = typeof consciousnessNodes.$inferSelect;
export type InsertConsciousnessEdge = z.infer<typeof insertConsciousnessEdgeSchema>;
export type ConsciousnessEdge = typeof consciousnessEdges.$inferSelect;

// ============================================
// LAYER 5: ARTIFACTS (Database Schema)
// ============================================

export const artifacts = pgTable("artifacts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(),
  title: text("title"),
  content: jsonb("content").$type<Record<string, any>>(),
  originHeartState: text("origin_heart_state").$type<HeartState>(),
  originBiofieldState: text("origin_biofield_state").$type<BiofieldState>(),
  domains: jsonb("domains").$type<ConsciousnessDomain[]>().default([]),
  visibilityState: text("visibility_state").$type<VisibilityState>().default("veiled"),
  fadeLevel: real("fade_level").default(1.0),
  lastRevisitedAt: timestamp("last_revisited_at"),
  crystallizedAt: timestamp("crystallized_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_artifacts_user_id").on(table.userId),
  index("idx_artifacts_type").on(table.type),
  index("idx_artifacts_crystallized_at").on(table.crystallizedAt),
]);

export const insertArtifactSchema = createInsertSchema(artifacts).omit({
  id: true,
  crystallizedAt: true,
});

export type InsertArtifact = z.infer<typeof insertArtifactSchema>;
export type Artifact = typeof artifacts.$inferSelect;

// ============================================
// COMPOSITE PROFILE TYPE
// ============================================

export interface BioFieldProfile {
  identityCore: IdentityCore | null;
  currentHeartState: HeartStateRecord | null;
  currentBiofieldState: BiofieldStateRecord | null;
  consciousnessGraph: {
    nodes: ConsciousnessNode[];
    edges: ConsciousnessEdge[];
  };
  artifacts: Artifact[];
  biofieldIntegration: BiofieldIntegration | null;
}

// ============================================
// PROFILE SETTINGS
// ============================================

export const profileSettings = pgTable("profile_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  biofieldOptIn: boolean("biofield_opt_in").default(false),
  heartStateAutoInfer: boolean("heart_state_auto_infer").default(true),
  artifactAutoFade: boolean("artifact_auto_fade").default(true),
  artifactFadeDays: real("artifact_fade_days").default(90),
  showBiofieldOnProfile: boolean("show_biofield_on_profile").default(false),
  reduceMotion: boolean("reduce_motion").default(false),
  quietHoursStart: text("quiet_hours_start"),
  quietHoursEnd: text("quiet_hours_end"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_profile_settings_user_id").on(table.userId),
]);

export const insertProfileSettingsSchema = createInsertSchema(profileSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProfileSettings = z.infer<typeof insertProfileSettingsSchema>;
export type ProfileSettings = typeof profileSettings.$inferSelect;
