import type { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipStore = new Map<string, RateLimitEntry>();

const ANONYMOUS_DAILY_LIMIT = 5;
const ANONYMOUS_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

setInterval(() => {
  const now = Date.now();
  const entries = Array.from(ipStore.entries());
  for (const [ip, entry] of entries) {
    if (now > entry.resetAt) {
      ipStore.delete(ip);
    }
  }
}, 60 * 60 * 1000);

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function anonymousRateLimit(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.claims?.sub;
  
  if (userId) {
    return next();
  }
  
  const clientIp = getClientIp(req);
  const now = Date.now();
  
  let entry = ipStore.get(clientIp);
  
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + ANONYMOUS_WINDOW_MS };
    ipStore.set(clientIp, entry);
  }
  
  entry.count++;
  
  if (entry.count > ANONYMOUS_DAILY_LIMIT) {
    const resetIn = Math.ceil((entry.resetAt - now) / 1000 / 60);
    return res.status(429).json({
      error: "Rate limit exceeded for anonymous users",
      limit: ANONYMOUS_DAILY_LIMIT,
      resetInMinutes: resetIn,
      message: "Create a free account to get more probes per day",
    });
  }
  
  res.setHeader("X-RateLimit-Limit", ANONYMOUS_DAILY_LIMIT.toString());
  res.setHeader("X-RateLimit-Remaining", (ANONYMOUS_DAILY_LIMIT - entry.count).toString());
  res.setHeader("X-RateLimit-Reset", entry.resetAt.toString());
  
  next();
}

export function apiRateLimit(requestsPerMinute: number = 60) {
  const minuteStore = new Map<string, { count: number; resetAt: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = getClientIp(req);
    const now = Date.now();
    
    let entry = minuteStore.get(clientIp);
    
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + 60 * 1000 };
      minuteStore.set(clientIp, entry);
    }
    
    entry.count++;
    
    if (entry.count > requestsPerMinute) {
      return res.status(429).json({
        error: "Too many requests",
        retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
      });
    }
    
    next();
  };
}
