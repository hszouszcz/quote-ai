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
<project_brief>
${description.trim()}
</project_brief>
Ensure the response is valid JSON in the specified format without any code fences and it can be parsed.
`.trim();
};

/**
 * System prompt for project discovery initial analysis
 * Defines the AI's role and output format
 */
export const PROJECT_DISCOVERY_INITIAL_ANALYSIS_SYSTEM_PROMPT =
  `You are a senior presales consultant and solution architect specialized in scoping and estimating custom software projects for clients.
Your goal is to analyze a client's project description and produce a structured understanding of what they want to build. Be explicit, practical, and concise.
You want to extract maximum information from the initial description to fill out all fields.  Very important: Do not fill in placeholders - if info is missing, leave fields empty.
IMPORTANT: You must respond with ONLY a valid JSON object in this exact format:
{
  "goal": "Main project goal or purpose",
  "target_audience": ["user type 1", "user type 2"],
  "tech_stack": ["technology 1", "technology 2"],
  "integrations": ["external system integration 1", "external system integration 2"],
  "type": "Product type (SaaS, mobile app, marketplace, internal tool, etc.)",
  "key_features": {
    "Category 1": ["feature 1", "feature 2"],
    "Category 2": ["feature 3", "feature 4"]
  },
  "assets": {
  Category 1: ["asset 1", "asset 2"],
  Category 2: ["asset 3", "asset 4"]
},
  "non_functional": ["requirement 1", "requirement 2"],
}
Do not include any text before or after the JSON object. Return only valid JSON.`.trim();

/**
 * Generates user prompt for project analysis
 * @param description - Raw project description from client
 * @returns Formatted prompt with embedded description
 */
export const createProjectDiscoveryInitialAnalysisPrompt = (description: string): string => {
  return `Analyze the following project brief and extract the required information:
- Project goal
- Target audience
- Product type (SaaS, mobile app, marketplace, internal tool, etc.)
- Integrations with external systems
- Key features (grouped logically)
- Known integrations with external systems (e.g. payment gateways, CRM systems, third-party APIs)
- Assets provided by the client (e.g. design files, documentation, legacy systems, already existing code of project)
- Known constraints
<project_brief>
${description.trim()}
</project_brief>
`.trim();
};

/**
 * System promt to identify project modules
 * defines the AI's role and output format
 */
export const PROJECT_MODULES_SYSTEM_PROMPT = `
You are a software architect experienced in modular system design.
Based on the structured project summary, identify the main system modules and their internal components.
Output example: 
{
  "modules": [
    {
      "name": "Authentication & User Management",
      "purpose": "Allow users to register, log in, and manage profiles",
      "features": ["Email/password login", "Social auth", "Role management"],
      "dependencies": ["Database", "Frontend"],
      "teams": ["backend"]
    },
    {
      "name": "Booking System",
      "purpose": "Enable users to book climbing classes",
      "features": ["Schedule view", "Booking API", "Payment link"],
      "dependencies": ["Authentication", "Payments"],
      "teams": ["frontend", "backend"]
    }
  ]
}
Do not include any text before or after the JSON object. Return only valid JSON.
`.trim();

/**
 * Generate user prompt for project modules identification
 * @param projectSummary - Structured project summary JSON
 * @returns Formatted modules break down
 */
export const createProjectModulesPrompt = (projectSummary: string): string => {
  return `Based on the following project description (JSON), list all logical modules of the system, and for each module, describe:
	•	Its purpose
	•	Key features inside the module
	•	Dependencies between modules
	•	Which team would own it (frontend / backend / mobile / devops)
  <project_summary>
${projectSummary.trim()}
</project_summary>`;
};

/**
 * System prompt: Component inventory with baseline coefficients (Part 2A)
 */
export const COMPONENT_INVENTORY_SYSTEM_PROMPT = `
You are a senior solution architect. Build a component inventory per module and assign baseline complexity coefficients to each component type.
Use this default dictionary unless overridden in the user prompt:
- "crud": 1.0
- "external_api": 1.2
- "payment": 1.5
- "realtime_sync": 1.7
- "ai_ml": 2.5
- "auth_oauth": 1.3
- "file_storage": 1.1
- "notifications": 1.1
- "mobile_client": 1.6
- "admin_panel": 1.2
IMPORTANT: You must respond with ONLY a valid JSON object in this exact top-level shape:
{
  "components": [
    { "module": "Module name", "items": [ { "name": "Component", "type": "crud|external_api|payment|...", "coefficient": 1.0, "rationale": "why" } ] }
  ]
}
Do not include any text before or after the JSON object. Return only valid JSON.
`.trim();

/**
 * User prompt creator: Component inventory (Part 2A)
 */
export const createComponentInventoryPrompt = (
  modulesJson: string,
  overrides?: { dictionary?: Record<string, number> }
) => {
  const dict = overrides?.dictionary
    ? Object.entries(overrides.dictionary)
        .map(([k, v]) => `- "${k}": ${v}`)
        .join("\n")
    : "";
  const dictText = dict ? `Override dictionary:\n${dict}\n` : "";
  return `
Build a component inventory per module based on the modules JSON.
${dictText}
Return the JSON with fields: components -> [{ module, items: [{ name, type, coefficient, rationale }]}].

<modules>
${modulesJson.trim()}
</modules>
`.trim();
};

/**
 * System prompt: Pillar scoring across Domain/Technical/Interaction/Process (Part 2B)
 */
export const CONTEXTUAL_PILLAR_SCORING_SYSTEM_PROMPT = `
You are a senior delivery architect. Score each module across four pillars:
- domain, technical, interaction, process (each 1–5 with short "drivers" array).
Also produce:
- interaction.matrix: array of { "from": "Module A", "to": "Module B", "weight": number }
- interaction.interaction_coefficient: average of weights (sum(weights)/count)
- process.overheads_percent: total additive percent computed from flags like "QA:+10", "Multi-platform:+15", "CI/CD:+5"
IMPORTANT: You must respond with ONLY a valid JSON object in this exact top-level shape:
{
  "pillar_scores": [
    {
      "module": "Module name",
      "domain": { "score": 1, "drivers": ["reason"] },
      "technical": { "score": 1, "drivers": ["reason"] },
      "interaction": {
        "score": 1,
        "matrix": [{ "from": "A", "to": "B", "weight": 1.0 }],
        "interaction_coefficient": 1.0
      },
      "process": {
        "score": 1,
        "overheads_percent": 10,
        "flags": ["QA:+10"]
      }
    }
  ]
}
Do not include any text before or after the JSON object. Return only valid JSON.
`.trim();

/**
 * User prompt creator: Pillar scoring (Part 2B)
 */
export const createPillarScoringPrompt = (modulesJson: string, componentsJson: string) => {
  return `
Using the modules and component inventory, score each module across the four pillars.
Be explicit and practical; keep drivers short.

<modules>
${modulesJson.trim()}
</modules>

<components>
${componentsJson.trim()}
</components>
`.trim();
};

/**
 * System prompt: Effort scoring and MD range (Part 2C)
 */
export const EFFORT_SCORING_SYSTEM_PROMPT = `
You are an AI estimator. For each module:
- base_effort = sum(component.coefficient) for that module (CRUD unit ~ 1 MD baseline)
- effort_score = 0.3*domain.score + 0.3*technical.score + 0.2*interaction.score + 0.2*process.score
- risk_factor: use provided per-module value if available; otherwise default 0.2
- md.realistic = base_effort * effort_score * (1 + risk_factor)
- md.optimistic = floor(md.realistic * 0.8)
- md.pessimistic = ceil(md.realistic * 1.25)
Include a short "rationale".
IMPORTANT: You must respond with ONLY a valid JSON object in this exact top-level shape:
{
  "md_range": [
    {
      "module": "Module name",
      "base_effort": 1.0,
      "effort_score": 2.5,
      "risk_factor": 0.2,
      "md": { "optimistic": 2, "realistic": 3, "pessimistic": 4 },
      "rationale": "why"
    }
  ]
}
Do not include any text before or after the JSON object. Return only valid JSON.
`.trim();

/**
 * User prompt creator: Effort scoring (Part 2C)
 */
export const createEffortScoringPrompt = (
  pillarScoresJson: string,
  componentsJson: string,
  riskFactorsJson?: string
) => {
  const riskSection = riskFactorsJson ? `<risk_factors>\n${riskFactorsJson.trim()}\n</risk_factors>\n` : "";
  return `
Compute base_effort, effort_score, and md variants per module based on pillar scores and components.
Use provided risk factors if present; else default 0.2.

<pillar_scores>
${pillarScoresJson.trim()}
</pillar_scores>

<components>
${componentsJson.trim()}
</components>
${riskSection}`.trim();
};
