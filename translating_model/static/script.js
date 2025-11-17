document.addEventListener("DOMContentLoaded", () => {
    
    // This prevents the API from being called on every keystroke
    function debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // Get Elements
    const textEn = document.getElementById("text-en");
    const textFi = document.getElementById("text-fi");
    const copyEn = document.getElementById("copy-en");
    const copyFi = document.getElementById("copy-fi");
    const clearEn = document.getElementById("clear-en");
    const clearFi = document.getElementById("clear-fi");
    
    // Theme Toggle Logic
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


    // Copy Button Logic 
    function showCopiedFeedback(buttonElement) {
        const originalIcon = buttonElement.innerHTML;
        const checkIcon = `
            <svg class="icon" style="color: #22c55e;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
        `;
        buttonElement.innerHTML = checkIcon;
        setTimeout(() => { buttonElement.innerHTML = originalIcon; }, 1500);
    }
    copyEn.addEventListener("click", () => {
        if (textEn.value.trim() === "") return;
        navigator.clipboard.writeText(textEn.value);
        showCopiedFeedback(copyEn);
    });
    copyFi.addEventListener("click", () => {
        if (textFi.value.trim() === "") return;
        navigator.clipboard.writeText(textFi.value);
        showCopiedFeedback(copyFi);
    });

    // Clear Button Logic
    clearEn.addEventListener("click", () => {
        textEn.value = "";
        textFi.value = ""; // Also clear the other box
        clearEn.classList.add("hidden");
        clearFi.classList.add("hidden");
    });
    clearFi.addEventListener("click", () => {
        textEn.value = "";
        textFi.value = ""; // Also clear the other box
        clearEn.classList.add("hidden");
        clearFi.classList.add("hidden");
    });

    
    async function translate(originText, destLang) {
        if (!originText) {
            return { translation: "" }; // Return empty if no text
        }
        
        
        try {
            const response = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    origin_text: originText,
                    dest_lan: destLang,
                }),
            });
            if (!response.ok) throw new Error("API failed");
            return await response.json(); 
        } catch (error) {
            console.error("Translation error:", error);
            return { translation: "Error: Could not translate." };
        } finally {
        }
    }

    // Event Listeners with Debounce
    const debouncedTranslate = debounce(async (sourceElement, targetElement, destLang) => {
        const data = await translate(sourceElement.value, destLang);
        targetElement.value = data.translation;
        clearEn.classList.toggle("hidden", textEn.value === "");
        clearFi.classList.toggle("hidden", textFi.value === "");
    }, 500); // 500ms delay

    // Listen for input on the English box
    textEn.addEventListener("input", () => {
        clearEn.classList.toggle("hidden", textEn.value === "");
        debouncedTranslate(textEn, textFi, "fi");
    });

    // Listen for input on the Finnish box
    textFi.addEventListener("input", () => {
        clearFi.classList.toggle("hidden", textFi.value === "");
        debouncedTranslate(textFi, textEn, "en");
    });
});