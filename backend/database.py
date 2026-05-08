import sqlite3
import os

# Get the directory of the current file (backend folder)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Default to movies.db in the same folder as database.py
DATABASE_NAME = os.getenv('DATABASE_NAME', os.path.join(BASE_DIR, 'movies.db'))

def get_schema():
    db = sqlite3.connect(DATABASE_NAME)
    cursor = db.cursor()
    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    schema = "Database schema:\n"
    for table_name, create_sql in tables:
        schema += create_sql + "\n"
    db.close()
    return schema

def execute_query(query):
    db = sqlite3.connect(DATABASE_NAME)
    cursor = db.cursor()
    cursor.execute(query)
    results = cursor.fetchall()
    columns = [desc[0].upper() for desc in cursor.description]
    db.close()
    return columns, results
