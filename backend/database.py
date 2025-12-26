import duckdb
import os

# Use environment variable for database path, fallback to local
DB_PATH = os.getenv("DATABASE_PATH", "vajra.duckdb")
con = None

def init_db():
    global con
    con = duckdb.connect(DB_PATH)
    
    # Initialize v3.0 Tables
    con.execute("""
        CREATE TABLE IF NOT EXISTS vendors (
            id VARCHAR PRIMARY KEY,
            name VARCHAR,
            category VARCHAR,
            risk_score INTEGER,
            criticality VARCHAR,
            tax_id VARCHAR,
            bank_hash VARCHAR,
            data_access_level VARCHAR,
            last_audit_date DATE
        );
        
        CREATE TABLE IF NOT EXISTS bills (
            id VARCHAR PRIMARY KEY,
            vendor_id VARCHAR,
            amount DECIMAL(10, 2),
            bill_date DATE,
            is_sus BOOLEAN,
            details VARCHAR,
            FOREIGN KEY (vendor_id) REFERENCES vendors(id)
        );

        CREATE TABLE IF NOT EXISTS compliance_logs (
            id VARCHAR PRIMARY KEY,
            action_taken VARCHAR,
            ai_evidence_summary VARCHAR,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY,
            timestamp TIMESTAMP,
            event_type VARCHAR,
            source VARCHAR,
            severity VARCHAR,
            details VARCHAR
        );
    """)
    
    # Init Events Sequence
    con.execute("CREATE SEQUENCE IF NOT EXISTS seq_events_id START 1")
    con.execute("CREATE SEQUENCE IF NOT EXISTS seq_bills_id START 1")
    
    # Create View for Backward Compatibility & Risk Calculation
    con.execute("""
        CREATE OR REPLACE VIEW vendor_risk_scores AS
        SELECT 
            id as vendor_id,
            name as vendor_name,
            category,
            data_access_level,
            0 as cve_count, -- Placeholder until CVE table linked
            risk_score
        FROM vendors;
    """)

    con.execute("""
        CREATE TABLE IF NOT EXISTS employees (
            id VARCHAR PRIMARY KEY,
            email VARCHAR UNIQUE,
            name VARCHAR,
            department VARCHAR,
            risk_score INTEGER, -- 0-100
            training_status VARCHAR, -- 'Up-to-Date', 'Overdue', 'Remedial-Required'
            last_phishing_test_result VARCHAR, -- 'Passed', 'Clicked', 'Submitted-Creds'
            failed_login_count_24h INTEGER
        );

        CREATE TABLE IF NOT EXISTS compliance_controls (
            control_id VARCHAR PRIMARY KEY, -- e.g. SOC2-CC6.1
            framework VARCHAR, -- SOC2, GDPR
            description VARCHAR,
            status VARCHAR, -- Passing, At-Risk, Failing
            automated_evidence_source VARCHAR,
            last_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Seed v3.0 SMB Employee data
    result = con.execute("SELECT count(*) FROM employees").fetchone()
    if result[0] == 0:
        print("Seeding v3.0 SMB Employee data...")
        con.execute("""
            INSERT OR IGNORE INTO employees VALUES
            ('e1', 'alice@company.com', 'Alice Smith', 'Finance', 15, 'Up-to-Date', 'Passed', 0),
            ('e2', 'bob@company.com', 'Bob Jones', 'Engineering', 95, 'Remedial-Required', 'Submitted-Creds', 3),
            ('e3', 'charlie@company.com', 'Charlie Day', 'Sales', 65, 'Overdue', 'Clicked', 1),
            ('e4', 'dave@company.com', 'Dave Grohl', 'Engineering', 10, 'Up-to-Date', 'Passed', 0),
            ('e5', 'eve@company.com', 'Eve Polastri', 'HR', 45, 'Overdue', 'Passed', 0);
        """)

    # Seed v3.0 SMB Compliance data
    result = con.execute("SELECT count(*) FROM compliance_controls").fetchone()
    if result[0] == 0:
        print("Seeding v3.0 SMB Compliance data...")
        con.execute("""
            INSERT OR IGNORE INTO compliance_controls VALUES
            ('CC6.1', 'SOC2', 'Logical Access Security', 'Passing', 'vendors', now()),
            ('CC6.2', 'SOC2', 'User Access Provisioning', 'At-Risk', 'employees', now()),
            ('CC6.3', 'SOC2', 'Least Privilege', 'Failing', 'employees', now()),
            ('CC7.1', 'SOC2', 'Vulnerability Management', 'Passing', 'vendors', now()),
            ('ART.32', 'GDPR', 'Security of Processing', 'Passing', 'vendors', now()),
            ('ART.33', 'GDPR', 'Breach Notification', 'At-Risk', 'events', now());
        """)

    # Seed Vendors
    result = con.execute("SELECT count(*) FROM vendors").fetchone()
    if result[0] == 0:
        print("Seeding v3.0 vendor data...")
        con.execute("""
            INSERT OR IGNORE INTO vendors VALUES 
            ('v1', 'CloudFlare', 'Infrastructure', 10, 'CRITICAL', 'TAX-8821', 'HASH_CF_001', 'Critical', '2024-01-01'),
            ('v2', 'Stripe', 'Finance', 35, 'HIGH', 'TAX-9922', 'HASH_ST_002', 'High', '2024-02-15'),
            ('v3', 'Legacy CRM', 'SaaS', 65, 'MEDIUM', 'TAX-1100', 'HASH_LC_003', 'Medium', '2023-11-20');
        """)
    
    # Seed Events
    event_result = con.execute("SELECT count(*) FROM events").fetchone()
    if event_result[0] == 0:
        print("Seeding dummy event data...")
        con.execute("""
            INSERT OR IGNORE INTO events VALUES
            (nextval('seq_events_id'), now() - INTERVAL 1 HOUR, 'UNAUTHORIZED_ACCESS', 'API', 'HIGH', 'Failed login attempt from ip 192.168.1.50'),
            (nextval('seq_events_id'), now() - INTERVAL 2 HOUR, 'CONFIG_CHANGE', 'DASHBOARD', 'MEDIUM', 'Firewall rule updated by admin'),
            (nextval('seq_events_id'), now() - INTERVAL 5 HOUR, 'TRAFFIC_SPIKE', 'SHIELD', 'LOW', 'Traffic increased by 15%'),
            (nextval('seq_events_id'), now() - INTERVAL 1 DAY, 'SYSTEM_STARTUP', 'CORE', 'INFO', 'System initialized successfully');
        """)

def get_db_con():
    return con

def close_db():
    global con
    if con:
        con.close()

def set_readonly_mode(enable: bool):
    global con
    if con:
        try:
            # Enforce Database Level Block using PRAGMA query_only
            # This physically locks the database from any write operations
            pragma_value = 'ON' if enable else 'OFF'
            con.execute(f"PRAGMA query_only = {pragma_value}")
            
            mode_str = 'READ_ONLY' if enable else 'READ_WRITE'
            print(f"🔒 FORTRESS MODE: Database locked to {mode_str} via PRAGMA query_only = {pragma_value}")
        except Exception as e:
            print(f"⚠️  CRITICAL: Failed to set PRAGMA query_only: {e}")
            # Fallback: Middleware will still block HTTP writes
            if enable:
                print("⚡ Middleware enforcement active as fallback")


