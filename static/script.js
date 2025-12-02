document.addEventListener("DOMContentLoaded", () => {
    
    // Utilities
    // Prevents API spam by waiting until user stops typing
    function debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => { func.apply(this, args); }, delay);
        };
    }

    // Elements Configuration
    // This object maps language codes to their corresponding DOM elements
    const boxes = {
        en: { 
            text: document.getElementById("text-en"), 
            clear: document.getElementById("clear-en"), 
            copy: document.getElementById("copy-en") 
        },
        fi: { 
            text: document.getElementById("text-fi"), 
            clear: document.getElementById("clear-fi"), 
            copy: document.getElementById("copy-fi") 
        },
        vi: { 
            text: document.getElementById("text-vi"), 
            clear: document.getElementById("clear-vi"), 
            copy: document.getElementById("copy-vi") 
        }
    };
    const spinner = document.getElementById("spinner");

    // Theme Logic
    const themeToggleBtn = document.getElementById("theme-toggle");
    const darkIcon = document.getElementById("theme-toggle-dark-icon");
    const lightIcon = document.getElementById("theme-toggle-light-icon");

    function applyTheme() {
        const userTheme = localStorage.getItem("theme");
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        
        if (userTheme === "dark" || (!userTheme && systemPrefersDark)) {
            document.documentElement.classList.add("dark");
            lightIcon.classList.add("hidden"); 
            darkIcon.classList.remove("hidden");
        } else {
            document.documentElement.classList.remove("dark");
            lightIcon.classList.remove("hidden"); 
            darkIcon.classList.add("hidden");
        }
    }

    themeToggleBtn.addEventListener("click", () => {
        const isDark = document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        lightIcon.classList.toggle("hidden", isDark); 
        darkIcon.classList.toggle("hidden", !isDark);
    });
    applyTheme();

    // UI Helpers
    function showSpinner(show) {
        spinner.classList.toggle("hidden", !show);
    }

    function showCopiedFeedback(btn) {
        const original = btn.innerHTML;
        // Green checkmark icon
        btn.innerHTML = `<svg class="icon" style="color: #22c55e;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
        setTimeout(() => { btn.innerHTML = original; }, 1500);
    }

    // Core Logic
    
    // Setup Listeners for Clear & Copy Buttons (Generic for all languages)
    Object.keys(boxes).forEach(lang => {
        const el = boxes[lang];
        
        // Copy Button Logic
        if(el.copy) {
            el.copy.addEventListener("click", () => {
                if (el.text.value.trim() === "") return;
                navigator.clipboard.writeText(el.text.value);
                showCopiedFeedback(el.copy);
            });
        }

        // Clear Button Logic (Clears everything)
        if(el.clear) {
            el.clear.addEventListener("click", () => {
                // Clear all boxes to keep them in sync
                Object.values(boxes).forEach(b => {
                    b.text.value = "";
                    b.clear.classList.add("hidden");
                });
            });
        }

        // Toggle clear button visibility on input
        if(el.text) {
            el.text.addEventListener("input", () => {
                el.clear.classList.toggle("hidden", el.text.value === "");
            });
        }
    });

    // Translation API Call
    async function performTranslation(sourceText, sourceLang) {
        // If input is cleared, clear all other boxes too
        if (!sourceText.trim()) {
            Object.keys(boxes).forEach(key => {
                if (key !== sourceLang) {
                    boxes[key].text.value = "";
                    boxes[key].clear.classList.add("hidden");
                }
            });
            return;
        }

        showSpinner(true);
        try {
            const response = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: sourceText, source_lang: sourceLang }),
            });
            
            if (!response.ok) throw new Error("API Failed");
            
            const results = await response.json();
            
            // The API returns a dictionary like { "fi": "...", "vi": "..." }
            // We iterate through the results and update the corresponding boxes
            Object.keys(results).forEach(langKey => {
                if (boxes[langKey]) {
                    boxes[langKey].text.value = results[langKey];
                    // Show the clear button since we added text
                    boxes[langKey].clear.classList.remove("hidden");
                }
            });

        } catch (e) {
            console.error("Translation failed", e);
        } finally {
            showSpinner(false);
        }
    }

    // Attach Debounced Translation to Inputs
    const debouncedTranslate = debounce(performTranslation, 600);

    Object.keys(boxes).forEach(lang => {
        boxes[lang].text.addEventListener("input", () => {
            debouncedTranslate(boxes[lang].text.value, lang);
        });
    });

});