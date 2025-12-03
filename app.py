import os
import time
from flask import Flask, render_template, request, jsonify
from flask_wtf.csrf import CSRFProtect
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from googletrans import Translator
from log_debug import logging

app = Flask(__name__)

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-this')

# Security Config
# Force HTTPS and set security headers later in Azure

Talisman(app, content_security_policy=None, force_https = False)

# Enable CSRF Protection
csrf = CSRFProtect(app)

# Rate Limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Custom Error Handler for Rate Limiting
@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "error": "You are translating too fast! Please wait a moment before trying again."
    }), 429

# Initialize Translator
translator = Translator()

def translate_with_google(text, src, dest):
    """Translates text using the Google Translate API."""
    try:
        time.sleep(0.1)
        result = translator.translate(text, src=src, dest=dest)
        return result.text
    except Exception as e:
        logging.error(f"Google Translate Error ({src}->{dest}): {e}")
        return "Error"

@app.route('/', methods=['GET'])
def home():    
    return render_template('index.html')

@app.route('/api/translate', methods=['POST'])
@limiter.limit("40 per minute") # UPDATED: Increased to 40
def api_translate():
    query = request.get_json()
    
    original_text = query.get("text")
    source_lang = query.get("source_lang")

    if not original_text or not source_lang:
        return jsonify({"error": "Missing Data!"}), 400

    results = {}
    languages = ['en', 'fi', 'vi']

    for lang in languages:
        if lang != source_lang:
            translated = translate_with_google(original_text, source_lang, lang)
            results[lang] = translated
            logging.info(f"Translated '{original_text}' ({source_lang}) -> '{translated}' ({lang})")

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)