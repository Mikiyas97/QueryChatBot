import os
from flask import Flask, jsonify, redirect, render_template, request
from dotenv import load_dotenv, find_dotenv

# Load environment variables first
load_dotenv(find_dotenv())

# Import our custom modules after environment is loaded
from database import execute_query
from ai_service import ask_gemini

app = Flask(__name__)

# Configs
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/", methods=["GET"])
def main():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    if request.method == "POST":
        data = request.get_json()
        question = data.get("question", "").strip()

        if not question:
            return jsonify({"error": "Empty question"})

        try:
            # Get JSON response from Gemini
            response_data = ask_gemini(question)
            
            explanation = response_data.get("explanation", "")
            query = response_data.get("sql_query", "")

            # Execute the generated query
            columns, results = execute_query(query)

            return jsonify({
                "question": question,
                "explanation": explanation,
                "columns": columns,
                "results": results
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return redirect("/")

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    return jsonify({
        "message": "File uploaded successfully",
        "filename": file.filename
    })

if __name__ == '__main__':
    app.run(debug=True)
