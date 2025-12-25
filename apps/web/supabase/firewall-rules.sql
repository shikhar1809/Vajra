-- ============================================
-- FIREWALL RULES TABLE
-- For Phase 3: Automation & Rules
-- ============================================

-- Create firewall_rules table
CREATE TABLE IF NOT EXISTS firewall_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 50,
  conditions JSONB NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('block', 'allow', 'challenge')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_firewall_rules_workspace ON firewall_rules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_firewall_rules_enabled ON firewall_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_firewall_rules_priority ON firewall_rules(priority DESC);

-- Enable RLS
ALTER TABLE firewall_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view workspace firewall rules" ON firewall_rules;
DROP POLICY IF EXISTS "Users can create workspace firewall rules" ON firewall_rules;
DROP POLICY IF EXISTS "Users can update workspace firewall rules" ON firewall_rules;
DROP POLICY IF EXISTS "Users can delete workspace firewall rules" ON firewall_rules;

-- RLS Policies
CREATE POLICY "Users can view workspace firewall rules"
ON firewall_rules FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace firewall rules"
ON firewall_rules FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update workspace firewall rules"
ON firewall_rules FOR UPDATE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete workspace firewall rules"
ON firewall_rules FOR DELETE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- Success message
COMMENT ON TABLE firewall_rules IS 'Custom firewall rules for traffic filtering';
