const sourceLanguage = document.getElementById("sourceLanguage");
const targetLanguage = document.getElementById("targetLanguage");
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const translateBtn = document.getElementById("translateBtn");
const copyBtn = document.getElementById("copyBtn");
const speakBtn = document.getElementById("speakBtn");
const swapBtn = document.getElementById("swapBtn");
const clearBtn = document.getElementById("clearBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const charCount = document.getElementById("charCount");
const resultMeta = document.getElementById("resultMeta");
const messageBox = document.getElementById("messageBox");
const historyList = document.getElementById("historyList");
const loader = document.getElementById("loader");
const buttonText = document.getElementById("buttonText");

const HISTORY_KEY = "codealpha_translation_history";
let lastTranslation = "";

function setLoading(isLoading) {
    translateBtn.disabled = isLoading;
    loader.hidden = !isLoading;
    buttonText.textContent = isLoading ? "Translating" : "Translate Now";
}

function showMessage(message, type = "info") {
    messageBox.textContent = message;
    messageBox.className = `message ${type}`;
}

function getHistory() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
}

function saveHistory(item) {
    const history = getHistory();
    history.unshift(item);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 5)));
    renderHistory();
}

function renderHistory() {
    const history = getHistory();

    if (!history.length) {
        historyList.innerHTML = '<p class="empty-history">No translations yet.</p>';
        return;
    }

    historyList.innerHTML = history.map((item) => `
        <button class="history-item" type="button" data-output="${encodeURIComponent(item.output)}">
            <span>${item.source.toUpperCase()} → ${item.target.toUpperCase()}</span>
            <strong>${item.output}</strong>
        </button>
    `).join("");

    document.querySelectorAll(".history-item").forEach((button) => {
        button.addEventListener("click", () => {
            lastTranslation = decodeURIComponent(button.dataset.output);
            outputText.textContent = lastTranslation;
            outputText.classList.remove("output-placeholder");
            resultMeta.textContent = "Loaded from history";
        });
    });
}

async function translate() {
    const text = inputText.value.trim();

    if (!text) {
        showMessage("Please write something first.", "error");
        inputText.focus();
        return;
    }

    if (sourceLanguage.value === targetLanguage.value) {
        showMessage("Choose two different languages.", "error");
        return;
    }

    setLoading(true);
    showMessage("Sending text to translation service...", "info");

    try {
        const response = await fetch("/api/translate", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                text,
                source: sourceLanguage.value,
                target: targetLanguage.value,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Translation failed.");
        }

        lastTranslation = data.translated_text;
        outputText.textContent = lastTranslation;
        outputText.classList.remove("output-placeholder");
        resultMeta.textContent = `${data.characters} characters translated`;
        showMessage("Translation completed successfully.", "success");

        saveHistory({
            input: data.input,
            output: data.translated_text,
            source: data.source,
            target: data.target,
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        setLoading(false);
    }
}

async function copyResult() {
    if (!lastTranslation) {
        showMessage("There is no translation to copy yet.", "error");
        return;
    }

    await navigator.clipboard.writeText(lastTranslation);
    showMessage("Translation copied to clipboard.", "success");
}

function speakResult() {
    if (!lastTranslation) {
        showMessage("There is no translation to listen to yet.", "error");
        return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lastTranslation);
    utterance.lang = targetLanguage.value;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    showMessage("Playing translated text.", "info");
}

function swapLanguages() {
    if (sourceLanguage.value === "auto") {
        showMessage("Auto Detect cannot be swapped. Choose a source language first.", "error");
        return;
    }

    const currentSource = sourceLanguage.value;
    sourceLanguage.value = targetLanguage.value;
    targetLanguage.value = currentSource;

    if (lastTranslation) {
        inputText.value = lastTranslation;
        charCount.textContent = inputText.value.length;
        outputText.textContent = "Ready for reverse translation.";
        outputText.classList.add("output-placeholder");
        lastTranslation = "";
        resultMeta.textContent = "Languages swapped";
    }
}

function clearAll() {
    inputText.value = "";
    outputText.textContent = "Your translation will appear here.";
    outputText.classList.add("output-placeholder");
    resultMeta.textContent = "Ready";
    charCount.textContent = "0";
    lastTranslation = "";
    showMessage("", "info");
}

inputText.addEventListener("input", () => {
    charCount.textContent = inputText.value.length;
});

translateBtn.addEventListener("click", translate);
copyBtn.addEventListener("click", copyResult);
speakBtn.addEventListener("click", speakResult);
swapBtn.addEventListener("click", swapLanguages);
clearBtn.addEventListener("click", clearAll);
clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
});

inputText.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        translate();
    }
});

renderHistory();

// Source field quick actions.
document.getElementById("copyInputBtn").addEventListener("click", async () => {
    if (!inputText.value.trim()) return showMessage("Please write something first.", "error");
    try {
        await navigator.clipboard.writeText(inputText.value);
        showMessage("Source text copied.", "success");
    } catch { showMessage("Could not access the clipboard.", "error"); }
});
document.getElementById("speakInputBtn").addEventListener("click", () => {
    if (!inputText.value.trim()) return showMessage("Please write something first.", "error");
    if (!("speechSynthesis" in window)) return showMessage("Voice playback is unavailable in this browser.", "error");
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(inputText.value);
    if (sourceLanguage.value !== "auto") speech.lang = sourceLanguage.value;
    speech.rate = 0.95;
    window.speechSynthesis.speak(speech);
});
