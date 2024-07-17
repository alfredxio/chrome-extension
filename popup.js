document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleButton");
  const languageSelect = document.getElementById("languageSelect");
  const autoSummarizeCheckbox = document.getElementById(
    "autoSummarizeCheckbox"
  );
  const summarizeStrengthInput = document.getElementById(
    "summarizeStrengthInput"
  );

  chrome.storage.local.get(
    ["activatedSites", "language", "autoSummarizeOn", "summarizeStrength"],
    (result) => {
      const activatedSites = result.activatedSites || [];
      const language = result.language || "en-US";
      const autoSummarizeOn = result.autoSummarizeOn || false;
      const summarizeStrength = result.summarizeStrength || "";

      languageSelect.value = language;
      autoSummarizeCheckbox.checked = autoSummarizeOn;
      summarizeStrengthInput.value = summarizeStrength;

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentSite = new URL(tabs[0].url).hostname;
        if (activatedSites.includes(currentSite)) {
          toggleButton.classList.add("enabled");
        }
      });
    }
  );

  toggleButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentSite = new URL(tabs[0].url).hostname;
      chrome.storage.local.get(["activatedSites"], (result) => {
        let activatedSites = result.activatedSites || [];
        if (toggleButton.classList.contains("enabled")) {
          activatedSites = activatedSites.filter(
            (site) => site !== currentSite
          );
          chrome.storage.local.set({ activatedSites }, () => {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              function: disableScript,
            });
            toggleButton.classList.remove("enabled");
          });
          languageSelect.disabled = true;
          autoSummarizeCheckbox.disabled = true;
          summarizeStrengthInput.disabled = true;
        } else {
          activatedSites.push(currentSite);
          chrome.storage.local.set({ activatedSites }, () => {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ["content.js"],
            });
            toggleButton.classList.add("enabled");
          });
          languageSelect.disabled = false;
          autoSummarizeCheckbox.disabled = false;
          if (autoSummarizeCheckbox.checked) {
            summarizeStrengthInput.disabled = false;
          }
        }
      });
    });
  });

  languageSelect.addEventListener("change", () => {
    const selectedLanguage = languageSelect.value;
    chrome.storage.local.set({ language: selectedLanguage });
  });

  autoSummarizeCheckbox.addEventListener("change", () => {
    const autoSummarizeOn = autoSummarizeCheckbox.checked;
    summarizeStrengthInput.disabled = !autoSummarizeOn;
    chrome.storage.local.set({ autoSummarizeOn });
  });

  summarizeStrengthInput.addEventListener("change", () => {
    let summarizeStrength = Math.min(
      10,
      Math.max(0, summarizeStrengthInput?.value || 0)
    );
    summarizeStrengthInput.value = summarizeStrength;
    chrome.storage.local.set({ summarizeStrength });
  });
});

function disableScript() {
  document
    .querySelectorAll(".record-button")
    .forEach((button) => button.remove());
}
