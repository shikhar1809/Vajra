-- ============================================
-- SCOUT MODULE ENHANCEMENTS
-- Vendor Security Monitoring & Compliance
-- ============================================

-- Add new columns to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS ssl_score INTEGER DEFAULT 0;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS ssl_expiry TIMESTAMPTZ;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS ssl_grade TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS compliance_status JSONB DEFAULT '{}';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS last_breach_check TIMESTAMPTZ;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS breach_count INTEGER DEFAULT 0;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'unknown';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS last_scan_at TIMESTAMPTZ;

-- Create vendor_scans table
CREATE TABLE IF NOT EXISTS vendor_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  scan_type TEXT NOT NULL, -- 'ssl', 'dns', 'breach', 'compliance', 'full'
  scan_result JSONB NOT NULL,
  issues_found INTEGER DEFAULT 0,
  scan_duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create breach_alerts table
CREATE TABLE IF NOT EXISTS breach_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  breach_name TEXT NOT NULL,
  breach_date TIMESTAMPTZ,
  affected_accounts INTEGER DEFAULT 0,
  data_types TEXT[] DEFAULT '{}',
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  is_resolved BOOLEAN DEFAULT FALSE,
  discovered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create compliance_checks table
CREATE TABLE IF NOT EXISTS compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  compliance_type TEXT NOT NULL, -- 'soc2', 'gdpr', 'iso27001', 'pci_dss', 'hipaa'
  status TEXT NOT NULL, -- 'compliant', 'non-compliant', 'unknown', 'expired'
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vendor_risk_history table
CREATE TABLE IF NOT EXISTS vendor_risk_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL,
  risk_level TEXT NOT NULL,
  factors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_scans_vendor ON vendor_scans(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_scans_workspace ON vendor_scans(workspace_id);
CREATE INDEX IF NOT EXISTS idx_vendor_scans_type ON vendor_scans(scan_type);
CREATE INDEX IF NOT EXISTS idx_vendor_scans_created ON vendor_scans(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_breach_alerts_vendor ON breach_alerts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_breach_alerts_workspace ON breach_alerts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_breach_alerts_severity ON breach_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_breach_alerts_resolved ON breach_alerts(is_resolved);

CREATE INDEX IF NOT EXISTS idx_compliance_checks_vendor ON compliance_checks(vendor_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_workspace ON compliance_checks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_type ON compliance_checks(compliance_type);

CREATE INDEX IF NOT EXISTS idx_risk_history_vendor ON vendor_risk_history(vendor_id);
CREATE INDEX IF NOT EXISTS idx_risk_history_created ON vendor_risk_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vendors_risk_level ON vendors(risk_level);
CREATE INDEX IF NOT EXISTS idx_vendors_ssl_expiry ON vendors(ssl_expiry);

-- Enable RLS on new tables
ALTER TABLE vendor_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE breach_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_risk_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_scans
CREATE POLICY "Users can view workspace vendor scans"
ON vendor_scans FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace vendor scans"
ON vendor_scans FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- RLS Policies for breach_alerts
CREATE POLICY "Users can view workspace breach alerts"
ON breach_alerts FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace breach alerts"
ON breach_alerts FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update workspace breach alerts"
ON breach_alerts FOR UPDATE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- RLS Policies for compliance_checks
CREATE POLICY "Users can view workspace compliance checks"
ON compliance_checks FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace compliance checks"
ON compliance_checks FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update workspace compliance checks"
ON compliance_checks FOR UPDATE
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- RLS Policies for vendor_risk_history
CREATE POLICY "Users can view workspace risk history"
ON vendor_risk_history FOR SELECT
USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create workspace risk history"
ON vendor_risk_history FOR INSERT
WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- Function to update vendor risk level
CREATE OR REPLACE FUNCTION update_vendor_risk_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Update vendor risk level based on security score
  IF NEW.security_score >= 80 THEN
    NEW.risk_level := 'low';
  ELSIF NEW.security_score >= 60 THEN
    NEW.risk_level := 'medium';
  ELSIF NEW.security_score >= 40 THEN
    NEW.risk_level := 'high';
  ELSE
    NEW.risk_level := 'critical';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update risk level
CREATE TRIGGER trigger_update_vendor_risk_level
BEFORE INSERT OR UPDATE OF security_score ON vendors
FOR EACH ROW
EXECUTE FUNCTION update_vendor_risk_level();

-- Success message
COMMENT ON TABLE vendor_scans IS 'Stores vendor security scan results';
COMMENT ON TABLE breach_alerts IS 'Tracks data breaches affecting vendors';
COMMENT ON TABLE compliance_checks IS 'Monitors vendor compliance certifications';
COMMENT ON TABLE vendor_risk_history IS 'Historical risk score tracking';
