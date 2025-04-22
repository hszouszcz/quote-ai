import { useState, useEffect } from "react";
import type { QuotationDTO } from "@/types";
import { fetchQuotations } from "@/lib/services/quotationsService";

// Extend Error for API error type
interface ApiErrorLike extends Error {
  code?: string;
}

interface FiltersVM {
  page: number;
  limit: number;
  sort: string;
  filter: string;
}

interface PaginationMetadata {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

interface UseQuotationsResult {
  quotes: QuotationDTO[];
  isLoading: boolean;
  error: {
    message: string;
    code?: string;
  } | null;
  filters: FiltersVM;
  pagination: PaginationMetadata;
  setFilters: (newFilters: Partial<FiltersVM>) => void;
  retry: () => void;
}

const DEFAULT_FILTERS: FiltersVM = {
  page: 1,
  limit: 10,
  sort: "created_at:desc",
  filter: "",
};

export function useQuotations(userId?: string): UseQuotationsResult {
  const [quotes, setQuotes] = useState<QuotationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [filters, setFilters] = useState<FiltersVM>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState<PaginationMetadata>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: DEFAULT_FILTERS.limit,
  });
  const [retryCounter, setRetryCounter] = useState(0);

  useEffect(() => {
    const loadQuotations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchQuotations({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          filter: filters.filter || undefined,
          userId,
        });

        setQuotes(data.quotations);
        setPagination({
          total: data.total,
          totalPages: data.totalPages,
          currentPage: filters.page,
          limit: filters.limit,
        });
      } catch (err) {
        if (err instanceof Error) {
          setError({
            message: err.message,
            code: "code" in err ? (err as ApiErrorLike).code : undefined,
          });
        } else {
          setError({
            message: "An unexpected error occurred",
            code: "UNKNOWN_ERROR",
          });
        }
        setQuotes([]);
        setPagination({
          total: 0,
          totalPages: 0,
          currentPage: 1,
          limit: filters.limit,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadQuotations();
  }, [filters, userId, retryCounter]);

  const handleFilterChange = (newFilters: Partial<FiltersVM>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change
      ...(newFilters.filter !== undefined && { page: 1 }),
    }));
  };

  const retry = () => {
    setRetryCounter((prev) => prev + 1);
  };

  return {
    quotes,
    isLoading,
    error,
    filters,
    pagination,
    setFilters: handleFilterChange,
    retry,
  };
}
