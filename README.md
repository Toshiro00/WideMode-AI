# WideMode AI Extension

WideMode AI is a lightweight cross-browser extension that widens chat content for popular AI assistants like ChatGPT, Gemini, and Claude. It removes the narrow column layout so you can read long code blocks and articles without horizontal scrolling.

## Features

- Widened chat area for ChatGPT, Gemini, and Claude.
- No permissions required.
- Works on Chromium-based browsers and Firefox (Manifest V3).

## Install (Developer Mode)

### Chromium (Chrome, Edge, Brave)

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `/workspace/WideMode-AI` folder (or the folder where you cloned this repo).

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on**.
3. Select the `manifest.json` file from this folder.

## Customize Width

Edit `content/widemode.js` and adjust the `--widemode-max-width` value to your preference.

## Test the Extension

### Chromium (Chrome, Edge, Brave)

1. Load the unpacked extension as described above.
2. Open `https://chatgpt.com`, `https://gemini.google.com`, or `https://claude.ai`.
3. Start a new chat and confirm the message column is wider.
4. For a quick check, open DevTools and run:

   ```js
   getComputedStyle(document.body).getPropertyValue("--widemode-max-width");
   ```

   The value should match the width set in `content/widemode.js`.

### Firefox

1. Load the temporary add-on as described above.
2. Visit `https://chatgpt.com`, `https://gemini.google.com`, or `https://claude.ai`.
3. Start a new chat and confirm the message column is wider.
4. Open the Web Console and run the same `getComputedStyle` command to verify the CSS variable.
