# SanjeevniAI Emergency Response App

A minimalist emergency response web application with a Panic Button and dual-mode medical chatbot.

## Project Structure

- **frontend/**: React + Vite + Tailwind CSS application.
- **backend/**: Flask application with SQLite and OpenAI (GitHub Models) integration.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup

Navigate to the `backend` directory:
```bash
cd backend
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Run the Flask server:
```bash
python app.py
```
The backend runs on `http://localhost:5000`.

*Note: The app is configured with a simulation mode by default. To use real Azure OpenAI models, create a `.env` file in the `backend/` folder with your keys:*
```env
GITHUB_TOKEN=your-github-token
```

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
```

Install Node dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The frontend runs on `http://localhost:5173`.

## Features
- **Panic Button:** One-click emergency trigger sharing simulated GPS location.
- **Medical Chatbot:** Switches between "Emergency Guidance" (Llama 3.1) and "General Health" (Dr. Samantha) modes.
- **CPR Metronome:** Visual and auditory guide for CPR compressions (100-120 BPM).
- **Medical History:** Secure storage of allergies and conditions.

## Usage
1. Register/Login.
2. Use the Dashboard to view status.
3. Click "PANIC" to simulate an emergency.
4. Interact with the chatbot for guidance.
