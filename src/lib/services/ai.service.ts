import type { Json } from "../../db/database.types";

export interface AITaskAnalysis {
  description: string;
  man_days: number;
}

export interface AIProjectAnalysis {
  tasks: AITaskAnalysis[];
  reasoning: string;
}

/**
 * Analyzes project scope and generates estimation with tasks
 * TODO: Replace with actual OpenRouter integration
 */
export async function analyzeProject(
  scope: string,
  platforms: string[],
  estimationType: string,
  dynamicAttributes: Json | null
): Promise<AIProjectAnalysis> {
  // Mock implementation that uses input parameters
  const baseTaskCount = Math.max(Math.ceil(scope.length / 1000), 2);
  const baseDaysPerTask = estimationType === "Fixed Price" ? 3 : 2;
  const platformMultiplier = 1 + (platforms.length - 1) * 0.3;

  const tasks: AITaskAnalysis[] = [];

  // Generate tasks based on scope size and platforms
  tasks.push({
    description: "Initial project setup and configuration",
    man_days: Math.ceil(2 * platformMultiplier),
  });

  for (let i = 0; i < baseTaskCount; i++) {
    tasks.push({
      description: `Core implementation phase ${i + 1}`,
      man_days: Math.ceil(baseDaysPerTask * platformMultiplier),
    });
  }

  // Add platform-specific tasks
  for (const platform of platforms) {
    tasks.push({
      description: `${platform} platform implementation and testing`,
      man_days: Math.ceil(baseDaysPerTask * 0.8),
    });
  }

  const reasoning = `
Project Analysis:
- Scope size: ${scope.length} characters
- Platforms: ${platforms.join(", ")}
- Estimation type: ${estimationType}
- Dynamic attributes: ${JSON.stringify(dynamicAttributes)}
`.trim();

  return {
    tasks,
    reasoning,
  };
}
