# Ecosphere 🌍 — Setup & Run Guide

## Project Structure
```
Ecosphere_Project/
├── frontend/           ← All 7 HTML pages (open directly in browser)
│   ├── index.html      Landing page
│   ├── login.html      Login / Sign Up
│   ├── dashboard.html  Player stats & charts
│   ├── quiz.html       Quiz Arena
│   ├── challenges.html Eco Challenges
│   ├── leaderboard.html Leaderboard
│   ├── rewards.html    Badges & Rewards
│   ├── styles.css      Global design system
│   └── script.js       Game engine (XP, levels, badges)
├── backend/
│   ├── app.py          Flask API (ML endpoint)
│   └── requirements.txt
├── ml_models/
│   ├── dataset.csv     Training data (200 rows)
│   ├── model.py        Decision Tree training script
│   ├── train_model.py  Training runner
│   └── predict.py      CLI prediction tool
└── docs/
    └── setup.md        This file
```

---

## ⚡ Quick Start — Frontend Only (No Setup Required)

1. Open `frontend/index.html` in any modern browser
2. Click "Start Your Journey" → sign up with a name & avatar
3. Navigate to Quiz Arena, Eco Challenges, Leaderboard, Rewards
4. All game data persists via `localStorage`

**The frontend works 100% without the backend.** The ML prediction falls back to a rule-based system automatically.

---

## 🤖 Setting Up the ML Backend (Optional)

### Step 1 — Install Python dependencies
```bash
cd Ecosphere_Project/backend
pip install -r requirements.txt
```

### Step 2 — Train the ML model
```bash
cd ../ml_models
python train_model.py
```
Expected output:
```
✅ Test Accuracy: ~98%
💾 Model saved → ecosphere_model.pkl
```

### Step 3 — Start the Flask API
```bash
cd ../backend
python app.py
```
API runs at: `http://localhost:5000`

### Available Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/` | Health check |
| POST | `/api/predict` | ML level prediction |
| GET  | `/api/leaderboard` | Top 10 players |
| POST | `/api/submit_score` | Submit score |
| GET  | `/api/health` | Model status |

### Test the prediction endpoint
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"quiz_score": 75, "time_spent": 30, "challenges_completed": 5}'
```

---

## 🧪 CLI Prediction Tool
```bash
cd ml_models
python predict.py 75 30 5    # quiz_score time_spent challenges
```

---

## 🎮 XP System

| Action | XP Earned |
|--------|-----------|
| Correct quiz answer | +10 to +20 XP |
| Complete a quiz | +50 XP |
| Complete an eco challenge | +75–100 XP |
| Daily login | +20 XP |
| 3-day streak bonus | +30 XP |

## 📊 Level Thresholds

| Level | XP Range |
|-------|----------|
| 🌱 Eco Seedling | 0 – 199 |
| 🌿 Green Explorer | 200 – 499 |
| 🌳 Nature Keeper | 500 – 999 |
| 🦅 Eco Hero | 1000+ |

## 🏅 Badges (12 Total)
Recycle Master • Tree Saver • Ocean Guardian • Eco Warrior •
Quiz Master • Perfect Score • Earth Hero • Green Streak •
First Step • Wind Rider • Sun Chaser • Champion
