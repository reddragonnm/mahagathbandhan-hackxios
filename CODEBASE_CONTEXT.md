# Kiro Codebase Context

**Date:** 29 December 2025
**Project:** Kiro - Minimalist Emergency Response App
**Tech Stack:** React (Vite), Flask, SQLite, OpenAI (Hugging Face Interface)

---

## 1. Project Architecture

The project is a monolithic repository with distinct `frontend` and `backend` directories.

```
/
├── backend/            # Flask API Gateway
│   ├── app.py          # Main application entry point (Routes, Model Logic)
│   ├── database.db     # SQLite Database (User, MedicalHistory)
│   ├── requirements.txt
│   └── .env            # Secrets (HF_TOKEN)
├── frontend/           # React + Vite Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx    # Core Chat Logic (Streaming, Markdown, Options)
│   │   │   ├── CPRMetronome.jsx  # Audio/Visual CPR Guide
│   │   │   └── PanicButton.jsx   # GPS Simulation & Panic Flow
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Main Layout
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   └── App.jsx               # Routing & Auth State
│   └── ...config files
└── CODEBASE_CONTEXT.md # This file
```

---

## 2. Key File Details

### A. Backend: `backend/app.py`
This is the heart of the application logic.

*   **Model Provider:** Uses `OpenAI` client initialized with `base_url="https://router.huggingface.co/v1"` and `HF_TOKEN`.
*   **Model Selection:** Currently standardized to `sethuiyer/Medichat-Llama3-8B:featherless-ai` for reliability.
*   **System Prompts:**
    *   **Emergency Mode:** Strictly controlled prompt. Enforces ONE question at a time. Explicitly forbids simulating user responses. Forces option format `[OPTIONS: A | B]`.
    *   **General Mode:** "Dr. Samantha" persona for open-ended queries.
*   **Streaming Logic:**
    *   Uses `client.chat.completions.create(..., stream=True, stop=[...])`.
    *   Returns a `flask.Response` that yields text chunks.
    *   **Stop Tokens:** `["\nUser:", "<|eot_id|>", "User:", "\n\n"]` prevent hallucination loops.
*   **Custom Headers:**
    *   `X-Suggested-Action`: Scans user message for keywords (e.g., "metronome" + "start"). If found, sends header `start_metronome` to trigger frontend UI.
    *   `X-Model`: Returns the model name used.

### B. Frontend: `src/components/ChatWindow.jsx`
Handles the complexity of streaming interactions.

*   **Streaming Fetch:** Uses `fetch` + `response.body.getReader()` to process the stream.
*   **Text Decoding:** `TextDecoder` converts binary chunks to string.
*   **Option Parsing:**
    *   Regex: `/ \[OPTIONS: (.*?) \]/`
    *   Logic: Extracts the options string, splits by `|`, updates `currentOptions` state (which renders buttons), and *removes* the raw tag from the displayed message.
*   **Rendering:** Uses `ReactMarkdown` to render the bot's text (allowing bold, lists, etc.).

### C. Frontend: `src/components/CPRMetronome.jsx`
A specialized modal for CPR assistance.

*   **Audio Context:** Uses Web Audio API (`OscillatorNode`).
*   **Autoplay Policy Handling:** Implements a "TAP TO START" state. Audio context is only resumed/created after this user gesture.
*   **Visuals:** Large pulsing "PUSH" indicator synced to the audio beep (interval ~550ms for ~110 BPM).

---

## 3. Data Models (SQLite)

### User
*   `id`: Integer, PK
*   `username`: String, Unique
*   `password_hash`: String (scrypt)

### MedicalHistory
*   `id`: Integer, PK
*   `user_id`: ForeignKey(User.id)
*   `allergies`: String
*   `conditions`: String
*   `blood_type`: String
*   `medications`: String

---

## 4. Prompt Engineering Strategy

To make a generic LLM act as a safe emergency responder, we use a rigid structure:

**Emergency System Prompt:**
```text
You are an emergency response assistant. YOUR GOAL: Guide the user through a medical emergency with simple, short steps.
RULES:
1. Ask ONLY ONE question at a time.
2. Keep questions extremely short and clear.
3. At the end of every response, strictly provide valid user choices in this format: [OPTIONS: Choice 1 | Choice 2].
4. If CPR is needed, ask if they want a metronome. If they say yes, say 'Starting metronome' and STOP. Do NOT type 'beep', 'tick', or simulate the sound.
5. Do not simulate the user.
6. Focus on 'Yes', 'No', or simple keywords.
Example: 'Is the patient conscious? [OPTIONS: Yes | No]'
```

---

## 5. API Contracts

### POST `/api/chat`
*   **Request:** `{ "message": "...", "mode": "emergency|general", "user_id": 1, "history": [...] }`
*   **Response:** Streaming Text (text/plain).
*   **Headers:**
    *   `X-Suggested-Action`: `start_metronome` (optional)
    *   `X-Model`: Model ID

### POST `/api/login`
*   **Request:** `{ "username": "...", "password": "..." }`
*   **Response:** `{ "message": "...", "user_id": 1 }`

---

## 6. Setup & Environment

**Backend Requirements:**
- Python 3.10+
- `.env` file in `backend/`:
  ```env
  HF_TOKEN=hf_...
  SECRET_KEY=...
  ```

**Frontend Requirements:**
- Node.js 18+
- `npm install` (Dependencies: `react`, `react-router-dom`, `lucide-react`, `axios`, `react-markdown`, `tailwindcss`)

```