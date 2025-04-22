// src/types.ts

// DTO and Command Model definitions for the API, constructed based on the database models and API plan.

// Import the Json type and Database types from the database definition
import type { Database, Json } from "./db/database.types";

// Utility type aliases from database tables
type UserRow = Database["public"]["Tables"]["users"]["Row"];
type QuotationRow = Database["public"]["Tables"]["quotations"]["Row"];
type QuotationTaskRow = Database["public"]["Tables"]["quotation_tasks"]["Row"];
type PlatformRow = Database["public"]["Tables"]["platforms"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];

// =========================
// Users DTOs and Commands
// =========================

// Command for registering a new user
export interface RegisterUserCommand {
  email: string;
  role: string;
}

// Command for user login
export interface LoginUserCommand {
  email: string;
  password: string;
}

// User DTO (response) excluding sensitive info
export type UserDTO = Omit<UserRow, "hashed_password">;

// =============================
// Quotations DTOs and Commands
// =============================

// Command for creating a new quotation
export interface CreateQuotationCommand {
  estimation_type: "Fixed Price" | "Time & Material";
  scope: string; // Expected to be validated for max length (<=10000 chars)
  platforms: string[]; // Array of platform IDs
  dynamic_attributes?: Json | null;
}

// Command for updating an existing quotation (partial update)
export type UpdateQuotationCommand = Partial<CreateQuotationCommand>;

// Quotation DTO representing a complete quotation record
export interface QuotationDTO extends QuotationRow {
  id: string;
  created_at: string;
  estimation_type: "Fixed Price" | "Time & Material";
  scope: string;
  platforms: string[];
  man_days: number;
  buffer: number;
  tasks: QuotationTaskDTO[];
  review?: ReviewDTO | null;
}

// API Response types for Quotations
export interface QuotationsResponse {
  quotations: QuotationDTO[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

// ==============================
// Quotation Tasks DTOs and Commands
// ==============================

// Command to create a new quotation task
export interface CreateQuotationTaskCommand {
  task_description: string;
}

// Quotation Task DTO representing a task associated with a quotation
export type QuotationTaskDTO = QuotationTaskRow;

// =========================
// Platforms DTO
// =========================

// Platform DTO representing a platform record
export type PlatformDTO = PlatformRow;

// =========================
// Reviews DTOs and Commands
// =========================

// Command for creating a new review for a quotation
export interface CreateReviewCommand {
  rating: number; // Should be validated between 1 and 5
  comment?: string | null;
}

// Review DTO representing a review record
export type ReviewDTO = ReviewRow;

// =========================
// Sessions DTOs and Commands
// =========================

// Command for creating a new session record
export interface CreateSessionCommand {
  session_id: string;
  user_agent?: string | null;
  errors?: string | null;
}

// Session DTO representing a session record
export type SessionDTO = SessionRow;
