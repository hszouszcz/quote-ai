import { PostgrestError } from "@supabase/supabase-js";
import type { UpdateQuotationInput } from "../schemas/quotation.schema";
import type { QuotationDTO } from "../../types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Json } from "../../db/database.types";
import { describe, it, expect, beforeEach, vi } from "vitest";

export class QuotationNotFoundError extends Error {
  constructor(message = "Quotation not found") {
    super(message);
    this.name = "QuotationNotFoundError";
  }
}

export class QuotationService {
  constructor(private readonly supabase: SupabaseClient) {}

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

export interface ListQuotationsParams {
  userId: string;
  page: number;
  limit: number;
  sort?: string;
  filter?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListQuotationsResult {
  data: QuotationDTO[];
  pagination: PaginationMeta;
}

// Typy dla obiektów powiązanych
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

// Zdefiniujmy typy dla struktur danych z bazy
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

export async function listQuotations(
  supabase: SupabaseClient,
  params: ListQuotationsParams
): Promise<ListQuotationsResult> {
  const { userId, page, limit, sort, filter } = params;
  const offset = (page - 1) * limit;

  // Budowanie zapytania bazowego
  let query = supabase
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

  // Dodawanie sortowania
  if (sort) {
    const [field, order] = sort.split(":");
    if (field && order) {
      query = query.order(field, { ascending: order === "asc" });
    }
  } else {
    // Domyślne sortowanie po dacie utworzenia (od najnowszych)
    query = query.order("created_at", { ascending: false });
  }

  // Dodawanie filtrowania
  if (filter) {
    query = query.ilike("scope", `%${filter}%`);
  }

  // Wykonanie zapytania
  const { data: quotations, error, count } = await query;

  if (error) {
    console.error("Error fetching quotations:", error);
    throw new Error("Failed to fetch quotations");
  }

  // Jeśli nie ma wycen, zwróć pustą tablicę z odpowiednią paginacją
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

  // Mapowanie wyników na DTO
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

describe("QuotationService - getQuotationById", () => {
  let quotationService: QuotationService;
  let mockSupabase: SupabaseClient;

  // Przykładowe dane testowe
  const mockQuotationId = "test-id-123";
  const mockUserId = "user-id-123";
  const mockQuotation: QuotationDTO = {
    id: mockQuotationId,
    user_id: mockUserId,
    estimation_type: "Fixed Price",
    scope: "Test scope",
    man_days: 10,
    buffer: 3,
    dynamic_attributes: null,
    created_at: "2024-03-20T12:00:00Z",
    updated_at: "2024-03-20T12:00:00Z",
    tasks: [],
    platforms: [],
    review: null,
  };

  // Setup przed każdym testem
  beforeEach(() => {
    // Arrange: Przygotowanie mocka dla Supabase
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    } as unknown as SupabaseClient;

    quotationService = new QuotationService(mockSupabase);
  });

  it("should successfully return quotation when found", async () => {
    // Arrange
    const mockResponse = { data: mockQuotation, error: null };
    mockSupabase.from().select().eq().eq().single = vi.fn().mockResolvedValue(mockResponse);

    // Act
    const result = await quotationService.getQuotationById(mockQuotationId, mockUserId);

    // Assert
    expect(result).toEqual(mockQuotation);
    expect(mockSupabase.from).toHaveBeenCalledWith("quotations");
    expect(mockSupabase.from().select).toHaveBeenCalledWith(`
          *,
          tasks:quotation_tasks(*)
        `);
    expect(mockSupabase.from().select().eq).toHaveBeenNthCalledWith(1, "id", mockQuotationId);
    expect(mockSupabase.from().select().eq().eq).toHaveBeenNthCalledWith(1, "user_id", mockUserId);
  });

  it("should return null when quotation not found", async () => {
    // Arrange
    const mockResponse = { data: null, error: null };
    mockSupabase.from().select().eq().eq().single = vi.fn().mockResolvedValue(mockResponse);

    // Act
    const result = await quotationService.getQuotationById(mockQuotationId, mockUserId);

    // Assert
    expect(result).toBeNull();
  });

  it("should handle database error correctly", async () => {
    // Arrange
    const mockError = { code: "23503", message: "Foreign key violation" };
    mockSupabase.from().select().eq().eq().single = vi.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Act & Assert
    await expect(quotationService.getQuotationById(mockQuotationId, mockUserId)).rejects.toThrow(
      "Referenced record does not exist"
    );
  });

  it("should handle unique constraint violation", async () => {
    // Arrange
    const mockError = { code: "23505", message: "Unique violation" };
    mockSupabase.from().select().eq().eq().single = vi.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Act & Assert
    await expect(quotationService.getQuotationById(mockQuotationId, mockUserId)).rejects.toThrow(
      "Record already exists"
    );
  });

  it("should handle unexpected database error", async () => {
    // Arrange
    const mockError = { code: "12345", message: "Unexpected error" };
    mockSupabase.from().select().eq().eq().single = vi.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Act & Assert
    await expect(quotationService.getQuotationById(mockQuotationId, mockUserId)).rejects.toThrow(
      "Database error occurred"
    );
  });

  it("should handle non-database errors", async () => {
    // Arrange
    mockSupabase.from().select().eq().eq().single = vi.fn().mockRejectedValue(new Error("Network error"));

    // Act & Assert
    await expect(quotationService.getQuotationById(mockQuotationId, mockUserId)).rejects.toThrow(
      "Failed to fetch quotation"
    );
  });
});
