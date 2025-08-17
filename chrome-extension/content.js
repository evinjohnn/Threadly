(function() {
    'use strict';

    // --- Updated Configuration for 2024/2025 --- //
    const PLATFORM_CONFIG = {
        chatgpt: {
            name: 'ChatGPT',
            chatContainer: 'main',
            // Updated selectors for current ChatGPT structure
            userSelector: 'div[data-message-author-role="user"] .whitespace-pre-wrap, div[data-message-author-role="user"] div[class*="prose"], div[data-message-author-role="user"] .text-base',
        },
        claude: {
            name: 'Claude',
            chatContainer: '[data-testid="conversation-turn-list"], main',
            userSelector: 'div[data-testid="chat-user-message-content"], div[data-testid="user-message"]',
        },
        gemini: {
            name: 'Gemini',
            // Updated container selectors for current Gemini interface
            chatContainer: 'main, .conversation-container, [role="main"], .chat-interface, .chat-container',
            // Updated user selectors for current Gemini structure
            userSelector: '.user-message, [data-role="user"], .query-text, div[class*="user"] p, .user-input-display, .user-query, div[class*="query"]',
        },
        grok: {
            name: 'Grok',
            chatContainer: 'div[style*="flex-direction: column;"], main',
            userSelector: 'div.user-message, [data-role="user"]',
        },
        'ai-studio': {
            name: 'AI Studio',
            chatContainer: 'main, .chat-container, .chat-interface, [role="main"], .conversation-container',
            userSelector: '.user-message, [data-role="user"], .user-input, .user-query, .prompt-text, .input-text, .query-input, .user-prompt, div[class*="user"] p, div[class*="prompt"] p',
        },
        copilot: {
            name: 'Copilot',
            chatContainer: 'main, .chat-container, .conversation-container, [role="main"]',
            userSelector: '.user-message, [data-role="user"], .user-input, .query-text, div[class*="user"] p, .user-prompt, .user-query, div[class*="prompt"]',
        },
        perplexity: {
            name: 'Perplexity',
            // Updated container selectors for current Perplexity interface
            chatContainer: 'main, #__next, .search-interface, [role="main"], .app-main',
            // Updated user selectors for current Perplexity structure  
            userSelector: '.user-query, [data-testid="search-query"], .search-input-value, div[class*="query"] span, .prose:has(p), input[type="text"]:not([class*="search"]):focus',
        },
        unknown: { name: 'Unknown' },
    };

    // --- Enhanced State Management --- //
    let currentPlatformId = 'unknown';
    let allMessages = [];
    let observer = null;
    let debouncedUpdate = debounce(updateAndSaveConversation, 750); // Increased debounce
    let retryCount = 0;
    const MAX_RETRIES = 5;
    let showUserMessages = true; // Toggle state for user/AI messages

    // --- DOM Elements --- //
    let container, panel, closeButton, messageList, searchInput, platformIndicator, toggleBar, toggleSegment;

    // --- Enhanced Platform Detection --- //
    function detectPlatform() {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        
        console.log('Threadly: Detecting platform for', hostname, pathname);
        
        const platformMap = {
            'chat.openai.com': 'chatgpt',
            'chatgpt.com': 'chatgpt',
            'claude.ai': 'claude',
            'gemini.google.com': 'gemini',
            'grok.com': 'grok',
            'x.ai': 'grok',
            'aistudio.google.com': 'ai-studio',
            'perplexity.ai': 'perplexity',
            'www.perplexity.ai': 'perplexity',
            'copilot.microsoft.com': 'copilot',
            'www.copilot.microsoft.com': 'copilot'
        };
        
        for (const domain in platformMap) {
            if (hostname.includes(domain)) {
                console.log('Threadly: Platform detected:', platformMap[domain]);
                return platformMap[domain];
            }
        }
        
        console.log('Threadly: Unknown platform');
        return 'unknown';
    }

    // --- Enhanced UI Injection --- //
    function injectUI() {
        // Remove any existing instances
        const existing = document.getElementById('threadly-container');
        if (existing) {
            existing.remove();
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = chrome.runtime.getURL('sidebar.css');
        document.head.appendChild(link);

        container = document.createElement('div');
        container.id = 'threadly-container';
        container.innerHTML = `
            <div id="threadly-panel" class="threadly-edge-panel">
                <div class="threadly-tint-layer"></div>
                <div class="threadly-tab-content">
                    <span class="threadly-brand">threadly</span>
                </div>
                <div class="threadly-header">
                    <h3><span class="threadly-brand">threadly</span> <span class="threadly-platform-indicator"></span></h3>
                    <button class="threadly-close">×</button>
                </div>
                <div class="threadly-content">
                    <div class="threadly-search-container">
                        <input type="text" id="threadly-search-input" placeholder="Search your prompts...">
                    </div>
                    <div id="threadly-message-list">
                        <div class="threadly-empty-state">Loading messages...</div>
                    </div>
                    <div class="threadly-noise-gradient"></div>
                    <div class="threadly-toggle-container">
                        <div class="threadly-toggle-bar" id="threadly-toggle-bar">
                            <div class="threadly-toggle-segment user" id="threadly-toggle-segment"></div>
                            <span class="threadly-toggle-label you">YOU</span>
                            <span class="threadly-toggle-label ai">AI</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);

        // Inject SVG glass distortion filter
        injectGlassFilter();

        panel = document.getElementById('threadly-panel');
        closeButton = panel.querySelector('.threadly-close');
        messageList = panel.querySelector('#threadly-message-list');
        searchInput = panel.querySelector('#threadly-search-input');
        platformIndicator = panel.querySelector('.threadly-platform-indicator');
        toggleBar = panel.querySelector('#threadly-toggle-bar');
        toggleSegment = panel.querySelector('#threadly-toggle-segment');
        platformIndicator.textContent = PLATFORM_CONFIG[currentPlatformId].name;
        platformIndicator.setAttribute('data-platform', currentPlatformId);
        
        // Add platform data attribute to panel for CSS targeting
        panel.setAttribute('data-platform', currentPlatformId);
        
        // Set initial toggle state
        toggleSegment.classList.add('user');
        
        // Platform-specific positioning adjustments
        adjustUIForPlatform();
        
        addEventListeners();
        
        console.log('Threadly: UI injected successfully');
    }

    // --- Glass Filter Injection --- //
    function injectGlassFilter() {
        // Remove any existing glass filter
        const existingFilter = document.getElementById('threadly-glass-filter');
        if (existingFilter) {
            existingFilter.remove();
        }

        // Create SVG element with glass distortion filter
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.id = 'threadly-glass-filter';
        svg.style.position = 'absolute';
        svg.style.overflow = 'hidden';
        svg.style.width = '0';
        svg.style.height = '0';
        svg.style.top = '-9999px';
        svg.style.left = '-9999px';
        svg.style.zIndex = '-9999';
        
        svg.innerHTML = `
            <defs>
                <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.0007 0.0007" numOctaves="1" seed="92" result="noise" />
                    <feGaussianBlur in="noise" stdDeviation="1" result="blurred" />
                    <feDisplacementMap in="SourceGraphic" in2="blurred" scale="35" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </defs>
        `;
        
        document.body.appendChild(svg);
        console.log('Threadly: Glass distortion filter injected');
    }

    // --- Platform-Specific UI Adjustments --- //
    function adjustUIForPlatform() {
        if (currentPlatformId === 'gemini') {
            // Fix positioning issues for Gemini
            panel.style.zIndex = '9999';
            panel.style.position = 'fixed';
            panel.style.top = '20vh';
            panel.style.right = '5px';
            
            // Force scrolling fixes on Gemini
            setTimeout(() => {
                const messageList = document.getElementById('threadly-message-list');
                const content = document.querySelector('.threadly-content');
                
                if (messageList) {
                    messageList.style.cssText = `
                        overflow-y: auto !important;
                        max-height: calc(100% - 120px) !important;
                        height: auto !important;
                        flex: 1 !important;
                    `;
                }
                
                if (content) {
                    content.style.cssText = `
                        overflow: visible !important;
                        height: calc(100% - 50px) !important;
                    `;
                }
                
                console.log('Threadly: Applied Gemini-specific scrolling fixes');
                
                // Set up continuous monitoring for Gemini
                if (currentPlatformId === 'gemini') {
                    setInterval(() => {
                        if (messageList && messageList.style.overflowY !== 'auto') {
                            messageList.style.cssText = `
                                overflow-y: auto !important;
                                max-height: calc(100% - 120px) !important;
                                height: auto !important;
                                flex: 1 !important;
                            `;
                        }
                    }, 2000);
                }
            }, 100);
        } else if (currentPlatformId === 'perplexity') {
            // Ensure proper visibility on Perplexity
            panel.style.zIndex = '10000';
            panel.style.right = '10px';
        } else if (currentPlatformId === 'ai-studio') {
            // AI Studio specific adjustments
            panel.style.zIndex = '9999';
            panel.style.right = '10px';
            
            // Force scroll to top of chat for AI Studio
            setTimeout(() => {
                const chatContainer = document.querySelector('.chat-container, .conversation-container, main');
                if (chatContainer) {
                    chatContainer.scrollTop = 0;
                    console.log('Threadly: Scrolled AI Studio chat to top');
                }
            }, 500);
        }
    }

    // --- Event Listeners --- //
    function addEventListeners() {
        panel.addEventListener('click', (e) => {
            if (e.target.closest('.threadly-close') || e.target.closest('#threadly-search-input') || e.target.closest('.threadly-message-item')) {
                return;
            }
            if (!panel.classList.contains('threadly-expanded')) {
                togglePanel(true);
            }
        });
        
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePanel(false);
        });
        
        searchInput.addEventListener('input', (e) => filterMessages(e.target.value));
        toggleBar.addEventListener('click', toggleMessageType);
        document.addEventListener('click', handleClickOutside);
    }
    
    function handleClickOutside(e) {
        if (panel.classList.contains('threadly-expanded') && !panel.contains(e.target)) {
            togglePanel(false);
        }
    }

    function togglePanel(expand) {
        if (expand) {
            const panelRect = panel.getBoundingClientRect();
            const newTop = panelRect.top;
            panel.style.top = `${newTop}px`;
            panel.style.bottom = 'auto';
            panel.classList.add('threadly-expanded');
            setTimeout(() => {
                updateAndSaveConversation();
            }, 300);
        } else {
            panel.classList.remove('threadly-expanded');
            panel.style.top = '10vh';
            panel.style.bottom = 'auto';
            
            // Clear message list when closing to prevent text size issues
            if (messageList) {
                messageList.innerHTML = '';
            }
        }
    }

    // --- Enhanced Storage Functions --- //
    function getStorageKey() {
        const key = `threadly_${currentPlatformId}_${window.location.pathname}`;
        console.log('Threadly: Storage key:', key);
        return key;
    }

    async function saveMessagesToStorage(messages) {
        try {
            const key = getStorageKey();
            const storableMessages = messages.map(msg => ({ 
                content: msg.content,
                timestamp: Date.now()
            }));
            
            if (storableMessages.length > 0) {
                await chrome.storage.local.set({ [key]: storableMessages });
                console.log('Threadly: Saved', storableMessages.length, 'messages for', currentPlatformId);
            }
        } catch (error) {
            console.error('Threadly: Storage save error:', error);
        }
    }

    async function loadMessagesFromStorage() {
        try {
            const key = getStorageKey();
            const data = await chrome.storage.local.get(key);
            const messages = data[key] || [];
            console.log('Threadly: Loaded', messages.length, 'messages for', currentPlatformId);
            return messages;
        } catch (error) {
            console.error('Threadly: Storage load error:', error);
            return [];
        }
    }

    // --- Enhanced Chat Extraction --- //
    function extractConversation() {
        const config = PLATFORM_CONFIG[currentPlatformId];
        const extracted = [];
        
        if (!config.userSelector) {
            console.log('Threadly: No user selector for platform:', currentPlatformId);
            return [];
        }

        console.log('Threadly: Extracting messages with selector:', config.userSelector);

        // Try multiple selectors (comma-separated)
        const selectors = config.userSelector.split(',').map(s => s.trim());
        
        for (const selector of selectors) {
            try {
                const userElements = document.querySelectorAll(selector);
                console.log('Threadly: Found', userElements.length, 'elements with selector:', selector);
                
                userElements.forEach((userEl, index) => {
                    let text = '';
                    
                    // Try different text extraction methods
                    if (userEl.textContent) {
                        text = userEl.textContent.trim();
                    } else if (userEl.innerText) {
                        text = userEl.innerText.trim();
                    } else if (userEl.value) {
                        text = userEl.value.trim();
                    }
                    
                    if (text && text.length > 2) { // Minimum length check
                        // Simple filtering for AI Studio: only accept short, question-like text as user input
                        if (currentPlatformId === 'ai-studio') {
                            // User input should be relatively short and look like a question/request
                            if (text.length > 200) {
                                console.log('Threadly: Skipping long text (likely AI response):', text.substring(0, 50) + '...');
                                return; // Skip this element
                            }
                            
                            // Check if it looks like a user question/request
                            const questionPatterns = ['?', 'what', 'how', 'why', 'when', 'where', 'who', 'can you', 'please', 'help', 'explain', 'tell me'];
                            const looksLikeQuestion = questionPatterns.some(pattern => 
                                text.toLowerCase().includes(pattern.toLowerCase())
                            );
                            
                            if (!looksLikeQuestion && text.length > 100) {
                                console.log('Threadly: Skipping non-question text (likely AI response):', text.substring(0, 50) + '...');
                                return; // Skip this element
                            }
                        }
                        
                        // Filter for Copilot: exclude thinking/thoughts text
                        if (currentPlatformId === 'copilot') {
                            const thinkingKeywords = ['thinking', 'thought', 'analyzing', 'considering', 'planning', 'reasoning', 'let me think', 'i need to', 'first, let me', 'let me analyze', 'i\'ll start by', 'let me search', 'searching for', 'looking up'];
                            const isThinkingText = thinkingKeywords.some(keyword => 
                                text.toLowerCase().includes(keyword.toLowerCase())
                            );
                            
                            if (isThinkingText) {
                                console.log('Threadly: Skipping Copilot thinking text:', text.substring(0, 50) + '...');
                                return; // Skip this element
                            }
                            
                            // User input should be relatively short
                            if (text.length > 150) {
                                console.log('Threadly: Skipping long text (likely AI response):', text.substring(0, 50) + '...');
                                return; // Skip this element
                            }
                        }
                        
                        console.log('Threadly: Extracted user message', index + 1, ':', text.substring(0, 50) + '...');
                        extracted.push({
                            role: 'user',
                            content: text,
                            element: userEl
                        });
                    }
                });
                
                if (extracted.length > 0) {
                    break; // Found messages, no need to try other selectors
                }
            } catch (error) {
                console.warn('Threadly: Error with selector', selector, ':', error);
            }
        }
        
        // Also extract AI responses if available
        let aiSelectors = '';
        
        // Platform-specific AI selectors
        if (currentPlatformId === 'chatgpt') {
            aiSelectors = 'div[data-message-author-role="assistant"] .whitespace-pre-wrap, div[data-message-author-role="assistant"] div[class*="prose"], div[data-message-author-role="assistant"] .text-base';
        } else if (currentPlatformId === 'claude') {
            aiSelectors = 'div[data-testid="chat-assistant-message-content"], div[data-testid="assistant-message"], .assistant-message, [data-role="assistant"], div[class*="assistant"], .claude-response, div[class*="claude"], div[class*="response"]';
        } else if (currentPlatformId === 'gemini') {
            aiSelectors = '.assistant-message, [data-role="assistant"], .ai-response, div[class*="assistant"] p, .gemini-response, div[class*="gemini"], div[class*="response"], .response-text, div[class*="answer"], .ai-answer';
        } else if (currentPlatformId === 'ai-studio') {
            aiSelectors = '.assistant-message, [data-role="assistant"], .ai-response, .response-text, .ai-answer, .generated-text, .final-answer, .ai-output, .response-content, .output-text, .answer-content, .model-response, .ai-studio-response, div[class*="assistant"] p, div[class*="response"] p, div[class*="answer"] p, div[class*="generated"] p';
        } else if (currentPlatformId === 'copilot') {
            aiSelectors = '.assistant-message, [data-role="assistant"], .ai-response, .copilot-response, div[class*="assistant"], div[class*="response"], .response-text, div[class*="answer"]';
        } else if (currentPlatformId === 'perplexity') {
            aiSelectors = '.ai-response, [data-role="assistant"], .assistant-message, div[class*="answer"]';
        } else if (currentPlatformId === 'grok') {
            aiSelectors = '.assistant-message, [data-role="assistant"], .ai-response';
        } else {
            aiSelectors = 'div[data-message-author-role="assistant"] .whitespace-pre-wrap, div[data-message-author-role="assistant"] div[class*="prose"], .assistant-message, .ai-response';
        }
        
        try {
            const aiElements = document.querySelectorAll(aiSelectors);
            console.log('Threadly: Found', aiElements.length, 'AI response elements with selector:', aiSelectors);
            
            aiElements.forEach((aiEl, index) => {
                let text = '';
                
                if (aiEl.textContent) {
                    text = aiEl.textContent.trim();
                } else if (aiEl.innerText) {
                    text = aiEl.innerText.trim();
                }
                
                if (text && text.length > 2) {
                    // For AI Studio, focus on substantial AI responses
                    if (currentPlatformId === 'ai-studio') {
                        // AI responses should be substantial and informative
                        if (text.length < 30) {
                            console.log('Threadly: Skipping very short AI response:', text.substring(0, 50) + '...');
                            return; // Skip this element
                        }
                        
                        // Skip thinking/planning text
                        if (text.toLowerCase().includes('thinking') || text.toLowerCase().includes('let me think')) {
                            console.log('Threadly: Skipping thinking text:', text.substring(0, 50) + '...');
                            return; // Skip this element
                        }
                    }
                    
                    // For Copilot, filter out thinking/thoughts text and focus on actual responses
                    if (currentPlatformId === 'copilot') {
                        const thinkingKeywords = ['thinking', 'thought', 'analyzing', 'considering', 'planning', 'reasoning', 'let me think', 'i need to', 'first, let me', 'let me analyze', 'i\'ll start by', 'let me search', 'searching for', 'looking up', 'searching', 'found some information', 'here\'s what i found'];
                        const isThinkingText = thinkingKeywords.some(keyword => 
                            text.toLowerCase().includes(keyword.toLowerCase())
                        );
                        
                        if (isThinkingText) {
                            console.log('Threadly: Skipping Copilot thinking text from AI responses:', text.substring(0, 50) + '...');
                            return; // Skip this element
                        }
                        
                        // AI responses should be substantial
                        if (text.length < 40) {
                            console.log('Threadly: Skipping very short Copilot response:', text.substring(0, 50) + '...');
                            return; // Skip this element
                        }
                    }
                    
                    console.log('Threadly: Extracted AI message', index + 1, ':', text.substring(0, 50) + '...');
                    extracted.push({
                        role: 'assistant',
                        content: text,
                        element: aiEl
                    });
                }
            });
            
            // Fallback: If no AI responses found, try alternative methods
            if (aiElements.length === 0) {
                console.log('Threadly: No AI responses found with primary selectors, trying fallback methods...');
                
                // Try to find AI responses by looking for elements that contain typical AI response text
                const allTextElements = document.querySelectorAll('div, p, span');
                const aiResponseKeywords = ['I understand', 'Here\'s', 'Based on', 'Let me', 'I can', 'The answer', 'According to', 'I\'ll help', 'Here is', 'To answer'];
                
                allTextElements.forEach(el => {
                    const text = el.textContent?.trim() || '';
                    if (text.length > 20 && text.length < 2000) { // Reasonable length for AI response
                        const hasAiKeywords = aiResponseKeywords.some(keyword => 
                            text.toLowerCase().includes(keyword.toLowerCase())
                        );
                        
                        // Also check if it's not a user message (already extracted)
                        const isNotUserMessage = !extracted.some(msg => 
                            msg.content === text || msg.element === el
                        );
                        
                        if (hasAiKeywords && isNotUserMessage) {
                            console.log('Threadly: Found potential AI response with fallback method:', text.substring(0, 50) + '...');
                            extracted.push({
                                role: 'assistant',
                                content: text,
                                element: el
                            });
                        }
                    }
                });
            }
        } catch (error) {
            console.warn('Threadly: Error extracting AI responses:', error);
        }
        
        console.log('Threadly: Total extracted messages:', extracted.length);
        
        // Debug: Log what elements are available for better debugging
        if (extracted.length === 0) {
            console.log('Threadly: Debug - No messages extracted, checking available elements...');
            const debugElements = document.querySelectorAll('div, p, span');
            console.log('Threadly: Debug - Found', debugElements.length, 'potential text elements');
            
            // Log first few elements for debugging
            debugElements.slice(0, 10).forEach((el, i) => {
                const text = el.textContent?.trim() || '';
                if (text.length > 5) {
                    console.log(`Threadly: Debug - Element ${i}:`, text.substring(0, 100) + '...');
                }
            });
        }
        
        return extracted;
    }

    // --- Enhanced Rendering --- //
    function renderMessages(messagesToRender) {
        if (!messageList) return;
        
        // Clear existing content completely
        messageList.innerHTML = '';
        
        if (messagesToRender.length === 0) {
            messageList.innerHTML = '<div class="threadly-empty-state">No messages found. Try interacting with the chat first.</div>';
            return;
        }
        
        const fragment = document.createDocumentFragment();
        messagesToRender.forEach((msg, index) => {
            const item = document.createElement('div');
            item.className = 'threadly-message-item';
            item.dataset.role = msg.role;
            
            // Check if message is longer than 10 words
            const wordCount = msg.content.trim().split(/\s+/).length;
            const isLongMessage = wordCount > 10;
            
            const roleText = msg.role === 'user' ? `You (#${index + 1})` : `AI (#${index + 1})`;
            
            item.innerHTML = `
                <div class="threadly-message-role">${roleText}</div>
                <div class="threadly-message-text">${escapeHTML(msg.content)}</div>
                ${isLongMessage ? '<div class="threadly-read-more">See More</div>' : ''}
            `;

            // Add read more functionality
            if (isLongMessage) {
                const readMoreBtn = item.querySelector('.threadly-read-more');
                const messageText = item.querySelector('.threadly-message-text');
                
                readMoreBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (messageText.classList.contains('expanded')) {
                        messageText.classList.remove('expanded');
                        readMoreBtn.textContent = 'See More';
                    } else {
                        messageText.classList.add('expanded');
                        readMoreBtn.textContent = 'See Less';
                    }
                });
            }
            
            if (msg.element && document.body.contains(msg.element)) {
                item.style.cursor = 'pointer';
                item.title = 'Click to scroll to message';
                item.addEventListener('click', () => {
                    msg.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    const originalBg = msg.element.style.backgroundColor;
                    msg.element.style.transition = 'background-color 0.3s ease';
                    msg.element.style.backgroundColor = getPlatformHighlightColor();
                    setTimeout(() => {
                        msg.element.style.backgroundColor = originalBg;
                    }, 1500);
                });
            }
            fragment.appendChild(item);
        });
        messageList.appendChild(fragment);
    }
    
    function toggleMessageType() {
        showUserMessages = !showUserMessages;
        toggleSegment.classList.toggle('user', showUserMessages);
        toggleSegment.classList.toggle('ai', !showUserMessages);
        filterMessages(searchInput.value);
    }
    
    function filterMessages(query) {
        query = query.trim().toLowerCase();
        let filtered = !query ? allMessages : allMessages.filter(m => 
            m.content.toLowerCase().includes(query)
        );
        
        // Filter by message type based on toggle state
        if (showUserMessages) {
            filtered = filtered.filter(m => m.role === 'user');
        } else {
            filtered = filtered.filter(m => m.role === 'assistant');
        }
        
        renderMessages(filtered);
    }

    // --- Enhanced Update Logic --- //
    function updateAndSaveConversation() {
        console.log('Threadly: Updating conversation for', currentPlatformId);
        
        const currentMessages = extractConversation();
        
        if (currentMessages.length > 0) {
            // Deduplicate messages based on content and role
            const uniqueMessages = [];
            const seen = new Set();
            
            currentMessages.forEach(msg => {
                const key = `${msg.role}:${msg.content.substring(0, 100)}`; // Use first 100 chars as key
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueMessages.push(msg);
                }
            });
            
            allMessages = uniqueMessages;
            saveMessagesToStorage(uniqueMessages);
            console.log('Threadly: Updated with', uniqueMessages.length, 'unique messages (was', currentMessages.length, ')');
        } else {
            console.log('Threadly: No messages found during update');
        }
        
        if (panel && panel.classList.contains('threadly-expanded')) {
            filterMessages(searchInput.value);
        }
    }

    // --- Enhanced Observer with Retry Logic --- //
    function startObserver() {
        if (observer) {
            observer.disconnect();
        }
        
        const config = PLATFORM_CONFIG[currentPlatformId];
        const containerSelectors = config.chatContainer.split(',').map(s => s.trim());
        
        let targetNode = null;
        
        // Try each container selector
        for (const selector of containerSelectors) {
            targetNode = document.querySelector(selector);
            if (targetNode) {
                console.log('Threadly: Found container with selector:', selector);
                break;
            }
        }
        
        if (!targetNode) {
            retryCount++;
            if (retryCount < MAX_RETRIES) {
                console.log('Threadly: Container not found, retrying in 3s... (attempt', retryCount, '/', MAX_RETRIES, ')');
                setTimeout(startObserver, 3000);
                return;
            } else {
                console.error('Threadly: Could not find container after', MAX_RETRIES, 'attempts');
                return;
            }
        }
        
        console.log('Threadly: Starting MutationObserver on:', targetNode);
        
        observer = new MutationObserver((mutations) => {
            const hasRelevantChanges = mutations.some(mutation => 
                mutation.type === 'childList' && 
                (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)
            );
            
            if (hasRelevantChanges) {
                debouncedUpdate();
            }
        });
        
        observer.observe(targetNode, { 
            childList: true, 
            subtree: true,
            attributes: false // Reduce noise
        });
        
        // Initial update
        debouncedUpdate();
        retryCount = 0; // Reset retry count on success
    }

    // --- Utilities --- //
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    function getPlatformHighlightColor() {
        const platformColors = {
            'chatgpt': 'rgba(156, 163, 175, 0.2)',
            'gemini': 'rgba(66, 133, 244, 0.2)',
            'claude': 'rgba(255, 107, 53, 0.2)',
            'ai-studio': 'rgba(66, 133, 244, 0.2)',
            'perplexity': 'rgba(20, 184, 166, 0.2)',
            'grok': 'rgba(31, 41, 55, 0.2)',
            'copilot': 'rgba(0, 120, 212, 0.2)'
        };
        return platformColors[currentPlatformId] || 'rgba(0, 191, 174, 0.2)';
    }
    
    function escapeHTML(str) {
        const p = document.createElement('p');
        p.textContent = str;
        return p.innerHTML;
    }

    // --- Enhanced Initialization --- //
    async function init() {
        console.log('Threadly: Initializing...');
        
        currentPlatformId = detectPlatform();
        if (currentPlatformId === 'unknown') {
            console.log('Threadly: Unknown platform, exiting');
            return;
        }
        
        // Wait a bit more for dynamic platforms
        if (currentPlatformId === 'perplexity' || currentPlatformId === 'gemini') {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        try {
            injectUI();
            
            const savedMessages = await loadMessagesFromStorage();
            const liveMessages = extractConversation();
            
            // Prefer live messages if available, otherwise use saved
            allMessages = liveMessages.length > 0 ? liveMessages : 
                        savedMessages.map(m => ({ content: m.content, element: null, role: m.role || 'user' }));

            if (panel && panel.classList.contains('threadly-expanded')) {
                renderMessages(allMessages);
            }

            startObserver();
            
            console.log('Threadly: Initialization complete for', currentPlatformId);
            
        } catch (error) {
            console.error('Threadly: Initialization error:', error);
        }
    }

    // --- Enhanced Ready State Handling --- //
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(init, 1000); // Extra delay for SPA loading
        });
    } else {
        setTimeout(init, 1000); // Extra delay for SPA loading
    }
    
    // Handle SPA navigation
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            console.log('Threadly: URL changed, re-initializing...');
            setTimeout(init, 2000); // Re-initialize on navigation
        }
    }).observe(document, { subtree: true, childList: true });

})();