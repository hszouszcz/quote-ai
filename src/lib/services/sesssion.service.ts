import type { SupabaseClient } from "@/db/supabase.client";
import type { DiscoverySessionRow, ListSessionsResult } from "@/types";
import type { ListSessionsQueryParams } from "../schemas/session.schema";

export class SessionService {
  constructor(private readonly supabaseClient: SupabaseClient) {}

  async getSessionById(sessionId: string, userId: string): Promise<DiscoverySessionRow | null> {
    const { data, error } = await this.supabaseClient
      .from("discovery_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();
    if (error) {
      console.error("Error fetching session:", error);
      return null;
    }
    return data;
  }

  async listSessionsByUser(params: ListSessionsQueryParams): Promise<ListSessionsResult> {
    const { userId, page = 1, limit = 10, status, sortBy = "created_at", sortOrder = "desc" } = params;

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (page < 1) {
      throw new Error("Page must be greater than 0");
    }

    if (limit < 1 || limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    const offset = (page - 1) * limit;

    let query = this.supabaseClient
      .from("discovery_sessions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching sessions:", error);
      throw new Error("Failed to fetch sessions");
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
    };
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from("discovery_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting session:", error);
      throw new Error("Failed to delete session");
    }
  }
}
