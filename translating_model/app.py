from flask import Flask, render_template, request
# from transformers import MarianMTModel, MarianTokenizer
from googletrans import Translator
import time
from log_debug import logging


app = Flask(__name__)


# # Load the local Helsinki-NLP model
# print("Loading Helsinki-NLP model...")
# fi_en_model_name = 'Helsinki-NLP/opus-mt-fi-en'
# fi_en_tokenizer = MarianTokenizer.from_pretrained(fi_en_model_name)
# fi_en_model = MarianMTModel.from_pretrained(fi_en_model_name)
# print("Helsinki-NLP model loaded.")

# Initialize the Google Translate client
translator = Translator()



# # --- TRANSLATION HELPER FUNCTIONS ---
# def translate_with_helsinki(text, dest_lan):
#     """Translates text using the local Helsinki-NLP model."""
#     tokenized_text = fi_en_tokenizer.prepare_seq2seq_batch(src_texts=[text], return_tensors='pt')
#     translation = fi_en_model.generate(**tokenized_text)
#     translated_text = fi_en_tokenizer.batch_decode(translation, skip_special_tokens=True)[0]
#     return translated_text

def translate_with_google(text, src, dest):
    """Translates text using the Google Translate API."""
    try:
        # add a small delay 
        time.sleep(0.5)
        result = translator.translate(text, src=src, dest=dest)
        return result.text
    except Exception as e:
        print(f"Google Translate Error: {e}")
        return "Error translating with Google Translate."



@app.route('/', methods=['GET', 'POST'])
def home():
    translated_text = None
    original_text = None
    dest_lan = None
    # Default to helsinki if no choice is made yet

    if request.method == 'POST':
        # Get all the data from the form
        original_text = request.form['input_text']
        dest_lan = request.form['destination_language']

        # Call the correct function based on the user's choice
        if dest_lan == 'fi':
            translated_text = translate_with_google(original_text, 'en', 'fi')
            logging.info(f"Translating from Finnish: {original_text} into English")
        else:
            translated_text = translate_with_google(original_text, 'fi', 'en')
            logging.info(f"Translating from English: {original_text} into Finnish")

    # Pass all results back to the template

    logging.info(f"Final translation: {translated_text}")
    return render_template('index.html',
                           translated_text=translated_text,
                           original_text=original_text,
                           dest_lan = dest_lan)

if __name__ == '__main__':
    app.run(debug=True)