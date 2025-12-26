import duckdb
import os
from datetime import datetime, timedelta

# Use environment variable for database path
DB_PATH = os.getenv("DATABASE_PATH", "vajra_prod.db")
con = None

def init_db():
    global con
    con = duckdb.connect(DB_PATH)
    
    # Create vendors table
    con.execute("""
        CREATE TABLE IF NOT EXISTS vendors (
            id VARCHAR PRIMARY KEY,
            name VARCHAR,
            category VARCHAR,
            risk_score INTEGER,
            last_audit DATE,
            data_access_level VARCHAR
        );
    """)
    
    # Create threats table
    con.execute("""
        CREATE TABLE IF NOT EXISTS threats (
            id INTEGER PRIMARY KEY,
            timestamp TIMESTAMP,
            source_ip VARCHAR,
            threat_type VARCHAR,
            severity VARCHAR,
            blocked BOOLEAN
        );
    """)
    
    # Create events table for compliance
    con.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY,
            timestamp TIMESTAMP,
            event_type VARCHAR,
            source VARCHAR,
            severity VARCHAR,
            details VARCHAR
        );
    """)
    
    # Create sequences
    con.execute("CREATE SEQUENCE IF NOT EXISTS seq_threats_id START 1")
    con.execute("CREATE SEQUENCE IF NOT EXISTS seq_events_id START 1")
    
    # Seed vendors if empty
    result = con.execute("SELECT count(*) FROM vendors").fetchone()
    if result[0] == 0:
        print("Seeding vendor data...")
        con.execute("""
            INSERT INTO vendors VALUES 
            ('v1', 'CloudFlare', 'Infrastructure', 20, '2024-01-15', 'Critical'),
            ('v2', 'Stripe', 'Finance', 45, '2024-02-01', 'High'),
            ('v3', 'SendGrid', 'Communications', 15, '2024-01-20', 'Medium'),
            ('v4', 'AWS', 'Infrastructure', 30, '2024-02-10', 'Critical'),
            ('v5', 'MongoDB Atlas', 'Database', 25, '2024-01-25', 'High');
        """)
    
    # Seed events if empty
    event_result = con.execute("SELECT count(*) FROM events").fetchone()
    if event_result[0] == 0:
        print("Seeding event data...")
        con.execute("""
            INSERT INTO events VALUES
            (nextval('seq_events_id'), now() - INTERVAL 1 HOUR, 'UNAUTHORIZED_ACCESS', 'API', 'HIGH', 'Failed login from 192.168.1.50'),
            (nextval('seq_events_id'), now() - INTERVAL 3 HOUR, 'CONFIG_CHANGE', 'DASHBOARD', 'MEDIUM', 'Firewall rule updated'),
            (nextval('seq_events_id'), now() - INTERVAL 6 HOUR, 'VENDOR_BREACH', 'VENDOR_MONITOR', 'CRITICAL', 'Simulated breach detected'),
            (nextval('seq_events_id'), now() - INTERVAL 12 HOUR, 'CODE_SCAN', 'SAST', 'HIGH', 'Vulnerability found in upload'),
            (nextval('seq_events_id'), now() - INTERVAL 1 DAY, 'SYSTEM_STARTUP', 'CORE', 'INFO', 'System initialized');
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
            pragma_value = 'ON' if enable else 'OFF'
            con.execute(f"PRAGMA query_only = {pragma_value}")
            mode_str = 'READ_ONLY' if enable else 'READ_WRITE'
            print(f"🔒 FORTRESS MODE: Database locked to {mode_str}")
        except Exception as e:
            print(f"⚠️  Failed to set PRAGMA query_only: {e}")
