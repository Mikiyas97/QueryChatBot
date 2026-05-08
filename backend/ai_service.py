import os
import json
import google.generativeai as genai
from database import get_schema

# Load configuration from environment
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
MODEL_NAME = os.getenv('MODEL_NAME', 'gemini-2.5-flash')

# Lazy initialization of the chat session
_chat_session = None

def get_chat_session():
    global _chat_session
    if _chat_session is None:
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set in environment variables.")
            
        genai.configure(api_key=GEMINI_API_KEY)
        schema = get_schema()
        
        system_prompt = f"""You are an expert SQL generator and data assistant. Use ONLY the database schema provided.

here is the database schema:
{schema}

Rules:
- Return a JSON object with two keys:
    1. "explanation": A brief, friendly explanation of what you are doing or what you found.
    2. "sql_query": The raw SQL query to get the data.
- If the user asks a general question that doesn't require a database query (e.g., "Hi", "What can you do?", "Who made you?"), answer in the "explanation" and set "sql_query" to "NONE".
- Do NOT invent tables or columns that are not in the schema.
- Fix typos and messy input in user questions automatically.
- Use JOINs if necessary, based on the schema relationships.
- Return ONLY the JSON object. No markdown formatting.
"""
        
        model = genai.GenerativeModel(
            model_name=MODEL_NAME, 
            system_instruction=system_prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        _chat_session = model.start_chat(history=[])
    return _chat_session

def ask_gemini(question):
    session = get_chat_session()
    response = session.send_message(question)
    return json.loads(response.text)
