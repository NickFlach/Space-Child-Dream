/**
 * Biofield Profile API Routes
 * 
 * Server-side routes for Space Child Profile v2 — Biofield Edition
 * Identity infrastructure for a post-extractive, bio-aware internet.
 */

import type { Express, Request, Response } from "express";
import { isSpaceChildAuthenticated } from "./space-child-auth-routes";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import {
  identityCores,
  heartStates,
  biofieldStates,
  biofieldIntegrations,
  consciousnessNodes,
  consciousnessEdges,
  artifacts,
  profileSettings,
  type IdentityCore,
  type HeartState,
  type BiofieldState,
  type ConsciousnessDomain,
  type InsertConsciousnessEdge,
} from "@shared/models/biofield-profile";

// Generate a random sigil seed
function generateSigilSeed(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let seed = "";
  for (let i = 0; i < 16; i++) {
    seed += chars[Math.floor(Math.random() * chars.length)];
  }
  return seed;
}

export function registerProfileRoutes(app: Express) {
  // ============================================
  // GET COMPLETE PROFILE
  // ============================================
  app.get("/api/profile/biofield", isSpaceChildAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;

      // Fetch all profile layers in parallel
      const [
        identityCore,
        currentHeartState,
        currentBiofieldState,
        integration,
        nodes,
        edges,
        userArtifacts,
      ] = await Promise.all([
        db.select().from(identityCores).where(eq(identityCores.userId, userId)).limit(1),
        db.select().from(heartStates)
          .where(and(eq(heartStates.userId, userId), eq(heartStates.endedAt, null as any)))
          .orderBy(desc(heartStates.startedAt))
          .limit(1),
        db.select().from(biofieldStates)
          .where(eq(biofieldStates.userId, userId))
          .orderBy(desc(biofieldStates.recordedAt))
          .limit(1),
        db.select().from(biofieldIntegrations)
          .where(and(eq(biofieldIntegrations.userId, userId), eq(biofieldIntegrations.isActive, true)))
          .limit(1),
        db.select().from(consciousnessNodes).where(eq(consciousnessNodes.userId, userId)),
        db.select().from(consciousnessEdges).where(eq(consciousnessEdges.userId, userId)),
        db.select().from(artifacts)
          .where(eq(artifacts.userId, userId))
          .orderBy(desc(artifacts.crystallizedAt))
          .limit(50),
      ]);

      res.json({
        identityCore: identityCore[0] || null,
        currentHeartState: currentHeartState[0] || null,
        currentBiofieldState: currentBiofieldState[0] || null,
        biofieldIntegration: integration[0] || null,
        consciousnessGraph: {
          nodes,
          edges,
        },
        artifacts: userArtifacts,
      });
    } catch (error) {
      console.error("Error fetching biofield profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // ============================================
  // GET PROFILE SETTINGS
  // ============================================
  app.get("/api/profile/settings", isSpaceChildAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;

      const settings = await db.select().from(profileSettings)
        .where(eq(profileSettings.userId, userId))
        .limit(1);

      if (settings[0]) {
        res.json(settings[0]);
      } else {
        // Create default settings
        const newSettings = await db.insert(profileSettings)
          .values({ userId })
          .returning();
        res.json(newSettings[0]);
      }
    } catch (error) {
      console.error("Error fetching profile settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // ============================================
  // UPDATE PROFILE SETTINGS
  // ============================================
  app.put("/api/profile/settings", isSpaceChildAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;

      // Ensure settings exist
      const existing = await db.select().from(profileSettings)
        .where(eq(profileSettings.userId, userId))
        .limit(1);

      let result;
      if (existing[0]) {
        result = await db.update(profileSettings)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(profileSettings.userId, userId))
          .returning();
      } else {
        result = await db.insert(profileSettings)
          .values({ userId, ...updates })
          .returning();
      }

      res.json(result[0]);
    } catch (error) {
      console.error("Error updating profile settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // ============================================
  // LAYER 1: IDENTITY CORE
  // ============================================
  app.put("/api/profile/identity-core", isSpaceChildAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { chosenName, identityPhrase, primaryField, visibilityState } = req.body;

      // Check if identity core exists
      const existing = await db.select().from(identityCores)
        .where(eq(identityCores.userId, userId))
        .limit(1);

      let result;
      if (existing[0]) {
        result = await db.update(identityCores)
          .set({
            chosenName,
            identityPhrase,
            primaryField,
            visibilityState,
            lastCoreUpdate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(identityCores.userId, userId))
          .returning();
      } else {
        result = await db.insert(identityCores)
          .values({
            userId,
            chosenName,
            identityPhrase,
            primaryField: primaryField || "aurora",
            visibilityState: visibilityState || "veiled",
            sigilSeed: generateSigilSeed(),
            lastCoreUpdate: new Date(),
          })
          .returning();
      }

      res.json(result[0]);
    } catch (error) {
      console.error("Error updating identity core:", error);
      res.status(500).json({ error: "Failed to update identity core" });
    }
  });

  // ============================================
  // SIGIL REGENERATION
  // ============================================
  app.post("/api/profile/sigil/regenerate", isSpaceChildAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const newSeed = generateSigilSeed();

      // Ensure identity core exists
      const existing = await db.select().from(identityCores)
        .where(eq(identityCores.userId, userId))
        .limit(1);

      if (existing[0]) {
        await db.update(identityCores)
          .set({ sigilSeed: newSeed, updatedAt: new Date() })
          .where(eq(identityCores.userId, userId));
      } else {
        await db.insert(identityCores)
          .values({
            userId,
            sigilSeed: newSeed,
          });
      }

      res.json({ seed: newSeed });
    } catch (error) {
      console.error("Error regenerating sigil:", error);
      res.status(500).json({ error: "Failed to regenerate sigil" });
    }
  });

  // ============================================
  // LAYER 2: HEART STATE
  // ============================================
  app.post("/api/profile/heart-state", isSpaceChildAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { state } = req.body;

      // End any current heart state
      await db.update(heartStates)
        .set({ endedAt: new Date() })
        .where(and(
          eq(heartStates.userId, userId),
          eq(heartStates.endedAt, null as any)
        ));

      // Create new heart state
      const result = await db.insert(heartStates)
        .values({
          userId,
          state,
          isInferred: false,
          confidence: 1.0,
        })
        .returning();

      res.json(result[0]);
    } catch (error) {
      console.error("Error setting heart state:", error);
      res.status(500).json({ error: "Failed to set heart state" });
    }
  });

  // ============================================
  // LAYER 3: BIOFIELD STATE OVERRIDE
  // ============================================
  app.post("/api/profile/biofield-state/override", isSpaceChildAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { state } = req.body;

      if (state === null) {
        // Clear override - mark existing overridden states as not overridden
        await db.update(biofieldStates)
          .set({ isOverridden: false })
          .where(and(
            eq(biofieldStates.userId, userId),
            eq(biofieldStates.isOverridden, true)
          ));
        res.json({ cleared: true });
      } else {
        // Create new overridden state
        const result = await db.insert(biofieldStates)
          .values({
            userId,
            state,
            isOverridden: true,
            uncertainty: 0,
          })
          .returning();
        res.json(result[0]);
      }
    } catch (error) {
      console.error("Error overriding biofield state:", error);
      res.status(500).json({ error: "Failed to override biofield state" });
    }
  });

  // ============================================
  // LAYER 4: CONSCIOUSNESS GRAPH
  // ============================================
  app.post("/api/profile/consciousness/engage", isSpaceChildAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { domain } = req.body;

      // Find or create node
      const existing = await db.select().from(consciousnessNodes)
        .where(and(
          eq(consciousnessNodes.userId, userId),
          eq(consciousnessNodes.domain, domain)
        ))
        .limit(1);

      if (existing[0]) {
        // Increase depth through engagement (depth grows through quality, not frequency)
        const newDepth = Math.min(10, (existing[0].depth || 0) + 0.1);
        await db.update(consciousnessNodes)
          .set({
            depth: newDepth,
            lastEngagedAt: new Date(),
          })
          .where(eq(consciousnessNodes.id, existing[0].id));
      } else {
        await db.insert(consciousnessNodes)
          .values({
            userId,
            domain,
            depth: 0.1,
            lastEngagedAt: new Date(),
          });
      }

      res.json({ engaged: true });
    } catch (error) {
      console.error("Error engaging domain:", error);
      res.status(500).json({ error: "Failed to engage domain" });
    }
  });

  // ============================================
  // LAYER 5: ARTIFACTS
  // ============================================
  app.post("/api/profile/artifacts", isSpaceChildAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { type, title, content, domains } = req.body;

      // Get current heart and biofield states for origin context
      const [currentHeart, currentBiofield] = await Promise.all([
        db.select().from(heartStates)
          .where(and(eq(heartStates.userId, userId), eq(heartStates.endedAt, null as any)))
          .limit(1),
        db.select().from(biofieldStates)
          .where(eq(biofieldStates.userId, userId))
          .orderBy(desc(biofieldStates.recordedAt))
          .limit(1),
      ]);

      const result = await db.insert(artifacts)
        .values({
          userId,
          type,
          title,
          content,
          domains: domains || [],
          originHeartState: currentHeart[0]?.state,
          originBiofieldState: currentBiofield[0]?.state,
          visibilityState: "veiled",
          fadeLevel: 1.0,
        })
        .returning();

      // Update consciousness graph edges if multiple domains
      // Batched approach: O(1) queries instead of O(n²) queries
      if (domains && domains.length > 1) {
        // Generate all domain pairs
        const domainPairs: Array<{ source: string; target: string }> = [];
        for (let i = 0; i < domains.length; i++) {
          for (let j = i + 1; j < domains.length; j++) {
            domainPairs.push({ source: domains[i], target: domains[j] });
          }
        }

        // Fetch all existing edges for this user in ONE query
        const existingEdges = await db.select().from(consciousnessEdges)
          .where(eq(consciousnessEdges.userId, userId));

        // Build a lookup map for existing edges
        const edgeMap = new Map<string, typeof existingEdges[0]>();
        existingEdges.forEach(edge => {
          edgeMap.set(`${edge.sourceDomain}:${edge.targetDomain}`, edge);
        });

        // Separate into updates and inserts
        const updatePromises: Promise<any>[] = [];
        const newEdges: InsertConsciousnessEdge[] = [];

        for (const pair of domainPairs) {
          const existingEdge = edgeMap.get(`${pair.source}:${pair.target}`);
          if (existingEdge) {
            // Queue update
            updatePromises.push(
              db.update(consciousnessEdges)
                .set({
                  strength: Math.min(1, (existingEdge.strength || 0) + 0.1),
                  synthesisCount: (existingEdge.synthesisCount || 0) + 1,
                  lastSynthesisAt: new Date(),
                })
                .where(eq(consciousnessEdges.id, existingEdge.id))
            );
          } else {
            // Queue insert
            newEdges.push({
              userId,
              sourceDomain: pair.source as ConsciousnessDomain,
              targetDomain: pair.target as ConsciousnessDomain,
              strength: 0.1,
              synthesisCount: 1,
              lastSynthesisAt: new Date(),
            });
          }
        }

        // Execute all updates in parallel + batch insert new edges
        await Promise.all([
          ...updatePromises,
          newEdges.length > 0
            ? db.insert(consciousnessEdges).values(newEdges as typeof consciousnessEdges.$inferInsert[])
            : Promise.resolve(),
        ]);
      }

      res.json(result[0]);
    } catch (error) {
      console.error("Error crystallizing artifact:", error);
      res.status(500).json({ error: "Failed to crystallize artifact" });
    }
  });

  // Revisit artifact (prevents fading)
  app.post("/api/profile/artifacts/:id/revisit", isSpaceChildAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const artifactId = parseInt(req.params.id);

      const artifact = await db.select().from(artifacts)
        .where(and(
          eq(artifacts.id, artifactId),
          eq(artifacts.userId, userId)
        ))
        .limit(1);

      if (!artifact[0]) {
        return res.status(404).json({ error: "Artifact not found" });
      }

      await db.update(artifacts)
        .set({
          lastRevisitedAt: new Date(),
          fadeLevel: 1.0,
        })
        .where(eq(artifacts.id, artifactId));

      res.json({ revisited: true });
    } catch (error) {
      console.error("Error revisiting artifact:", error);
      res.status(500).json({ error: "Failed to revisit artifact" });
    }
  });
}
