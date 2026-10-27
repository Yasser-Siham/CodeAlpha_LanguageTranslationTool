# CodeAlpha Language Translation Tool

A localhost web application built for the CodeAlpha Artificial Intelligence internship task.

## Features

- Translate text between multiple languages
- Auto-detect source language
- Flask backend with a JSON translation API
- Responsive maximalist frontend
- Swap source and target languages
- Copy translated text
- Listen to translated text using the browser Speech Synthesis API
- Recent translation history stored in the browser
- Error handling for empty text, invalid languages, and service issues

## Tech Stack

- Python
- Flask
- HTML
- CSS
- JavaScript
- requests
- langdetect

## Project Structure

```text
CodeAlpha_LanguageTranslationTool/
├── app.py
├── requirements.txt
├── README.md
├── services/
│   ├── __init__.py
│   ├── languages.py
│   └── translator.py
├── templates/
│   └── index.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

## How To Run

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Activate it on macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the app:

```bash
python app.py
```

Open the app in your browser:

```text
http://127.0.0.1:5000
```

## Demo Script

1. Open the localhost URL.
2. Write text in English.
3. Choose French or Arabic as the target language.
4. Click Translate Now.
5. Show the translated result.
6. Use Copy Result.
7. Use Listen.
8. Show Swap Languages and Recent Translations.


