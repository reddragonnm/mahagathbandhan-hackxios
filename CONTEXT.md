# Kiro Project Context

**Date:** 29 December 2025
**Project:** Kiro - Minimalist Emergency Response App

## Project Overview
Kiro is a web-based emergency response application designed for rapid assistance. It features a panic button, a dual-mode medical chatbot (Emergency/General), and utilities like a CPR metronome.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, `lucide-react` (icons), `react-markdown`.
- **Backend:** Flask (Python), SQLite (SQLAlchemy), OpenAI Client (for Hugging Face Inference API).
- **AI Model:** `sethuiyer/Medichat-Llama3-8B:featherless-ai` (hosted via Hugging Face).

## Key Features & Implementation Details

### 1. Chatbot & Model Routing
- **Dual Modes:**
  - **General Mode:** Acts as "Dr. Samantha" for general health queries.
  - **Emergency Mode:** Acts as a strict emergency responder.
- **Model:** We use `sethuiyer/Medichat-Llama3-8B:featherless-ai` for *both* modes but change the behavior significantly using **System Prompts**.
- **Streaming:** The backend streams responses to the frontend using Flask's `Response` generator and the OpenAI client's `stream=True`.
- **Option Parsing:**
  - The AI is instructed to append options at the end of responses in the format: `[OPTIONS: Choice A | Choice B]`.
  - The Frontend (`ChatWindow.jsx`) parses this regex pattern, extracts the options, hides the tag from the text bubble, and renders them as clickable buttons.

### 2. Emergency Mode Logic
- **System Prompt:** Strictly enforces asking **ONE** Yes/No question at a time.
- **Stop Tokens:** The API call uses `stop=["\nUser:", "<|eot_id|>", "User:", "\n\n"]` to prevent the model from simulating a conversation or hallucinating user inputs.
- **Suggested Actions:**
  - The backend detects keywords (e.g., "start" + "metronome") in the user's message.
  - It sends an `X-Suggested-Action` header (e.g., `start_metronome`) to the frontend.
  - The frontend triggers the corresponding component (e.g., opens the CPR Modal).

### 3. CPR Metronome
- **Audio/Visual:** Uses the Web Audio API (`AudioContext`) for precise timing.
- **User Activation:** Implements a "TAP TO START" overlay to comply with browser autoplay policies. The audio context only resumes after a user interaction.
- **Visuals:** Features a pulsing "PUSH" animation and a simple SVG illustration of hands.

### 4. Backend Configuration
- **API Provider:** Hugging Face Inference API (via `router.huggingface.co/v1`).
- **Client:** Standard Python `openai` library.
- **Environment Variables:** `HF_TOKEN` (Hugging Face API Key), `SECRET_KEY`.

## Setup Instructions

### Backend
```bash
cd backend
# Ensure .env has HF_TOKEN
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Future Todos
- Integrate real GPS dispatch logic (currently simulated).
- Enhance medical history context window.
- Add voice input/output support.
