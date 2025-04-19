import type { Json } from "../../db/database.types";
import { OpenRouterService } from "./openrouter/service";
import type { OpenRouterConfig, ResponsePayload, MistralResponse } from "./openrouter/types";

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

function extractJsonFromText(text: string): string {
  // Remove markdown code block markers if present
  text = text
    .replace(/```json\n/g, "")
    .replace(/```\n/g, "")
    .replace(/```/g, "");

  // Find the first { and last } to extract the JSON object
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in response");
  }

  return text.slice(start, end + 1);
}

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

    // Handle different response formats
    let jsonStr: string;
    if (isOpenAIResponse(response)) {
      jsonStr = response.result;
    } else if (isMistralResponse(response)) {
      const content = response.choices[0].message.content;
      jsonStr = extractJsonFromText(content);
    } else {
      throw new Error("Unexpected response format");
    }

    const result = JSON.parse(jsonStr);

    if (!result.tasks || !Array.isArray(result.tasks)) {
      throw new Error("Invalid response format: missing tasks array");
    }

    return result;
  } catch (error) {
    console.error("Error analyzing project:", error);
    throw new Error("Failed to analyze project scope");
  }
}

function isOpenAIResponse(response: unknown): response is ResponsePayload {
  return typeof response === "object" && response !== null && "result" in response;
}

function isMistralResponse(response: unknown): response is MistralResponse {
  if (typeof response !== "object" || response === null) return false;

  const choices = (response as { choices?: unknown[] }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return false;

  const firstChoice = choices[0] as { message?: { content?: unknown } };
  if (!firstChoice.message || typeof firstChoice.message.content !== "string") return false;

  return true;
}
