-- ============================================
-- Workspace-Specific Tables for Real Data Input
-- ============================================

-- Employees table (for Sentry module)
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT,
  location TEXT,
  security_score INTEGER DEFAULT 50,
  last_training_date TIMESTAMPTZ,
  phishing_tests_passed INTEGER DEFAULT 0,
  phishing_tests_failed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_workspace ON employees(workspace_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- Projects table (for Aegis module)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  repository_url TEXT,
  description TEXT,
  last_scan_at TIMESTAMPTZ,
  security_score INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);

-- IP Whitelist table (for Shield module)
CREATE TABLE IF NOT EXISTS ip_whitelist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  ip_address TEXT NOT NULL,
  description TEXT,
  added_by UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whitelist_workspace ON ip_whitelist(workspace_id);
CREATE INDEX IF NOT EXISTS idx_whitelist_ip ON ip_whitelist(ip_address);

-- Update vendors table to include workspace_id
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS workspace_id UUID;
CREATE INDEX IF NOT EXISTS idx_vendors_workspace ON vendors(workspace_id);

-- Update vendor_risk_scores to include workspace_id
ALTER TABLE vendor_risk_scores ADD COLUMN IF NOT EXISTS workspace_id UUID;
CREATE INDEX IF NOT EXISTS idx_vendor_risk_workspace ON vendor_risk_scores(workspace_id);

-- Update code_scans to include workspace_id and project_id
ALTER TABLE code_scans ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE code_scans ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
CREATE INDEX IF NOT EXISTS idx_code_scans_workspace ON code_scans(workspace_id);
CREATE INDEX IF NOT EXISTS idx_code_scans_project ON code_scans(project_id);

-- Update traffic_logs to include workspace_id
ALTER TABLE traffic_logs ADD COLUMN IF NOT EXISTS workspace_id UUID;
CREATE INDEX IF NOT EXISTS idx_traffic_workspace ON traffic_logs(workspace_id);

-- Update phishing_checks to include workspace_id and employee_id
ALTER TABLE phishing_checks ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE phishing_checks ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id);
CREATE INDEX IF NOT EXISTS idx_phishing_workspace ON phishing_checks(workspace_id);

-- Update document_scans to include workspace_id
ALTER TABLE document_scans ADD COLUMN IF NOT EXISTS workspace_id UUID;
CREATE INDEX IF NOT EXISTS idx_document_scans_workspace ON document_scans(workspace_id);

-- Sample data for testing (optional)
-- INSERT INTO employees (workspace_id, name, email, department, security_score) VALUES
-- ('00000000-0000-0000-0000-000000000000', 'John Doe', 'john@example.com', 'Engineering', 85),
-- ('00000000-0000-0000-0000-000000000000', 'Jane Smith', 'jane@example.com', 'Security', 92);

COMMENT ON TABLE employees IS 'Employee records for Sentry module - workspace-specific';
COMMENT ON TABLE projects IS 'Project records for Aegis module - workspace-specific';
COMMENT ON TABLE ip_whitelist IS 'IP whitelist for Shield module - workspace-specific';
