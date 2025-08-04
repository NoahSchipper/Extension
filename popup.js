



document.addEventListener("DOMContentLoaded", () => {
  const tooltipCheckbox = document.querySelector('.boxOption .bcb input[type="checkbox"]');
  const inTextCheckbox = document.querySelector('.inTextOption .itcb input[type="checkbox"]');

  // Load stored values
  chrome.storage.local.get(["tooltipEnabled", "inTextEnabled"], (data) => {
    tooltipCheckbox.checked = data.tooltipEnabled || false;
    inTextCheckbox.checked = data.inTextEnabled || false;
  });

  // Handle tooltip checkbox toggle
  tooltipCheckbox.addEventListener("change", () => {
    const enabled = tooltipCheckbox.checked;
    chrome.storage.local.set({ tooltipEnabled: enabled });

    if (enabled) {
      inTextCheckbox.checked = false;
      chrome.storage.local.set({ inTextEnabled: false });
    }
  });

  // Handle in-text checkbox toggle
  inTextCheckbox.addEventListener("change", () => {
    const enabled = inTextCheckbox.checked;
    chrome.storage.local.set({ inTextEnabled: enabled });

    if (enabled) {
      tooltipCheckbox.checked = false;
      chrome.storage.local.set({ tooltipEnabled: false });
    }
  });
});

// Language selection and storage

document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("targetLangSelect");

    chrome.storage.local.get("targetLang", (data) => {
        if (data.targetLang) {
            select.value = data.targetLang;
        }
    });

    select.addEventListener("change", () => {
        const selectedLang = select.value;
        chrome.storage.local.set({ targetLang: selectedLang });
    });
});