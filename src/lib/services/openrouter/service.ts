import type {
  ModelConfig,
  OpenRouterConfig,
  RequestPayload,
  ResponsePayload,
  ResponseFormat,
  RetryConfig,
  RateLimitConfig,
  QueuedRequest,
  MistralResponse,
  OpenAIResponse,
  ModelType,
} from "./types";
import {
  OpenRouterConfigError,
  OpenRouterValidationError,
  OpenRouterNetworkError,
  OpenRouterRateLimitError,
} from "./errors";

export class OpenRouterService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private defaultModel: string;
  private modelType: ModelType;
  private defaultParams: {
    temperature: number;
    max_tokens: number;
    top_p: number;
  };
  private responseSchema: ResponseFormat;
  private readonly retryConfig: RetryConfig;
  private readonly rateLimitConfig: RateLimitConfig;
  private requestQueue: QueuedRequest[] = [];
  private requestsInLastMinute = 0;
  private lastRequestTime = 0;

  constructor(config: OpenRouterConfig) {
    this.validateConfig(config);

    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel;
    this.modelType = config.modelType;
    this.defaultParams = config.defaultParams;
    this.responseSchema = config.responseSchema;

    // Default retry configuration
    this.retryConfig = config.retry ?? {
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      backoffFactor: 2,
    };

    // Default rate limit configuration
    this.rateLimitConfig = config.rateLimit ?? {
      requestsPerMinute: 60,
      maxQueueSize: 100,
    };
  }

  private validateConfig(config: OpenRouterConfig): void {
    if (!config.apiUrl) {
      throw new OpenRouterConfigError("API URL is required");
    }
    if (!config.apiKey) {
      throw new OpenRouterConfigError("API Key is required");
    }
    if (!config.defaultModel) {
      throw new OpenRouterConfigError("Default model is required");
    }
    if (!config.defaultParams) {
      throw new OpenRouterConfigError("Default parameters are required");
    }
    if (!config.responseSchema) {
      throw new OpenRouterConfigError("Response schema is required");
    }

    // Validate default parameters
    const { temperature, max_tokens, top_p } = config.defaultParams;
    if (temperature < 0 || temperature > 1) {
      throw new OpenRouterConfigError("Temperature must be between 0 and 1");
    }
    if (max_tokens <= 0) {
      throw new OpenRouterConfigError("Max tokens must be greater than 0");
    }
    if (top_p < 0 || top_p > 1) {
      throw new OpenRouterConfigError("Top P must be between 0 and 1");
    }
  }

  public setModelConfig(config: ModelConfig): void {
    if (!config.model) {
      throw new OpenRouterValidationError("Model name is required");
    }
    if (!config.params) {
      throw new OpenRouterValidationError("Model parameters are required");
    }

    const { temperature, max_tokens, top_p } = config.params;
    if (temperature < 0 || temperature > 1) {
      throw new OpenRouterValidationError("Temperature must be between 0 and 1");
    }
    if (max_tokens <= 0) {
      throw new OpenRouterValidationError("Max tokens must be greater than 0");
    }
    if (top_p < 0 || top_p > 1) {
      throw new OpenRouterValidationError("Top P must be between 0 and 1");
    }

    this.defaultModel = config.model;
    this.defaultParams = config.params;
  }

  public async executeRequest(input: RequestPayload): Promise<ResponsePayload> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        payload: input,
        priority: 1,
        timestamp: Date.now(),
        resolve,
        reject,
      };

      this._enqueueRequest(queuedRequest);
    });
  }

  private async _executeRequestWithRetry(payload: RequestPayload, attempt = 1): Promise<ResponsePayload> {
    try {
      if (!this._validatePayload(payload)) {
        throw new OpenRouterValidationError("Invalid request payload");
      }

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response?.ok) {
        if (response?.status === 429) {
          throw new OpenRouterRateLimitError("Rate limit exceeded");
        }
        throw new OpenRouterNetworkError(`API request failed with status ${response?.status}`);
      }

      const rawResponse = await response.json();
      return this._handleResponse(rawResponse);
    } catch (error) {
      if (attempt < this.retryConfig.maxAttempts && this._shouldRetry(error as Error)) {
        const delayMs = this._calculateRetryDelay(attempt);
        await this._delay(delayMs);
        return this._executeRequestWithRetry(payload, attempt + 1);
      }
      throw error;
    }
  }

  private _shouldRetry(error: Error): boolean {
    if (error instanceof OpenRouterValidationError) {
      return false;
    }
    if (error instanceof OpenRouterRateLimitError) {
      return true;
    }
    if (error instanceof OpenRouterNetworkError) {
      return true;
    }
    return false;
  }

  private _calculateRetryDelay(attempt: number): number {
    const delay = this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffFactor, attempt - 1);
    return Math.min(delay, this.retryConfig.maxDelayMs);
  }

  private async _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private _enqueueRequest(request: QueuedRequest): void {
    if (this.requestQueue.length >= this.rateLimitConfig.maxQueueSize) {
      request.reject(new OpenRouterRateLimitError("Request queue is full"));
      return;
    }

    this.requestQueue.push(request);
    this._processQueue();
  }

  private async _processQueue(): Promise<void> {
    if (this.requestQueue.length === 0) {
      return;
    }

    const now = Date.now();
    if (now - this.lastRequestTime >= 60000) {
      this.requestsInLastMinute = 0;
      this.lastRequestTime = now;
    }

    if (this.requestsInLastMinute >= this.rateLimitConfig.requestsPerMinute) {
      // Wait and try again later
      setTimeout(() => this._processQueue(), 1000);
      return;
    }

    const request = this.requestQueue.shift();
    if (!request) {
      return;
    }

    this.requestsInLastMinute++;
    this.lastRequestTime = now;

    try {
      const response = await this._executeRequestWithRetry(request.payload);
      request.resolve(response);
    } catch (error) {
      request.reject(error as Error);
    }

    // Process next request if any
    if (this.requestQueue.length > 0) {
      this._processQueue();
    }
  }

  private _buildPayload(input: RequestPayload): RequestPayload {
    return {
      messages: input.messages,
      model: input.model || this.defaultModel,
      response_format: this.responseSchema,
      temperature: input.temperature ?? this.defaultParams.temperature,
      max_tokens: input.max_tokens ?? this.defaultParams.max_tokens,
      top_p: input.top_p ?? this.defaultParams.top_p,
    };
  }

  private _handleResponse(rawResponse: unknown): ResponsePayload {
    if (!rawResponse || typeof rawResponse !== "object") {
      throw new OpenRouterValidationError("Invalid response format");
    }

    // Development logging
    if (process.env.NODE_ENV !== "production") {
      console.group("OpenRouter Response");
      console.dir(rawResponse, { depth: null });
      console.groupEnd();
    }

    if (this.modelType === "mistral") {
      const response = rawResponse as MistralResponse;
      if (!response.choices?.[0]?.message?.content) {
        throw new OpenRouterValidationError("Invalid Mistral response format");
      }

      return {
        result: response.choices[0].message.content,
        metadata: {
          model: response.model,
          usage: response.usage,
          created: response.created,
        },
      };
    } else {
      // OpenAI format
      const response = rawResponse as OpenAIResponse;
      if (!response.result) {
        throw new OpenRouterValidationError("Response missing required 'result' field");
      }

      return {
        result: response.result,
        metadata: response.metadata || {},
      };
    }
  }

  private _validatePayload(payload: RequestPayload): boolean {
    if (!payload.messages || !Array.isArray(payload.messages) || payload.messages.length === 0) {
      return false;
    }

    if (!payload.model) {
      return false;
    }

    if (!payload.response_format || !payload.response_format.type || !payload.response_format.json_schema) {
      return false;
    }

    const { temperature, max_tokens, top_p } = payload;

    if (temperature !== undefined && (temperature < 0 || temperature > 1)) {
      return false;
    }

    if (max_tokens !== undefined && max_tokens <= 0) {
      return false;
    }

    if (top_p !== undefined && (top_p < 0 || top_p > 1)) {
      return false;
    }

    return true;
  }

  private _logError(error: Error, context: string): void {
    console.error(`[OpenRouter Error] ${context}:`, error);
  }
}
