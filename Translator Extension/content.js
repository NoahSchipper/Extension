window.schipperTranslateInjected = true; // Flag to check if script is already injected

// built-in translator
const fromText = document.querySelector('.from-text');
const toText = document.querySelector('.to-text');
selectTag = document.querySelectorAll('select');
exchangeIcon = document.querySelector('.exchange');
translateBtn = document.querySelector("button");
icons = document.querySelectorAll(".row i");

const blockedWords = [
  "<script", "javascript:", "onerror=", "onload=", "onmouseover=", "onfocus=", "onmouseenter=",
  "onclick=", "onblur=", "onchange=", "onsubmit=", "onreset=", "onkeydown=", "onkeyup=",
  "onkeypress=", "oncontextmenu=", "onmouseout=", "onmouseleave=", "iframe", "img", "<object",
  "<embed", "srcdoc=", "data:text/html", "src=", "<svg", "<math", "<link", "<style",
  "base64,", "<body", "<meta", "expression(", "document.cookie", "window.location", "eval(",
  "setTimeout(", "setInterval(", "Function(", "alert(", "prompt(", "confirm(", "<", ">", "$", "{","}"
];

function isSafe(input) {
    const lowerInput = input.toLowerCase();
    return !blockedWords.some(word => lowerInput.includes(word));
}

selectTag.forEach((tag, id) => {
    for (const country_code in countries) {
        let selected = "";
        if(id == 0  && country_code == "en") {
            selected = "selected"; // default selected language
        }
        else if ((id == 1 || id == 2) && (country_code == "es")) {
            selected = "selected"; // default selected language
        }
        let option = `<option value="${country_code}" ${selected}>${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option); // adding options tag inside select tag
    }
});

if (exchangeIcon) {
exchangeIcon.addEventListener("click", () => {
    let tempText = fromText.value; // storing fromText value in tempText variable
    tempLang = selectTag[0].value; // storing fromSelect tag value in tempLang variable
    fromText.value = toText.value; // assigning toText value to fromText
    selectTag[0].value = selectTag[1].value; // assigning toSelect tag value to fromSelect
    toText.value = tempText; // assigning tempText value to toText
    selectTag[1].value = tempLang; // assigning tempText value to toText
    });
}

if (translateBtn) {
translateBtn.addEventListener("click", () => {
    const text = fromText.value.trim();

    if (!text) return;

    if (!isSafe(text)) {
        alert("Input contains potentially unsafe content and will not be translated.");
        return;
    }

    toText.setAttribute("placeholder", "Translating...");
    toText.value = ""
    let translateFrom = selectTag[0].value.split("-")[0].toLowerCase();
    let translateTo = selectTag[1].value.split("-")[0].toLowerCase();

    fetch("https://broken-salad-1a39.noahschipper78.workers.dev/", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            q: text,
            source: translateFrom,
            target: translateTo
        })
    })
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    })
    .then(data => {
        const translatedText = data?.data?.translations?.translatedText;
        if (translatedText) {
            toText.value = translatedText;
        } else {
            toText.value = "Translation failed.";
        }
    })
    .catch(err => {
        console.error("Error during translation:", err);
        toText.value = "Translating...";
    });
});
}

icons.forEach(icon => {
    icon.addEventListener("click", ({target}) => {
        if(target.classList.contains("fa-copy")) {
            if(target.id === "copy-from") {
                navigator.clipboard.writeText(fromText.value); // copying fromText value
            }
            else {
                navigator.clipboard.writeText(toText.value); // copying toText value
            }
            
        } else {
            let utterance;
            if(target.id === "from") {
                utterance = new SpeechSynthesisUtterance(fromText.value); // creating a new speech synthesis utterance for fromText
                utterance.lang = selectTag[0].value; // setting language for fromText
            } else {
                utterance = new SpeechSynthesisUtterance(toText.value); // creating a new speech synthesis utterance for toText
                utterance.lang = selectTag[1].value; // setting language for toText
            }
            speechSynthesis.speak(utterance);
        };
    });
});


// in-text translation
let prevRange = null;

// Get the checkbox once at the start (after it's available)
let inTextCheckbox = null;
function waitForCheckbox() {
  inTextCheckbox = document.querySelector('.inTextOption .itcb input[type="checkbox"]');
  if (!inTextCheckbox) {
    setTimeout(waitForCheckbox, 100);
  }
}
waitForCheckbox();

// Handle user text selection
window.addEventListener("mouseup", () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (!selectedText) return;

  chrome.storage.local.get(["tooltipEnabled", "inTextEnabled", "targetLang"], (data) => {
    const { tooltipEnabled, inTextEnabled, targetLang = "es" } = data;

    // Save range
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0).cloneRange();

      if (tooltipEnabled) {
        prevRange2 = range;
        translateSelectedTextTooltip(selectedText, targetLang);
      } else if (inTextEnabled) {
        prevRange = range;
        translateSelectedTextInText(selectedText, targetLang);
      }
    }
  });
});


function translateSelectedTextInText(text, targetLang) {
  fetch("https://broken-salad-1a39.noahschipper78.workers.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: "auto",
      target: targetLang
    })
  })
    .then(res => res.json())
    .then(data => {
      const translated = data.data?.translations?.translatedText;
      if (translated && prevRange) {
        replaceSelectedText(translated, prevRange);
      } else {
        console.error("No in-text translation returned:", data);
      }
    })
    .catch(err => console.error("Translation error:", err));
}

function replaceSelectedText(replacementText, range) {
  const originalText = range.toString();

  // Delete selected content
  range.deleteContents();

  const span = document.createElement("span");
  span.className = "translated-text";
  span.textContent = replacementText;
  span.dataset.originalText = originalText;
  span.title = "Click to revert";

  // Allow user to revert by clicking
  span.addEventListener("click", () => {
    const textNode = document.createTextNode(span.dataset.originalText);
    span.replaceWith(textNode);
  });

  // Insert translated text
  range.insertNode(span);

  // Move caret after inserted node
  const sel = window.getSelection();
  range.setStartAfter(span);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);

  // Clean up DOM
  if (span.parentNode) {
    span.parentNode.normalize();
  }
}

// Tooltip for translated text on highlight
const faLink = document.createElement("link");
faLink.rel = "stylesheet";
faLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
faLink.crossOrigin = "anonymous";
faLink.referrerPolicy = "no-referrer";
document.head.appendChild(faLink);


let prevRange2 = null
// Get the checkbox once at the start (after it's available)
let tooltipBox = null;
function waitForTooltipCheckbox() {
  tooltipBox = document.querySelector('.boxOption .bcb input[type="checkbox"]');
  if (!tooltipBox) {
    setTimeout(waitForTooltipCheckbox, 100);
  }
}
waitForTooltipCheckbox();

// Handle user text selection


function translateSelectedTextTooltip(text, targetLang) {
  fetch("https://broken-salad-1a39.noahschipper78.workers.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: "auto",
      target: targetLang
    })
  })
    .then(res => res.json())
    .then(data => {
      const translated = data.data?.translations?.translatedText;
      if (translated && prevRange2) {
        showTooltip(translated, prevRange2);
      } else {
        console.error("No translation returned:", data);
      }
    })
    .catch(err => console.error("Translation error:", err));
}

function showTooltip(translatedText, range) {
  const rect = range.getBoundingClientRect();

  // Remove any existing tooltip
  const existing = document.getElementById("translation-tooltip");
  if (existing) existing.remove();

  const tooltip = document.createElement("div");
  tooltip.id = "translation-tooltip";
  tooltip.style.position = "absolute";
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  tooltip.style.top = `${rect.top + window.scrollY - 35}px`;
  tooltip.style.padding = "6px 10px";
  tooltip.style.background = "#222";
  tooltip.style.color = "#fff";
  tooltip.style.borderRadius = "6px";
  tooltip.style.fontSize = "14px";
  tooltip.style.zIndex = "9999";
  tooltip.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";
  tooltip.style.pointerEvents = "auto";
  tooltip.style.maxWidth = "300px";

  // Text container
  const text = document.createElement("div");
  text.textContent = translatedText;
  text.style.marginBottom = "4px";

  //Button container
  const buttons = document.createElement("div");
  buttons.style.display = "flex";
  buttons.style.justifyContent = "flex-end";
  buttons.style.gap = "10px";

  // Copy button
  const copyButton = document.createElement("button");
  copyButton.innerHTML = `<i class="fas fa-copy"></i>`;
  copyButton.className = "tooltip-button copy";
  copyButton.title = "Copy translation";
  copyButton.style.cursor = "pointer";
  copyButton.style.color = "#ccc";

  copyButton.addEventListener("click", (event) => {
	event.preventDefault(); // Prevent default button behavior
	event.stopPropagation(); // Prevent tooltip from closing
	navigator.clipboard.writeText(translatedText) 
  });

  // TTS button
  const ttsButton = document.createElement("button");
  ttsButton.innerHTML = `<i class="fas fa-volume-up"></i>`;
  ttsButton.className = "tooltip-button tts";
  ttsButton.title = "Read aloud";
  ttsButton.style.cursor = "pointer";
  ttsButton.style.color = "#ccc";

  ttsButton.addEventListener("click", (event) => {
	event.preventDefault(); // Prevent default button behavior
	event.stopPropagation(); // Prevent tooltip from closing
	const utterance = new SpeechSynthesisUtterance(translatedText);
	chrome.storage.local.get("targetLang", (data) => {
		utterance.lang = data.targetLang || "es"; // Use the stored target language or default to Spanish
		speechSynthesis.speak(utterance);
		});
	});

  buttons.appendChild(copyButton);
  buttons.appendChild(ttsButton);
  tooltip.appendChild(text);
  tooltip.appendChild(buttons);

  document.body.appendChild(tooltip);

  
  function onClickOutside(event) {
	if (!tooltip.contains(event.target)) {
	  speechSynthesis.cancel(); // Stop any ongoing speech synthesis
	  tooltip.remove();
	  document.removeEventListener("click", onClickOutside);
	}
  }

  document.addEventListener("mousedown", onClickOutside);
}
