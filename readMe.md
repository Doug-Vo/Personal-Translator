# Finnish-to-English Translation Web App

A simple web application built with Flask that translates text from Finnish to English using two different translation models: a locally-run Helsinki-NLP model and the Google Translate API.

## Features

-   Simple web interface to input Finnish text.
-   Side-by-side comparison of the original and translated text.
-   Ability to choose between two different translation engines:
    1.  **Helsinki-NLP:** A powerful, open-source model (`Helsinki-NLP/opus-mt-fi-en`) that runs locally.
    2.  **Google Translate:** The widely-used online translation service.

## How It Works

The application uses the Flask web framework to serve a simple HTML page. When a user submits text for translation, the backend calls one of two functions based on the user's selection:

-   `translate_with_helsinki()`: Uses the `transformers` library from Hugging Face to load the `opus-mt-fi-en` model and tokenizer. It processes the text locally to generate the translation.
-   `translate_with_google()`: Uses the `googletrans` library, a free and unofficial API for Google Translate, to get the translation.

## Setup and Installation

### 1. Prerequisites

-   Python 3.7+
-   `pip` (Python package installer)

### 2. Clone the Repository

(If you are using git)
```bash
git clone https://github.com/Doug-Vo/Personal-Translator.git
```

### 3.  **Install Python packages**
```sh
pip install -r requirements.txt
```