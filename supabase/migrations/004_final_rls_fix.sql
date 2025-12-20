-- FINAL FIX: Non-recursive RLS policies for workspaces
-- Run this in Supabase SQL Editor

-- First, disable RLS temporarily to clean up
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can view their own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete" ON workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update their workspace" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete their workspace" ON workspaces;

DROP POLICY IF EXISTS "Users can view members of their workspaces" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON workspace_members;

-- Re-enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for workspaces
CREATE POLICY "workspace_insert_policy"
    ON workspaces FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "workspace_select_policy"
    ON workspaces FOR SELECT
    TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "workspace_update_policy"
    ON workspaces FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "workspace_delete_policy"
    ON workspaces FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- Simple policies for workspace_members
CREATE POLICY "members_select_policy"
    ON workspace_members FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "members_insert_policy"
    ON workspace_members FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON workspaces TO authenticated;
GRANT ALL ON workspace_members TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON threat_intelligence TO authenticated;
GRANT ALL ON document_scans TO authenticated;
GRANT ALL ON financial_transactions TO authenticated;
GRANT ALL ON deepfake_detections TO authenticated;
GRANT ALL ON activity_logs TO authenticated;
