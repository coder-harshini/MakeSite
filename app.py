
import os
import re
import logging
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai

load_dotenv()
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)

api_key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

client = genai.Client(api_key=api_key) if api_key else None


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/generate", methods=["POST"])
def generate():
    data = request.get_json(silent=True) or {}
    prompt = (data.get("prompt") or "").strip()

    if not prompt:
        return jsonify({"error": "Please describe the website you want."}), 400

    if not client:
        return jsonify({"error": "Gemini API key is missing. Check your .env file."}), 500

    instructions = """
You are MakeSite, an expert website builder.
Create a complete, attractive, responsive website from the user's description.
Return ONLY the HTML document, with CSS inside <style> and JavaScript inside
<script>. Do not use Markdown fences. Make the website visually polished,
mobile-friendly, and functional. Use inline SVG or CSS for simple visuals.
Do not include explanations outside the HTML.
"""

    try:
        response = client.models.generate_content(
            model=model,
            contents=f"{instructions}\n\nWebsite request:\n{prompt}",
        )

        html = (response.text or "").strip()
        html = re.sub(r"^```(?:html)?\s*", "", html, flags=re.IGNORECASE)
        html = re.sub(r"\s*```$", "", html)

        if not html:
            raise ValueError("The AI returned an empty response.")

        return jsonify({"html": html})

    except Exception as error:
        logging.exception("Website generation failed")
        return jsonify({
            "error": f"Website generation failed: {str(error)}"
        }), 500


if __name__ == "__main__":
    app.run(debug=True)