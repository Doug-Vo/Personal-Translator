from flask import Flask, render_template, request, jsonify
from googletrans import Translator
import time
from log_debug import logging

app = Flask(__name__)


# Initialize the Google Translate client
translator = Translator()



def translate_with_google(text, src, dest):
    """Translates text using the Google Translate API."""
    try:
        # add a small delay 
        time.sleep(0.1)
        result = translator.translate(text, src=src, dest=dest)
        return result.text
    except Exception as e:
        logging.error(f"Google Translate Error: {e}")
        return "Error translating with Google Translate."



@app.route('/', methods=['GET'])
def home():    
    return render_template('index.html')


@app.route('/api/translate', methods = ['POST'])
def api_translate():

    query = request.get_json()
    results = {}
    original_text = query.get("text")
    source_lang = query.get("source_lang")

    languages  = ['en', 'fi', 'vi']

    if not original_text or not source_lang:
        return jsonify({"error": "Missing Data!"}), 400

    # Call the correct function based on the language choice
    for lang in languages:
        if lang != source_lang:
            translate = translate_with_google(original_text, source_lang, lang)
            results[lang] = translate

            logging.info(f"Translated into {lang}!")
        

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)