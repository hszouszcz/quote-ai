// src/components/discovery/types.ts

export interface DiscoveryMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  round?: number;
  questionId?: string;
  answerId?: string;
}

export interface DiscoveryQuestion {
  id: string;
  question: string;
  context?: string;
  category: string;
  priority: number;
  round: number;
  answer?: string;
}

export interface DiscoverySession {
  id: string;
  userId: string;
  status: "in_progress" | "completed" | "abandoned";
  currentRound: number;
  completenessScore?: number;
  currentReasoning?: string;
  initialDescription: string;
}

export interface DiscoveryState {
  session: DiscoverySession | null;
  messages: DiscoveryMessage[];
  questions: DiscoveryQuestion[];
  isLoading: boolean;
  error: Error | null;
  isSubmitting: boolean;
}

export interface DiscoveryContextValue extends DiscoveryState {
  // Actions
  startSession: (description: string) => Promise<void>;
  submitAnswer: (questionId: string, answer: string) => Promise<void>;
  submitMessage: (content: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  abandonSession: () => Promise<void>;
  clearError: () => void;
}
