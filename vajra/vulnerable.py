# vulnerable.py - Test file with hardcoded secrets
API_KEY = "sk-1234567890abcdef"  # Hardcoded API key
password = "admin123"  # Hardcoded password
db_connection = "postgresql://user:pass@localhost/db"  # Hardcoded credentials

def authenticate(user_input):
    # SQL Injection vulnerability
    query = f"SELECT * FROM users WHERE username = '{user_input}'"
    return query
