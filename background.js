chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const currentSite = new URL(tab.url).hostname;
    chrome.storage.local.get(["activatedSites"], (result) => {
      const activatedSites = result.activatedSites || [];
      if (activatedSites.includes(currentSite)) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"],
        });
      }
    });
  }
});
