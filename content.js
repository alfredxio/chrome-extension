var isRecording = false;
var recordIcon = '<i class="fas fa-microphone-alt icon"></i>';
var stopIcon = '<i class="fas fa-stop icon"></i>';
var loadingIcon = '<i class="fas fa-spinner icon"></i>';

(function () {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css";
  document.head.appendChild(link);
})();

async function aiCompletion(content, task = "summarize", strength = 10) {
  let prompt = "";
  switch (task) {
    case "summarize":
      prompt = `You are a AI summarizer. Your task is to summarize the following content as its written, keeping the context exactly same. Also summarize according to the strength score; 10 being the highly summarized and 0 being the least summarized.\n Strength score is ${strength}. Only reply with the summarized content, striclty dont add anything else. Content:\n ${content}`;
      break;
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer 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",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: prompt,
            },
          ],
          model: "llama3-8b-8192",
          temperature: 1,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
          stop: null,
        }),
      }
    );

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function simulateTyping(textArea, transcript, addDelay = false) {
  for (const char of transcript) {
    textArea.dispatchEvent(new KeyboardEvent("keydown", { key: char }));
    textArea.dispatchEvent(new KeyboardEvent("keypress", { key: char }));
    textArea.value += char;
    textArea.dispatchEvent(new Event("input", { bubbles: true }));
    textArea.dispatchEvent(new KeyboardEvent("keyup", { key: char }));
    if (addDelay && char === " " && Math.floor(Math.random() * 2) === 0) {
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
  }
}

async function simulateBackspace(textArea, count, addDelay = false) {
  for (let i = 0; i < count; i++) {
    textArea.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace" }));
    textArea.dispatchEvent(new KeyboardEvent("keypress", { key: "Backspace" }));
    textArea.value = textArea.value.slice(0, -1);
    textArea.dispatchEvent(new Event("input", { bubbles: true }));
    textArea.dispatchEvent(new KeyboardEvent("keyup", { key: "Backspace" }));
    if (addDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(0, 10 - i / 2))
      );
    }
  }
}

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
  wrapper.style.display = "flex";
  wrapper.style.flex = "1";

  textArea.parentNode.insertBefore(wrapper, textArea);
  wrapper.appendChild(textArea);
  wrapper.appendChild(recordButton);
  textArea.style.width = "100%";

  let recognition;
  let autoSummarizeOn = false;
  let summarizeStrength = 5;
  let recognisedText = "";

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

  recognition.onresult = async (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    recognisedText += transcript;
    await simulateTyping(textArea, transcript);
  };

  recognition.onerror = () => {
    recordButton.innerHTML = recordIcon;
    recordButton.classList.remove("recording");
    isRecording = false;
  };

  recordButton.addEventListener("click", async () => {
    if (!isRecording) {
      isRecording = true;
      recordButton.innerHTML = stopIcon;
      recordButton.classList.add("recording");
      chrome.storage.local.get(
        ["language", "autoSummarizeOn", "summarizeStrength"],
        (result) => {
          recognition.lang = result.language || "en-US";
          autoSummarizeOn = result.autoSummarizeOn || false;
          summarizeStrength = result.summarizeStrength || 5;
          recognition.start();
        }
      );
    } else {
      await recognition.stop();
      recordButton.classList.remove("recording");
      if (autoSummarizeOn && recognisedText) {
        let finalTranscript = "";
        try {
          recordButton.innerHTML = loadingIcon;
          recordButton.classList.add("loading");
          finalTranscript = await aiCompletion(
            recognisedText,
            "summarize",
            summarizeStrength
          );
          await simulateBackspace(textArea, recognisedText.length);
          await simulateTyping(textArea, finalTranscript, true);
          recognisedText = "";
        } catch (error) {
          console.error("Error:", error);
        }
      }
      isRecording = false;
      recordButton.innerHTML = recordIcon;
      recordButton.classList.remove("loading");
    }
  });
}

function enableSpeechToText() {
  document.querySelectorAll("textarea").forEach(addRecordButton);
  document.addEventListener("mouseover", (event) => {
    if (event.target.tagName === "TEXTAREA") {
      chrome.storage.local.get(["activatedSites"], function (result) {
        const activatedSites = result.activatedSites || [];
        const currentSite = window.location.hostname;
        if (activatedSites.includes(currentSite)) {
          addRecordButton(event.target);
        }
      });
    }
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
