import { OpenRouterService } from "../service";
import { OpenRouterConfigError, OpenRouterValidationError, OpenRouterRateLimitError } from "../errors";
import type { OpenRouterConfig, RequestPayload } from "../types";

describe("OpenRouterService", () => {
  const mockConfig: OpenRouterConfig = {
    apiUrl: "https://api.openrouter.ai/api/v1/chat",
    apiKey: process.env.OPENROUTER_API_KEY || "test-api-key",
    defaultModel: "gpt-3.5-turbo",
    modelType: "openai",
    defaultParams: {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 0.9,
    },
    responseSchema: {
      type: "json_schema",
      json_schema: {
        name: "TestResponse",
        strict: true,
        schema: { result: "string", metadata: "object" },
      },
    },
  };

  describe("constructor", () => {
    it("should create instance with valid config", () => {
      const service = new OpenRouterService(mockConfig);
      expect(service).toBeInstanceOf(OpenRouterService);
    });

    it("should throw error for missing API URL", () => {
      const invalidConfig = { ...mockConfig, apiUrl: "" };
      expect(() => new OpenRouterService(invalidConfig)).toThrow(OpenRouterConfigError);
    });

    it("should throw error for missing API key", () => {
      const invalidConfig = { ...mockConfig, apiKey: "" };
      expect(() => new OpenRouterService(invalidConfig)).toThrow(OpenRouterConfigError);
    });

    it("should throw error for invalid temperature", () => {
      const invalidConfig = {
        ...mockConfig,
        defaultParams: { ...mockConfig.defaultParams, temperature: 1.5 },
      };
      expect(() => new OpenRouterService(invalidConfig)).toThrow(OpenRouterConfigError);
    });
  });

  describe("setModelConfig", () => {
    let service: OpenRouterService;

    beforeEach(() => {
      service = new OpenRouterService(mockConfig);
    });

    it("should update model configuration with valid params", () => {
      const newConfig = {
        model: "gpt-4",
        params: {
          temperature: 0.5,
          max_tokens: 2000,
          top_p: 0.8,
        },
      };
      expect(() => service.setModelConfig(newConfig)).not.toThrow();
    });

    it("should throw error for invalid temperature", () => {
      const invalidConfig = {
        model: "gpt-4",
        params: {
          temperature: 1.5,
          max_tokens: 2000,
          top_p: 0.8,
        },
      };
      expect(() => service.setModelConfig(invalidConfig)).toThrow(OpenRouterValidationError);
    });
  });

  describe("executeRequest", () => {
    let service: OpenRouterService;
    const mockPayload: RequestPayload = {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello!" },
      ],
      model: "gpt-3.5-turbo",
      response_format: mockConfig.responseSchema,
    };

    beforeEach(() => {
      service = new OpenRouterService(mockConfig);
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should handle successful request", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ result: "Hello!", metadata: {} }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.executeRequest(mockPayload);
      expect(result).toEqual({ result: "Hello!", metadata: {} });
    });

    it("should handle rate limit error", async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: "Rate limit exceeded" }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await expect(service.executeRequest(mockPayload)).rejects.toThrow(OpenRouterRateLimitError);
    });

    it("should retry on network error", async () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
      };
      const mockSuccessResponse = {
        ok: true,
        json: () => Promise.resolve({ result: "Success after retry!", metadata: {} }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse).mockResolvedValueOnce(mockSuccessResponse);

      const result = await service.executeRequest(mockPayload);
      expect(result).toEqual({ result: "Success after retry!", metadata: {} });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
