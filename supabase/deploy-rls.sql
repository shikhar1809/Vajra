-- ============================================
-- SIMPLIFIED RLS DEPLOYMENT SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_logs ENABLE ROW LEVEL SECURITY;

-- Step 2: Workspaces Policies
CREATE POLICY "Users can view own workspaces"
ON workspaces FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can create workspaces"
ON workspaces FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own workspaces"
ON workspaces FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own workspaces"
ON workspaces FOR DELETE
USING (owner_id = auth.uid());

-- Step 3: Vendors Policies
CREATE POLICY "Users can view workspace vendors"
ON vendors FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace vendors"
ON vendors FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update workspace vendors"
ON vendors FOR UPDATE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete workspace vendors"
ON vendors FOR DELETE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- Step 4: Employees Policies
CREATE POLICY "Users can view workspace employees"
ON employees FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace employees"
ON employees FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update workspace employees"
ON employees FOR UPDATE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete workspace employees"
ON employees FOR DELETE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- Step 5: Projects Policies
CREATE POLICY "Users can view workspace projects"
ON projects FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace projects"
ON projects FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update workspace projects"
ON projects FOR UPDATE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete workspace projects"
ON projects FOR DELETE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- Step 6: API Keys Policies
CREATE POLICY "Users can view workspace API keys"
ON api_keys FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace API keys"
ON api_keys FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update workspace API keys"
ON api_keys FOR UPDATE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete workspace API keys"
ON api_keys FOR DELETE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- Step 7: Traffic Logs Policies
CREATE POLICY "Users can view workspace traffic logs"
ON traffic_logs FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace traffic logs"
ON traffic_logs FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If you see this, RLS policies are deployed successfully!
-- Your data is now protected with workspace isolation.
