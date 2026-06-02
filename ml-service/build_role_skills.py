import pandas as pd
import joblib
import re
from collections import defaultdict, Counter

# ─────────────────────────────────────────
# NORMALIZE SKILL NAME
# ─────────────────────────────────────────
def normalize_skill(skill):
    """
    Normalizes a skill name for consistent matching.
    e.g. "Node.js" → "nodejs", "C++" stays "c++"
    """
    skill = skill.strip().lower()
    skill = re.sub(r'(?<=[a-z0-9])\.(?=[a-z0-9])', '', skill)
    return skill


# ─────────────────────────────────────────
# CLEANING CONFIG
# ─────────────────────────────────────────
MAX_SKILL_LENGTH = 40

BANNED_KEYWORDS = [
    # Benefits
    "gym", "leave", "insurance", "vacation", "bonus",
    "salary", "pay", "401", "pension", "holiday",
    "wellness", "dental", "vision", "medical", "stipend",
    "parental", "maternity", "paternity", "pto", "perks",
    # Legal / HR
    "clearance", "citizenship", "polygraph", "eeo",
    "disability", "veteran", "diversity", "equal",
    "drug", "tobacco", "smokefree", "background check",
    "authorized", "authorization", "eligible",
    # Degrees / Certifications as requirements
    "bachelor", "master", "phd", "degree", "diploma",
    "certification", "certified", "graduate", "undergraduate",
    # Vague non-skills
    "years of experience", "work experience", "experience in",
    "ability to", "willingness", "must be", "required",
    "responsible", "opportunity", "environment", "culture",
    "travel", "relocation", "hybrid", "remote", "onsite",
]

def is_clean_skill(skill):
    """
    Returns True if the skill is a genuine technical
    or professional skill worth showing to the user.
    Receives an already normalized skill string.
    """
    # Filter 1 — too long
    if len(skill) > MAX_SKILL_LENGTH:
        return False

    # Filter 2 — starts with a digit
    if skill and skill[0].isdigit():
        return False

    # Filter 3 — contains banned keywords
    for banned in BANNED_KEYWORDS:
        if banned in skill:
            return False

    # Filter 4 — too short to be meaningful
    if len(skill.strip()) < 3:
        return False

    return True


# ─────────────────────────────────────────
# LOAD DATASETS
# ─────────────────────────────────────────
print("📂 Loading datasets...")
print("   This may take 30-60 seconds...")

postings = pd.read_csv(
    "data/linkedin_job_postings.csv",
    usecols=["job_link", "job_title"]
)
skills_df = pd.read_csv(
    "data/job_skills.csv",
    usecols=["job_link", "job_skills"]
)

print(f"✅ Postings loaded:  {len(postings):,} rows")
print(f"✅ Skills loaded:    {len(skills_df):,} rows")


# ─────────────────────────────────────────
# MERGE DATASETS
# ─────────────────────────────────────────
print("🔗 Merging on job_link...")
df = postings.merge(skills_df, on="job_link", how="inner")
df = df.dropna(subset=["job_title", "job_skills"])
print(f"✅ Merged rows:      {len(df):,}")


# ─────────────────────────────────────────
# BUILD ROLE SKILLS MAP
# ─────────────────────────────────────────
print("🔨 Building role skills map...")
print("   This may take a few minutes...")

role_skill_counters = defaultdict(Counter)

for _, row in df.iterrows():
    # Normalize job title
    title = row["job_title"].strip().lower()

    # Split comma separated skills
    # ✅ normalize_skill applied here — fixes node.js vs nodejs
    raw_skills = [
        normalize_skill(s)
        for s in row["job_skills"].split(",")
        if s.strip()
    ]

    # Apply cleaning filters on already normalized skills
    clean_skills = [s for s in raw_skills if is_clean_skill(s)]

    # Count each skill for this role
    role_skill_counters[title].update(clean_skills)


# ─────────────────────────────────────────
# BUILD FINAL MAP WITH SKILLS + RANKED
# ─────────────────────────────────────────
print("📊 Building final role skills map with rankings...")

role_skills_map = {}

for title, skill_counter in role_skill_counters.items():
    # Only keep skills that appear in 2+ listings
    filtered = {
        skill: count
        for skill, count in skill_counter.items()
        if count >= 2
    }

    if not filtered:
        continue

    # Sort by frequency descending
    ranked = sorted(
        filtered.keys(),
        key=lambda s: filtered[s],
        reverse=True
    )

    role_skills_map[title] = {
        "skills": ranked,       # all clean skills for match % calculation
        "ranked": ranked[:50],  # top 50 for display + missing skills
        "counts": filtered      # frequency counts for merging variations
    }

total_roles = len(role_skills_map)
print(f"✅ Role skills map built! Total unique roles: {total_roles:,}")


# ─────────────────────────────────────────
# PREVIEW RESULTS
# ─────────────────────────────────────────
print("\n📋 Sample roles:")
sample = list(role_skills_map.keys())[:5]
for role in sample:
    data = role_skills_map[role]
    print(f"   {role}")
    print(f"   → {len(data['skills'])} clean skills total")
    print(f"   → Top 5: {data['ranked'][:5]}")
    print()

print("🔍 Checking 'data scientist':")
if "data scientist" in role_skills_map:
    ds = role_skills_map["data scientist"]
    print(f"   ✅ Found! {len(ds['skills'])} clean skills")
    print(f"   Top 15 ranked: {ds['ranked'][:15]}")
else:
    print("   ⚠️  Exact match not found")
    matches = [r for r in role_skills_map if "data scientist" in r]
    print(f"   Phrase matches: {matches[:5]}")

# ✅ Check nodejs specifically
print("\n🔍 Checking nodejs normalization:")
if "frontend developer" in role_skills_map:
    fd = role_skills_map["frontend developer"]
    nodejs_check = [s for s in fd["skills"] if "node" in s]
    print(f"   Node related skills: {nodejs_check[:5]}")


# ─────────────────────────────────────────
# SAVE PICKLE FILE
# ─────────────────────────────────────────
print("\n💾 Saving role_skills_map.pkl...")
joblib.dump(role_skills_map, "model/role_skills_map.pkl")
print("✅ Saved to model/role_skills_map.pkl")
print("\n🎉 Done! Restart Flask to use the new map.")