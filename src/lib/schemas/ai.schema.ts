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

export const PartialAnalysisCompletionResponseSchema = z.object({
  completness_score: z.number().min(0).describe("overall completness score"),
  category_scores: z.object({
    basic_info: z.number().min(0).max(100),
    tech_stack: z.number().min(0).max(100),
    integrations: z.number().min(0).max(100),
    scale: z.number().min(0).max(100),
    compliance: z.number().min(0).max(100),
    assets: z.number().min(0).max(100),
    delivery: z.number().min(0).max(100),
  }),
  collected_info: z.object({
    basic_info: z.object({
      goal: z.string(),
      audience: z.array(z.string()),
      type: z.string(),
    }),
    tech_stack: z.object({
      preffered: z.array(z.string()),
      required: z.array(z.string()),
      constraints: z.array(z.string()),
    }),
    integrations: z.array(z.record(z.string(), z.string())),
    scale: z.object({
      initial_users: z.string(),
      year_one_users: z.string(),
      performance_requirements: z.array(z.string()),
      multi_tenant: z.boolean(),
    }),
    compliance: z.array(z.any()),
    assets: z.object({
      has_legacy_system: z.boolean(),
      has_designs: z.boolean(),
      has_documentation: z.boolean(),
    }),
    delivery: z.record(z.string(), z.any()),
  }),
  missing_critical_info: z.array(z.string()),
  recommendations: z.array(z.string()),
  ready_for_estimations: z.boolean(),
  reasoning: z.string(),
});

export type PartialAnalysisCompletionType = z.infer<typeof PartialAnalysisCompletionResponseSchema>;
