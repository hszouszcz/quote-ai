import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIContext, AstroCookies, RewritePayload } from "astro";
import { POST } from "./quotations";
import { analyzeProject } from "../../lib/services/ai.service";

// Mock dependencies
vi.mock("../../lib/services/ai.service", () => ({
  analyzeProject: vi.fn(),
}));

// Define types for mocks
interface MockSupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

interface MockSupabaseChain<T> {
  select: () => {
    single: () => Promise<MockSupabaseResponse<T>>;
  };
}

interface MockSupabaseDelete {
  eq: (field: string, value: string) => Promise<MockSupabaseResponse<void>>;
}

interface MockSupabase {
  from: (table: string) => {
    insert: <T>(data: T) => MockSupabaseChain<T>;
    delete: () => MockSupabaseDelete;
  };
}

interface TestLocals {
  supabase: MockSupabase;
  user: { id: string | null };
}

// Create a type-safe mock for Supabase
const createMockSupabase = () => {
  const mockFrom = vi.fn();
  const mockInsert = vi.fn();
  const mockSelect = vi.fn();
  const mockSingle = vi.fn();
  const mockDelete = vi.fn();
  const mockEq = vi.fn();

  mockFrom.mockImplementation(() => ({
    insert: mockInsert.mockReturnValue({
      select: mockSelect.mockReturnValue({
        single: mockSingle.mockResolvedValue({
          data: {
            id: "test-id",
            user_id: "test-user",
            estimation_type: "Fixed Price",
            scope: "Test project scope",
            buffer: 3,
            dynamic_attributes: { complexity: "medium" },
          },
          error: null,
        }),
      }),
    }),
    delete: mockDelete.mockReturnValue({
      eq: mockEq.mockResolvedValue({ data: null, error: null }),
    }),
    select: () => ({
      eq: mockEq.mockReturnValue({
        eq: mockEq.mockResolvedValue({
          data: { id: "test-id-123" },
          error: null,
        }),
      }),
    }),
  }));

  return {
    from: mockFrom,
    _mock: {
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
      delete: mockDelete,
      eq: mockEq,
    },
  };
};

// Test data factory
const createValidRequestData = () => ({
  estimation_type: "Fixed Price" as const,
  scope: "Test project scope",
  platforms: ["platform1"],
  dynamic_attributes: { complexity: "medium" },
});

// Create a mock cookies implementation
const createMockCookies = (): AstroCookies => {
  const cookieStore = new Map<string, string>();
  return {
    get: (key: string) => ({ value: cookieStore.get(key) || null }),
    has: (key: string) => cookieStore.has(key),
    set: (key: string, value: string) => cookieStore.set(key, value),
    delete: (key: string) => cookieStore.delete(key),
    headers: () => [],
    "#private": { cookieStore } as { cookieStore: Map<string, string> },
  } as unknown as AstroCookies;
};

// Create a properly typed mock context
const createMockContext = (userData: { id: string | null } = { id: "test-user" }): APIContext => {
  const mockSupabase = createMockSupabase();
  const url = new URL("http://test.com");

  return {
    request: new Request(url, {
      method: "POST",
    }),
    locals: {
      supabase: mockSupabase as unknown as MockSupabase,
      user: userData,
    },
    url,
    site: url,
    generator: "test",
    props: {},
    params: {},
    redirect(path?: string) {
      return new Response(null, {
        status: 302,
        headers: { Location: path || "/" },
      });
    },
    cookies: createMockCookies(),
    clientAddress: "127.0.0.1",
    currentLocale: "en",
    preferredLocale: "en",
    preferredLocaleList: ["en"],
    rewrite(rewritePayload: RewritePayload) {
      return Promise.resolve(
        new Response(null, {
          status: 200,
          headers: { "X-Rewrite-Path": typeof rewritePayload === "string" ? rewritePayload : "/" },
        })
      );
    },
    routePattern: "/api/quotations",
    originPathname: "/api/quotations",
    getActionResult: () => undefined,
    callAction: (() => Promise.resolve(undefined)) as APIContext["callAction"],
    isPrerendered: false,
  };
};

describe("POST /api/quotations", () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabase();

    // Setup default mock for analyzeProject
    vi.mocked(analyzeProject).mockResolvedValue({
      tasks: [
        { description: "Task 1", man_days: 5 },
        { description: "Task 2", man_days: 3 },
      ],
      reasoning: "Test reasoning",
    });
  });

  describe("Authentication", () => {
    it("should return 401 when user is not authenticated", async () => {
      // Arrange
      const context = createMockContext({ id: null });
      context.request = new Request("http://test.com", {
        method: "POST",
        body: JSON.stringify(createValidRequestData()),
      });

      // Act
      const response = await POST(context);

      // Assert
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });
  });

  describe("Input Validation", () => {
    it("should validate required fields", async () => {
      // Arrange
      const invalidData = {
        estimation_type: "Invalid Type",
        scope: "",
        platforms: [],
      };
      const context = createMockContext();
      context.request = new Request("http://test.com", {
        method: "POST",
        body: JSON.stringify(invalidData),
      });

      // Act
      const response = await POST(context);

      // Assert
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Validation failed");
    });

    it("should validate scope length", async () => {
      // Arrange
      const data = createValidRequestData();
      data.scope = "a".repeat(10001); // Exceeds max length
      const context = createMockContext();
      context.request = new Request("http://test.com", {
        method: "POST",
        body: JSON.stringify(data),
      });

      // Act
      const response = await POST(context);

      // Assert
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Validation failed");
    });
  });

  describe("Business Logic", () => {
    it("should correctly calculate buffer based on total man_days", async () => {
      // Arrange
      const context = createMockContext();
      context.request = new Request("http://test.com", {
        method: "POST",
        body: JSON.stringify(createValidRequestData()),
      });
      (context.locals as TestLocals).supabase = mockSupabase;

      // Act
      const response = await POST(context);

      // Assert
      expect(response.status).toBe(201);
      const insertCalls = mockSupabase._mock.insert.mock.calls[0][0];
      expect(insertCalls).toBeDefined();
      expect(insertCalls.buffer).toBe(3); // 30% of 8 man_days, rounded up
    });

    it("should create tasks from AI analysis", async () => {
      // Arrange
      const context = createMockContext();
      context.request = new Request("http://test.com", {
        method: "POST",
        body: JSON.stringify(createValidRequestData()),
      });
      (context.locals as TestLocals).supabase = mockSupabase;

      // Act
      await POST(context);

      // Assert
      const fromCalls = mockSupabase.from.mock.calls;
      expect(fromCalls.some((call) => call[0] === "quotation_tasks")).toBe(true);
      const taskInsertCalls = mockSupabase._mock.insert.mock.calls[2][0];
      expect(taskInsertCalls).toHaveLength(2);
      expect(taskInsertCalls[0].man_days).toBe(5);
      expect(taskInsertCalls[1].man_days).toBe(3);
    });
  });

  describe("Error Handling", () => {
    it("should handle AI service errors gracefully", async () => {
      // Arrange
      vi.mocked(analyzeProject).mockRejectedValue(new Error("AI service error"));
      const context = createMockContext();
      context.request = new Request("http://test.com", {
        method: "POST",
        body: JSON.stringify(createValidRequestData()),
      });
      (context.locals as TestLocals).supabase = mockSupabase;

      // Act
      const response = await POST(context);

      // Assert
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("AI service error");
    });

    it("should rollback quotation creation if platform linking fails", async () => {
      // Arrange
      const mockError = new Error("Platform linking failed");
      const context = createMockContext();

      // Mock the platform linking to fail
      mockSupabase._mock.insert
        .mockReturnValueOnce({
          select: () => ({
            single: () => Promise.resolve({ data: { id: "test-id" }, error: null }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            single: () => Promise.reject(mockError),
          }),
        });

      context.request = new Request("http://test.com", {
        method: "POST",
        body: JSON.stringify(createValidRequestData()),
      });
      (context.locals as TestLocals).supabase = mockSupabase;

      // Act
      const response = await POST(context);

      // Assert
      expect(response.status).toBe(500);
      expect(mockSupabase._mock.delete).toHaveBeenCalled();
      expect(mockSupabase._mock.eq).toHaveBeenCalledWith("id", "test-id");
    });
  });

  describe("Success Response", () => {
    it("should return 201 with created quotation data", async () => {
      // Arrange
      const requestData = createValidRequestData();
      const context = createMockContext();
      context.request = new Request("http://test.com", {
        method: "POST",
        body: JSON.stringify(requestData),
      });

      // Act
      const response = await POST(context);

      // Assert
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty("id", "test-id");
    });
  });
});
