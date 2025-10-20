import React from "react";
import type { AppError } from "../errors/base";
import { InternalServerError, isAppError } from "../errors/base";
import { errorReporter } from "../errors/logger";

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: AppError; retry: () => void }>;
  onError?: (error: AppError) => void;
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<{ error: AppError; retry: () => void }> = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-red-50 border border-red-200 rounded-lg">
    <div className="text-red-600 mb-4">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-red-800 mb-2">Wystąpił błąd</h3>
    <p className="text-red-700 text-center mb-4">{error.getUserMessage()}</p>
    <button onClick={retry} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
      Spróbuj ponownie
    </button>
    {import.meta.env.DEV && (
      <details className="mt-4 max-w-full">
        <summary className="cursor-pointer text-sm text-red-600">Szczegóły błędu (dev)</summary>
        <pre className="mt-2 p-3 bg-red-100 rounded text-xs overflow-auto">
          {JSON.stringify(error.toJSON(), null, 2)}
        </pre>
      </details>
    )}
  </div>
);

/**
 * React Error Boundary for catching and handling component errors
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Convert error to AppError format
    const appError = isAppError(error)
      ? error
      : new InternalServerError(error.message || "Nieoczekiwany błąd komponentu", {
          originalError: error.name,
          stack: error.stack,
        });

    return {
      hasError: true,
      error: appError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const appError = isAppError(error)
      ? error
      : new InternalServerError(error.message || "Nieoczekiwany błąd komponentu", {
          originalError: error.name,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
        });

    // Report error for monitoring
    errorReporter.reportError(appError, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Call custom error handler if provided
    this.props.onError?.(appError);
  }

  private retry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

/**
 * Hook for handling async errors in React components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<AppError | null>(null);

  const handleError = React.useCallback((error: unknown) => {
    const appError = isAppError(error)
      ? error
      : new InternalServerError(error instanceof Error ? error.message : "Nieoczekiwany błąd", {
          originalError: String(error),
        });

    errorReporter.reportError(appError, {
      source: "useErrorHandler",
    });

    setError(appError);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const executeAsync = React.useCallback(
    async <T,>(asyncOperation: () => Promise<T>): Promise<T | null> => {
      try {
        clearError();
        return await asyncOperation();
      } catch (error) {
        handleError(error);
        return null;
      }
    },
    [handleError, clearError]
  );

  return {
    error,
    handleError,
    clearError,
    executeAsync,
  };
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
