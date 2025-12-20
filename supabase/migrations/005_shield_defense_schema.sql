-- Shield Adaptive Defense Schema

-- 1. Global Shield Configuration
CREATE TABLE IF NOT EXISTS shield_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    mode TEXT NOT NULL DEFAULT 'monitor', -- 'monitor', 'bunker', 'lockdown'
    rate_limit_threshold INT DEFAULT 100, -- Requests per minute
    bunker_trigger_threshold INT DEFAULT 200, -- Requests per minute to auto-trigger Bunker
    active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- 2. Custom Defense Rules
CREATE TABLE IF NOT EXISTS shield_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    condition_type TEXT NOT NULL, -- 'country', 'ip_range', 'user_agent'
    condition_value TEXT NOT NULL, -- 'CN', '192.168.0.0/24', 'Bot'
    action TEXT NOT NULL, -- 'block', 'challenge', 'log'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Detailed Access Logs (for analysis)
CREATE TABLE IF NOT EXISTS shield_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    ip_address TEXT,
    country TEXT,
    path TEXT,
    action_taken TEXT, -- 'allowed', 'blocked', 'challenged'
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Simplified for demo)
ALTER TABLE shield_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE shield_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE shield_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users" ON shield_config FOR SELECT USING (true);
CREATE POLICY "Allow read access to authenticated users" ON shield_rules FOR SELECT USING (true);
CREATE POLICY "Allow insert to logs" ON shield_access_logs FOR INSERT WITH CHECK (true);
