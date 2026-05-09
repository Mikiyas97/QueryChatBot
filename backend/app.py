import os
import json
import psycopg2
from flask import Flask, jsonify, render_template, request, send_from_directory
import google.generativeai as genai
from dotenv import load_dotenv, find_dotenv

# Load environment variables
load_dotenv(find_dotenv())

# Get absolute path of the backend directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'templates'),
    static_folder=os.path.join(BASE_DIR, 'static')
)

# Configs
DATABASE_URL = os.getenv('DATABASE_URL')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
MODEL_NAME = os.getenv('MODEL_NAME', 'gemini-2.5-flash')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, sslmode='require')

def get_schema():
    print("Attempting to load schema from PostgreSQL")
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public';
        """)
        columns = cur.fetchall()
        cur.close()
        conn.close()
        
        if not columns:
            return "Error: Database is empty (no tables found)."
            
        schema = "Database schema (Tables and Columns):\n"
        for table, col, dtype in columns:
            schema += f"{table}: {col} ({dtype})\n"
        print("Schema loaded successfully.")
        return schema
    except Exception as e:
        print(f"Error loading schema: {str(e)}")
        return f"Error loading schema: {str(e)}"

# Lazy load AI to prevent crash if API key is missing at start
_chat_session = None

def get_chat():
    global _chat_session
    if _chat_session is None:
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is missing")
        
        genai.configure(api_key=GEMINI_API_KEY)
        schema = get_schema()
        
        system_prompt = f"""You are an expert SQL generator and data assistant. Use ONLY the database schema provided.

here is the database schema:
{schema}

Rules:
- Return a JSON object with two keys:
    1. "explanation": A brief, friendly explanation of what you are doing or what you found.
    2. "sql_query": The raw SQL query to get the data.
- If the user asks a general question that doesn't require a database query, answer in the "explanation" and set "sql_query" to "NONE".
- Return ONLY the JSON object. No markdown formatting.
"""
        # Configure model
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # In newer versions of the library, we can't always pass system_instruction 
        # as a keyword if the version pinned is somehow overridden or cached.
        # We will use the start_chat with a system message in history or 
        # simply use the system_instruction attribute if it's modern.
        try:
            # Modern way
            model = genai.GenerativeModel(
                model_name=MODEL_NAME, 
                system_instruction=system_prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            _chat_session = model.start_chat(history=[])
        except TypeError:
            # Fallback for very old versions (though >=0.4.0 should be fine)
            _chat_session = model.start_chat(history=[
                {"role": "user", "parts": [system_prompt]},
                {"role": "model", "parts": ["Understood. I will act as your SQL generator with the provided schema and rules."]}
            ])
    return _chat_session

@app.route("/", methods=["GET"])
def main():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "").strip() if data else ""

    if not question:
        return jsonify({"error": "Empty question"}), 400

    try:
        chat = get_chat()
        response = chat.send_message(question)
        res_data = json.loads(response.text)
        
        explanation = res_data.get("explanation", "")
        query = res_data.get("sql_query", "").strip()

        columns, results = [], []
        if query and query.upper() != "NONE":
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute(query)
            results = cur.fetchall()
            columns = [desc[0].upper() for desc in cur.description]
            cur.close()
            conn.close()

        return jsonify({
            "question": question,
            "explanation": explanation,
            "query": query if query.upper() != "NONE" else None,
            "columns": columns,
            "results": results
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Vercel-specific static route
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory(app.static_folder, path)

application = app

if __name__ == '__main__':
    app.run(debug=True)
