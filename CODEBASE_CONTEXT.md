# SanjeevniAI Codebase Context

**Date:** 29 December 2025
**Project:** SanjeevniAI - Minimalist Emergency Response App
**Tech Stack:** React (Vite), Flask, SQLite, OpenAI (GitHub Models Interface)

---

## 1. Project Architecture

The project is a monolithic repository with distinct `frontend` and `backend` directories.

```
/
├── backend/            # Flask API Gateway
│   ├── app.py          # Main application entry point (Routes, Model Logic)
│   ├── database.db     # SQLite Database (User, MedicalHistory)
│   ├── requirements.txt
│   └── .env            # Secrets (GITHUB_TOKEN)
├── frontend/           # React + Vite Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx    # Core Chat Logic (Streaming, Markdown, Options)
│   │   │   ├── CPRMetronome.jsx  # Audio/Visual CPR Guide (Card Component)
│   │   │   └── PanicButton.jsx   # GPS Simulation & Panic Flow
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Main Layout (Editable History, CPR Integration)
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx        # Registration with Medical Profile
│   │   └── App.jsx               # Routing & Auth State
│   └── ...config files
└── CODEBASE_CONTEXT.md # This file
```

---

## 2. Key File Details

### A. Backend: `backend/app.py`
This is the heart of the application logic.

*   **Model Provider:** Uses `OpenAI` client initialized with `base_url="https://models.inference.ai.azure.com"` and `GITHUB_TOKEN`.
*   **Model Selection:** Standardized to `Meta-Llama-3.1-8B-Instruct`.
*   **System Prompts (Emergency):** 
    *   Context: "Emergency services have been notified."
    *   Structure: **[Actionable Advice] + [Next Question]**.
    *   Constraints: Explicitly forbids "beep" text sounds. Forces option format `[OPTIONS: A | B]`.
    *   **Loop Prevention:** Injects a "REMINDER" message at the end of the context stack to ensure options persist in long chats.
*   **Streaming:** 
    *   Parameters: `stream=True`, `max_tokens=1000`, `temperature=0.3`.
    *   Stop Tokens: `["\nUser:", "<|eot_id|>", "User:"]` (Removed `\n\n` to fix truncation).

### B. Frontend: `src/components/ChatWindow.jsx`
Handles the complex chat interface.

*   **Streaming Fetch:** Manually processes the readable stream.
*   **Option Parsing:**
    *   Regex: `/ \[OPTIONS:?\s*([\s\S]*?)(?:]|$)/i` (Robust against newlines and missing closing brackets).
    *   Behavior: Extracts options for buttons, removes the tag from the message bubble.
*   **Auto-Actions:** Detects "Starting metronome" in text stream -> triggers `start_metronome` action.
*   **UI:** Hides model names and internal switching logic from the user.

### C. Frontend: `src/components/CPRMetronome.jsx`
A specialized card component for CPR assistance.

*   **Audio:** Uses `new Audio('/metronome.mp3')`.
*   **Stability:** Initialized in a try-catch block on mount. Cleans up (pauses/resets) on unmount.
*   **Controls:** Simple "TAP TO START" -> "STOP GUIDANCE" flow. No complex pause/resume toggles.
*   **Design:** Card-based (not modal), integrates into the Dashboard sidebar.

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

*Note: Medical History is created upon Signup and is editable in the Dashboard.*

---

## 4. Prompt Engineering Strategy

**Emergency System Prompt:**
```text
You are an emergency response assistant. CRITICAL CONTEXT: Emergency services have been notified and are on the way. YOUR GOAL: Guide the user (first responder) through immediate life-saving steps until help arrives.
RULES:
1. RESPONSE STRUCTURE: [Actionable Advice] + [Next Question].
   - First, give ONE clear, short instruction on what to do NOW based on the user's input.
   - Then, ask ONE simple Yes/No question to determine the next step.
2. Keep it extremely short. No long paragraphs.
3. At the end of every response, strictly provide valid user choices in this format: [OPTIONS: Choice 1 | Choice 2]. Do NOT add newlines inside the brackets.
4. If CPR is needed, ask if they want a metronome. If they say yes, say 'Starting metronome' and STOP. Do NOT type 'beep', 'tick', or simulate the sound.
5. Do not simulate the user.
```

---

## 5. Setup & Environment

**Backend Requirements:**
- Python 3.10+
- `.env` file in `backend/`:
  ```env
  GITHUB_TOKEN=github_pat_...
  SECRET_KEY=...
  ```

**Frontend Requirements:**
- Node.js 18+
- `npm install`
- Asset: `public/metronome.mp3` required for CPR audio.

```
