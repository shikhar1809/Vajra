-- =====================================================
-- VAJRA WORKSPACE SYSTEM - DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. WORKSPACES TABLE
-- =====================================================
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Business Information
  business_type TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  country TEXT,
  website TEXT,
  
  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspaces_deleted ON workspaces(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- 2. WORKSPACE MEMBERS TABLE
-- =====================================================
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role & Permissions
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  permissions JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  status TEXT DEFAULT 'active',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(workspace_id, user_id)
);

-- Indexes
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);

-- =====================================================
-- 3. USER PROFILES TABLE
-- =====================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Info
  full_name TEXT,
  avatar_url TEXT,
  job_title TEXT,
  department TEXT,
  
  -- Preferences
  preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. SHIELD - THREAT INTELLIGENCE TABLE
-- =====================================================
CREATE TABLE threat_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  
  -- Threat Data
  threat_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source TEXT,
  indicators JSONB,
  
  -- Status
  status TEXT DEFAULT 'active',
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Metadata
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_threat_intel_workspace ON threat_intelligence(workspace_id);
CREATE INDEX idx_threat_intel_severity ON threat_intelligence(severity);
CREATE INDEX idx_threat_intel_status ON threat_intelligence(status);

-- =====================================================
-- 5. AEGIS - DOCUMENT SCANS TABLE
-- =====================================================
CREATE TABLE document_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  
  -- Document Info
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  file_url TEXT,
  
  -- Scan Results
  scan_status TEXT DEFAULT 'pending',
  risk_score INTEGER,
  threats_found JSONB,
  malware_detected BOOLEAN DEFAULT false,
  suspicious_content BOOLEAN DEFAULT false,
  
  -- Metadata
  scanned_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_document_scans_workspace ON document_scans(workspace_id);
CREATE INDEX idx_document_scans_status ON document_scans(scan_status);

-- =====================================================
-- 6. SCOUT - FINANCIAL TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  
  -- Transaction Data
  transaction_id TEXT,
  amount DECIMAL(15, 2),
  currency TEXT DEFAULT 'USD',
  transaction_type TEXT,
  merchant TEXT,
  category TEXT,
  
  -- Risk Analysis
  risk_score INTEGER,
  is_suspicious BOOLEAN DEFAULT false,
  fraud_indicators JSONB,
  
  -- Status
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  
  -- Metadata
  transaction_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_financial_transactions_workspace ON financial_transactions(workspace_id);
CREATE INDEX idx_financial_transactions_suspicious ON financial_transactions(is_suspicious);

-- =====================================================
-- 7. SENTRY - DEEPFAKE DETECTIONS TABLE
-- =====================================================
CREATE TABLE deepfake_detections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  
  -- Media Info
  media_type TEXT NOT NULL,
  media_url TEXT,
  file_name TEXT,
  
  -- Detection Results
  detection_status TEXT DEFAULT 'pending',
  is_deepfake BOOLEAN,
  confidence_score DECIMAL(5, 2),
  manipulation_type TEXT,
  analysis_details JSONB,
  
  -- Metadata
  analyzed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_deepfake_detections_workspace ON deepfake_detections(workspace_id);
CREATE INDEX idx_deepfake_detections_status ON deepfake_detections(detection_status);

-- =====================================================
-- 8. ACTIVITY LOGS TABLE
-- =====================================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Activity Data
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  description TEXT,
  metadata JSONB,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_workspace ON activity_logs(workspace_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- =====================================================
-- 9. WORKSPACE METRICS (MATERIALIZED VIEW)
-- =====================================================
CREATE MATERIALIZED VIEW workspace_metrics AS
SELECT 
  w.id as workspace_id,
  w.name as workspace_name,
  
  -- Threat Intelligence Metrics
  COUNT(DISTINCT CASE WHEN ti.status = 'active' THEN ti.id END) as active_threats,
  COUNT(DISTINCT CASE WHEN ti.severity = 'critical' THEN ti.id END) as critical_threats,
  
  -- Document Scan Metrics
  COUNT(DISTINCT ds.id) as total_scans,
  COUNT(DISTINCT CASE WHEN ds.malware_detected THEN ds.id END) as malware_found,
  
  -- Financial Monitoring Metrics
  COUNT(DISTINCT CASE WHEN ft.is_suspicious THEN ft.id END) as suspicious_transactions,
  SUM(CASE WHEN ft.is_suspicious THEN ft.amount ELSE 0 END) as flagged_amount,
  
  -- Deepfake Detection Metrics
  COUNT(DISTINCT dd.id) as total_detections,
  COUNT(DISTINCT CASE WHEN dd.is_deepfake THEN dd.id END) as deepfakes_found,
  
  -- Overall Security Score (0-100)
  GREATEST(0, 100 - (
    (COUNT(DISTINCT CASE WHEN ti.status = 'active' AND ti.severity = 'critical' THEN ti.id END) * 10) +
    (COUNT(DISTINCT CASE WHEN ds.malware_detected THEN ds.id END) * 5) +
    (COUNT(DISTINCT CASE WHEN ft.is_suspicious THEN ft.id END) * 3) +
    (COUNT(DISTINCT CASE WHEN dd.is_deepfake THEN dd.id END) * 2)
  )) as security_score,
  
  NOW() as last_updated
FROM workspaces w
LEFT JOIN threat_intelligence ti ON w.id = ti.workspace_id AND ti.created_at > NOW() - INTERVAL '30 days'
LEFT JOIN document_scans ds ON w.id = ds.workspace_id AND ds.created_at > NOW() - INTERVAL '30 days'
LEFT JOIN financial_transactions ft ON w.id = ft.workspace_id AND ft.created_at > NOW() - INTERVAL '30 days'
LEFT JOIN deepfake_detections dd ON w.id = dd.workspace_id AND dd.created_at > NOW() - INTERVAL '30 days'
GROUP BY w.id, w.name;

CREATE UNIQUE INDEX idx_workspace_metrics_workspace ON workspace_metrics(workspace_id);

-- =====================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deepfake_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Workspaces: Users can only see workspaces they're members of
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their workspaces"
  ON workspaces FOR UPDATE
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Workspace Members: Users can view members of their workspaces
CREATE POLICY "Users can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage members"
  ON workspace_members FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- User Profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Module Data: Users can only access data from their workspaces
CREATE POLICY "Users can view workspace threat intelligence"
  ON threat_intelligence FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create threat intelligence"
  ON threat_intelligence FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view workspace document scans"
  ON document_scans FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create document scans"
  ON document_scans FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view workspace financial transactions"
  ON financial_transactions FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create financial transactions"
  ON financial_transactions FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view workspace deepfake detections"
  ON deepfake_detections FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create deepfake detections"
  ON deepfake_detections FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view workspace activity logs"
  ON activity_logs FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_members_updated_at BEFORE UPDATE ON workspace_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threat_intelligence_updated_at BEFORE UPDATE ON threat_intelligence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_scans_updated_at BEFORE UPDATE ON document_scans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deepfake_detections_updated_at BEFORE UPDATE ON deepfake_detections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically add workspace creator as owner
CREATE OR REPLACE FUNCTION add_workspace_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspace_members (workspace_id, user_id, role, status)
  VALUES (NEW.id, NEW.owner_id, 'owner', 'active');
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER add_workspace_owner_trigger AFTER INSERT ON workspaces
  FOR EACH ROW EXECUTE FUNCTION add_workspace_owner();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_user_profile_trigger AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();
