#  Ecosphere — Gamified EdTech Platform for Environmental Education

> *"Where learning saves the planet."*

A fully interactive, game-like environmental education platform combining **Duolingo-style gamification**, **Kahoot-style quizzes**, and **RPG progression** into one eco-themed experience.

##  Features

-  **Full XP & Level System** — Eco Seedling → Green Explorer → Nature Keeper → Eco Hero
-  **Interactive Quiz Arena** — 15 MCQs across 3 difficulties, timer, animated feedback, confetti
-  **12 Eco Challenges** — Real-world tasks with badge rewards
-  **Leaderboard** — Animated podium + sortable rankings
-  **12 Collectible Badges** — Unlock via XP, quizzes, and challenges
-  **AI/ML Personalization** — Decision Tree model recommends difficulty based on performance
-  **Analytics Dashboard** — Chart.js performance graph, XP ring, streak tracker
-  **Glassmorphism UI** — Dark eco theme, floating particles, smooth animations

##  Quick Start

```bash
# Just open in browser — zero setup!
open frontend/index.html
```

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (custom design system), Vanilla JS |
| Charts | Chart.js 4 |
| Animations | CSS keyframes + canvas-confetti |
| Backend | Python Flask |
| ML Model | scikit-learn Decision Tree |
| State | localStorage |
| Fonts | Google Fonts — Nunito + Orbitron |

##  Pages

| Page | File |
|------|------|
|  Landing | `frontend/index.html` |
|  Login/Signup | `frontend/login.html` |
|  Dashboard | `frontend/dashboard.html` |
|  Quiz Arena | `frontend/quiz.html` |
|  Eco Challenges | `frontend/challenges.html` |
|  Leaderboard | `frontend/leaderboard.html` |
|  Rewards | `frontend/rewards.html` |

##  ML Model

- **Algorithm**: Decision Tree Classifier (scikit-learn)
- **Input**: quiz_score, time_spent_minutes, challenges_completed
- **Output**: Beginner / Intermediate / Advanced
- **Training data**: 200 labeled samples in `ml_models/dataset.csv`
- **Accuracy**: ~98% on test set

See [docs/setup.md](docs/setup.md) for full setup instructions.
