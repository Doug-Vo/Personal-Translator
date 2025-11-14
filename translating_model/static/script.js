

// Listen for the form's 'submit' event
document.addEventListener( 'DOMContentLoaded', () => {

    const themeToggleBtn = document.getElementById("theme-toggle");
    const darkIcon = document.getElementById("theme-toggle-dark-icon");
    const lightIcon = document.getElementById("theme-toggle-light-icon");

    // Function to apply the saved or preferred theme
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

    // Add click listener for the toggle button
    themeToggleBtn.addEventListener("click", () => {
        const isDark = document.documentElement.classList.toggle("dark");
        // Save the user's preference in localStorage
        localStorage.setItem("theme", isDark ? "dark" : "light");
        // Toggle the icons
        lightIcon.classList.toggle("hidden", isDark);
        darkIcon.classList.toggle("hidden", !isDark);
    });

    // Apply the theme as soon as the page loads
    applyTheme();


    
    // Get all the elements we need from the HTML
    const textEn = document.getElementById("text-en");
    const textFi = document.getElementById("text-fi");

    const btnTranslate = document.getElementById("btn-translate");
    const spinner = document.getElementById("spinner");

    const copyEn = document.getElementById("copy-en");
    const copyFi = document.getElementById("copy-fi");

    const clearEn = document.getElementById("clear-en");
    const clearFi = document.getElementById("clear-fi");

    let lastActiveBox = "en"; // keep track of last active box

    function showSpinner(show)
    {
        if (show)
        {
            spinner.classList.remove("hidden");
            btnTranslate.classList.add("btn-disabled");
            btnTranslate.disabled = true;
        }
        else
        {
            spinner.classList.add("hidden");
            btnTranslate.classList.remove("btn-disabled");
            btnTranslate.disabled = false;          
        }
    }

    function setClearButton() 
    {
        textEn.addEventListener("input", () =>
        {
            clearEn.classList.toggle("hidden", textEn.value == "");
            lastActiveBox = "en";
        })

        textFi.addEventListener("input", () =>
        {
            clearFi.classList.toggle("hidden", textFi.value == "");
            lastActiveBox = "fi";
        })

        clearEn.addEventListener("click", () =>
        {
            textEn.value = "";
            clearEn.classList.add("hidden");
        })

        
        clearFi.addEventListener("click", () =>
        {
            textFi.value = "";
            clearFi.classList.add("hidden");
        })
    }

    // HELPER FUNCTION FOR COPY FEEDBACK 
    function showCopiedFeedback(buttonElement) {
        // Store the original clipboard icon
        const originalIcon = buttonElement.innerHTML;
        
        // Create a green "check" icon SVG
        const checkIcon = `
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
        `;
        
        // Replace the icon and make it green
        buttonElement.innerHTML = checkIcon;
        
        // Set a timer to revert the icon back to the original
        setTimeout(() => {
            buttonElement.innerHTML = originalIcon;
        }, 2000); // 1.5 seconds
    }

    function setCopyButton() 
    {
        copyEn.addEventListener("click", () => {
            navigator.clipboard.writeText(textEn.value);
            showCopiedFeedback(copyEn);

        })
        copyFi.addEventListener("click", () => {
            navigator.clipboard.writeText(textFi.value);
            showCopiedFeedback(copyFi);
            
        })
    }

    async function handleTranslation() {
        let originText, destLang, srcLang;

        if (lastActiveBox == 'en' && textEn.value.trim())
        {
            originText = textEn.value;
            srcLang = 'en';
            destLang = 'fi';
        }
        else if (lastActiveBox == 'fi' && textFi.value.trim())
        {
            originText = textFi.value;
            srcLang = 'fi';
            destLang = 'en';
        }

        // if unsure
        else{
            originText = textEn.value;
            srcLang = 'en';
            destLang = 'fi';
        }

        if (!originText)
        {
            return;
        }

        showSpinner(true);

        try{
            // Send the data to the Flask API
            const response = await fetch("/api/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    origin_text: originText,
                    dest_lan: destLang,
                }),
            });

            if (!response.ok) {
                throw new Error("Translation API failed");
            }

            const data = await response.json();

            // Put the translation in the *other* box
            if (destLang === "fi") {
                textFi.value = data.translation;
                clearFi.classList.toggle("hidden", textFi.value === ""); // Show clear btn
            } else {
                textEn.value = data.translation;
                clearEn.classList.toggle("hidden", textEn.value === ""); // Show clear btn
            }

        } catch (error) {
            console.error("Translation error:", error);
            // You could show this error in the UI
            if (destLang === "fi") {
                textFi.value = "Error: Could not translate.";
            } else {
                textEn.value = "Error: Could not translate.";
            }
        } finally {
            // Hide spinner and re-enable button
            showSpinner(false);
        }
    }

        // --- Main Setup ---
    // Add the main translate button listener
    btnTranslate.addEventListener("click", handleTranslation);
    
    // Set up the helper button listeners
    setClearButton();
    setCopyButton();

});