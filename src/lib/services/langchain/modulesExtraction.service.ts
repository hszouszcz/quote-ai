import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

import { errorReporter } from "@/lib/errors";
import { z } from "zod";

import { createProjectModulesPrompt, PROJECT_MODULES_SYSTEM_PROMPT } from "./prompts";
import { ModulesBreakdownSchema, type ModulesBreakdown, type ProjectAnalysis } from "@/lib/schemas";

const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = import.meta.env.OPENROUTER_BASE_URL;
const MODULE_BREAKDOWN_MODEL = import.meta.env.PROJECT_ANALYSIS_MODEL;

export class ProjectModulesService {
  private agent: ChatOpenAI;

  constructor() {
    // Configure ChatOpenAI to use OpenRouter
    this.agent = new ChatOpenAI({
      model: MODULE_BREAKDOWN_MODEL,
      apiKey: OPENROUTER_API_KEY,
      temperature: 0.6,
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

  getProjectModules = async (projectSummary: ProjectAnalysis): Promise<ModulesBreakdown> => {
    try {
      const response = await this.agent.invoke(
        [
          new SystemMessage(PROJECT_MODULES_SYSTEM_PROMPT),
          new HumanMessage(createProjectModulesPrompt(JSON.stringify(projectSummary))),
        ],
        {
          response_format: { type: "json_object" },
        }
      );
      const responseContent = response.content as string;

      // Parse and validate the JSON response using Zod
      try {
        // First parse as JSON
        const rawParsed = JSON.parse(responseContent);

        // Then validate and transform using Zod schema
        const validatedResponse = ModulesBreakdownSchema.parse(rawParsed);
        console.log("Validated Modules Breakdown Response:", validatedResponse);
        return validatedResponse;
      } catch (parseError) {
        if (parseError instanceof z.ZodError) {
          // Detailed validation errors from Zod
          const errorMessages = parseError.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("; ");
          throw new Error(`ProjectModulesService.getProjectModules AI response validation failed: ${errorMessages}`);
        } else {
          // JSON parsing error or other error
          throw new Error(`ProjectModulesService.getProjectModules Failed to parse AI response as JSON: ${parseError}`);
        }
      }
    } catch (error) {
      errorReporter.reportUnexpectedError(error);
      throw new Error("Failed to get project modules");
    }
  };
}
