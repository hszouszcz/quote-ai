/**
 * Central Schema Exports
 * All validation schemas are exported from here for convenient importing
 */

// ===========================
// Auth Domain Schemas
// ===========================
export { loginSchema, registerSchema } from "./auth.schema";
export type { LoginFormData, RegisterFormData } from "./auth.schema";

// ===========================
// Quotation Domain Schemas
// ===========================
export { quotationIdSchema, updateQuotationSchema } from "./quotation.schema";
export type { UpdateQuotationInput } from "./quotation.schema";

// ===========================
// Session Domain Schemas
// ===========================
export { ListSessionsQueryParamsSchema } from "./session.schema";
export type { ListSessionsQueryParams } from "./session.schema";

// ===========================
// AI Domain Schemas (LLM responses)
// ===========================
export {
  ProjectAnalysisSchema,
  ModulesBreakdownSchema,
  DiscoveryInitialDataSchema,
  InitialProjectAnalysisResponseSchema,
  QuestionsRoundResponseSchema,
  PartialAnalysisCompletionResponseSchema,
} from "./ai.schema";
export type {
  ProjectAnalysis,
  ModulesBreakdown,
  DiscoveryInitialData,
  InitialProjectAnalysisResponse,
  QuestionsRoundResponse,
  PartialAnalysisCompletionType,
} from "./ai.schema";
