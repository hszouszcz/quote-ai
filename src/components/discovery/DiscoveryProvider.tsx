import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { DiscoveryContextValue, DiscoveryMessage, DiscoverySession, DiscoveryQuestion } from "@/types";
import React from "react";
import { DiscoveryClientService } from "@/lib/services/langchain/discovery.client.service";
import { SessionClientService } from "@/lib/services/session.client.service";

const DiscoveryContext = createContext<DiscoveryContextValue | null>(null);

interface DiscoveryProviderProps {
  userId: string;
  sessionId?: string;
  children: React.ReactNode;
  onComplete?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

const discoveryClientService = new DiscoveryClientService("api/discovery");
const sessionClientService = new SessionClientService();

export const DiscoveryProvider: React.FC<DiscoveryProviderProps> = ({
  userId,
  sessionId: initialSessionId,
  children,
  onError,
}) => {
  const [session, setSession] = useState<DiscoverySession | null>(null);
  const [messages, setMessages] = useState<DiscoveryMessage[]>([]);
  const [questions, setQuestions] = useState<DiscoveryQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSession = useCallback(
    async (sessionId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const sessionData = await sessionClientService.getSessionById(sessionId);

        if (sessionData === null) {
          throw new Error("Session not found");
        }

        setSession({
          id: sessionData.id,
          userId: userId,
          status: sessionData.status as "in_progress" | "completed" | "abandoned",
          currentRound: sessionData.current_round,
          completenessScore: sessionData.completeness_score || undefined,
          currentReasoning: sessionData.current_reasoning || undefined,
          initialDescription: sessionData.initial_description,
        });

        // TODO: Load messages and questions from API
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to load session");
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, onError]
  );

  useEffect(() => {
    if (initialSessionId) {
      loadSession(initialSessionId);
    }
  }, [initialSessionId, loadSession]);

  const startSession = useCallback(
    async (description: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // Add initial user message
        const userMessage: DiscoveryMessage = {
          id: `msg-${Date.now()}`,
          role: "user",
          content: description,
          timestamp: new Date(),
        };
        setMessages([userMessage]);

        const response = await discoveryClientService.startDiscovery({
          initialDescription: description,
        });

        setSession({
          id: response.sessionId,
          userId: userId,
          status: response.status as "in_progress" | "completed" | "abandoned",
          currentRound: response.currentRound,
          initialDescription: description,
        });

        setQuestions(response.questions);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to start session");
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, onError]
  );

  const submitAnswer = useCallback(
    async (questionId: string, answer: string) => {
      if (!session) return;

      try {
        setIsSubmitting(true);
        setError(null);

        // Add user message
        const userMessage: DiscoveryMessage = {
          id: `msg-${Date.now()}`,
          role: "user",
          content: answer,
          timestamp: new Date(),
          round: session.currentRound,
          answerId: questionId,
        };

        setMessages((prev) => [...prev, userMessage]);

        await discoveryClientService.submitAnswer({ questionId, answer, sessionId: session.id });

        setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, answer } : q)));
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to submit answer");
        setError(error);
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [session, onError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: DiscoveryContextValue = {
    session,
    messages,
    questions,
    isLoading,
    isSubmitting,
    error,
    startSession,
    submitAnswer,
    loadSession,
    clearError,
  };

  return <DiscoveryContext.Provider value={value}>{children}</DiscoveryContext.Provider>;
};

export const useDiscoveryContext = () => {
  const context = useContext(DiscoveryContext);
  if (!context) {
    throw new Error("useDiscoveryContext must be used within DiscoveryProvider");
  }
  return context;
};
