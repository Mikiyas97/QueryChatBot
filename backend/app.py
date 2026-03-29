from flask import Flask, redirect, render_template, request
import google.generativeai as genai
import sqlite3




def get_schema():
    db = sqlite3.connect("movies.db")
    cursor = db.cursor()
    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    schema = "Database schema:\n"
    for table_name, create_sql in tables:
        schema += create_sql + "\n"
    db.close()
    return schema

schema = get_schema()

def configure_ai(api_key):
    genai.configure(api_key=api_key)
    return genai
model = configure_ai("AIzaSyDin7AtIF13M2D3-IylS-JCdoC8m4TelhY")
system_prompt = f"""You are an expert SQL generator. Use ONLY the database schema provided.

here is the database schema:\n
{schema}


Rules:
- Return raw SQL only. No markdown, explanations, or comments.
- Do NOT invent tables or columns that are not in the schema.
- Fix typos and messy input in user questions automatically.
- If a question mentions numbers, ranges, or patterns, use the schema column types to generate correct SQL.
- Use JOINs if necessary, based on the schema relationships (primary/foreign keys).
- Use COUNT, SUM, AVG when user asks for totals or averages.
- Assume all columns and table names are exactly as provided in the schema.
"""
model_instance = model.GenerativeModel(model_name="gemini-2.5-flash", system_instruction=system_prompt)





app = Flask(__name__)
@app.route("/", methods=["GET"])
def main():
    return render_template("index.html")

@app.route("/ask", methods=["POST", "GET"])
def ask():
    if request.method == "POST":
        db = sqlite3.connect("movies.db")
        cursor = db.cursor()

        question = request.form.get("question")
        response = model_instance.generate_content(question)
        if response:
            query = response.text
            cursor.execute(query)
            results = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]
            columns = [col.upper() for col in columns]
            print(columns)
            print(results)
            db.close()

            return render_template("index.html", question=question, results=results, query=query, columns=columns)
        message = "No response from AI"
        return render_template("index.html", question=question, results=None, query="No response from AI")
    else:
        return redirect("/")