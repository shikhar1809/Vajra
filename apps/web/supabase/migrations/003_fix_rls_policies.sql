-- Fix for RLS policy error during workspace creation
-- Run this in Supabase SQL Editor AFTER running the main migration

-- First, let's check if the policies exist and drop them
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
    DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
    DROP POLICY IF EXISTS "Workspace owners can update their workspace" ON workspaces;
    DROP POLICY IF EXISTS "Workspace owners can delete their workspace" ON workspaces;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create better RLS policies that allow authenticated users to create workspaces
CREATE POLICY "Authenticated users can create workspaces"
    ON workspaces FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view their own workspaces"
    ON workspaces FOR SELECT
    TO authenticated
    USING (
        owner_id = auth.uid() 
        OR id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace owners can update"
    ON workspaces FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace owners can delete"
    ON workspaces FOR DELETE
    TO authenticated
    USING (owner_id = auth.uid());

-- Also fix workspace_members policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
    DROP POLICY IF EXISTS "Workspace owners can manage members" ON workspace_members;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Users can view members of their workspaces"
    ON workspace_members FOR SELECT
    TO authenticated
    USING (
        workspace_id IN (
            SELECT id FROM workspaces 
            WHERE owner_id = auth.uid()
        )
        OR user_id = auth.uid()
    );

CREATE POLICY "Workspace owners can manage members"
    ON workspace_members FOR ALL
    TO authenticated
    USING (
        workspace_id IN (
            SELECT id FROM workspaces 
            WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        workspace_id IN (
            SELECT id FROM workspaces 
            WHERE owner_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
