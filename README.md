<p align="center">
<!-- Replace with your actual logo.png -->
<img src="https://raw.githubusercontent.com/evinjohnn/Threadly/main/chrome-extension/favicon-512x512.png" align="center" width="45%">
</p>
<p align="center"><h1 align="center">THREADLY - MULTI-PLATFORM AI EXTENSION</h1></p>
<p align="center">
<em><code>❯ A universal browser extension that enhances major AI chat platforms with a sleek, powerful sidebar for managing, searching, and refining your conversations.</code></em>
</p>
<p align="center">
<img src="https://img.shields.io/github/license/evinjohnn/Threadly?style=default&logo=opensourceinitiative&logoColor=white&color=00bfae" alt="license">
<img src="https://img.shields.io/github/last-commit/evinjohnn/Threadly?style=default&logo=git&logoColor=white&color=00bfae" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/evinjohnn/Threadly?style=default&color=00bfae" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/evinjohnn/Threadly?style=default&color=00bfae" alt="repo-language-count">
</p>
<br>
<details><summary>Table of Contents</summary>
Overview
Features
Available On
Tech Stack
Project Structure
Project Index
Getting Started
Prerequisites
Installation
Usage
Technical Details
Contributing
License
Acknowledgments
</details>
<hr>
Overview
Threadly is a universal browser extension that enhances your experience on major AI chat platforms like ChatGPT, Claude, and Gemini. It automatically injects a sleek, powerful sidebar to help you manage, search, and navigate your conversations with ease. Now featuring AI Prompt Refinement and Advanced Collection Management, Threadly helps you write better prompts and organize your conversations effortlessly, all powered by a modern, glassmorphic UI and local storage for complete privacy.
🎥 Demo Video
Watch the extension in action:
<!-- Replace with your actual demo.gif -->
![alt text](demo.gif)
Demo showcasing Threadly's auto-loading sidebar, instant search, and AI prompt refinement features.
Features
✨ Universal Compatibility: Works seamlessly with ChatGPT, Claude, Gemini, Grok, Perplexity, and more.
✨ AI-Powered Prompt Refiner: Automatically enhances your prompts for better AI responses using the Gemini API.
✨ Advanced Collection Management: Organize your saved messages into color-coded, searchable collections.
✨ Beautiful Glassmorphism UI: A modern, sleek interface with smooth, physics-based "metaball" animations.
✨ Instant Search & Filtering: Quickly find any message and filter by user, AI, or favorites.
✨ Real-time Message Extraction: Automatically captures and indexes conversations as you chat.
✨ Privacy-Focused: All your data, collections, and API keys are stored securely on your local device.
✨ Fully Manifest V3 Compliant: Built with the latest Chrome Extension standards for security and performance.
Available On
The extension is available for all major Chromium-based browsers.
Browser	Link	Status
Google Chrome	Chrome Web Store	Available
Microsoft Edge	Edge Add-ons	Coming Soon
Opera	Opera Addons	Coming Soon
Tech Stack
Technology	Description
JavaScript (ES6+)	Core logic for the sidebar, UI interactions, data extraction, and API handling.
HTML5 / CSS3	Structure and advanced styling for the glassmorphism UI, animations, and responsive layout.
Manifest V3	Utilizes the latest Chrome Extension APIs for a secure and performant service worker-based architecture.
Chrome Extension APIs	Uses storage, tabs, and alarms for data persistence, tab interaction, and background tasks.
Google Gemini API	Powers the intelligent AI Prompt Refinement feature.
Project Structure
code
Sh
└── threadly/
    ├── chrome-extension/
    │   ├── Borel/                          # Custom font files
    │   ├── ai-studio-sparkle.js            # Injects 'Refine' button on AI Studio
    │   ├── api-handler.js                  # Handles Gemini API calls for prompt refinement
    │   ├── background.js                   # Service worker for background tasks & learning
    │   ├── chatgpt-sparkle.js              # Injects 'Refine' button on ChatGPT
    │   ├── claude-icon.js                  # Injects 'Refine' button on Claude
    │   ├── content.js                      # Main script to inject and manage the sidebar UI
    │   ├── gemini-sparkle.js               # Injects 'Refine' button on Gemini
    │   ├── perplexity-sparkle.js           # Injects 'Refine' button on Perplexity
    │   ├── popup.html                      # UI for the browser action popup (API key)
    │   ├── popup.js                        # Logic for the API key management popup
    │   ├── prompts.json                    # Database of prompts for the Triage AI
    │   ├── sidebar.css                     # All styling for the extension's UI
    │   └── manifest.json                   # Extension configuration and permissions
    └── README.md
Project Index
<details open>
<summary><b><code>THREADLY/CHROME-EXTENSION/</code></b></summary>
<blockquote>
<table>
<tr>
<td><b><a href='chrome-extension/manifest.json'>manifest.json</a></b></td>
<td><code>❯ Defines the extension's permissions (storage, tabs), content scripts, and service worker configuration.</code></td>
</tr>
<tr>
<td><b><a href='chrome-extension/background.js'>background.js</a></b></td>
<td><code>❯ The Manifest V3 service worker that handles background tasks, such as autonomous learning from user feedback.</code></td>
</tr>
<tr>
<td><b><a href='chrome-extension/content.js'>content.js</a></b></td>
<td><code>❯ The main content script injected into all supported platforms to render the sidebar, extract conversations, and manage UI state.</code></td>
</tr>
<tr>
<td><b><a href='chrome-extension/api-handler.js'>api-handler.js</a></b></td>
<td><code>❯ Contains the powerful `PromptRefiner` class and Triage AI, which handles all logic for Gemini API calls to enhance user prompts.</code></td>
</tr>
<tr>
<td><b><a href='chrome-extension/popup.html'>popup.html</a></b></td>
<td><code>❯ Provides the HTML structure for the browser action popup window, used for managing the Gemini API key.</code></td>
</tr>
<tr>
<td><b><a href='chrome-extension/popup.js'>popup.js</a></b></td>
<td><code>❯ Contains the logic for the popup, allowing users to save, remove, and validate their Gemini API key.</code></td>
</tr>
<tr>
<td><b><a href='chrome-extension/sidebar.css'>sidebar.css</a></b></td>
<td><code>❯ The complete stylesheet for the Threadly sidebar, including the glassmorphism design, metaball animations, and responsive layout.</code></td>
</tr>
<tr>
<td><b><a href='chrome-extension/claude-icon.js'>claude-icon.js</a></b></td>
<td><code>❯ A platform-specific content script that injects the ✨ Refine button and its associated logic into the Claude UI.</code></td>
</tr>
<tr>
<td><b><a href='chrome-extension/chatgpt-sparkle.js'>chatgpt-sparkle.js</a></b></td>
<td><code>❯ A platform-specific content script that injects the ✨ Refine button into the ChatGPT UI.</code></td>
</tr>
<tr>
<td><b><a href='chrome-extension/gemini-sparkle.js'>gemini-sparkle.js</a></b></td>
<td><code>❯ A platform-specific content script that injects the ✨ Refine button into the Gemini UI.</code></td>
</tr>
</table>
</blockquote>
</details>
Getting Started
Prerequisites
A modern Chromium-based browser (e.g., Google Chrome, Microsoft Edge, Opera).
git (for cloning the repository).
A free Google Gemini API Key for the Prompt Refiner feature.
Installation
Clone the repository:
code
Sh
git clone https://github.com/evinjohnn/Threadly
Navigate to your browser's extension page:
Chrome: chrome://extensions
Edge: edge://extensions
Opera: opera://extensions
Enable Developer Mode: Find and activate the "Developer mode" toggle, usually located in the top-right corner.
Load the Extension:
Click the "Load unpacked" button.
Select the chrome-extension directory from the cloned repository.
The extension is now installed and active.
Usage
Set Your API Key: Click the Threadly icon in your browser toolbar and enter your Gemini API key.
Navigate to a Supported AI Platform: Go to a site like chat.openai.com, claude.ai, or gemini.google.com.
Use the Sidebar: The Threadly sidebar tab will automatically appear on the right. Click it to expand and manage your conversation.
Refine Your Prompts: Type a prompt in the AI platform's input box. A ✨ Refine button will appear. Click it to automatically enhance your prompt for better results.
Technical Details
Component	Description
Manifest V3	Ensures modern security, performance, and privacy standards using a service worker-based architecture.
Content Scripts	Platform-specific scripts are injected to handle UI integration and feature placement on each supported AI site.
Background Service Worker	The background.js script manages autonomous learning and data curation from user feedback in the background.
Local Storage	All conversation data, collections, and API keys are stored securely on the user's local machine using the chrome.storage API.
Gemini API Integration	The api-handler.js script manages all interactions with the Google Gemini API for intelligent prompt classification and refinement.
Contributing
💬 Join the Discussions: Share your insights, provide feedback, or ask questions on our Reddit community.
🐛 Report Issues: Submit bugs found or log feature requests on our GitHub Issues page.
💡 Submit Pull Requests: Review open PRs, and submit your own.
<details><summary>Contributing Guidelines</summary>
Fork the Repository: Start by forking the project repository to your GitHub account.
Clone Locally: Clone the forked repository to your local machine.
code
Sh
git clone https://github.com/YOUR_USERNAME/Threadly
Create a New Branch: Always work on a new branch with a descriptive name.
code
Sh
git checkout -b new-feature-x
Make Your Changes: Develop and test your changes locally.
Commit Your Changes: Commit with a clear message describing your updates.
code
Sh
git commit -m 'Implemented new feature x.'
Push to GitHub: Push the changes to your forked repository.
code
Sh
git push origin new-feature-x
Submit a Pull Request: Create a PR against the original project repository. Clearly describe the changes and their motivations.
</details>
License
This project is licensed under the MIT License. See the LICENSE file for details.
Acknowledgments
Special thanks to the open-source community and all the users who provide valuable feedback to make Threadly better.
Made with ❤️ for the AI community.
Support the Project
If you find this extension helpful and would like to support its development, consider buying me a coffee! ☕
<p align="center">
<a href="https://ko-fi.com/evinjohnn" target="_blank">
<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="150">
</a>
</p>
