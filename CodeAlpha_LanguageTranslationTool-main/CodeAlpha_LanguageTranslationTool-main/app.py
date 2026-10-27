from flask import Flask, jsonify, render_template, request

from services.languages import LANGUAGE_GROUPS, LANGUAGES
from services.translator import TranslationError, translate_text


app = Flask(__name__)


@app.get("/")
def home():
    return render_template("index.html", language_groups=LANGUAGE_GROUPS)


@app.get("/api/languages")
def api_languages():
    return jsonify({"languages": LANGUAGES, "groups": LANGUAGE_GROUPS})


@app.post("/api/translate")
def api_translate():
    payload = request.get_json(silent=True) or {}
    text = (payload.get("text") or "").strip()
    source = payload.get("source") or "auto"
    target = payload.get("target") or "en"

    if not text:
        return jsonify({"error": "Please enter text before translating."}), 400

    if len(text) > 5000:
        return jsonify({"error": "Text is too long. Maximum allowed length is 5000 characters."}), 400

    valid_codes = {item["code"] for item in LANGUAGES}
    if source != "auto" and source not in valid_codes:
        return jsonify({"error": "Invalid source language selected."}), 400

    if target not in valid_codes:
        return jsonify({"error": "Invalid target language selected."}), 400

    if source == target:
        return jsonify({"error": "Source and target languages must be different."}), 400

    try:
        result = translate_text(text=text, source=source, target=target)
    except TranslationError as exc:
        return jsonify({"error": str(exc)}), 502

    return jsonify(
        {
            "input": text,
            "translated_text": result.translated_text,
            "source": source,
            "target": target,
            "characters": len(text),
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
