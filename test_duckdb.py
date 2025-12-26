import duckdb
try:
    con = duckdb.connect()
    con.execute("CREATE SEQUENCE seq_test START 1")
    res = con.execute("SELECT nextval('seq_test')").fetchone()
    print(f"Sequence Result: {res[0]}")
except Exception as e:
    print(f"Error: {e}")
