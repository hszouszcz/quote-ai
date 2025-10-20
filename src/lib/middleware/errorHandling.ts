import type { MiddlewareHandler } from "astro";
import { errorReporter } from "../errors";

/**
 * Global error handling middleware for Astro
 * Catches unhandled errors and provides consistent error reporting
 */
export const errorHandlingMiddleware: MiddlewareHandler = (context, next) => {
  return next()
    .then((response) => {
      // Check if response indicates an error
      if (response.status >= 400) {
        errorReporter.reportWarning("HTTP error response", {
          status: response.status,
          url: context.request.url,
          method: context.request.method,
        });
      }
      return response;
    })
    .catch((error) => {
      // Log unexpected errors that weren't caught by route handlers
      errorReporter.reportUnexpectedError(error, {
        url: context.request.url,
        method: context.request.method,
        userAgent: context.request.headers.get("user-agent"),
        middleware: "errorHandlingMiddleware",
      });

      // Return a generic error response
      return new Response(
        JSON.stringify({
          error: {
            message: "Internal server error",
            code: "INTERNAL_SERVER_ERROR",
            statusCode: 500,
            timestamp: new Date().toISOString(),
          },
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });
};
