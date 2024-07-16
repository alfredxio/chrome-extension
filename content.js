var isRecording = false;
var recordIcon = '<i class="fas fa-microphone-alt icon"></i>';
var stopIcon = '<i class="fas fa-stop icon"></i>';

(function () {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css";
  document.head.appendChild(link);
})();

function addRecordButton(textArea) {
  if (
    textArea.nextSibling &&
    textArea.nextSibling.classList &&
    textArea.nextSibling.classList.contains("record-button")
  )
    return;
  const recordButton = document.createElement("button");
  recordButton.innerHTML = recordIcon;
  recordButton.classList.add("record-button");

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.display = "inline-block";
  wrapper.style.width = textArea.offsetWidth + "px";
  wrapper.style.height = textArea.offsetHeight + "px";

  textArea.parentNode.insertBefore(wrapper, textArea);
  wrapper.appendChild(textArea);
  wrapper.appendChild(recordButton);
  textArea.style.width = "100%";

  let recognition;

  if (!("webkitSpeechRecognition" in window)) {
    alert(
      "Your browser does not support speech recognition. Please try a different browser."
    );
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    function simulateTyping(transcript) {
      transcript.split("").forEach((char) => {
        textArea.dispatchEvent(new KeyboardEvent("keydown", { key: char }));
        textArea.dispatchEvent(new KeyboardEvent("keypress", { key: char }));
        textArea.value += char;
        textArea.dispatchEvent(new Event("input", { bubbles: true }));
        textArea.dispatchEvent(new KeyboardEvent("keyup", { key: char }));
      });
    }
    simulateTyping(transcript);
  };

  recognition.onerror = () => {
    recordButton.innerHTML = recordIcon;
    recordButton.classList.remove("recording");
    isRecording = false;
  };

  recordButton.addEventListener("click", () => {
    if (!isRecording) {
      isRecording = true;
      recordButton.innerHTML = stopIcon;
      recordButton.classList.add("recording");
      chrome.storage.local.get(["language"], (result) => {
        recognition.lang = result.language || "en-US";
        recognition.start();
      });
    } else {
      isRecording = false;
      recognition.stop();
      recordButton.innerHTML = recordIcon;
      recordButton.classList.remove("recording");
    }
  });
}

function enableSpeechToText() {
  document.querySelectorAll("textarea").forEach(addRecordButton);
  document.addEventListener("mouseover", (event) => {
    chrome.storage.local.get(["activatedSites"], function (result) {
      const activatedSites = result.activatedSites || [];
      const currentSite = window.location.hostname;
      if (
        event.target.tagName === "TEXTAREA" &&
        activatedSites.includes(currentSite)
      ) {
        addRecordButton(event.target);
      }
    });
  });
}

function disableSpeechToText() {
  document
    .querySelectorAll(".record-button")
    .forEach((button) => button.remove());
}

function handleActivatedSitesChange(activatedSites) {
  const currentSite = window.location.hostname;
  if (activatedSites.includes(currentSite)) {
    enableSpeechToText();
  } else {
    disableSpeechToText();
  }
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace === "local" && changes.hasOwnProperty("activatedSites")) {
    const activatedSites = changes.activatedSites.newValue || [];
    handleActivatedSitesChange(activatedSites);
  }
});

chrome.storage.local.get(["activatedSites"], function (result) {
  const activatedSites = result.activatedSites || [];
  handleActivatedSitesChange(activatedSites);
});
