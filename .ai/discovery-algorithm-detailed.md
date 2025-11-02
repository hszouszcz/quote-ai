# 🧠 Project Discovery Algorithm - Detailed Specification

**Version**: 1.0
**Date**: October 27, 2025  
**Purpose**: Complete algorithmic specification for AI-driven project discovery system

---

## 📊 Overview

This document describes the complete algorithm for conducting an interactive, multi-turn conversation with a user to extract comprehensive project requirements that will be used for accurate software project estimation.

---

## 🎯 PHASE 1: INITIALIZATION

### Input

```typescript
interface InitializationInput {
  userId: string; // UUID of authenticated user
  initialDescription: string; // Raw project description (max 10,000 chars)
}
```

### Process

#### Step 1.1: Validate Input

```typescript
function validateInitialization(input: InitializationInput): ValidationResult {
  const errors: string[] = [];

  if (!input.userId || !isValidUUID(input.userId)) {
    errors.push("Invalid user ID");
  }

  if (!input.initialDescription || input.initialDescription.trim().length === 0) {
    errors.push("Initial description is required");
  }

  if (input.initialDescription.length > 10000) {
    errors.push("Description exceeds 10,000 character limit");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

#### Step 1.2: Create Discovery Session

```sql
INSERT INTO discovery_sessions (
  user_id,
  initial_description,
  status,
  current_round,
  created_at,
  updated_at
) VALUES (
  $userId,
  $initialDescription,
  'in_progress',
  1,
  NOW(),
  NOW()
) RETURNING id;
```

#### Step 1.3: Initialize Conversation History

```typescript
const systemPrompt = buildDiscoverySystemPrompt();
const conversationHistory: Message[] = [
  {
    role: "system",
    content: systemPrompt,
  },
];
```

### System Prompt (Phase 1)

```typescript
const DISCOVERY_SYSTEM_PROMPT =
  `You are an expert presales consultant conducting a discovery session with a client who wants to build custom software.

YOUR GOAL:
Extract maximum valuable information through MINIMUM number of strategic questions.

CRITICAL RULES:
1. Ask EXACTLY 5 questions per round (no more, no less)
2. Ask ONLY questions that unlock the most information
3. Use open-ended questions that encourage detailed answers
4. AVOID yes/no questions - prefer "How", "What", "Describe", "Explain"
5. Focus on areas that most impact estimation accuracy
6. Each question must be independent and clear
7. Provide context for WHY you're asking each question

INFORMATION CATEGORIES (Priority Order):
1. 🎯 basic_info (Weight: 30%)
   - Project goal and business purpose
   - Target audience (specific user types)
   - Product type (SaaS, mobile app, marketplace, internal tool, etc.)
   - Key features (most valuable )
   
2. 💻 tech_stack (Weight: 20%)
   - Preferred technologies/frameworks
   - Required technologies (client mandate)
   - Technology constraints (compliance, existing infrastructure)
   
3. 🔗 integrations (Weight: 15%)
   - External systems to connect with
   - Integration type (REST, GraphQL, webhook, SDK)
   - Criticality of each integration (Critical, Important, Nice-to-have)
   
4. 📈 scale (Weight: 10%)
   - Initial number of users (day 1)
   - Expected growth (year 1)
   - Performance requirements
   - Multi-tenancy needs
   
5. 🔒 compliance (Weight: 10%)
   - Regulatory requirements (GDPR, HIPAA, PCI-DSS, SOC2, ISO27001)
   - Security certifications needed
   - Audit requirements
   
6. 🏗️ assets (Weight: 10%)
   - Existing legacy systems
   - Available designs/mockups
   - Documentation (business requirements, technical specs)
   
7. 👥 delivery (Weight: 5%)
   - Client's internal team availability
   - Post-launch support level needed
   - Preferred methodology (Agile, Waterfall, Hybrid)

QUESTION SELECTION STRATEGY:
- Round 1: Focus on high-weight categories (basic_info, tech_stack)
- Round 2: Target gaps and follow up on Round 1 answers
- Round 3: Fill remaining critical gaps, clarify ambiguities

RESPONSE FORMAT:
You must return ONLY valid JSON (no markdown, no code fences):
{
  "questions": [
    {
      "question": "Can you describe the main business problem this platform solves?",
      "context": "Understanding the core business problem helps me assess domain complexity and identify similar reference projects",
      "category": "basic_info",
      "priority": 5
    },
    {
      "question": "What are your technology preferences or constraints?",
      "context": "Knowing technology constraints early helps me identify integration challenges and estimate more accurately",
      "category": "tech_stack",
      "priority": 4
    }
    // ... exactly 5 questions total
  ],
  "reasoning": "I'm starting with foundational questions about business purpose and technology constraints because these have the highest impact on overall project complexity and effort estimation.",
  "missing_categories": ["integrations", "scale", "compliance", "assets", "delivery"]
}

IMPORTANT:
- Return ONLY the JSON object
- No text before or after the JSON
- Ensure valid JSON syntax
- Always include exactly 5 questions
`.trim();

function buildDiscoverySystemPrompt(): string {
  return DISCOVERY_SYSTEM_PROMPT;
}
```

### User Prompt (Phase 1 - Initial Questions)

```typescript
function buildInitialQuestionPrompt(description: string, initialAnaltsisResult: string): string {
  return `The client provided this initial project description:

<project_description>
${description.trim()}
</project_description>

<initial_analysis_result>
${initialAnalysisResult.trin()}
</initial_analysis_result>

TASK:
Generate exactly 5 strategic questions that will extract the most critical missing information for accurate project estimation.

ANALYSIS GUIDELINES:
1. What is clearly stated in the description?
2. What is ambiguous or unclear?
3. What is already discovered in initial analysis? Are these information correct compared to description?
4. What critical information is completely missing?
5. Which missing information has highest impact on estimation?

QUESTION PRIORITIES:
- Priority 5: Critical for estimation (blocks progress if missing)
- Priority 4: Very important (significantly impacts accuracy)
- Priority 3: Important (moderately impacts accuracy)
- Priority 2: Helpful (minor impact on accuracy)
- Priority 1: Nice-to-have (minimal impact)

Focus questions on Priority 4-5 areas.

Return your response as JSON following the specified format.`.trim();
}
```

### Output (Phase 1)

```typescript
interface Phase1Output {
  sessionId: string; // UUID of created session
  round: 1; // Always 1 for initial phase
  questions: Question[]; // Exactly 5 questions
  reasoning: string; // AI's explanation of question selection
  missingCategories: string[]; // Categories not yet covered
}

interface Question {
  id: string; // UUID (generated when saved to DB)
  question: string; // The actual question text
  context: string; // Why AI is asking this
  category: QuestionCategory;
  priority: 1 | 2 | 3 | 4 | 5;
}

type QuestionCategory = "basic_info" | "tech_stack" | "integrations" | "scale" | "compliance" | "assets" | "delivery";
```

### Database Operations (Phase 1)

```sql
-- Save questions to database
INSERT INTO discovery_questions (
  session_id,
  round_number,
  question_text,
  context,
  category,
  priority,
  created_at
) VALUES
  ($sessionId, 1, $question1, $context1, $category1, $priority1, NOW()),
  ($sessionId, 1, $question2, $context2, $category2, $priority2, NOW()),
  ($sessionId, 1, $question3, $context3, $category3, $priority3, NOW()),
  ($sessionId, 1, $question4, $context4, $category4, $priority4, NOW()),
  ($sessionId, 1, $question5, $context5, $category5, $priority5, NOW())
RETURNING id;

-- Save AI's reasoning and questions to conversation log
INSERT INTO discovery_conversation_log (
  session_id,
  role,
  content,
  round_number,
  created_at
) VALUES (
  $sessionId,
  'ai',
  $aiResponseJSON,  -- Full JSON response from AI
  1,
  NOW()
);

-- Update session with reasoning
UPDATE discovery_sessions
SET
  current_reasoning = $reasoning,
  updated_at = NOW()
WHERE id = $sessionId;
```

---

## 💬 PHASE 2: ANSWER PROCESSING

### Input

```typescript
interface AnswerInput {
  sessionId: string;
  answers: Record<string, string>; // questionId -> answer text
}

// Example:
{
  sessionId: "uuid-123",
  answers: {
    "q-uuid-1": "We're building a SaaS platform for climbing gyms...",
    "q-uuid-2": "Main users are gym owners and members...",
    "q-uuid-3": "We prefer React and Node.js but open to suggestions...",
    "q-uuid-4": "We need to integrate with Stripe and Mindbody...",
    "q-uuid-5": "Expected to have 100 users at launch, 10k after 1 year..."
  }
}
```

### Process

#### Step 2.1: Validate Answers

```typescript
function validateAnswers(input: AnswerInput): ValidationResult {
  const errors: string[] = [];

  // Check session exists and is active
  const session = await getSession(input.sessionId);
  if (!session) {
    errors.push("Session not found");
  } else if (session.status !== "in_progress") {
    errors.push(`Session is ${session.status}, cannot accept answers`);
  }

  // Get questions for current round
  const questions = await getQuestionsByRound(input.sessionId, session.current_round);

  // Validate all questions are answered
  const answeredQuestionIds = Object.keys(input.answers);
  const expectedQuestionIds = questions.map((q) => q.id);

  const missingAnswers = expectedQuestionIds.filter((id) => !answeredQuestionIds.includes(id));

  if (missingAnswers.length > 0) {
    errors.push(`Missing answers for questions: ${missingAnswers.join(", ")}`);
  }

  // Validate answer length
  Object.entries(input.answers).forEach(([qId, answer]) => {
    if (!answer || answer.trim().length === 0) {
      errors.push(`Empty answer for question ${qId}`);
    }
    if (answer.length > 5000) {
      errors.push(`Answer for ${qId} exceeds 5000 character limit`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

#### Step 2.2: Save Answers to Database

```sql
-- Update each question with its answer
UPDATE discovery_questions
SET
  answer = $answer,
  answered_at = NOW()
WHERE id = $questionId;

-- Log user's answers to conversation history
INSERT INTO discovery_conversation_log (
  session_id,
  role,
  content,
  round_number,
  created_at
) VALUES (
  $sessionId,
  'user',
  $answersJSON,  -- JSON with all Q&A pairs
  $currentRound,
  NOW()
);
```

#### Step 2.3: Add Answers to Conversation Context

```typescript
function formatAnswersForAI(questions: Question[], answers: Record<string, string>): string {
  const formattedQA = questions
    .map((q) => {
      return `Q: ${q.question}\nA: ${answers[q.id] || "[No answer]"}`;
    })
    .join("\n\n");

  return formattedQA;
}

// Add to conversation history
conversationHistory.push({
  role: "human",
  content: formatAnswersForAI(questions, answers),
});
```

---

## 📊 PHASE 3: COMPLETENESS ANALYSIS

### Process

#### Step 3.1: Build Analysis Prompt

```typescript
const COMPLETENESS_ANALYSIS_PROMPT =
  `Based on the conversation so far, analyze the completeness of gathered information.

SCORING GUIDELINES:
- Each category has a weight (see system prompt for weights)
- Score each category from 0-100% based on:
  * 0%: No information gathered
  * 25%: Minimal information (1-2 basic answers)
  * 50%: Partial information (some key aspects covered)
  * 75%: Good coverage (most important aspects covered)
  * 100%: Complete coverage (all aspects thoroughly covered)

CATEGORY WEIGHTS:
- basic_info: 30%
- tech_stack: 20%
- integrations: 15%
- scale: 10%
- compliance: 10%
- assets: 10%
- delivery: 5%

OVERALL SCORE CALCULATION:
completeness_score = Σ(category_score × category_weight)

READINESS CRITERIA:
Set ready_for_estimation = true IF:
- Overall completeness_score ≥ 70%, AND
- basic_info ≥ 75%, AND
- tech_stack ≥ 50%, AND
- At least 4 out of 7 categories have some coverage (>25%)

RESPONSE FORMAT (valid JSON only):
{
  "completeness_score": 65,
  "category_scores": {
    "basic_info": 80,
    "tech_stack": 60,
    "integrations": 50,
    "scale": 40,
    "compliance": 0,
    "assets": 75,
    "delivery": 25
  },
  "collected_info": {
    "basic_info": {
      "goal": "SaaS platform for climbing gyms",
      "audience": ["gym owners", "gym members"],
      "type": "SaaS platform"
    },
    "tech_stack": {
      "preferred": ["React", "Node.js"],
      "required": [],
      "constraints": ["Must work on mobile browsers"]
    },
    "integrations": [
      { "system": "Stripe", "type": "REST", "criticality": "Critical" },
      { "system": "Mindbody", "type": "REST", "criticality": "Important" }
    ],
    "scale": {
      "initial_users": "100",
      "year_one_users": "10000",
      "performance_requirements": [],
      "multi_tenant": true
    },
    "compliance": [],
    "assets": {
      "has_legacy_system": false,
      "has_designs": true,
      "has_documentation": false
    },
    "delivery": {}
  },
  "missing_critical_info": [
    "No compliance requirements specified - ask if GDPR/HIPAA applies",
    "Performance requirements unclear - ask about response time expectations",
    "Support level after launch not discussed"
  ],
  "recommendations": [
    "Clarify payment flow details (one-time vs subscription)",
    "Ask about admin dashboard requirements",
    "Understand user authentication preferences"
  ],
  "ready_for_estimation": false,
  "reasoning": "While we have good coverage of basic info and integrations, we're missing critical compliance information and detailed technical requirements. One more round of questions should get us to 70%+ completeness."
}`.trim();

function buildCompletenessAnalysisPrompt(): string {
  return COMPLETENESS_ANALYSIS_PROMPT;
}
```

#### Step 3.2: Invoke AI for Analysis

```typescript
async function analyzeCompleteness(conversationHistory: Message[]): Promise<CompletenessAnalysis> {
  const response = await aiAgent.invoke(
    [
      ...conversationHistory,
      {
        role: "human",
        content: buildCompletenessAnalysisPrompt(),
      },
    ],
    {
      response_format: { type: "json_object" },
    }
  );

  const parsed = JSON.parse(response.content);
  return CompletenessAnalysisSchema.parse(parsed);
}
```

#### Step 3.3: Save Analysis to Database

```sql
UPDATE discovery_sessions
SET
  completeness_score = $completenessScore,
  updated_at = NOW()
WHERE id = $sessionId;
```

### Output (Phase 3)

```typescript
interface CompletenessAnalysis {
  completeness_score: number; // 0-100
  category_scores: Record<QuestionCategory, number>;
  collected_info: CollectedInformation;
  missing_critical_info: string[];
  recommendations: string[];
  ready_for_estimation: boolean;
  reasoning: string;
}

interface CollectedInformation {
  basic_info?: {
    goal?: string;
    audience?: string[];
    type?: string;
  };
  tech_stack?: {
    preferred?: string[];
    required?: string[];
    constraints?: string[];
  };
  integrations?: Integration[];
  scale?: ScaleExpectations;
  compliance?: ComplianceRequirement[];
  assets?: ExistingAssets;
  delivery?: DeliveryContext;
}
```

---

## 🔄 PHASE 4: DECISION - CONTINUE OR COMPLETE

### Decision Algorithm

```typescript
async function decideContinueOrComplete(session: DiscoverySession, analysis: CompletenessAnalysis): Promise<Decision> {
  // CASE 1: Maximum rounds reached
  if (session.current_round >= 3) {
    return {
      action: "COMPLETE",
      reason: "Maximum rounds (3) reached",
    };
  }

  // CASE 2: High completeness score
  if (analysis.ready_for_estimation) {
    return {
      action: "COMPLETE",
      reason: `Completeness score ${analysis.completeness_score}% meets threshold (≥70%)`,
    };
  }

  // CASE 3: Minimal progress (avoid infinite loop)
  if (session.current_round >= 2) {
    const previousScore = await getPreviousCompletenessScore(session.id);
    const improvement = analysis.completeness_score - previousScore;

    if (improvement < 10) {
      return {
        action: "COMPLETE",
        reason: "Minimal progress in last round (< 10% improvement)",
      };
    }
  }

  // CASE 4: Continue with next round
  return {
    action: "CONTINUE",
    reason: `More information needed (current: ${analysis.completeness_score}%, target: 70%)`,
  };
}
```

---

## ➡️ PHASE 5: GENERATE FOLLOW-UP QUESTIONS

### Conditions

- Only execute if `decideContinueOrComplete()` returns `CONTINUE`
- Current round < 3

### Process

#### Step 5.1: Build Follow-Up Prompt

```typescript
function buildFollowUpPrompt(analysis: CompletenessAnalysis): string {
  return `CURRENT COMPLETENESS: ${analysis.completeness_score}%

CATEGORY COVERAGE:
${Object.entries(analysis.category_scores)
  .map(([cat, score]) => `- ${cat}: ${score}%`)
  .join("\n")}

MISSING CRITICAL INFORMATION:
${analysis.missing_critical_info.map((info, i) => `${i + 1}. ${info}`).join("\n")}

RECOMMENDATIONS FOR NEXT QUESTIONS:
${analysis.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join("\n")}

TASK:
Generate exactly 5 follow-up questions that address the most critical gaps in our understanding.

PRIORITIZATION STRATEGY:
1. Focus on categories with lowest scores (especially if < 50%)
2. Address items in "missing_critical_info" list
3. Follow up on vague or incomplete answers from previous rounds
4. Avoid repeating questions already answered
5. Ask questions that unlock multiple pieces of information

QUESTION QUALITY CRITERIA:
- Specific and actionable (avoid generic questions)
- Open-ended (encourage detailed answers)
- Build on previous answers when relevant
- Clear and easy to understand
- Each question targets a different aspect

Return JSON following the standard question format with exactly 5 questions.`.trim();
}
```

#### Step 5.2: Invoke AI for Follow-Up Questions

```typescript
async function generateFollowUpQuestions(
  conversationHistory: Message[],
  analysis: CompletenessAnalysis,
  currentRound: number
): Promise<QuestionSet> {
  const followUpPrompt = buildFollowUpPrompt(analysis);

  const response = await aiAgent.invoke(
    [
      ...conversationHistory,
      {
        role: "human",
        content: followUpPrompt,
      },
    ],
    {
      response_format: { type: "json_object" },
    }
  );

  const parsed = JSON.parse(response.content);
  const validated = QuestionSetSchema.parse(parsed);

  return validated;
}
```

#### Step 5.3: Save Follow-Up Questions

```sql
-- Increment round number
UPDATE discovery_sessions
SET
  current_round = current_round + 1,
  current_reasoning = $newReasoning,
  updated_at = NOW()
WHERE id = $sessionId;

-- Insert new questions
INSERT INTO discovery_questions (
  session_id,
  round_number,
  question_text,
  context,
  category,
  priority,
  created_at
) VALUES
  ($sessionId, $nextRound, $q1, $ctx1, $cat1, $pri1, NOW()),
  ($sessionId, $nextRound, $q2, $ctx2, $cat2, $pri2, NOW()),
  ($sessionId, $nextRound, $q3, $ctx3, $cat3, $pri3, NOW()),
  ($sessionId, $nextRound, $q4, $ctx4, $cat4, $pri4, NOW()),
  ($sessionId, $nextRound, $q5, $ctx5, $cat5, $pri5, NOW());

-- Log to conversation
INSERT INTO discovery_conversation_log (
  session_id,
  role,
  content,
  round_number,
  created_at
) VALUES (
  $sessionId,
  'ai',
  $questionsJSON,
  $nextRound,
  NOW()
);
```

### Output (Phase 5)

```typescript
interface Phase5Output {
  sessionId: string;
  round: number; // 2 or 3
  questions: Question[]; // Exactly 5 new questions
  reasoning: string;
  completenessScore: number; // Current score
  discoveryComplete: false; // Always false in this phase
}
```

---

## ✅ PHASE 6: FINAL EXTRACTION

### Conditions

- Only execute when `decideContinueOrComplete()` returns `COMPLETE`

### Process

#### Step 6.1: Build Final Extraction Prompt

```typescript
const FINAL_EXTRACTION_PROMPT =
  `Based on the entire discovery conversation, extract ALL gathered information into a comprehensive project analysis.

TASK:
Create a complete, structured summary of the project that will be used for detailed estimation.

EXTRACTION GUIDELINES:
1. Synthesize information from all rounds
2. Fill in fields where you have explicit answers
3. Use reasonable defaults for common scenarios when information wasn't provided
4. Mark truly unknown items as empty arrays or null
5. Resolve any contradictions in user's answers (use latest information)
6. Expand abbreviations and clarify vague statements

REQUIRED OUTPUT FORMAT (valid JSON):
{
  "goal": "Clear, concise project goal (1-2 sentences)",
  "target_audience": ["Specific user type 1", "Specific user type 2"],
  "type": "Product type: SaaS / Mobile App / Web App / Marketplace / Internal Tool / etc.",
  
  "key_features": {
    "Category 1 (e.g., User Management)": [
      "Feature 1 (be specific)",
      "Feature 2"
    ],
    "Category 2 (e.g., Core Functionality)": [
      "Feature 3",
      "Feature 4"
    ]
  },
  
  "non_functional": [
    "Non-functional requirement 1 (performance, security, scalability)",
    "Non-functional requirement 2"
  ],
  
  "open_questions": [
    "Unresolved question 1",
    "Unresolved question 2"
  ],
  
  "technology_stack": {
    "preferred": ["Tech 1", "Tech 2"],
    "required": ["Tech 3"],
    "constraints": ["Constraint 1"]
  },
  
  "integrations": [
    {
      "system": "System Name",
      "type": "REST" | "GraphQL" | "Webhook" | "SDK" | "Database" | "Other",
      "criticality": "Critical" | "Important" | "Nice-to-have"
    }
  ],
  
  "scale_expectations": {
    "initial_users": "Number or range (e.g., '100-500')",
    "year_one_users": "Number or range (e.g., '5000-10000')",
    "performance_requirements": ["Requirement 1", "Requirement 2"],
    "multi_tenant": true | false
  },
  
  "existing_assets": {
    "has_legacy_system": true | false,
    "has_designs": true | false,
    "has_documentation": true | false,
    "details": ["Detail 1", "Detail 2"]
  },
  
  "compliance": ["GDPR", "HIPAA", "PCI-DSS", "SOC2", "ISO27001"] | ["None"],
  
  "delivery_context": {
    "client_has_team": true | false,
    "support_level": "None" | "Basic" | "Full",
    "methodology": "Agile" | "Waterfall" | "Hybrid"
  }
}

IMPORTANT:
- Be thorough but concise
- Use user's language and terminology
- Ensure all fields are present (use null/empty for missing data)
- Validate JSON syntax
- No code fences, no markdown, just JSON`.trim();

function buildFinalExtractionPrompt(): string {
  return FINAL_EXTRACTION_PROMPT;
}
```

#### Step 6.2: Invoke AI for Final Extraction

```typescript
async function extractFinalAnalysis(conversationHistory: Message[]): Promise<EnhancedProjectAnalysis> {
  const response = await aiAgent.invoke(
    [
      ...conversationHistory,
      {
        role: "human",
        content: buildFinalExtractionPrompt(),
      },
    ],
    {
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for consistent extraction
      max_tokens: 4000, // Allow comprehensive response
    }
  );

  const parsed = JSON.parse(response.content);

  // Validate against comprehensive schema
  const validated = EnhancedProjectAnalysisSchema.parse(parsed);

  return validated;
}
```

#### Step 6.3: Save Final Analysis & Complete Session

```sql
-- Save final analysis to session
UPDATE discovery_sessions
SET
  status = 'completed',
  final_analysis = $finalAnalysisJSON,
  completed_at = NOW(),
  updated_at = NOW()
WHERE id = $sessionId;

-- Log final extraction to conversation
INSERT INTO discovery_conversation_log (
  session_id,
  role,
  content,
  round_number,
  created_at
) VALUES (
  $sessionId,
  'ai',
  $finalAnalysisJSON,
  NULL,  -- Not part of Q&A rounds
  NOW()
);
```

### Output (Phase 6)

```typescript
interface Phase6Output {
  sessionId: string;
  discoveryComplete: true;
  completenessScore: number;
  finalAnalysis: EnhancedProjectAnalysis;
}

interface EnhancedProjectAnalysis {
  // Core fields
  goal: string;
  target_audience: string[];
  type: string;
  key_features: Record<string, string[]>;
  non_functional: string[];
  open_questions: string[];

  // Extended fields
  technology_stack?: {
    preferred?: string[];
    required?: string[];
    constraints?: string[];
  };

  integrations?: Array<{
    system: string;
    type: "REST" | "GraphQL" | "Webhook" | "SDK" | "Database" | "Other";
    criticality: "Critical" | "Important" | "Nice-to-have";
  }>;

  scale_expectations?: {
    initial_users?: string;
    year_one_users?: string;
    performance_requirements?: string[];
    multi_tenant?: boolean;
  };

  existing_assets?: {
    has_legacy_system: boolean;
    has_designs: boolean;
    has_documentation: boolean;
    details?: string[];
  };

  compliance?: Array<"GDPR" | "HIPAA" | "PCI-DSS" | "SOC2" | "ISO27001" | "None">;

  delivery_context?: {
    client_has_team?: boolean;
    support_level?: "None" | "Basic" | "Full";
    methodology?: "Agile" | "Waterfall" | "Hybrid";
  };
}
```

---

## 🔁 COMPLETE ALGORITHM FLOW

```typescript
async function runDiscoverySession(userId: string, initialDescription: string): Promise<DiscoveryResult> {
  // ========== PHASE 1: INITIALIZATION ==========
  const validation = validateInitialization({ userId, initialDescription });
  if (!validation.valid) {
    throw new ValidationError(validation.errors);
  }

  const sessionId = await createSession(userId, initialDescription);
  const conversationHistory: Message[] = [{ role: "system", content: buildDiscoverySystemPrompt() }];

  const initialPrompt = buildInitialQuestionPrompt(initialDescription);
  const round1Questions = await generateQuestions(conversationHistory, initialPrompt);

  await saveQuestions(sessionId, 1, round1Questions);
  conversationHistory.push({
    role: "ai",
    content: JSON.stringify(round1Questions),
  });

  // Return to user - wait for answers
  return {
    sessionId,
    round: 1,
    questions: round1Questions.questions,
    reasoning: round1Questions.reasoning,
    status: "awaiting_answers",
  };
}

async function processAnswersAndContinue(sessionId: string, answers: Record<string, string>): Promise<DiscoveryResult> {
  // ========== PHASE 2: ANSWER PROCESSING ==========
  const validation = validateAnswers({ sessionId, answers });
  if (!validation.valid) {
    throw new ValidationError(validation.errors);
  }

  await saveAnswers(sessionId, answers);

  const session = await getSession(sessionId);
  const conversationHistory = await loadConversationHistory(sessionId);

  // Add answers to context
  const formattedAnswers = formatAnswersForAI(await getCurrentRoundQuestions(sessionId), answers);
  conversationHistory.push({
    role: "human",
    content: formattedAnswers,
  });

  // ========== PHASE 3: COMPLETENESS ANALYSIS ==========
  const analysis = await analyzeCompleteness(conversationHistory);
  await saveCompletenessScore(sessionId, analysis.completeness_score);

  // ========== PHASE 4: DECISION ==========
  const decision = await decideContinueOrComplete(session, analysis);

  if (decision.action === "COMPLETE") {
    // ========== PHASE 6: FINAL EXTRACTION ==========
    const finalAnalysis = await extractFinalAnalysis(conversationHistory);
    await markSessionComplete(sessionId, finalAnalysis);

    return {
      sessionId,
      discoveryComplete: true,
      completenessScore: analysis.completeness_score,
      finalAnalysis,
      reason: decision.reason,
    };
  }

  // ========== PHASE 5: GENERATE FOLLOW-UP ==========
  const nextRound = session.current_round + 1;
  const followUpQuestions = await generateFollowUpQuestions(conversationHistory, analysis, nextRound);

  await saveQuestions(sessionId, nextRound, followUpQuestions);
  await incrementRound(sessionId, followUpQuestions.reasoning);

  conversationHistory.push({
    role: "ai",
    content: JSON.stringify(followUpQuestions),
  });

  return {
    sessionId,
    round: nextRound,
    questions: followUpQuestions.questions,
    reasoning: followUpQuestions.reasoning,
    completenessScore: analysis.completeness_score,
    discoveryComplete: false,
    status: "awaiting_answers",
  };
}
```

---

## 📐 COMPLETENESS SCORING FORMULA

```typescript
function calculateCompletenessScore(categoryScores: Record<QuestionCategory, number>): number {
  const weights: Record<QuestionCategory, number> = {
    basic_info: 0.3,
    tech_stack: 0.2,
    integrations: 0.15,
    scale: 0.1,
    compliance: 0.1,
    assets: 0.1,
    delivery: 0.05,
  };

  let totalScore = 0;

  for (const [category, score] of Object.entries(categoryScores)) {
    const weight = weights[category as QuestionCategory];
    totalScore += score * weight;
  }

  return Math.round(totalScore);
}

function scoreCategoryCompleteness(category: QuestionCategory, collectedInfo: any): number {
  // Scoring rubric for each category
  const scoringRules: Record<QuestionCategory, (info: any) => number> = {
    basic_info: (info) => {
      let score = 0;
      if (info.goal && info.goal.length > 20) score += 40;
      if (info.audience && info.audience.length >= 2) score += 30;
      if (info.type) score += 30;
      return Math.min(score, 100);
    },

    tech_stack: (info) => {
      let score = 0;
      if (info.preferred && info.preferred.length > 0) score += 40;
      if (info.required && info.required.length > 0) score += 30;
      if (info.constraints && info.constraints.length > 0) score += 30;
      return Math.min(score, 100);
    },

    integrations: (info) => {
      if (!info || info.length === 0) return 0;

      let score = 0;
      // Has at least one integration
      if (info.length >= 1) score += 50;
      // All integrations have criticality defined
      if (info.every((i) => i.criticality)) score += 30;
      // Integration types specified
      if (info.every((i) => i.type)) score += 20;
      return Math.min(score, 100);
    },

    scale: (info) => {
      let score = 0;
      if (info.initial_users) score += 30;
      if (info.year_one_users) score += 30;
      if (info.performance_requirements && info.performance_requirements.length > 0) score += 20;
      if (info.multi_tenant !== undefined) score += 20;
      return Math.min(score, 100);
    },

    compliance: (info) => {
      if (!info || info.length === 0) return 0;
      if (info.includes("None")) return 100; // Explicitly stated no compliance
      if (info.length >= 1) return 100; // Has compliance requirements
      return 0;
    },

    assets: (info) => {
      let score = 0;
      if (info.has_legacy_system !== undefined) score += 25;
      if (info.has_designs !== undefined) score += 25;
      if (info.has_documentation !== undefined) score += 25;
      if (info.details && info.details.length > 0) score += 25;
      return Math.min(score, 100);
    },

    delivery: (info) => {
      let score = 0;
      if (info.client_has_team !== undefined) score += 40;
      if (info.support_level) score += 30;
      if (info.methodology) score += 30;
      return Math.min(score, 100);
    },
  };

  const scoringFunction = scoringRules[category];
  return scoringFunction(collectedInfo);
}
```

---

## 🎯 EXAMPLE: COMPLETE FLOW

### Round 1

**User Input**: "I want to build a platform for climbing gyms"

**AI Questions**:

1. Can you describe the main business problem this platform solves and who will use it?
2. What are the core features you envision for gym owners and customers?
3. Do you have any technology preferences or constraints we should know about?
4. Are there any existing systems you need to integrate with?
5. What's your expected timeline and do you have a team that can help with development?

**User Answers**:

1. "We want to help climbing gyms manage bookings, memberships, and customer engagement. Users are gym owners (admins) and gym members (customers)."
2. "Gym owners need a dashboard to manage classes, track attendance, and handle payments. Customers need a mobile-friendly interface to book classes, track progress, and manage memberships."
3. "We prefer modern web technologies, our team knows React. Must work on mobile browsers."
4. "Yes, we need Stripe for payments and Mindbody for scheduling integration."
5. "Launch in 6 months. We have a small internal team (2 developers) who can help with frontend."

**Completeness After Round 1**: 55%

- basic_info: 80%
- tech_stack: 60%
- integrations: 70%
- scale: 20%
- compliance: 0%
- assets: 50%
- delivery: 60%

**Decision**: CONTINUE (score < 70%)

### Round 2

**AI Questions** (adapted based on Round 1):

1. How many gyms do you expect to onboard initially and within the first year?
2. What are your specific requirements for the Mindbody integration - what data needs to sync?
3. Will you be handling sensitive personal or payment data that requires compliance certifications like GDPR or PCI-DSS?
4. Do you have existing designs or wireframes for the platform?
5. What level of performance do you expect - how many concurrent users should the system handle?

**User Answers**:

1. "Start with 5 gyms (pilot), grow to 50 gyms in year 1. Each gym has 200-500 members."
2. "We need to sync class schedules and availability from Mindbody, bookings made on our platform should update Mindbody."
3. "Yes, we're in EU so GDPR compliance is required. Stripe handles PCI compliance but we need to follow best practices."
4. "Yes, we have Figma designs for main user flows - booking, profile, admin dashboard."
5. "Need to handle 100-200 concurrent users during peak hours (evenings). Page load under 2 seconds."

**Completeness After Round 2**: 78%

- basic_info: 85%
- tech_stack: 70%
- integrations: 85%
- scale: 80%
- compliance: 100%
- assets: 75%
- delivery: 65%

**Decision**: COMPLETE (score ≥ 70%, basic_info ≥ 75%, tech_stack ≥ 50%)

### Final Analysis

```json
{
  "goal": "Multi-tenant SaaS platform to help climbing gyms manage bookings, memberships, and customer engagement",
  "target_audience": ["Gym owners/administrators", "Gym members/customers"],
  "type": "SaaS Platform",
  "key_features": {
    "Booking & Scheduling": [
      "Class booking for customers",
      "Schedule management for gym owners",
      "Attendance tracking",
      "Mindbody integration for schedule sync"
    ],
    "Membership Management": [
      "Membership plans and subscriptions",
      "Customer profile management",
      "Progress tracking for members"
    ],
    "Payments": ["Stripe integration for payments", "Subscription billing", "Payment history and invoices"],
    "Admin Dashboard": ["Multi-gym management", "Analytics and reporting", "User management"]
  },
  "non_functional": [
    "Mobile-responsive design",
    "Support 100-200 concurrent users",
    "Page load time under 2 seconds",
    "GDPR compliant data handling",
    "PCI-DSS best practices for payment data"
  ],
  "open_questions": [
    "Specific analytics/reporting requirements for gym owners",
    "Social features for members (leaderboards, challenges)?",
    "Offline mode capability for the mobile interface"
  ],
  "technology_stack": {
    "preferred": ["React", "Modern web technologies"],
    "required": ["Mobile browser compatibility"],
    "constraints": ["Must integrate with Stripe and Mindbody APIs"]
  },
  "integrations": [
    {
      "system": "Stripe",
      "type": "REST",
      "criticality": "Critical"
    },
    {
      "system": "Mindbody",
      "type": "REST",
      "criticality": "Critical"
    }
  ],
  "scale_expectations": {
    "initial_users": "5 gyms, 1000-2500 total users",
    "year_one_users": "50 gyms, 10000-25000 total users",
    "performance_requirements": ["100-200 concurrent users during peak hours", "Page load time < 2 seconds"],
    "multi_tenant": true
  },
  "existing_assets": {
    "has_legacy_system": false,
    "has_designs": true,
    "has_documentation": false,
    "details": ["Figma designs for booking flow, user profile, admin dashboard"]
  },
  "compliance": ["GDPR"],
  "delivery_context": {
    "client_has_team": true,
    "support_level": "Full",
    "methodology": "Agile"
  }
}
```

---

## 🔧 ERROR HANDLING

### Validation Errors

```typescript
class ValidationError extends Error {
  constructor(public errors: string[]) {
    super(`Validation failed: ${errors.join(", ")}`);
  }
}
```

### AI Response Errors

```typescript
async function invokeWithRetry(messages: Message[], maxRetries = 3): Promise<AIResponse> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await aiAgent.invoke(messages);
      return response;
    } catch (error) {
      if (attempt === maxRetries) throw error;

      console.warn(`AI invocation failed (attempt ${attempt}), retrying...`);
      await sleep(1000 * attempt); // Exponential backoff
    }
  }
}
```

### Session State Errors

```typescript
async function getSession(sessionId: string): Promise<DiscoverySession> {
  const session = await db.query("SELECT * FROM discovery_sessions WHERE id = $1", [sessionId]);

  if (!session) {
    throw new SessionNotFoundError(sessionId);
  }

  return session;
}
```

---

## 📊 METRICS & MONITORING

### Track These Metrics

```typescript
interface DiscoveryMetrics {
  // User engagement
  sessions_started: number;
  sessions_completed: number;
  sessions_abandoned: number;
  completion_rate: number; // completed / started

  // Question metrics
  avg_questions_per_session: number;
  avg_answer_length: number;
  most_common_categories: QuestionCategory[];

  // Completeness metrics
  avg_completeness_score: number;
  avg_score_by_round: Record<number, number>;

  // Performance metrics
  avg_session_duration_minutes: number;
  avg_ai_response_time_ms: number;

  // Quality metrics
  sessions_with_all_categories_covered: number;
  sessions_ready_after_round_1: number;
  sessions_ready_after_round_2: number;
  sessions_requiring_round_3: number;
}
```

---

## 🎬 CONCLUSION

This algorithm provides a complete, deterministic specification for the Project Discovery system. Key characteristics:

1. **Structured** - Clear phases with defined inputs/outputs
2. **Adaptive** - Questions adapt based on previous answers
3. **Bounded** - Maximum 3 rounds, 5 questions each
4. **Scored** - Objective completeness measurement
5. **Complete** - Comprehensive final analysis with 7 information categories

The system balances **information gathering efficiency** with **user experience**, ensuring we extract maximum value from minimum user effort.
