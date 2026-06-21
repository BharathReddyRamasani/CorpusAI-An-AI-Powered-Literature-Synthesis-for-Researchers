import os
import glob

def replace_in_file(filepath, old, new):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if old in content:
        content = content.replace(old, new)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')

search_dirs = [r'd:\AI Research Assistant\backend\app\api', r'd:\AI Research Assistant\backend\app\models', r'd:\AI Research Assistant\backend\app\prompts']
for search_dir in search_dirs:
    for root, _, files in os.walk(search_dir):
        for name in files:
            if name.endswith('.py'):
                filepath = os.path.join(root, name)
                replace_in_file(filepath, 'app.utils.gemini', 'app.utils.groq_client')
                replace_in_file(filepath, 'call_gemini_api_with_rotation', 'call_groq_api_with_rotation')
                replace_in_file(filepath, 'ChatGoogleGenerativeAI', 'ChatGroq')
                replace_in_file(filepath, 'langchain_google_genai', 'langchain_groq')
                replace_in_file(filepath, 'Gemini', 'Groq')
                replace_in_file(filepath, 'gemini', 'groq')

