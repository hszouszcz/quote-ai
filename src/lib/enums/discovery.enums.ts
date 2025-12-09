// src/lib/enums/discovery.enums.ts

// Define as const objects - this gives you both runtime values AND strong typing
export const DISCOVERY_SESSION_STATUS = {
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  ABANDONED: "abandoned",
} as const;

export const DISCOVERY_QUESTION_CATEGORY = {
  BASIC_INFO: "basic_info",
  TECH_STACK: "tech_stack",
  INTEGRATIONS: "integrations",
  SCALE: "scale",
  COMPLIANCE: "compliance",
  ASSETS: "assets",
  DELIVERY: "delivery",
} as const;

export const DISCOVERY_CONVERSATION_ROLE = {
  SYSTEM: "system",
  AI: "ai",
  USER: "user",
} as const;

// Extract types from the const objects
export type DiscoverySessionStatus = (typeof DISCOVERY_SESSION_STATUS)[keyof typeof DISCOVERY_SESSION_STATUS];
export type DiscoveryQuestionCategory = (typeof DISCOVERY_QUESTION_CATEGORY)[keyof typeof DISCOVERY_QUESTION_CATEGORY];
export type DiscoveryConversationRole = (typeof DISCOVERY_CONVERSATION_ROLE)[keyof typeof DISCOVERY_CONVERSATION_ROLE];
