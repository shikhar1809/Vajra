-- Vajra Security Platform - Enhanced Database Schema (Standalone Version)
-- This version works without workspace_id dependencies

-- ============================================
-- SECURITY GRAPH TABLES
-- ============================================

-- Security entities (users, devices, vendors, vulnerabilities, etc.)
CREATE TABLE IF NOT EXISTS security_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'ip', 'user', 'device', 'vendor', 'employee', 
        'asset', 'vulnerability', 'threat', 'code_file', 'api_endpoint', 'domain'
    )),
    name TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    tags TEXT[] DEFAULT '{}',
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationships between entities
CREATE TABLE IF NOT EXISTS security_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES security_entities(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES security_entities(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'accessed', 'depends_on', 'communicates_with', 'has_vulnerability',
        'exploits', 'owns', 'manages', 'triggered', 'blocked', 'similar_to'
    )),
    properties JSONB DEFAULT '{}',
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attack paths discovered
CREATE TABLE IF NOT EXISTS attack_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_nodes UUID[] NOT NULL,
    total_risk FLOAT NOT NULL,
    description TEXT,
    mitigations TEXT[],
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- ============================================
-- SHIELD TABLES
-- ============================================

-- Bot detection results
CREATE TABLE IF NOT EXISTS bot_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET NOT NULL,
    bot_score INTEGER NOT NULL CHECK (bot_score >= 1 AND bot_score <= 99),
    classification TEXT NOT NULL CHECK (classification IN (
        'verified-bot', 'likely-bot', 'likely-human', 'verified-human'
    )),
    action_taken TEXT NOT NULL CHECK (action_taken IN ('allow', 'challenge', 'block')),
    user_agent TEXT,
    signals JSONB DEFAULT '{}',
    detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- CrowdSec decisions cache
CREATE TABLE IF NOT EXISTS crowdsec_cache (
    ip_address INET PRIMARY KEY,
    risk_score INTEGER,
    behaviors TEXT[],
    country TEXT,
    asn TEXT,
    is_blocked BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LLM threat analysis cache
CREATE TABLE IF NOT EXISTS threat_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_hash TEXT NOT NULL,
    is_malicious BOOLEAN NOT NULL,
    attack_type TEXT,
    confidence FLOAT,
    explanation TEXT,
    recommended_action TEXT,
    mitre_attack_mapping TEXT[],
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- ============================================
-- SCOUT TABLES
-- ============================================

-- Enhanced vendor scores
CREATE TABLE IF NOT EXISTS vendor_risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    grade CHAR(1) NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
    
    -- 10 Factor Scores
    network_security_score INTEGER,
    dns_health_score INTEGER,
    patching_cadence_score INTEGER,
    endpoint_security_score INTEGER,
    ip_reputation_score INTEGER,
    application_security_score INTEGER,
    social_engineering_score INTEGER,
    leaked_credentials_score INTEGER,
    tls_configuration_score INTEGER,
    information_disclosure_score INTEGER,
    
    findings JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    scan_duration_ms INTEGER,
    scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor monitoring schedule
CREATE TABLE IF NOT EXISTS vendor_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    scan_interval TEXT NOT NULL CHECK (scan_interval IN ('daily', 'weekly', 'biweekly', 'monthly')),
    next_scan_at TIMESTAMPTZ NOT NULL,
    last_scan_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'pending')),
    data_access_level TEXT DEFAULT 'limited' CHECK (data_access_level IN ('none', 'limited', 'moderate', 'extensive')),
    business_criticality TEXT DEFAULT 'medium' CHECK (business_criticality IN ('low', 'medium', 'high', 'critical'))
);

-- ============================================
-- SENTRY TABLES
-- ============================================

-- Phishing campaigns
CREATE TABLE IF NOT EXISTS phishing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('email', 'qr', 'sms', 'voice')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    topic TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'completed')),
    target_departments TEXT[],
    target_employees UUID[],
    template JSONB NOT NULL,
    launch_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phishing campaign results
CREATE TABLE IF NOT EXISTS phishing_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES phishing_campaigns(id) ON DELETE CASCADE,
    employee_id UUID,
    email_opened BOOLEAN DEFAULT FALSE,
    email_opened_at TIMESTAMPTZ,
    link_clicked BOOLEAN DEFAULT FALSE,
    link_clicked_at TIMESTAMPTZ,
    data_submitted BOOLEAN DEFAULT FALSE,
    data_submitted_at TIMESTAMPTZ,
    reported BOOLEAN DEFAULT FALSE,
    reported_at TIMESTAMPTZ,
    user_agent TEXT,
    ip_address INET
);

-- Employee security scores
CREATE TABLE IF NOT EXISTS employee_security_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID UNIQUE,
    overall_score INTEGER NOT NULL DEFAULT 70 CHECK (overall_score >= 0 AND overall_score <= 100),
    previous_score INTEGER,
    percentile INTEGER,
    rank INTEGER,
    
    -- Component scores
    phishing_resistance_score INTEGER DEFAULT 70,
    training_completion_score INTEGER DEFAULT 0,
    reporting_behavior_score INTEGER DEFAULT 70,
    password_hygiene_score INTEGER DEFAULT 70,
    mfa_compliance_score INTEGER DEFAULT 0,
    data_handling_score INTEGER DEFAULT 70,
    
    -- Streak
    streak_days INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_incident_at TIMESTAMPTZ,
    
    achievements JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AEGIS TABLES
-- ============================================

-- Code scan results
CREATE TABLE IF NOT EXISTS code_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_type TEXT NOT NULL CHECK (scan_type IN ('sast', 'sca', 'secrets', 'full')),
    project_path TEXT,
    security_score INTEGER CHECK (security_score >= 0 AND security_score <= 100),
    
    -- Summary
    total_files INTEGER DEFAULT 0,
    files_scanned INTEGER DEFAULT 0,
    total_issues INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    
    vulnerabilities JSONB DEFAULT '[]',
    dependencies JSONB DEFAULT '[]',
    secrets JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    
    duration_ms INTEGER,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    triggered_by TEXT
);

-- ============================================
-- UNIFIED TABLES
-- ============================================

-- Security alerts
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT NOT NULL CHECK (module IN ('shield', 'scout', 'sentry', 'aegis')),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    context JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved', 'dismissed')),
    escalation_level INTEGER DEFAULT 0,
    
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID,
    resolution TEXT,
    
    notifications_sent JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VSI (Vajra Security Index) history
CREATE TABLE IF NOT EXISTS vsi_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    overall_score INTEGER NOT NULL,
    grade CHAR(1) NOT NULL,
    
    shield_score INTEGER,
    scout_score INTEGER,
    sentry_score INTEGER,
    aegis_score INTEGER,
    
    critical_issues INTEGER DEFAULT 0,
    high_issues INTEGER DEFAULT 0,
    active_threats INTEGER DEFAULT 0,
    
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_security_entities_type ON security_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_security_relationships_source ON security_relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_security_relationships_target ON security_relationships(target_id);

CREATE INDEX IF NOT EXISTS idx_bot_detections_ip ON bot_detections(ip_address);
CREATE INDEX IF NOT EXISTS idx_bot_detections_detected ON bot_detections(detected_at);

CREATE INDEX IF NOT EXISTS idx_vendor_risk_scores_vendor ON vendor_risk_scores(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_monitoring_next ON vendor_monitoring(next_scan_at);

CREATE INDEX IF NOT EXISTS idx_phishing_campaigns_status ON phishing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_phishing_results_campaign ON phishing_results(campaign_id);
CREATE INDEX IF NOT EXISTS idx_employee_scores_employee ON employee_security_scores(employee_id);

CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);

CREATE INDEX IF NOT EXISTS idx_vsi_history_recorded ON vsi_history(recorded_at);

