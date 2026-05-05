from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle, os, json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # allow frontend to call API

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml_models', 'ecosphere_model.pkl')

# Load ML model (if trained)
model = None
def load_model():
    global model
    try:
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        print("✅ ML model loaded successfully")
    except FileNotFoundError:
        print("⚠️  Model not found — run ml_models/train_model.py first. Using rule-based fallback.")

load_model()

# ─── Leaderboard (in-memory for demo) ───────────────────
LEADERBOARD = [
    {"name":"EcoNova",    "avatar":"🦋","xp":2840,"badges":11,"level":"Eco Hero"},
    {"name":"GreenMira",  "avatar":"🌸","xp":2350,"badges":9, "level":"Eco Hero"},
    {"name":"TerraKai",   "avatar":"🦉","xp":1980,"badges":8, "level":"Eco Hero"},
    {"name":"LeafLoki",   "avatar":"🌿","xp":1540,"badges":6, "level":"Nature Keeper"},
    {"name":"SkyRex",     "avatar":"🐢","xp":1230,"badges":5, "level":"Nature Keeper"},
    {"name":"BioSage",    "avatar":"🦜","xp":980, "badges":4, "level":"Green Explorer"},
    {"name":"WaterWren",  "avatar":"🐸","xp":720, "badges":3, "level":"Green Explorer"},
    {"name":"SunSprout",  "avatar":"☀️","xp":510, "badges":2, "level":"Green Explorer"},
    {"name":"AirAsh",     "avatar":"💨","xp":310, "badges":1, "level":"Eco Seedling"},
    {"name":"PetalZara",  "avatar":"🌱","xp":150, "badges":0, "level":"Eco Seedling"},
]

def local_predict(quiz_score, time_spent, challenges_completed):
    """Rule-based fallback when model not loaded."""
    if quiz_score >= 70 and challenges_completed >= 5:
        level = "Advanced"; difficulty = "hard"
        rec = "Challenge yourself with hard-level environmental questions!"
    elif quiz_score >= 40 or challenges_completed >= 2:
        level = "Intermediate"; difficulty = "medium"
        rec = "Try medium-difficulty quizzes to level up your eco knowledge!"
    else:
        level = "Beginner"; difficulty = "easy"
        rec = "Start with basic eco quizzes to build your foundation!"
    return {"level": level, "difficulty": difficulty, "recommendation": rec}

# ─── Routes ─────────────────────────────────────────────

@app.route('/')
def home():
    return jsonify({"status": "Ecosphere API running 🌍", "version": "1.0.0"})

@app.route('/api/predict', methods=['POST'])
def predict():
    """ML prediction endpoint."""
    data = request.get_json(force=True)
    quiz_score           = float(data.get('quiz_score', 0))
    time_spent           = float(data.get('time_spent', 0))
    challenges_completed = float(data.get('challenges_completed', 0))

    if model is not None:
        try:
            features = [[quiz_score, time_spent, challenges_completed]]
            prediction = model.predict(features)[0]
            proba = model.predict_proba(features)[0]
            confidence = round(float(max(proba)) * 100, 1)

            diff_map  = {"Beginner":"easy", "Intermediate":"medium", "Advanced":"hard"}
            rec_map   = {
                "Beginner":     "Start with easy eco quizzes to build your foundation!",
                "Intermediate": "Try medium-difficulty quizzes to level up your eco knowledge!",
                "Advanced":     "Challenge yourself with hard environmental science questions!"
            }
            return jsonify({
                "level":           prediction,
                "difficulty":      diff_map.get(prediction, "easy"),
                "recommendation":  rec_map.get(prediction, "Keep learning!"),
                "confidence":      confidence,
                "model":           "Decision Tree (scikit-learn)"
            })
        except Exception as e:
            print(f"Model error: {e} — using fallback")

    result = local_predict(quiz_score, time_spent, challenges_completed)
    result["model"] = "rule-based fallback"
    return jsonify(result)

@app.route('/api/leaderboard', methods=['GET'])
def leaderboard():
    """Return top 10 leaderboard."""
    sorted_lb = sorted(LEADERBOARD, key=lambda x: x['xp'], reverse=True)
    for i, p in enumerate(sorted_lb):
        p['rank'] = i + 1
    return jsonify(sorted_lb)

@app.route('/api/submit_score', methods=['POST'])
def submit_score():
    """Accept a score submission, update leaderboard, return XP delta."""
    data       = request.get_json(force=True)
    name       = data.get('name', 'Anonymous')
    quiz_score = float(data.get('quiz_score', 0))
    xp_earned  = int(data.get('xp_earned', 0))
    avatar     = data.get('avatar', '🌱')

    # Check if player exists
    player = next((p for p in LEADERBOARD if p['name'] == name), None)
    if player:
        player['xp']     += xp_earned
        player['badges']  = data.get('badges', player['badges'])
    else:
        LEADERBOARD.append({
            "name": name, "avatar": avatar,
            "xp": xp_earned, "badges": 0, "level": "Eco Seedling"
        })
    return jsonify({"success": True, "xp_earned": xp_earned, "total_xp": (player or LEADERBOARD[-1])['xp']})

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.utcnow().isoformat()
    })

if __name__ == '__main__':
    print("🌍 Starting Ecosphere API on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)