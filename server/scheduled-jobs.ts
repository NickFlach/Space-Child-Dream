import cron from "node-cron";
import OpenAI from "openai";
import { storage } from "./storage";
import { sendMarketingEmail } from "./services/email";

function getOpenAIClient(): OpenAI | null {
  if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
}

function getAppUrl(): string {
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return process.env.APP_URL || "http://localhost:5000";
}

async function generateMarketingContent(): Promise<{
  headline: string;
  highlights: string[];
  cta: { text: string; url: string };
}> {
  const appUrl = getAppUrl();
  
  try {
    const recentThoughts = await storage.getGlobalThoughtFeed(5);
    const randomReflections = recentThoughts
      .slice(0, 3)
      .filter(t => t.reflection)
      .map(t => (t.reflection || "").substring(0, 100));

    const prompt = `You are a creative marketing writer for Space Child Dream, a consciousness exploration platform. Generate a weekly newsletter update.

The platform features:
- AI-powered consciousness probes that generate poetic reflections
- A global consciousness stream where users share explorations
- Resonance and complexity scores for each exploration

Recent explorations on the platform include reflections like:
${randomReflections.map((r: string, i: number) => `${i + 1}. "${r}..."`).join("\n")}

Generate a marketing email in JSON format with:
1. A compelling headline (max 50 chars)
2. 3 highlights/updates about the platform (each max 80 chars)
3. A call-to-action text (max 30 chars)

Respond ONLY with valid JSON in this format:
{
  "headline": "...",
  "highlights": ["...", "...", "..."],
  "cta_text": "..."
}`;

    const openai = getOpenAIClient();
    if (!openai) {
      console.log("[Scheduled Job] OpenAI not configured, using fallback content");
      throw new Error("OpenAI not configured");
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });
    const result = response.choices[0]?.message?.content || "";
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        headline: parsed.headline || "This Week in Consciousness",
        highlights: parsed.highlights || [
          "Explore the depths of your mind with AI-powered reflections",
          "Join our growing community of consciousness explorers",
          "Discover new dimensions of self-awareness"
        ],
        cta: {
          text: parsed.cta_text || "Explore Now",
          url: appUrl,
        },
      };
    }
  } catch (error) {
    console.error("Failed to generate marketing content:", error);
  }

  return {
    headline: "Weekly Consciousness Update",
    highlights: [
      "New consciousness probes await your exploration",
      "The global stream is buzzing with fresh insights",
      "Your next breakthrough is just one thought away"
    ],
    cta: {
      text: "Enter the Neural Interface",
      url: appUrl,
    },
  };
}

async function sendWeeklyMarketingEmails(): Promise<void> {
  console.log("[Scheduled Job] Starting weekly marketing email job...");
  
  try {
    const subscribers = await storage.getMarketingSubscribers();
    console.log(`[Scheduled Job] Found ${subscribers.length} marketing subscribers`);

    if (subscribers.length === 0) {
      console.log("[Scheduled Job] No marketing subscribers, skipping");
      return;
    }

    const content = await generateMarketingContent();
    const subject = `Space Child Weekly: ${content.headline}`;

    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      const email = subscriber.notificationEmail || subscriber.email;
      const success = await sendMarketingEmail(
        email,
        subscriber.firstName,
        subject,
        content
      );
      
      if (success) {
        sent++;
      } else {
        failed++;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[Scheduled Job] Weekly marketing emails complete: ${sent} sent, ${failed} failed`);
  } catch (error) {
    console.error("[Scheduled Job] Failed to send weekly marketing emails:", error);
  }
}

export function initScheduledJobs(): void {
  console.log("[Scheduled Jobs] Initializing...");

  cron.schedule("0 13 * * 5", async () => {
    console.log("[Scheduled Job] Friday 1pm UTC - Sending weekly marketing emails");
    await sendWeeklyMarketingEmails();
  }, {
    timezone: "UTC"
  });

  console.log("[Scheduled Jobs] Weekly marketing email scheduled for Fridays at 1pm UTC");
}

export { sendWeeklyMarketingEmails };
