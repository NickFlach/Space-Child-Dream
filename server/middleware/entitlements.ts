import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { TIER_LIMITS, type SubscriptionTier } from "@shared/schema";

export async function checkDailyLimit(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.claims?.sub;
  
  // Allow unauthenticated users (they get free tier limits by default)
  if (!userId) {
    return next();
  }
  
  try {
    const tier = await storage.getUserTier(userId) as SubscriptionTier;
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
    
    // Unlimited probes for enterprise
    if (limits.dailyProbes === Infinity) {
      return next();
    }
    
    const dailyUsage = await storage.getUserDailyUsage(userId);
    
    if (dailyUsage >= limits.dailyProbes) {
      return res.status(429).json({
        error: "Daily probe limit reached",
        limit: limits.dailyProbes,
        used: dailyUsage,
        tier,
        upgradeMessage: tier === "free" 
          ? "Upgrade to Pro for 100 daily probes" 
          : "Upgrade to Enterprise for unlimited probes",
      });
    }
    
    // Attach tier info to request for downstream use
    (req as any).userTier = tier;
    (req as any).tierLimits = limits;
    (req as any).dailyUsage = dailyUsage;
    
    next();
  } catch (error) {
    console.error("Entitlement check error:", error);
    next();
  }
}

export function requireFeature(feature: keyof typeof TIER_LIMITS.free) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const tier = await storage.getUserTier(userId) as SubscriptionTier;
      const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
      
      if (!limits[feature]) {
        return res.status(403).json({
          error: `Feature not available on ${tier} plan`,
          feature,
          requiredTier: getRequiredTier(feature),
        });
      }
      
      next();
    } catch (error) {
      console.error("Feature check error:", error);
      res.status(500).json({ error: "Failed to check feature access" });
    }
  };
}

function getRequiredTier(feature: keyof typeof TIER_LIMITS.free): string {
  if (TIER_LIMITS.free[feature]) return "free";
  if (TIER_LIMITS.pro[feature]) return "pro";
  return "enterprise";
}
