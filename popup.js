document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleButton");
  const languageSelect = document.getElementById("languageSelect");
  const autoSummarizeCheckbox = document.getElementById(
    "autoSummarizeCheckbox"
  );

  chrome.storage.local.get(
    ["activatedSites", "language", "autoSummarizeOn"],
    (result) => {
      const activatedSites = result.activatedSites || [];
      const language = result.language || "en-US";
      const autoSummarizeOn = result.autoSummarizeOn || false;

      languageSelect.value = language;
      autoSummarizeCheckbox.checked = autoSummarizeOn;

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
        } else {
          activatedSites.push(currentSite);
          chrome.storage.local.set({ activatedSites }, () => {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ["content.js"],
            });
            toggleButton.classList.add("enabled");
          });
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
    chrome.storage.local.set({ autoSummarizeOn });
  });
});

function disableScript() {
  document
    .querySelectorAll(".record-button")
    .forEach((button) => button.remove());
}
