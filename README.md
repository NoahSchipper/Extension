# Schipper Translate – Chrome Extension
This is a Chrome extension I built to provide quick, on-page translation for any website. It’s lightweight, easy to use, and designed to stay out of the way while giving you fast access to language translation.

## Features
- Translate selected text instantly with one click.

- Choose how translations appear — either as a tooltip, in-extension, or inserted inline.

- Custom popup interface to toggle settings.

- Simple, responsive design with minimal footprint.

## Pages & Scripts
This extension includes a popup UI, background logic, and content script injection:

- popup.html – The UI for configuring translation behavior.

- popup.js – Handles checkbox toggles and stores user preferences.

- content.js – Grabs selected text, sends it for translation, and displays the result.

- background.js – (Optional) Background logic placeholder.

- countries.js – Language codes and names for dropdowns.

- styles.css – Shared styling for the popup.

- manifest.json – Chrome extension setup.

- .env – (Optional) For storing API keys securely.

## Notes

Credit to Joshua Alana on Youtube for the in-extension translator format and some code
© Noah Schipper. All rights reserved.


