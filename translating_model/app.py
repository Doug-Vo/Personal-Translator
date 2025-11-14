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
        # # add a small delay 
        # time.sleep(0.5)
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
    translated_text = None
    original_text = query.get("origin_text")
    dest_lan = query.get("dest_lan")

    # Call the correct function based on the language choice
    if dest_lan == 'fi':
        translated_text = translate_with_google(original_text, 'en', 'fi')
        logging.info(f"Translating from English: {original_text} \
                        \ninto Finnish: {translated_text}")
    else:
        translated_text = translate_with_google(original_text, 'fi', 'en')            
        logging.info(f"Translating from Finnish: {original_text} \
                        \ninto English: {translated_text}")
        

    return jsonify({"translation": translated_text})

if __name__ == '__main__':
    app.run(debug=True)