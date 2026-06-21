from google import genai
import sys

def test(api_key):
    try:
        client = genai.Client(api_key=api_key)
        # Attempt to list files or get model just to test authentication
        model = client.models.get(model="gemini-2.0-flash")
        print(f"Success! Model name: {model.name}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    key = sys.argv[1]
    test(key)
