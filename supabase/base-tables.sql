-- Base tables for Vajra Security Platform
-- Run this FIRST before enhanced-security-schema.sql
-- This version handles existing tables gracefully

-- ============================================
-- DROP EXISTING INDEXES (if any conflicts)
-- ============================================

DROP INDEX IF EXISTS idx_phishing_checks_checked_at;
DROP INDEX IF EXISTS idx_document_scans_scanned_at;

-- ============================================
-- CORE TABLES
-- ============================================

-- Vendors table (referenced by vendor_risk_scores)
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    security_score INTEGER DEFAULT 0 CHECK (security_score >= 0 AND security_score <= 100),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    compliance_certifications TEXT[] DEFAULT '{}',
    last_assessment TIMESTAMPTZ,
    contact_email TEXT,
    contact_name TEXT,
    description TEXT,
    industry TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Traffic logs (for Shield module)
CREATE TABLE IF NOT EXISTS traffic_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET NOT NULL,
    user_agent TEXT,
    request_method TEXT,
    request_path TEXT,
    status_code INTEGER,
    response_time_ms INTEGER,
    country TEXT,
    city TEXT,
    is_bot BOOLEAN DEFAULT FALSE,
    bot_score INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Anomaly events (for Shield module)
CREATE TABLE IF NOT EXISTS anomaly_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('traffic_spike', 'unusual_pattern', 'bot_attack', 'ddos', 'suspicious_ip')),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    description TEXT,
    ip_address INET,
    request_count INTEGER,
    threshold_exceeded FLOAT,
    bunker_mode_activated BOOLEAN DEFAULT FALSE,
    resolved BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Phishing checks (for Sentry module)
CREATE TABLE IF NOT EXISTS phishing_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    is_safe BOOLEAN NOT NULL,
    threat_level TEXT NOT NULL CHECK (threat_level IN ('safe', 'suspicious', 'dangerous', 'malicious')),
    confidence FLOAT,
    threats TEXT[],
    recommendations TEXT[],
    checked_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document scans (for Sentry module)
CREATE TABLE IF NOT EXISTS document_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    is_safe BOOLEAN NOT NULL,
    threat_level TEXT NOT NULL CHECK (threat_level IN ('safe', 'suspicious', 'dangerous', 'malicious')),
    threats TEXT[],
    recommendations TEXT[],
    metadata JSONB DEFAULT '{}',
    scanned_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_vendors_domain ON vendors(domain);
CREATE INDEX IF NOT EXISTS idx_vendors_security_score ON vendors(security_score);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_timestamp ON traffic_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_ip ON traffic_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_anomaly_events_timestamp ON anomaly_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_events_severity ON anomaly_events(severity);
CREATE INDEX IF NOT EXISTS idx_phishing_checks_created_at ON phishing_checks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_scans_created_at ON document_scans(created_at DESC);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample vendors
INSERT INTO vendors (name, domain, security_score, status, compliance_certifications)
VALUES 
    ('Example Cloud Services', 'example-cloud.com', 85, 'active', ARRAY['SOC 2', 'ISO 27001']),
    ('SecureVendor Inc', 'securevendor.io', 92, 'active', ARRAY['SOC 2', 'ISO 27001', 'GDPR'])
ON CONFLICT (domain) DO NOTHING;
