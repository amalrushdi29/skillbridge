from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os

import re

def normalize_skill(skill):
    """
    Normalizes a skill name for consistent matching.
    Removes dots, extra spaces and converts to lowercase.
    e.g. "Node.js" → "nodejs", "C++" stays "c++"
    """
    skill = skill.strip().lower()
    # Remove dots only when between letters/numbers
    # so "node.js" → "nodejs" but "c++" stays "c++"
    skill = re.sub(r'(?<=[a-z0-9])\.(?=[a-z0-9])', '', skill)
    return skill

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────
# LOAD MODEL AND ENCODERS ON STARTUP
# ─────────────────────────────────────────
print("📦 Loading model and encoders...")

model            = joblib.load("model/skillbridge_model.pkl")
le_level         = joblib.load("model/label_encoder_level.pkl")
le_type          = joblib.load("model/label_encoder_type.pkl")
feature_cols     = joblib.load("model/feature_columns.pkl")
top_skills       = joblib.load("model/top_skills.pkl")
role_skills_map  = joblib.load("model/role_skills_map.pkl")

print(f"✅ Model loaded successfully!")
print(f"✅ Role skills map loaded! Total unique roles: {len(role_skills_map):,}")


# ─────────────────────────────────────────
# HELPER — FIND ROLE SKILLS
# ─────────────────────────────────────────
def get_role_skills(target_role):
    """
    Finds required skills for a target role.
    1. Exact match
    2. Full phrase partial match
    3. Fallback to top_skills
    Returns: (all_skills_list, ranked_skills_list)
    """
    target_lower = target_role.strip().lower()

    # ── 1. Exact match ──
    if target_lower in role_skills_map:
        data = role_skills_map[target_lower]
        print(f"✅ Exact match: '{target_role}' → {len(data['skills'])} skills")
        return data["skills"], data["ranked"]

    # ── 2. Full phrase partial match ──
    merged_counts  = {}
    matched_titles = []

    for role_title, data in role_skills_map.items():
        if target_lower in role_title:
            matched_titles.append(role_title)
            for skill, count in data["counts"].items():
                merged_counts[skill] = merged_counts.get(skill, 0) + count

    if merged_counts:
        print(f"✅ Phrase match: '{target_role}' → {len(matched_titles)} variations merged")
        all_ranked = sorted(
            merged_counts.keys(),
            key=lambda s: merged_counts[s],
            reverse=True
        )
        return all_ranked, all_ranked[:50]

    # ── 3. Fallback ──
    print(f"⚠️  No match for '{target_role}', using top_skills fallback")
    return top_skills, top_skills


# ─────────────────────────────────────────
# HELPER — BUILD FEATURE VECTOR
# ─────────────────────────────────────────
def build_features(user_skills, job_type):
    """
    Converts user skills and job type into
    the exact feature vector the model expects
    """
    user_skills_lower = [s.strip().lower() for s in user_skills]

    features = []
    for col in feature_cols:
        if col == 'job_type_encoded':
            job_type_clean = job_type.strip().lower()
            known_types    = list(le_type.classes_)
            if job_type_clean in known_types:
                encoded = le_type.transform([job_type_clean])[0]
            else:
                encoded = 0
            features.append(encoded)
        else:
            skill     = col.replace('_', ' ').replace('plus', '+').replace('sharp', '#')
            has_skill = 1 if skill in user_skills_lower else 0
            features.append(has_skill)

    return features


# ─────────────────────────────────────────
# HELPER — CALCULATE PREDICTED LEVEL
# ─────────────────────────────────────────
def get_predicted_level(employability_score):
    """
    Overrides ML level prediction with score based calculation.
    ML model is biased toward Mid Senior due to training data imbalance.
    """
    if employability_score <= 20:
        return "Entry Level"
    elif employability_score <= 40:
        return "Associate"
    elif employability_score <= 60:
        return "Mid Level"
    elif employability_score <= 80:
        return "Senior"
    elif employability_score < 100:
        return "Lead"
    else:
        return "Principal"


# ─────────────────────────────────────────
# ROUTE 1 — HEALTH CHECK
# ─────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status":     "running",
        "model":      "SkillBridge Random Forest v1.0",
        "accuracy":   "83.14%",
        "totalRoles": len(role_skills_map)
    })


# ─────────────────────────────────────────
# ROUTE 2 — PREDICT EMPLOYABILITY
# ─────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        user_skills = data.get('skills', [])
        job_type    = data.get('jobType', 'full-time')

        if not user_skills:
            return jsonify({"error": "Skills list is required"}), 400

        features        = build_features(user_skills, job_type)
        features_array  = np.array(features).reshape(1, -1)

        prediction      = model.predict(features_array)[0]
        probabilities   = model.predict_proba(features_array)[0]
        confidence      = round(float(max(probabilities)) * 100, 1)

        # Calculate employability score
        user_skills_lower   = [s.strip().lower() for s in user_skills]
        matched_skills      = [s for s in user_skills_lower if s in top_skills]
        skill_match_count   = len(matched_skills)
        total_top_skills    = len(top_skills)
        raw_score           = (skill_match_count / 20) * 100
        employability_score = round(min(raw_score, 100.0), 1)

        # Level based on score
        predicted_level = get_predicted_level(employability_score)

        missing_skills = [s for s in top_skills if s not in user_skills_lower][:10]

        return jsonify({
            "success":            True,
            "predictedLevel":     predicted_level,
            "employabilityScore": employability_score,
            "confidence":         confidence,
            "matchedSkills":      matched_skills,
            "missingSkills":      missing_skills,
            "skillMatchCount":    skill_match_count,
            "totalTopSkills":     total_top_skills
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────
# ROUTE 3 — GET TOP SKILLS LIST
# ─────────────────────────────────────────
@app.route('/top-skills', methods=['GET'])
def get_top_skills():
    return jsonify({
        "success":   True,
        "topSkills": top_skills,
        "total":     len(top_skills)
    })


# ─────────────────────────────────────────
# ROUTE 4 — SKILL GAP ANALYSIS
# ─────────────────────────────────────────
@app.route('/skill-gap', methods=['POST'])
def skill_gap():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        user_skills         = data.get('skills', [])
        target_role         = data.get('targetRole', '')
        job_type            = data.get('jobType', 'full-time')
        years_of_experience = data.get('yearsOfExperience', 0)

        if not user_skills:
            return jsonify({"error": "Skills list is required"}), 400

        if not target_role:
            return jsonify({"error": "Target role is required"}), 400

        # ── Normalize user skills first ──
        # Must be done before anything else
        user_skills_lower = [normalize_skill(s) for s in user_skills]

        # ── ML prediction ──
        features       = build_features(user_skills, job_type)
        features_array = np.array(features).reshape(1, -1)
        prediction     = model.predict(features_array)[0]
        probabilities  = model.predict_proba(features_array)[0]
        confidence     = round(float(max(probabilities)) * 100, 1)

        # ── Employability score ──
        matched_top         = [s for s in user_skills_lower if s in top_skills]
        raw_score           = (len(matched_top) / 20) * 100
        employability_score = round(min(raw_score, 100.0), 1)

        # ── Predicted level based on score ──
        predicted_level = get_predicted_level(employability_score)

        # ── Role specific skill gap ──
        all_role_skills, ranked_role_skills = get_role_skills(target_role)

        # Match % against top 30 role skills
        top_30_role_skills = ranked_role_skills[:30]
        matched_top30      = [s for s in top_30_role_skills if s in user_skills_lower]
        match_percentage   = round(
            (len(matched_top30) / len(top_30_role_skills)) * 100, 1
        ) if top_30_role_skills else 0

        # Matched skills from ranked list
        matched_display = [s for s in ranked_role_skills if s in user_skills_lower]

        # Missing skills — top 15 by importance
        missing_display = [
            s for s in ranked_role_skills
            if s not in user_skills_lower
        ][:15]

        return jsonify({
            "success":            True,
            "targetRole":         target_role,
            "predictedLevel":     predicted_level,
            "confidence":         confidence,
            "employabilityScore": employability_score,
            "matchPercentage":    match_percentage,
            "matchedSkills":      matched_display,
            "missingSkills":      missing_display,
            "totalRoleSkills":    len(all_role_skills),
            "yearsOfExperience":  years_of_experience
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─────────────────────────────────────────
# ROUTE 5 — SEARCH ROLES
# ─────────────────────────────────────────
@app.route('/roles', methods=['GET'])
def search_roles():
    try:
        query = request.args.get('search', '').strip().lower()

        if not query or len(query) < 2:
            return jsonify({
                "success": True,
                "roles":   [],
                "total":   0
            })

        # Find all roles that contain the search query
        matched = [
            title for title in role_skills_map.keys()
            if query in title
        ]

        # Sort by length so shorter/cleaner titles appear first
        matched.sort(key=lambda x: len(x))

        # Return top 10 matches only
        top_matches = matched[:10]

        return jsonify({
            "success": True,
            "roles":   top_matches,
            "total":   len(matched)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# ─────────────────────────────────────────
# ROUTE 6 — DASHBOARD STATS
# ─────────────────────────────────────────
@app.route('/dashboard-stats', methods=['POST'])
def dashboard_stats():
    try:
        df = pd.read_csv('data/postings2.csv')

        data        = request.get_json() or {}
        target_role = data.get('targetRole', '').strip()

        # ── Job Type Distribution ──
        job_type_counts = {}
        if 'job_type' in df.columns:
            counts = df['job_type'].dropna().str.strip().str.lower().value_counts()
            for jtype, count in counts.items():
                job_type_counts[jtype] = int(count)

        # ── Job Level Distribution ──
        job_level_counts = {}
        if 'job level' in df.columns:
            counts = df['job level'].dropna().str.strip().str.lower().value_counts()
            for level, count in counts.items():
                job_level_counts[level] = int(count)

        # ── Top 10 Most Demanded Skills (market wide) ──
        skill_counts = {}
        if 'job_skills' in df.columns:
            for cell in df['job_skills'].dropna():
                skills = [s.strip().strip("[]'\"").strip().lower() for s in str(cell).split(',')]
                for skill in skills:
                    if skill:
                        skill_counts[skill] = skill_counts.get(skill, 0) + 1

        top_10 = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        top_skills_data = [{"skill": s, "count": c} for s, c in top_10]

        # ── Role Specific Top Skills ──
        role_specific_skills = []
        if target_role:
            _, ranked_role_skills = get_role_skills(target_role)
            role_specific_skills = [
                {"skill": s, "count": i + 1}
                for i, s in enumerate(ranked_role_skills[:10])
            ]

        return jsonify({
            "success":            True,
            "jobTypeDistrib":     job_type_counts,
            "jobLevelDistrib":    job_level_counts,
            "topSkills":          top_skills_data,
            "roleSpecificSkills": role_specific_skills,
            "targetRole":         target_role,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# ─────────────────────────────────────────
# ROUTE 7 — TRENDING JOB ROLES
# ─────────────────────────────────────────
@app.route('/trending-roles', methods=['GET'])
def trending_roles():
    try:
        df = pd.read_csv('data/postings2.csv')

        if 'job_title' not in df.columns:
            return jsonify({"error": "job_title column not found"}), 500

        # ── Role grouping map ──
        role_groups = {
            "Software Engineer":         ["software engineer", "sr. software engineer", "software engineer ii", "software engineer iii", "software engineer iv"],
            "Senior Software Engineer":  ["senior software engineer", "staff software engineer"],
            "Software Developer":        ["software developer", "senior software developer", "sr. software developer"],
            "Full Stack Developer":      ["full stack developer", "full-stack developer", "senior full stack developer"],
            "Frontend Developer":        ["frontend developer", "front end developer", "front-end developer", "senior frontend developer", "ui developer"],
            "Backend Developer":         ["backend developer", "back end developer", "back-end developer", "senior backend developer"],
            "Data Engineer":             ["data engineer", "senior data engineer", "lead data engineer"],
            "Data Scientist":            ["data scientist", "senior data scientist", "staff data scientist"],
            "DevOps Engineer":           ["devops engineer", "senior devops engineer", "sr. devops engineer"],
            "Embedded Engineer":         ["embedded software engineer", "senior embedded software engineer", "embedded systems engineer"],
            "Lead Engineer":             ["lead software engineer", "principal software engineer", "engineering lead"],
            "Cloud Engineer":            ["cloud engineer", "senior cloud engineer", "cloud architect"],
            "QA Engineer":               ["qa engineer", "quality assurance engineer", "senior qa engineer", "sdet"],
            "Mobile Developer":          ["mobile developer", "ios developer", "android developer", "mobile engineer"],
            "Machine Learning Engineer": ["machine learning engineer", "ml engineer", "senior machine learning engineer"],
        }

        # ── Count grouped roles ──
        grouped_counts = {group: 0 for group in role_groups}

        for title in df['job_title'].dropna().str.strip().str.lower():
            for group, variants in role_groups.items():
                if any(variant in title for variant in variants):
                    grouped_counts[group] += 1
                    break

        # ── Sort and take top 10 ──
        sorted_roles = sorted(
            grouped_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )

        # ── Filter out zero counts ──
        top_roles = [
            {"role": r, "count": c}
            for r, c in sorted_roles
            if c > 0
        ][:10]

        return jsonify({
            "success": True,
            "roles":   top_roles
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500    
    
# ─────────────────────────────────────────
# ROUTE 8 — JOB LISTINGS WITH MATCH %
# ─────────────────────────────────────────
@app.route('/jobs', methods=['POST'])
def get_jobs():
    try:
        df = pd.read_csv('data/postings2.csv')

        data        = request.get_json() or {}
        user_skills = data.get('skills', [])
        page        = int(data.get('page', 1))
        per_page    = 10
        search      = data.get('search', '').strip().lower()
        filter_level = data.get('jobLevel', '').strip().lower()
        filter_type  = data.get('jobType', '').strip().lower()

        # ── Normalize user skills ──
        user_skills_norm = [normalize_skill(s) for s in user_skills]

        # ── Rename 'job level' column ──
        df = df.rename(columns={'job level': 'job_level'})

        # ── Drop rows with missing key fields ──
        df = df.dropna(subset=['job_title', 'job_level', 'job_type', 'job_skills'])

        # ── Apply filters BEFORE calculating match ──
        if search:
            df = df[df['job_title'].str.lower().str.contains(search, na=False)]

        if filter_level:
            df = df[df['job_level'].str.lower().str.strip() == filter_level]

        if filter_type:
            df = df[df['job_type'].str.lower().str.strip() == filter_type]

        # ── Calculate match percentage for each job ──
        def calculate_match(job_skills_raw):
            try:
                import ast
                skills_list = ast.literal_eval(job_skills_raw)
                skills_norm = [normalize_skill(s) for s in skills_list]
                if not skills_norm:
                    return 0
                matched = [s for s in skills_norm if s in user_skills_norm]
                return round((len(matched) / len(skills_norm)) * 100, 1)
            except:
                return 0

        def parse_skills(job_skills_raw):
            try:
                import ast
                skills_list = ast.literal_eval(job_skills_raw)
                return [s.strip() for s in skills_list]
            except:
                return []

        df['match_percentage'] = df['job_skills'].apply(calculate_match)

        # ── Sort by match % descending ──
        df = df.sort_values('match_percentage', ascending=False)

        # ── Pagination ──
        total     = len(df)
        total_pages = max(1, -(-total // per_page))  # ceiling division
        start     = (page - 1) * per_page
        end       = start + per_page
        page_df   = df.iloc[start:end]

        # ── Build response ──
        jobs = []
        for idx, row in page_df.iterrows():
            jobs.append({
                "id":               int(idx),
                "jobTitle":         str(row['job_title']),
                "company":          str(row['company']) if pd.notna(row.get('company')) else '',
                "location":         str(row['job_location']) if pd.notna(row.get('job_location')) else '',
                "jobLevel":         str(row['job_level']),
                "jobType":          str(row['job_type']),
                "jobSkills":        parse_skills(row['job_skills']),
                "matchPercentage":  float(row['match_percentage']),
                "datePosted":       str(row['date_posted']) if pd.notna(row.get('date_posted')) else '',
                "jobLink":          str(row['job_link']) if pd.notna(row.get('job_link')) else '',
            })

        return jsonify({
            "success":    True,
            "jobs":       jobs,
            "total":      total,
            "page":       page,
            "totalPages": total_pages
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────
# RUN FLASK SERVER
# ─────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🚀 SkillBridge Flask API running on port 5001")
    app.run(host='0.0.0.0', port=port, debug=True)