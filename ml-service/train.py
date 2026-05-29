import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import SMOTE
import joblib
import os
import ast

print("🚀 Starting SkillBridge ML Training Pipeline...")

# ─────────────────────────────────────────
# STEP 1 - LOAD DATA
# ─────────────────────────────────────────
print("\n📂 Loading dataset...")

df = pd.read_csv("data/postings2.csv")
print(f"   Rows loaded: {len(df)}")

# ─────────────────────────────────────────
# STEP 2 - KEEP USEFUL COLUMNS
# ─────────────────────────────────────────
print("\n🧹 Cleaning data...")

# Rename 'job level' to 'job_level' to remove the space
df = df.rename(columns={'job level': 'job_level'})

# Keep only useful columns
df = df[['job_title', 'job_level', 'job_type', 'job_skills']].copy()

# Drop rows with missing values
df.dropna(inplace=True)

# Keep only valid job levels
df = df[df['job_level'].isin(['Associate', 'Mid senior'])]

print(f"   Clean rows: {len(df)}")
print(f"   Job level distribution:\n{df['job_level'].value_counts()}")

# ─────────────────────────────────────────
# STEP 3 - PARSE SKILLS FROM STRING
# ─────────────────────────────────────────
print("\n⚙️  Parsing skills...")

def parse_skills(skill_str):
    try:
        # Convert string like "['Python', ' SQL']" to actual list
        skills = ast.literal_eval(skill_str)
        # Clean each skill — lowercase and strip spaces
        return [s.strip().lower() for s in skills]
    except:
        return []

df['skills_list'] = df['job_skills'].apply(parse_skills)

# ─────────────────────────────────────────
# STEP 4 - FEATURE ENGINEERING
# ─────────────────────────────────────────
print("\n🔧 Engineering features...")

TOP_SKILLS = [
    'python', 'javascript', 'java', 'sql', 'react', 'node.js', 'aws',
    'docker', 'kubernetes', 'git', 'machine learning', 'deep learning',
    'data analysis', 'tensorflow', 'mongodb', 'postgresql', 'linux',
    'azure', 'typescript', 'html', 'css', 'c++', 'c#', 'php', 'swift',
    'kotlin', 'flutter', 'django', 'flask', 'spring', 'redis', 'graphql',
    'rest api', 'microservices', 'ci/cd', 'jenkins', 'terraform', 'ansible',
    'spark', 'hadoop', 'tableau', 'power bi', 'excel', 'jira', 'scrum',
    'agile', 'linux', 'bash', 'golang', 'rust', 'scala', 'pytorch',
    'opencv', 'nlp', 'blockchain', 'unity', 'unreal', 'figma', 'selenium'
]

# Create binary column for each top skill
# 1 = job requires this skill, 0 = it doesn't
for skill in TOP_SKILLS:
    col = skill.replace('.', '_').replace(' ', '_').replace('+', 'plus').replace('#', 'sharp')
    df[col] = df['skills_list'].apply(lambda x: 1 if skill in x else 0)

# Encode job_type (Remote / Onsite / Hybrid)
df['job_type'] = df['job_type'].str.strip().str.lower()
le_type = LabelEncoder()
df['job_type_encoded'] = le_type.fit_transform(df['job_type'])

print(f"   Features created successfully")

# ─────────────────────────────────────────
# STEP 5 - PREPARE FEATURES AND TARGET
# ─────────────────────────────────────────
print("\n🎯 Preparing features and target...")

skill_cols = [
    s.replace('.', '_').replace(' ', '_').replace('+', 'plus').replace('#', 'sharp')
    for s in TOP_SKILLS
]
feature_cols = skill_cols + ['job_type_encoded']

X = df[feature_cols]

le_level = LabelEncoder()
y = le_level.fit_transform(df['job_level'])

print(f"   Classes: {list(le_level.classes_)}")
print(f"   Feature count: {len(feature_cols)}")

# ─────────────────────────────────────────
# STEP 6 - HANDLE CLASS IMBALANCE WITH SMOTE
# ─────────────────────────────────────────
print("\n⚖️  Balancing classes with SMOTE...")

# SMOTE creates synthetic samples of the minority class
# instead of just reweighting — much more effective
smote = SMOTE(random_state=42)
X_balanced, y_balanced = smote.fit_resample(X, y)

print(f"   Before SMOTE: {dict(zip(le_level.classes_, np.bincount(y)))}")
print(f"   After SMOTE:  {dict(zip(le_level.classes_, np.bincount(y_balanced)))}")

# ─────────────────────────────────────────
# STEP 7 - TRAIN / TEST SPLIT
# ─────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X_balanced, y_balanced,
    test_size=0.2,
    random_state=42,
    stratify=y_balanced
)

print(f"\n📊 Training set: {len(X_train)} rows")
print(f"   Testing set:  {len(X_test)} rows")

# ─────────────────────────────────────────
# STEP 8 - TRAIN RANDOM FOREST MODEL
# ─────────────────────────────────────────
print("\n🌲 Training Random Forest model...")
print("   Please wait...")

model = RandomForestClassifier(
    n_estimators=500,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features='sqrt',
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

# ─────────────────────────────────────────
# STEP 9 - EVALUATE MODEL
# ─────────────────────────────────────────
print("\n📈 Evaluating model...")

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n✅ Model Accuracy: {accuracy * 100:.2f}%")
print("\n📋 Classification Report:")
print(classification_report(y_test, y_pred, target_names=le_level.classes_))

if accuracy >= 0.80:
    print("🎉 Target accuracy of 80% achieved!")
else:
    print("⚠️  Accuracy below 80% — but model still saved.")

# ─────────────────────────────────────────
# STEP 10 - SAVE EVERYTHING
# ─────────────────────────────────────────
print("\n💾 Saving model and encoders...")

os.makedirs("model", exist_ok=True)

joblib.dump(model, "model/skillbridge_model.pkl")
joblib.dump(le_level, "model/label_encoder_level.pkl")
joblib.dump(le_type, "model/label_encoder_type.pkl")
joblib.dump(feature_cols, "model/feature_columns.pkl")
joblib.dump(TOP_SKILLS, "model/top_skills.pkl")

print("   ✅ model/skillbridge_model.pkl")
print("   ✅ model/label_encoder_level.pkl")
print("   ✅ model/label_encoder_type.pkl")
print("   ✅ model/feature_columns.pkl")
print("   ✅ model/top_skills.pkl")

print("\n🏁 Training complete! SkillBridge ML model is ready.")