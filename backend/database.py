import sqlite3
import os

DATABASE_NAME = os.getenv('DATABASE_NAME', 'movies.db')

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
