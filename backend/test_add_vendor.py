import duckdb
con = duckdb.connect('/app/vajra.duckdb')
con.execute("INSERT INTO vendor_risks VALUES ('test_persist', 'Persistence Test Corp', 'Testing', 'Low', 0, '2025-12-25')")
result = con.execute("SELECT vendor_name FROM vendor_risks WHERE vendor_id='test_persist'").fetchone()
print(f'✅ Vendor added: {result[0]}')
