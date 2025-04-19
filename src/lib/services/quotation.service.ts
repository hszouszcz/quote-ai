import { PostgrestError } from "@supabase/supabase-js";
import type { UpdateQuotationInput } from "../schemas/quotation.schema";
import type { QuotationDTO } from "../../types";

export class QuotationNotFoundError extends Error {
  constructor(message = "Quotation not found") {
    super(message);
    this.name = "QuotationNotFoundError";
  }
}

export class QuotationService {
  // constructor(private readonly supabase: SupabaseClient) {}
  constructor(private readonly supabase: any) {}

  private handleDatabaseError(error: PostgrestError): never {
    console.error("Database error:", error);

    if (error.code === "23503") {
      // Foreign key violation
      throw new Error("Referenced record does not exist");
    }

    if (error.code === "23505") {
      // Unique violation
      throw new Error("Record already exists");
    }

    throw new Error("Database error occurred");
  }

  async getQuotationById(id: string, userId: string): Promise<QuotationDTO | null> {
    try {
      const { data: quotation, error } = await this.supabase
        .from("quotations")
        .select(
          `
          *,
          tasks:quotation_tasks(*)
        `
        )
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (error) this.handleDatabaseError(error);
      return quotation;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Failed to fetch quotation");
    }
  }

  async updateQuotation(id: string, userId: string, input: UpdateQuotationInput): Promise<QuotationDTO> {
    try {
      const existing = await this.getQuotationById(id, userId);
      if (!existing) {
        throw new QuotationNotFoundError();
      }

      const { data: quotation, error } = await this.supabase
        .from("quotations")
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", userId)
        .select(
          `
          *,
          tasks:quotation_tasks(*)
        `
        )
        .single();

      if (error) this.handleDatabaseError(error);
      if (!quotation) throw new QuotationNotFoundError();

      return quotation;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Failed to update quotation");
    }
  }

  async deleteQuotation(id: string, userId: string): Promise<void> {
    try {
      const existing = await this.getQuotationById(id, userId);
      if (!existing) {
        throw new QuotationNotFoundError();
      }

      const { error } = await this.supabase.from("quotations").delete().eq("id", id).eq("user_id", userId);

      if (error) this.handleDatabaseError(error);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Failed to delete quotation");
    }
  }
}
