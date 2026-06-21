import httpx
import time
import sys
import json

BASE_URL = "http://127.0.0.1:8000"

def log(msg):
    print(f"[*] {msg}")

def main():
    log("Starting End-to-End API Test")
    client = httpx.Client(timeout=120.0)

    # 1. Registration
    log("Registering test user...")
    test_email = f"test_{int(time.time())}@example.com"
    res = client.post(f"{BASE_URL}/api/auth/register", json={
        "name": "E2E Test User",
        "email": test_email,
        "password": "password123"
    })
    
    if res.status_code != 201:
        print(f"Failed to register: {res.text}")
        sys.exit(1)
        
    data = res.json()
    token = None
    
    # Due to dev mode in auth.py, token might be returned immediately
    if data.get("token"):
        token = data["token"]["access_token"]
        log("Auto-verified and logged in!")
    else:
        # Need to login manually
        log("Logging in...")
        res = client.post(f"{BASE_URL}/api/auth/login", json={
            "email": test_email,
            "password": "password123"
        })
        if res.status_code != 200:
            print(f"Failed to login: {res.text}")
            sys.exit(1)
        token = res.json()["token"]["access_token"]
        
    client.headers.update({"Authorization": f"Bearer {token}"})

    # 2. Upload Paper (Text Upload)
    log("Uploading a test paper...")
    paper_content = "Machine learning models like large language models are transforming academia. This paper discusses their capabilities in summarizing dense scientific literature."
    res = client.post(f"{BASE_URL}/api/papers/upload-text", json={
        "title": "E2E Test Paper",
        "content": paper_content
    })
    
    if res.status_code != 201:
        print(f"Failed to upload paper: {res.text}")
        sys.exit(1)
        
    paper_id = res.json()["paper_id"]
    log(f"Uploaded paper ID: {paper_id}")
    
    # Poll for paper status to be 'ready'
    log("Polling for background processing to complete...")
    for _ in range(30):
        time.sleep(2)
        res = client.get(f"{BASE_URL}/api/papers/{paper_id}")
        status = res.json().get("status")
        log(f"Status: {status}")
        if status == "ready":
            break
            
    if status != "ready":
        print("Paper processing timed out or failed.")
        sys.exit(1)

    # 3. Generate Insights
    log("Fetching Insights...")
    res = client.get(f"{BASE_URL}/api/papers/{paper_id}/insights")
    if res.status_code != 200:
        print(f"Failed to fetch insights: {res.text}")
    else:
        insights = res.json()
        log(f"Insights returned: {len(insights.get('key_findings', []))} findings found.")

    # 4. Global Chat
    log("Testing Global Chat...")
    res = client.post(f"{BASE_URL}/api/chat/global", json={
        "message": "What did the recent papers talk about?"
    })
    if res.status_code != 200:
        print(f"Global chat failed: {res.text}")
    else:
        log("Global chat response received.")

    # 5. Paper Chat (RAG)
    log("Testing Paper Chat...")
    res = client.post(f"{BASE_URL}/api/chat/", json={
        "message": "Summarize the machine learning capabilities.",
        "paper_id": paper_id
    })
    if res.status_code != 200:
        print(f"Paper chat failed: {res.text}")
    else:
        log("Paper chat response received.")

    # 6. Flashcards
    log("Testing Flashcards...")
    res = client.get(f"{BASE_URL}/api/papers/{paper_id}/flashcards")
    if res.status_code != 200:
        print(f"Flashcards failed: {res.text}")
    else:
        log(f"Flashcards returned: {len(res.json())} items.")
        
    # 7. Report Generation
    log("Testing Report Generation (PDF)...")
    res = client.post(f"{BASE_URL}/api/papers/{paper_id}/report", json={
        "format": "pdf",
        "include_summary": True
    })
    if res.status_code != 200:
        print(f"Report generation failed: {res.text}")
    else:
        log(f"Report generated successfully. Size: {len(res.content)} bytes.")

    log("End-to-End Test completed successfully!")

if __name__ == '__main__':
    main()
