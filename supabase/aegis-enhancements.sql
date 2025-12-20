-- ============================================
-- AEGIS MODULE ENHANCEMENTS
-- Code Security Scanning & Analysis
-- ============================================

-- Add new columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS security_score INTEGER DEFAULT 50;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS vulnerabilities_critical INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS vulnerabilities_high INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS vulnerabilities_medium INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS vulnerabilities_low INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_scan_at TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS scan_status TEXT DEFAULT 'pending';

-- Create scan_results table
CREATE TABLE IF NOT EXISTS scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scan_type TEXT NOT NULL, -- 'sast', 'dependency', 'secrets', 'license'
  severity TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low', 'info'
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  line_number INTEGER,
  code_snippet TEXT,
  recommendation TEXT,
  cwe_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dependency_vulnerabilities table
CREATE TABLE IF NOT EXISTS dependency_vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  current_version TEXT NOT NULL,
  vulnerable_version TEXT,
  fixed_version TEXT,
  severity TEXT NOT NULL,
  cve_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create code_quality_metrics table
CREATE TABLE IF NOT EXISTS code_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  lines_of_code INTEGER DEFAULT 0,
  code_complexity INTEGER DEFAULT 0,
  test_coverage DECIMAL DEFAULT 0,
  maintainability_index INTEGER DEFAULT 0,
  technical_debt_hours INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scan_results_project ON scan_results(project_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_workspace ON scan_results(workspace_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_severity ON scan_results(severity);
CREATE INDEX IF NOT EXISTS idx_scan_results_created ON scan_results(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dependency_vulns_project ON dependency_vulnerabilities(project_id);
CREATE INDEX IF NOT EXISTS idx_dependency_vulns_workspace ON dependency_vulnerabilities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_dependency_vulns_severity ON dependency_vulnerabilities(severity);

CREATE INDEX IF NOT EXISTS idx_code_quality_project ON code_quality_metrics(project_id);
CREATE INDEX IF NOT EXISTS idx_code_quality_workspace ON code_quality_metrics(workspace_id);

CREATE INDEX IF NOT EXISTS idx_projects_security_score ON projects(security_score);
CREATE INDEX IF NOT EXISTS idx_projects_scan_status ON projects(scan_status);

-- Enable RLS
ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependency_vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_quality_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scan_results
CREATE POLICY "Users can view workspace scan results"
ON scan_results FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace scan results"
ON scan_results FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- RLS Policies for dependency_vulnerabilities
CREATE POLICY "Users can view workspace dependency vulnerabilities"
ON dependency_vulnerabilities FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace dependency vulnerabilities"
ON dependency_vulnerabilities FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- RLS Policies for code_quality_metrics
CREATE POLICY "Users can view workspace code quality metrics"
ON code_quality_metrics FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace code quality metrics"
ON code_quality_metrics FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- Function to update project security score
CREATE OR REPLACE FUNCTION update_project_security_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate security score based on vulnerabilities
  UPDATE projects
  SET 
    security_score = GREATEST(0, 100 - (
      (vulnerabilities_critical * 25) +
      (vulnerabilities_high * 10) +
      (vulnerabilities_medium * 5) +
      (vulnerabilities_low * 2)
    ))
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update security score
CREATE TRIGGER trigger_update_project_security_score
AFTER INSERT OR UPDATE ON scan_results
FOR EACH ROW
EXECUTE FUNCTION update_project_security_score();

-- Success message
COMMENT ON TABLE scan_results IS 'Stores code security scan results';
COMMENT ON TABLE dependency_vulnerabilities IS 'Tracks vulnerable dependencies';
COMMENT ON TABLE code_quality_metrics IS 'Monitors code quality metrics';
