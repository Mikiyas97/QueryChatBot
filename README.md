# QueryChatBot

QueryChatBot is a Flask-based application that allows users to query a SQLite database using natural language. It leverages Google's Gemini AI to translate natural language questions into raw SQL queries, executes them against a local database, and displays the results. It also includes a file upload feature.

## Features

- **Natural Language to SQL**: Ask questions about your data in plain English.
- **AI-Powered**: Uses Gemini 2.5 Flash for accurate SQL generation based on your database schema.
- **Database Interaction**: Automatically fetches your database schema to provide context to the AI.
- **File Uploads**: Simple endpoint to upload files to a dedicated folder.
- **Responsive UI**: Basic frontend included for interacting with the bot.

## Project Structure

```text
QueryChatBot/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── movies.db           # SQLite database
│   ├── static/             # Frontend assets (JS, CSS)
│   ├── templates/          # HTML templates
│   └── uploads/            # Directory for uploaded files
├── .env                    # Environment variables (private)
├── .env.example            # Template for environment variables
├── .gitignore              # Files to ignore in Git
└── README.md               # Project documentation
```

## Setup Instructions

### 1. Prerequisites

- Python 3.x
- A Google Gemini API Key (get one at [Google AI Studio](https://aistudio.google.com/))

### 2. Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd QueryChatBot
    ```

2.  **Install dependencies**:
    ```bash
    pip install flask google-generativeai python-dotenv
    ```

### 3. Configuration

1.  **Create a `.env` file**:
    Copy the example file and fill in your details:
    ```bash
    cp .env.example .env
    ```
2.  **Edit `.env`**:
    Add your Gemini API key:
    ```text
    GEMINI_API_KEY=your_actual_api_key_here
    DATABASE_NAME=movies.db
    MODEL_NAME=gemini-2.5-flash
    UPLOAD_FOLDER=uploads
    ```

### 4. Running the Application

1.  Start the Flask server:
    ```bash
    python backend/app.py
    ```
2.  Open your browser and navigate to `http://127.0.0.1:5000`.

## Usage

1.  **Ask a Question**: Type a question like "What are the top 5 highest rated movies?" in the chat interface.
2.  **View Results**: The app will show the generated SQL query and the resulting data in a table.
3.  **Upload Files**: Use the upload interface (if available in the UI) or send a POST request to `/upload`.

## Security

- Sensitive keys are stored in `.env` and excluded from version control via `.gitignore`.
- Always use a `.env.example` to share the required configuration structure without revealing secrets.
