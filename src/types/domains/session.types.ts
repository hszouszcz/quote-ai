/**
 * Session Domain Types
 * Commands, DTOs, and responses for user sessions
 */

import type { Database } from "@/types/database.types";
import type { ListResult } from "@/types/shared.types";

// Database row types
export type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];

// ===========================
// Session DTOs and Commands
// ===========================

/** Command for creating a new session */
export interface CreateSessionCommand {
  session_id: string;
  user_agent?: string | null;
  errors?: string | null;
}

/** Session DTO */
export type SessionDTO = SessionRow;

/** Result of listing discovery sessions */
export type ListSessionsResult = ListResult<Database["public"]["Tables"]["discovery_sessions"]["Row"]>;

