import { PostgrestError } from "@supabase/supabase-js";
import type { UpdateQuotationInput } from "../schemas/quotation.schema";
import type { QuotationDTO } from "../../types";
import type { SupabaseClient } from "@/db/supabase.client";
import type { Json } from "../../types/database.types";
import type { ListResult } from "../../types/shared.types";
import { DatabaseError, ValidationError } from "../errors";

export class QuotationNotFoundError extends Error {
  constructor(message = "Quotation not found") {
    super(message);
    this.name = "QuotationNotFoundError";
  }
}

export class QuotationDatabaseError extends Error {
  /* */
}

export class QuotationService {
  constructor(private readonly supabase: SupabaseClient) {}

  private handleDatabaseError(error: PostgrestError): never {
    // eslint-disable-next-line no-console
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

  async listQuotations(params: ListQuotationsParams): Promise<ListQuotationsResult> {
    const { userId, page, limit, sort, filter } = params;
    const offset = (page - 1) * limit;

    // Build base query
    let query = this.supabase
      .from("quotations")
      .select(
        `
      *,
      platforms:quotation_platforms(platform_id),
      tasks:quotation_tasks(*),
      review:reviews(*)
    `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .range(offset, offset + limit - 1);

    // Add sorting
    if (sort) {
      const [field, order] = sort.split(":");
      if (field && order) {
        query = query.order(field, { ascending: order === "asc" });
      }
    } else {
      // Default sort by creation date (newest first)
      query = query.order("created_at", { ascending: false });
    }

    // Add filtering
    if (filter) {
      query = query.ilike("scope", `%${filter}%`);
    }

    // Execute query
    const { data: quotations, error, count } = await query;

    if (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching quotations:", error);
      throw new Error("Failed to fetch quotations");
    }

    // If no quotations, return empty array with pagination
    if (!quotations || quotations.length === 0) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Map results to DTO
    const quotationsDTO = (quotations as QuotationRecord[]).map(
      (quotation): QuotationDTO => ({
        ...quotation,
        platforms: quotation.platforms?.map((p) => p.platform_id) || [],
        tasks: quotation.tasks || [],
        review: quotation.review?.[0] || null,
      })
    );

    return {
      data: quotationsDTO,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    };
  }

  async createQuotation(input: CreateQuotationInput): Promise<QuotationDTO> {
    try {
      // Validate input
      if (!input.platforms.length) {
        throw new ValidationError("At least one platform must be selected", "platforms");
      }

      if (!input.tasks.length) {
        throw new ValidationError("At least one task must be provided", "tasks");
      }

      // Call the database function
      const { data, error } = await this.supabase.rpc("create_quotation_with_relations", {
        p_user_id: input.user_id,
        p_estimation_type: input.estimation_type,
        p_scope: input.scope,
        p_man_days: input.man_days,
        p_buffer: input.buffer,
        p_dynamic_attributes: input.dynamic_attributes,
        p_platforms: input.platforms,
        p_tasks: input.tasks.map((task) => ({
          description: task.description,
          man_days: task.man_days,
        })),
      });

      if (error) {
        this.handleDatabaseError(error);
      }

      if (!data) {
        throw new DatabaseError("Failed to create quotation - no data returned");
      }

      // Transform the response to match QuotationDTO
      return {
        ...data,
        tasks: data.tasks || [],
        platforms: data.platforms || [],
        review: null,
      } as QuotationDTO;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }

      throw new DatabaseError("Failed to create quotation", "CREATE_QUOTATION_ERROR", { originalError: error });
    }
  }
}

export function createQuotationService(supabase: SupabaseClient): QuotationService {
  // eslint-disable-next-line no-console
  console.log("[QUOTATION_SERVICE] Creating service, supabase:", !!supabase, typeof supabase);
  return new QuotationService(supabase);
}

export interface ListQuotationsParams {
  userId: string;
  page: number;
  limit: number;
  sort?: string;
  filter?: string;
}

export type ListQuotationsResult = ListResult<QuotationDTO>;

// Types for related objects
interface QuotationPlatform {
  platform_id: string;
}

interface QuotationTask {
  id: string;
  quotation_id: string;
  task_description: string;
  man_days: number;
  created_at: string;
}

interface Review {
  id: string;
  quotation_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

// Database record types
interface QuotationRecord {
  id: string;
  user_id: string;
  estimation_type: "Fixed Price" | "Time & Material";
  scope: string;
  man_days: number;
  buffer: number;
  dynamic_attributes: Json;
  created_at: string;
  updated_at: string;
  platforms?: QuotationPlatform[];
  tasks?: QuotationTask[];
  review?: Review[];
}

interface CreateQuotationInput {
  user_id: string;
  estimation_type: "Fixed Price" | "Time & Material";
  scope: string;
  man_days: number;
  buffer: number;
  dynamic_attributes: Json;
  platforms: string[];
  tasks: {
    description: string;
    man_days: number;
  }[];
}
