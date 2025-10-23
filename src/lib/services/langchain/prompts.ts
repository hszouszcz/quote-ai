/**
 * System prompt for project analysis
 * Defines the AI's role and output format
 */
export const PROJECT_ANALYSIS_SYSTEM_PROMPT =
  `You are a senior presales consultant and solution architect specialized in scoping and estimating custom software projects for clients.
Your goal is to analyze a client's project description and produce a structured understanding of what they want to build. Be explicit, practical, and concise.
IMPORTANT: You must respond with ONLY a valid JSON object in this exact format:
{
  "goal": "Main project goal or purpose",
  "target_audience": ["user type 1", "user type 2"],
  "type": "Product type (SaaS, mobile app, marketplace, internal tool, etc.)",
  "key_features": {
    "Category 1": ["feature 1", "feature 2"],
    "Category 2": ["feature 3", "feature 4"]
  },
  "non_functional": ["requirement 1", "requirement 2"],
  "open_questions": ["question 1", "question 2"]
}
Do not include any text before or after the JSON object. Return only valid JSON.`.trim();

/**
 * Generates user prompt for project analysis
 * @param description - Raw project description from client
 * @returns Formatted prompt with embedded description
 */
export const createProjectAnalysisPrompt = (description: string): string => {
  return `Analyze the following project brief and extract the required information:
- Project goal
- Target audience
- Product type (SaaS, mobile app, marketplace, internal tool, etc.)
- Key features (grouped logically)
- Non-functional requirements (e.g. performance, integrations, scalability)
- Known constraints or open questions
Return the analysis in the specified JSON format:
<project_brief>
${description.trim()}
</project_brief>`.trim();
};
