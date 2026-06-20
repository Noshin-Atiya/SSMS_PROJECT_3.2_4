from flask import Flask, request, jsonify
import spacy
import language_tool_python

# =========================
# 🔵 NLP MODEL INITIALIZATION
# =========================

app = Flask(__name__)

# SpaCy for preprocessing + TF-IDF style keyword extraction
nlp = spacy.load("en_core_web_md")

# LanguageTool for grammar & spelling checking
tool = language_tool_python.LanguageTool("en-US")

# =========================
# 🔵 BERT MODEL (Sentence Embedding)
# =========================
# Using Sentence-BERT (recommended for semantic similarity)
from sentence_transformers import SentenceTransformer, util

bert_model = SentenceTransformer('all-MiniLM-L6-v2')


# =========================
# 🟡 KEYWORD EXTRACTION (TF-IDF / BoW style)
# =========================
def extract_keywords(text):
    doc = nlp(text.lower())

    return set(
        token.lemma_
        for token in doc
        if token.is_alpha and not token.is_stop and len(token.text) > 2
    )


# =========================
# 🔴 GRAMMAR + SPELLING CHECK
# =========================
def check_errors(text):
    matches = tool.check(text)

    grammar_errors = 0
    spelling_errors = 0

    for m in matches:
        # LanguageTool rule type detection
        rule_type = getattr(m, "ruleIssueType", None) or getattr(m, "rule_issue_type", "")

        if "spell" in rule_type.lower() or "misspell" in m.message.lower():
            spelling_errors += 1
        else:
            grammar_errors += 1

    return grammar_errors, spelling_errors


# =========================
# 🔵 BERT SEMANTIC SIMILARITY
# =========================
def bert_similarity(student, teacher):
    emb1 = bert_model.encode(student, convert_to_tensor=True)
    emb2 = bert_model.encode(teacher, convert_to_tensor=True)

    score = util.cos_sim(emb1, emb2)
    return float(score) * 100


# =========================
# 🟡 TF-IDF / BOw KEYWORD SCORE
# =========================
def keyword_score(student_kw, teacher_kw):
    if not teacher_kw:
        return 0

    return (len(student_kw & teacher_kw) / len(teacher_kw)) * 100


# =========================
# 🔵 FINAL SCORE CALCULATION
# =========================
def calculate_final(bert, keyword):
    # Weighted hybrid scoring
    return max(0, min(100, (0.7 * bert) + (0.3 * keyword)))


# =========================
# 🚀 MAIN API ENDPOINT
# =========================
@app.route("/evaluate", methods=["POST"])
def evaluate():

    data = request.json

    student = data["student_answer"]
    teacher = data["model_answer"]

    # -------------------------
    # 1. BERT SEMANTIC SCORE
    # -------------------------
    bert_score_value = bert_similarity(student, teacher)

    # -------------------------
    # 2. TF-IDF / BOW KEYWORDS
    # -------------------------
    student_kw = extract_keywords(student)
    teacher_kw = extract_keywords(teacher)

    keyword_score_value = keyword_score(student_kw, teacher_kw)

    # -------------------------
    # 3. GRAMMAR + SPELLING
    # -------------------------
    grammar_errors, spelling_errors = check_errors(student)

    # -------------------------
    # 4. FINAL MARK
    # -------------------------
    final_score = calculate_final(bert_score_value, keyword_score_value)

    # -------------------------
    # 5. FEEDBACK GENERATION
    # -------------------------
    feedback = (
        f"BERT Similarity: {bert_score_value:.1f}% | "
        f"Keyword Match: {keyword_score_value:.1f}% | "
        f"Grammar Errors: {grammar_errors} | "
        f"Spelling Errors: {spelling_errors} | "
        f"Final Score: {final_score:.1f}"
    )

    # -------------------------
    # 6. RESPONSE TO FRONTEND
    # -------------------------
    return jsonify({
        "similarity_score": round(bert_score_value, 2),
        "keyword_score": round(keyword_score_value, 2),
        "grammar_errors": grammar_errors,
        "spelling_errors": spelling_errors,
        "final_score": round(final_score, 2),
        "feedback": feedback
    })


# =========================
# ▶ RUN SERVER
# =========================
if __name__ == "__main__":
    app.run(port=5001, debug=True)