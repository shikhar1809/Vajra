-- ============================================
-- SENTRY MODULE ENHANCEMENTS
-- Employee Security Training & Awareness
-- ============================================

-- Add new columns to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS phishing_tests_total INTEGER DEFAULT 0;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS phishing_click_rate DECIMAL DEFAULT 0;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS training_completed INTEGER DEFAULT 0;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 50;

-- Create phishing_tests table
CREATE TABLE IF NOT EXISTS phishing_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  difficulty TEXT NOT NULL, -- 'easy', 'medium', 'hard'
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ,
  reported BOOLEAN DEFAULT FALSE,
  reported_at TIMESTAMPTZ,
  report_time_seconds INTEGER
);

-- Create training_progress table
CREATE TABLE IF NOT EXISTS training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  course_name TEXT NOT NULL,
  progress INTEGER DEFAULT 0, -- 0-100
  completed_at TIMESTAMPTZ,
  quiz_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create security_events table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'login', 'failed_login', 'password_change', 'suspicious_activity'
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_phishing_tests_employee ON phishing_tests(employee_id);
CREATE INDEX IF NOT EXISTS idx_phishing_tests_workspace ON phishing_tests(workspace_id);
CREATE INDEX IF NOT EXISTS idx_phishing_tests_sent ON phishing_tests(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_training_progress_employee ON training_progress(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_workspace ON training_progress(workspace_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_completed ON training_progress(completed_at);

CREATE INDEX IF NOT EXISTS idx_security_events_employee ON security_events(employee_id);
CREATE INDEX IF NOT EXISTS idx_security_events_workspace ON security_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_employees_points ON employees(points DESC);
CREATE INDEX IF NOT EXISTS idx_employees_risk_score ON employees(risk_score);

-- Enable RLS on new tables
ALTER TABLE phishing_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for phishing_tests
CREATE POLICY "Users can view workspace phishing tests"
ON phishing_tests FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace phishing tests"
ON phishing_tests FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update workspace phishing tests"
ON phishing_tests FOR UPDATE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- RLS Policies for training_progress
CREATE POLICY "Users can view workspace training progress"
ON training_progress FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace training progress"
ON training_progress FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update workspace training progress"
ON training_progress FOR UPDATE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- RLS Policies for security_events
CREATE POLICY "Users can view workspace security events"
ON security_events FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace security events"
ON security_events FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- Function to update employee stats
CREATE OR REPLACE FUNCTION update_employee_phishing_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update employee phishing stats
  UPDATE employees
  SET 
    phishing_tests_total = (
      SELECT COUNT(*) FROM phishing_tests WHERE employee_id = NEW.employee_id
    ),
    phishing_click_rate = (
      SELECT COALESCE(
        (COUNT(*) FILTER (WHERE clicked = TRUE)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
        0
      )
      FROM phishing_tests WHERE employee_id = NEW.employee_id
    ),
    phishing_tests_passed = (
      SELECT COUNT(*) FROM phishing_tests 
      WHERE employee_id = NEW.employee_id AND clicked = FALSE
    ),
    phishing_tests_failed = (
      SELECT COUNT(*) FROM phishing_tests 
      WHERE employee_id = NEW.employee_id AND clicked = TRUE
    )
  WHERE id = NEW.employee_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update phishing stats
CREATE TRIGGER trigger_update_phishing_stats
AFTER INSERT OR UPDATE ON phishing_tests
FOR EACH ROW
EXECUTE FUNCTION update_employee_phishing_stats();

-- Success message
COMMENT ON TABLE phishing_tests IS 'Tracks phishing simulation tests sent to employees';
COMMENT ON TABLE training_progress IS 'Monitors employee security training progress';
COMMENT ON TABLE security_events IS 'Logs security-related events for employees';
