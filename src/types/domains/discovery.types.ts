/**
 * Discovery Domain Types
 * DTOs, UI types, and state for discovery feature
 */

import type { Database } from "@/types/database.types";

// Database row types
export type DiscoverySessionRow = Database["public"]["Tables"]["discovery_sessions"]["Row"];
export type DiscoverySessionInsert = Database["public"]["Tables"]["discovery_sessions"]["Insert"];
export type DiscoverySessionUpdate = Database["public"]["Tables"]["discovery_sessions"]["Update"];

export type DiscoveryQuestionsForRoundRow = Database["public"]["Tables"]["discovery_questions"]["Row"];
export type DiscoveryQuestionsForRoundInsert = Database["public"]["Tables"]["discovery_questions"]["Insert"];
export type DiscoveryQuestionsForRoundUpdate = Database["public"]["Tables"]["discovery_questions"]["Update"];

export type DiscoveryConversationLogInsert = Database["public"]["Tables"]["discovery_conversation_log"]["Insert"];
export type DiscoveryConversationLogRow = Database["public"]["Tables"]["discovery_conversation_log"]["Row"];

// ===========================
// UI State Types
// ===========================

/** Message in discovery conversation */
export interface DiscoveryMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  round?: number;
  questionId?: string;
  answerId?: string;
}

/** Question in discovery process */
export interface DiscoveryQuestion {
  id: string;
  question: string;
  context?: string;
  category: string;
  priority: number;
  round: number;
  answer?: string;
}

/** Discovery session state */
export interface DiscoverySession {
  id: string;
  userId: string;
  status: "in_progress" | "completed" | "abandoned";
  currentRound: number;
  completenessScore?: number;
  currentReasoning?: string;
  initialDescription: string;
}

/** Full discovery state */
export interface DiscoveryState {
  session: DiscoverySession | null;
  messages: DiscoveryMessage[];
  questions: DiscoveryQuestion[];
  isLoading: boolean;
  error: Error | null;
  isSubmitting: boolean;
}

/** Discovery context value with actions */
export interface DiscoveryContextValue extends DiscoveryState {
  startSession: (description: string) => Promise<void>;
  submitAnswer: (questionId: string, answer: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
}
