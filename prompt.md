# Kiro IDE Prompt: Build a Minimalist Emergency Response App with Panic Button

## Project Overview

The goal is to build a minimalist web application for rapid emergency response. The app will feature a secure user login, a main dashboard with a prominent **Panic Button**, and a dual-mode medical chatbot. An intelligent AI agent in the backend will automatically route queries to different specialized models based on the context.

The primary focus is on providing immediate, guided assistance in medical emergencies, with a clean and uncluttered user interface that gives quick access to critical functions while also securely managing user medical history.

## Core Components & Tech Stack

1.  **Frontend:**

    - **Framework:** React.js (using JavaScript, not TypeScript).
    - **Styling:** Tailwind CSS for a utility-first, minimalist design.
    - **Language:** JavaScript.

2.  **Backend:**
    - **Framework:** Flask (Python).
    - **Primary Function:** Serve as a secure API gateway to handle user authentication, store medical history, and interact with the Azure OpenAI API for the chatbot.
    - **Database:** Use a lightweight, file-based database like **SQLite** for user data and medical history.

## Detailed Feature Requirements

### 1. User Authentication and Medical History

- **User Login/Signup:** Implement a secure user registration and login system. This is essential for securely storing and accessing user-specific medical history.
- **Medical History:** Once logged in, users should be able to add and view their essential medical history (e.g., allergies, chronic conditions, blood type). This information can be crucial in an emergency.

### 2. Frontend & UI/UX

- **Minimalist Dashboard:** After logging in, the user is presented with a simple, clean dashboard.
- **The Panic Button:** The UI's central focus should be a large, easily accessible **Panic Button**.
- **Chat Interface:** A clean chat interface should be present on the dashboard for all user interactions.

### 3. Panic Button Emergency Flow

This is the primary emergency feature. The flow is as follows:

1.  **Click:** The user clicks the prominent Panic Button.
2.  **Request Mobile Number:** A modal or prompt appears, asking for a mobile number. This could be the user's number or a first responder's.
3.  **Display GPS Location:** The application gets the user's current GPS coordinates (latitude and longitude) and displays them clearly on the screen.
4.  **Confirmation Message:** A message appears on the screen stating: "Your location has been recorded. An ambulance request has been placed at [display latitude] / [display longitude]." (Note: This is a simulation; no real ambulance dispatch is required).
5.  **Initiate Emergency Chat:** Immediately after, the chat interface activates its **Emergency Guidance Mode**.

### 4. Dual-Mode Medical Chatbot

The chatbot has two distinct modes of operation.

#### a) Emergency Guidance Mode (Post-Panic Button)

- **Trigger:** This mode activates **only** after the Panic Button flow is completed.
- **Simple, Guided Interaction:** The chatbot's primary goal is to provide clear, simple instructions quickly. It guides the user with suggestions and asks for feedback using "Yes/No" questions or simple multiple-choice options, which should be rendered as clickable buttons within the chat for speed.
- **Conditional Logic & CPR:** The chatbot's suggestions must adapt based on the user's feedback. A key feature is the CPR Metronome.
  - _Example:_ _Bot:_ "Is the person conscious and breathing?" -> _User clicks "No"_ -> _Bot:_ "Okay, we may need to start CPR. I can provide a metronome to guide the compressions. Would you like me to start it?"
- **CPR Metronome:** If the user agrees, a visual and auditory metronome starts on the screen, set to the standard 100-120 beats per minute.

#### b) General Query Mode

- **Trigger:** This is the default mode of the chatbot for any interaction outside of the panic button flow.
- **Conversational AI:** In this mode, the chatbot should behave as a helpful, conversational AI for general health-related queries. Users can type freeform questions for discussion and diagnosis.

### 5. AI Agent & Automatic Model Routing (Backend Logic)

The Flask backend will handle all calls to the Azure OpenAI API and implement the automatic model-switching logic for both chatbot modes.

- **Automatic Model Controller:** The backend will automatically analyze the user's query or the context (i.e., if the panic flow was triggered) to route the request to the appropriate model without any user intervention.
- **Model Selection Logic:**
  1.  **Emergency Queries:** For all interactions within the **Emergency Guidance Mode** or for general queries containing keywords like "emergency," "help," "unconscious," "not breathing," etc., automatically use the **`sethuiyer/Medichat-Llama3-8B`** model.
  2.  **General Diagnosis & Discussion:** For standard, non-urgent questions in the **General Query Mode**, automatically use the **`sethuiyer/Dr_Samantha-7b`** model.
  3.  **Advanced Diagnosis & Feedback:** For complex diagnostic queries or to analyze the user's stored medical history for context, automatically use the **`epfl-llm/meditron-7b`** model.
- **API Integration:** The Flask app will securely manage the API keys and endpoints for the Azure OpenAI service.

## Project Structure

```
/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PanicButton.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   └── CPRMetronome.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Dashboard.jsx
│   │   └── App.jsx
│   ├── tailwind.config.js
│   └── package.json
├── backend/
│   ├── app.py
│   ├── database.db  # SQLite database file
│   └── requirements.txt
└── prompt.md
```

Please generate the complete project based on these instructions, ensuring all components are fully integrated and functional.
