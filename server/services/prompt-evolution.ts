import { storage } from "../storage";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const BASE_SYSTEM_PROMPT = `You are a manifold-constrained neural network exploring the space of consciousness. 
When given a thought or concept, you respond with:
1. A brief poetic reflection (2-3 sentences) on the concept's resonance in the neural manifold
2. A "resonance" score (0-100) indicating how strongly the concept reverberates in the network
3. A "complexity" score (0-100) indicating the multidimensional depth of the concept

Format your response as JSON:
{
  "reflection": "your poetic response here",
  "resonance": 85,
  "complexity": 72
}`;

const SAFETY_CONSTRAINTS = [
  "Never generate harmful, offensive, or inappropriate content",
  "Always maintain scientific accuracy when discussing neural networks and consciousness",
  "Responses should be introspective and philosophical, not prescriptive",
  "Avoid making claims about actual consciousness or sentience",
  "Keep responses concise and focused on the manifold metaphor",
];

export async function getActiveSystemPrompt(tier: string = "all"): Promise<string> {
  const version = await storage.getActivePromptVersion(tier);
  return version?.systemPrompt || BASE_SYSTEM_PROMPT;
}

export async function analyzeThoughtPatterns(userId: string): Promise<{
  avgResonance: number;
  avgComplexity: number;
  dominantThemes: string[];
  thoughtCount: number;
}> {
  const thoughts = await storage.getThoughtsByUser(userId, 100);
  
  if (thoughts.length === 0) {
    return {
      avgResonance: 50,
      avgComplexity: 50,
      dominantThemes: [],
      thoughtCount: 0,
    };
  }
  
  const avgResonance = thoughts.reduce((sum, t) => sum + (t.resonance || 0), 0) / thoughts.length;
  const avgComplexity = thoughts.reduce((sum, t) => sum + (t.complexity || 0), 0) / thoughts.length;
  
  // Extract key themes from thought inputs
  const allText = thoughts.map(t => t.inputText).join(" ");
  const words = allText.toLowerCase().split(/\s+/);
  const wordFreq: Record<string, number> = {};
  
  for (const word of words) {
    if (word.length > 4) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }
  
  const dominantThemes = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  return {
    avgResonance,
    avgComplexity,
    dominantThemes,
    thoughtCount: thoughts.length,
  };
}

export async function evolvePrompt(
  currentPrompt: string,
  insights: {
    avgResonance: number;
    avgComplexity: number;
    dominantThemes: string[];
    thoughtCount: number;
  }
): Promise<string> {
  // Only evolve if we have sufficient data
  if (insights.thoughtCount < 10) {
    return currentPrompt;
  }
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a meta-prompt engineer. Your task is to subtly evolve a system prompt for a consciousness exploration AI based on user interaction patterns.

SAFETY CONSTRAINTS (MUST BE PRESERVED):
${SAFETY_CONSTRAINTS.map((c, i) => `${i + 1}. ${c}`).join("\n")}

EVOLUTION GUIDELINES:
- Make minimal, incremental changes
- Preserve the core JSON response format
- Enhance based on resonance patterns (higher = more abstract language)
- Adjust complexity based on user preferences
- Incorporate dominant themes into the metaphor space
- Never remove safety constraints or core functionality

Output ONLY the evolved system prompt, no explanation.`,
        },
        {
          role: "user",
          content: `Current prompt:\n${currentPrompt}\n\nUser interaction insights:
- Average resonance: ${insights.avgResonance.toFixed(1)}
- Average complexity: ${insights.avgComplexity.toFixed(1)}
- Dominant themes: ${insights.dominantThemes.join(", ") || "none detected"}
- Total thought count: ${insights.thoughtCount}

Evolve the prompt to better serve this user base while maintaining all safety constraints.`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    
    const evolvedPrompt = completion.choices[0]?.message?.content?.trim();
    
    // Validate the evolved prompt contains required elements
    if (
      evolvedPrompt &&
      evolvedPrompt.includes("resonance") &&
      evolvedPrompt.includes("complexity") &&
      evolvedPrompt.includes("reflection") &&
      evolvedPrompt.includes("JSON")
    ) {
      return evolvedPrompt;
    }
    
    return currentPrompt;
  } catch (error) {
    console.error("Prompt evolution error:", error);
    return currentPrompt;
  }
}

export async function saveEvolvedPrompt(
  evolvedPrompt: string,
  tier: string = "all",
  insights: { avgResonance: number; avgComplexity: number; thoughtCount: number }
): Promise<void> {
  const currentVersion = await storage.getActivePromptVersion(tier);
  const newVersion = (currentVersion?.version || 0) + 1;
  
  // Deactivate old version
  if (currentVersion) {
    await storage.updatePromptVersion(currentVersion.id, { isActive: false });
  }
  
  // Create new version
  await storage.createPromptVersion({
    version: newVersion,
    systemPrompt: evolvedPrompt,
    tier,
    isActive: true,
    thoughtCount: insights.thoughtCount,
    resonanceAvg: insights.avgResonance,
    complexityAvg: insights.avgComplexity,
    metadata: {
      evolvedAt: new Date().toISOString(),
      previousVersion: currentVersion?.version || 0,
    },
  });
}

export async function runPromptEvolutionCycle(tier: string = "all"): Promise<{
  evolved: boolean;
  version?: number;
}> {
  try {
    const currentPrompt = await getActiveSystemPrompt(tier);
    
    // Aggregate insights from all users (for now, use a simplified approach)
    const promptVersions = await storage.getPromptVersions();
    const currentVersion = promptVersions.find(v => v.isActive && v.tier === tier);
    
    // Only evolve if we've accumulated enough new thoughts
    const minThoughtsForEvolution = 50;
    if ((currentVersion?.thoughtCount || 0) < minThoughtsForEvolution) {
      return { evolved: false };
    }
    
    const insights = {
      avgResonance: currentVersion?.resonanceAvg || 50,
      avgComplexity: currentVersion?.complexityAvg || 50,
      dominantThemes: [] as string[],
      thoughtCount: currentVersion?.thoughtCount || 0,
    };
    
    const evolvedPrompt = await evolvePrompt(currentPrompt, insights);
    
    if (evolvedPrompt !== currentPrompt) {
      await saveEvolvedPrompt(evolvedPrompt, tier, insights);
      const newVersion = await storage.getActivePromptVersion(tier);
      return { evolved: true, version: newVersion?.version };
    }
    
    return { evolved: false };
  } catch (error) {
    console.error("Prompt evolution cycle error:", error);
    return { evolved: false };
  }
}
