from dataclasses import dataclass

import requests


class TranslationError(Exception):
    """Raised when the translation service cannot complete the request."""


@dataclass
class TranslationResult:
    translated_text: str


MYMEMORY_API_URL = "https://api.mymemory.translated.net/get"


def detect_source_language(text: str) -> str:
    try:
        from langdetect import detect
    except ImportError as exc:
        raise TranslationError(
            "Missing dependency: install requirements with 'pip install -r requirements.txt'."
        ) from exc

    try:
        detected = detect(text)
    except Exception as exc:
        raise TranslationError("Could not detect the source language. Please choose it manually.") from exc

    return detected.lower()


def translate_text(text: str, source: str, target: str) -> TranslationResult:
    source_code = detect_source_language(text) if source == "auto" else source

    try:
        response = requests.get(
            MYMEMORY_API_URL,
            params={"q": text, "langpair": f"{source_code}|{target}"},
            timeout=15,
        )
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException as exc:
        raise TranslationError(
            "Translation service is unavailable. Check your internet connection and try again."
        ) from exc
    except ValueError as exc:
        raise TranslationError("Translation service returned an invalid response.") from exc

    translated = payload.get("responseData", {}).get("translatedText")
    if not translated:
        raise TranslationError("No translation was returned. Please try again.")

    if payload.get("responseStatus") not in (200, "200", None):
        message = payload.get("responseDetails") or "Translation failed. Please try again."
        raise TranslationError(message)

    invalid_markers = ("INVALID SOURCE LANGUAGE", "INVALID TARGET LANGUAGE")
    if any(marker in translated.upper() for marker in invalid_markers):
        raise TranslationError("This language pair is not supported by the translation provider.")

    return TranslationResult(translated_text=translated)
