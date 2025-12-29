import os
from flask import Flask, request, jsonify, session, Response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app, expose_headers=["X-Suggested-Action", "X-Model"])

# Hugging Face Inference API Setup
HF_TOKEN = os.getenv("HF_TOKEN")
BASE_URL = "https://router.huggingface.co/v1"

# Initialize client
client = OpenAI(
    base_url=BASE_URL,
    api_key=HF_TOKEN
)

# --- Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    medical_history = db.relationship('MedicalHistory', backref='user', uselist=False)

class MedicalHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    allergies = db.Column(db.String(500))
    conditions = db.Column(db.String(500))
    blood_type = db.Column(db.String(10))
    medications = db.Column(db.String(500))

# --- Helper Functions ---
def select_model(message, mode):
    msg_lower = message.lower()
    emergency_keywords = ["emergency", "help", "unconscious", "not breathing", "cpr", "bleeding", "ambulance"]
    
    # Using the same model for all modes as it is confirmed working with the provided configuration.
    # We can differentiate behavior via system prompts.
    return "sethuiyer/Medichat-Llama3-8B:featherless-ai"

# --- Routes ---

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "User already exists"}), 400
        
    hashed_pw = generate_password_hash(password)
    new_user = User(username=username, password_hash=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "User created successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        # In a real app, we'd use JWTs or proper session management.
        # For this prototype, we'll return the user_id to be stored in localStorage.
        return jsonify({"message": "Login successful", "user_id": user.id}), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/medical-history', methods=['GET', 'POST'])
def handle_medical_history():
    user_id = request.args.get('user_id') or request.json.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    if request.method == 'POST':
        data = request.json
        hist = MedicalHistory.query.filter_by(user_id=user.id).first()
        if not hist:
            hist = MedicalHistory(user_id=user.id)
            db.session.add(hist)
            
        hist.allergies = data.get('allergies', hist.allergies)
        hist.conditions = data.get('conditions', hist.conditions)
        hist.blood_type = data.get('blood_type', hist.blood_type)
        hist.medications = data.get('medications', hist.medications)
        db.session.commit()
        return jsonify({"message": "History updated"}), 200
        
    else: # GET
        hist = MedicalHistory.query.filter_by(user_id=user.id).first()
        if not hist:
            return jsonify({
                "allergies": "",
                "conditions": "",
                "blood_type": "",
                "medications": ""
            }), 200
        return jsonify({
            "allergies": hist.allergies,
            "conditions": hist.conditions,
            "blood_type": hist.blood_type,
            "medications": hist.medications
        }), 200

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    mode = data.get('mode', 'general')
    user_id = data.get('user_id')
    history_context = data.get('history', []) # Previous messages if needed
    
    model_name = select_model(message, mode)
    
    system_prompt = "You are a helpful medical assistant."
    if mode == 'emergency':
        system_prompt = (
            "You are an emergency response assistant. YOUR GOAL: Guide the user through a medical emergency with simple, short steps.\n"
            "RULES:\n"
            "1. Ask ONLY ONE question at a time.\n"
            "2. Keep questions extremely short and clear.\n"
            "3. At the end of every response, strictly provide valid user choices in this format: [OPTIONS: Choice 1 | Choice 2].\n"
            "4. If CPR is needed, ask if they want a metronome. If they say yes, say 'Starting metronome' and STOP. Do NOT type 'beep', 'tick', or simulate the sound.\n"
            "5. Do not simulate the user.\n"
            "6. Focus on 'Yes', 'No', or simple keywords.\n"
            "Example: 'Is the patient conscious? [OPTIONS: Yes | No]'"
        )
    elif mode == 'general':
         system_prompt = "You are Dr. Samantha, a helpful conversational AI for general health queries."
    
    # Check for medical history context
    if "meditron" in model_name and user_id:
         hist = MedicalHistory.query.filter_by(user_id=user_id).first()
         if hist:
             system_prompt += f" User Context - Allergies: {hist.allergies}, Conditions: {hist.conditions}."

    # Pre-calculate suggested action
    suggested_action = None
    msg_lower = message.lower()
    if ("metronome" in msg_lower and "start" in msg_lower) or ("cpr" in msg_lower and "start" in msg_lower):
        suggested_action = "start_metronome"

    try:
        # Check if HF_TOKEN is available for real API calls
        if not HF_TOKEN:
             # --- SIMULATION LOGIC (Non-streaming fallback for now) ---
            response_text = f"[{model_name}]: "
            # ... (Sim logic omitted for brevity, keeping simple return for sim)
            return jsonify({"response": "Simulation mode does not support streaming yet.", "model": model_name})


        # Real API Call
        messages = [{"role": "system", "content": system_prompt}]
        messages.append({"role": "user", "content": message})

        def generate():
            stream = client.chat.completions.create(
                model=model_name, 
                messages=messages,
                stream=True,
                stop=["\nUser:", "<|eot_id|>", "User:", "\n\n"]
            )
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        return Response(
            generate(), 
            mimetype='text/plain', 
            headers={
                "X-Suggested-Action": suggested_action if suggested_action else "",
                "X-Model": model_name
            }
        )
        
    except Exception as e:
        print(f"API Error: {e}")
        return jsonify({"error": "Failed to get response from AI service."}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
