export class OpenRouterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class OpenRouterConfigError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterConfigError";
  }
}

export class OpenRouterNetworkError extends OpenRouterError {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = "OpenRouterNetworkError";
  }
}

export class OpenRouterValidationError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterValidationError";
  }
}

export class OpenRouterRateLimitError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterRateLimitError";
  }
}
