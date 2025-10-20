import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { AppError, ValidationError, InternalServerError, isAppError } from "./base";
import { errorReporter } from "./logger";

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    timestamp: string;
    context?: Record<string, unknown>;
  };
}

/**
 * Extract validation errors from Zod error and convert to ValidationError
 */
export function handleZodError(error: ZodError): ValidationError {
  const firstError = error.errors[0];
  const field = firstError?.path.join(".") || "unknown";
  const message = firstError?.message || "Validation failed";

  return new ValidationError(message, field, undefined, {
    allErrors: error.errors,
  });
}

/**
 * Convert any error to AppError for consistent handling
 */
export function normalizeError(error: unknown): AppError {
  // Already an AppError
  if (isAppError(error)) {
    return error;
  }

  // Zod validation error
  if (error instanceof ZodError) {
    return handleZodError(error);
  }

  // Standard JavaScript Error
  if (error instanceof Error) {
    return new InternalServerError(error.message, {
      originalError: error.name,
      stack: error.stack,
    });
  }

  // Unknown error type
  return new InternalServerError("An unexpected error occurred", {
    originalError: String(error),
  });
}

/**
 * Create standardized error response for API endpoints
 */
export function createErrorResponse(error: AppError): Response {
  const response: ApiErrorResponse = error.toJSON();

  return new Response(JSON.stringify(response), {
    status: error.statusCode,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Higher-order function to wrap API route handlers with error handling
 */
export function withErrorHandling(handler: APIRoute): APIRoute {
  return async (context) => {
    try {
      return await handler(context);
    } catch (error) {
      const normalizedError = normalizeError(error);

      // Report the error for monitoring
      errorReporter.reportError(normalizedError, {
        url: context.request.url,
        method: context.request.method,
        headers: Object.fromEntries(context.request.headers),
        userAgent: context.request.headers.get("user-agent"),
      });

      return createErrorResponse(normalizedError);
    }
  };
}

/**
 * Async error handler for service layer operations
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const normalizedError = normalizeError(error);

    // Add context to the error
    if (context) {
      Object.assign(normalizedError.context || {}, context);
    }

    errorReporter.reportError(normalizedError, context);
    throw normalizedError;
  }
}

/**
 * Synchronous error handler for service layer operations
 */
export function handleSyncOperation<T>(operation: () => T, context?: Record<string, unknown>): T {
  try {
    return operation();
  } catch (error) {
    const normalizedError = normalizeError(error);

    // Add context to the error
    if (context) {
      Object.assign(normalizedError.context || {}, context);
    }

    errorReporter.reportError(normalizedError, context);
    throw normalizedError;
  }
}

/**
 * Type-safe error boundary for async operations that don't throw
 * Returns [error, result] tuple similar to Go's error handling
 */
export async function safeAsync<T>(operation: () => Promise<T>): Promise<[AppError | null, T | null]> {
  try {
    const result = await operation();
    return [null, result];
  } catch (error) {
    const normalizedError = normalizeError(error);
    return [normalizedError, null];
  }
}

/**
 * Type-safe error boundary for sync operations that don't throw
 */
export function safeSync<T>(operation: () => T): [AppError | null, T | null] {
  try {
    const result = operation();
    return [null, result];
  } catch (error) {
    const normalizedError = normalizeError(error);
    return [normalizedError, null];
  }
}
