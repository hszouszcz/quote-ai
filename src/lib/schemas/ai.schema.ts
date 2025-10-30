import { z } from "zod";

/**
 * Schema for AI project analysis response
 * Used to validate and type-check responses from LLM
 */
export const ProjectAnalysisSchema = z.object({
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

/**
 * TypeScript type inferred from Zod schema
 * Use this for type annotations throughout the codebase
 */
export type ProjectAnalysis = z.infer<typeof ProjectAnalysisSchema>;
/**
 * Schema for AI project analysis response
 * Used to validate and type-check responses from LLM
 */
export const ModulesBreakdownSchema = z
  .object({
    modules: z.array(
      z.object({
        name: z.string().min(1).describe("Name of the module"),
        purpose: z.string().min(1).describe("Purpose of the module"),
        features: z.array(z.string().min(1)).describe("Key features of the module"),
        dependencies: z.array(z.string().min(1)).describe("Dependencies on other modules or systems"),
        teams: z.array(z.string().min(1)).describe("Teams responsible for this module"),
      })
    ),
  })
  .describe("List of identified modules in the project");

/**
 * TypeScript type inferred from Zod schema
 * Use this for type annotations throughout the codebase
 */
export type ModulesBreakdown = z.infer<typeof ModulesBreakdownSchema>;

export const DiscoveryInitialDataSchema = z.object({
  initialDescription: z.string().min(1).max(10000).describe("Initial project description provided by the user"),
});

export type DiscoveryInitialData = z.infer<typeof DiscoveryInitialDataSchema>;

export const InitialProjectAnalysisResponseSchema = z.object({
  goal: z.string().min(1).describe("Main project goal or purpose"),

  target_audience: z
    .array(z.string().min(1))
    .min(1, "Must have at least one target audience")
    .describe("Target users or audience groups"),
  tech_stack: z.array(z.string().min(1)).describe("Recommended technology stack for the project"),
  integrations: z.array(z.string().min(1)).describe("Suggested third-party integrations"),
  type: z
    .string()
    .min(1, "Type cannot be empty")
    .describe("Product type (SaaS, mobile app, marketplace, internal tool, etc.)"),
  key_features: z.record(z.string(), z.array(z.string().min(1))).describe("Key features grouped by category"),
  assets: z.record(z.string(), z.array(z.string().min(1))).describe("Required assets like designs, content, media"),
  non_functional: z.array(z.string().min(1)).describe("Non-functional requirements, integrations, performance needs"),
});

export type InitialProjectAnalysisResponse = z.infer<typeof InitialProjectAnalysisResponseSchema>;

export const QuestionsRoundResponseSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(1).describe("A single discovery question"),
        context: z.string().min(1).describe("Context or background information for the question"),
        category: z.string().min(1).describe("Category of the question (e.g., Technical, Business, UX)"),
        priority: z.number().min(1).max(5).describe("Priority of the question from 1 (low) to 5 (critical)"),
      })
    )
    .describe("List of questions for the round"),
});

export type QuestionsRoundResponse = z.infer<typeof QuestionsRoundResponseSchema>;
