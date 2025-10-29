# 🎯 Project Discovery Phase - Implementation Plan

**Date**: October 27, 2025  
**Status**: Planning Phase  
**Goal**: Implement interactive AI-driven project discovery system with multi-turn conversation

---

## 📋 Executive Summary

Based on our conversation, we're implementing a sophisticated project discovery system that:

1. **Replaces single-shot analysis** with an interactive, multi-turn conversation
2. **Asks strategic questions** (max 5 per round, max 2 rounds = 10 questions total)
3. **Adapts dynamically** - next questions depend on previous answers
4. **Maximizes information extraction** while minimizing user effort
5. **Enriches project analysis** with 7 critical categories:
   - Basic Info (goal, audience, type)
   - Technology Stack (preferred, required, constraints)
   - Integrations (external systems, APIs, criticality)
   - Scale & Performance (users, performance, multi-tenancy)
   - Compliance (GDPR, HIPAA, security)
   - Existing Assets (legacy, designs, documentation)
   - Delivery Context (team, support, methodology)

---

## 🗄️ Database Schema Changes

### New Tables

#### 1. `discovery_sessions` - Main Discovery Session

```sql
CREATE TABLE discovery_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Initial project description from user
    initial_description TEXT NOT NULL CHECK (char_length(initial_description) <= 10000),
    
    -- Session state
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress' 
        CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    current_round INTEGER NOT NULL DEFAULT 1 CHECK (current_round BETWEEN 1 AND 3),
    completeness_score INTEGER CHECK (completeness_score BETWEEN 0 AND 100),
    
    -- AI reasoning for question selection
    current_reasoning TEXT,
    
    -- Final analysis result (populated when complete)
    final_analysis JSONB,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_discovery_sessions_user_id ON discovery_sessions(user_id);
CREATE INDEX idx_discovery_sessions_status ON discovery_sessions(status);
CREATE INDEX idx_discovery_sessions_created_at ON discovery_sessions(created_at);

-- RLS Policies
ALTER TABLE discovery_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can view own discovery sessions" ON discovery_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users can create own discovery sessions" ON discovery_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own discovery sessions" ON discovery_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users can delete own discovery sessions" ON discovery_sessions
    FOR DELETE USING (auth.uid() = user_id);
```

#### 2. `discovery_questions` - Questions Asked by AI

```sql
CREATE TABLE discovery_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES discovery_sessions(id) ON DELETE CASCADE,
    
    -- Question details
    round_number INTEGER NOT NULL CHECK (round_number BETWEEN 1 AND 3),
    question_text TEXT NOT NULL,
    context TEXT, -- Why AI is asking this question
    category VARCHAR(50) NOT NULL 
        CHECK (category IN (
            'basic_info',
            'tech_stack',
            'integrations',
            'scale',
            'compliance',
            'assets',
            'delivery'
        )),
    priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
    
    -- Answer
    answer TEXT,
    answered_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_discovery_questions_session_id ON discovery_questions(session_id);
CREATE INDEX idx_discovery_questions_category ON discovery_questions(category);
CREATE INDEX idx_discovery_questions_round ON discovery_questions(round_number);

-- RLS Policies
ALTER TABLE discovery_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can view own discovery questions" ON discovery_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM discovery_sessions ds
            WHERE ds.id = session_id
            AND ds.user_id = auth.uid()
        )
    );

CREATE POLICY "users can manage own discovery questions" ON discovery_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM discovery_sessions ds
            WHERE ds.id = session_id
            AND ds.user_id = auth.uid()
        )
    );
```

#### 3. `discovery_conversation_log` - Complete Conversation History

```sql
CREATE TABLE discovery_conversation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES discovery_sessions(id) ON DELETE CASCADE,
    
    -- Message details
    role VARCHAR(20) NOT NULL CHECK (role IN ('system', 'ai', 'user')),
    content TEXT NOT NULL,
    round_number INTEGER CHECK (round_number BETWEEN 1 AND 3),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_conversation_log_session_id ON discovery_conversation_log(session_id);
CREATE INDEX idx_conversation_log_created_at ON discovery_conversation_log(created_at);

-- RLS Policies
ALTER TABLE discovery_conversation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can view own conversation log" ON discovery_conversation_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM discovery_sessions ds
            WHERE ds.id = session_id
            AND ds.user_id = auth.uid()
        )
    );

CREATE POLICY "users can manage own conversation log" ON discovery_conversation_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM discovery_sessions ds
            WHERE ds.id = session_id
            AND ds.user_id = auth.uid()
        )
    );
```

### Modified Tables

#### 4. Extend `quotations` table with discovery reference

```sql
-- Add column to link quotation with discovery session
ALTER TABLE quotations 
ADD COLUMN discovery_session_id UUID REFERENCES discovery_sessions(id) ON DELETE SET NULL;

-- Add index
CREATE INDEX idx_quotations_discovery_session ON quotations(discovery_session_id);

-- Update dynamic_attributes structure to include extended analysis fields
COMMENT ON COLUMN quotations.dynamic_attributes IS 
'Extended project analysis including: technology_stack, integrations, scale_expectations, existing_assets, compliance, delivery_context';
```

---

## 🏗️ Implementation Architecture

### Phase 1: Database Setup
- [x] Design schema (this document)
- [x] Create migration file: `20250128000000_add_discovery_system.sql`
- [x] Apply migration to Supabase
- [x] Update TypeScript types in `src/db/database.types.ts`

### Phase 2: Backend Services

#### 2.1 Create `ProjectDiscoveryService`
**File**: `src/lib/services/langchain/projectDiscovery.service.ts`

**Responsibilities**:
- Initialize discovery session
- Generate strategic questions (5 per round, max 2 rounds)
- Process user answers
- Evaluate completeness score
- Determine if ready for estimation
- Extract final comprehensive analysis

**Key Methods**:
```typescript
class ProjectDiscoveryService {
  async startDiscovery(userId: string, description: string): Promise<{
    sessionId: string;
    questions: Question[];
    reasoning: string;
  }>;
  
  async processAnswers(sessionId: string, answers: Record<string, string>): Promise<{
    nextQuestions?: Question[];
    reasoning?: string;
    discoveryComplete: boolean;
    completenessScore?: number;
    result?: DiscoveryResult;
  }>;
  
  async extractFinalAnalysis(sessionId: string): Promise<EnhancedProjectAnalysis>;
  
  async getSession(sessionId: string): Promise<DiscoverySession>;
  
  async abandonSession(sessionId: string): Promise<void>;
}
```

#### 2.2 Update `ProjectAnalysisService`
**File**: `src/lib/services/langchain/projectAnalysis.service.ts`

**Changes**:
- Accept enriched input from discovery
- Support extended schema with 7 categories
- Validate against `EnhancedProjectAnalysisSchema`

#### 2.3 Database Service Layer
**File**: `src/lib/services/discovery.db.service.ts`

**Responsibilities**:
- CRUD operations for discovery tables
- Transaction management
- Session state management
- Conversation history persistence

### Phase 3: API Endpoints

#### 3.1 `POST /api/discovery/start`
**Purpose**: Initialize new discovery session

**Request**:
```json
{
  "description": "Initial project description..."
}
```

**Response**:
```json
{
  "sessionId": "uuid",
  "questions": [
    {
      "id": "uuid",
      "question": "Can you describe the main business problem...",
      "context": "This helps me understand domain complexity",
      "category": "basic_info",
      "priority": 5
    }
  ],
  "reasoning": "I'm starting with high-level questions to understand...",
  "round": 1
}
```

#### 3.2 `POST /api/discovery/answer`
**Purpose**: Submit answers and get next questions or completion

**Request**:
```json
{
  "sessionId": "uuid",
  "answers": {
    "question-uuid-1": "We need a SaaS platform for...",
    "question-uuid-2": "Primary users are gym owners and members..."
  }
}
```

**Response (More Questions)**:
```json
{
  "complete": false,
  "nextQuestions": [...],
  "reasoning": "Based on your answers, I need to clarify...",
  "round": 2,
  "completenessScore": 45
}
```

**Response (Complete)**:
```json
{
  "complete": true,
  "completenessScore": 85,
  "analysis": {
    "goal": "...",
    "target_audience": [...],
    "technology_stack": {...},
    "integrations": [...],
    // ... full enhanced analysis
  }
}
```

#### 3.3 `GET /api/discovery/session/:id`
**Purpose**: Retrieve session state and history

**Response**:
```json
{
  "id": "uuid",
  "status": "in_progress",
  "currentRound": 2,
  "completenessScore": 65,
  "questions": [...],
  "conversationHistory": [...]
}
```

#### 3.4 `DELETE /api/discovery/session/:id`
**Purpose**: Abandon/cancel discovery session

### Phase 4: Frontend Components

#### 4.1 `ProjectDiscoveryWizard` (Main Component)
**File**: `src/components/discovery/ProjectDiscoveryWizard.tsx`

**Features**:
- Step 1: Initial description input
- Step 2: Question rounds (shows progress: "Round 2/3")
- Step 3: Completion summary
- Shows completeness score as progress bar
- Displays AI reasoning for transparency
- "Skip to estimation" button (if score > 70%)

#### 4.2 `DiscoveryQuestionCard`
**File**: `src/components/discovery/DiscoveryQuestionCard.tsx`

**Features**:
- Display question with context tooltip
- Category badge (color-coded)
- Priority indicator
- Textarea for answer
- Character count
- Optional skip button

#### 4.3 `DiscoveryProgressBar`
**File**: `src/components/discovery/DiscoveryProgressBar.tsx`

**Features**:
- Visual completeness score (0-100%)
- Round indicator (1/3, 2/3, 3/3)
- Category coverage (shows which categories covered)

#### 4.4 `DiscoveryHistoryPanel` (Optional)
**File**: `src/components/discovery/DiscoveryHistoryPanel.tsx`

**Features**:
- Collapsible panel showing past Q&A
- Resume abandoned sessions
- Export conversation

### Phase 5: Schema & Validation

#### 5.1 Update Zod Schemas
**File**: `src/lib/schemas/ai.schema.ts`

```typescript
// Enhanced Project Analysis Schema
export const EnhancedProjectAnalysisSchema = z.object({
  // Core fields (existing)
  goal: z.string(),
  target_audience: z.array(z.string()),
  type: z.string(),
  key_features: z.record(z.array(z.string())),
  non_functional: z.array(z.string()),
  open_questions: z.array(z.string()),
  
  // NEW: Extended fields
  technology_stack: z.object({
    preferred: z.array(z.string()).optional(),
    required: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
  }).optional(),
  
  integrations: z.array(z.object({
    system: z.string(),
    type: z.enum(["REST", "GraphQL", "Webhook", "SDK", "Database", "Other"]),
    criticality: z.enum(["Critical", "Important", "Nice-to-have"]),
  })).optional(),
  
  scale_expectations: z.object({
    initial_users: z.string().optional(),
    year_one_users: z.string().optional(),
    performance_requirements: z.array(z.string()).optional(),
    multi_tenant: z.boolean().optional(),
  }).optional(),
  
  existing_assets: z.object({
    has_legacy_system: z.boolean(),
    has_designs: z.boolean(),
    has_documentation: z.boolean(),
    details: z.array(z.string()).optional(),
  }).optional(),
  
  compliance: z.array(z.enum([
    "GDPR", "HIPAA", "PCI-DSS", "SOC2", "ISO27001", "None"
  ])).optional(),
  
  delivery_context: z.object({
    client_has_team: z.boolean().optional(),
    support_level: z.enum(["None", "Basic", "Full"]).optional(),
    methodology: z.enum(["Agile", "Waterfall", "Hybrid"]).optional(),
  }).optional(),
});

// Discovery Question Schema
export const DiscoveryQuestionSchema = z.object({
  question: z.string(),
  context: z.string(),
  category: z.enum([
    "basic_info",
    "tech_stack",
    "integrations",
    "scale",
    "compliance",
    "assets",
    "delivery"
  ]),
  priority: z.number().min(1).max(5),
});

// Discovery Session Schema
export const DiscoverySessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  initialDescription: z.string(),
  status: z.enum(["in_progress", "completed", "abandoned"]),
  currentRound: z.number().min(1).max(3),
  completenessScore: z.number().min(0).max(100).optional(),
  currentReasoning: z.string().optional(),
  finalAnalysis: EnhancedProjectAnalysisSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
});
```

---

## 🎯 Key Implementation Decisions

### 1. **Session Management**
- Store sessions in database (not just memory)
- Allow users to resume abandoned sessions
- Auto-expire sessions after 24 hours of inactivity

### 2. **Question Generation Strategy**
- AI uses conversation history to avoid repetition
- Prioritizes categories with lowest coverage
- Adapts complexity based on user's technical level (detected from answers)

### 3. **Completeness Scoring Algorithm**
```typescript
const weights = {
  basic_info: 30,      // Essential
  tech_stack: 20,      // Important
  integrations: 15,    // Important
  scale: 10,           // Medium
  compliance: 10,      // Medium
  assets: 10,          // Medium
  delivery: 5,         // Nice-to-have
};

completenessScore = Σ(category_coverage * weight) / 100
```

### 4. **Early Exit Criteria**
Allow user to proceed if:
- Completeness score ≥ 70%
- At least basic_info fully covered
- User explicitly chooses "Good enough"

### 5. **AI Model Selection**
- **Question Generation**: GPT-4o-mini (balance of quality/cost)
- **Completeness Analysis**: Claude 3 Haiku (fast, cheap)
- **Final Analysis Extraction**: GPT-4o-mini (comprehensive)

---

## 📊 Success Metrics

1. **User Engagement**
   - % of users who complete discovery (target: >70%)
   - Average questions answered (target: 10-15)
   - Average session duration (target: 5-10 min)

2. **Data Quality**
   - Average completeness score (target: >75%)
   - % of sessions with all critical categories covered (target: >80%)
   - Reduction in "unknown" fields in final analysis (target: <20%)

3. **Estimation Accuracy**
   - Correlation between discovery completeness and estimation confidence
   - Reduction in post-estimation clarification questions

---

## 🚀 Rollout Plan

### Week 1: Database & Backend
- [ ] Create and test migration
- [ ] Implement `ProjectDiscoveryService`
- [ ] Implement `discovery.db.service`
- [ ] Create API endpoints
- [ ] Write unit tests

### Week 2: Frontend
- [ ] Create UI components
- [ ] Integrate with API
- [ ] Add loading states and error handling
- [ ] Implement session persistence

### Week 3: Integration & Testing
- [ ] Connect discovery → quotation flow
- [ ] End-to-end testing
- [ ] User acceptance testing
- [ ] Performance optimization

### Week 4: Launch
- [ ] Deploy to staging
- [ ] A/B test (50% old flow, 50% new discovery)
- [ ] Monitor metrics
- [ ] Gather user feedback
- [ ] Full rollout

---

## 🔄 Connection to Next Phases

After discovery completes:

1. **Enhanced Project Analysis** → Used for Module Identification (Step 2)
2. **Technology Stack** → Influences Component Inventory (Step 3)
3. **Integrations** → Adds external_api components automatically
4. **Scale Expectations** → Adjusts Technical Complexity pillar
5. **Compliance** → Adds Process Overhead (10-30%)
6. **Existing Assets** → Reduces Domain Complexity
7. **Delivery Context** → Adjusts Workflow Complexity

This discovery phase becomes the **foundation** for the contextual complexity estimation model described in the prompting plan Part 2.

---

## 📝 Notes & Considerations

### Privacy & Security
- Discovery conversations may contain sensitive business information
- Ensure proper encryption at rest
- Consider adding option to delete discovery data after quotation created
- Add GDPR-compliant data retention policy

### AI Cost Optimization
- Cache common question patterns
- Use cheaper models for simple tasks (completeness check)
- Implement request throttling to prevent abuse

### Future Enhancements
- Multi-language support
- Voice input for answers
- Import project brief from PDF/Word
- Suggest similar past projects for reference
- Team collaboration on discovery (multiple stakeholders)

---

**Next Steps**: Review this plan with the team, prioritize features, and begin Week 1 implementation.
