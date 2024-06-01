# Speech to Text Chrome Extension

This Chrome extension adds Speech to Text functionality to all text areas on a webpage.

## How to Use

1. **Enable the Extension**:
    - Click on the extension icon in the Chrome toolbar to open the popup.
    - Toggle the extension on by clicking the "Enable" button. The button will switch to "Disable" once enabled.
    - Extension remains enabled for that particular URL throughout all over browser until disabled.

2. **Select Language**:
    - In the popup, choose your preferred language from the dropdown menu.
    - The selected language is saved in local storage and will be used for speech recognition on all sites where the extension is enabled.

3. **Using Speech to Text**:
    - Go to any webpage with text areas.
    - Click on the microphone icon that appears in a text area to start recording your speech.
    - Click the stop icon to stop recording. The spoken text will be transcribed and added to the text area.

## Installation

1. Download the extension files.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" by clicking the toggle switch in the top right corner.
4. Click the "Load unpacked" button and select the directory where you downloaded the extension files.


## Speech Recognition API
This extension uses the `webkitSpeechRecognition` API for speech recognition and transcription. This API is built into the Chrome browser and supports multiple languages.

## Screenshots

![image](https://github.com/alfredxio/chrome-extension/assets/87885945/027b57ac-3cfb-429f-929d-3452f0648a4d)

*The extension popup with the enable/disable toggle and language selection.*
