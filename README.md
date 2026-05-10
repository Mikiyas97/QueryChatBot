# QueryChatBot (IMDb AI Assistant)

QueryChatBot is a Flask-based application that allows users to query a SQLite database using natural language. It leverages Google's Gemini AI to translate natural language questions into raw SQL queries, executes them against a local database, and displays the results in a beautiful, responsive interface.

## Features

- **Natural Language to SQL**: Ask questions about your movie data in plain English.
- **AI-Powered**: Uses Google Gemini 1.5 Flash for accurate SQL generation based on your database schema.
- **Responsive UI**: Modern, mobile-friendly interface built with Tailwind CSS.
- **Chat History**: Persists your conversations locally in your browser.
- **Theme Support**: Dark and Light mode support with automatic detection.
- **Vercel Ready**: Configured for easy deployment to Vercel.

## Project Structure

```text
QueryChatBot/
├── app.py              # Main Flask application
├── movies.db           # SQLite database
├── static/             # Frontend assets (JS, CSS)
├── templates/          # HTML templates
├── .env                # Environment variables (private)
├── .env.example        # Template for environment variables
├── .gitignore          # Files to ignore in Git
├── requirements.txt    # Python dependencies
├── vercel.json         # Vercel deployment configuration
└── README.md           # Project documentation
```

## Setup Instructions

### 1. Prerequisites

- Python 3.8+
- A Google Gemini API Key (get one at [Google AI Studio](https://aistudio.google.com/))

### 2. Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd QueryChatBot
    ```

2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

### 3. Configuration

1.  **Create a `.env` file**:
    Copy the example file and fill in your details:
    ```bash
    cp .env.example .env
    ```
2.  **Edit `.env`**:
    Add your Gemini API key and other settings:
    ```text
    GEMINI_API_KEY=your_actual_api_key_here
    DATABASE_NAME=movies.db
    MODEL_NAME=gemini-1.5-flash
    ```
    *Note: Ensure the `MODEL_NAME` matches a valid Gemini model (e.g., `gemini-2.5-flash`).*

### 4. Running the Application

1.  Start the Flask server:
    ```bash
    flask run
    ```
2.  Open your browser and navigate to `http://127.0.0.1:5000`.

## Deployment

### Vercel

This project is configured for deployment on Vercel:

1.  Install the Vercel CLI: `npm i -g vercel`
2.  Run `vercel` in the project root.
3.  Configure your `GEMINI_API_KEY` in the Vercel project settings.

## Usage

1.  **Ask a Question**: Type a question like "What are the top 10 highest rated movies?" or "Which movies were released in 2023?".
2.  **View Results**: The assistant will explain its findings and display the data in a clean table format.
3.  **Manage History**: Your chats are saved in the sidebar, and you can create new ones or delete old ones.

## Security

- Sensitive keys are stored in `.env` and excluded from version control via `.gitignore`.
- Always use a `.env.example` to share the required configuration structure without revealing secrets.
