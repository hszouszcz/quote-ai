import type { QuotationsResponse } from "@/types";

interface FetchQuotationsParams {
  page: number;
  limit: number;
  sort: string;
  filter?: string;
  userId?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchQuotations(params: FetchQuotationsParams, retryCount = 0): Promise<QuotationsResponse> {
  try {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      sort: params.sort,
      ...(params.filter && { filter: params.filter }),
      ...(params.userId && { userId: params.userId }),
    });

    const response = await fetch(`/api/quotations?${queryParams}`);

    if (!response.ok) {
      // Handle specific HTTP errors
      switch (response.status) {
        case 401:
          throw new ApiError("Unauthorized. Please log in again.", 401, "UNAUTHORIZED");
        case 403:
          throw new ApiError("You do not have permission to access this resource.", 403, "FORBIDDEN");
        case 404:
          throw new ApiError("The requested quotations could not be found.", 404, "NOT_FOUND");
        case 429:
          if (retryCount < MAX_RETRIES) {
            await sleep(RETRY_DELAY * (retryCount + 1));
            return fetchQuotations(params, retryCount + 1);
          }
          throw new ApiError("Too many requests. Please try again later.", 429, "RATE_LIMIT");
        case 500:
          throw new ApiError("Internal server error. Please try again later.", 500, "SERVER_ERROR");
        default:
          throw new ApiError(`Failed to fetch quotations: ${response.statusText}`, response.status);
      }
    }

    const apiResponse = await response.json();

    // Validate response structure
    if (!apiResponse || typeof apiResponse !== "object") {
      throw new ApiError("Invalid response format: not an object", undefined, "INVALID_RESPONSE");
    }

    // Validate that data exists and is an array
    if (!Array.isArray(apiResponse.data)) {
      throw new ApiError("Invalid response format: data is not an array", undefined, "INVALID_RESPONSE");
    }

    // Validate pagination info
    if (
      !apiResponse.pagination ||
      typeof apiResponse.pagination.total !== "number" ||
      typeof apiResponse.pagination.totalPages !== "number"
    ) {
      throw new ApiError("Invalid response format: missing pagination metadata", undefined, "INVALID_RESPONSE");
    }

    // Transform API response to our expected format
    const quotationsResponse: QuotationsResponse = {
      quotations: apiResponse.data,
      total: apiResponse.pagination.total,
      totalPages: apiResponse.pagination.totalPages,
      currentPage: apiResponse.pagination.page,
      limit: apiResponse.pagination.limit,
    };

    return quotationsResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors with retry logic
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      if (retryCount < MAX_RETRIES) {
        await sleep(RETRY_DELAY * (retryCount + 1));
        return fetchQuotations(params, retryCount + 1);
      }
      throw new ApiError("Network error. Please check your connection.", undefined, "NETWORK_ERROR");
    }

    throw new ApiError("An unexpected error occurred.", undefined, "UNKNOWN_ERROR");
  }
}
