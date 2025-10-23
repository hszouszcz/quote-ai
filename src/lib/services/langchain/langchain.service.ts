import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

import { errorReporter } from "@/lib/errors";
import { z } from "zod";

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

export class LangchainService {
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
        new SystemMessage(
          `You are a senior presales consultant and solution architect specialized in scoping and estimating custom software projects for clients. 
          
          Your goal is to analyze a client's project description and produce a structured understanding of what they want to build. 
          Be explicit, practical, and concise.
          
          IMPORTANT: You must respond with ONLY a valid JSON object in this exact format:
          {
            "goal": "Main project goal or purpose",
            "target_audience": ["user type 1", "user type 2"],
            "type": "Product type (SaaS, mobile app, marketplace, internal tool, etc.)",
            "key_features": {
              "Category 1": ["feature 1", "feature 2"],
              "Category 2": ["feature 3", "feature 4"]
            },
            "non_functional": ["requirement 1", "requirement 2"],
            "open_questions": ["question 1", "question 2"]
          }
          
          Do not include any text before or after the JSON object. Return only valid JSON.`
        ),
        new HumanMessage(
          `Analyze the following project brief and extract the required information:
      Project goal
	[Target audience,
	Product type (SaaS, mobile app, marketplace, internal tool, etc.) - or any other type you will categorize it as,
	Key features (grouped logically),
	Non-functional requirements (e.g. performance, integrations, scalability),
	Known constraints or open questions]
          
          in the specified JSON format:

<project_brief>${description}</project_brief>`
        ),
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
          throw new Error(`AI response validation failed: ${errorMessages}`);
        } else {
          // JSON parsing error or other error
          throw new Error(`Failed to parse AI response as JSON: ${parseError}`);
        }
      }
    } catch (error) {
      errorReporter.reportUnexpectedError(error, {
        context: "LangchainService.analyzeProject",
        description,
      });
      throw error;
    }
  };
}
