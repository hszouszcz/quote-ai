import type { AppError } from "./base";

/**
 * Log levels for different types of events
 */
export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

/**
 * Logger interface for different logging implementations
 */
export interface Logger {
  error(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

/**
 * Console logger implementation for development
 */
class ConsoleLogger implements Logger {
  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `\n${JSON.stringify(context, null, 2)}` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  error(message: string, context?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.error(this.formatMessage(LogLevel.ERROR, message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.info(this.formatMessage(LogLevel.INFO, message, context));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
  }
}

/**
 * Structured logger for production (can be extended for external services)
 */
class StructuredLogger implements Logger {
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
    };

    // In production, you might want to send this to external logging service
    // like Sentry, DataDog, or CloudWatch
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(logEntry));
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }
}

/**
 * Logger factory based on environment
 */
function createLogger(): Logger {
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? new ConsoleLogger() : new StructuredLogger();
}

// Export singleton logger instance
export const logger = createLogger();

/**
 * Error reporter utility for tracking and logging errors
 */
export class ErrorReporter {
  constructor(private readonly logger: Logger) {}

  /**
   * Report an application error with proper context
   */
  reportError(error: AppError, additionalContext?: Record<string, unknown>): void {
    const context = {
      ...error.context,
      ...additionalContext,
      stack: error.stack,
    };

    this.logger.error(`${error.name}: ${error.message}`, context);

    // In production, you might want to send critical errors to external monitoring
    if (error.statusCode >= 500 && !import.meta.env.DEV) {
      this.reportCriticalError(error, context);
    }
  }

  /**
   * Report unexpected errors (non-AppError instances)
   */
  reportUnexpectedError(error: unknown, context?: Record<string, unknown>): void {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;

    this.logger.error(`Unexpected error: ${errorMessage}`, {
      ...context,
      stack,
      errorType: typeof error,
    });

    // Always report unexpected errors as critical
    this.reportCriticalError(error, context);
  }

  /**
   * Report critical errors to external monitoring service
   */
  private reportCriticalError(error: unknown, context?: Record<string, unknown>): void {
    // TODO: Integrate with external error monitoring service
    // Examples: Sentry, Bugsnag, Rollbar

    this.logger.error("CRITICAL ERROR DETECTED", {
      error: error instanceof Error ? error.message : String(error),
      context,
    });
  }

  /**
   * Log warning for potential issues
   */
  reportWarning(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(message, context);
  }

  /**
   * Log informational messages
   */
  reportInfo(message: string, context?: Record<string, unknown>): void {
    this.logger.info(message, context);
  }
}

// Export singleton error reporter
export const errorReporter = new ErrorReporter(logger);
