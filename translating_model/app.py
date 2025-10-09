from flask import Flask, render_template, request
from transformers import MarianMTModel, MarianTokenizer
from googletrans import Translator
import time

app = Flask(__name__)

# --- MODEL AND TRANSLATOR SETUP ---
# 1. Load the local Helsinki-NLP model
print("Loading Helsinki-NLP model...")
fi_en_model_name = 'Helsinki-NLP/opus-mt-fi-en'
fi_en_tokenizer = MarianTokenizer.from_pretrained(fi_en_model_name)
fi_en_model = MarianMTModel.from_pretrained(fi_en_model_name)
print("Helsinki-NLP model loaded.")

# 2. Initialize the Google Translate client
translator = Translator()
# --- END OF SETUP ---


# --- TRANSLATION HELPER FUNCTIONS ---
def translate_with_helsinki(text):
    """Translates text using the local Helsinki-NLP model."""
    tokenized_text = fi_en_tokenizer.prepare_seq2seq_batch(src_texts=[text], return_tensors='pt')
    translation = fi_en_model.generate(**tokenized_text)
    translated_text = fi_en_tokenizer.batch_decode(translation, skip_special_tokens=True)[0]
    return translated_text

def translate_with_google(text):
    """Translates text using the Google Translate API."""
    try:
        # We add a small delay to be polite to the API
        time.sleep(0.5)
        result = translator.translate(text, src='fi', dest='en')
        return result.text
    except Exception as e:
        print(f"Google Translate Error: {e}")
        return "Error translating with Google Translate."
# --- END OF HELPER FUNCTIONS ---


@app.route('/', methods=['GET', 'POST'])
def home():
    translated_text = None
    original_text = None
    # Default to helsinki if no choice is made yet
    model_choice = 'helsinki' 

    if request.method == 'POST':
        # Get all the data from the form
        original_text = request.form['input_text']
        model_choice = request.form['model_choice']

        # Call the correct function based on the user's choice
        if model_choice == 'helsinki':
            translated_text = translate_with_helsinki(original_text)
        elif model_choice == 'google':
            translated_text = translate_with_google(original_text)

    # Pass all results back to the template
    return render_template('index.html',
                           translated_text=translated_text,
                           original_text=original_text,
                           model_choice=model_choice)

if __name__ == '__main__':
    app.run(debug=True)