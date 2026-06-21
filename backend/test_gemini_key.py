import asyncio
# pyrefly: ignore [missing-import]
import google.generativeai as genai
# pyrefly: ignore [missing-import]
from google.oauth2.credentials import Credentials

key = "YOUR_API_KEY"

async def test_as_api_key():
    print("\n--- Testing as API Key ---")
    genai.configure(api_key=key)
    model = genai.GenerativeModel("gemini-2.0-flash")
    try:
        response = await model.generate_content_async("Hello")
        print("SUCCESS! Response:", response.text)
    except Exception as e:
        print("FAILED as API Key:", str(e))

async def test_as_oauth():
    print("\n--- Testing as OAuth Token ---")
    creds = Credentials(token=key)
    genai.configure(credentials=creds)
    model = genai.GenerativeModel("gemini-2.0-flash")
    try:
        response = await model.generate_content_async("Hello")
        print("SUCCESS! Response:", response.text)
    except Exception as e:
        print("FAILED as OAuth Token:", str(e))

async def main():
    await test_as_api_key()
    await test_as_oauth()

if __name__ == "__main__":
    asyncio.run(main())
