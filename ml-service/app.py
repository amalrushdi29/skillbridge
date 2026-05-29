from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────
# LOAD MODEL AND ENCODERS ON STARTUP
# ─────────────────────────────────────────
print("📦 Loading model and encoders...")

model = joblib.load("model/skillbridge_model.pkl")
le_level = joblib.load("model/label_encoder_level.pkl")
le_type = joblib.load("model/label_encoder_type.pkl")
feature_cols = joblib.load("model/feature_columns.pkl")
top_skills = joblib.load("model/top_skills.pkl")

print("✅ Model loaded successfully!")

# ─────────────────────────────────────────
# HELPER — BUILD FEATURE VECTOR
# ─────────────────────────────────────────
def build_features(user_skills, job_type):
    """
    Converts user skills and job type into
    the exact feature vector the model expects
    """
    # Normalize user skills to lowercase
    user_skills_lower = [s.strip().lower() for s in user_skills]

    # Build feature vector — one value per feature column
    features = []
    for col in feature_cols:
        if col == 'job_type_encoded':
            # Encode job type
            job_type_clean = job_type.strip().lower()
            known_types = list(le_type.classes_)
            if job_type_clean in known_types:
                encoded = le_type.transform([job_type_clean])[0]
            else:
                encoded = 0
            features.append(encoded)
        else:
            # Convert column name back to skill name
            skill = col.replace('_', ' ').replace('plus', '+').replace('sharp', '#')
            # Check if user has this skill
            has_skill = 1 if skill in user_skills_lower else 0
            features.append(has_skill)

    return features

# ─────────────────────────────────────────
# ROUTE 1 — HEALTH CHECK
# ─────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "running",
        "model": "SkillBridge Random Forest v1.0",
        "accuracy": "83.14%"
    })

# ─────────────────────────────────────────
# ROUTE 2 — PREDICT EMPLOYABILITY
# ─────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # Validate input
        if not data:
            return jsonify({"error": "No data provided"}), 400

        user_skills = data.get('skills', [])
        job_type = data.get('jobType', 'full-time')

        if not user_skills:
            return jsonify({"error": "Skills list is required"}), 400

        # Build feature vector
        features = build_features(user_skills, job_type)
        features_array = np.array(features).reshape(1, -1)

        # Get prediction
        prediction = model.predict(features_array)[0]
        probabilities = model.predict_proba(features_array)[0]

        # Decode prediction back to label
        predicted_level = le_level.inverse_transform([prediction])[0]

        # Calculate employability score (0-100)
        # Based on how many top skills the user has
        matched_skills = [s for s in user_skills if s.strip().lower() in top_skills]
        skill_match_count = len(matched_skills)
        total_top_skills = len(top_skills)
        employability_score = round((skill_match_count / total_top_skills) * 100, 1)

        # Get confidence percentage
        confidence = round(float(max(probabilities)) * 100, 1)

        # Identify missing top skills
        user_skills_lower = [s.strip().lower() for s in user_skills]
        missing_skills = [s for s in top_skills if s not in user_skills_lower][:10]

        return jsonify({
            "success": True,
            "predictedLevel": predicted_level,
            "employabilityScore": employability_score,
            "confidence": confidence,
            "matchedSkills": matched_skills,
            "missingSkills": missing_skills,
            "skillMatchCount": skill_match_count,
            "totalTopSkills": total_top_skills
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─────────────────────────────────────────
# ROUTE 3 — GET TOP SKILLS LIST
# ─────────────────────────────────────────
@app.route('/top-skills', methods=['GET'])
def get_top_skills():
    return jsonify({
        "success": True,
        "topSkills": top_skills,
        "total": len(top_skills)
    })

# ─────────────────────────────────────────
# RUN FLASK SERVER
# ─────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🚀 SkillBridge Flask API running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)