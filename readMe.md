# PeTS - Personal Translation Station

PeTS is a modern, real-time web application that provides seamless tri-directional translation between **English**, **Finnish**, and **Vietnamese**. 



## Features

-   **Real-Time Translation:** Translations appear automatically as you type (debounced for performance), 

-   **Tri-Directional Support:** Translate between English, Finnish, and Vietnamese.
  

-   **Dark Mode** support with automatic system preference detection.
  
-   **Production Ready:** Containerized with Docker and optimized with Gunicorn.

## Tech Stack

-   **Backend:** Python, Flask, Gunicorn
-   **Frontend:** HTML5, JavaScript (ES6+), Tailwind CSS
-   **Translation Engine:** `googletrans` (Unofficial Google Translate API)
-   **DevOps:** Docker, Docker Compose

## How It Works

1.  **Frontend:** The client-side JavaScript listens for input events. When the user stops typing (after a 600ms delay), it sends an asynchronous `POST` request to the backend API.
   
2.  **Backend:** The Flask server receives the text and the source language. It then calls the translation engine to generate translations for the other two target languages simultaneously.
   
3.  **Response:** The translations are returned as a JSON object, and the frontend updates the corresponding text areas.

## Setup and Installation

### Option 1: Run with Docker (Recommended)

The easiest way to run PeTS is using Docker. This ensures you have the exact environment needed without installing Python dependencies.

1.  **Build the Image:**
    ```bash
    docker build -t pets-translator .
    ```

2.  **Run the Container:**
    ```bash
    docker run -p 8080:8080 pets-translator
    ```

3.  **Access the App:**
    Open your browser and navigate to `http://localhost:8080`.

### Option 2: Local Development

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Doug-Vo/Personal-Translator.git
    cd Personal-Translator
    ```

2.  **Create a Virtual Environment:**
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the App:**
    ```bash
    python app.py
    ```
    The app will be available at `http://127.0.0.1:5000`.