import type { Json } from "../../db/database.types";
import { OpenRouterService } from "./openrouter/service";
import type { OpenRouterConfig } from "./openrouter/types";

export interface AITaskAnalysis {
  description: string;
  man_days: number;
}

export interface AIProjectAnalysis {
  tasks: AITaskAnalysis[];
  reasoning: string;
}

// Initialize OpenRouter service
const openRouterConfig: OpenRouterConfig = {
  apiUrl: "https://openrouter.ai/api/v1/chat/completions",
  apiKey: import.meta.env.OPENROUTER_API_KEY,
  defaultModel: "mistralai/mistral-small-3.1-24b-instruct",
  modelType: "mistral",
  defaultParams: {
    temperature: 0.7,
    max_tokens: 10000,
    top_p: 0.9,
  },
  responseSchema: {
    type: "json_schema",
    json_schema: {
      name: "ProjectAnalysis",
      strict: true,
      schema: {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                man_days: { type: "number" },
              },
              required: ["description", "man_days"],
            },
          },
          reasoning: { type: "string" },
        },
        required: ["tasks", "reasoning"],
      },
    },
  },
};

const openRouterService = new OpenRouterService(openRouterConfig);

/**
 * Analyzes project scope and generates estimation with tasks using OpenRouter LLM
 */
export async function analyzeProject(
  scope: string,
  platforms: string[],
  estimationType: string,
  dynamicAttributes: Json | null
): Promise<AIProjectAnalysis> {
  const systemPrompt = `You are an expert software project estimator. Your task is to analyze the project scope and provide a JSON response with tasks and estimates.
Follow these guidelines strictly:
1. Break down the project into logical tasks
2. For each task provide:
   - A clear description
   - Estimated man-days (realistic number)
3. Consider all factors in your analysis
4. Provide brief reasoning for your estimates
5. Return valid JSON matching the required schema

Response must be valid JSON with this structure:
{
  "tasks": [
    {
      "description": "task description",
      "man_days": number
    }
  ],
  "reasoning": "explanation of estimates"
}`;

  const userPrompt = `Project Details:
- Scope: ${scope}
- Platforms: ${platforms.join(", ")}
- Estimation Type: ${estimationType}
- Additional Attributes: ${JSON.stringify(dynamicAttributes)}

Analyze this project and provide a detailed estimation in the required JSON format.`;

  try {
    const response = await openRouterService.executeRequest({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: openRouterConfig.defaultModel,
      response_format: openRouterConfig.responseSchema,
    });

    const result = JSON.parse(response.result) as AIProjectAnalysis;
    return result;
  } catch (error) {
    console.error("Error analyzing project:", error);
    throw new Error("Failed to analyze project scope");
  }
}
