-- STEP 1 (permission) 
GRANT REFERENCES ON auth.users TO postgres, anon, authenticated, service_role;

-- STEP 2 (tables)
 CREATE TABLE discovery_sessions ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, initial_description TEXT NOT NULL CHECK (char_length(initial_description) <= 10000), status VARCHAR(50) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')), current_round INTEGER NOT NULL DEFAULT 1 CHECK (current_round BETWEEN 1 AND 3), completeness_score INTEGER CHECK (completeness_score BETWEEN 0 AND 100), current_reasoning TEXT, final_analysis JSONB, created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, completed_at TIMESTAMPTZ );

CREATE TABLE discovery_questions ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), session_id UUID NOT NULL REFERENCES discovery_sessions(id) ON DELETE CASCADE, round_number INTEGER NOT NULL CHECK (round_number BETWEEN 1 AND 3), question_text TEXT NOT NULL, context TEXT, category VARCHAR(50) NOT NULL CHECK (category IN ( 'basic_info', 'tech_stack', 'integrations', 'scale', 'compliance', 'assets', 'delivery' )), priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5), answer TEXT, answered_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL );

CREATE TABLE discovery_conversation_log ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), session_id UUID NOT NULL REFERENCES discovery_sessions(id) ON DELETE CASCADE, role VARCHAR(20) NOT NULL CHECK (role IN ('system', 'ai', 'user')), content TEXT NOT NULL, round_number INTEGER CHECK (round_number BETWEEN 1 AND 3), created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL );

-- STEP 3 (indexes) 
CREATE INDEX idx_discovery_sessions_user_id ON discovery_sessions(user_id); CREATE INDEX idx_discovery_sessions_status ON discovery_sessions(status); CREATE INDEX idx_discovery_sessions_created_at ON discovery_sessions(created_at); CREATE INDEX idx_discovery_questions_session_id ON discovery_questions(session_id); CREATE INDEX idx_discovery_questions_category ON discovery_questions(category); CREATE INDEX idx_discovery_questions_round ON discovery_questions(round_number); CREATE INDEX idx_conversation_log_session_id ON discovery_conversation_log(session_id); CREATE INDEX idx_conversation_log_created_at ON discovery_conversation_log(created_at);

-- STEP 4 (RLS) ALTER TABLE discovery_sessions ENABLE ROW LEVEL SECURITY; ALTER TABLE discovery_questions ENABLE ROW LEVEL SECURITY; ALTER TABLE discovery_conversation_log ENABLE ROW LEVEL SECURITY;

-- STEP 5 (policies)
 CREATE POLICY "users can view own discovery sessions" ON discovery_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users can create own discovery sessions" ON discovery_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own discovery sessions" ON discovery_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users can delete own discovery sessions" ON discovery_sessions FOR DELETE USING (auth.uid() = user_id);

-- (and similarly add semicolons to all the policies for discovery_questions and discovery_conversation_log)

-- STEP 6 (alter quotations)
 ALTER TABLE quotations ADD COLUMN IF NOT EXISTS discovery_session_id UUID REFERENCES discovery_sessions(id) ON DELETE SET NULL; CREATE INDEX IF NOT EXISTS idx_quotations_discovery_session ON quotations(discovery_session_id);

-- STEP 7 (comments) 
COMMENT ON TABLE discovery_sessions IS 'Stores interactive project discovery sessions with multi-turn conversation'; COMMENT ON COLUMN discovery_sessions.user_id IS 'References auth.users - the authenticated user who owns this discovery session'; COMMENT ON TABLE discovery_questions IS 'AI-generated questions asked during discovery process'; COMMENT ON TABLE discovery_conversation_log IS 'Complete conversation history for each discovery session'; COMMENT ON COLUMN quotations.discovery_session_id IS 'Links quotation to the discovery session that provided project details'; COMMENT ON COLUMN quotations.dynamic_attributes IS 'Extended project analysis including: technology_stack, integrations, scale_expectations, existing_assets, compliance, delivery_context';