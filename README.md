<p align="center">
  <img src="https://raw.githubusercontent.com/evinjohnn/Threadly/main/chrome-extension/favicon-512x512.png" alt="Threadly Logo" width="120">
</p>

<h1 align="center">Threadly</h1>

<p align="center">
  <strong>Multi-Platform AI Extension</strong>
</p>

<p align="center">
  A universal browser extension that enhances major AI chat platforms with a sleek, powerful sidebar for managing, searching, and refining your conversations.
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/evinjohnn/Threadly?style=flat&logo=opensourceinitiative&logoColor=white&color=00bfae" alt="license">
  <img src="https://img.shields.io/github/last-commit/evinjohnn/Threadly?style=flat&logo=git&logoColor=white&color=00bfae" alt="last-commit">
  <img src="https://img.shields.io/github/languages/top/evinjohnn/Threadly?style=flat&color=00bfae" alt="repo-top-language">
  <img src="https://img.shields.io/github/languages/count/evinjohnn/Threadly?style=flat&color=00bfae" alt="repo-language-count">
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Demo](#demo)
- [Features](#features)
- [Availability](#availability)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Technical Details](#technical-details)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## 🎯 Overview

Threadly is a universal browser extension that transforms your experience on major AI chat platforms like ChatGPT, Claude, and Gemini. It automatically injects a sleek, powerful sidebar to help you manage, search, and navigate your conversations with ease.

With AI-powered prompt refinement and advanced collection management, Threadly helps you write better prompts and organize your conversations effortlessly. All powered by a modern glassmorphic UI with complete privacy through local storage.

---

## 🎥 Demo

![Threadly Demo](https://raw.githubusercontent.com/evinjohnn/Threadly/main/chrome-extension/demo.gif)

*Demo showcasing Threadly's auto-loading sidebar, instant search, and AI prompt refinement features.*

---

## ✨ Features

- **Universal Compatibility** — Works seamlessly with ChatGPT, Claude, Gemini, Grok, Perplexity, and more
- **AI-Powered Prompt Refiner** — Automatically enhances your prompts for better AI responses using the Gemini API
- **Advanced Collection Management** — Organize saved messages into color-coded, searchable collections
- **Beautiful Glassmorphism UI** — Modern, sleek interface with smooth, physics-based "metaball" animations
- **Instant Search & Filtering** — Quickly find any message and filter by user, AI, or favorites
- **Real-time Message Extraction** — Automatically captures and indexes conversations as you chat
- **Privacy-Focused** — All data, collections, and API keys stored securely on your local device
- **Manifest V3 Compliant** — Built with the latest Chrome Extension standards for security and performance

---

## 🌐 Availability

| Browser | Status | Link |
|---------|--------|------|
| Google Chrome | ✅ Available | [Chrome Web Store](https://chromewebstore.google.com/detail/gnnpjnaahnccnccaaaegapdnplkhfckh?utm_source=item-share-cb) |
| Microsoft Edge | 🔜 Coming Soon | [Edge Add-ons](#) |
| Opera | 🔜 Coming Soon | [Opera Addons](#) |

*Compatible with all major Chromium-based browsers*

---

## 🛠️ Tech Stack

| Technology | Description |
|------------|-------------|
| **JavaScript (ES6+)** | Core logic for sidebar, UI interactions, data extraction, and API handling |
| **HTML5 / CSS3** | Structure and advanced styling for glassmorphism UI and responsive layout |
| **Manifest V3** | Latest Chrome Extension APIs for secure service worker-based architecture |
| **Chrome Extension APIs** | Uses storage, tabs, and alarms for data persistence and background tasks |
| **Google Gemini API** | Powers the intelligent AI Prompt Refinement feature |

---

## 📁 Project Structure

```
threadly/
└── chrome-extension/
    ├── Borel/                     # Custom font files
    ├── ai-studio-sparkle.js       # Injects 'Refine' button on AI Studio
    ├── api-handler.js             # Handles Gemini API calls for prompt refinement
    ├── background.js              # Service worker for background tasks
    ├── chatgpt-sparkle.js         # Injects 'Refine' button on ChatGPT
    ├── claude-icon.js             # Injects 'Refine' button on Claude
    ├── content.js                 # Main script to inject and manage sidebar
    ├── gemini-sparkle.js          # Injects 'Refine' button on Gemini
    ├── perplexity-sparkle.js      # Injects 'Refine' button on Perplexity
    ├── popup.html                 # Browser action popup UI
    ├── popup.js                   # API key management logic
    ├── prompts.json               # Database of prompts for Triage AI
    ├── sidebar.css                # Complete UI styling
    └── manifest.json              # Extension configuration
```

### Key Files

| File | Purpose |
|------|---------|
| `manifest.json` | Defines permissions, content scripts, and service worker configuration |
| `background.js` | Manifest V3 service worker for background tasks and autonomous learning |
| `content.js` | Main content script for sidebar rendering and conversation extraction |
| `api-handler.js` | PromptRefiner class and Triage AI for Gemini API integration |
| `sidebar.css` | Complete stylesheet including glassmorphism and animations |

---

## 🚀 Getting Started

### Prerequisites

- Modern Chromium-based browser (Chrome, Edge, or Opera)
- Git (for cloning the repository)
- [Google Gemini API Key](https://makersuite.google.com/app/apikey) (free)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/evinjohnn/Threadly
   cd Threadly
   ```

2. **Open your browser's extension page**
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Opera: `opera://extensions`

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the `chrome-extension` directory from the cloned repository

5. **Done!** The extension is now installed and active.

---

## 💡 Usage

1. **Set Your API Key**
   - Click the Threadly icon in your browser toolbar
   - Enter your Gemini API key

2. **Navigate to a Supported Platform**
   - Visit sites like `chat.openai.com`, `claude.ai`, or `gemini.google.com`

3. **Use the Sidebar**
   - The Threadly sidebar tab appears automatically on the right
   - Click to expand and manage your conversations

4. **Refine Your Prompts**
   - Type a prompt in the AI platform's input box
   - Click the ✨ **Refine** button to automatically enhance your prompt

---

## 🔧 Technical Details

| Component | Description |
|-----------|-------------|
| **Manifest V3** | Modern security and performance standards with service worker architecture |
| **Content Scripts** | Platform-specific scripts for UI integration on each AI site |
| **Background Service Worker** | Manages autonomous learning and data curation from user feedback |
| **Local Storage** | Secure local storage via `chrome.storage` API for all data |
| **Gemini API Integration** | Intelligent prompt classification and refinement |

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

- 💬 **Discussions** — Share insights and ask questions on our [Reddit community](https://www.reddit.com/r/ThreadlyExtension)
- 🐛 **Report Issues** — Submit bugs or feature requests via [GitHub Issues](https://github.com/evinjohnn/Threadly/issues)
- 💡 **Pull Requests** — Review open PRs or submit your own

### Contribution Guidelines

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Threadly
   ```

2. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Develop and test locally

4. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```

5. **Push to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Submit a Pull Request**
   - Clearly describe your changes and motivations

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## ☕ Support the Project

If you find Threadly helpful, consider supporting its development!

<p align="center">
  <a href="https://ko-fi.com/evinjohnn" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="180">
  </a>
</p>

---

## 🙏 Acknowledgments

Special thanks to the open-source community and all users who provide valuable feedback to make Threadly better.

<p align="center">
  Made with ❤️ for the AI community
</p>

---

<p align="center">
  <sub>⭐ Star this repo if you find it useful!</sub>
</p>
