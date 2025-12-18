-- Vajra Cybersecurity Platform - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Organizations Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{
        "shield_enabled": true,
        "scout_enabled": true,
        "sentry_enabled": true,
        "agenios_enabled": true,
        "anomaly_threshold": 3,
        "bunker_mode_auto_activate": true
    }'::jsonb
);

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- VAJRA SHIELD TABLES
-- ============================================================================

-- Traffic Logs
CREATE TABLE traffic_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    endpoint TEXT NOT NULL,
    response_time INTEGER, -- in milliseconds
    status_code INTEGER,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_traffic_logs_timestamp ON traffic_logs(timestamp DESC);
CREATE INDEX idx_traffic_logs_org ON traffic_logs(organization_id);

-- Anomaly Events
CREATE TABLE anomaly_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type TEXT NOT NULL CHECK (type IN ('traffic_spike', 'unusual_pattern', 'suspicious_ip', 'bot_activity')),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    description TEXT NOT NULL,
    metrics JSONB,
    bunker_mode_activated BOOLEAN DEFAULT FALSE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_anomaly_events_timestamp ON anomaly_events(timestamp DESC);

-- Bunker Challenges
CREATE TABLE bunker_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_type TEXT NOT NULL CHECK (challenge_type IN ('otp', 'pen_tool', 'captcha', 'behavioral', 'device_fingerprint')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
);

-- Whitelists
CREATE TABLE whitelists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- VAJRA SCOUT TABLES
-- ============================================================================

-- Vendors
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    contact_email TEXT,
    security_score INTEGER CHECK (security_score >= 0 AND security_score <= 100),
    last_assessment TIMESTAMP WITH TIME ZONE,
    compliance_certifications TEXT[],
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor Assessments
CREATE TABLE vendor_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ssl_score INTEGER CHECK (ssl_score >= 0 AND ssl_score <= 100),
    breach_history_score INTEGER CHECK (breach_history_score >= 0 AND breach_history_score <= 100),
    compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
    dns_security_score INTEGER CHECK (dns_security_score >= 0 AND dns_security_score <= 100),
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    findings JSONB
);

-- Breach Incidents
CREATE TABLE breach_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT NOT NULL,
    affected_records INTEGER,
    data_types TEXT[],
    resolution_status TEXT CHECK (resolution_status IN ('open', 'investigating', 'resolved')),
    attribution_confidence INTEGER CHECK (attribution_confidence >= 0 AND attribution_confidence <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- VAJRA SENTRY TABLES
-- ============================================================================

-- Employee Locations
CREATE TABLE employee_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_within_geofence BOOLEAN DEFAULT FALSE,
    network_ssid TEXT,
    device_id TEXT
);

CREATE INDEX idx_employee_locations_timestamp ON employee_locations(timestamp DESC);

-- Geofences
CREATE TABLE geofences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phishing Checks
CREATE TABLE phishing_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    check_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_safe BOOLEAN NOT NULL,
    threat_types TEXT[],
    source TEXT CHECK (source IN ('google_safe_browsing', 'custom_algorithm', 'blacklist'))
);

-- Document Scans
CREATE TABLE document_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scan_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_clean BOOLEAN NOT NULL,
    threats_found JSONB,
    scan_engine TEXT
);

-- ============================================================================
-- VAJRA AGENIOS TABLES
-- ============================================================================

-- Code Scans
CREATE TABLE code_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name TEXT NOT NULL,
    repository_url TEXT,
    scan_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    total_files INTEGER,
    lines_of_code INTEGER,
    vulnerabilities_found INTEGER,
    security_score INTEGER CHECK (security_score >= 0 AND security_score <= 100),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE
);

-- Vulnerabilities
CREATE TABLE vulnerabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID REFERENCES code_scans(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    file_path TEXT NOT NULL,
    line_number INTEGER,
    description TEXT NOT NULL,
    cwe_id TEXT,
    cvss_score DECIMAL(3, 1),
    recommendation TEXT,
    code_snippet TEXT
);

CREATE INDEX idx_vulnerabilities_scan ON vulnerabilities(scan_id);
CREATE INDEX idx_vulnerabilities_severity ON vulnerabilities(severity);

-- Attack Simulations
CREATE TABLE attack_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID REFERENCES code_scans(id) ON DELETE CASCADE,
    attack_type TEXT NOT NULL,
    target_endpoint TEXT,
    execution_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    details TEXT,
    impact_assessment TEXT
);

-- Security Reports
CREATE TABLE security_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID REFERENCES code_scans(id) ON DELETE CASCADE,
    generated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executive_summary TEXT,
    vulnerability_breakdown JSONB,
    compliance_status JSONB,
    recommendations TEXT[],
    pdf_url TEXT
);

-- ============================================================================
-- SHARED TABLES
-- ============================================================================

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('alert', 'info', 'warning', 'success')),
    severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    module TEXT CHECK (module IN ('shield', 'scout', 'sentry', 'agenios'))
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bunker_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitelists ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE breach_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE phishing_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE attack_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Example RLS Policy (customize based on your auth setup)
-- Users can only see data from their organization
CREATE POLICY "Users can view their organization's data" ON traffic_logs
    FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update vendor security score
CREATE OR REPLACE FUNCTION update_vendor_security_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE vendors
    SET security_score = NEW.overall_score,
        last_assessment = NEW.assessment_date
    WHERE id = NEW.vendor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update vendor score
CREATE TRIGGER trigger_update_vendor_score
    AFTER INSERT ON vendor_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_security_score();

-- Function to calculate code scan security score
CREATE OR REPLACE FUNCTION calculate_scan_security_score()
RETURNS TRIGGER AS $$
DECLARE
    critical_count INTEGER;
    high_count INTEGER;
    medium_count INTEGER;
    low_count INTEGER;
    score INTEGER;
BEGIN
    SELECT 
        COUNT(*) FILTER (WHERE severity = 'critical'),
        COUNT(*) FILTER (WHERE severity = 'high'),
        COUNT(*) FILTER (WHERE severity = 'medium'),
        COUNT(*) FILTER (WHERE severity = 'low')
    INTO critical_count, high_count, medium_count, low_count
    FROM vulnerabilities
    WHERE scan_id = NEW.scan_id;

    -- Calculate score (100 - weighted penalties)
    score := 100 - (critical_count * 20) - (high_count * 10) - (medium_count * 5) - (low_count * 2);
    score := GREATEST(0, LEAST(100, score));

    UPDATE code_scans
    SET security_score = score,
        vulnerabilities_found = critical_count + high_count + medium_count + low_count
    WHERE id = NEW.scan_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate security score
CREATE TRIGGER trigger_calculate_scan_score
    AFTER INSERT ON vulnerabilities
    FOR EACH ROW
    EXECUTE FUNCTION calculate_scan_security_score();

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- Insert sample organization
INSERT INTO organizations (name, industry) VALUES ('Demo Company', 'Technology');

-- Get the organization ID
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE name = 'Demo Company';

    -- Insert sample vendors
    INSERT INTO vendors (name, domain, security_score, organization_id, compliance_certifications) VALUES
    ('CloudStorage Inc.', 'cloudstorage.com', 85, org_id, ARRAY['SOC 2', 'ISO 27001']),
    ('PaymentGateway Pro', 'paymentgateway.com', 72, org_id, ARRAY['PCI DSS']),
    ('EmailService Ltd', 'emailservice.com', 45, org_id, ARRAY[]::TEXT[]);
END $$;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_vendors_org ON vendors(organization_id);
CREATE INDEX idx_code_scans_org ON code_scans(organization_id);
CREATE INDEX idx_geofences_org ON geofences(organization_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE organizations IS 'Stores organization/company information';
COMMENT ON TABLE users IS 'User accounts with role-based access';
COMMENT ON TABLE traffic_logs IS 'Shield: HTTP traffic monitoring logs';
COMMENT ON TABLE anomaly_events IS 'Shield: Detected security anomalies';
COMMENT ON TABLE bunker_challenges IS 'Shield: User verification challenges';
COMMENT ON TABLE vendors IS 'Scout: Third-party vendor information';
COMMENT ON TABLE vendor_assessments IS 'Scout: Security assessment results';
COMMENT ON TABLE breach_incidents IS 'Scout: Data breach tracking';
COMMENT ON TABLE employee_locations IS 'Sentry: Employee geolocation data';
COMMENT ON TABLE phishing_checks IS 'Sentry: URL safety verification';
COMMENT ON TABLE document_scans IS 'Sentry: Malware scan results';
COMMENT ON TABLE code_scans IS 'Agenios: Code security analysis';
COMMENT ON TABLE vulnerabilities IS 'Agenios: Detected code vulnerabilities';
COMMENT ON TABLE attack_simulations IS 'Agenios: Penetration test results';
