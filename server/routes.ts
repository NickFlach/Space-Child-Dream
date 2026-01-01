import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register AI integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);

  // Consciousness Probe API - the core functionality
  app.post("/api/consciousness/probe", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text input required" });
      }

      // Use GPT-5 to generate a consciousness-like response
      const completion = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          {
            role: "system",
            content: `You are a manifold-constrained neural network exploring the space of consciousness. 
When given a thought or concept, you respond with:
1. A brief poetic reflection (2-3 sentences) on the concept's resonance in the neural manifold
2. A "resonance" score (0-100) indicating how strongly the concept reverberates in the network
3. A "complexity" score (0-100) indicating the multidimensional depth of the concept

Format your response as JSON:
{
  "reflection": "your poetic response here",
  "resonance": 85,
  "complexity": 72
}`
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
      
      res.json({
        id: Math.random().toString(36).substring(7),
        text,
        reflection: result.reflection || "The signal echoes in silence.",
        resonance: result.resonance || 50,
        complexity: result.complexity || 50,
        pattern: Array.from({ length: 20 }, () => Math.random()),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Consciousness probe error:", error);
      res.status(500).json({ error: "Neural processing failed" });
    }
  });

  return httpServer;
}
