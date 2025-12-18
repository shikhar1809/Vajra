-- ============================================================================
-- THREAT INTELLIGENCE TABLES (MalwareBazaar Integration)
-- ============================================================================

-- Malware hash database
CREATE TABLE malware_hashes (
  hash TEXT PRIMARY KEY,
  hash_type TEXT NOT NULL CHECK (hash_type IN ('sha256', 'md5', 'sha1')),
  malware_family TEXT,
  file_type TEXT,
  tags TEXT[],
  threat_level INTEGER CHECK (threat_level >= 1 AND threat_level <= 10),
  source TEXT NOT NULL CHECK (source IN ('malwarebazaar', 'threatfox', 'urlhaus', 'circl', 'alienvault')),
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Malicious URLs
CREATE TABLE malicious_urls (
  url TEXT PRIMARY KEY,
  url_status TEXT CHECK (url_status IN ('online', 'offline', 'unknown')),
  threat_type TEXT CHECK (threat_type IN ('malware', 'phishing', 'c2', 'exploit')),
  tags TEXT[],
  source TEXT NOT NULL CHECK (source IN ('malwarebazaar', 'threatfox', 'urlhaus', 'alienvault')),
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- C2 servers
CREATE TABLE c2_servers (
  ip_address TEXT PRIMARY KEY,
  port INTEGER,
  malware_family TEXT,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  source TEXT NOT NULL CHECK (source IN ('threatfox', 'alienvault')),
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update logs
CREATE TABLE threat_feed_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  records_added INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  error_message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document scan history
CREATE TABLE document_scan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  threat_level TEXT NOT NULL CHECK (threat_level IN ('safe', 'suspicious', 'dangerous', 'malicious')),
  is_safe BOOLEAN NOT NULL,
  threats JSONB,
  metadata JSONB,
  employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_malware_hash ON malware_hashes(hash);
CREATE INDEX idx_malware_family ON malware_hashes(malware_family);
CREATE INDEX idx_malware_source ON malware_hashes(source);
CREATE INDEX idx_malicious_url ON malicious_urls(url);
CREATE INDEX idx_malicious_url_type ON malicious_urls(threat_type);
CREATE INDEX idx_c2_ip ON c2_servers(ip_address);
CREATE INDEX idx_c2_family ON c2_servers(malware_family);
CREATE INDEX idx_threat_updates_source ON threat_feed_updates(source);
CREATE INDEX idx_threat_updates_time ON threat_feed_updates(updated_at DESC);
CREATE INDEX idx_document_scan_hash ON document_scan_history(file_hash);
CREATE INDEX idx_document_scan_employee ON document_scan_history(employee_id);

-- Enable RLS on threat intelligence tables
ALTER TABLE malware_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE malicious_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE c2_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_feed_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_scan_history ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE malware_hashes IS 'Sentry: Malware hash database from threat feeds';
COMMENT ON TABLE malicious_urls IS 'Sentry: Malicious URL database';
COMMENT ON TABLE c2_servers IS 'Sentry: Command & Control server tracking';
COMMENT ON TABLE threat_feed_updates IS 'Sentry: Threat intelligence update logs';
COMMENT ON TABLE document_scan_history IS 'Sentry: Document analysis results';
