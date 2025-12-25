-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- Critical Security Fix: Implement RLS for all tables
-- ============================================

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- WORKSPACES POLICIES
-- ============================================

-- Users can only see workspaces they own
CREATE POLICY "Users can view own workspaces"
ON workspaces FOR SELECT
USING (owner_id = auth.uid());

-- Users can create workspaces
CREATE POLICY "Users can create workspaces"
ON workspaces FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Users can update own workspaces
CREATE POLICY "Users can update own workspaces"
ON workspaces FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Users can delete own workspaces
CREATE POLICY "Users can delete own workspaces"
ON workspaces FOR DELETE
USING (owner_id = auth.uid());

-- ============================================
-- VENDORS POLICIES
-- ============================================

-- Users can only see vendors in their workspaces
CREATE POLICY "Users can view workspace vendors"
ON vendors FOR SELECT
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

-- Users can create vendors in their workspaces
CREATE POLICY "Users can create workspace vendors"
ON vendors FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

-- Users can update vendors in their workspaces
CREATE POLICY "Users can update workspace vendors"
ON vendors FOR UPDATE
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

-- Users can delete vendors in their workspaces
CREATE POLICY "Users can delete workspace vendors"
ON vendors FOR DELETE
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

-- ============================================
-- EMPLOYEES POLICIES
-- ============================================

CREATE POLICY "Users can view workspace employees"
ON employees FOR SELECT
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create workspace employees"
ON employees FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update workspace employees"
ON employees FOR UPDATE
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete workspace employees"
ON employees FOR DELETE
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

-- ============================================
-- PROJECTS POLICIES
-- ============================================

CREATE POLICY "Users can view workspace projects"
ON projects FOR SELECT
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create workspace projects"
ON projects FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update workspace projects"
ON projects FOR UPDATE
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete workspace projects"
ON projects FOR DELETE
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

-- ============================================
-- API KEYS POLICIES
-- ============================================

CREATE POLICY "Users can view workspace API keys"
ON api_keys FOR SELECT
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create workspace API keys"
ON api_keys FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update workspace API keys"
ON api_keys FOR UPDATE
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete workspace API keys"
ON api_keys FOR DELETE
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

-- ============================================
-- TRAFFIC LOGS POLICIES
-- ============================================

CREATE POLICY "Users can view workspace traffic logs"
ON traffic_logs FOR SELECT
USING (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create workspace traffic logs"
ON traffic_logs FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

-- ============================================
-- DATABASE INDEXES FOR PERFORMANCE
-- ============================================

-- Workspace indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);

-- Vendor indexes
CREATE INDEX IF NOT EXISTS idx_vendors_workspace ON vendors(workspace_id);

-- Employee indexes  
CREATE INDEX IF NOT EXISTS idx_employees_workspace ON employees(workspace_id);

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);

-- API key indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_workspace ON api_keys(workspace_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Traffic log indexes
CREATE INDEX IF NOT EXISTS idx_traffic_workspace ON traffic_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_traffic_ip ON traffic_logs(ip_address);

-- ============================================
-- SECURITY: Add constraints
-- ============================================

-- Ensure workspace slugs are unique
ALTER TABLE workspaces ADD CONSTRAINT IF NOT EXISTS unique_workspace_slug UNIQUE (slug);

-- Ensure API keys are unique
ALTER TABLE api_keys ADD CONSTRAINT IF NOT EXISTS unique_api_key UNIQUE (key);

