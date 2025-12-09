/**
 * Central Type Exports
 * All application types are exported from here for convenient importing
 */

// ===========================
// Shared/Utility Types
// ===========================
export type { PaginationMeta, ListResult, WithTimestamps, WithUserId } from "./shared.types";

// ===========================
// Database Types (generated)
// ===========================
export type { Database, Json } from "./database.types";

// ===========================
// Auth Domain
// ===========================
export type { RegisterUserCommand, LoginUserCommand, UserDTO } from "./domains/auth.types";

// ===========================
// Quotation Domain
// ===========================
export type {
  QuotationTaskRow,
  QuotationRow,
  PlatformRow,
  ReviewRow,
  CreateQuotationTaskCommand,
  QuotationTaskDTO,
  PlatformDTO,
  CreateReviewCommand,
  ReviewDTO,
  CreateQuotationCommand,
  UpdateQuotationCommand,
  QuotationDTO,
  QuotationsResponse,
} from "./domains/quotation.types";

// ===========================
// Discovery Domain
// ===========================
export type {
  DiscoverySessionRow,
  DiscoverySessionInsert,
  DiscoverySessionUpdate,
  DiscoveryQuestionsForRoundRow,
  DiscoveryQuestionsForRoundInsert,
  DiscoveryQuestionsForRoundUpdate,
  DiscoveryConversationLogInsert,
  DiscoveryMessage,
  DiscoveryQuestion,
  DiscoverySession,
  DiscoveryState,
  DiscoveryContextValue,
} from "./domains/discovery.types";

// ===========================
// Session Domain
// ===========================
export type { SessionRow, CreateSessionCommand, SessionDTO, ListSessionsResult } from "./domains/session.types";
