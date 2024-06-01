let isRecording = false;
function addRecordButton(textArea) {
  if (
    textArea.nextSibling &&
    textArea.nextSibling.classList &&
    textArea.nextSibling.classList.contains("record-button")
  )
    return;

  const recordButton = document.createElement("button");
  recordButton.innerText = "Record";
  recordButton.classList.add("record-button");

  recordButton.style.position = "absolute";
  recordButton.style.bottom = "10px";
  recordButton.style.right = "10px";
  recordButton.style.zIndex = "10";

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
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    textArea.value += transcript;
    recordButton.innerText = "Record";
    recordButton.classList.remove("recording");
    isRecording = false;
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event);
    recordButton.innerText = "Record";
    recordButton.classList.remove("recording");
    isRecording = false;
  };

  recordButton.addEventListener("click", () => {
    if (recordButton.innerText === "Record" && !isRecording) {
      isRecording = true;
      recordButton.innerText = "Stop";
      recordButton.classList.add("recording");
      recognition.start();
    } else if (recordButton.innerText === "Stop") {
      recognition.stop();
      recordButton.innerText = "Record";
      recordButton.classList.remove("recording");
      isRecording = false;
    }
  });
}

document.querySelectorAll("textarea").forEach(addRecordButton);

document.addEventListener("focusin", (event) => {
  if (event.target.tagName === "TEXTAREA") {
    addRecordButton(event.target);
  }
});
