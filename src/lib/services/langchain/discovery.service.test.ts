import { describe, it, expect, beforeEach, vi } from "vitest";
import { DiscoveryService } from "./discovery.service";
import type { SupabaseClient } from "@/db/supabase.client";
import type { Database } from "@/types/database.types";

// 👉 Mock dla Supabase client
const createMockSupabaseClient = () => {
  return {
    from: vi.fn(),
  } as unknown as SupabaseClient;
};

describe("DiscoveryService", () => {
  let service: DiscoveryService;
  let mockSupabase: SupabaseClient;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    service = new DiscoveryService(mockSupabase);
  });

  describe("startDiscovery", () => {
    it("should create a new discovery session with valid data", async () => {
      // 👉 Arrange - Przygotuj mock response z prawidłowym typem
      const mockSessionData: Database["public"]["Tables"]["discovery_sessions"]["Row"] = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        user_id: "user-123",
        initial_description: "Mobile app for booking appointments",
        status: "in_progress",
        current_round: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        completeness_score: null,
        current_reasoning: null,
        final_analysis: null,
      };

      // Mock chain: .from().insert().select().single()
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockSessionData,
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      vi.spyOn(mockSupabase, "from").mockImplementation(mockFrom);

      // 👉 Act - Wykonaj metodę
      const result = await service.startDiscovery({
        userId: "user-123",
        initialDescription: "Mobile app for booking appointments",
      });

      // 👉 Assert - Sprawdź wynik
      expect(mockFrom).toHaveBeenCalledWith("discovery_sessions");
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-123",
        initial_description: "Mobile app for booking appointments",
        status: "in_progress",
        current_round: 1,
      });
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual(mockSessionData);
    });

    it("should throw error when insert fails", async () => {
      // 👉 Arrange - Mock błąd
      const mockError = { message: "Database connection failed" };

      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      vi.spyOn(mockSupabase, "from").mockImplementation(mockFrom);

      // 👉 Act & Assert
      await expect(
        service.startDiscovery({
          userId: "user-123",
          initialDescription: "Test description",
        })
      ).rejects.toThrow("DiscoveryService.startDiscovery Failed to create session: Database connection failed");
    });

    it("should throw validation error for invalid input", async () => {
      // 👉 Act & Assert - Zod validation powinien złapać błąd
      await expect(
        service.startDiscovery({
          userId: "", // Invalid - pusty string
          initialDescription: "Test",
        })
      ).rejects.toThrow("Input validation failed");
    });
  });

  describe("getSession", () => {
    it("should return session by id", async () => {
      // 👉 Arrange
      const mockSessionData: Database["public"]["Tables"]["discovery_sessions"]["Row"] = {
        id: "session-123",
        user_id: "user-123",
        initial_description: "Test project",
        status: "in_progress",
        current_round: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        completeness_score: null,
        current_reasoning: null,
        final_analysis: null,
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockSessionData,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      vi.spyOn(mockSupabase, "from").mockImplementation(mockFrom);

      // 👉 Act
      const result = await service.getSession("session-123");

      // 👉 Assert
      expect(mockFrom).toHaveBeenCalledWith("discovery_sessions");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("id", "session-123");
      expect(result).toEqual(mockSessionData);
    });

    it("should throw error when session not found", async () => {
      // 👉 Arrange
      const mockError = { message: "Session not found" };

      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockEq = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      vi.spyOn(mockSupabase, "from").mockImplementation(mockFrom);

      // 👉 Act & Assert
      await expect(service.getSession("non-existent")).rejects.toThrow(
        "DiscoveryService.getSession Failed: Session not found"
      );
    });
  });

  describe("updateSession", () => {
    it("should update session with partial data", async () => {
      // 👉 Arrange
      const mockUpdatedSession: Database["public"]["Tables"]["discovery_sessions"]["Row"] = {
        id: "session-123",
        user_id: "user-123",
        initial_description: "Test project",
        status: "completed", // Updated
        current_round: 3, // Updated
        completeness_score: 85, // Updated
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        current_reasoning: "All requirements gathered",
        final_analysis: { confidence: 0.95 },
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockUpdatedSession,
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockEq = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      const mockFrom = vi.fn().mockReturnValue({
        update: mockUpdate,
      });

      vi.spyOn(mockSupabase, "from").mockImplementation(mockFrom);

      // 👉 Act
      const updates: Database["public"]["Tables"]["discovery_sessions"]["Update"] = {
        status: "completed",
        current_round: 3,
        completeness_score: 85,
      };

      const result = await service.updateSession("session-123", updates);

      // 👉 Assert
      expect(mockFrom).toHaveBeenCalledWith("discovery_sessions");
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith("id", "session-123");
      expect(result).toEqual(mockUpdatedSession);
    });
  });
});
