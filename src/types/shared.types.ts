/**
 * Shared utility types used across all domains
 */

/** Pagination metadata */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Generic list result from services */
export interface ListResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

/** Timestamps mixin */
export interface WithTimestamps {
  created_at: string;
  updated_at?: string;
}

/** User ownership mixin */
export interface WithUserId {
  user_id: string;
}
