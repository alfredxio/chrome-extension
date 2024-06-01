document.getElementById("enable").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["content.js"],
    });
  });
});

document.getElementById("disable").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: disableScript,
    });
  });
});

function disableScript() {
  document
    .querySelectorAll(".record-button")
    .forEach((button) => button.remove());
}
