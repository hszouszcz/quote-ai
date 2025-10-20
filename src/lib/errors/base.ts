/**
 * Base error class for all application errors
 * Provides consistent error structure across the application
 */
export abstract class AppError extends Error {
  public readonly isOperational: boolean = true;
  public readonly timestamp: string;

  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 500,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();

    // Capture stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(this.context && { context: this.context }),
      },
    };
  }

  /**
   * Get user-friendly message
   */
  getUserMessage(): string {
    return this.message;
  }
}

/**
 * Error for client-side validation failures
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, "VALIDATION_ERROR", 400, {
      field,
      value,
      ...context,
    });
  }
}

/**
 * Error for authentication failures
 */
export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed", context?: Record<string, unknown>) {
    super(message, "AUTHENTICATION_ERROR", 401, context);
  }
}

/**
 * Error for authorization failures
 */
export class AuthorizationError extends AppError {
  constructor(message = "Access denied", context?: Record<string, unknown>) {
    super(message, "AUTHORIZATION_ERROR", 403, context);
  }
}

/**
 * Error for resource not found
 */
export class NotFoundError extends AppError {
  constructor(resource = "Resource", id?: string, context?: Record<string, unknown>) {
    super(`${resource} not found`, "NOT_FOUND", 404, {
      resource,
      id,
      ...context,
    });
  }
}

/**
 * Error for resource conflicts
 */
export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "CONFLICT_ERROR", 409, context);
  }
}

/**
 * Error for rate limiting
 */
export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded", context?: Record<string, unknown>) {
    super(message, "RATE_LIMIT_ERROR", 429, context);
  }
}

/**
 * Error for external service failures
 */
export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message = "External service error",
    statusCode = 502,
    context?: Record<string, unknown>
  ) {
    super(message, "EXTERNAL_SERVICE_ERROR", statusCode, {
      service,
      ...context,
    });
  }
}

/**
 * Error for database operations
 */
export class DatabaseError extends AppError {
  constructor(message = "Database operation failed", operation?: string, context?: Record<string, unknown>) {
    super(message, "DATABASE_ERROR", 500, {
      operation,
      ...context,
    });
  }
}

/**
 * Generic internal server error
 */
export class InternalServerError extends AppError {
  constructor(message = "Internal server error", context?: Record<string, unknown>) {
    super(message, "INTERNAL_SERVER_ERROR", 500, context);
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if error is operational (expected)
 */
export function isOperationalError(error: unknown): boolean {
  return isAppError(error) && error.isOperational;
}
