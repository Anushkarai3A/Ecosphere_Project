"""
Ecosphere ML Model — Decision Tree Classifier
Predicts user learning level: Beginner / Intermediate / Advanced

Features:
  - quiz_score          (0-100)
  - time_spent_minutes  (int)
  - challenges_completed(int)

Output:
  - level: Beginner | Intermediate | Advanced
"""

import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import LabelEncoder
import pickle
import os

# ─── Paths ────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
DATA_PATH   = os.path.join(BASE_DIR, 'dataset.csv')
MODEL_PATH  = os.path.join(BASE_DIR, 'ecosphere_model.pkl')


def train():
    print("🌍 Ecosphere ML Training Pipeline")
    print("=" * 45)

    # 1. Load data
    df = pd.read_csv(DATA_PATH)
    print(f"📊 Loaded {len(df)} training samples")
    print(f"   Level distribution:\n{df['level'].value_counts().to_string()}\n")

    # 2. Features & labels
    X = df[['quiz_score', 'time_spent_minutes', 'challenges_completed']].values
    y = df['level'].values

    # 3. Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"   Train: {len(X_train)} | Test: {len(X_test)}")

    # 4. Train Decision Tree
    clf = DecisionTreeClassifier(
        max_depth=5,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        class_weight='balanced'
    )
    clf.fit(X_train, y_train)

    # 5. Evaluate
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n✅ Test Accuracy: {acc*100:.1f}%")
    print("\n📋 Classification Report:")
    print(classification_report(y_test, y_pred))

    # 6. Cross-validation
    cv_scores = cross_val_score(clf, X, y, cv=5, scoring='accuracy')
    print(f"🔄 5-Fold CV Accuracy: {cv_scores.mean()*100:.1f}% ± {cv_scores.std()*100:.1f}%")

    # 7. Feature importance
    features = ['quiz_score', 'time_spent_minutes', 'challenges_completed']
    print("\n🌳 Feature Importances:")
    for feat, imp in zip(features, clf.feature_importances_):
        bar = '█' * int(imp * 30)
        print(f"   {feat:<28} {bar} {imp:.3f}")

    # 8. Save model
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(clf, f)
    print(f"\n💾 Model saved → {MODEL_PATH}")
    print("\n🎉 Training complete! Run the Flask API to use the model.")
    return clf


if __name__ == '__main__':
    train()