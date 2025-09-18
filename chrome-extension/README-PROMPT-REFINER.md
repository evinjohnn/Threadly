# Threadly Prompt Refiner

## Overview

The Threadly Prompt Refiner is a powerful Chrome extension that automatically enhances and refines user prompts for various AI platforms including ChatGPT, Claude, Gemini, and Perplexity. It leverages platform-specific prompt engineering best practices to help users get more accurate and relevant responses from AI models.

## Features

### ✨ Core Functionality
- **Automatic Prompt Refinement**: Intelligently refines prompts based on the target AI platform
- **Platform-Specific Optimization**: Uses tailored guidelines for each AI platform
- **Task Category Detection**: Automatically categorizes prompts into 7 task types
- **Context Preservation**: Maintains original intent while enhancing structure and clarity
- **Real-time Integration**: Seamlessly integrates with existing AI platform interfaces

### 🎯 Supported Platforms
- **ChatGPT (OpenAI)**: Optimized for clear, direct instructions with role assignments
- **Claude (Anthropic)**: Uses XML tags and structured formatting for better responses
- **Gemini (Google)**: Emphasizes explicit instructions and contextual information
- **Perplexity**: Focuses on data-backed insights and source citations

### 📋 Task Categories
1. **Coding**: Programming, debugging, algorithm development
2. **Research**: Academic research, data analysis, fact-finding
3. **Personal Support**: Life advice, counseling, personal development
4. **Content Creation**: Writing, marketing, creative content
5. **Learning**: Education, tutorials, skill development
6. **Technical Assistance**: Troubleshooting, setup, technical support
7. **Creativity**: Brainstorming, creative writing, design ideas

## Installation & Setup

### Prerequisites
- Chrome browser (Manifest V3 compatible)
- Google Gemini API key (free from Google AI Studio)

### Installation Steps
1. Clone or download the extension files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. Click the Threadly icon in the toolbar to open the popup
6. Enter your Gemini API key and click "Save"

### Getting Your Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Paste it in the extension popup

## How It Works

### 1. Prompt Detection
The extension automatically detects when you're typing in AI platform input areas and injects a "✨ Refine" button.

### 2. Intelligent Analysis
When you click the refine button, the extension:
- Analyzes your prompt content
- Detects the target AI platform
- Categorizes the task type
- Applies platform-specific optimization rules

### 3. Prompt Enhancement
The system refines your prompt by:
- Adding appropriate role assignments
- Structuring content with platform-specific formatting
- Including relevant context and constraints
- Preserving your original intent and values

### 4. Seamless Integration
The refined prompt replaces your original text, ready to send to the AI platform.

## Platform-Specific Optimizations

### ChatGPT Optimization
- **Clear Instructions**: Direct, specific commands
- **Role Assignment**: "Act as a [expert/teacher/developer]"
- **Tone Specification**: Formal, friendly, technical, etc.
- **Output Format**: Lists, step-by-step, specific structures

**Example:**
```
Original: "help me with python"
Refined: "Act as a senior Python developer. Provide a comprehensive guide for Python programming, including best practices, common patterns, and practical examples. Use a friendly, educational tone and include code snippets with explanations."
```

### Claude Optimization
- **XML Structure**: Uses `<instruction>`, `<context>`, `<task>` tags
- **System Prompts**: Clear role and behavior definitions
- **Few-Shot Examples**: Includes examples when beneficial
- **Chain of Thought**: Encourages step-by-step reasoning

**Example:**
```
Original: "write a story"
Refined: "<system>You are a creative writing coach specializing in short stories.</system>
<instruction>Write an engaging short story</instruction>
<context>Target audience: general readers, length: 500-800 words</context>
<task>Create a compelling narrative with well-developed characters and a satisfying conclusion</task>"
```

### Gemini Optimization
- **Explicit Instructions**: Clear task definitions
- **Rich Context**: Detailed background information
- **Output Specifications**: Format and style requirements
- **Conversational Tone**: Natural, engaging language

**Example:**
```
Original: "explain machine learning"
Refined: "Task: Explain machine learning concepts in simple terms
Context: The explanation is for beginners with no technical background
Output Format: Use analogies and real-world examples, structure with clear headings
Requirements: Cover supervised vs unsupervised learning, include practical applications"
```

### Perplexity Optimization
- **Clear Instructions**: Specific, actionable requests
- **Data Sources**: Requests credible sources and citations
- **Background Context**: Relevant information for better responses
- **Follow-up Questions**: Suggests deeper exploration

**Example:**
```
Original: "climate change facts"
Refined: "Instruction: Provide recent, data-backed facts about climate change
Context: Focus on scientific consensus and recent research findings
Input: Include statistics from peer-reviewed studies and official reports
Output Format: Present key facts with sources and dates
Follow-up: Suggest areas for deeper investigation"
```

## Technical Architecture

### File Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── content.js            # Main content script with UI injection
├── api-handler.js        # Gemini API integration and prompt logic
├── popup.html           # API key management interface
├── popup.js             # Popup functionality
├── sidebar.css          # Existing Threadly styles
└── README-PROMPT-REFINER.md
```

### Key Components

#### API Handler (`api-handler.js`)
- Manages Gemini API calls
- Implements platform-specific prompt templates
- Handles task categorization
- Preserves user intent while enhancing prompts

#### Content Script (`content.js`)
- Detects AI platform input areas
- Injects refine buttons dynamically
- Handles user interactions
- Manages prompt refinement workflow

#### Popup Interface (`popup.html` + `popup.js`)
- API key management
- Extension configuration
- Status notifications
- User guidance

## Privacy & Security

### Data Handling
- **Local Storage**: API keys stored locally using Chrome's storage API
- **No Data Collection**: No user prompts or personal data are collected
- **Direct API Calls**: All API calls go directly to Google's Gemini API
- **No Third-Party Services**: No data is sent to external services

### API Key Security
- Keys are stored securely in Chrome's local storage
- Keys are never transmitted to any server except Google's Gemini API
- Users can clear their API key at any time through the popup

## Troubleshooting

### Common Issues

#### Refine Button Not Appearing
- Ensure you're on a supported AI platform
- Check that the extension is enabled
- Try refreshing the page
- Verify your API key is set correctly

#### Refinement Fails
- Check your internet connection
- Verify your Gemini API key is valid
- Ensure you have sufficient API quota
- Check the browser console for error messages

#### API Key Issues
- Verify the key format (should start with "AIza" and be 39 characters)
- Check that the key has Gemini API access enabled
- Ensure you have sufficient API quota remaining

### Getting Help
1. Check the browser console for error messages
2. Verify your API key in the extension popup
3. Test your API key with a simple prompt
4. Ensure you're on a supported platform

## Development

### Building from Source
1. Clone the repository
2. Install dependencies (none required for basic functionality)
3. Load the extension in Chrome developer mode
4. Make changes and reload the extension

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly across all supported platforms
5. Submit a pull request

## License

This project extends the existing Threadly Chrome extension. Please refer to the main project license for usage terms.

## Changelog

### Version 2.5.1
- Added prompt refinement functionality
- Integrated Gemini API for prompt optimization
- Added support for 4 major AI platforms
- Implemented 7 task category detection
- Created comprehensive prompt templates
- Added popup interface for API key management

---

**Note**: This extension requires a valid Gemini API key to function. The API key is used only for prompt refinement and is not shared with any third parties.
