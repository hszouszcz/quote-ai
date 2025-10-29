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
