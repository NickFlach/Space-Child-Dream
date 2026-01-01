import { db } from "./db";
import { 
  users, thoughts, promptVersions, subscriptions, usageLedger, sharedVisualizations,
  type User, type UpsertUser,
  type Thought, type InsertThought,
  type PromptVersion, type InsertPromptVersion,
  type Subscription, type InsertSubscription,
  type UsageLedger, type InsertUsageLedger,
  type SharedVisualization, type InsertSharedVisualization,
} from "@shared/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;

  // Thoughts
  getThought(id: number): Promise<Thought | undefined>;
  getThoughtsByUser(userId: string, limit?: number): Promise<Thought[]>;
  getThoughtByShareSlug(slug: string): Promise<Thought | undefined>;
  createThought(thought: InsertThought): Promise<Thought>;
  updateThought(id: number, data: Partial<InsertThought>): Promise<Thought | undefined>;

  // Prompt Versions
  getActivePromptVersion(tier?: string): Promise<PromptVersion | undefined>;
  getPromptVersions(): Promise<PromptVersion[]>;
  createPromptVersion(version: InsertPromptVersion): Promise<PromptVersion>;
  updatePromptVersion(id: number, data: Partial<InsertPromptVersion>): Promise<PromptVersion | undefined>;

  // Subscriptions
  getSubscription(userId: string): Promise<Subscription | undefined>;
  getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<Subscription | undefined>;

  // Usage
  getUserDailyUsage(userId: string): Promise<number>;
  logUsage(usage: InsertUsageLedger): Promise<UsageLedger>;
  getUserUsageHistory(userId: string, limit?: number): Promise<UsageLedger[]>;

  // Shared Visualizations
  getSharedVisualization(slug: string): Promise<SharedVisualization | undefined>;
  createSharedVisualization(viz: InsertSharedVisualization): Promise<SharedVisualization>;
  incrementViewCount(slug: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ============ USERS ============
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user;
  }

  // ============ THOUGHTS ============
  async getThought(id: number): Promise<Thought | undefined> {
    const [thought] = await db.select().from(thoughts).where(eq(thoughts.id, id));
    return thought;
  }

  async getThoughtsByUser(userId: string, limit = 50): Promise<Thought[]> {
    return db.select().from(thoughts).where(eq(thoughts.userId, userId)).orderBy(desc(thoughts.createdAt)).limit(limit);
  }

  async getThoughtByShareSlug(slug: string): Promise<Thought | undefined> {
    const [thought] = await db.select().from(thoughts).where(eq(thoughts.shareSlug, slug));
    return thought;
  }

  async createThought(thought: InsertThought): Promise<Thought> {
    const [created] = await db.insert(thoughts).values(thought).returning();
    return created;
  }

  async updateThought(id: number, data: Partial<InsertThought>): Promise<Thought | undefined> {
    const [updated] = await db.update(thoughts).set(data).where(eq(thoughts.id, id)).returning();
    return updated;
  }

  // ============ PROMPT VERSIONS ============
  async getActivePromptVersion(tier = "all"): Promise<PromptVersion | undefined> {
    // First try to find a tier-specific prompt
    let [version] = await db.select().from(promptVersions)
      .where(and(eq(promptVersions.isActive, true), eq(promptVersions.tier, tier)))
      .orderBy(desc(promptVersions.version))
      .limit(1);
    
    // Fall back to "all" tier if no tier-specific prompt exists
    if (!version && tier !== "all") {
      [version] = await db.select().from(promptVersions)
        .where(and(eq(promptVersions.isActive, true), eq(promptVersions.tier, "all")))
        .orderBy(desc(promptVersions.version))
        .limit(1);
    }
    
    return version;
  }

  async getPromptVersions(): Promise<PromptVersion[]> {
    return db.select().from(promptVersions).orderBy(desc(promptVersions.version));
  }

  async createPromptVersion(version: InsertPromptVersion): Promise<PromptVersion> {
    const [created] = await db.insert(promptVersions).values(version).returning();
    return created;
  }

  async updatePromptVersion(id: number, data: Partial<InsertPromptVersion>): Promise<PromptVersion | undefined> {
    const [updated] = await db.update(promptVersions).set(data).where(eq(promptVersions.id, id)).returning();
    return updated;
  }

  // ============ SUBSCRIPTIONS ============
  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return sub;
  }

  async getUserTier(userId: string): Promise<string> {
    const sub = await this.getSubscription(userId);
    if (!sub || sub.status !== "active") {
      return "free";
    }
    return sub.tier;
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
    return sub;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [created] = await db.insert(subscriptions).values(subscription).returning();
    return created;
  }

  async updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const [updated] = await db.update(subscriptions).set({ ...data, updatedAt: new Date() }).where(eq(subscriptions.id, id)).returning();
    return updated;
  }

  // ============ USAGE ============
  async getUserDailyUsage(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(thoughts)
      .where(and(eq(thoughts.userId, userId), gte(thoughts.createdAt, today)));
    
    return result[0]?.count || 0;
  }

  async logUsage(usage: InsertUsageLedger): Promise<UsageLedger> {
    const [created] = await db.insert(usageLedger).values(usage).returning();
    return created;
  }

  async getUserUsageHistory(userId: string, limit = 100): Promise<UsageLedger[]> {
    return db.select().from(usageLedger).where(eq(usageLedger.userId, userId)).orderBy(desc(usageLedger.createdAt)).limit(limit);
  }

  // ============ SHARED VISUALIZATIONS ============
  async getSharedVisualization(slug: string): Promise<SharedVisualization | undefined> {
    const [viz] = await db.select().from(sharedVisualizations).where(eq(sharedVisualizations.slug, slug));
    return viz;
  }

  async createSharedVisualization(viz: InsertSharedVisualization): Promise<SharedVisualization> {
    const [created] = await db.insert(sharedVisualizations).values(viz).returning();
    return created;
  }

  async incrementViewCount(slug: string): Promise<void> {
    await db.update(sharedVisualizations)
      .set({ viewCount: sql`${sharedVisualizations.viewCount} + 1` })
      .where(eq(sharedVisualizations.slug, slug));
  }
}

export const storage = new DatabaseStorage();
