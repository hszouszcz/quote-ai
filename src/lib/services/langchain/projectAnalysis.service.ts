import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

import { errorReporter } from "@/lib/errors";
import { z } from "zod";
import { createProjectAnalysisPrompt, PROJECT_ANALYSIS_SYSTEM_PROMPT } from "./prompts";

const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = import.meta.env.OPENROUTER_BASE_URL;
const PROJECT_ANALYSIS_MODEL = import.meta.env.PROJECT_ANALYSIS_MODEL;

// Define the Zod schema for validation and type safety
const ProjectAnalysisSchema = z.object({
  goal: z.string().min(1, "Goal cannot be empty").describe("Main project goal or purpose"),

  target_audience: z
    .array(z.string().min(1))
    .min(1, "Must have at least one target audience")
    .describe("Target users or audience groups"),
  type: z
    .string()
    .min(1, "Type cannot be empty")
    .describe("Product type (SaaS, mobile app, marketplace, internal tool, etc.)"),
  key_features: z.record(z.string(), z.array(z.string().min(1))).describe("Key features grouped by category"),
  non_functional: z.array(z.string().min(1)).describe("Non-functional requirements, integrations, performance needs"),
  open_questions: z.array(z.string().min(1)).describe("Known constraints or open questions"),
});

// TypeScript type inferred from Zod schema
type ProjectAnalysis = z.infer<typeof ProjectAnalysisSchema>;

export class ProjectAnalysisService {
  private agent: ChatOpenAI;

  constructor() {
    // Configure ChatOpenAI to use OpenRouter
    this.agent = new ChatOpenAI({
      model: PROJECT_ANALYSIS_MODEL,
      apiKey: OPENROUTER_API_KEY,
      temperature: 0.5,
      maxTokens: 4000,
      configuration: {
        baseURL: OPENROUTER_BASE_URL,
        // defaultHeaders: {
        //   "HTTP-Referer": "https://quote-ai.app",
        //   "X-Title": "QuoteAI App",
        // },
      },
    });
  }

  analyzeProject = async (description: string): Promise<ProjectAnalysis> => {
    try {
      const response = await this.agent.invoke([
        new SystemMessage(PROJECT_ANALYSIS_SYSTEM_PROMPT),
        new HumanMessage(createProjectAnalysisPrompt(description)),
      ]);

      // Parse and validate the JSON response using Zod
      try {
        // Extract content from the AI message
        const content = response.content as string;

        // First parse as JSON
        const rawParsed = JSON.parse(content);

        // Then validate and transform using Zod schema
        // This will throw a ZodError if validation fails with detailed information
        const validatedResponse = ProjectAnalysisSchema.parse(rawParsed);
        console.log("Validated AI Response:", validatedResponse);
        return validatedResponse;
      } catch (parseError) {
        if (parseError instanceof z.ZodError) {
          // Detailed validation errors from Zod
          const errorMessages = parseError.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("; ");
          throw new Error(`ProjectAnalysisService.analyzeProject AI response validation failed: ${errorMessages}`);
        } else {
          // JSON parsing error or other error
          throw new Error(`ProjectAnalysisService.analyzeProject Failed to parse AI response as JSON: ${parseError}`);
        }
      }
    } catch (error) {
      errorReporter.reportUnexpectedError(error, {
        context: "ProjectAnalysisService.analyzeProject",
        description,
      });
      throw error;
    }
  };
}
