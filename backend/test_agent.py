import requests
import time

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("=== Agentic RAG Test Script ===")
    
    # 1. Login to get token
    # Note: Assumes you have created an auto-verified dev account named test@example.com
    email = "test@example.com"
    password = "password123"
    print(f"\n[1] Logging in as {email}...")
    
    # We will try to register first (it will auto-verify)
    requests.post(f"{BASE_URL}/auth/register", json={"name": "Test", "email": email, "password": password})
    
    # Login
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if res.status_code != 200:
        print(f"FAILED TO LOGIN: {res.text}")
        print("Please create an account manually or ensure the backend is running.")
        return
        
    token = res.json()["token"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful.")

    # 2. Get papers to find a valid paper_id
    print("\n[2] Fetching available papers...")
    res = requests.get(f"{BASE_URL}/papers", headers=headers)
    papers = res.json().get("papers", [])
    
    ready_papers = [p for p in papers if p["status"] == "ready"]
    if not ready_papers:
        print("No 'ready' papers found! Please upload a PDF in the frontend first so we can test Q&A.")
        return
        
    paper_id = ready_papers[0]["paper_id"]
    title = ready_papers[0]["title"]
    print(f"Selected Paper: {title} ({paper_id})")

    # 3. Test multiple diverse questions
    questions = [
        "What is the main finding of this paper?", # General summary
        "What datasets or specific methodologies did the authors use?", # Specific factual retrieval
        "Please compare the results of this paper with any previous work mentioned in the text.", # Analytical reasoning
    ]

    for i, q in enumerate(questions):
        print(f"\n[Test {i+1}] Asking: {q}")
        start_time = time.time()
        
        chat_res = requests.post(
            f"{BASE_URL}/chat", 
            json={"paper_id": paper_id, "question": q},
            headers=headers
        )
        
        duration = time.time() - start_time
        
        if chat_res.status_code == 200:
            data = chat_res.json()
            answer = data.get("answer", "")
            sources = data.get("sources", [])
            print(f"✅ Success ({duration:.2f}s)")
            print(f"Answer snippet: {answer[:150]}...")
            print(f"Sources used: {len(sources)}")
        else:
            print(f"❌ Failed ({duration:.2f}s)")
            print(f"Status Code: {chat_res.status_code}")
            print(f"Error: {chat_res.text}")

    print("\n=== Testing Complete ===")

if __name__ == "__main__":
    run_tests()
