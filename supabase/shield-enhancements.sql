-- ============================================
-- SHIELD MODULE ENHANCEMENTS
-- Enhanced Traffic Logging & Bot Detection
-- ============================================

-- Add new columns to traffic_logs
ALTER TABLE traffic_logs ADD COLUMN IF NOT EXISTS bot_score INTEGER DEFAULT 0;
ALTER TABLE traffic_logs ADD COLUMN IF NOT EXISTS ip_reputation TEXT DEFAULT 'unknown';
ALTER TABLE traffic_logs ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
ALTER TABLE traffic_logs ADD COLUMN IF NOT EXISTS fingerprint TEXT;
ALTER TABLE traffic_logs ADD COLUMN IF NOT EXISTS block_reason TEXT;

-- Create blocked_ips table
CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_permanent BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id)
);

-- Create alert_rules table
CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'ddos', 'bot_spike', 'malicious_ip'
  threshold INTEGER NOT NULL,
  time_window INTEGER DEFAULT 60, -- seconds
  notification_channel TEXT NOT NULL, -- 'slack', 'email', 'webhook'
  channel_config JSONB, -- webhook URL, email, etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create traffic_analytics table for aggregated data
CREATE TABLE IF NOT EXISTS traffic_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hour INTEGER NOT NULL, -- 0-23
  total_requests INTEGER DEFAULT 0,
  blocked_requests INTEGER DEFAULT 0,
  bot_requests INTEGER DEFAULT 0,
  unique_ips INTEGER DEFAULT 0,
  top_countries JSONB, -- {country: count}
  top_paths JSONB, -- {path: count}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, date, hour)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_traffic_bot_score ON traffic_logs(bot_score);
CREATE INDEX IF NOT EXISTS idx_traffic_blocked ON traffic_logs(is_blocked);
CREATE INDEX IF NOT EXISTS idx_traffic_fingerprint ON traffic_logs(fingerprint);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_workspace ON blocked_ips(workspace_id);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip ON blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_alert_rules_workspace ON alert_rules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_active ON alert_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_analytics_workspace_date ON traffic_analytics(workspace_id, date, hour);

-- Enable RLS on new tables
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocked_ips
CREATE POLICY "Users can view workspace blocked IPs"
ON blocked_ips FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace blocked IPs"
ON blocked_ips FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete workspace blocked IPs"
ON blocked_ips FOR DELETE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- RLS Policies for alert_rules
CREATE POLICY "Users can view workspace alert rules"
ON alert_rules FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace alert rules"
ON alert_rules FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update workspace alert rules"
ON alert_rules FOR UPDATE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete workspace alert rules"
ON alert_rules FOR DELETE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- RLS Policies for traffic_analytics
CREATE POLICY "Users can view workspace analytics"
ON traffic_analytics FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- Function to aggregate traffic data hourly
CREATE OR REPLACE FUNCTION aggregate_traffic_hourly()
RETURNS void AS $$
BEGIN
  INSERT INTO traffic_analytics (workspace_id, date, hour, total_requests, blocked_requests, bot_requests, unique_ips)
  SELECT 
    workspace_id,
    DATE(timestamp) as date,
    EXTRACT(HOUR FROM timestamp)::INTEGER as hour,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE is_blocked = TRUE) as blocked_requests,
    COUNT(*) FILTER (WHERE bot_score > 80) as bot_requests,
    COUNT(DISTINCT ip_address) as unique_ips
  FROM traffic_logs
  WHERE timestamp >= NOW() - INTERVAL '1 hour'
  GROUP BY workspace_id, DATE(timestamp), EXTRACT(HOUR FROM timestamp)
  ON CONFLICT (workspace_id, date, hour) 
  DO UPDATE SET
    total_requests = EXCLUDED.total_requests,
    blocked_requests = EXCLUDED.blocked_requests,
    bot_requests = EXCLUDED.bot_requests,
    unique_ips = EXCLUDED.unique_ips;
END;
$$ LANGUAGE plpgsql;

-- Success message
COMMENT ON TABLE blocked_ips IS 'Stores blocked IP addresses with expiry and reasons';
COMMENT ON TABLE alert_rules IS 'Configurable alert rules for Shield monitoring';
COMMENT ON TABLE traffic_analytics IS 'Aggregated traffic data for analytics dashboard';
