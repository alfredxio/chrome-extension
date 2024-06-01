document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleButton");
  const languageSelect = document.getElementById("languageSelect");

  chrome.storage.local.get(["activatedSites", "language"], (result) => {
    const activatedSites = result.activatedSites || [];
    const language = result.language || "en-US";
    languageSelect.value = language;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentSite = new URL(tabs[0].url).hostname;
      if (activatedSites.includes(currentSite)) {
        toggleButton.classList.add("enabled");
      }
    });
  });

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
});

function disableScript() {
  document
    .querySelectorAll(".record-button")
    .forEach((button) => button.remove());
}
