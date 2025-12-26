import duckdb

def seed_database():
    # 1. Connect to the persistent database file
    db = duckdb.connect('vajra_prod.db')
    print("Connected to vajra_prod.db...")

    # SKIPPING CREATE TABLE to avoid conflicts with existing Schema.
    # We assume 'vendors' and 'bills' exist from backend/database.py init.

    # 3. Seed "CloudFlare" as a verified vendor
    # ADAPTATION: Mapped 'verified_bank_details' -> 'bank_hash' to match actual schema.
    # Also filled other required columns with safe defaults.
    print("Seeding CloudFlare into 'vendors'...")
    db.execute("""
        INSERT OR REPLACE INTO vendors (id, name, category, risk_score, criticality, tax_id, bank_hash, data_access_level, last_audit_date)
        VALUES ('v1', 'CloudFlare', 'Infrastructure', 10, 'LOW', 'TAX-8821', 'HASH_CF_001', 'Safe', '2024-01-01');
    """)

    # 4. Seed historical bills to establish a "Normal" spending velocity
    # ADAPTATION: ID is VARCHAR field 'b...' in actual schema. 
    # Added 'is_sus' and 'details' columns.
    historical_bills = [
        ('b101', 'v1', 1050.00, '2025-10-01', False, 'Historical Baseline'),
        ('b102', 'v1', 980.00, '2025-11-01', False, 'Historical Baseline'),
        ('b103', 'v1', 1100.00, '2025-12-01', False, 'Historical Baseline')
    ]

    print("Seeding historical bills...")
    for bill in historical_bills:
        db.execute("INSERT OR REPLACE INTO bills (id, vendor_id, amount, bill_date, is_sus, details) VALUES (?, ?, ?, ?, ?, ?)", bill)

    print("✅ Database successfully seeded with CloudFlare ground truth.")
    print("Historical Average for CloudFlare: ~$1,043")
    print("Verified Bank Details: HASH_CF_001")
    
    # Verify the data
    print("\nCurrent CloudFlare Record:")
    db.sql("SELECT name, bank_hash, tax_id FROM vendors WHERE id='v1'").show()
    db.close()

if __name__ == "__main__":
    seed_database()
