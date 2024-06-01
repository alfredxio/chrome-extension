document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleButton");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentSite = new URL(tabs[0].url).hostname;

    chrome.storage.local.get(["activatedSites"], (result) => {
      const activatedSites = result.activatedSites || [];
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
});

function disableScript() {
  document
    .querySelectorAll(".record-button")
    .forEach((button) => button.remove());
}
