import os
import requests
import json
import time
from flask import Flask, request, jsonify, session, Response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Load .env from the same directory as this file
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_secret_key')
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app, resources={r"/api/*": {"origins": "*"}}, expose_headers=["X-Suggested-Action", "X-Model"])

# Hugging Face API Setup
HF_API_URL = "https://router.huggingface.co/featherless-ai/v1/completions"
HF_TOKEN = "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"
HF_HEADERS = {
    "Authorization": f"Bearer {HF_TOKEN}",
    "Content-Type": "application/json"
}
HF_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"

# --- Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    medical_history = db.relationship('MedicalHistory', backref='user', uselist=False)

class MedicalHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    allergies = db.Column(db.String(500))
    conditions = db.Column(db.String(500))
    blood_type = db.Column(db.String(10))
    medications = db.Column(db.String(500))

# --- Helper Functions ---
def format_llama3_prompt(system_prompt, history, user_message):
    # Llama 3 Instruct Format:
    # <|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|>
    # <|start_header_id|>user<|end_header_id|>\n\n{user_message}<|eot_id|>
    # <|start_header_id|>assistant<|end_header_id|>\n\n{assistant_message}<|eot_id|>
    
    prompt = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|>"
    
    for msg in history:
        role = msg.get('role')
        content = msg.get('content')
        if role == 'user':
            prompt += f"<|start_header_id|>user<|end_header_id|>\n\n{content}<|eot_id|>"
        elif role == 'assistant':
             prompt += f"<|start_header_id|>assistant<|end_header_id|>\n\n{content}<|eot_id|>"
             
    prompt += f"<|start_header_id|>user<|end_header_id|>\n\n{user_message}<|eot_id|>"
    prompt += "<|start_header_id|>assistant<|end_header_id|>\n\n"
    return prompt

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
    
    try:
        db.session.add(new_user)
        db.session.flush()
        
        new_history = MedicalHistory(
            user_id=new_user.id,
            allergies=data.get('allergies', ''),
            conditions=data.get('conditions', ''),
            blood_type=data.get('blood_type', ''),
            medications=data.get('medications', '')
        )
        db.session.add(new_history)
        db.session.commit()
        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Database error during signup"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            return jsonify({"message": "Login successful", "user_id": user.id}), 200
        
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": "Server error during login"}), 500

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
    history_context = data.get('history', []) 
    
    model_name = HF_MODEL
    
    system_prompt = "You are a helpful medical assistant."
    if mode == 'emergency':
        system_prompt = (
            "You are an emergency response assistant. CRITICAL CONTEXT: Emergency services have been notified and are on the way. YOUR GOAL: Guide the user (first responder) through immediate life-saving steps until help arrives.\n"
            "RULES:\n"
            "1. RESPONSE STRUCTURE: [Actionable Advice] + [Next Question).\n"
            "   - First, give ONE clear, short instruction on what to do NOW based on the user's input (e.g., 'Lay them on their back,' 'Apply pressure').\n"
            "   - Then, ask ONE simple Yes/No question to determine the next step.\n"
            "2. Keep it extremely short. No long paragraphs.\n"
            "3. At the end of every response, strictly provide valid user choices in this format: [OPTIONS: Choice 1 | Choice 2]. Do NOT add newlines inside the brackets.\n"
            "4. If CPR is needed, ask if they want a metronome. If they say yes, say 'Starting metronome' and STOP. Do NOT type 'beep', 'tick', or simulate the sound.\n"
            "5. Do not simulate the user.\n"
            "Example: 'Apply direct pressure to the wound. Is the bleeding slowing down? [OPTIONS: Yes | No]'"
        )
    elif mode == 'general':
         system_prompt = "You are Dr. Samantha, a helpful conversational AI for general health queries."
    
    if user_id:
         hist = MedicalHistory.query.filter_by(user_id=user_id).first()
         if hist:
             system_prompt += f" User Context - Allergies: {hist.allergies}, Conditions: {hist.conditions}."

    suggested_action = None
    msg_lower = message.lower()
    if ("metronome" in msg_lower and "start" in msg_lower) or ("cpr" in msg_lower and "start" in msg_lower):
        suggested_action = "start_metronome"

    def run_simulation(error_msg=None):
        if error_msg:
            print(f"Switching to simulation due to error: {error_msg}")
        
        def sim_generate():
            response_text = "I am currently in simulation mode. The AI service is unavailable. In a real emergency, I would guide you through CPR or other procedures. [OPTIONS: Retry | Simulation Info]"
            if mode == 'emergency':
                    response_text = "Emergency Simulation: Ensure the scene is safe. Is the patient breathing? [OPTIONS: Yes | No]"
            
            words = response_text.split(' ')
            for word in words:
                yield word + " "
                time.sleep(0.05) 

        return Response(
            sim_generate(), 
            mimetype='text/plain', 
            headers={
                "X-Suggested-Action": suggested_action if suggested_action else "",
                "X-Model": f"{model_name} (Sim)"
            }
        )

    try:
        if mode == 'emergency':
             system_prompt += " REMINDER: Keep response short. YOU MUST END WITH [OPTIONS: Option A | Option B]. Do not add newlines inside the brackets."

        formatted_prompt = format_llama3_prompt(system_prompt, history_context, message)

        payload = {
            "model": HF_MODEL,
            "prompt": formatted_prompt,
            "max_tokens": 500,
            "temperature": 0.3,
            "stop": ["<|eot_id|>"],
            "stream": False 
        }

        r = requests.post(HF_API_URL, headers=HF_HEADERS, json=payload, timeout=30)
        r.raise_for_status()
        response_json = r.json()
        
        generated_text = ""
        if "choices" in response_json and len(response_json["choices"]) > 0:
            generated_text = response_json["choices"][0].get("text", "")
        
        # Clean up any potential artifacts if prompt was included (depends on API behavior)
        if generated_text.startswith(formatted_prompt):
            generated_text = generated_text[len(formatted_prompt):]

        def generate():
            yield generated_text

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
        return run_simulation(str(e))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
