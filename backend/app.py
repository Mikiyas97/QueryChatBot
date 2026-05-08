import os
import sys
from flask import Flask, jsonify, redirect, render_template, request
from dotenv import load_dotenv, find_dotenv

# Load environment variables first
load_dotenv(find_dotenv())

# Add current directory to path so imports work on Vercel
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

# Import our custom modules after environment is loaded and path is set
try:
    from database import execute_query
    from ai_service import ask_gemini
except ImportError:
    # Fallback for different execution environments
    from .database import execute_query
    from .ai_service import ask_gemini

# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'templates'),
    static_folder=os.path.join(BASE_DIR, 'static')
)

# Configs
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', '/tmp/uploads') # Use /tmp for Vercel
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/", methods=["GET"])
def main():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    question = data.get("question", "").strip()
    if not question:
        return jsonify({"error": "Empty question"}), 400

    try:
        # Get JSON response from Gemini
        response_data = ask_gemini(question)

        explanation = response_data.get("explanation", "")
        query = response_data.get("sql_query", "").strip()

        columns, results = [], []

        # Only execute if a query is provided and it's not "NONE"
        if query and query.upper() != "NONE":
            columns, results = execute_query(query)

        return jsonify({
            "question": question,
            "explanation": explanation,
            "query": query if query.upper() != "NONE" else None,
            "columns": columns,
            "results": results
        })

    except Exception as e:
        print(f"Error in /ask: {str(e)}") # Log error for Vercel logs
        return jsonify({"error": str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Note: On Vercel, this is temporary and will be cleared
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    return jsonify({
        "message": "File uploaded successfully (temporary)",
        "filename": file.filename
    })

# Export the app for Vercel
# Vercel needs the 'app' variable to be available
application = app

if __name__ == '__main__':
    app.run(debug=True)
