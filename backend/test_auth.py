import requests

BASE_URL = "http://127.0.0.1:8000/api/auth"

def test_auth():
    email = "test409@example.com"
    password = "password123"
    name = "Test User"
    
    # 1. Register
    print("--- 1. Register ---")
    r = requests.post(f"{BASE_URL}/register", json={"name": name, "email": email, "password": password})
    print(r.status_code, r.text)
    
    # Let's get the OTP from the backend log or DB directly, but we can't easily. 
    # Actually, we can just connect to the DB and get the OTP!
    import sqlite3
    conn = sqlite3.connect("../backend/research_assistant.db")
    c = conn.cursor()
    c.execute("SELECT otp FROM users WHERE email=?", (email,))
    row = c.fetchone()
    otp = row[0]
    print(f"OTP found in DB: {otp}")
    
    # 2. Verify OTP
    print("--- 2. Verify OTP ---")
    r = requests.post(f"{BASE_URL}/verify-otp", json={"email": email, "otp": otp})
    print(r.status_code, r.text)
    
    # 3. Login
    print("--- 3. Login ---")
    r = requests.post(f"{BASE_URL}/login", json={"email": email, "password": password})
    print(r.status_code, r.text)
    
    # 4. Register again (should be 409)
    print("--- 4. Register Again ---")
    r = requests.post(f"{BASE_URL}/register", json={"name": name, "email": email, "password": password})
    print(r.status_code, r.text)

if __name__ == "__main__":
    test_auth()
