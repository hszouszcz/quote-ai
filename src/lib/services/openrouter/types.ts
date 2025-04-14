export interface ModelParams {
  temperature: number;
  max_tokens: number;
  top_p: number;
}

export interface ModelConfig {
  model: string;
  params: ModelParams;
}

export interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
  };
}

export interface RequestPayload {
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  model: string;
  response_format: ResponseFormat;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface ResponsePayload {
  result: string;
  metadata: Record<string, unknown>;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  maxQueueSize: number;
}

export interface MistralResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIResponse {
  result: string;
  metadata: Record<string, unknown>;
}

export type ModelType = "mistral" | "openai";

export interface OpenRouterConfig {
  apiUrl: string;
  apiKey: string;
  defaultModel: string;
  defaultParams: ModelParams;
  responseSchema: ResponseFormat;
  retry?: RetryConfig;
  rateLimit?: RateLimitConfig;
  modelType: ModelType;
}

export interface QueuedRequest {
  payload: RequestPayload;
  priority: number;
  timestamp: number;
  resolve: (value: ResponsePayload) => void;
  reject: (error: Error) => void;
}
