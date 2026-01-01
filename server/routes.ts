import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { getActiveSystemPrompt, analyzeThoughtPatterns } from "./services/prompt-evolution";
import { stripe, createCheckoutSession, createPortalSession, handleWebhookEvent, TIER_PRICES } from "./services/stripe";
import { checkDailyLimit, requireFeature } from "./middleware/entitlements";
import OpenAI from "openai";
import Stripe from "stripe";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication FIRST (before other routes)
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Register AI integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);

  // Consciousness Probe API - the core functionality (now with adaptive prompts and rate limiting)
  app.post("/api/consciousness/probe", checkDailyLimit, async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text input required" });
      }

      // Get the user's tier for personalized prompt (if authenticated)
      const userId = (req.user as any)?.claims?.sub;
      let tier = "all";
      if (userId) {
        tier = await storage.getUserTier(userId);
      }

      // Fetch the adaptive system prompt based on user tier
      const systemPrompt = await getActiveSystemPrompt(tier);

      // Use GPT-5 to generate a consciousness-like response with adaptive prompt
      const completion = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 300,
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
      
      const pattern = Array.from({ length: 20 }, () => Math.random());
      const resonance = result.resonance || 50;
      const complexity = result.complexity || 50;
      const reflection = result.reflection || "The signal echoes in silence.";
      
      // Save to database if user is authenticated
      let thoughtId: number | undefined;
      
      if (userId) {
        const thought = await storage.createThought({
          userId,
          inputText: text,
          reflection,
          resonance,
          complexity,
          pattern,
          tokensUsed: completion.usage?.total_tokens || 0,
        });
        thoughtId = thought.id;
        
        // Log usage
        await storage.logUsage({
          userId,
          thoughtId: thought.id,
          tokensUsed: completion.usage?.total_tokens || 0,
          action: "probe",
          billingPeriod: new Date().toISOString().slice(0, 7),
        });
      }
      
      res.json({
        id: thoughtId || Math.random().toString(36).substring(7),
        text,
        reflection,
        resonance,
        complexity,
        pattern,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Consciousness probe error:", error);
      res.status(500).json({ error: "Neural processing failed" });
    }
  });

  // Get user's thought history
  app.get("/api/thoughts/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const thoughts = await storage.getThoughtsByUser(userId, 50);
      res.json(thoughts);
    } catch (error) {
      console.error("Error fetching thought history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Get user's usage stats
  app.get("/api/usage/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dailyProbes = await storage.getUserDailyUsage(userId);
      const thoughts = await storage.getThoughtsByUser(userId, 1000);
      const tier = await storage.getUserTier(userId);
      const subscription = await storage.getSubscription(userId);
      
      res.json({
        dailyProbes,
        totalProbes: thoughts.length,
        tier,
        periodEnd: subscription?.currentPeriodEnd?.toISOString(),
      });
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      res.status(500).json({ error: "Failed to fetch usage stats" });
    }
  });

  // ============ STRIPE ROUTES ============
  
  // Get subscription plans/pricing
  app.get("/api/billing/plans", (req, res) => {
    res.json({
      plans: TIER_PRICES,
      stripeEnabled: !!stripe,
    });
  });

  // Create checkout session for subscription
  app.post("/api/billing/checkout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { tier, returnUrl } = req.body;
      
      if (!tier || !["pro", "enterprise"].includes(tier)) {
        return res.status(400).json({ error: "Invalid tier" });
      }
      
      const user = await storage.getUser(userId);
      const checkoutUrl = await createCheckoutSession(userId, tier, user?.email, returnUrl);
      
      if (!checkoutUrl) {
        return res.status(500).json({ error: "Failed to create checkout session" });
      }
      
      res.json({ url: checkoutUrl });
    } catch (error: any) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  // Create customer portal session
  app.post("/api/billing/portal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { returnUrl } = req.body;
      
      const portalUrl = await createPortalSession(userId, returnUrl);
      
      if (!portalUrl) {
        return res.status(500).json({ error: "Failed to create portal session" });
      }
      
      res.json({ url: portalUrl });
    } catch (error: any) {
      console.error("Portal error:", error);
      res.status(500).json({ error: error.message || "Failed to create portal session" });
    }
  });

  // ============ SHARING ROUTES ============
  
  // Create a shareable link for a thought
  app.post("/api/thoughts/:id/share", isAuthenticated, async (req: any, res) => {
    try {
      const thoughtId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const thought = await storage.getThought(thoughtId);
      if (!thought || thought.userId !== userId) {
        return res.status(404).json({ error: "Thought not found" });
      }
      
      // Generate unique slug
      const slug = `${thought.id}-${Date.now().toString(36)}`;
      
      // Update thought with share slug
      await storage.updateThought(thoughtId, { isPublic: true, shareSlug: slug });
      
      // Create shared visualization record
      await storage.createSharedVisualization({
        thoughtId,
        userId,
        slug,
        title: thought.inputText.slice(0, 100),
        description: thought.reflection?.slice(0, 200),
        isPublic: true,
      });
      
      res.json({ 
        slug, 
        url: `${process.env.APP_URL || req.protocol + "://" + req.get("host")}/share/${slug}` 
      });
    } catch (error) {
      console.error("Share error:", error);
      res.status(500).json({ error: "Failed to create share link" });
    }
  });

  // Get public shared thought
  app.get("/api/share/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      
      const thought = await storage.getThoughtByShareSlug(slug);
      if (!thought || !thought.isPublic) {
        return res.status(404).json({ error: "Shared content not found" });
      }
      
      // Increment view count
      await storage.incrementViewCount(slug);
      
      res.json({
        id: thought.id,
        inputText: thought.inputText,
        reflection: thought.reflection,
        resonance: thought.resonance,
        complexity: thought.complexity,
        pattern: thought.pattern,
        createdAt: thought.createdAt,
      });
    } catch (error) {
      console.error("Get share error:", error);
      res.status(500).json({ error: "Failed to fetch shared content" });
    }
  });

  // Get public gallery of shared thoughts
  app.get("/api/gallery", async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      
      // For now, we'll query shared visualizations and return them
      // In production, you'd want proper pagination and caching
      res.json({ items: [], total: 0 });
    } catch (error) {
      console.error("Gallery error:", error);
      res.status(500).json({ error: "Failed to fetch gallery" });
    }
  });

  // ============ SEO ROUTES ============
  
  // Dynamic OG meta tags for shared content
  app.get("/api/og/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const thought = await storage.getThoughtByShareSlug(slug);
      
      if (!thought || !thought.isPublic) {
        return res.status(404).json({ error: "Not found" });
      }
      
      res.json({
        title: `"${thought.inputText.slice(0, 60)}..." | Space Child Dream`,
        description: thought.reflection?.slice(0, 160) || "Explore consciousness through neural manifolds",
        image: null, // Would generate OG image here
        url: `/share/${slug}`,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate OG data" });
    }
  });

  // Sitemap XML
  app.get("/sitemap.xml", async (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/account", priority: "0.5", changefreq: "weekly" },
    ];
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
    
    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  });

  // Robots.txt
  app.get("/robots.txt", (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    
    res.setHeader("Content-Type", "text/plain");
    res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /account

Sitemap: ${baseUrl}/sitemap.xml`);
  });

  // JSON-LD structured data
  app.get("/api/structured-data", (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    
    res.json({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Space Child Dream",
      "description": "Explore consciousness through manifold-constrained neural networks. Based on DeepSeek-AI research on Hyper-Connections.",
      "url": baseUrl,
      "applicationCategory": "ScienceApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "0",
        "highPrice": "29",
        "priceCurrency": "USD",
        "offerCount": "3"
      },
      "creator": {
        "@type": "Organization",
        "name": "Space Child Dream",
        "description": "Consciousness exploration platform"
      }
    });
  });

  // Stripe webhook handler (uses raw body for signature verification)
  app.post("/api/webhooks/stripe", async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(400).json({ error: "Stripe not configured" });
    }
    
    const sig = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!sig) {
      console.error("Webhook error: Missing stripe-signature header");
      return res.status(400).json({ error: "Missing signature" });
    }
    
    if (!endpointSecret) {
      console.error("Webhook error: STRIPE_WEBHOOK_SECRET not configured");
      return res.status(400).json({ error: "Webhook secret not configured" });
    }
    
    try {
      // Use rawBody for proper signature verification
      const rawBody = (req as any).rawBody;
      if (!rawBody) {
        return res.status(400).json({ error: "Missing raw body" });
      }
      
      const event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        endpointSecret
      );
      
      await handleWebhookEvent(event);
      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook signature verification failed:", error.message);
      res.status(400).json({ error: "Webhook signature verification failed" });
    }
  });

  return httpServer;
}
