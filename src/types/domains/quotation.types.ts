/**
 * Quotation Domain Types
 * Commands, DTOs, and responses for quotations
 */

import type { Database, Json } from "@/types/database.types";

// Database row types
export type QuotationTaskRow = Database["public"]["Tables"]["quotation_tasks"]["Row"];
export type QuotationRow = Database["public"]["Tables"]["quotations"]["Row"];
export type PlatformRow = Database["public"]["Tables"]["platforms"]["Row"];
export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

// ===========================
// Quotation Task DTOs
// ===========================

/** Command to create a new quotation task */
export interface CreateQuotationTaskCommand {
  task_description: string;
}

/** Quotation Task DTO */
export type QuotationTaskDTO = QuotationTaskRow;

// ===========================
// Platform DTOs
// ===========================

/** Platform DTO */
export type PlatformDTO = PlatformRow;

// ===========================
// Review DTOs and Commands
// ===========================

/** Command for creating a new review */
export interface CreateReviewCommand {
  rating: number; // Between 1 and 5
  comment?: string | null;
}

/** Review DTO */
export type ReviewDTO = ReviewRow;

// ===========================
// Quotation DTOs and Commands
// ===========================

/** Command for creating a new quotation */
export interface CreateQuotationCommand {
  estimation_type: "Fixed Price" | "Time & Material";
  scope: string;
  platforms: string[]; // Array of platform IDs
  dynamic_attributes?: Json | null;
}

/** Command for updating an existing quotation (partial update) */
export type UpdateQuotationCommand = Partial<CreateQuotationCommand>;

/** Complete Quotation DTO */
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

/** API Response for list of quotations */
export interface QuotationsResponse {
  quotations: QuotationDTO[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}
