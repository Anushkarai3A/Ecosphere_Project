"""predict.py — Quick prediction helper (call from CLI or import)."""
import pickle, os, sys

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ecosphere_model.pkl')

def predict(quiz_score: float, time_spent: float, challenges_completed: float) -> dict:
    """Predict user level using saved model."""
    try:
        with open(MODEL_PATH, 'rb') as f:
            clf = pickle.load(f)
    except FileNotFoundError:
        return {"error": "Model not found. Run train_model.py first."}

    features = [[quiz_score, time_spent, challenges_completed]]
    level = clf.predict(features)[0]
    proba = clf.predict_proba(features)[0]
    classes = clf.classes_.tolist()
    probabilities = {c: round(float(p) * 100, 1) for c, p in zip(classes, proba)}

    diff_map = {"Beginner": "easy", "Intermediate": "medium", "Advanced": "hard"}
    rec_map  = {
        "Beginner":     "Start with easy eco quizzes to build your foundation!",
        "Intermediate": "Try medium-difficulty quizzes to level up your eco knowledge!",
        "Advanced":     "Challenge yourself with hard environmental science questions!"
    }
    return {
        "level":          level,
        "difficulty":     diff_map.get(level, "easy"),
        "recommendation": rec_map.get(level, "Keep learning!"),
        "confidence":     round(float(max(proba)) * 100, 1),
        "all_probabilities": probabilities
    }


if __name__ == '__main__':
    # CLI usage: python predict.py <quiz_score> <time_spent> <challenges>
    args = sys.argv[1:]
    if len(args) == 3:
        result = predict(float(args[0]), float(args[1]), float(args[2]))
        print("\n🤖 Ecosphere ML Prediction")
        print("=" * 35)
        for k, v in result.items():
            print(f"  {k}: {v}")
    else:
        print("Usage: python predict.py <quiz_score> <time_spent_minutes> <challenges_completed>")
        print("Example: python predict.py 75 30 5")
