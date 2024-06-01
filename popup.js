document.getElementById("enable").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentSite = new URL(tabs[0].url).hostname;
    chrome.storage.local.get(["activatedSites"], (result) => {
      let activatedSites = result.activatedSites || [];
      if (!activatedSites.includes(currentSite)) {
        activatedSites.push(currentSite);
        chrome.storage.local.set({ activatedSites }, () => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["content.js"],
          });
        });
      }
    });
  });
});

document.getElementById("disable").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentSite = new URL(tabs[0].url).hostname;
    chrome.storage.local.get(["activatedSites"], (result) => {
      let activatedSites = result.activatedSites || [];
      activatedSites = activatedSites.filter((site) => site !== currentSite);
      chrome.storage.local.set({ activatedSites }, () => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: disableScript,
        });
      });
    });
  });
});

function disableScript() {
  document
    .querySelectorAll(".record-button")
    .forEach((button) => button.remove());
}
