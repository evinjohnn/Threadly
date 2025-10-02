(function() {
    'use strict';

    // --- Tooltip Functions --- //
    function showApiKeyTooltip(element) {
        // Remove any existing tooltip
        const existingTooltip = document.querySelector('[data-threadly-tooltip="api-key"]');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        // Inject tooltip animation CSS if not already present
        if (!document.querySelector('#threadly-tooltip-animations')) {
            const style = document.createElement('style');
            style.id = 'threadly-tooltip-animations';
            style.textContent = `
                /* Tooltip pill animation - same as sparkle menu */
                .threadly-tooltip {
                    position: fixed;
                    z-index: 10000;
                    overflow: hidden;
                    pointer-events: none;
                }

                /* Growing animation */
                .threadly-tooltip.growing {
                    animation: tooltip-emerge 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                /* Shrinking animation */
                .threadly-tooltip.shrinking {
                    animation: tooltip-contract 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                    animation-fill-mode: forwards;
                }

                @keyframes tooltip-emerge {
                    0% {
                        width: 0;
                        height: 0;
                        opacity: 0;
                        border-radius: 50%;
                    }
                    
                    15% {
                        width: 20px;
                        height: 20px;
                        opacity: 0.8;
                        border-radius: 50%;
                    }
                    
                    30% {
                        width: 28px;
                        height: 28px;
                        opacity: 1;
                        border-radius: 50%;
                    }
                    
                    50% {
                        width: 120px;
                        height: 28px;
                        opacity: 1;
                        border-radius: 16px;
                    }
                    
                    70% {
                        width: 180px;
                        height: 30px;
                        opacity: 1;
                        border-radius: 15px;
                    }
                    
                    85% {
                        width: 200px;
                        height: 32px;
                        opacity: 1;
                        border-radius: 15px;
                    }
                    
                    100% {
                        width: 240px;
                        height: 32px;
                        opacity: 1;
                        border-radius: 16px;
                    }
                }

                @keyframes tooltip-contract {
                    0% {
                        width: 240px;
                        height: 32px;
                        opacity: 1;
                        border-radius: 16px;
                        transform: translateX(-50%);
                    }
                    
                    10% {
                        width: 200px;
                        height: 32px;
                        border-radius: 16px;
                        transform: translateX(-50%);
                    }
                    
                    20% {
                        width: 180px;
                        height: 30px;
                        border-radius: 15px;
                        transform: translateX(-50%);
                    }
                    
                    35% {
                        width: 140px;
                        height: 28px;
                        border-radius: 15px;
                        transform: translateX(-50%);
                    }
                    
                    50% {
                        width: 100px;
                        height: 26px;
                        border-radius: 15px;
                        transform: translateX(-50%);
                    }
                    
                    70% {
                        width: 60px;
                        height: 24px;
                        border-radius: 15px;
                        transform: translateX(-50%);
                    }
                    
                    85% {
                        width: 30px;
                        height: 20px;
                        border-radius: 50%;
                        transform: translateX(-50%);
                    }
                    
                    100% {
                        width: 0;
                        height: 0;
                        opacity: 0;
                        border-radius: 50%;
                        transform: translateX(-50%);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.setAttribute('data-threadly-tooltip', 'api-key');
        tooltip.className = 'threadly-tooltip';
        
        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 0.3s ease 0.4s;
        `;
        contentContainer.innerHTML = `
            <span style="
                font-size: 11px;
                font-weight: 600;
                color: #ffffff;
                white-space: nowrap;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">Enter API key in extension settings</span>
        `;
        
        tooltip.appendChild(contentContainer);

        // Position the tooltip above the element
        const rect = element.getBoundingClientRect();
        tooltip.style.top = (rect.top - 45) + 'px';
        tooltip.style.left = (rect.left + rect.width / 2) + 'px';
        tooltip.style.transform = 'translateX(-50%)';

        // Add blur background styling
        tooltip.style.background = 'rgba(255, 255, 255, 0.08)';
        tooltip.style.backdropFilter = 'blur(10px)';
        tooltip.style.webkitBackdropFilter = 'blur(10px)';
        tooltip.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        tooltip.style.transformOrigin = 'center center';
        tooltip.style.transition = 'none';
        tooltip.style.opacity = '0';

        // Set initial size for animation
        tooltip.style.width = '0';
        tooltip.style.height = '0';

        // Add to document
        document.body.appendChild(tooltip);

        // Start the pill emergence animation
        setTimeout(() => {
            tooltip.classList.add('growing');
            
            // Show content after animation starts
            setTimeout(() => {
                contentContainer.style.opacity = '1';
            }, 400);
        }, 10);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.classList.add('shrinking');
                // Ensure animation completes before removing
                setTimeout(() => {
                    if (tooltip.parentNode) {
                        tooltip.remove();
                    }
                }, 650);
            }
        }, 3000);
    }

    // Make tooltip function available globally
    window.ThreadlyTooltip = {
        showApiKeyTooltip: showApiKeyTooltip
    };

    // --- Updated Configuration for 2024/2025 --- //
    const PLATFORM_CONFIG = {
        chatgpt: {
            name: 'ChatGPT',
            chatContainer: 'main',
            // Updated selectors for current ChatGPT structure
            userSelector: 'main div[data-message-author-role="user"] .whitespace-pre-wrap, main div[data-message-author-role="user"] div[class*="prose"], main div[data-message-author-role="user"] .text-base, main div[data-message-author-role="user"] div[class*="markdown"], main div[data-message-author-role="user"] p, main div[data-message-author-role="user"] span, main div[data-message-author-role="user"] div[class*="message"], main div[data-message-author-role="user"] div[class*="content"]',
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
        'x-ai': {
            name: 'X.AI',
            chatContainer: 'div[style*="flex-direction: column;"], main',
            userSelector: 'div.user-message, [data-role="user"]',
        },
        'ai-studio': {
            name: 'AI Studio',
            // Target the main chat container
            chatContainer: 'ms-chat-turn',
            // Target user messages using the improved selectors
            userSelector: 'div[data-turn-role="User"] ms-cmark-node.user-chunk, .user-prompt-container ms-cmark-node.user-chunk span.ng-star-inserted',
        },
        copilot: {
            name: 'Copilot',
            chatContainer: 'main, .chat-container, .conversation-container, [role="main"]',
            userSelector: '.user-message, [data-role="user"], .user-input, .query-text, div[class*="user"] p, .user-prompt, .user-query, div[class*="prompt"]',
        },
        perplexity: {
            name: 'Perplexity',
            // Target the main conversation container
            chatContainer: 'main .border-subtlest.ring-subtlest.divide-subtlest.bg-underlay',
            // Target user queries - they are in h1 and div elements with group/query class
            userSelector: 'h1[class*="group/query"], div[class*="group/query"]',
        },
        unknown: { name: 'Unknown' },
    };

    // --- Enhanced State Management --- //
    let currentPlatformId = 'unknown';
    let allMessages = [];
    let observer = null;
    // Platform-specific debounce timing for better performance
    const getDebounceDelay = () => {
        if (currentPlatformId === 'perplexity') {
            return 500; // Slightly longer for Perplexity due to complex DOM
        }
        return 300; // Standard delay for other platforms
    };
    let debouncedUpdate = debounce(async () => await updateAndSaveConversation(), getDebounceDelay());
    
    // Function to refresh debounced update when platform changes
    function refreshDebouncedUpdate() {
        debouncedUpdate = debounce(async () => await updateAndSaveConversation(), getDebounceDelay());
    }
    let retryCount = 0;
    const MAX_RETRIES = 5;
    let messageFilterState = 'user'; // 'user', 'assistant', or 'favorites'
    let previousFilterState = 'user'; // Store the state before entering selection mode
    let isInSelectionMode = false;
    let selectedMessageIds = [];
    let collections = [];
    let currentFilter = { type: 'all' }; // 'all', 'starred', or 'collection'
    let isInCollectionsView = false; // Track if we're viewing collections
    
    // Enhanced selection state management for contextual bulk deletion
    let selectionContext = null; // 'messages-in-collection' or 'collections'
    let selectedCollectionIds = []; // Track selected collections for bulk deletion
    let currentCollectionId = null; // Track which collection we're viewing messages for
    
    // Saved button state management (like React useState)
    let savedButtonActive = false; // persisted state via click
    // savedButtonHover removed - SAVED button only changes on click, not hover
    
    // State remembering mechanism for SAVED mode
    let previousStateBeforeSaved = null; // stores the state before entering SAVED mode
    let previousFilterStateBeforeSaved = null; // stores the filter state before entering SAVED mode
    
    // Assignment mode state management
    let isAssigningMode = false; // track if we're in collection assignment mode
    
    // VIBGYOR color palette for collections
    const VIBGYOR_PALETTE = [
        'rgba(148, 0, 211, 0.3)', // Violet
        'rgba(75, 0, 130, 0.3)',  // Indigo
        'rgba(0, 0, 255, 0.3)',   // Blue
        'rgba(0, 255, 0, 0.3)',   // Green
        'rgba(255, 255, 0, 0.3)', // Yellow
        'rgba(255, 127, 0, 0.3)', // Orange
        'rgba(255, 0, 0, 0.3)'    // Red
    ];
    
    // Platform-specific accent colors for collections
    const PLATFORM_COLORS = {
        'chatgpt': 'rgba(156, 163, 175, 0.3)',      // ChatGPT gray
        'gemini': 'rgba(66, 133, 244, 0.3)',         // Gemini blue
        'claude': 'rgba(255, 107, 53, 0.3)',         // Claude orange
        'ai-studio': 'rgba(66, 133, 244, 0.3)',      // AI Studio blue
        'perplexity': 'rgba(32, 178, 170, 0.3)',      // Perplexity teal
        'grok': 'rgba(31, 41, 55, 0.3)',             // Grok dark gray
        'copilot': 'rgba(0, 120, 212, 0.3)'          // Copilot blue
    };
    
    // Function to get platform-specific header colors
    function getPlatformHeaderColor() {
        const platform = currentPlatformId;
        const schemes = {
            'chatgpt': {
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'rgba(255, 255, 255, 0.1)'
            },
            'claude': {
                background: 'rgba(255, 165, 0, 0.08)',
                border: 'rgba(255, 165, 0, 0.1)'
            },
            'gemini': {
                background: 'rgba(66, 133, 244, 0.08)',
                border: 'rgba(66, 133, 244, 0.1)'
            },
            'ai-studio': {
                background: 'rgba(66, 133, 244, 0.08)',
                border: 'rgba(66, 133, 244, 0.1)'
            },
            'perplexity': {
                background: 'rgba(32, 178, 170, 0.08)',
                border: 'rgba(32, 178, 170, 0.1)'
            },
            'grok': {
                background: 'rgba(31, 41, 55, 0.08)',
                border: 'rgba(31, 41, 55, 0.1)'
            },
            'copilot': {
                background: 'rgba(0, 120, 212, 0.08)',
                border: 'rgba(0, 120, 212, 0.1)'
            },
            'default': {
                background: 'rgba(0, 123, 255, 0.08)',
                border: 'rgba(0, 123, 255, 0.1)'
            }
        };
        return schemes[platform] || schemes['default'];
    }

    // Function to get platform-specific collection color
    function getPlatformCollectionColor(index = 0) {
        const baseColor = PLATFORM_COLORS[currentPlatformId] || 'rgba(255, 255, 255, 0.3)';
        
        // Create variations by adjusting opacity and hue for multiple collections
        if (index === 0) return baseColor;
        
        // For multiple collections, create slight variations
        const variations = [
            baseColor.replace('0.3', '0.4'),
            baseColor.replace('0.3', '0.5'),
            baseColor.replace('0.3', '0.6'),
            baseColor.replace('0.3', '0.7')
        ];
        
        return variations[index % variations.length] || baseColor;
    }
    
    // Saved button state management functions (like React useState)
    function setSavedButtonActive(active) {
        savedButtonActive = active;
        updateSavedButtonVisualState();
    }
    
    // setSavedButtonHover function removed - SAVED button only changes on click, not hover
    
    function updateSavedButtonVisualState() {
        const savedBulb = document.getElementById('threadly-saved-bulb');
        if (!savedBulb) {
            console.log('Threadly: SAVED bulb not found!');
            return;
        }
        
        const svg = savedBulb.querySelector('svg');
        if (!svg) {
            console.log('Threadly: SVG not found in SAVED bulb!');
            return;
        }
        
        const isFilled = savedButtonActive;
        
        console.log('Threadly: updateSavedButtonVisualState - active:', savedButtonActive, 'isFilled:', isFilled);
        
        if (isFilled) {
            // Create solid filled bookmark shape
            svg.innerHTML = `
                <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" 
                      fill="#ffffff" 
                      stroke="none" />
            `;
            console.log('Threadly: Set to SOLID FILLED state');
        } else {
            // Create hollow outline bookmark shape
            svg.innerHTML = `
                <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" 
                      fill="none" 
                      stroke="#ffffff" 
                      stroke-width="2" />
            `;
            console.log('Threadly: Set to HOLLOW OUTLINE state');
        }
        
        // Update accessibility attributes
        savedBulb.setAttribute('aria-pressed', savedButtonActive);
        savedBulb.setAttribute('title', savedButtonActive ? 'Saved' : 'Save');
    }
    
    function getPlatformSavedIconColor() {
        const platformColors = {
            'chatgpt': '#9ca3af',
            'gemini': '#4285f4',
            'claude': '#ff6b35',
            'ai-studio': '#4285f4',
            'perplexity': '#20b2aa',
            'grok': '#1f2937',
            'x-ai': '#1f2937',
            'copilot': '#0078d4'
        };
        return platformColors[currentPlatformId] || 'var(--threadly-primary-accent)';
    }

    function hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Handle CSS variables
        if (hex.startsWith('var(')) {
            return '255, 255, 255'; // Default white for CSS variables
        }
        
        // Convert hex to RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        return `${r}, ${g}, ${b}`;
    }

    // --- DOM Elements --- //
    let container, panel, closeButton, messageList, searchInput, platformIndicator, toggleBar, toggleSegment, scrollIndicator;

    // --- Enhanced Platform Detection --- //
    function detectPlatform() {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        
        const platformMap = {
            'chat.openai.com': 'chatgpt',
            'chatgpt.com': 'chatgpt',
            'claude.ai': 'claude',
            'gemini.google.com': 'gemini',
            'grok.com': 'grok',
            'x.ai': 'x-ai',
            'aistudio.google.com': 'ai-studio',
            'perplexity.ai': 'perplexity',
            'www.perplexity.ai': 'perplexity',
            'copilot.microsoft.com': 'copilot',
            'www.copilot.microsoft.com': 'copilot'
        };
        
        for (const domain in platformMap) {
            if (hostname.includes(domain)) {
                return platformMap[domain];
            }
        }
        
        return 'unknown';
    }


    // --- Simple Navigation Dots --- //
    function createScrollIndicator() {
        // Skip navigation dots for AI Studio
        if (currentPlatformId === 'ai-studio') {
            console.log('Threadly: Skipping navigation dots for AI Studio');
            return;
        }
        
        if (scrollIndicator) {
            scrollIndicator.remove();
        }
        
        scrollIndicator = document.createElement('div');
        scrollIndicator.id = 'threadly-scroll-indicator';
        scrollIndicator.className = `threadly-scroll-indicator ${currentPlatformId}`;
        scrollIndicator.style.display = 'flex';
        scrollIndicator.classList.add('visible');
        
        document.body.appendChild(scrollIndicator);
        console.log('Threadly: Navigation dots created and visible');
    }
    
    function updateScrollIndicator(messages) {
        console.log('Threadly: updateScrollIndicator called with', messages?.length || 0, 'messages');
        
        // Skip navigation dots for AI Studio
        if (currentPlatformId === 'ai-studio') {
            console.log('Threadly: Skipping navigation dots update for AI Studio');
            return;
        }
        
        if (!scrollIndicator) {
            createScrollIndicator();
        }
        
        // Clear existing dots
        scrollIndicator.innerHTML = '';
        
        if (!messages || messages.length === 0) {
            console.log('Threadly: No messages, keeping dots visible but empty');
            scrollIndicator.style.display = 'flex';
            scrollIndicator.classList.add('visible');
            return;
        }
        
        // Only show dots for user messages
        const userMessages = messages.filter(msg => msg.role === 'user');
        console.log('Threadly: Found', userMessages.length, 'user messages out of', messages.length, 'total messages');
        
        // Extract unique roles for analysis
        const allRoles = messages.map(msg => msg.role).filter(role => role);
        const uniqueRoles = [...new Set(allRoles)];
        
        if (userMessages.length === 0) {
            // For Perplexity loading page or homepage, keep dots visible but empty
            if (currentPlatformId === 'perplexity' && (isPerplexityLoadingPage() || isPerplexityHomepage(location.href))) {
                console.log('Threadly: On Perplexity loading page or homepage, keeping dots visible but empty');
                scrollIndicator.style.display = 'flex';
                scrollIndicator.classList.add('visible');
                return;
            }
            
            console.log('Threadly: No user messages, hiding dots');
            scrollIndicator.style.display = 'none';
            scrollIndicator.classList.remove('visible');
            return;
        }
        
        // Create dots for each user message
        userMessages.forEach((msg, index) => {
            const dot = document.createElement('div');
            dot.className = 'threadly-scroll-dot';
            const messageIndex = messages.indexOf(msg);
            dot.dataset.messageIndex = messageIndex;
            dot.title = `Jump to user message ${index + 1}`;
            
            console.log('Threadly: Creating dot for message', index + 1, 'content:', msg.content?.substring(0, 30) + '...', 'element:', msg.element?.tagName, 'messageIndex:', messageIndex);
            
            // Apply platform-specific color
            const platformColor = getPlatformSavedIconColor();
            const platformRgb = hexToRgb(platformColor);
            dot.style.setProperty('--platform-color', platformColor);
            dot.style.setProperty('--platform-rgb', platformRgb);
            
            // Create tooltip with first few words of user text
            const tooltip = document.createElement('div');
            tooltip.className = 'threadly-scroll-dot-tooltip';
            
            // Extract first few words from the message content
            const messageText = msg.content || msg.text || '';
            const firstWords = messageText.trim().split(/\s+/).slice(0, 15).join(' ');
            const tooltipText = firstWords.length > 0 ? firstWords : `User message ${index + 1}`;
            tooltip.textContent = tooltipText;
            
            dot.appendChild(tooltip);
            
            // Add click handler with event propagation control
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const messageIndex = messages.indexOf(msg);
                console.log('Threadly: Navigation dot clicked, message index:', messageIndex, 'total messages:', messages.length);
                scrollToMessage(msg, messageIndex);
            });
            
            // Also add mousedown to capture interaction early
            dot.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
            
            scrollIndicator.appendChild(dot);
        });
        
        // Ensure indicator is visible
        scrollIndicator.style.display = 'flex';
        scrollIndicator.classList.add('visible');
        
        console.log('Threadly: Navigation dots updated with', userMessages.length, 'dots');
    }
    
    function scrollToMessage(message, index) {
        console.log('Threadly: scrollToMessage called with message:', message.content?.substring(0, 50) + '...', 'index:', index);
        
        if (!message.element) {
            console.warn('Threadly: Message element is null or undefined');
            return;
        }
        
        if (!document.body.contains(message.element)) {
            console.warn('Threadly: Message element not found in DOM, trying to find it again...');
            
            // Try to find the element again using the message content
            const foundElement = findMessageElementByContent(message.content);
            if (foundElement) {
                message.element = foundElement;
                console.log('Threadly: Found message element again:', foundElement.tagName, foundElement.className);
            } else {
                console.warn('Threadly: Could not find message element, skipping scroll');
                return;
            }
        }
        
        // For Perplexity, try to find the parent container for better scrolling
        let scrollTarget = message.element;
        if (currentPlatformId === 'perplexity') {
            // Look for a parent container that might be better for scrolling
            const parentContainer = message.element.closest('main, [class*="conversation"], [class*="chat"], [class*="message"], [class*="query"]');
            if (parentContainer) {
                scrollTarget = parentContainer;
                console.log('Threadly: Using parent container for scrolling:', parentContainer.tagName, parentContainer.className);
            }
        }
        
        // Add a small delay to ensure the page is ready for scrolling
        setTimeout(() => {
            try {
                // Try scrollIntoView first
                scrollTarget.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
                
                console.log('Threadly: Successfully scrolled to message element');
                
                // Fallback: If scrollIntoView doesn't work, try manual scrolling
                setTimeout(() => {
                    const rect = scrollTarget.getBoundingClientRect();
                    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
                    
                    if (!isVisible) {
                        console.log('Threadly: Element not visible after scrollIntoView, trying manual scroll');
                        const scrollTop = window.pageYOffset + rect.top - 100; // 100px offset from top
                        window.scrollTo({
                            top: scrollTop,
                            behavior: 'smooth'
                        });
                    }
                }, 500);
                
                // Highlight the message
                const originalBg = message.element.style.backgroundColor;
                const originalTransition = message.element.style.transition;
                const originalBorder = message.element.style.border;
                
                message.element.style.transition = 'all 0.3s ease';
                message.element.style.backgroundColor = getPlatformHighlightColor();
                message.element.style.border = '2px solid ' + getPlatformHighlightColor();
                
                // Update active dot
                updateActiveScrollDot(index);
                
                // Reset highlight after delay
                setTimeout(() => {
                    message.element.style.backgroundColor = originalBg;
                    message.element.style.transition = originalTransition;
                    message.element.style.border = originalBorder;
                }, 2000);
                
                console.log('Threadly: Scrolled to message', index + 1, 'at element:', message.element.tagName, message.element.className);
            } catch (error) {
                console.error('Threadly: Error scrolling to message:', error);
            }
        }, 100);
    }
    
    // Helper function to find message element by content
    function findMessageElementByContent(content) {
        if (!content) return null;
        
        const config = PLATFORM_CONFIG[currentPlatformId];
        if (!config.userSelector) return null;
        
        const selectors = config.userSelector.split(',').map(s => s.trim());
        
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                const elementText = element.textContent?.trim() || '';
                if (elementText.includes(content.substring(0, 50))) {
                    return element;
                }
            }
        }
        
        return null;
    }
    
    function updateActiveScrollDot(activeIndex) {
        // Skip navigation dots for AI Studio
        if (currentPlatformId === 'ai-studio') {
            return;
        }
        
        if (!scrollIndicator) return;
        
        const dots = scrollIndicator.querySelectorAll('.threadly-scroll-dot');
        dots.forEach((dot, index) => {
            if (index === activeIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // --- Global Cleanup Function for Residual Elements --- //
    function cleanupResidualElements() {
        // Remove any residual pill popup elements
        const pillPopups = document.querySelectorAll('.pill-popup');
        pillPopups.forEach(popup => {
            console.log('Threadly: Removing residual pill popup element');
            popup.remove();
        });
        
        // Remove any residual sparkle elements
        const sparkles = document.querySelectorAll('[data-threadly-sparkle="true"]');
        sparkles.forEach(sparkle => {
            console.log('Threadly: Removing residual sparkle element');
            sparkle.remove();
        });
        
        // Clear any pending timeouts that might be related to pill popups
        if (window.threadlyPillTimeouts) {
            window.threadlyPillTimeouts.forEach(timeout => clearTimeout(timeout));
            window.threadlyPillTimeouts = [];
        }
        
        // Force cleanup of metaball wrapper to remove goo filter artifacts
        const metaballWrapper = document.querySelector('.threadly-metaball-wrapper');
        if (metaballWrapper) {
            // Temporarily remove and reapply the goo filter to clear artifacts
            const originalFilter = metaballWrapper.style.filter;
            metaballWrapper.style.filter = 'none';
            
            // Force a reflow
            metaballWrapper.offsetHeight;
            
            // Reapply the filter
            setTimeout(() => {
                metaballWrapper.style.filter = originalFilter || 'url(#threadly-goo)';
            }, 10);
        }
    }

    // Make cleanup function globally accessible
    window.threadlyCleanupResidualElements = cleanupResidualElements;

    // Specific function to clean up the white rectangular artifact behind saved button
    function cleanupMetaballArtifacts() {
        const metaballWrapper = document.querySelector('.threadly-metaball-wrapper');
        if (metaballWrapper) {
            // Force a complete re-render of the metaball wrapper
            metaballWrapper.style.display = 'none';
            metaballWrapper.offsetHeight; // Force reflow
            metaballWrapper.style.display = 'flex';
            
            // Reset any transform properties that might be causing artifacts
            const savedBulb = document.getElementById('threadly-saved-bulb');
            if (savedBulb) {
                savedBulb.style.transform = '';
                savedBulb.style.opacity = '';
            }
            
            console.log('Threadly: Cleaned up metaball artifacts');
        }
    }

    // Make metaball cleanup globally accessible
    window.threadlyCleanupMetaballArtifacts = cleanupMetaballArtifacts;

    // Add page unload cleanup
    window.addEventListener('beforeunload', () => {
        cleanupResidualElements();
    });

    // Add periodic cleanup to catch any missed elements
    setInterval(() => {
        const pillPopups = document.querySelectorAll('.pill-popup');
        if (pillPopups.length > 0) {
            console.log('Threadly: Found residual pill popups, cleaning up');
            cleanupResidualElements();
        }
        
        // Also clean up metaball artifacts periodically
        cleanupMetaballArtifacts();
    }, 30000); // Check every 30 seconds

    // --- Enhanced UI Injection --- //
    function injectUI() {
        // Clean up any residual elements first
        cleanupResidualElements();
        
        // Check if UI already exists
        if (document.getElementById('threadly-panel')) {
            return;
        }
        
        
        // Create the main panel
        const panelHTML = `
            <div id="threadly-panel" class="threadly-panel">
                <div class="threadly-header">
                    <div class="threadly-title">
                        <span class="threadly-icon">🔍</span>
                        <span class="threadly-text">Threadly</span>
                    </div>
                    <button class="threadly-toggle-btn" id="threadly-toggle-btn">
                        <span class="threadly-toggle-icon">−</span>
                    </button>
                </div>
                
                <div class="threadly-content">
                    <div class="threadly-tab-content">
                        <div class="threadly-search-row">
                            <div class="threadly-metaball-wrapper stateB">
                                <!-- Left Bulb: Saved Items Manager -->
                                <button id="threadly-saved-bulb" class="threadly-circle-bulb" title="Manage saved items">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="2"/>
                                    </svg>
                                </button>

                                <!-- Center Search Bar -->
                                <div class="threadly-search-pill">
                                    <input type="text" id="threadly-search-input" placeholder="Search...">
                                </div>

                                <!-- Right Bulb: Selection Mode -->
                                <button id="threadly-select-bulb" class="threadly-circle-bulb square" data-mode="select" title="Enable selection mode">
                                    <span class="xbox-box" aria-hidden="true">
                                        <span class="xbox-side top"></span>
                                        <span class="xbox-side right"></span>
                                        <span class="xbox-side bottom"></span>
                                        <span class="xbox-side left"></span>
                                    </span>
                                </button>
                            </div>
                        </div>
                        
                        <div class="threadly-toggle-container">
                            <div class="threadly-toggle-bar" id="threadly-toggle-bar">
                                <div class="threadly-toggle-segment" id="threadly-toggle-segment"></div>
                                <div class="threadly-toggle-label user">YOU</div>
                                <div class="threadly-toggle-label assistant">AI</div>
                                <div class="threadly-toggle-label fav">FAV</div>
                            </div>
                        </div>
                        
                        <div class="threadly-messages" id="threadly-messages"></div>
                        
                        <!-- Bottom Navbar for Assignment Mode -->
                        <div id="threadly-bottom-navbar" class="threadly-bottom-navbar" style="display: none;"></div>
                    </div>
                </div>
            </div>
        `;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = chrome.runtime.getURL('sidebar.css');
        document.head.appendChild(link);

        container = document.createElement('div');
        container.id = 'threadly-container';
        container.innerHTML = `
            <div id="threadly-panel" class="threadly-edge-panel" data-filter="user">
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
                        <div class="threadly-search-row">
                            <div class="threadly-metaball-wrapper stateB">
                                <!-- Left Bulb: Saved Items Manager -->
                                <button id="threadly-saved-bulb" class="threadly-circle-bulb" title="Manage saved items">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="2"/>
                                    </svg>
                                </button>

                                <!-- Center Search Bar -->
                                <div class="threadly-search-pill">
                                    <input type="text" id="threadly-search-input" placeholder="Search saved items...">
                                </div>

                                <!-- Right Bulb: Selection Mode -->
                                <button id="threadly-select-bulb" class="threadly-circle-bulb square" data-mode="select" title="Enable selection mode">
                                    <span class="xbox-box" aria-hidden="true">
                                        <span class="xbox-side top"></span>
                                        <span class="xbox-side right"></span>
                                        <span class="xbox-side bottom"></span>
                                        <span class="xbox-side left"></span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id="threadly-message-list">
                        <div class="threadly-empty-state">Loading messages...</div>
                    </div>
                    <div class="threadly-noise-gradient"></div>
                    
                    <!-- Bottom Navbar for Assignment Mode -->
                    <div id="threadly-bottom-navbar" class="threadly-bottom-navbar" style="display: none;"></div>
                    
                    <div class="threadly-toggle-container">
                        <div class="threadly-toggle-bar" id="threadly-toggle-bar">
                            <div class="threadly-toggle-segment" id="threadly-toggle-segment"></div>
                            <span class="threadly-toggle-label you">YOU</span>
                            <span class="threadly-toggle-label ai">AI</span>
                            <span class="threadly-toggle-label fav">FAV</span>
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
        messageFilterState = 'user';
        
        // Set initial search row state
        const searchRow = document.querySelector('.threadly-search-row');
        if (searchRow) {
            searchRow.classList.remove('fav-mode');
        }
        
        // Platform-specific positioning adjustments
        adjustUIForPlatform();
        
        addEventListeners();
        
        // Initialize metaball renderer
        initializeMetaballRenderer();
        
        // Add resize handler for metaball renderer
        window.addEventListener('resize', () => {
            if (window.metaBallRenderer) {
                window.metaBallRenderer.resize();
            }
        });
        
        console.log('Threadly: UI injected successfully');
    }

    // --- Metaball Renderer Initialization --- //
    function initializeMetaballRenderer() {
        // Create metaball canvas
        const metaballCanvas = document.createElement('canvas');
        metaballCanvas.className = 'metaball-canvas';
        metaballCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        `;
        
        // Add canvas to search container
        const searchContainer = document.querySelector('.threadly-search-container');
        if (searchContainer) {
            searchContainer.appendChild(metaballCanvas);
            searchContainer.style.position = 'relative';
        }
        
        // Initialize metaball renderer
        if (typeof CleanMetaBallRenderer !== 'undefined') {
            window.metaBallRenderer = new CleanMetaBallRenderer(metaballCanvas);
            console.log('Threadly: Metaball renderer initialized');
        } else {
            console.log('Threadly: Metaball renderer not available, skipping');
        }
    }

    // --- Glass Filter Injection --- //
    function injectGlassFilter() {
        // Remove any existing glass filter
        const existingFilter = document.getElementById('threadly-glass-filter');
        if (existingFilter) {
            existingFilter.remove();
        }

        // Create SVG element with glass distortion filter and goo filter
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
                <filter id="threadly-goo" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" 
                        values="1 0 0 0 0  
                                0 1 0 0 0  
                                0 0 1 0 0  
                                0 0 0 20 -8" result="goo" />
                    <feBlend in="SourceGraphic" in2="goo" mode="normal" />
                </filter>
            </defs>
        `;
        
        document.body.appendChild(svg);
        console.log('Threadly: Glass distortion and goo filters injected');
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
        
        searchInput.addEventListener('input', async (e) => {
            // Only handle main search input, not collection name input
            if (e.target.id !== 'threadly-search-input') {
                return;
            }
            
            // If we're in collections view, return to main messages first
            if (isInCollectionsView) {
                isInCollectionsView = false;
            }
            await filterMessages(e.target.value);
        });
        
        // Add click listeners for each label to allow direct selection
        toggleBar.addEventListener('click', async (e) => {
            // Don't allow state changes during assignment mode
            if (isAssigningMode) {
                console.log('Threadly: Blocking toggle bar click during assignment mode');
                return;
            }
            
            if (e.target.classList.contains('threadly-toggle-label')) {
                if (e.target.classList.contains('user') || e.target.classList.contains('you')) {
                    await selectFilterState('user');
                } else if (e.target.classList.contains('assistant') || e.target.classList.contains('ai')) {
                    await selectFilterState('assistant');
                } else if (e.target.classList.contains('fav')) {
                    await selectFilterState('favorites');
                }
            }
        });
        
        
        // Add event listener for select bulb with debouncing
        const selectBulb = document.getElementById('threadly-select-bulb');
        if (selectBulb) {
            selectBulb.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSelectionMode();
            });
        }
        
        // Add event listener for saved bulb
        const savedBulb = document.getElementById('threadly-saved-bulb');
        if (savedBulb) {
            // Set initial accessibility attributes
            savedBulb.setAttribute('aria-pressed', savedButtonActive);
            savedBulb.setAttribute('title', savedButtonActive ? 'Saved' : 'Save');
            savedBulb.setAttribute('data-testid', 'saved-button');
            
            savedBulb.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Exit selection mode if active when toggling SAVED state
                if (isInSelectionMode) {
                    console.log('Threadly: Exiting selection mode due to SAVED button toggle');
                    exitSelectionMode();
                }
                
                // Toggle the visual state - like selection button (square ↔ X)
                console.log('Threadly: SAVED bulb clicked - current state:', savedButtonActive);
                setSavedButtonActive(!savedButtonActive);
                console.log('Threadly: SAVED bulb clicked - new state:', savedButtonActive);
                
                if (!savedButtonActive) {
                    // If deactivating (click 2), return to previous active state
                    console.log('Threadly: Returning to previous state:', previousStateBeforeSaved);
                    console.log('Threadly: Previous filter state:', previousFilterStateBeforeSaved);
                    
                    // Restore the previous state if we have it
                    if (previousStateBeforeSaved && previousFilterStateBeforeSaved) {
                        messageFilterState = previousFilterStateBeforeSaved;
                        console.log('Threadly: Restored filter state to:', messageFilterState);
                    }
                    
                    console.log('Threadly: Calling resetNavbarToOriginal');
                    resetNavbarToOriginal();
                    
                    // Return message area to normal view
                    console.log('Threadly: Calling returnToMainMessages');
                    returnToMainMessages();
                    
                    // Clear the remembered state
                    previousStateBeforeSaved = null;
                    previousFilterStateBeforeSaved = null;
                } else {
                    // If activating (click 1), remember current state and show collections view
                    console.log('Threadly: Remembering current state before entering SAVED mode');
                    previousStateBeforeSaved = messageFilterState;
                    previousFilterStateBeforeSaved = messageFilterState;
                    console.log('Threadly: Remembered state:', previousStateBeforeSaved);
                    
                    console.log('Threadly: Entering SAVED state');
                    renderCollectionsView();
                    morphNavbarToSavedState();
                }
            });
            
            // Hover event listeners removed - SAVED button only changes on click, not hover
            
            // Add keyboard support
            savedBulb.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Exit selection mode if active when toggling SAVED state
                    if (isInSelectionMode) {
                        console.log('Threadly: Exiting selection mode due to SAVED button keyboard toggle');
                        exitSelectionMode();
                    }
                    
                    setSavedButtonActive(!savedButtonActive);
                    
                    if (!savedButtonActive) {
                        // If deactivating, return to previous state
                        console.log('Threadly: Keyboard - Returning to previous state:', previousStateBeforeSaved);
                        if (previousStateBeforeSaved && previousFilterStateBeforeSaved) {
                            messageFilterState = previousFilterStateBeforeSaved;
                        }
                        resetNavbarToOriginal();
                        returnToMainMessages();
                        previousStateBeforeSaved = null;
                        previousFilterStateBeforeSaved = null;
                    } else {
                        // If activating, remember current state
                        console.log('Threadly: Keyboard - Remembering current state before entering SAVED mode');
                        previousStateBeforeSaved = messageFilterState;
                        previousFilterStateBeforeSaved = messageFilterState;
                        renderCollectionsView();
                        morphNavbarToSavedState();
                    }
                }
            });
        }
        
        // Add metaball search bar behavior
        if (searchInput) {
            searchInput.addEventListener('focus', handleSearchFocus);
            searchInput.addEventListener('blur', handleSearchBlur);
            searchInput.addEventListener('input', handleSearchInput);
            searchInput.addEventListener('click', handleSearchClick);
        }
        
        // Add escape key handler for search
        document.addEventListener('keydown', handleSearchKeydown);
        
        // Add escape key handler for collections view
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isInCollectionsView) {
                returnToMainMessages();
            }
        });
        
        // Add escape key handler for selection mode
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isInSelectionMode) {
                exitSelectionMode();
            }
        });
        
        // Initialize enhanced learning system
        const enhancedContextCapture = new EnhancedContextCapture();
        const implicitFeedbackTracker = new ImplicitFeedbackTracker();
        const adaptiveFeedbackController = new AdaptiveFeedbackController();
        const userProfile = new UserProfile();
        const abTestingFramework = new ABTestingFramework();
        
        // Load user profile
        userProfile.loadProfile();
        
        // Debug mode - set to true to see detailed logs
        const DEBUG_MODE = true;
        
        if (DEBUG_MODE) {
            console.log('Threadly: Enhanced learning system initialized');
            
            // Add debug info to window for easy access
            window.threadlyDebug = {
                showFeedbackPopup: (text) => showCategoryFeedbackPopup(text, document.activeElement),
                testCtrlZ: () => {
                    console.log('Threadly: Testing Ctrl+Z detection...');
                    const event = new KeyboardEvent('keydown', {
                        key: 'z',
                        ctrlKey: true,
                        bubbles: true
                    });
                    document.dispatchEvent(event);
                },
                getActiveElement: () => {
                    const el = document.activeElement;
                    console.log('Active element:', el);
                    console.log('Tag name:', el?.tagName);
                    console.log('Content editable:', el?.contentEditable);
                    console.log('Is content editable:', el?.isContentEditable);
                    return el;
                }
            };
        }

        // Enhanced Ctrl+Z handler for all websites
        function setupCtrlZHandler() {
            // Remove any existing handler
            document.removeEventListener('keydown', handleCtrlZ);
            
            // Add new handler with capture phase to ensure it runs early
            document.addEventListener('keydown', handleCtrlZ, true);
            
            // Also add to window for better coverage
            window.addEventListener('keydown', handleCtrlZ, true);
        }

        async function handleCtrlZ(e) {
            // Check for Ctrl+Z or Cmd+Z
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                console.log('Threadly: Ctrl+Z detected');
                
                // Check if we're focused on a text input
                const activeElement = document.activeElement;
                const isTextInput = activeElement && (
                    activeElement.tagName === 'TEXTAREA' || 
                    activeElement.tagName === 'INPUT' || 
                    activeElement.contentEditable === 'true' ||
                    activeElement.isContentEditable ||
                    activeElement.getAttribute('contenteditable') === 'true'
                );
                
                console.log('Threadly: Active element:', activeElement);
                console.log('Threadly: Is text input:', isTextInput);
                
                if (isTextInput) {
                    // Prevent default undo temporarily to capture text before undo
                    const originalText = activeElement.value || activeElement.textContent || activeElement.innerText || '';
                    console.log('Threadly: Original text before undo:', originalText);
                    
                    // Wait for undo to complete, then capture enhanced context
                    setTimeout(async () => {
                        const currentText = activeElement.value || activeElement.textContent || activeElement.innerText || '';
                        console.log('Threadly: Text after undo:', currentText);
                        
                        if (currentText && currentText.trim() !== '' && currentText !== originalText) {
                            console.log('Threadly: Text changed, showing feedback popup');
                            
                            try {
                                // Capture enhanced context
                                const context = await enhancedContextCapture.captureContext(currentText, activeElement);
                                
                                // Add recent undo flag
                                context.recentUndo = true;
                                
                                // Check if we should show feedback based on confidence
                                const feedbackDecision = await adaptiveFeedbackController.shouldShowFeedback(currentText, context);
                                
                                if (feedbackDecision.shouldShow) {
                                    console.log('Threadly: Showing feedback popup. Reason:', feedbackDecision.reason);
                                    console.log('Threadly: Confidence:', feedbackDecision.confidence);
                                    
                                    // Show enhanced feedback popup with confidence display
                                    showEnhancedCategoryFeedbackPopup(currentText, activeElement, context, feedbackDecision);
                                } else {
                                    console.log('Threadly: Skipping feedback popup. Reason:', feedbackDecision.reason);
                                    console.log('Threadly: Confidence:', feedbackDecision.confidence);
                                }
                            } catch (error) {
                                console.error('Threadly: Error in feedback handling:', error);
                                // Fallback to simple popup
                                showCategoryFeedbackPopup(currentText, activeElement);
                            }
                        } else {
                            console.log('Threadly: No text change detected or empty text');
                        }
                    }, 150); // Increased delay to ensure undo completes
                } else {
                    console.log('Threadly: Not in text input, skipping feedback');
                }
            }
        }

        // Setup the handler
        setupCtrlZHandler();
        
        // Additional fallback: Listen for input events to detect when user is typing
        let lastTypedText = '';
        let lastTypedElement = null;
        
        document.addEventListener('input', (e) => {
            if (e.target && (
                e.target.tagName === 'TEXTAREA' || 
                e.target.tagName === 'INPUT' || 
                e.target.contentEditable === 'true' ||
                e.target.isContentEditable ||
                e.target.getAttribute('contenteditable') === 'true'
            )) {
                lastTypedText = e.target.value || e.target.textContent || e.target.innerText || '';
                lastTypedElement = e.target;
                console.log('Threadly: Text input detected, storing:', lastTypedText.substring(0, 50));
            }
        });
        
        // Fallback Ctrl+Z handler that uses stored text
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                // If the main handler didn't work, try fallback
                setTimeout(() => {
                    const activeElement = document.activeElement;
                    const currentText = activeElement.value || activeElement.textContent || activeElement.innerText || '';
                    
                    // Check if we have a stored text that's different from current
                    if (lastTypedElement === activeElement && 
                        lastTypedText && 
                        lastTypedText !== currentText && 
                        currentText.trim() !== '') {
                        
                        console.log('Threadly: Fallback handler triggered');
                        console.log('Threadly: Stored text:', lastTypedText.substring(0, 50));
                        console.log('Threadly: Current text:', currentText.substring(0, 50));
                        
                        // Show simple feedback popup as fallback
                        showCategoryFeedbackPopup(currentText, activeElement);
                    }
                }, 200);
            }
        });
        
        // Re-setup handler when new content is loaded (for SPAs)
        const observer = new MutationObserver((mutations) => {
            let shouldReSetup = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if new text inputs were added
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const textInputs = node.querySelectorAll ? node.querySelectorAll('input, textarea, [contenteditable]') : [];
                            if (textInputs.length > 0) {
                                shouldReSetup = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldReSetup) {
                console.log('Threadly: New text inputs detected, re-setting up Ctrl+Z handler');
                setupCtrlZHandler();
            }
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        document.addEventListener('click', handleClickOutside);
    }
    
    function handleClickOutside(e) {
        console.log('Threadly: handleClickOutside called');
        console.log('Threadly: panel.contains(e.target):', panel.contains(e.target));
        console.log('Threadly: isInCollectionsView:', isInCollectionsView);
        console.log('Threadly: savedButtonActive:', savedButtonActive);
        console.log('Threadly: e.target:', e.target);
        
        // Don't close panel if we're in collections view (SAVED state)
        // Also don't close if clicking on navigation dots
        // Also don't close if SAVED button is active
        if (panel.classList.contains('threadly-expanded') && 
            !panel.contains(e.target) && 
            !isInCollectionsView &&
            !savedButtonActive &&
            !e.target.closest('#threadly-scroll-indicator')) {
            console.log('Threadly: handleClickOutside - calling togglePanel(false)');
            togglePanel(false);
        } else {
            console.log('Threadly: handleClickOutside - not closing panel due to conditions');
        }
    }

    function togglePanel(expand) {
        console.log('Threadly: togglePanel called with expand:', expand);
        console.log('Threadly: Current savedButtonActive:', savedButtonActive);
        console.log('Threadly: Current isInCollectionsView:', isInCollectionsView);
        
        if (expand) {
            const panelRect = panel.getBoundingClientRect();
            const newTop = panelRect.top;
            panel.style.top = `${newTop}px`;
            panel.style.bottom = 'auto';
            panel.classList.add('threadly-expanded');
            
            
            setTimeout(async () => {
                await updateAndSaveConversation();
            }, 300);
        } else {
            console.log('Threadly: Closing panel - this should not happen when SAVED button is active');
            panel.classList.remove('threadly-expanded');
            panel.style.top = '10vh';
            panel.style.bottom = 'auto';
            
            
            // Clear message list when closing to prevent text size issues
            if (messageList) {
                messageList.innerHTML = '';
            }
            
            // Reset collections view flag when closing
            isInCollectionsView = false;
        }
    }

    // --- Enhanced Storage Functions --- //
    function getStorageKey() {
        const key = `threadly_${currentPlatformId}_${window.location.pathname}`;
        return key;
    }

    function getFavoritesStorageKey() {
        // Global favorites storage across all platforms and chats
        const key = `threadly_global_favorites`;
        console.log('Threadly: Global favorites storage key:', key);
        return key;
    }

    function getCollectionsStorageKey() {
        // Global collections storage across all platforms
        const key = `threadly_global_collections`;
        console.log('Threadly: Global collections storage key:', key);
        return key;
    }

    async function saveMessagesToStorage(messages) {
        try {
            const key = getStorageKey();
            const storableMessages = messages.map(msg => ({ 
                id: msg.id, // Preserve the message ID
                content: msg.content,
                timestamp: Date.now(),
                role: msg.role,
                isFavorited: msg.isFavorited || false,
                collectionIds: msg.collectionIds || [], // Use collectionIds array instead of collectionId
                platform: currentPlatformId // Add platform information
            }));
            
            if (storableMessages.length > 0) {
                await chrome.storage.local.set({ [key]: storableMessages });
            }
        } catch (error) {
            console.error('Threadly: Storage save error:', error);
        }
    }

    async function saveFavoritesToStorage(favorites) {
        try {
            const key = getFavoritesStorageKey();
            await chrome.storage.local.set({ [key]: favorites });
            console.log('Threadly: Saved', favorites.length, 'global favorites');
        } catch (error) {
            console.error('Threadly: Favorites storage save error:', error);
        }
    }

    async function saveCollectionsToStorage(collections) {
        try {
            const key = getCollectionsStorageKey();
            await chrome.storage.local.set({ [key]: collections });
            console.log('Threadly: Saved', collections.length, 'global collections');
        } catch (error) {
            console.error('Threadly: Collections storage save error:', error);
        }
    }

    async function loadMessagesFromStorage() {
        try {
            const key = getStorageKey();
            const data = await chrome.storage.local.get(key);
            const messages = data[key] || [];
            return messages;
        } catch (error) {
            console.error('Threadly: Storage load error:', error);
            return [];
        }
    }

    async function loadFavoritesFromStorage() {
        try {
            const key = getFavoritesStorageKey();
            const data = await chrome.storage.local.get(key);
            const favorites = data[key] || [];
            console.log('Threadly: Loaded', favorites.length, 'global favorites');
            return favorites;
        } catch (error) {
            console.error('Threadly: Favorites storage load error:', error);
            return [];
        }
    }

    async function loadCollectionsFromStorage() {
        try {
            const key = getCollectionsStorageKey();
            const data = await chrome.storage.local.get(key);
            const collections = data[key] || [];
            console.log('Threadly: Loaded', collections.length, 'global collections');
            return collections;
        } catch (error) {
            console.error('Threadly: Collections storage load error:', error);
            return [];
        }
    }

    // Load all messages from all platforms for global collection access (optimized)
    async function loadAllMessagesFromAllPlatforms() {
        try {
            const allMessages = [];
            
            // Get all storage keys
            const allData = await chrome.storage.local.get(null);
            
            // Filter for message storage keys (threadly_platform_pathname format)
            for (const [key, value] of Object.entries(allData)) {
                if (key.startsWith('threadly_') && key.includes('_/') && Array.isArray(value)) {
                    // This is a message storage key
                    const messages = value;
                    
                    // Extract platform from storage key and add to messages
                    const platformFromKey = key.split('_')[1]; // Extract platform from threadly_platform_pathname
                    
                    const messagesWithPlatform = messages.map(msg => ({
                        ...msg,
                        platform: msg.platform || platformFromKey, // Use stored platform or extract from key
                        originalStorageKey: key // Preserve the original storage key for saving back
                    }));
                    
                    allMessages.push(...messagesWithPlatform);
                }
            }
            
            return allMessages;
        } catch (error) {
            console.error('Threadly: Error loading all platform messages:', error);
            return [];
        }
    }

    // --- ChatGPT-Specific Extraction --- //
    function extractChatGPTConversation() {
        console.log('Threadly: ChatGPT AI response extraction starting...');
        const extracted = [];
        
        // Updated selectors for current ChatGPT structure
        const userSelector = 'div[data-message-author-role="user"] .whitespace-pre-wrap, div[data-message-author-role="user"] div[class*="prose"], div[data-message-author-role="user"] .text-base';
        const assistantSelector = 'div[data-message-author-role="assistant"] .whitespace-pre-wrap, div[data-message-author-role="assistant"] div[class*="prose"], div[data-message-author-role="assistant"] .text-base';
        
        // Extract user messages
        const userElements = document.querySelectorAll(userSelector);
        console.log('Threadly: Found', userElements.length, 'user elements');
        
        userElements.forEach((userEl, index) => {
            let text = '';
            
            if (userEl.textContent) {
                text = userEl.textContent.trim();
            } else if (userEl.innerText) {
                text = userEl.innerText.trim();
            }
            
            if (text && text.length > 2) {
                extracted.push({
                    role: 'user',
                    content: text,
                    element: userEl
                });
                console.log('Threadly: Extracted user message', index + 1, ':', text.substring(0, 50) + '...');
            }
        });
        
        // Extract AI responses
        const aiElements = document.querySelectorAll(assistantSelector);
        console.log('Threadly: Found', aiElements.length, 'AI response elements');
        
        aiElements.forEach((aiEl, index) => {
            let text = '';
            
            if (aiEl.textContent) {
                text = aiEl.textContent.trim();
            } else if (aiEl.innerText) {
                text = aiEl.innerText.trim();
            }
            
            if (text && text.length > 2) {
                extracted.push({
                    role: 'assistant',
                    content: text,
                    element: aiEl
                });
                console.log('Threadly: Extracted AI message', index + 1, ':', text.substring(0, 50) + '...');
            }
        });
        
        console.log('Threadly: ChatGPT AI response successfully extracted!');
        console.log('Threadly: extractConversation returning', extracted.length, 'messages');
        
        // Count user vs assistant messages
        const userMessages = extracted.filter(m => m.role === 'user');
        const assistantMessages = extracted.filter(m => m.role === 'assistant');
        
        console.log('Threadly: - User messages:', userMessages.length, 'Assistant messages:', assistantMessages.length);
        console.log('Threadly: ChatGPT extraction summary:');
        console.log('  - Total messages extracted:', extracted.length);
        console.log('  - User messages:', userMessages.length);
        console.log('  - AI responses:', assistantMessages.length);
        
        if (assistantMessages.length > 0) {
            console.log('  - ✅ AI responses successfully extracted');
        } else {
            console.log('  - ❌ No AI responses found');
        }
        
        return extracted;
    }

    // --- Enhanced Chat Extraction --- //
    function extractConversation() {
        // Use ChatGPT-specific extraction for ChatGPT
        if (currentPlatformId === 'chatgpt') {
            return extractChatGPTConversation();
        }
        
        const config = PLATFORM_CONFIG[currentPlatformId];
        const extracted = [];
        
        if (!config.userSelector) {
            console.log('Threadly: No user selector for platform:', currentPlatformId);
            return [];
        }

        // Try multiple selectors (comma-separated)
        const selectors = config.userSelector.split(',').map(s => s.trim());
        
        for (const selector of selectors) {
            try {
                const userElements = document.querySelectorAll(selector);
                
                userElements.forEach((userEl, index) => {
                    let text = '';
                    
                    // Special handling for scrollbar buttons
                    if (userEl.tagName === 'BUTTON' && userEl.id && userEl.id.startsWith('scrollbar-item-')) {
                        // Extract text from aria-label for scrollbar buttons
                        text = userEl.getAttribute('aria-label') || '';
                    } else {
                        // Try different text extraction methods for regular elements
                        if (userEl.textContent) {
                            text = userEl.textContent.trim();
                        } else if (userEl.innerText) {
                            text = userEl.innerText.trim();
                        } else if (userEl.value) {
                            text = userEl.value.trim();
                        }
                    }
                    
                    if (text && text.length > 2) { // Minimum length check
                        // AI Studio specific filtering: improved for user messages
                        if (currentPlatformId === 'ai-studio') {
                            // Special handling for scrollbar buttons
                            if (userEl.tagName === 'BUTTON' && userEl.id && userEl.id.startsWith('scrollbar-item-')) {
                                // Check if this looks like a user message
                                const isUserMessage = text.includes('make me a') || 
                                                    text.includes('hey') || 
                                                    text.includes('hello') ||
                                                    text.includes('hi') ||
                                                    text.includes('can you') ||
                                                    text.includes('please') ||
                                                    text.includes('help me') ||
                                                    text.includes('I need') ||
                                                    text.includes('I want');
                                
                                if (!isUserMessage) {
                                    return; // Skip this element - it's not a user message
                                }
                                
                                // Clean up the aria-label content
                                text = text.replace(/^make me a\s*/i, '');
                                text = text.replace(/\s*\.\.\.$/, '');
                                text = text.trim();
                                
                                if (text.length < 2) {
                                    return; // Skip if too short after cleaning
                                }
                                
                                // Skip the regular AI Studio filtering for scrollbar buttons
                            } else {
                            // Skip if text is too short
                            if (text.length < 10) {
                                return; // Skip this element
                            }
                            
                            // Skip experimental thoughts and processing messages
                            const blocklist = [
                                'Model Thoughts', 'experimental', 'Auto Understanding', 'Auto Exploring',
                                'Auto Clarifying', 'Auto Formulating', 'Auto Evaluating', 'Auto Crafting',
                                'Auto Analyzing', 'Generating response', 'Searching', 'Processing',
                                'processing', 'thinking'
                            ];
                            
                            if (blocklist.some(keyword => text.includes(keyword))) {
                                return; // Skip this element
                            }
                            
                            // Skip very short messages that are just UI elements
                            if (text.length < 100 && (text.includes('edit') || text.includes('more_vert'))) {
                                return; // Skip this element
                            }
                            
                            // For AI Studio, only extract if it contains "User" (user messages)
                            // But skip if it's just "editmore_vert" or other UI elements
                            if (!text.includes('User') && !text.includes('user')) {
                                return; // Skip this element - it's not a user message
                            }
                            
                            // Clean up user message content
                            text = text.replace(/^editmore_vert/, '').replace(/^User/, '').trim();
                            
                            // Skip if it's just UI elements
                            if (text.includes('editmore_vert') && text.length < 50) {
                                    return; // Skip this element
                                }
                                
                            // Skip if it's an AI response (contains "Model Thoughts" or "Of course")
                            if (text.includes('Model Thoughts') || text.includes('Of course')) {
                                return; // Skip this element - it's an AI response
                            }
                            } // End of else block for non-scrollbar elements
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
                        
                        // Filter for Perplexity: minimal filtering since selectors are now precise
                        if (currentPlatformId === 'perplexity') {
                            // Skip if text is too short (likely UI elements)
                            if (text.length < 3) {
                                return; // Skip this element
                            }
                            
                            // Skip if it looks like HTML/XML markup
                            if (text.includes('<') && text.includes('>')) {
                                return; // Skip this element
                            }
                        }
                        
                        // Extracted user message
                        extracted.push({
                            role: 'user',
                            content: text,
                            element: userEl
                        });
                        console.log('Threadly: Extracted user message:', text.substring(0, 50) + '...', 'element:', userEl.tagName, userEl.className);
                    }
                });
                
                // Continue trying other selectors to find all messages
                // Don't break here as we want to capture all user messages
            } catch (error) {
                console.warn('Threadly: Error with selector', selector, ':', error);
            }
        }
        
        // Also extract AI responses if available
        let aiSelectors = '';
        
        // Platform-specific AI selectors
        if (currentPlatformId === 'chatgpt') {
            aiSelectors = 'main div[data-message-author-role="assistant"] .whitespace-pre-wrap, main div[data-message-author-role="assistant"] div[class*="prose"], main div[data-message-author-role="assistant"] .text-base, main div[data-message-author-role="assistant"] div[class*="markdown"], main div[data-message-author-role="assistant"] p, main div[data-message-author-role="assistant"] span, main div[data-message-author-role="assistant"] div[class*="message"], main div[data-message-author-role="assistant"] div[class*="content"]';
        } else if (currentPlatformId === 'claude') {
            aiSelectors = 'div[data-testid="chat-assistant-message-content"], div[data-testid="assistant-message"], .assistant-message, [data-role="assistant"], div[class*="assistant"], .claude-response, div[class*="claude"], div[class*="response"]';
        } else if (currentPlatformId === 'gemini') {
            aiSelectors = '.assistant-message, [data-role="assistant"], .ai-response, div[class*="assistant"] p, .gemini-response, div[class*="gemini"], div[class*="response"], .response-text, div[class*="answer"], .ai-answer';
        } else if (currentPlatformId === 'ai-studio') {
            // Target AI responses - they are in model-prompt-container with ms-cmark-node WITHOUT user-chunk class
            // The actual text is in span.ng-star-inserted elements
            aiSelectors = '.model-prompt-container ms-cmark-node:not(.user-chunk) span.ng-star-inserted';
        } else if (currentPlatformId === 'copilot') {
            aiSelectors = '.assistant-message, [data-role="assistant"], .ai-response, .copilot-response, div[class*="assistant"], div[class*="response"], .response-text, div[class*="answer"]';
        } else if (currentPlatformId === 'perplexity') {
            // Target AI responses - they are in div elements with prose class
            aiSelectors = 'div[class*="prose"]';
        } else if (currentPlatformId === 'grok') {
            aiSelectors = '.assistant-message, [data-role="assistant"], .ai-response';
        } else {
            aiSelectors = 'main div[data-message-author-role="assistant"] .whitespace-pre-wrap, main div[data-message-author-role="assistant"] div[class*="prose"], main div[data-message-author-role="assistant"] div[class*="markdown"], main div[data-message-author-role="assistant"] p, main div[data-message-author-role="assistant"] span, .assistant-message, .ai-response';
        }
        
        try {
            console.log('Threadly: AI Studio - Trying AI selector:', aiSelectors);
            const aiElements = document.querySelectorAll(aiSelectors);
            console.log(`Threadly: AI Studio - AI selector found ${aiElements.length} elements`);
            
            aiElements.forEach((aiEl, index) => {
                let text = '';
                
                if (aiEl.textContent) {
                    text = aiEl.textContent.trim();
                } else if (aiEl.innerText) {
                    text = aiEl.innerText.trim();
                }
                
                if (text && text.length > 2) {
                    // Debug logging for ChatGPT
                    if (currentPlatformId === 'chatgpt') {
                        console.log(`Threadly: ChatGPT AI element ${index + 1}: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
                    }
                    
                    // For AI Studio, improved filtering
                    if (currentPlatformId === 'ai-studio') {
                        // Skip if text is too short
                        if (text.length < 15) {
                            return; // Skip this element
                        }
                        
                        // Skip experimental thoughts and processing messages
                        const blocklist = [
                            'Model Thoughts', 'experimental', 'Auto Understanding', 'Auto Exploring',
                            'Auto Clarifying', 'Auto Formulating', 'Auto Evaluating', 'Auto Crafting',
                            'Auto Analyzing', 'Generating response', 'Searching', 'Processing',
                            'processing', 'thinking'
                        ];
                        
                        if (blocklist.some(keyword => text.includes(keyword))) {
                            return; // Skip this element
                        }
                        
                        // Skip very short messages that are just UI elements
                        if (text.length < 100 && (text.includes('edit') || text.includes('more_vert'))) {
                                return; // Skip this element
                            }
                            
                        // Skip very short fragments that are likely UI elements
                        if (text.length < 50 && (text.includes('code') || text.includes('JavaScript') || text.includes('download'))) {
                                return; // Skip this element
                            }
                            
                        // Clean up AI message content
                        text = text.replace(/^editmore_vert/, '').replace(/^more_vert/, '').replace(/thumb_up$/, '').replace(/thumb_down$/, '').trim();
                            
                        // Skip if it looks like HTML/XML markup
                        if (text.includes('<') && text.includes('>')) {
                                return; // Skip this element
                            }
                            
                        // For AI Studio, skip if it contains "User" at the beginning (these are actual user messages)
                        if (text.startsWith('User') || text.startsWith('user') || text.includes('Usermake me a')) {
                            return; // Skip this element - it's a user message
                        }
                        
                        // Skip if it's just UI elements
                        if (text.includes('editmore_vert') && text.length < 50) {
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
                    
                    // For Perplexity, minimal filtering since selectors are now precise
                    if (currentPlatformId === 'perplexity') {
                        // Skip if text is too short (likely UI elements)
                        if (text.length < 10) {
                            return; // Skip this element
                        }
                        
                        // Skip if it looks like HTML/XML markup
                        if (text.includes('<') && text.includes('>')) {
                            return; // Skip this element
                        }
                    }
                    
                    // Extracted AI message
                    extracted.push({
                        role: 'assistant',
                        content: text,
                        element: aiEl
                    });
                    console.log('Threadly: Extracted AI message:', text.substring(0, 50) + '...');
                    
                    // Additional debugging for ChatGPT
                    if (currentPlatformId === 'chatgpt') {
                        console.log('Threadly: ChatGPT AI response successfully extracted!');
                    }
                }
            });
            
            // Enhanced fallback for AI Studio using improved extraction logic
            if (currentPlatformId === 'ai-studio') {
                console.log('Threadly: Trying AI Studio fallback with improved extraction...');
                
                // Use the more accurate extraction logic for AI Studio
                const chatTurns = document.querySelectorAll('ms-chat-turn');
                
                if (chatTurns.length === 0) {
                    console.log('Threadly: No ms-chat-turn elements found for AI Studio');
                    return;
                }

                console.log(`Threadly: Found ${chatTurns.length} message turns for AI Studio`);

                chatTurns.forEach((turnEl, index) => {
                    let role = null;
                    let text = '';

                    // 1. Check for a User turn by finding the specific container
                    const userContainer = turnEl.querySelector('div[data-turn-role="User"]');
                    if (userContainer) {
                        role = 'user';
                        // The user's text is within the <ms-cmark-node> with the 'user-chunk' class
                        const userChunk = userContainer.querySelector('ms-cmark-node.user-chunk');
                        if (userChunk) {
                            text = userChunk.innerText.trim();
                        }
            } else {
                        // 2. If not a user turn, check for a Model (AI) turn
                        const modelContainer = turnEl.querySelector('div[data-turn-role="Model"]');
                        if (modelContainer) {
                            role = 'assistant';
                            // The AI's final response is in a <ms-text-chunk> that is a *direct child*
                            // of <ms-prompt-chunk>. This is the key to ignoring the "Model Thoughts" section
                            const promptChunk = modelContainer.querySelector('ms-prompt-chunk');
                            if (promptChunk) {
                                // Using ':scope >' ensures we only get the direct child
                                const textChunk = promptChunk.querySelector(':scope > ms-text-chunk');
                                if (textChunk) {
                                    const cmarkNode = textChunk.querySelector('ms-cmark-node');
                                    if (cmarkNode) {
                                        text = cmarkNode.innerText.trim();
                                    }
                                }
                            }
                        }
                    }

                    if (role && text && text.length > 0) {
                        // Clean up the text content
                        let cleanContent = text;
                        
                        // Remove UI elements and clean up the content
                        cleanContent = cleanContent.replace(/^editmore_vert/, '').replace(/^more_vert/, '').replace(/thumb_up$/, '').replace(/thumb_down$/, '').trim();
                        
                        // Skip if text is too short after cleaning
                        if (cleanContent.length < 2) {
                                return;
                            }
                            
                        if (cleanContent.length > 0) {
                            extracted.push({
                                role: role,
                                content: cleanContent,
                                element: turnEl
                            });
                            console.log(`Threadly: Extracted ${role} message from AI Studio:`, cleanContent.substring(0, 50) + '...');
                        }
                    } else {
                        console.warn(`Threadly: Could not extract text from AI Studio turn ${index + 1}`);
                    }
                });
                
                // Also check scrollbar navigation elements for user messages
                console.log('Threadly: Checking scrollbar navigation elements...');
                const scrollbarButtons = document.querySelectorAll('button[id^="scrollbar-item-"]');
                scrollbarButtons.forEach(button => {
                    const ariaLabel = button.getAttribute('aria-label') || '';
                    if (ariaLabel && ariaLabel.length > 0) {
                        // Check if this looks like a user message
                        const isUserMessage = ariaLabel.includes('make me a') || 
                                            ariaLabel.includes('hey') || 
                                            ariaLabel.includes('hello') ||
                                            ariaLabel.includes('hi') ||
                                            ariaLabel.includes('can you') ||
                                            ariaLabel.includes('please') ||
                                            ariaLabel.includes('help me') ||
                                            ariaLabel.includes('I need') ||
                                            ariaLabel.includes('I want');
                        
                        if (isUserMessage) {
                            // Clean up the aria-label content
                            let cleanContent = ariaLabel;
                            // Remove common prefixes and suffixes
                            cleanContent = cleanContent.replace(/^make me a\s*/i, '');
                            cleanContent = cleanContent.replace(/\s*\.\.\.$/, '');
                            cleanContent = cleanContent.trim();
                            
                            if (cleanContent.length > 0) {
                                extracted.push({
                                    role: 'user',
                                    content: cleanContent,
                                    element: button
                                });
                                console.log(`Threadly: Extracted user message from scrollbar:`, cleanContent);
                            }
                        }
                    }
                });
                
                // Comprehensive fallback: look for any text content that might be messages
                console.log('Threadly: Trying comprehensive fallback extraction...');
                const allElements = document.querySelectorAll('*');
                const textElements = Array.from(allElements).filter(el => {
                    const text = el.textContent?.trim() || '';
                    return text.length > 5 && text.length < 1000 && 
                           !text.includes('<') && 
                           !text.includes('>') &&
                           !text.includes('{') &&
                           !text.includes('}') &&
                           !text.includes('Model Thoughts') &&
                           !text.includes('experimental') &&
                           !text.includes('Auto Understanding') &&
                           !text.includes('Auto Exploring') &&
                           !text.includes('Auto Clarifying') &&
                           !text.includes('Auto Formulating') &&
                           !text.includes('Auto Evaluating') &&
                           !text.includes('Auto Crafting') &&
                           !text.includes('Auto Analyzing');
                });
                
                textElements.forEach(el => {
                    const text = el.textContent?.trim() || '';
                    
                    // Check if this looks like a user message
                    const isUserMessage = text.toLowerCase().includes('hey') || 
                                        text.toLowerCase().includes('hello') ||
                                        text.toLowerCase().includes('hi') ||
                                        text.toLowerCase().includes('make me a') ||
                                        text.toLowerCase().includes('can you') ||
                                        text.toLowerCase().includes('please') ||
                                        text.toLowerCase().includes('help me') ||
                                        text.toLowerCase().includes('i need') ||
                                        text.toLowerCase().includes('i want') ||
                                        text.startsWith('User') ||
                                        text.startsWith('user');
                    
                    // Check if this looks like an AI message
                    const isAIMessage = text.toLowerCase().includes('how can i help') || 
                                      text.toLowerCase().includes('threadly codebase') ||
                                      text.toLowerCase().includes('dive into') ||
                                      text.toLowerCase().includes('questions about') ||
                                      text.toLowerCase().includes('of course') ||
                                      text.toLowerCase().includes('i can help') ||
                                      text.toLowerCase().includes('let me help') ||
                                      (text.length > 100 && !isUserMessage);
                    
                    if (isUserMessage && text.length < 200) {
                        // Clean up user message
                        let cleanContent = text;
                        cleanContent = cleanContent.replace(/^User/, '').replace(/^user/, '').trim();
                        cleanContent = cleanContent.replace(/^make me a\s*/i, '').trim();
                        
                        if (cleanContent.length > 0) {
                                extracted.push({
                                    role: 'user',
                                content: cleanContent,
                                    element: el
                                });
                            console.log(`Threadly: Extracted user message from comprehensive fallback:`, cleanContent);
                        }
                    } else if (isAIMessage && text.length > 50) {
                        // Clean up AI message
                        let cleanContent = text;
                        cleanContent = cleanContent.replace(/^editmore_vert/, '').replace(/^more_vert/, '').replace(/thumb_up$/, '').replace(/thumb_down$/, '').trim();
                        
                        if (cleanContent.length > 0) {
                                extracted.push({
                                    role: 'assistant',
                                content: cleanContent,
                                    element: el
                                });
                            console.log(`Threadly: Extracted AI message from comprehensive fallback:`, cleanContent.substring(0, 50) + '...');
                            }
                        }
                    });
                    }
                } catch (error) {
            console.warn('Threadly: Error extracting AI responses:', error);
        }
        
        // Perplexity-specific fallback if no messages found
        if (extracted.length === 0 && currentPlatformId === 'perplexity') {
            console.log('Threadly: Trying Perplexity fallback extraction...');
            
            // Try to find any text content that might be messages
            const allElements = document.querySelectorAll('div, p, span, article, section');
            allElements.forEach(el => {
                const text = el.textContent?.trim() || '';
                if (text.length > 10 && text.length < 2000) {
                    // Skip if it's likely UI text
                    const uiPatterns = ['ask anything', 'search', 'voice mode', 'sources', 'model', 'settings', 'menu', 'button', 'submit', 'send', 'clear', 'copy', 'share', 'bookmark', 'like', 'dislike'];
                    const isUIPattern = uiPatterns.some(pattern => 
                        text.toLowerCase().includes(pattern.toLowerCase())
                    );
                    
                    if (!isUIPattern && !text.includes('<') && !text.includes('>')) {
                        // Try to determine if it's a user message or AI response
                        const isLikelyUserMessage = text.length < 200 && !text.includes('.') && !text.includes('!') && !text.includes('?');
                        const isLikelyAIMessage = text.length > 50 && (text.includes('.') || text.includes('!') || text.includes('?'));
                        
                        if (isLikelyUserMessage) {
                            extracted.push({
                                role: 'user',
                                content: text,
                                element: el
                            });
                            console.log('Threadly: Fallback extracted user message:', text.substring(0, 50) + '...');
                        } else if (isLikelyAIMessage) {
                            extracted.push({
                                role: 'assistant',
                                content: text,
                                element: el
                            });
                            console.log('Threadly: Fallback extracted AI message:', text.substring(0, 50) + '...');
                        }
                    }
                }
            });
        }
        
        // Debug elements removed for cleaner console
        
        console.log('Threadly: extractConversation returning', extracted.length, 'messages');
        const userCount = extracted.filter(msg => msg.role === 'user').length;
        const assistantCount = extracted.filter(msg => msg.role === 'assistant').length;
        console.log('Threadly: - User messages:', userCount, 'Assistant messages:', assistantCount);
        
        // Additional debugging for ChatGPT
        if (currentPlatformId === 'chatgpt') {
            console.log('Threadly: ChatGPT extraction summary:');
            console.log('  - Total messages extracted:', extracted.length);
            console.log('  - User messages:', userCount);
            console.log('  - AI responses:', assistantCount);
            if (assistantCount === 0) {
                console.log('  - ⚠️  No AI responses found - this may indicate a selector issue');
            } else {
                console.log('  - ✅ AI responses successfully extracted');
            }
        }
        
        // Additional debugging for Perplexity (reduced logging for performance)
        if (currentPlatformId === 'perplexity') {
            console.log('Threadly: Perplexity extraction summary:');
            console.log('Threadly: - User messages:', userCount, 'AI messages:', assistantCount);
            
            // Only log detailed info if there are issues
            if (extracted.length === 0) {
                console.log('Threadly: - No messages extracted, checking selectors...');
                const userElements = document.querySelectorAll(config.userSelector);
                const aiElements = document.querySelectorAll(aiSelectors);
                console.log('Threadly: - User elements found:', userElements.length);
                console.log('Threadly: - AI elements found:', aiElements.length);
            }
        }
        
        return extracted;
    }

    // --- Enhanced Rendering --- //
    function renderMessages(messagesToRender) {
        console.log('Threadly: renderMessages called with', messagesToRender.length, 'messages, isInCollectionsView:', isInCollectionsView);
        
        const isInInputMode = document.querySelector('#collectionNameInput');
        if (isInInputMode && isInCollectionsView) {
            console.log('Threadly: renderMessages - in input mode, keeping collections view');
            return;
        }
        
        if (!messageList) return;
        
        // For Perplexity loading page or homepage, ensure dots are visible even with no messages
        if (currentPlatformId === 'perplexity' && (isPerplexityLoadingPage() || isPerplexityHomepage(location.href))) {
            console.log('Threadly: On Perplexity loading page or homepage in renderMessages, ensuring navigation dots are visible');
            updateScrollIndicator([]);
        } else if (currentPlatformId === 'chatgpt' && isChatGPTDefaultPage()) {
            console.log('Threadly: On ChatGPT default page in renderMessages, ensuring navigation dots are visible but empty');
            updateScrollIndicator([]);
        } else {
            updateScrollIndicator(messagesToRender);
        }
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
            item.dataset.messageId = msg.id;
            
            // --- Styling and attribute logic (remains the same) ---
            if (msg.isFavorited) {
                item.classList.add('favorited');
                item.setAttribute('data-starred', 'true');
                let leftBorderColor;
                if (msg.originalPlatform && msg.originalPlatform !== currentPlatformId) {
                    const originalPlatformColors = {
                        'chatgpt': 'rgba(156, 163, 175, 0.8)',
                        'gemini': 'rgba(66, 133, 244, 0.8)',
                        'claude': 'rgba(255, 107, 53, 0.8)',
                        'ai-studio': 'rgba(66, 133, 244, 0.8)',
                        'perplexity': 'rgba(32, 178, 170, 0.8)',
                        'grok': 'rgba(31, 41, 55, 0.8)',
                        'copilot': 'rgba(0, 120, 212, 0.8)'
                    };
                    leftBorderColor = originalPlatformColors[msg.originalPlatform] || 'rgba(0, 191, 174, 0.8)';
                } else {
                    leftBorderColor = getPlatformHighlightColor().replace('0.2', '0.8');
                }
                item.style.borderLeft = `4px solid ${leftBorderColor}`;
            } else {
                item.setAttribute('data-starred', 'false');
                const platformAccentColor = getPlatformHighlightColor().replace('0.2', '0.8');
                item.style.borderLeft = `4px solid ${platformAccentColor}`;
            }
            
            const wordCount = msg.content.trim().split(/\s+/).length;
            const isLongMessage = wordCount > 10;
            const roleText = msg.role === 'user' ? `You (#${index + 1})` : `AI (#${index + 1})`;
            let platformIndicator = '';
            if (msg.isFavorited && msg.originalPlatform && msg.originalPlatform !== currentPlatformId) {
                const platformName = PLATFORM_CONFIG[msg.originalPlatform]?.name || msg.originalPlatform;
                platformIndicator = `<span class="threadly-platform-badge" data-original-platform="${msg.originalPlatform}">${platformName}</span>`;
            }
            const platformColor = getPlatformHighlightColor().replace('0.2', '0.8');
            
            item.innerHTML = `
                <div class="threadly-message-header">
                    <div class="threadly-message-left">
                        <div class="threadly-message-role" style="color: ${platformColor};">
                            ${roleText}
                            ${platformIndicator}
                        </div>
                    </div>
                    <div class="threadly-message-right">
                        <div class="threadly-message-checkbox-container" style="display: none;">
                            <input type="checkbox" class="threadly-message-checkbox" id="checkbox_${index}" data-message-id="${msg.id}">
                        </div>
                        <button class="threadly-star-btn ${msg.isFavorited ? 'starred' : ''}" title="${msg.isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
                            <span class="threadly-star-icon">${msg.isFavorited ? '★' : '☆'}</span>
                        </button>
                    </div>
                </div>
                <div class="threadly-message-text">${escapeHTML(msg.content)}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; gap: 8px;">
                    ${isLongMessage ? `<div class="threadly-read-more" style="color: ${platformColor}; cursor: pointer; font-size: 11px; font-weight: bold;">See More</div>` : '<div></div>'}
                    <div class="threadly-copy-btn" style="color: ${platformColor}; cursor: pointer; font-size: 11px; font-weight: 900; margin-left: auto;" title="Copy message to clipboard">
                        Copy
                    </div>
                </div>
            `;

            // ==================================================================
            // THE FIX STARTS HERE
            // ==================================================================

            // 1. Add a single, state-aware click listener to the entire item
            item.addEventListener('click', (e) => {
                // Prevent this listener from firing if a button/interactive element inside the item was clicked
                if (e.target.closest('button, input[type="checkbox"], .threadly-read-more, .threadly-copy-btn')) {
                    return;
                }

                if (isInSelectionMode) {
                    // If in selection mode, toggle the checkbox state
                    console.log('Threadly: Message item clicked in selection mode');
                    console.log('Threadly: Message ID:', msg.id);
                    console.log('Threadly: Current selectedMessageIds:', selectedMessageIds);
                    
                    const checkbox = item.querySelector('.threadly-message-checkbox');
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                        // Manually trigger the 'change' event to ensure our selection logic runs
                        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                        console.log('Threadly: Toggled checkbox and triggered change event');
                    }
                } else {
                    // If not in selection mode, perform the original scroll action
                    if (msg.element && document.body.contains(msg.element)) {
                        msg.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        const originalBg = msg.element.style.backgroundColor;
                        msg.element.style.transition = 'background-color 0.3s ease';
                        msg.element.style.backgroundColor = getPlatformHighlightColor();
                        setTimeout(() => {
                            msg.element.style.backgroundColor = originalBg;
                        }, 1500);
                    }
                }
            });

            // 2. Ensure clicks on interactive elements don't bubble up and trigger the item's main click listener
            const starBtn = item.querySelector('.threadly-star-btn');
            starBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(msg, index);
            });

            const checkbox = item.querySelector('.threadly-message-checkbox');
            if (checkbox) {
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation(); // Stop the click from bubbling to the parent `item`
                });
            }
            
            const copyBtn = item.querySelector('.threadly-copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    copyMessageToClipboard(msg.content);
                });
            }

            const readMoreBtn = item.querySelector('.threadly-read-more');
            if (readMoreBtn) {
                 setTimeout(() => {
                    const messageText = item.querySelector('.threadly-message-text');
                    const isActuallyTruncated = messageText.scrollHeight > messageText.clientHeight;
                    if (isActuallyTruncated) {
                        readMoreBtn.style.display = 'inline-block';
                        readMoreBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            messageText.classList.toggle('expanded');
                            readMoreBtn.textContent = messageText.classList.contains('expanded') ? 'See Less' : 'See More';
                        });
                    } else {
                        readMoreBtn.style.display = 'none';
                    }
                }, 10);
            }

            // Add long-press gesture for message actions (for YOU and AI states)
            let longPressTimer;
            item.addEventListener('mousedown', () => {
                longPressTimer = setTimeout(() => {
                    showMessageActionsOverlay(msg, null); // null collectionId for global messages
                }, 750);
            });
            
            item.addEventListener('mouseup', () => {
                clearTimeout(longPressTimer);
            });
            
            item.addEventListener('mouseleave', () => {
                clearTimeout(longPressTimer);
            });
            
            // ================================================================
            // THE FIX ENDS HERE (the rest of the original function is removed)
            // ================================================================

            fragment.appendChild(item);
        });
        messageList.appendChild(fragment);
        
        if (isInSelectionMode) {
            updateCheckboxStates();
        }
    }
    
    function toggleMessageType() {
        // This function is no longer needed - replaced by selectFilterState
        // Keeping for backward compatibility but it's not used
        selectFilterState('user');
    }

    function toggleFavoritesFilter() {
        // This function is no longer needed - replaced by selectFilterState
        // Keeping for backward compatibility but it's not used
        selectFilterState('favorites');
    }
    
    async function filterMessages(query, forceExitCollections = true) {
        console.log('Threadly: filterMessages called with query:', query, 'forceExitCollections:', forceExitCollections, 'isInCollectionsView:', isInCollectionsView);
        
        // For Perplexity, check if we're on the loading page or homepage and show empty state
        if (currentPlatformId === 'perplexity' && (isPerplexityLoadingPage() || isPerplexityHomepage(location.href))) {
            console.log('Threadly: On Perplexity loading page or homepage, showing empty state');
            if (messageList) {
                messageList.innerHTML = '<div class="threadly-empty-state">No conversation yet. Start a chat to see your messages here!</div>';
            }
            return;
        }
        
        // Check if we're in input mode (typing collection name) - if so, don't switch away from collections view
        const isInInputMode = document.querySelector('#collectionNameInput');
        if (isInInputMode && isInCollectionsView) {
            console.log('Threadly: filterMessages - in input mode, keeping collections view');
            return;
        }
        
        // If we're in collections view, return to main messages first (unless explicitly told not to)
        if (isInCollectionsView && forceExitCollections) {
            console.log('Threadly: filterMessages - exiting collections view');
            isInCollectionsView = false;
        }
        
        query = query.trim().toLowerCase();
        let filtered = !query ? allMessages : allMessages.filter(m => 
            m.content.toLowerCase().includes(query)
        );
        
        // Filter by message type based on toggle state
        if (messageFilterState === 'user') {
            filtered = filtered.filter(m => m.role === 'user');
            console.log('Threadly: Filtered to user messages:', filtered.length, 'out of', allMessages.length, 'total');
        } else if (messageFilterState === 'assistant') {
            filtered = filtered.filter(m => m.role === 'assistant');
            console.log('Threadly: Filtered to assistant messages:', filtered.length, 'out of', allMessages.length, 'total');
        } else if (messageFilterState === 'favorites') {
            // For favorites, we need to load and show all global favorites
            await loadAndShowAllFavorites();
            return; // Exit early as loadAndShowAllFavorites will handle rendering
        }
        
        console.log('Threadly: About to render', filtered.length, 'filtered messages');
        renderMessages(filtered);
    }

    async function loadAndShowAllFavorites() {
        try {
            const globalFavorites = await loadFavoritesFromStorage();
            
            if (globalFavorites.length === 0) {
                messageList.innerHTML = '<div class="threadly-empty-state">No favorited messages found. Star some messages to see them here!</div>';
                return;
            }
            
            // Load all messages from all platforms to match with favorites
            const allPlatformMessages = await loadAllMessagesFromAllPlatforms();
            
            // Create a display list of all global favorites, matching with actual message IDs
            const favoritesToShow = globalFavorites.map((fav, index) => {
                // Try to find the actual message in storage to get the real ID
                const actualMessage = allPlatformMessages.find(msg => 
                    msg.content === fav.content && 
                    msg.role === fav.role && 
                    msg.isFavorited === true
                );
                
                return {
                    id: actualMessage ? actualMessage.id : `global_fav_${index}`, // Use real ID if found
                    content: fav.content,
                    role: fav.role,
                    isFavorited: true,
                    originalPlatform: fav.platform,
                    chatPath: fav.chatPath,
                    timestamp: fav.timestamp,
                    element: null, // No element reference for cross-platform favorites
                    index: index
                };
            });
            
            // Apply search filter if there's a query
            const query = searchInput.value.trim().toLowerCase();
            let filteredFavorites = favoritesToShow;
            if (query) {
                filteredFavorites = favoritesToShow.filter(fav => 
                    fav.content.toLowerCase().includes(query)
                );
            }
            
            if (filteredFavorites.length === 0) {
                messageList.innerHTML = '<div class="threadly-empty-state">No favorited messages match your search.</div>';
                return;
            }
            
            // Render the global favorites
            renderGlobalFavorites(filteredFavorites);
            
        } catch (error) {
            console.error('Threadly: Error loading global favorites for display:', error);
            messageList.innerHTML = '<div class="threadly-empty-state">Error loading favorites. Please try again.</div>';
        }
    }

    function renderGlobalFavorites(favorites) {
        if (!messageList) return;
        
        // Clear existing content
        messageList.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        favorites.forEach((fav, index) => {
                    const item = document.createElement('div');
        item.className = 'threadly-message-item favorited';
        item.dataset.role = fav.role;
        item.dataset.messageId = fav.id || `global_fav_${index}`;
        item.setAttribute('data-starred', 'true');
        
        // Set left border color based on the original platform where message was pinned
        let leftBorderColor;
        if (fav.originalPlatform && fav.originalPlatform !== currentPlatformId) {
            // Use the original platform's accent color
            const originalPlatformColors = {
                'chatgpt': 'rgba(156, 163, 175, 0.8)',
                'gemini': 'rgba(66, 133, 244, 0.8)',
                'claude': 'rgba(255, 107, 53, 0.8)',
                'ai-studio': 'rgba(66, 133, 244, 0.8)',
                'perplexity': 'rgba(32, 178, 170, 0.8)',
                'grok': 'rgba(31, 41, 55, 0.8)',
                'copilot': 'rgba(0, 120, 212, 0.8)'
            };
            leftBorderColor = originalPlatformColors[fav.originalPlatform] || 'rgba(0, 191, 174, 0.8)';
        } else {
            // Use current platform's accent color
            leftBorderColor = getPlatformHighlightColor().replace('0.2', '0.8');
        }
        item.style.borderLeft = `4px solid ${leftBorderColor}`;
            
            // Get platform accent color (use original platform if available)
            const platformColor = fav.originalPlatform ? 
                getPlatformHighlightColor().replace('0.2', '0.8') : 
                getPlatformHighlightColor().replace('0.2', '0.8');
            
            // Check if message is longer than 10 words
            const wordCount = fav.content.trim().split(/\s+/).length;
            const isLongMessage = wordCount > 10;
            
            const roleText = fav.role === 'user' ? `You (#${index + 1})` : `AI (#${index + 1})`;
            
            // Always show platform badge for global favorites
            const platformName = PLATFORM_CONFIG[fav.originalPlatform]?.name || fav.originalPlatform;
            const platformIndicator = `<span class="threadly-platform-badge" data-original-platform="${fav.originalPlatform}">${platformName}</span>`;
            
            item.innerHTML = `
                <div class="threadly-message-header">
                    <div class="threadly-message-left">
                        <div class="threadly-message-role" style="color: ${platformColor};">
                            ${roleText}
                            ${platformIndicator}
                        </div>
                    </div>
                    <div class="threadly-message-right">
                        <div class="threadly-message-checkbox-container" style="display: none;">
                            <input type="checkbox" class="threadly-message-checkbox" id="global_checkbox_${index}" data-message-id="${fav.id}">
                        </div>
                        <button class="threadly-star-btn starred" title="Remove from favorites">
                            <span class="threadly-star-icon">★</span>
                        </button>
                    </div>
                </div>
                <div class="threadly-message-text">${escapeHTML(fav.content)}</div>
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 4px;
                    gap: 8px;
                ">
                    ${isLongMessage ? `<div class="threadly-read-more" style="color: ${platformColor}; cursor: pointer; font-size: 11px; font-weight: bold;">See More</div>` : '<div></div>'}
                    <div class="threadly-copy-btn" style="
                        color: ${platformColor};
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 900;
                        margin-left: auto;
                    " title="Copy message to clipboard">
                        Copy
                    </div>
                </div>
            `;

            // Add star button event listener for unstarring
            const starBtn = item.querySelector('.threadly-star-btn');
            starBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                unstarGlobalFavorite(fav);
            });

            // Check if text is actually truncated and only show "See More" when needed
            const messageText = item.querySelector('.threadly-message-text');
            const readMoreBtn = item.querySelector('.threadly-read-more');
            
            // Only proceed if readMoreBtn exists (i.e., when isLongMessage was true)
            if (readMoreBtn) {
                // Use setTimeout to ensure DOM is fully rendered before checking truncation
                setTimeout(() => {
                    // Check if the text is actually truncated (scrollHeight > clientHeight)
                    const isActuallyTruncated = messageText.scrollHeight > messageText.clientHeight;
                    
                    console.log('Threadly: Message truncation check - scrollHeight:', messageText.scrollHeight, 'clientHeight:', messageText.clientHeight, 'isTruncated:', isActuallyTruncated);
                    
                    if (isActuallyTruncated) {
                        // Show the "See More" button
                        readMoreBtn.style.display = 'inline-block';
                        
                        console.log('Threadly: Setting up read more for truncated message:', fav.content.substring(0, 50));
                        
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
                    } else {
                        // Hide the "See More" button if text is not truncated
                        readMoreBtn.style.display = 'none';
                        console.log('Threadly: Text not truncated, hiding See More button for message:', fav.content.substring(0, 50));
                    }
                }, 10);
            }

            // Add copy button event listener
            const copyBtn = item.querySelector('.threadly-copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    copyMessageToClipboard(fav.content);
                });
            }

            // Add long-press gesture for message actions (for FAV state)
            let longPressTimer;
            item.addEventListener('mousedown', () => {
                longPressTimer = setTimeout(() => {
                    showMessageActionsOverlay(fav, null); // null collectionId for global favorites
                }, 750);
            });
            
            item.addEventListener('mouseup', () => {
                clearTimeout(longPressTimer);
            });
            
            item.addEventListener('mouseleave', () => {
                clearTimeout(longPressTimer);
            });
            
            fragment.appendChild(item);
        });
        
        messageList.appendChild(fragment);
    }

    async function unstarGlobalFavorite(favorite) {
        try {
            // Load current global favorites
            const globalFavorites = await loadFavoritesFromStorage();
            
            // Remove the specific favorite
            const updatedFavorites = globalFavorites.filter(fav => 
                !(fav.content === favorite.content && fav.role === favorite.role)
            );
            
            // Save updated favorites
            await saveFavoritesToStorage(updatedFavorites);
            
            // Re-render the favorites view
            await loadAndShowAllFavorites();
            
            console.log('Threadly: Removed global favorite');
        } catch (error) {
            console.error('Threadly: Error removing global favorite:', error);
        }
    }

    // --- Filter State Management --- //
    async function selectFilterState(state) {
        // Don't allow state changes during assignment mode
        if (isAssigningMode) {
            console.log('Threadly: Blocking state change during assignment mode');
            return;
        }
        
        // Exit selection mode if active when changing states
        if (isInSelectionMode) {
            console.log('Threadly: Exiting selection mode due to state change');
            exitSelectionMode();
        }
        
        // If we're in collections view, return to main messages first
        if (isInCollectionsView) {
            isInCollectionsView = false;
        }
        
        messageFilterState = state;
        
        // Update the toggle segment position
        const currentToggleSegment = document.getElementById('threadly-toggle-segment');
        if (currentToggleSegment) {
            currentToggleSegment.classList.remove('user', 'assistant', 'fav', 'collection');
            currentToggleSegment.classList.add(state === 'user' ? 'user' : state === 'assistant' ? 'assistant' : state === 'favorites' ? 'fav' : 'collection');
        }
        
        // Update panel data-filter attribute for CSS targeting
        if (panel) {
            panel.setAttribute('data-filter', state);
        }
        
        // Update search input placeholder based on state
        if (searchInput) {
            if (state === 'favorites') {
                searchInput.placeholder = 'Search saved items...';
            } else if (state === 'user') {
                searchInput.placeholder = 'Search messages...';
            } else if (state === 'assistant') {
                searchInput.placeholder = 'Search AI responses...';
            }
        }
        
        // Update metaball wrapper state for consistent behavior
        const metaballWrapper = document.querySelector('.threadly-metaball-wrapper');
        if (metaballWrapper) {
            // Remove any existing state classes
            metaballWrapper.classList.remove('stateA');
            metaballWrapper.classList.add('stateB');
        }
        
        // Only filter messages if not in assignment mode
        if (!isAssigningMode) {
            await filterMessages(searchInput.value);
        }
        console.log('Threadly: Filter state changed to:', state);
    }

    // --- Favorites Management --- //
    async function toggleFavorite(message, index) {
        message.isFavorited = !message.isFavorited;
        
        // Update the message in allMessages array
        const messageIndex = allMessages.findIndex(m => 
            m.content === message.content && m.role === message.role
        );
        
        if (messageIndex !== -1) {
            allMessages[messageIndex].isFavorited = message.isFavorited;
        }
        
        // Save updated messages to local storage
        await saveMessagesToStorage(allMessages);
        
        // Update global favorites storage
        await updateGlobalFavorites();
        
        // Re-render to show updated star state
        // Don't exit collections view if we're currently in it
        if (!isInCollectionsView) {
            filterMessages(searchInput.value);
        }
        
        console.log('Threadly: Message', message.isFavorited ? 'favorited' : 'unfavorited');
    }

    async function updateGlobalFavorites() {
        try {
            // Load messages from storage
            const messages = await loadMessagesFromStorage();
            
            // Get all favorited messages from current messages
            const currentFavorites = messages.filter(m => m.isFavorited).map(m => ({
                content: m.content,
                role: m.role,
                platform: currentPlatformId,
                chatPath: window.location.pathname,
                timestamp: Date.now()
            }));
            
            // Load existing global favorites
            const existingFavorites = await loadFavoritesFromStorage();
            
            // Create a map of existing favorites by content+role for quick lookup
            const existingFavMap = new Map();
            existingFavorites.forEach(fav => {
                const key = `${fav.role}:${fav.content}`;
                existingFavMap.set(key, fav);
            });
            
            // Update or add current favorites
            currentFavorites.forEach(newFav => {
                const key = `${newFav.role}:${newFav.content}`;
                existingFavMap.set(key, newFav);
            });
            
            // Remove favorites that are no longer favorited in current messages
            const currentFavKeys = new Set(currentFavorites.map(f => `${f.role}:${f.content}`));
            const filteredFavorites = Array.from(existingFavMap.values()).filter(fav => {
                const key = `${fav.role}:${fav.content}`;
                if (fav.platform === currentPlatformId && fav.chatPath === window.location.pathname) {
                    // Only keep if it's still favorited in current context
                    return currentFavKeys.has(key);
                }
                // Keep favorites from other platforms/chats
                return true;
            });
            
            // Save updated global favorites
            await saveFavoritesToStorage(filteredFavorites);
            
            console.log('Threadly: Updated global favorites, total:', filteredFavorites.length);
        } catch (error) {
            console.error('Threadly: Error updating global favorites:', error);
        }
    }

    async function loadGlobalFavorites() {
        try {
            const globalFavorites = await loadFavoritesFromStorage();
            const messages = await loadMessagesFromStorage();
            
            // Mark current messages as favorited if they exist in global favorites
            globalFavorites.forEach(globalFav => {
                const matchingMessage = messages.find(m => 
                    m.content === globalFav.content && m.role === globalFav.role
                );
                
                if (matchingMessage) {
                    matchingMessage.isFavorited = true;
                    // Store platform info for display
                    matchingMessage.originalPlatform = globalFav.platform;
                }
            });
            
            // Loaded global favorites
        } catch (error) {
            console.error('Threadly: Error loading global favorites:', error);
        }
    }

    // --- Collections Management --- //
    async function getCollectionName(collectionId) {
        try {
            const collections = await loadCollectionsFromStorage();
            const collection = collections.find(c => c.id === collectionId);
            return collection ? collection.name : 'Unknown Collection';
        } catch (error) {
            console.error('Threadly: Error getting collection name:', error);
            return 'Unknown Collection';
        }
    }
    
    // --- Collections View Functions --- //
    async function renderCollectionsView(isAssigning = false) {
        try {
            console.log('Threadly: renderCollectionsView called with isAssigning:', isAssigning);
            
            // Exit selection mode if active when entering collections view, but NOT if we're in assignment mode
            if (isInSelectionMode && !isAssigning) {
                console.log('Threadly: Exiting selection mode due to entering collections view');
                exitSelectionMode();
            }
            
            // --- FIX START: Ensure the navbar is visible on the main collections screen ---
            const toggleBar = document.getElementById('threadly-toggle-bar');
            if (toggleBar) {
                toggleBar.style.display = 'flex'; // Use 'flex' as it's a flex container
            }
            // --- FIX END ---

            if (!messageList) {
                console.error('Threadly: messageList not found in renderCollectionsView');
                return;
            }
            
            // Set flag to indicate we're in collections view
            isInCollectionsView = true;
            console.log('Threadly: renderCollectionsView - Set isInCollectionsView to true');
            
            // Clear current collection ID since we're viewing the collections list
            currentCollectionId = null;
            console.log('Threadly: renderCollectionsView - Set currentCollectionId to null');
            
            // Ensure panel stays expanded when in collections view
            if (panel && !panel.classList.contains('threadly-expanded')) {
                panel.classList.add('threadly-expanded');
                console.log('Threadly: Ensured panel is expanded for collections view');
            }
            
            // Clear current content
            messageList.innerHTML = '';
            
            // Load collections from Chrome storage
            let collectionsFromStorage = [];
            try {
                collectionsFromStorage = await loadCollectionsFromStorage();
                console.log('Threadly: Collections from Chrome storage:', collectionsFromStorage);
                console.log('Threadly: Collections length:', collectionsFromStorage.length);
                
                if (collectionsFromStorage.length === 0) {
                    // Create a test collection if none exist
                    console.log('Threadly: No collections found, creating a test collection');
                    const testCollection = {
                        id: 'test_collection_1',
                        name: 'Test Collection',
                        createdAt: Date.now(),
                        platform: currentPlatformId,
                        messageIds: []
                    };
                    
                    try {
                        await saveCollectionsToStorage([testCollection]);
                        console.log('Threadly: Created test collection');
                        collectionsFromStorage = [testCollection];
                    } catch (error) {
                        console.error('Threadly: Error creating test collection:', error);
                        messageList.innerHTML = '<div class="threadly-empty-state">You have no saved collections.</div>';
                        return;
                    }
                }
            } catch (error) {
                console.error('Threadly: Error loading collections:', error);
                messageList.innerHTML = '<div class="threadly-empty-state">Error loading collections. Please try again.</div>';
                return;
            }
        
        const fragment = document.createDocumentFragment();
        collectionsFromStorage.forEach((collection, index) => {
            console.log('Threadly: Rendering collection:', collection);
            const collectionPill = document.createElement('div');
            collectionPill.className = 'threadly-collection-pill';
            collectionPill.dataset.collectionId = collection.id;
            
            // Apply platform-specific color instead of VIBGYOR
            const pillColor = getPlatformCollectionColor(index);
            collectionPill.style.backgroundColor = pillColor;
            collectionPill.style.borderColor = pillColor.replace('0.3', '0.6').replace('0.4', '0.7').replace('0.5', '0.8').replace('0.6', '0.9').replace('0.7', '1.0');
            collectionPill.style.setProperty('--pill-color-glow', pillColor.replace('0.3', '0.8').replace('0.4', '0.9').replace('0.5', '1.0').replace('0.6', '1.0').replace('0.7', '1.0'));
            
            // Truncate collection name to 21 characters
            const displayName = collection.name.length > 21 ? collection.name.substring(0, 21) + '...' : collection.name;
            
            // Show different content based on mode
            if (isAssigning) {
                // Assignment mode: show "+" to indicate adding messages
                collectionPill.innerHTML = `
                    <span class="collection-pill-name">${displayName}</span>
                    <span class="collection-pill-add">+</span>
                `;
                collectionPill.title = `Add selected messages to "${collection.name}"`;
            } else {
                // Normal mode: show ">" to indicate viewing messages
                collectionPill.innerHTML = `
                    <span class="collection-pill-name">${displayName}</span>
                    <span class="collection-pill-arrow">></span>
                `;
                collectionPill.title = `View messages in "${collection.name}"`;
            }
            
            // Add long-press gesture for collection actions
            let longPressTimer;
            collectionPill.addEventListener('mousedown', () => {
                longPressTimer = setTimeout(() => {
                    showCollectionActionsOverlay(collection);
                }, 750);
            });
            
            collectionPill.addEventListener('mouseup', () => {
                clearTimeout(longPressTimer);
            });
            
            collectionPill.addEventListener('mouseleave', () => {
                clearTimeout(longPressTimer);
            });
            
            // Click behavior depends on mode
            collectionPill.addEventListener('click', async (e) => {
                console.log('Threadly: Collection pill clicked:', collection.id, collection.name);
                console.log('Threadly: isAssigningMode:', isAssigningMode);
                console.log('Threadly: isAssigning parameter:', isAssigning);
                console.log('Threadly: selectionContext:', selectionContext);
                console.log('Threadly: Event target:', e.target);
                
                if (isAssigning) {
                    console.log('Threadly: Adding messages to collection:', collection.name);
                    console.log('Threadly: About to call assignMessagesToCollection for:', collection.name);
                    // Step 1: Assign the messages to the collection
                    const messagesAddedCount = await assignMessagesToCollection(collection.id);
                    console.log('Threadly: assignMessagesToCollection completed for:', collection.name, 'added', messagesAddedCount, 'messages');
                    
                    // Step 2: Call the new function to correctly reset the UI
                    console.log('Threadly: About to call finalizeAssignmentAndReturnToCollections for:', collection.name);
                    await finalizeAssignmentAndReturnToCollections(collection.id, messagesAddedCount);
                    console.log('Threadly: finalizeAssignmentAndReturnToCollections completed for:', collection.name);
                } else if (selectionContext === 'collections') {
                    // Collection selection mode: toggle selection instead of navigating
                    console.log('Threadly: Toggling collection selection:', collection.id);
                    const isSelected = selectedCollectionIds.includes(collection.id);
                    toggleCollectionSelection(collection.id, !isSelected);
                    
                    // Update visual state
                    if (!isSelected) {
                        collectionPill.classList.add('selected-for-deletion');
                    } else {
                        collectionPill.classList.remove('selected-for-deletion');
                    }
                } else {
                    console.log('Threadly: Viewing collection messages');
                    await renderMessagesForCollection(collection.id);
                }
            });
            
            fragment.appendChild(collectionPill);
        });
        
        messageList.appendChild(fragment);
        
        // Note: Bottom navbar is now handled by the main navbar morphing
        // No need to create separate bottom navbar here
        
        } catch (error) {
            console.error('Threadly: Error rendering collections view:', error);
            // Show error state
            if (messageList) {
                messageList.innerHTML = '<div class="threadly-empty-state">Error loading collections. Please try again.</div>';
            }
        }
    }
    
    

    
    // Function to show collection actions overlay
    function showCollectionActionsOverlay(collection) {
        const panel = document.getElementById('threadly-panel');
        if (!panel) return;
        
        // Store collection globally for use in transitions
        window.currentCollectionForActions = collection;
        
        // Add class to trigger background blur
        panel.classList.add('message-actions-active');
        
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'threadly-message-actions-overlay';
        // Truncate collection name for popup display
        const displayName = collection.name.length > 21 ? collection.name.substring(0, 21) + '...' : collection.name;
        
        modalOverlay.innerHTML = `
            <div id="threadly-message-actions-modal" class="collection-popup">
                <div class="threadly-message-preview">
                    <div class="threadly-message-role">Collection</div>
                    <div class="threadly-message-content">${displayName} (${collection.messageCount || 0} messages)</div>
                </div>
                <div class="threadly-action-list">
                    <button id="threadly-delete-collection-btn" class="action-list-item delete">Delete</button>
                    <button id="threadly-export-collection-btn" class="action-list-item export">Export as...</button>
                    <button id="threadly-cancel-collection-btn" class="action-list-item cancel">Cancel</button>
                </div>
            </div>
        `;
        
        // Add to panel
        panel.appendChild(modalOverlay);
        
        // Add click outside to close functionality
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeMessageActionsOverlay();
            }
        });
        
        // Add event listeners
        addCollectionEventListeners(collection);
    }

    // Function to add collection event listeners
    function addCollectionEventListeners(collection) {
        const deleteBtn = document.getElementById('threadly-delete-collection-btn');
        const exportBtn = document.getElementById('threadly-export-collection-btn');
        const cancelBtn = document.getElementById('threadly-cancel-collection-btn');
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                try {
                    await deleteCollection(collection.id);
                    closeMessageActionsOverlay();
                    // Re-render collections view to show the item is gone
                    renderCollectionsView();
                } catch (error) {
                    console.error('Threadly: Error deleting collection:', error);
                }
            });
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                showCollectionExportOptionsOverlay(collection);
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                closeMessageActionsOverlay();
            });
        }
    }

    // Function to show collection export options overlay
    function showCollectionExportOptionsOverlay(collection) {
        const panel = document.getElementById('threadly-panel');
        if (!panel) return;
        
        // Get the existing modal and transform it instead of creating new one
        const existingOverlay = document.getElementById('threadly-message-actions-overlay');
        if (existingOverlay) {
            const modal = existingOverlay.querySelector('#threadly-message-actions-modal');
            if (modal) {
                // Add contracting animation
                modal.classList.add('contracting');
                
                // Change content immediately and add appearing animation
                setTimeout(() => {
                    modal.innerHTML = `
                        <div class="threadly-export-list">
                            <button id="threadly-export-collection-pdf-btn" class="action-list-item export-format">PDF</button>
                            <button id="threadly-export-collection-markdown-btn" class="action-list-item export-format">Markdown</button>
                            <button id="threadly-export-collection-docx-btn" class="action-list-item export-format">DOCX</button>
                            <button id="threadly-cancel-collection-export-btn" class="action-list-item cancel">Cancel</button>
                        </div>
                    `;
                    
                    // Add event listeners
                    addCollectionExportEventListeners(collection);
                }, 50);
                
                // After contraction completes, remove contracting class and add export class
                setTimeout(() => {
                    modal.classList.remove('contracting');
                    modal.classList.add('export-mode');
                }, 400);
            }
        }
    }

    // Function to add collection export event listeners
    function addCollectionExportEventListeners(collection) {
        const pdfBtn = document.getElementById('threadly-export-collection-pdf-btn');
        const markdownBtn = document.getElementById('threadly-export-collection-markdown-btn');
        const docxBtn = document.getElementById('threadly-export-collection-docx-btn');
        const cancelBtn = document.getElementById('threadly-cancel-collection-export-btn');
        
        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => {
                exportCollection(collection, 'pdf');
                closeMessageActionsOverlay();
            });
        }
        
        if (markdownBtn) {
            markdownBtn.addEventListener('click', () => {
                exportCollection(collection, 'markdown');
                closeMessageActionsOverlay();
            });
        }
        
        if (docxBtn) {
            docxBtn.addEventListener('click', () => {
                exportCollection(collection, 'docx');
                closeMessageActionsOverlay();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                closeMessageActionsOverlay();
            });
        }
    }

    // Function to export a collection in different formats
    async function exportCollection(collection, format) {
        try {
            // Get all messages in the collection
            const allMessages = await loadAllMessagesFromAllPlatforms();
            const collectionMessages = allMessages.filter(message => 
                message.collectionIds && message.collectionIds.includes(collection.id)
            );
            
            if (collectionMessages.length === 0) {
                showToast('No messages found in this collection');
                return;
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `threadly-collection-${collection.name.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}`;
            
            let content, mimeType, extension;
            
            switch (format) {
                case 'markdown':
                    content = `# ${collection.name}\n\n**Collection Export** - ${collectionMessages.length} messages\n\n`;
                    collectionMessages.forEach((msg, index) => {
                        const role = msg.role === 'user' ? 'You' : 'AI';
                        const timestamp = new Date(msg.timestamp || Date.now()).toLocaleString();
                        content += `## ${role} (${timestamp})\n\n${msg.content}\n\n---\n\n`;
                    });
                    mimeType = 'text/markdown';
                    extension = 'md';
                    break;
                    
                case 'pdf':
                    // For PDF, we'll create a simple HTML content that can be printed
                    let htmlContent = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Threadly Collection - ${collection.name}</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                                .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                                .collection-name { font-size: 24px; font-weight: bold; color: #333; }
                                .collection-info { color: #666; font-size: 14px; margin-top: 5px; }
                                .message { margin-bottom: 30px; padding: 15px; border-left: 3px solid #007aff; background: #f8f9fa; }
                                .message-role { font-size: 16px; font-weight: bold; color: #007aff; margin-bottom: 8px; }
                                .message-content { white-space: pre-wrap; }
                                .separator { border-top: 1px solid #ddd; margin: 20px 0; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <div class="collection-name">${collection.name}</div>
                                <div class="collection-info">Collection Export - ${collectionMessages.length} messages</div>
                            </div>
                    `;
                    
                    collectionMessages.forEach((msg, index) => {
                        const role = msg.role === 'user' ? 'You' : 'AI';
                        const timestamp = new Date(msg.timestamp || Date.now()).toLocaleString();
                        htmlContent += `
                            <div class="message">
                                <div class="message-role">${role} (${timestamp})</div>
                                <div class="message-content">${msg.content}</div>
                            </div>
                        `;
                        if (index < collectionMessages.length - 1) {
                            htmlContent += '<div class="separator"></div>';
                        }
                    });
                    
                    htmlContent += '</body></html>';
                    
                    // Create a blob and trigger download
                    const blob = new Blob([htmlContent], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${filename}.html`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    showToast('HTML file downloaded (can be printed as PDF)');
                    return;
                    
                case 'docx':
                    // For DOCX, we'll create a simple text file as a fallback
                    content = `${collection.name}\n\nCollection Export - ${collectionMessages.length} messages\n\n`;
                    collectionMessages.forEach((msg, index) => {
                        const role = msg.role === 'user' ? 'You' : 'AI';
                        const timestamp = new Date(msg.timestamp || Date.now()).toLocaleString();
                        content += `${role} (${timestamp}):\n${msg.content}\n\n`;
                    });
                    mimeType = 'text/plain';
                    extension = 'txt';
                    showToast('Text file downloaded (DOCX not supported in browser)');
                    break;
                    
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
            
            // Create and download the file
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast(`Collection exported as ${format.toUpperCase()}`);
            
        } catch (error) {
            console.error('Threadly: Error exporting collection:', error);
            showToast('Error exporting collection');
        }
    }

    // Function to show delete confirmation modal
    function showDeleteConfirmation(collectionId, collectionName) {
        const panel = document.getElementById('threadly-panel');
        if (!panel) return;
        
        // Add class to trigger background blur
        panel.classList.add('delete-confirmation-active');
        
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'threadly-delete-modal-overlay';
        modalOverlay.innerHTML = `
            <div id="threadly-delete-modal">
                <p>Are you sure you want to delete the collection "<strong>${collectionName}</strong>"?</p>
                <div class="threadly-modal-actions">
                    <button id="threadly-confirm-delete-btn" class="modal-btn delete">Delete</button>
                    <button id="threadly-cancel-delete-btn" class="modal-btn cancel">Cancel</button>
                </div>
            </div>
        `;
        
        // Add to panel
        panel.appendChild(modalOverlay);
        
        // Add event listeners
        const confirmBtn = document.getElementById('threadly-confirm-delete-btn');
        const cancelBtn = document.getElementById('threadly-cancel-delete-btn');
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', async () => {
                try {
                    await deleteCollection(collectionId);
                    closeDeleteConfirmation();
                    // Re-render collections view to show the item is gone
                    renderCollectionsView();
                } catch (error) {
                    console.error('Threadly: Error deleting collection:', error);
                }
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeDeleteConfirmation);
        }
    }
    
    // Function to close delete confirmation modal
    function closeDeleteConfirmation() {
        const panel = document.getElementById('threadly-panel');
        const modalOverlay = document.getElementById('threadly-delete-modal-overlay');
        
        if (panel) {
            panel.classList.remove('delete-confirmation-active');
        }
        
        if (modalOverlay) {
            modalOverlay.remove();
        }
    }

    // Function to show message actions overlay
    function showMessageActionsOverlay(message, collectionId) {
        const panel = document.getElementById('threadly-panel');
        if (!panel) return;
        
        // Store message and collection ID globally for use in transitions
        window.currentMessageForActions = message;
        window.currentCollectionId = collectionId;
        
        // Add class to trigger background blur
        panel.classList.add('message-actions-active');
        
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'threadly-message-actions-overlay';
        
        // Determine if this is a global message (not in a collection)
        const isGlobalMessage = collectionId === null;
        
        modalOverlay.innerHTML = `
            <div id="threadly-message-actions-modal">
                <div class="threadly-message-preview">
                    <div class="threadly-message-role">${message.role === 'user' ? 'You' : 'AI'}</div>
                    <div class="threadly-message-content">${message.content.substring(0, 120)}${message.content.length > 120 ? '...' : ''}</div>
                </div>
                <div class="threadly-action-list">
                    ${!isGlobalMessage ? '<button id="threadly-delete-message-btn" class="action-list-item delete">Delete</button>' : ''}
                    <button id="threadly-export-message-btn" class="action-list-item export">Export as...</button>
                    <button id="threadly-cancel-message-btn" class="action-list-item cancel">Cancel</button>
                </div>
            </div>
        `;
        
        // Add to panel
        panel.appendChild(modalOverlay);
        
        // Add click outside to close functionality
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeMessageActionsOverlay();
            }
        });
        
        // Add event listeners using the new function
        addMainMenuEventListeners(message, collectionId);
    }

    // Function to close message actions overlay
    function closeMessageActionsOverlay() {
        const panel = document.getElementById('threadly-panel');
        if (!panel) return;
        
        const modalOverlay = document.getElementById('threadly-message-actions-overlay');
        const modal = modalOverlay?.querySelector('#threadly-message-actions-modal');
        
        if (modalOverlay && modal) {
            // Add closing animation classes
            modalOverlay.classList.add('closing');
            modal.classList.add('closing');
            
            // Remove overlay after animation completes
            setTimeout(() => {
                panel.classList.remove('message-actions-active');
                modalOverlay.remove();
            }, 200);
        } else {
            // Fallback if elements don't exist
            panel.classList.remove('message-actions-active');
            if (modalOverlay) {
                modalOverlay.remove();
            }
        }
    }

    // Function to show export options overlay
    function showExportOptionsOverlay(message) {
        const panel = document.getElementById('threadly-panel');
        if (!panel) return;
        
        // Get the existing modal and transform it instead of creating new one
        const existingOverlay = document.getElementById('threadly-message-actions-overlay');
        if (existingOverlay) {
            const modal = existingOverlay.querySelector('#threadly-message-actions-modal');
            if (modal) {
                // Add contracting animation
                modal.classList.add('contracting');
                
                // Change content immediately and add appearing animation
                setTimeout(() => {
                    modal.innerHTML = `
                        <div class="threadly-export-list">
                            <button id="threadly-export-pdf-btn" class="action-list-item export-format">PDF</button>
                            <button id="threadly-export-markdown-btn" class="action-list-item export-format">Markdown</button>
                            <button id="threadly-export-docx-btn" class="action-list-item export-format">DOCX</button>
                            <button id="threadly-cancel-export-btn" class="action-list-item cancel">Cancel</button>
                        </div>
                    `;
                    
                    // Add event listeners
                    addExportEventListeners(message);
                }, 200);
                
                // After contraction completes, remove contracting class and add export class
                setTimeout(() => {
                    modal.classList.remove('contracting');
                    modal.classList.add('export-mode');
                }, 400);
            }
        }
    }

    // Function to go back to main menu from export menu
    function showMainMenuOverlay(message, collectionId) {
        const panel = document.getElementById('threadly-panel');
        if (!panel) return;
        
        const existingOverlay = document.getElementById('threadly-message-actions-overlay');
        if (existingOverlay) {
            const modal = existingOverlay.querySelector('#threadly-message-actions-modal');
            if (modal) {
                // Add contracting animation
                modal.classList.add('contracting');
                
                // Change content immediately and add appearing animation
                setTimeout(() => {
                    modal.innerHTML = `
                        <div class="threadly-message-preview">
                            <div class="threadly-message-role">${message.role === 'user' ? 'You' : 'AI'}</div>
                            <div class="threadly-message-content">${message.content.substring(0, 120)}${message.content.length > 120 ? '...' : ''}</div>
                        </div>
                        <div class="threadly-action-list">
                            <button id="threadly-delete-message-btn" class="action-list-item delete">Delete</button>
                            <button id="threadly-export-message-btn" class="action-list-item export">Export as...</button>
                            <button id="threadly-cancel-message-btn" class="action-list-item cancel">Cancel</button>
                        </div>
                    `;
                    
                    // Add event listeners
                    addMainMenuEventListeners(message, collectionId);
                }, 50);
                
                // After contraction completes, remove contracting and export classes
                setTimeout(() => {
                    modal.classList.remove('contracting', 'export-mode');
                }, 400);
            }
        }
    }


    // Function to add export event listeners
    function addExportEventListeners(message) {
        const pdfBtn = document.getElementById('threadly-export-pdf-btn');
        const markdownBtn = document.getElementById('threadly-export-markdown-btn');
        const docxBtn = document.getElementById('threadly-export-docx-btn');
        const cancelBtn = document.getElementById('threadly-cancel-export-btn');
        
                if (pdfBtn) {
                    pdfBtn.addEventListener('click', (e) => {
                        e.target.classList.add('clicked');
                        setTimeout(() => e.target.classList.remove('clicked'), 300);
                        exportMessage(message, 'pdf');
                        closeMessageActionsOverlay();
                    });
                }
        
        if (markdownBtn) {
            markdownBtn.addEventListener('click', (e) => {
                e.target.classList.add('clicked');
                setTimeout(() => e.target.classList.remove('clicked'), 300);
                exportMessage(message, 'markdown');
                closeMessageActionsOverlay();
            });
        }
        
        if (docxBtn) {
            docxBtn.addEventListener('click', (e) => {
                e.target.classList.add('clicked');
                setTimeout(() => e.target.classList.remove('clicked'), 300);
                exportMessage(message, 'docx');
                closeMessageActionsOverlay();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                closeMessageActionsOverlay();
            });
        }
    }

    // Function to add main menu event listeners
    function addMainMenuEventListeners(message, collectionId) {
        const deleteBtn = document.getElementById('threadly-delete-message-btn');
        const exportBtn = document.getElementById('threadly-export-message-btn');
        const cancelBtn = document.getElementById('threadly-cancel-message-btn');
        
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', async (e) => {
                        e.target.classList.add('clicked');
                        setTimeout(() => e.target.classList.remove('clicked'), 300);
                        try {
                            if (collectionId === null) {
                                // For global messages, remove from favorites
                                await unstarGlobalFavorite(message);
                                closeMessageActionsOverlay();
                                // Refresh the current view
                                const currentState = messageFilterState;
                                selectFilterState(currentState);
                            } else {
                                // For collection messages, delete from collection
                                await deleteMessageFromCollection(message, collectionId);
                                closeMessageActionsOverlay();
                                await renderMessagesForCollection(collectionId);
                            }
                        } catch (error) {
                            console.error('Threadly: Error deleting message:', error);
                        }
                    });
                }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.target.classList.add('clicked');
                setTimeout(() => e.target.classList.remove('clicked'), 300);
                showExportOptionsOverlay(message);
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                closeMessageActionsOverlay();
            });
        }
    }

    
    async function renderMessagesForCollection(collectionId) {
        try {
            // Exit selection mode if active when entering a collection
            if (isInSelectionMode) {
                console.log('Threadly: Exiting selection mode due to entering collection');
                exitSelectionMode();
            }
            
            // --- FIX START: Hide the main navbar when inside a collection ---
            const toggleBar = document.getElementById('threadly-toggle-bar');
            if (toggleBar) {
                toggleBar.style.display = 'none';
            }
            // --- FIX END ---

            // --- FIX: Set the flag to true to correctly identify the current view context ---
            isInCollectionsView = true;
            
            console.log('Threadly: renderMessagesForCollection called with collectionId:', collectionId);
            
            // Set the current collection ID for selection context
            currentCollectionId = collectionId;
            
            console.log('Threadly: messageList element:', messageList);
            console.log('Threadly: messageList exists:', !!messageList);
            
            if (!messageList) {
                console.error('Threadly: messageList not found');
                console.error('Threadly: Trying to find messageList by ID...');
                const foundMessageList = document.getElementById('threadly-message-list');
                console.log('Threadly: Found messageList by ID:', foundMessageList);
                if (foundMessageList) {
                    messageList = foundMessageList;
                    console.log('Threadly: Updated messageList reference');
                } else {
                    console.error('Threadly: Could not find messageList element');
                    return;
                }
            }
            
            // Get the collection details
            const collections = await loadCollectionsFromStorage();
            const collection = collections.find(c => c.id === collectionId);
            
            if (!collection) {
                console.error('Threadly: Collection not found:', collectionId);
                return;
            }
            
            console.log('Threadly: Found collection:', collection);
            
            // Get all messages from Chrome storage
            const allStoredMessages = await loadMessagesFromStorage();
            console.log('Threadly: All stored messages:', allStoredMessages.length);
            
            // Filter messages that belong to this collection (check both collection.messageIds and message.collectionIds)
            console.log('Threadly: Collection to render:', collection);
            console.log('Threadly: Collection messageIds:', collection.messageIds);
            console.log('Threadly: All stored messages for filtering:', allStoredMessages);
            
            // Load ALL messages from ALL platforms to show collection contents globally
            const allPlatformMessages = await loadAllMessagesFromAllPlatforms();
            console.log('Threadly: All platform messages loaded:', allPlatformMessages.length);
            
            // Load global favorites to ensure proper favorite state for all platform messages
            const globalFavorites = await loadFavoritesFromStorage();
            console.log('Threadly: Processing', allPlatformMessages.length, 'platform messages for favorites');
            
            allPlatformMessages.forEach((message, idx) => {
                const isFavorited = globalFavorites.some(fav => 
                    fav.content === message.content && fav.role === message.role
                );
                message.isFavorited = isFavorited;
                if (isFavorited) {
                    message.originalPlatform = globalFavorites.find(fav => 
                        fav.content === message.content && fav.role === message.role
                    )?.platform;
                }
                
                // Debug logging removed for cleaner console
            });
            
            const collectionMessages = allPlatformMessages.filter(message => {
                const hasCollectionId = message.collectionIds && message.collectionIds.includes(collectionId);
                const isInCollectionMessageIds = collection.messageIds && collection.messageIds.includes(message.id || message.content);
                console.log('Threadly: Message filter check:', { 
                    messageId: message.id, 
                    content: message.content.substring(0, 50),
                    platform: message.platform,
                    hasCollectionId, 
                    isInCollectionMessageIds,
                    collectionIds: message.collectionIds,
                    collectionMessageIds: collection.messageIds
                });
                return hasCollectionId || isInCollectionMessageIds;
            });
            
            console.log('Threadly: Final collection messages to render:', collectionMessages.length);
            console.log('Threadly: Sample collection message platform:', collectionMessages[0]?.platform);
            
            console.log('Threadly: Filtered collection messages:', collectionMessages.length);
            
            // Clear message list first
            messageList.innerHTML = '';
            
            // Create header with collection info and back button
            const headerDiv = document.createElement('div');
            headerDiv.className = 'threadly-collection-header';
            // Get platform-specific color for header
            const headerPlatformColor = getPlatformHeaderColor();
            
            headerDiv.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                background: ${headerPlatformColor.background};
                border-radius: 12px;
                margin-bottom: 8px;
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                border: 1px solid ${headerPlatformColor.border};
            `;
            
            const collectionInfo = document.createElement('div');
            collectionInfo.innerHTML = `
                <h3 style="margin: 0; color: white; font-size: 18px;">${collection.name}</h3>
                <p style="margin: 5px 0 0 0; color: rgba(255, 255, 255, 0.7); font-size: 14px;">
                    ${collectionMessages.length} message${collectionMessages.length !== 1 ? 's' : ''}
                </p>
            `;
            
            const backButton = document.createElement('button');
            backButton.className = 'threadly-back-button';
            backButton.textContent = '← Back';
            backButton.style.cssText = `
                background: transparent;
                border: 1px solid transparent;
                color: white;
                padding: 8px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            `;
            
            // Hover effects are now handled by CSS
            
            backButton.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Threadly: Back button clicked, returning to DEFAULT SAVED state');
                console.log('Threadly: Current panel state:', panel?.classList.toString());
                console.log('Threadly: Current isInCollectionsView:', isInCollectionsView);
                
                // Return to DEFAULT SAVED state (collections list) instead of exiting completely
                isInCollectionsView = false;
                
                // Keep SAVED button active and show collections list
                console.log('Threadly: Rendering collections view');
                await renderCollectionsView(false); // false = normal mode, not assignment mode
                
                // Morph navbar to show "ADD NEW | BACK" for SAVED state
                console.log('Threadly: Calling morphNavbarToSavedState');
                morphNavbarToSavedState();
                
                console.log('Threadly: Returned to DEFAULT SAVED state');
            });
            
            headerDiv.appendChild(collectionInfo);
            headerDiv.appendChild(backButton);
            messageList.appendChild(headerDiv);
            
            if (collectionMessages.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'threadly-empty-state';
                emptyState.textContent = 'No messages saved in this collection yet.';
                emptyState.style.cssText = `
                    text-align: center;
                    padding: 40px 20px;
                    color: transparent;
                    font-size: 16px;
                `;
                messageList.appendChild(emptyState);
                return;
            }
            
            // Render the collection messages in the same format as FAV/YOU/AI states
            const fragment = document.createDocumentFragment();
            console.log('Threadly: Rendering', collectionMessages.length, 'collection messages');
            collectionMessages.forEach((msg, index) => {
                console.log(`Threadly: Rendering message ${index}:`, { id: msg.id, role: msg.role, content: msg.content?.substring(0, 50) + '...' });
                
                const item = document.createElement('div');
                item.className = 'threadly-message-item';
                if (msg.isFavorited) {
                    item.classList.add('favorited');
                }
                item.dataset.role = msg.role || 'user';
                item.dataset.messageId = msg.id;
                
                                    // Use the same styling as main message items, but preserve the left border accent
                    let leftBorderColor;
                    if (msg.platform && msg.platform !== currentPlatformId) {
                        // Use the platform's accent color from where the message was added to collection
                        const originalPlatformColors = {
                            'chatgpt': 'rgba(156, 163, 175, 0.8)',
                            'gemini': 'rgba(66, 133, 244, 0.8)',
                            'claude': 'rgba(255, 107, 53, 0.8)',
                            'ai-studio': 'rgba(66, 133, 244, 0.8)',
                            'perplexity': 'rgba(32, 178, 170, 0.8)',
                            'grok': 'rgba(31, 41, 55, 0.8)',
                            'copilot': 'rgba(0, 120, 212, 0.8)'
                        };
                        leftBorderColor = originalPlatformColors[msg.platform] || 'rgba(0, 191, 174, 0.8)';
                    } else {
                        // Use current platform's accent color for messages from current platform
                        leftBorderColor = getPlatformHighlightColor().replace('0.2', '0.8');
                    }
                    
                    item.style.cssText = `
                        background: rgba(255, 255, 255, 0.08);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-left: 4px solid ${leftBorderColor};
                        border-radius: 10px;
                        padding: 10px;
                        margin-bottom: 8px;
                        transition: all 0.2s ease;
                        backdrop-filter: blur(4px);
                        -webkit-backdrop-filter: blur(4px);
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    `;
                    
                    // Add hover effect (same as main message items) - preserve left border accent
                    item.addEventListener('mouseenter', () => {
                        item.style.background = 'rgba(255, 255, 255, 0.12)';
                        item.style.borderTopColor = 'rgba(255, 255, 255, 0.2)';
                        item.style.borderRightColor = 'rgba(255, 255, 255, 0.2)';
                        item.style.borderBottomColor = 'rgba(255, 255, 255, 0.2)';
                        item.style.transform = 'translateY(-1px)';
                    });
                    
                    item.addEventListener('mouseleave', () => {
                        item.style.background = 'rgba(255, 255, 255, 0.08)';
                        item.style.borderTopColor = 'rgba(255, 255, 255, 0.1)';
                        item.style.borderRightColor = 'rgba(255, 255, 255, 0.1)';
                        item.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
                        item.style.transform = 'translateY(0)';
                    });
                
                // Get platform accent color
                const platformColor = getPlatformHighlightColor().replace('0.2', '0.8');
                
                // Determine role text
                const roleText = (msg.role === 'user' || msg.role === 'assistant') 
                    ? (msg.role === 'user' ? `You (#${index + 1})` : `AI (#${index + 1})`)
                    : `Message #${index + 1}`;
                
                // Add platform indicator for collection messages (similar to FAV state)
                let platformIndicator = '';
                console.log('Threadly: Platform check for message:', {
                    msgPlatform: msg.platform,
                    currentPlatformId: currentPlatformId,
                    isDifferent: msg.platform && msg.platform !== currentPlatformId
                });
                
                if (msg.platform && msg.platform !== currentPlatformId) {
                    const platformName = PLATFORM_CONFIG[msg.platform]?.name || msg.platform;
                    platformIndicator = `<span class="threadly-platform-badge" data-original-platform="${msg.platform}">${platformName}</span>`;
                    console.log('Threadly: Added platform indicator:', platformName, 'for platform:', msg.platform);
                }
                
                // Check if message is longer than 10 words
                const wordCount = (msg.content || '').trim().split(/\s+/).length;
                const isLongMessage = wordCount > 10;
                
                // Create message content with proper escaping
                const messageContent = msg.content || 'No content available';
                const escapedContent = messageContent
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
                
                item.innerHTML = `
                    <div class="threadly-message-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 12px;
                    ">
                        <div class="threadly-message-left">
                            <div class="threadly-message-role" style="
                                color: ${platformColor};
                                font-weight: 600;
                                font-size: 14px;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            ">${roleText}${platformIndicator}</div>
                        </div>
                        <div class="threadly-message-right">
                            <div class="threadly-message-checkbox-container" style="display: none;">
                                <input type="checkbox" class="threadly-message-checkbox" id="collection_checkbox_${index}" data-message-id="${msg.id}">
                            </div>
                            <button class="threadly-star-btn ${msg.isFavorited ? 'starred' : ''}" title="${msg.isFavorited ? 'Remove from favorites' : 'Add to favorites'}" style="
                                background: none;
                                border: none;
                                color: ${msg.isFavorited ? platformColor : 'rgba(255, 255, 255, 0.6)'};
                                cursor: pointer;
                                font-size: 18px;
                                padding: 4px;
                                transition: all 0.3s ease;
                            ">
                                <span class="threadly-star-icon">${msg.isFavorited ? '★' : '☆'}</span>
                            </button>
                        </div>
                    </div>
                    <div class="threadly-message-text" style="
                        color: white;
                        line-height: 1.6;
                        font-size: 14px;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    ">${escapedContent}</div>
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: 4px;
                        gap: 8px;
                    ">
                        ${isLongMessage ? `<div class="threadly-read-more" style="color: ${platformColor}; cursor: pointer; font-size: 11px; font-weight: bold;">See More</div>` : '<div></div>'}
                        <div class="threadly-copy-btn" style="
                            color: ${platformColor};
                            cursor: pointer;
                            font-size: 11px;
                            font-weight: 900;
                            margin-left: auto;
                        " title="Copy message to clipboard">
                            Copy
                        </div>
                    </div>
                `;

                // Add star button event listener
                const starBtn = item.querySelector('.threadly-star-btn');
                starBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    
                    try {
                        // Use the existing toggleFavorite function
                        await toggleFavorite(msg, index);
                        
                        // Update UI based on new state
                        if (msg.isFavorited) {
                            starBtn.classList.add('starred');
                            starBtn.style.color = platformColor;
                            starBtn.title = 'Remove from favorites';
                            const starIcon = starBtn.querySelector('.threadly-star-icon');
                            starIcon.textContent = '★';
                        } else {
                            starBtn.classList.remove('starred');
                            starBtn.style.color = 'rgba(255, 255, 255, 0.6)';
                            starBtn.title = 'Add to favorites';
                            const starIcon = starBtn.querySelector('.threadly-star-icon');
                            starIcon.textContent = '☆';
                        }
                        
                        console.log('Threadly: Message', msg.isFavorited ? 'favorited' : 'unfavorited');
                    } catch (error) {
                        console.error('Threadly: Error toggling favorite:', error);
                    }
                });

                // Check if text is actually truncated and only show "See More" when needed
                const messageText = item.querySelector('.threadly-message-text');
                const readMoreBtn = item.querySelector('.threadly-read-more');
                
                // Only proceed if readMoreBtn exists (i.e., when isLongMessage was true)
                if (readMoreBtn) {
                    // Use setTimeout to ensure DOM is fully rendered before checking truncation
                    setTimeout(() => {
                        // Check if the text is actually truncated (scrollHeight > clientHeight)
                        const isActuallyTruncated = messageText.scrollHeight > messageText.clientHeight;
                        
                        console.log('Threadly: Message truncation check - scrollHeight:', messageText.scrollHeight, 'clientHeight:', messageText.clientHeight, 'isTruncated:', isActuallyTruncated);
                        
                        if (isActuallyTruncated) {
                            // Show the "See More" button
                            readMoreBtn.style.display = 'inline-block';
                            
                            console.log('Threadly: Setting up read more for truncated message:', msg.content.substring(0, 50));
                            
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
                        } else {
                            // Hide the "See More" button if text is not truncated
                            readMoreBtn.style.display = 'none';
                            console.log('Threadly: Text not truncated, hiding See More button for message:', msg.content.substring(0, 50));
                        }
                    }, 10);
                }

                // Add copy button event listener
                const copyBtn = item.querySelector('.threadly-copy-btn');
                if (copyBtn) {
                    copyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        copyMessageToClipboard(msg.content);
                    });
                }

                // Add long-press gesture for message actions
                let longPressTimer;
                item.addEventListener('mousedown', () => {
                    longPressTimer = setTimeout(() => {
                        showMessageActionsOverlay(msg, collectionId);
                    }, 750);
                });
                
                item.addEventListener('mouseup', () => {
                    clearTimeout(longPressTimer);
                });
                
                item.addEventListener('mouseleave', () => {
                    clearTimeout(longPressTimer);
                });
                
                console.log(`Threadly: Created message item with ID: ${msg.id}`);
                fragment.appendChild(item);
            });
            
            messageList.appendChild(fragment);
            
            // Ensure select bulb is visible in collection view
            const selectBulb = document.getElementById('threadly-select-bulb');
            if (selectBulb) {
                selectBulb.style.display = 'flex';
                selectBulb.title = 'Enable selection mode';
                selectBulb.setAttribute('data-mode', 'select');
            }
            
            // Ensure SAVED button stays active when viewing collections
            setSavedButtonActive(true);
            
            // Hide the toggle bar when viewing collection messages (not in selection mode)
            if (!isInSelectionMode) {
                const toggleBar = document.getElementById('threadly-toggle-bar');
                if (toggleBar) {
                    toggleBar.style.display = 'none';
                }
            }
            
            console.log('Threadly: Successfully rendered', collectionMessages.length, 'messages for collection:', collection.name);
            
        } catch (error) {
            console.error('Threadly: Error rendering collection messages:', error);
            console.error('Threadly: Error stack:', error.stack);
            
            // Show error state
            if (messageList) {
                messageList.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: rgba(255, 255, 255, 0.6);">
                        <button class="threadly-back-button" style="
                            background: rgba(255, 255, 255, 0.2);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            color: white;
                            padding: 8px 16px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                            margin-bottom: 20px;
                        ">← Back to Collections</button>
                        <div>Error loading collection messages. Please try again.</div>
                        <div style="font-size: 12px; margin-top: 10px; color: rgba(255, 255, 255, 0.4);">
                            Error: ${error.message}
                        </div>
                    </div>
                `;
                
                // Add event listener for the back button
                const backButton = messageList.querySelector('.threadly-back-button');
                if (backButton) {
                    // Hover effects are now handled by CSS
                    
                    backButton.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Threadly: Back button clicked, returning to DEFAULT SAVED state');
                        
                        // Return to DEFAULT SAVED state (collections list) instead of exiting completely
                        isInCollectionsView = false;
                        
                        // Keep SAVED button active and show collections list
                        console.log('Threadly: Rendering collections view');
                        await renderCollectionsView(false); // false = normal mode, not assignment mode
                        
                        // Morph navbar to show "ADD NEW | BACK" for SAVED state
                        console.log('Threadly: Calling morphNavbarToSavedState');
                        morphNavbarToSavedState();
                        
                        console.log('Threadly: Returned to DEFAULT SAVED state');
                    });
                }
            }
        }
    }
    
    function returnToMainMessages() {
        if (!messageList) return;
        
        // --- FIX START: Ensure the navbar is visible when returning to main messages ---
        const toggleBar = document.getElementById('threadly-toggle-bar');
        if (toggleBar) {
            toggleBar.style.display = 'flex';
        }
        // --- FIX END ---
        
        // Reset flag
        isInCollectionsView = false;
        
        // Return to main messages view
        filterMessages(searchInput.value);
    }
    
    async function updateCollectionMessageCounts() {
        try {
            // Load collections and messages from storage
            const collections = await loadCollectionsFromStorage();
            const allPlatformMessages = await loadAllMessagesFromAllPlatforms();
            
            // Update message counts for each collection (global across all platforms)
            collections.forEach(collection => {
                const messageCount = allPlatformMessages.filter(message => 
                    message.collectionIds && message.collectionIds.includes(collection.id)
                ).length;
                collection.messageCount = messageCount;
            });
            
            // Save updated collections
            await saveCollectionsToStorage(collections);
        } catch (error) {
            console.error('Threadly: Error updating collection message counts:', error);
        }
    }

    function generateCollectionId() {
        return 'col_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async function createCollection(name) {
        // Check if collection with same name already exists
        const existingCollections = await loadCollectionsFromStorage();
        const existingCollection = existingCollections.find(c => c.name === name);
        
        if (existingCollection) {
            console.log('Threadly: Collection with name already exists:', name);
            return existingCollection; // Return existing collection instead of creating new one
        }
        
        const newCollection = {
            id: generateCollectionId(),
            name: name,
            createdAt: Date.now(),
            platform: currentPlatformId
        };
        
        // Add new collection to existing ones
        existingCollections.push(newCollection);
        await saveCollectionsToStorage(existingCollections);
        
        console.log('Threadly: Created new collection:', name);
        return newCollection;
    }

    async function deleteCollection(collectionId) {
        try {
            // Load collections from storage
            const collections = await loadCollectionsFromStorage();
            
            // Find the collection
            const collectionIndex = collections.findIndex(c => c.id === collectionId);
            if (collectionIndex === -1) {
                console.error('Threadly: Collection not found:', collectionId);
                return;
            }
            
            const collectionName = collections[collectionIndex].name;
            
            // Remove collection from collections array
            collections.splice(collectionIndex, 1);
            await saveCollectionsToStorage(collections);
            
            // Remove collection ID from all messages that were assigned to it
            const allPlatformMessages = await loadAllMessagesFromAllPlatforms();
            allPlatformMessages.forEach(message => {
                if (message.collectionIds && message.collectionIds.includes(collectionId)) {
                    message.collectionIds = message.collectionIds.filter(id => id !== collectionId);
                }
            });

            // Group the updated messages by their original storage key
            const messagesByStorageKey = allPlatformMessages.reduce((acc, msg) => {
                const storageKey = msg.originalStorageKey; 
                if (!acc[storageKey]) {
                    acc[storageKey] = [];
                }
                acc[storageKey].push(msg);
                return acc;
            }, {});

            // Save each group of messages back to its correct location in storage
            for (const storageKey in messagesByStorageKey) {
                if (storageKey && storageKey !== 'unknown') {
                    await chrome.storage.local.set({ [storageKey]: messagesByStorageKey[storageKey] });
                }
            }
            
            // Update global favorites if needed
            await updateGlobalFavorites();
            
            // Update collection message counts
            await updateCollectionMessageCounts();
            
            console.log('Threadly: Deleted collection:', collectionName);
            
            // Show confirmation toast
            showToast(`Deleted saved folder '${collectionName}'`);
            
        } catch (error) {
            console.error('Threadly: Error deleting collection:', error);
            showToast('Error deleting saved folder');
        }
    }

    // Function to delete a message from a collection
    async function deleteMessageFromCollection(message, collectionId) {
        console.log('Threadly: deleteMessageFromCollection called with message:', message.id, 'collectionId:', collectionId);
        try {
            // Load ALL messages from all platforms to find the correct message
            const allPlatformMessages = await loadAllMessagesFromAllPlatforms();
            const targetMessage = allPlatformMessages.find(m => m.id === message.id);
            if (!targetMessage) {
                console.error('Threadly: Message not found in all platform messages:', message.id);
                console.log('Threadly: Available message IDs in all platform messages:', allPlatformMessages.map(m => m.id));
                return;
            }

            console.log('Threadly: Found target message:', targetMessage.id, 'Current collectionIds:', targetMessage.collectionIds);

            if (targetMessage.collectionIds && targetMessage.collectionIds.includes(collectionId)) {
                console.log('Threadly: Removing collection', collectionId, 'from message', targetMessage.id);
                targetMessage.collectionIds = targetMessage.collectionIds.filter(id => id !== collectionId);
                console.log('Threadly: New collectionIds:', targetMessage.collectionIds);
                
                // Save the updated message back to its original storage location
                const storageKey = targetMessage.originalStorageKey || `threadly_${targetMessage.platform}_${window.location.pathname}`;
                const platformMessages = allPlatformMessages.filter(m => 
                    (m.originalStorageKey || `threadly_${m.platform}_${window.location.pathname}`) === storageKey
                );
                
                await chrome.storage.local.set({ [storageKey]: platformMessages });
                console.log('Threadly: Saved updated messages to storage key:', storageKey);
                
                await updateCollectionMessageCounts();
                
                console.log('Threadly: Removed message from collection:', collectionId);
                
                // Show confirmation toast
                showToast('Message removed from collection');
            } else {
                console.warn('Threadly: Message was not in the specified collection');
            }
            
        } catch (error) {
            console.error('Threadly: Error removing message from collection:', error);
            showToast('Error removing message from collection');
        }
    }

    // Function to delete selected messages from a collection
    async function deleteSelectedMessagesFromCollection() {
        console.log('Threadly: deleteSelectedMessagesFromCollection called');
        console.log('Threadly: currentCollectionId:', currentCollectionId);
        console.log('Threadly: selectedMessageIds:', selectedMessageIds);
        
        if (!currentCollectionId || selectedMessageIds.length === 0) {
            console.error('Threadly: No collection or messages selected for deletion');
            return;
        }

        try {
            console.log('Threadly: Deleting messages from collection:', currentCollectionId, 'Messages:', selectedMessageIds);

            // --- FIX: Load ALL messages from storage to find and update the correct ones ---
            const allMessages = await loadAllMessagesFromAllPlatforms();
            console.log('Threadly: Loaded', allMessages.length, 'total messages from all platforms');
            console.log('Threadly: All messages platforms:', [...new Set(allMessages.map(m => m.platform))]);
            let messagesUpdated = 0;

            // Find and update each selected message
            console.log('Threadly: Checking', allMessages.length, 'messages against', selectedMessageIds.length, 'selected IDs');
            console.log('Threadly: Selected message IDs:', selectedMessageIds);
            console.log('Threadly: All message IDs:', allMessages.map(m => m.id));
            
            allMessages.forEach(message => {
                if (selectedMessageIds.includes(message.id)) {
                    console.log('Threadly: Found selected message:', message.id, 'Platform:', message.platform, 'CollectionIds:', message.collectionIds);
                    if (message.collectionIds && message.collectionIds.includes(currentCollectionId)) {
                        // Remove the current collection ID from the message's list
                        console.log('Threadly: Removing collection', currentCollectionId, 'from selected message:', message.id);
                        message.collectionIds = message.collectionIds.filter(id => id !== currentCollectionId);
                        messagesUpdated++;
                        console.log('Threadly: Removed collection from message:', message.id, 'New collectionIds:', message.collectionIds);
                    } else {
                        console.log('Threadly: Message', message.id, 'does not contain collection', currentCollectionId);
                        console.log('Threadly: Message collectionIds:', message.collectionIds);
                    }
                }
            });

            // Save the modified messages back to their respective platform storages
            // Group messages by their original storage key to maintain proper organization
            const messagesByStorageKey = allMessages.reduce((acc, msg) => {
                const storageKey = msg.originalStorageKey || `threadly_${msg.platform}_${window.location.pathname}`;
                if (!acc[storageKey]) {
                    acc[storageKey] = [];
                }
                acc[storageKey].push(msg);
                return acc;
            }, {});

            // Save each group of messages back to their original storage location
            for (const storageKey in messagesByStorageKey) {
                if (storageKey && storageKey !== 'unknown') {
                    await chrome.storage.local.set({ [storageKey]: messagesByStorageKey[storageKey] });
                    console.log('Threadly: Saved', messagesByStorageKey[storageKey].length, 'messages to storage key:', storageKey);
                }
            }
            
            console.log('Threadly: Removed', messagesUpdated, 'messages from collection:', currentCollectionId);
            // --- FIX ENDS HERE ---

            // Get collection name for the toast message
            const collections = await loadCollectionsFromStorage();
            const collection = collections.find(c => c.id === currentCollectionId);
            const collectionName = collection ? collection.name : 'Unknown Collection';
            
            // Show confirmation toast
            showToast(`Removed ${messagesUpdated} message(s) from '${collectionName}'`);

            // Use the targeted UI reset and refresh the view
            await resetSelectionUI();
            await renderMessagesForCollection(currentCollectionId);

        } catch (error) {
            console.error('Threadly: Error deleting messages from collection:', error);
            showToast('Error removing messages from collection');
        }
    }

    // Function to delete selected collections
    async function deleteSelectedCollections() {
        if (selectedCollectionIds.length === 0) {
            console.error('Threadly: No collections selected for deletion');
            return;
        }

        try {
            console.log('Threadly: Deleting collections:', selectedCollectionIds);
            
            // Load collections from storage
            const collections = await loadCollectionsFromStorage();
            
            // Get names of collections being deleted for toast message
            const deletedNames = collections
                .filter(c => selectedCollectionIds.includes(c.id))
                .map(c => c.name);
            
            // Filter out the selected collections
            const remainingCollections = collections.filter(c => !selectedCollectionIds.includes(c.id));
            
            // Save the updated collections
            await saveCollectionsToStorage(remainingCollections);
            
            // Remove collection IDs from all messages that were assigned to deleted collections
            const allPlatformMessages = await loadAllMessagesFromAllPlatforms();
            allPlatformMessages.forEach(message => {
                if (message.collectionIds) {
                    message.collectionIds = message.collectionIds.filter(id => !selectedCollectionIds.includes(id));
                }
            });

            // Group the updated messages by their original storage key
            const messagesByStorageKey = allPlatformMessages.reduce((acc, msg) => {
                const storageKey = msg.originalStorageKey; 
                if (!acc[storageKey]) {
                    acc[storageKey] = [];
                }
                acc[storageKey].push(msg);
                return acc;
            }, {});

            // Save each group of messages back to its correct location in storage
            for (const storageKey in messagesByStorageKey) {
                if (storageKey && storageKey !== 'unknown') {
                    await chrome.storage.local.set({ [storageKey]: messagesByStorageKey[storageKey] });
                }
            }
            
            // Update global favorites if needed
            await updateGlobalFavorites();
            
            // Update collection message counts
            await updateCollectionMessageCounts();
            
            console.log('Threadly: Deleted collections:', deletedNames);
            
            // Show confirmation toast
            showToast(`Deleted ${deletedNames.length} saved folder(s): ${deletedNames.join(', ')}`);
            
            // Reset selection UI and refresh the collections view
            await resetSelectionUI();
            await renderCollectionsView();
            
        } catch (error) {
            console.error('Threadly: Error deleting collections:', error);
            showToast('Error deleting saved folders');
        }
    }

    // Function to export a message in different formats
    async function exportMessage(message, format) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const role = message.role === 'user' ? 'You' : 'AI';
            const filename = `threadly-${role.toLowerCase()}-${timestamp}`;
            
            let content, mimeType, extension;
            
            switch (format) {
                case 'markdown':
                    content = `# ${role} Message\n\n**Date:** ${new Date(message.timestamp || Date.now()).toLocaleString()}\n\n${message.content}`;
                    mimeType = 'text/markdown';
                    extension = 'md';
                    break;
                    
                case 'pdf':
                    // For PDF, we'll create a simple HTML content that can be printed
                    const htmlContent = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Threadly Export - ${role} Message</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                                .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                                .role { font-size: 18px; font-weight: bold; color: #333; }
                                .timestamp { color: #666; font-size: 14px; }
                                .content { white-space: pre-wrap; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <div class="role">${role}</div>
                                <div class="timestamp">${new Date(message.timestamp || Date.now()).toLocaleString()}</div>
                            </div>
                            <div class="content">${message.content}</div>
                        </body>
                        </html>
                    `;
                    
                    // Create a blob and trigger download
                    const blob = new Blob([htmlContent], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${filename}.html`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    showToast('HTML file downloaded (can be printed as PDF)');
                    return;
                    
                case 'docx':
                    // For DOCX, we'll create a simple text file as a fallback
                    content = `${role} Message\n\nDate: ${new Date(message.timestamp || Date.now()).toLocaleString()}\n\n${message.content}`;
                    mimeType = 'text/plain';
                    extension = 'txt';
                    showToast('Text file downloaded (DOCX not supported in browser)');
                    break;
                    
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
            
            // Create and download the file
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast(`Message exported as ${format.toUpperCase()}`);
            
        } catch (error) {
            console.error('Threadly: Error exporting message:', error);
            showToast('Error exporting message');
        }
    }

    async function assignToCollection(messageIds, collectionId) {
        try {
            // 1. Load ALL messages from EVERY chat across ALL platforms.
            const allPlatformMessages = await loadAllMessagesFromAllPlatforms();
            let messagesUpdatedCount = 0;

            // 2. Iterate through all messages to find and update the selected ones.
            allPlatformMessages.forEach(message => {
                if (messageIds.includes(message.id)) {
                    if (!message.collectionIds) {
                        message.collectionIds = [];
                    }
                    // Add the collectionId if it's not already there.
                    if (!message.collectionIds.includes(collectionId)) {
                        message.collectionIds.push(collectionId);
                        messagesUpdatedCount++;
                    }
                }
            });

            // 3. Group the updated messages by their original storage key.
            const messagesByStorageKey = allPlatformMessages.reduce((acc, msg) => {
                const storageKey = msg.originalStorageKey; 
                if (!acc[storageKey]) {
                    acc[storageKey] = [];
                }
                acc[storageKey].push(msg);
                return acc;
            }, {});

            // 4. Save each group of messages back to its correct location in storage.
            for (const storageKey in messagesByStorageKey) {
                if (storageKey && storageKey !== 'unknown') {
                    await chrome.storage.local.set({ [storageKey]: messagesByStorageKey[storageKey] });
                }
            }
            
            // Update global favorites if needed
            await updateGlobalFavorites();
            
            // Update collection message counts
            await updateCollectionMessageCounts();
            
            // Show confirmation toast
            const collectionName = await getCollectionName(collectionId);
            showToast(`Moved ${messagesUpdatedCount} items to '${collectionName}'`);
            
            // FORCE EXIT: Reset assignment mode and return to DEFAULT SAVED state
            console.log('Threadly: Assignment completed - forcing exit to default SAVED state');
            exitAssignmentMode();
            
        } catch (error) {
            console.error('Threadly: Error assigning to collection:', error);
        }
    }

    // --- Unstar Messages --- //
    async function unstarMessages() {
        if (selectedMessageIds.length === 0) return;
        
        try {
            // Load ALL messages from EVERY chat across ALL platforms
            const allPlatformMessages = await loadAllMessagesFromAllPlatforms();
            
            // Unstar selected messages
            allPlatformMessages.forEach(message => {
                if (selectedMessageIds.includes(message.id)) {
                    message.isFavorited = false;
                    if (message.collectionIds) {
                        message.collectionIds = [];
                    }
                }
            });

            // Group the updated messages by their original storage key
            const messagesByStorageKey = allPlatformMessages.reduce((acc, msg) => {
                const storageKey = msg.originalStorageKey; 
                if (!acc[storageKey]) {
                    acc[storageKey] = [];
                }
                acc[storageKey].push(msg);
                return acc;
            }, {});

            // Save each group of messages back to its correct location in storage
            for (const storageKey in messagesByStorageKey) {
                if (storageKey && storageKey !== 'unknown') {
                    await chrome.storage.local.set({ [storageKey]: messagesByStorageKey[storageKey] });
                }
            }
            
            // Update global favorites
            await updateGlobalFavorites();
            
            // Update collection message counts
            await updateCollectionMessageCounts();
            
            // Store the count before clearing selectedMessageIds
            const unstarredCount = selectedMessageIds.length;
            
            // Exit selection mode
            exitSelectionMode();
            
            // Refresh the display
            await filterMessages(searchInput.value);
            
            // Show success toast
            showToast(`Unstarred ${unstarredCount} message(s)`);
            
        } catch (error) {
            console.error('Threadly: Error unstarring messages:', error);
            showToast('Error unstarring messages');
        }
    }

    function showToast(message) {
        const wrapper = document.querySelector('.threadly-metaball-wrapper');
        const searchPill = document.querySelector('.threadly-search-pill');
        const searchInput = document.getElementById('threadly-search-input');

        // Exit if the necessary elements aren't on the page
        if (!wrapper || !searchPill || !searchInput) {
            console.error("Threadly: Cannot show toast, search elements not found.");
            // Fallback to a simple alert if UI is missing
            alert(message);
            return;
        }

        // --- 1. Store the original state of the search bar ---
        const originalPlaceholder = searchInput.placeholder;
        const originalValue = searchInput.value;

        // --- 2. Calculate the dynamic width for the toast message ---
        // Create a temporary element to measure the text width accurately
        const tempSpan = document.createElement('span');
        tempSpan.style.position = 'absolute';
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.whiteSpace = 'nowrap';
        tempSpan.style.fontSize = getComputedStyle(searchInput).fontSize;
        tempSpan.style.fontFamily = getComputedStyle(searchInput).fontFamily;
        tempSpan.textContent = message;
        document.body.appendChild(tempSpan);
        
        const textWidth = tempSpan.offsetWidth;
        document.body.removeChild(tempSpan);

        const PADDING = 32; // 16px padding on each side
        const MIN_WIDTH = 184; // Same as --search-pill-compact-width
        const MAX_WIDTH = 295; // Same as --search-pill-expanded-width
        const dynamicWidth = Math.min(Math.max(textWidth + PADDING, MIN_WIDTH), MAX_WIDTH);

        // --- 3. Transform the search bar into a toast message ---
        searchInput.value = message;
        searchInput.readOnly = true;
        searchInput.style.textAlign = 'center';
        searchInput.style.cursor = 'default';

        // Give it a subtle "success" tint
            searchPill.style.background = 'rgba(16, 185, 129, 0.2)';
            searchPill.style.borderColor = 'rgba(16, 185, 129, 0.4)';

        // --- 4. Trigger the expansion animation ---
        // Set the dynamic width
        searchPill.style.width = `${dynamicWidth}px`;
        
        // Add the 'stateA' class to the wrapper to push the bulbs out
        wrapper.classList.remove('stateB');
        wrapper.classList.add('stateA');

        // --- 5. Set a timer to restore the search bar ---
        const TOAST_DURATION = 3000; // 3 seconds
        setTimeout(() => {
        // Restore the input's original state
            searchInput.value = originalValue;
            searchInput.placeholder = originalPlaceholder;
        searchInput.readOnly = false;
        searchInput.style.textAlign = '';
        searchInput.style.cursor = '';

        // Remove the toast-specific styling
        searchPill.style.background = '';
        searchPill.style.borderColor = '';
        
        // Remove the inline width so it can animate back to its original size
        searchPill.style.width = '';

        // Trigger the collapse animation by switching back to stateB
        wrapper.classList.remove('stateA');
        wrapper.classList.add('stateB');

        }, TOAST_DURATION);
    }

    // --- Perplexity Loading Page Detection --- //
    function isPerplexityLoadingPage() {
        // Check for loading page elements (voice mode, sources, model buttons)
        const voiceModeButton = document.querySelector('button[aria-label="Voice mode"]');
        const sourcesButton = document.querySelector('button[data-testid="sources-switcher-button"]');
        const modelButton = document.querySelector('button[aria-label="Choose a model"]');
        
        // Check for chat page elements (submit button, textarea)
        const submitButton = document.querySelector('button[data-testid="submit-button"]');
        const textarea = document.querySelector('textarea[placeholder*="Ask anything"], textarea[aria-label*="Ask anything"], textarea[data-testid="search-input"], textarea[placeholder*="Ask"], textarea[aria-label*="Ask"], textarea[placeholder*="Search"], textarea[aria-label*="Search"], div[contenteditable="true"]');
        
        // We're on loading page if we have loading page elements but no chat page elements
        const hasLoadingPageElements = voiceModeButton && sourcesButton && modelButton;
        const hasChatPageElements = submitButton && textarea;
        
        return hasLoadingPageElements && !hasChatPageElements;
    }

    // --- Enhanced Update Logic --- //
    async function updateAndSaveConversation() {
        console.log('Threadly: Updating conversation for', currentPlatformId);
        
        // For Perplexity, check if we're on the loading page or homepage and skip data extraction
        if (currentPlatformId === 'perplexity' && (isPerplexityLoadingPage() || isPerplexityHomepage(location.href))) {
            console.log('Threadly: On Perplexity loading page or homepage, skipping conversation extraction');
            return;
        }
        
        // For ChatGPT, check if we're on the default page and skip data extraction to avoid scraping old chats
        if (currentPlatformId === 'chatgpt' && isChatGPTDefaultPage()) {
            console.log('Threadly: On ChatGPT default page, skipping conversation extraction to avoid scraping old chats');
                return;
        }
        
        const currentMessages = extractConversation();
        
        if (currentMessages.length > 0) {
            // Load existing messages from storage to preserve IDs and collection data
            const existingStoredMessages = await loadMessagesFromStorage();
            console.log('Threadly: Loaded existing messages from storage:', existingStoredMessages.length);
            
            // Deduplicate messages based on content and role
            const uniqueMessages = [];
            const seen = new Set();
            
            currentMessages.forEach((msg, index) => {
                const key = `${msg.role}:${msg.content.substring(0, 100)}`; // Use first 100 chars as key
                if (!seen.has(key)) {
                    seen.add(key);
                    // Find existing message in storage by content and role
                    const existingMsg = existingStoredMessages.find(m => 
                        m.content === msg.content && m.role === msg.role
                    );
                    
                    const messageId = existingMsg ? existingMsg.id : `msg_${Date.now()}_${index}`;
                    uniqueMessages.push({
                        ...msg,
                        id: messageId, // Preserve existing ID or generate new one
                        isFavorited: existingMsg ? existingMsg.isFavorited : false,
                        collectionIds: existingMsg ? existingMsg.collectionIds : [] // Preserve collection IDs
                    });
                    
                    if (existingMsg) {
                        console.log('Threadly: Preserved existing message ID:', messageId, 'for content:', msg.content.substring(0, 50));
                    } else {
                        console.log('Threadly: Generated new message ID:', messageId, 'for content:', msg.content.substring(0, 50));
                    }
                }
            });
            
            allMessages = uniqueMessages;
            await saveMessagesToStorage(uniqueMessages);
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

    // Function to copy message content to clipboard
    async function copyMessageToClipboard(content) {
        try {
            await navigator.clipboard.writeText(content);
            showToast('Message copied to clipboard!');
            console.log('Threadly: Message copied to clipboard');
        } catch (error) {
            console.error('Threadly: Error copying to clipboard:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('Message copied to clipboard!');
        }
    }
    
    function getPlatformHighlightColor() {
        const platformColors = {
            'chatgpt': 'rgba(156, 163, 175, 0.2)',
            'gemini': 'rgba(66, 133, 244, 0.2)',
            'claude': 'rgba(255, 107, 53, 0.2)',
            'ai-studio': 'rgba(66, 133, 244, 0.2)',
            'perplexity': 'rgba(32, 178, 170, 0.2)',
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

    // --- Prompt Refiner Variables --- //
    let promptRefiner = null;
    let refineButtons = new Set();

    // --- Enhanced Initialization --- //
    async function init() {
        currentPlatformId = detectPlatform();
        if (currentPlatformId === 'unknown') {
            console.log('Threadly: Unknown platform, exiting');
            return;
        }
        
        // Refresh debounced update with platform-specific timing
        refreshDebouncedUpdate();

        // Initialize prompt refiner for all platforms
        try {
            promptRefiner = new PromptRefiner();
            await promptRefiner.initialize();
            console.log('Threadly: Prompt refiner initialized');
        } catch (error) {
            console.error('Threadly: Failed to initialize prompt refiner:', error);
        }
        
        // Wait a bit more for dynamic platforms
        if (currentPlatformId === 'perplexity' || currentPlatformId === 'gemini') {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        try {
            // Initialize navigation dots immediately for faster loading
            createScrollIndicator();
            
            injectUI();
            
            const savedMessages = await loadMessagesFromStorage();
            const liveMessages = extractConversation();
            
            // For Perplexity, check if we're on the loading page or homepage and skip message loading
            if (currentPlatformId === 'perplexity' && (isPerplexityLoadingPage() || isPerplexityHomepage(location.href))) {
                console.log('Threadly: On Perplexity loading page or homepage during init, skipping message loading');
                allMessages = [];
            } else if (currentPlatformId === 'chatgpt' && isChatGPTDefaultPage()) {
                console.log('Threadly: On ChatGPT default page during init, skipping message loading to avoid scraping old chats');
                allMessages = [];
            } else {
                // Prefer live messages if available, otherwise use saved
                allMessages = liveMessages.length > 0 ? liveMessages : 
                            savedMessages.map(m => ({ 
                                content: m.content, 
                                element: null, 
                                role: m.role || 'user',
                                isFavorited: m.isFavorited || false,
                                collectionId: m.collectionId || null
                            }));
            }

            // Load global favorites to mark current messages
            await loadGlobalFavorites();
            
            // Load collections
            collections = await loadCollectionsFromStorage();
            
            // Update collection message counts (only when needed, not during init)
            // await updateCollectionMessageCounts();
            
            if (panel && panel.classList.contains('threadly-expanded')) {
                renderMessages(allMessages);
            }

            startObserver();
            
            // Initialize prompt refiner buttons
            initializePromptRefiner();
            
            // Update navigation dots with messages
            // For Perplexity loading page or homepage, ensure dots are visible even with no messages
            if (currentPlatformId === 'perplexity' && (isPerplexityLoadingPage() || isPerplexityHomepage(location.href))) {
                console.log('Threadly: On Perplexity loading page or homepage, ensuring navigation dots are visible');
                updateScrollIndicator([]);
            } else if (currentPlatformId === 'chatgpt' && isChatGPTDefaultPage()) {
                console.log('Threadly: On ChatGPT default page, ensuring navigation dots are visible but empty');
                updateScrollIndicator([]);
            } else {
                updateScrollIndicator(allMessages);
            }
            
            console.log('Threadly: Initialization complete for', currentPlatformId);
            
            // Initialize support popup system
            initializeSupportPopup();
            
        } catch (error) {
            console.error('Threadly: Initialization error:', error);
        }
    }

    // --- CleanMetaBallRenderer Class --- //
    class CleanMetaBallRenderer {
        constructor(canvas) {
            this.canvas = canvas;
            this.gl = canvas.getContext('webgl2');
            this.currentState = 1;
            this.targetBalls = [];
            this.currentBalls = [];
            this.animationTime = 0;
            this.transitionProgress = 0;
            this.targetTransition = 0;
            
            if (!this.gl) {
                console.error('WebGL2 not supported');
                return;
            }
            
            this.initShaders();
            this.initGeometry();
            this.setupUniforms();
            this.resize();
            this.setState1Balls();
            this.animate();
        }
        
        initShaders() {
            const vertexShader = this.createShader(this.gl.VERTEX_SHADER, `#version 300 es
                precision highp float;
                layout(location = 0) in vec2 position;
                void main() {
                    gl_Position = vec4(position, 0.0, 1.0);
                }
            `);
            
            const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, `#version 300 es
                precision highp float;
                uniform vec3 iResolution;
                uniform float iTime;
                uniform float iTransition;
                out vec4 outColor;
                
                float sdRoundedBox(vec2 p, vec2 b, float r) {
                    vec2 q = abs(p) - b + r;
                    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
                }
                
                float sdCircle(vec2 p, float r) {
                    return length(p) - r;
                }
                
                float smoothUnion(float d1, float d2, float k) {
                    float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
                    return mix(d2, d1, h) - k * h * (1.0 - h);
                }
                
                void main() {
                    vec2 fc = gl_FragCoord.xy;
                    vec2 coord = (fc - iResolution.xy * 0.5) / iResolution.y;
                    coord.y *= -1.0; // Flip Y to match UI
                    
                    // Search bar positions and sizes
                    vec2 searchPos1 = vec2(0.0, 0.0);
                    vec2 searchSize1 = vec2(0.38, 0.08);
                    
                    vec2 searchPos2 = vec2(-0.05, 0.0);
                    vec2 searchSize2 = vec2(0.32, 0.08);
                    
                    vec2 closePos2 = vec2(0.45, 0.0);
                    float closeRadius = 0.06;
                    
                    // Interpolate positions and sizes
                    vec2 searchPos = mix(searchPos1, searchPos2, iTransition);
                    vec2 searchSize = mix(searchSize1, searchSize2, iTransition);
                    
                    // Create shapes
                    float searchBar = sdRoundedBox(coord - searchPos, searchSize, 0.08);
                    float closeButton = sdCircle(coord - closePos2, closeRadius);
                    
                    // Combine shapes based on transition
                    float shape;
                    if (iTransition < 0.5) {
                        // Morphing phase - smooth union
                        float t = iTransition * 2.0;
                        float smoothK = mix(0.15, 0.02, t);
                        shape = smoothUnion(searchBar, closeButton, smoothK);
                    } else {
                        // Separation phase - individual shapes
                        float t = (iTransition - 0.5) * 2.0;
                        float gap = mix(0.0, 0.08, t);
                        
                        // Adjust close button position to create gap
                        vec2 adjustedClosePos = closePos2 + vec2(gap, 0.0);
                        float adjustedCloseButton = sdCircle(coord - adjustedClosePos, closeRadius);
                        
                        shape = min(searchBar, adjustedCloseButton);
                    }
                    
                    // Create smooth edges
                    float alpha = 1.0 - smoothstep(-0.005, 0.005, shape);
                    
                    // Color based on position and state
                    vec3 searchColor = vec3(1.0, 1.0, 1.0);
                    vec3 closeColor = vec3(1.0, 0.42, 0.42);
                    
                    // Determine which part we're coloring
                    float isCloseButton = step(0.0, coord.x - 0.25) * step(iTransition, 0.8);
                    vec3 finalColor = mix(searchColor, closeColor, isCloseButton);
                    
                    outColor = vec4(finalColor, alpha * 0.9);
                }
            `);
            
            this.program = this.createProgram(vertexShader, fragmentShader);
            this.gl.useProgram(this.program);
        }
        
        createShader(type, source) {
            const shader = this.gl.createShader(type);
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);
            
            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        }
        
        createProgram(vertexShader, fragmentShader) {
            const program = this.gl.createProgram();
            this.gl.attachShader(program, vertexShader);
            this.gl.attachShader(program, fragmentShader);
            this.gl.linkProgram(program);
            
            if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
                console.error('Program linking error:', this.gl.getProgramInfoLog(program));
                return null;
            }
            return program;
        }
        
        initGeometry() {
            const vertices = new Float32Array([
                -1, -1,
                 3, -1,
                -1,  3
            ]);
            
            this.vao = this.gl.createVertexArray();
            this.gl.bindVertexArray(this.vao);
            
            const buffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
            
            this.gl.enableVertexAttribArray(0);
            this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
        }
        
        setupUniforms() {
            this.uniforms = {
                iResolution: this.gl.getUniformLocation(this.program, 'iResolution'),
                iTime: this.gl.getUniformLocation(this.program, 'iTime'),
                iTransition: this.gl.getUniformLocation(this.program, 'iTransition')
            };
        }
        
        setState1Balls() {
            this.targetTransition = 0.0;
        }
        
        setState2Balls() {
            this.targetTransition = 1.0;
        }
        
        setState(state) {
            this.currentState = state;
            if (state === 1) {
                this.setState1Balls();
            } else {
                this.setState2Balls();
            }
        }
        
        updateTransition() {
            // Smooth interpolation towards target
            const speed = 0.05;
            this.transitionProgress += (this.targetTransition - this.transitionProgress) * speed;
        }
        
        resize() {
            const container = this.canvas.parentElement;
            const rect = container.getBoundingClientRect();
            
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
            
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.gl.uniform3f(this.uniforms.iResolution, this.canvas.width, this.canvas.height, 0);
        }
        
        animate() {
            this.animationTime += 0.016;
            this.updateTransition();
            
            this.gl.clearColor(0, 0, 0, 0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
            
            this.gl.useProgram(this.program);
            this.gl.bindVertexArray(this.vao);
            
            // Update uniforms
            this.gl.uniform1f(this.uniforms.iTime, this.animationTime);
            this.gl.uniform1f(this.uniforms.iTransition, this.transitionProgress);
            
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
            
            requestAnimationFrame(() => this.animate());
        }
    }

    // Helper function to check if we're on Perplexity homepage
    function isPerplexityHomepage(url) {
        if (!url) return false;
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.includes('perplexity.ai') && 
                   (urlObj.pathname === '/' || urlObj.pathname === '' || urlObj.pathname === '/search');
        } catch (e) {
            return false;
        }
    }

    // Helper function to check if we're on ChatGPT default page
    function isChatGPTDefaultPage() {
        if (!window.location.href.includes('chatgpt.com') && !window.location.href.includes('openai.com')) {
            return false;
        }
        
        try {
            const urlObj = new URL(window.location.href);
            // Check if we're on the homepage or a page without a conversation ID
            return urlObj.pathname === '/' || 
                   urlObj.pathname === '' || 
                   urlObj.pathname === '/auth/login' ||
                   (!urlObj.pathname.includes('/c/') && !urlObj.pathname.includes('/chat/'));
        } catch (e) {
            return false;
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
    
    // Handle SPA navigation (optimized)
    let lastUrl = location.href;
    let reinitTimeout = null;
    
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            const previousUrl = lastUrl;
            lastUrl = url;
            
            // Debounce re-initialization to avoid excessive calls
            if (reinitTimeout) {
                clearTimeout(reinitTimeout);
            }
            
            reinitTimeout = setTimeout(() => {
                // Only re-initialize if we're still on a supported platform
                const currentPlatform = detectPlatform();
                if (currentPlatform !== 'unknown') {
                    init();
                }
            }, 3000); // Increased delay to reduce frequency
        }
    }).observe(document, { subtree: true, childList: true });

    // --- Selection Mode Management --- //
    function enterSelectionMode() {
        // Save the current filter state before entering selection mode
        previousFilterState = messageFilterState;
        console.log('Threadly: Saved previous state:', previousFilterState);
        
        isInSelectionMode = true;
        // Don't reset selectedMessageIds - user might have already selected messages
        selectedCollectionIds = []; // Reset collection selection
        
        // Determine selection context based on current view
        console.log('Threadly: enterSelectionMode - isInCollectionsView:', isInCollectionsView, 'currentCollectionId:', currentCollectionId);
        
        if (isInCollectionsView && currentCollectionId) {
            // We're viewing messages within a specific collection - show DELETE | CANCEL for bulk deletion of messages
            selectionContext = 'messages-in-collection';
            console.log('Threadly: Entering selection mode for messages in collection:', currentCollectionId);
        } else if (isInCollectionsView && !currentCollectionId) {
            // We're viewing the collections list - show DELETE | CANCEL for bulk deletion of collections
            selectionContext = 'collections';
            console.log('Threadly: Entering selection mode for collections');
        } else {
            // We're in the main messages view (not in collections)
            selectionContext = 'main-messages'; // Main messages view for assignment
            console.log('Threadly: Entering selection mode for messages in main view');
        }
        
        
        console.log('Threadly: Selection context set to:', selectionContext);
        
        // Show checkboxes on all messages
        document.body.classList.add('selection-mode');
        
        // Morph navbar based on selection context
        console.log('Threadly: About to morph navbar, selectionContext:', selectionContext);
        if (selectionContext === 'collections' || selectionContext === 'messages-in-collection') {
            console.log('Threadly: Calling morphNavbarToDeleteMode');
            morphNavbarToDeleteMode();
        } else if (selectionContext === 'main-messages') {
            console.log('Threadly: Calling morphNavbarToSelectionMode');
            morphNavbarToSelectionMode();
        }
        
        // Update select button to show it's in close mode (square to X)
        const selectBulb = document.getElementById('threadly-select-bulb');
        if (selectBulb) {
            selectBulb.title = 'Click to exit selection mode';
            selectBulb.setAttribute('data-mode', 'close');
            selectBulb.classList.remove('square');
            selectBulb.classList.add('close');
        }
        
        // Update checkbox states
        updateCheckboxStates();
        
        // Also call updateCheckboxStates after a delay to ensure DOM is ready
        setTimeout(() => {
            updateCheckboxStates();
        }, 200);
        
        // Update selection info
        updateSelectionInfo();
        
        // Update the cursor style for all message items
        const messageItems = document.querySelectorAll('.threadly-message-item');
        messageItems.forEach(item => {
            if (isInSelectionMode) {
                item.style.cursor = 'pointer';
                item.title = 'Click to select message';
            } else {
                item.style.cursor = 'default';
                item.title = '';
            }
        });
        
        console.log('Threadly: Entered selection mode');
    }

    // New function for targeted UI reset without changing view context
    async function resetSelectionUI() {
        isInSelectionMode = false;
        selectedMessageIds = [];
        selectedCollectionIds = [];
        selectionContext = null;

        // Hide checkboxes and remove selection styling
        document.body.classList.remove('selection-mode');
        const collectionPills = document.querySelectorAll('.threadly-collection-pill');
        collectionPills.forEach(pill => pill.classList.remove('selected-for-deletion'));

        // Update select bulb to show it's in select mode (X to square)
        const selectBulb = document.getElementById('threadly-select-bulb');
        if (selectBulb) {
            selectBulb.title = 'Enable selection mode';
            selectBulb.setAttribute('data-mode', 'select');
            selectBulb.classList.remove('close');
            selectBulb.classList.add('square');
        }

        // Morph navbar back to the appropriate state for the current view
        if (savedButtonActive) {
            morphNavbarToSavedState();
        } else {
            resetNavbarToOriginal();
        }
        
        updateSelectionInfo(); // Clears the "X items selected" text
        console.log('Threadly: Selection UI has been reset.');
    }
    
    async function exitSelectionMode() {
        isInSelectionMode = false;
        selectedMessageIds = [];
        selectedCollectionIds = []; // Reset collection selection
        selectionContext = null; // Reset selection context
        
        // Reset assign mode
        isAssigningMode = false;
        
        // Hide checkboxes
        document.body.classList.remove('selection-mode');
        
        // Uncheck all checkboxes
        const checkboxes = document.querySelectorAll('.threadly-message-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Remove selection styling from collection pills
        const collectionPills = document.querySelectorAll('.threadly-collection-pill');
        collectionPills.forEach(pill => {
            pill.classList.remove('selected-for-deletion');
        });
        
        // Update select button to show it's in select mode (X to square)
        const selectBulb = document.getElementById('threadly-select-bulb');
        if (selectBulb) {
            selectBulb.title = 'Enable selection mode';
            selectBulb.setAttribute('data-mode', 'select');
            selectBulb.classList.remove('close');
            selectBulb.classList.add('square');
        }
        
        // Check if we should stay in SAVED state or return to original state
        if (isInCollectionsView) {
            // We're in collections view, check if we're viewing a specific collection
            if (currentCollectionId) {
                // We're viewing a specific collection, hide the toggle bar
                console.log('Threadly: Viewing collection, hiding toggle bar after exiting selection mode');
                const toggleBar = document.getElementById('threadly-toggle-bar');
                if (toggleBar) {
                    toggleBar.style.display = 'none';
                }
            } else {
                // We're in the main collections view, show the SAVED state
                console.log('Threadly: Staying in SAVED state after exiting selection mode');
                morphNavbarToSavedState();
            }
        } else {
            // We're in main messages view, restore the previous filter state
            console.log('Threadly: Restoring previous state:', previousFilterState);
            messageFilterState = previousFilterState; // Set the state before resetting navbar
            
            // Morph navbar back to original YOU | AI | FAV with correct state
            resetNavbarToOriginal();
            
            // Filter messages to show the correct state
            await filterMessages('');
        }
        
        // Update checkbox states
        updateCheckboxStates();
        
        // Update selection info
        updateSelectionInfo();
        
        // Reset cursor style for all message items
        const messageItems = document.querySelectorAll('.threadly-message-item');
        messageItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.title = 'Click to scroll to message';
        });
        
        console.log('Threadly: Exited selection mode and restored to:', previousFilterState);
    }




    // Function to enter assignment mode
    async function enterAssignmentMode() {
        console.log('Threadly: enterAssignmentMode called with selectedMessageIds:', selectedMessageIds);
        if (selectedMessageIds.length === 0) {
            console.log('Threadly: No messages selected, returning');
            return;
        }
        
        try {
            isAssigningMode = true;
            console.log('Threadly: Set isAssigningMode to true');
            
            // Store the current filter state before switching
            const previousFilterState = messageFilterState;
            console.log('Threadly: Storing previous filter state:', previousFilterState);
            
            // Set SAVED button as active to show collections
            setSavedButtonActive(true);
            
            // Morph UI to SAVED state with animation
            morphToSavedState();
            console.log('Threadly: Called morphToSavedState');
            
            // Force the filter state to 'saved' to prevent reversion
            messageFilterState = 'saved';
            console.log('Threadly: Set messageFilterState to saved');
            
            // Update panel data-filter attribute for CSS targeting
            if (panel) {
                panel.setAttribute('data-filter', 'saved');
                console.log('Threadly: Set panel data-filter to saved');
            }
            
            // Switch to SAVED state and show collections with assignment mode
            await renderCollectionsView(true); // true = isAssigning mode
            console.log('Threadly: Switched to SAVED state with assignment mode');
            
            // Morph navbar to show ADD NEW | BACK for normal SAVED state
            morphNavbarToSavedState();
            console.log('Threadly: Entered assignment mode');
            
        } catch (error) {
            console.error('Threadly: Error in enterAssignmentMode:', error);
            // Reset state on error
            isAssigningMode = false;
            setSavedButtonActive(false);
        }
    }

    // Function to morph navbar to selection mode (ASSIGN TO | UNSTAR)
    function morphNavbarToSelectionMode() {
        console.log('Threadly: morphNavbarToSelectionMode called');
        const toggleBar = document.getElementById('threadly-toggle-bar');
        if (!toggleBar) {
            console.error('Threadly: Toggle bar not found');
            return;
        }

        
        // Add morphing class for animation
        toggleBar.classList.add('morphed');
        
        // Create ASSIGN TO | CANCEL layout
        toggleBar.innerHTML = `
            <div class="threadly-toggle-label assign-to">
                <span class="threadly-toggle-text">ASSIGN TO</span>
            </div>
            <div class="threadly-toggle-label cancel">
                <span class="threadly-toggle-text">CANCEL</span>
            </div>
        `;

        // Add event listeners for the new buttons
        const assignBtn = toggleBar.querySelector('.assign-to');
        const cancelBtn = toggleBar.querySelector('.cancel');
        
        if (assignBtn) {
            assignBtn.addEventListener('click', () => {
                console.log('Threadly: ASSIGN TO button clicked');
                console.log('Threadly: selectedMessageIds.length:', selectedMessageIds.length);
                console.log('Threadly: selectedMessageIds:', selectedMessageIds);
                
                if (selectedMessageIds.length > 0) {
                    console.log('Threadly: Calling enterAssignmentMode');
                    enterAssignmentMode();
                } else {
                    console.log('Threadly: No messages selected, showing error');
                    showToast('Please select at least one message first');
                }
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                exitSelectionMode();
            });
        }

        // Update button states based on selection
        updateSelectionModeButtonStates();
        
        console.log('Threadly: Navbar morphed to selection mode');
    }

    // Function to update button states in selection mode
    function updateSelectionModeButtonStates() {
        const toggleBar = document.getElementById('threadly-toggle-bar');
        if (!toggleBar) return;
        
        const assignBtn = toggleBar.querySelector('.assign-to');
        const cancelBtn = toggleBar.querySelector('.cancel');
        
        const hasSelection = selectedMessageIds.length > 0;
        
        if (assignBtn) {
            assignBtn.disabled = !hasSelection;
            assignBtn.style.opacity = hasSelection ? '1' : '0.5';
            assignBtn.style.cursor = hasSelection ? 'pointer' : 'not-allowed';
        }
        
        // CANCEL button is always enabled
        if (cancelBtn) {
            cancelBtn.disabled = false;
            cancelBtn.style.opacity = '1';
            cancelBtn.style.cursor = 'pointer';
        }
    }

    // Function to update delete mode button states
    function updateDeleteModeButtonStates() {
        console.log('Threadly: updateDeleteModeButtonStates called');
        console.log('Threadly: selectionContext:', selectionContext);
        console.log('Threadly: selectedMessageIds:', selectedMessageIds);
        console.log('Threadly: selectedCollectionIds:', selectedCollectionIds);
        
        const toggleBar = document.getElementById('threadly-toggle-bar');
        if (!toggleBar) {
            console.log('Threadly: toggleBar not found');
            return;
        }
        
        const deleteBtn = toggleBar.querySelector('.delete');
        const cancelBtn = toggleBar.querySelector('.cancel');
        
        let hasSelection = false;
        if (selectionContext === 'messages-in-collection') {
            hasSelection = selectedMessageIds.length > 0;
            console.log('Threadly: messages-in-collection context, hasSelection:', hasSelection);
        } else if (selectionContext === 'collections') {
            hasSelection = selectedCollectionIds.length > 0;
            console.log('Threadly: collections context, hasSelection:', hasSelection);
        }
        
        if (deleteBtn) {
            deleteBtn.disabled = !hasSelection;
            deleteBtn.style.opacity = hasSelection ? '1' : '0.5';
            deleteBtn.style.cursor = hasSelection ? 'pointer' : 'not-allowed';
            console.log('Threadly: Delete button updated - disabled:', deleteBtn.disabled, 'opacity:', deleteBtn.style.opacity);
        } else {
            console.log('Threadly: Delete button not found');
        }
        
        // CANCEL button is always enabled
        if (cancelBtn) {
            cancelBtn.disabled = false;
            cancelBtn.style.opacity = '1';
            cancelBtn.style.cursor = 'pointer';
        }
    }

    // Function to morph navbar to assignment mode (ADD NEW | CANCEL)
    function morphNavbarToAssignmentMode() {
        console.log('Threadly: morphNavbarToAssignmentMode called');
        const toggleBar = document.getElementById('threadly-toggle-bar');
        if (!toggleBar) {
            console.error('Threadly: Toggle bar not found');
            return;
        }

        
        // Add morphing class for animation
        toggleBar.classList.add('morphed');
        
        // Create ADD NEW | CANCEL layout
        toggleBar.innerHTML = `
            <div class="threadly-toggle-label add">
                <span class="threadly-toggle-text">ADD NEW</span>
            </div>
            <div class="threadly-toggle-label cancel">
                <span class="threadly-toggle-text">CANCEL</span>
            </div>
        `;

        // Add event listeners
        const labels = toggleBar.querySelectorAll('.threadly-toggle-label');
        const toggleSegment = document.querySelector('.threadly-toggle-segment');
        
        if (labels[0]) {
            labels[0].addEventListener('click', () => {
                // Move highlight bubble to ADD NEW
                if (toggleSegment) {
                    toggleSegment.style.left = '2px';
                    toggleSegment.style.width = 'calc(50% - 2px)';
                }
                handleAddNewClick();
            });
        }
        if (labels[1]) {
            labels[1].addEventListener('click', () => {
                // Move highlight bubble to CANCEL
                if (toggleSegment) {
                    toggleSegment.style.left = 'calc(50% + 2px)';
                    toggleSegment.style.width = 'calc(50% - 2px)';
                    toggleSegment.classList.add('cancel');
                }
                cancelAssignment();
            });
        }

        console.log('Threadly: Navbar morphed to assignment mode');
    }

    // Function to morph UI to SAVED state
    function morphToSavedState() {
        console.log('Threadly: morphToSavedState called');
        const panel = document.getElementById('threadly-panel');
        if (panel) {
            console.log('Threadly: Found panel, adding saved-state class');
            panel.classList.add('saved-state');
            console.log('Threadly: Panel classes after morph:', panel.className);
            
            // Also update the data-filter attribute to ensure consistency
            panel.setAttribute('data-filter', 'saved');
            console.log('Threadly: Set panel data-filter to saved');
        } else {
            console.error('Threadly: Panel not found in morphToSavedState');
        }
    }

    // Function to morph navbar to delete mode (DELETE | CANCEL)
    function morphNavbarToDeleteMode() {
        console.log('Threadly: morphNavbarToDeleteMode called');
        const toggleBar = document.getElementById('threadly-toggle-bar');
        if (!toggleBar) {
            console.error('Threadly: Toggle bar not found');
            return;
        }

        // Make the toggle bar visible (it might be hidden when viewing collections)
        toggleBar.style.display = 'flex';
        
        // Add morphing class for animation
        toggleBar.classList.add('morphed');
        
        // Create DELETE | CANCEL layout (same approach as morphNavbarToSelectionMode)
        toggleBar.innerHTML = `
            <div class="threadly-toggle-label delete">
                <span class="threadly-toggle-text">DELETE</span>
            </div>
            <div class="threadly-toggle-label cancel">
                <span class="threadly-toggle-text">CANCEL</span>
            </div>
        `;

        // Add event listeners for the new buttons
        const deleteBtn = toggleBar.querySelector('.delete');
        const cancelBtn = toggleBar.querySelector('.cancel');
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                console.log('Threadly: Delete button clicked');
                console.log('Threadly: selectionContext:', selectionContext);
                console.log('Threadly: selectedMessageIds:', selectedMessageIds);
                console.log('Threadly: selectedMessageIds length:', selectedMessageIds.length);
                console.log('Threadly: selectedCollectionIds:', selectedCollectionIds);
                
                if (selectionContext === 'messages-in-collection' && selectedMessageIds.length > 0) {
                    console.log('Threadly: Calling deleteSelectedMessagesFromCollection');
                    console.log('Threadly: About to delete messages:', selectedMessageIds);
                    console.log('Threadly: From collection:', currentCollectionId);
                    deleteSelectedMessagesFromCollection();
                } else if (selectionContext === 'collections' && selectedCollectionIds.length > 0) {
                    console.log('Threadly: Calling deleteSelectedCollections');
                    deleteSelectedCollections();
                } else {
                    console.log('Threadly: Delete button clicked but no valid selection found');
                    console.log('Threadly: selectionContext:', selectionContext);
                    console.log('Threadly: selectedMessageIds.length:', selectedMessageIds.length);
                    console.log('Threadly: selectedCollectionIds.length:', selectedCollectionIds.length);
                }
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                exitSelectionMode();
            });
        }

        // Update button states based on selection
        updateDeleteModeButtonStates();
        
        console.log('Threadly: Navbar morphed to delete mode');
    }

    // Function to morph navbar to saved state (ADD NEW | CANCEL)
    function morphNavbarToSavedState() {
        console.log('Threadly: morphNavbarToSavedState called');
        const toggleBar = document.getElementById('threadly-toggle-bar');
        if (!toggleBar) {
            console.error('Threadly: Toggle bar not found');
            return;
        }

        // Ensure the toggle bar is visible
        toggleBar.style.display = 'flex';
        
        // Add morphing class for animation
        toggleBar.classList.add('morphed');
        
        // Update the toggle segment for highlight bubble
        const toggleSegment = toggleBar.querySelector('.threadly-toggle-segment');
        if (toggleSegment) {
            toggleSegment.className = 'threadly-toggle-segment';
            toggleSegment.style.left = '2px';
            toggleSegment.style.width = 'calc(50% - 2px)';
        }
        
        // Update the labels to show only 2 sections (50/50 split)
        const labels = toggleBar.querySelectorAll('.threadly-toggle-label');
        if (labels.length >= 2) {
            // Add fly-in animation by setting initial state
            labels[0].style.opacity = '0';
            labels[0].style.transform = 'translateY(20px) scale(0.9)';
            labels[1].style.opacity = '0';
            labels[1].style.transform = 'translateY(20px) scale(0.9)';
            
            labels[0].textContent = 'ADD NEW';
            labels[0].className = 'threadly-toggle-label add';
            labels[1].textContent = 'BACK';
            labels[1].className = 'threadly-toggle-label back';
            
            // Hide any additional labels
            for (let i = 2; i < labels.length; i++) {
                labels[i].style.display = 'none';
            }
            
            // Animate in with fly-in effect
            setTimeout(() => {
                labels[0].style.opacity = '1';
                labels[0].style.transform = 'translateY(0) scale(1)';
                labels[1].style.opacity = '1';
                labels[1].style.transform = 'translateY(0) scale(1)';
            }, 50);
        }

        // Add event listeners for the new buttons
        if (labels && labels.length >= 2) {
            if (labels[0]) {
                labels[0].addEventListener('click', () => {
                    // Move highlight bubble to ADD NEW
                    if (toggleSegment) {
                        toggleSegment.style.left = '2px';
                        toggleSegment.style.width = 'calc(50% - 2px)';
                    }
                    handleAddNewClick();
                });
            }
            if (labels[1]) {
                labels[1].addEventListener('click', () => {
                    // Move highlight bubble to CANCEL
                    if (toggleSegment) {
                        toggleSegment.style.left = 'calc(50% + 2px)';
                        toggleSegment.style.width = 'calc(50% - 2px)';
                        toggleSegment.classList.add('cancel');
                    }
                    
                    // BACK button - check if we're in assignment mode
                    if (isAssigningMode) {
                        console.log('Threadly: BACK clicked in assignment mode - calling cancelAssignment()');
                        cancelAssignment();
                    } else {
                        console.log('Threadly: BACK clicked - calling exitSavedState()');
                        // Call exitSavedState() which properly handles going back to previous state
                        // while keeping the saved state active (like double-clicking the bulb)
                        exitSavedState();
                    }
                    
                    console.log('Threadly: BACK - returned to previous state');
                });
            }
        } else {
            console.error('Threadly: Not enough labels found in morphNavbarToSavedState');
        }

        console.log('Threadly: Navbar morphed to saved state');
    }

    // Function to handle ADD NEW button click
    function handleAddNewClick() {
        console.log('Threadly: ADD NEW clicked');
        
        // Ensure we stay in collections view when entering input mode
        if (!isInCollectionsView) {
            console.log('Threadly: ADD NEW - ensuring collections view is active');
            renderCollectionsView();
        }
        
        morphNavbarToInputMode();
    }

    // Function to cancel saved state - same pattern as selection mode
    function cancelSavedState() {
        exitSavedState();
    }

    // Function to exit saved state - same pattern as exitAssignmentMode
    function exitSavedState() {
        // Exit selection mode if active when exiting saved state
        if (isInSelectionMode) {
            console.log('Threadly: Exiting selection mode due to exiting saved state');
            exitSelectionMode();
        }
        
        // Reset navbar to original YOU AI FAV state
        resetNavbarToOriginal();
        
        // Restore the previous state if we have it, otherwise default to YOU
        if (previousStateBeforeSaved && previousFilterStateBeforeSaved) {
            messageFilterState = previousFilterStateBeforeSaved;
            console.log('Threadly: exitSavedState - Restored filter state to:', messageFilterState);
        } else {
            // Set YOU state as active (user messages) as fallback
            selectFilterState('user');
        }
        
        // Clear the remembered state
        previousStateBeforeSaved = null;
        previousFilterStateBeforeSaved = null;
        
        // DO NOT call setSavedButtonActive(false) - this closes the extension!
        // Just reset the navbar and go to previous state
        
        console.log('Threadly: Exited saved state - returned to previous state');
    }

    // Function to handle CANCEL button click
    function handleCancelClick() {
        console.log('Threadly: CANCEL clicked');
        
        // Reset navbar to original YOU AI FAV state
        resetNavbarToOriginal();
        
        // Exit saved state
        setSavedButtonActive(false);
        
        // Restore the previous state if we have it, otherwise default to YOU
        if (previousStateBeforeSaved && previousFilterStateBeforeSaved) {
            messageFilterState = previousFilterStateBeforeSaved;
            console.log('Threadly: CANCEL - Restored filter state to:', messageFilterState);
        } else {
            // Set YOU state as active (user messages) as fallback
            selectFilterState('user');
        }
        
        // Clear the remembered state
        previousStateBeforeSaved = null;
        previousFilterStateBeforeSaved = null;
        
        console.log('Threadly: CANCEL - returned to previous state');
    }

    // Function to morph navbar to input mode (pill with + button inside)
    function morphNavbarToInputMode() {
        console.log('Threadly: morphNavbarToInputMode called');
        const toggleBar = document.getElementById('threadly-toggle-bar');
        if (!toggleBar) {
            console.error('Threadly: Toggle bar not found');
            return;
        }

        // Add morphing class for smooth transition
        toggleBar.classList.add('morphing-to-input');
        
        // Create seamless input field and add button layout
        toggleBar.innerHTML = `
            <div class="threadly-toggle-label input-field">
                <input type="text" class="threadly-collection-input" placeholder="Type collection name..." id="collectionNameInput">
            </div>
            <div class="threadly-toggle-label add-button">
                <button class="threadly-add-collection-btn" id="addCollectionBtn">
                    <span class="plus-icon">+</span>
                </button>
            </div>
        `;

        // Add event listeners
        const input = toggleBar.querySelector('#collectionNameInput');
        const addBtn = toggleBar.querySelector('#addCollectionBtn');
        
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addNewCollection();
                }
            });
            input.addEventListener('blur', () => {
                // Only return to ADD NEW | CANCEL if input is empty AND we're not in SAVED state
                if (!input.value.trim() && !savedButtonActive) {
                    morphNavbarToSavedState();
                }
            });
            // Focus the input
            setTimeout(() => input.focus(), 100);
        }
        
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                // Add click animation
                addBtn.classList.add('clicked');
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    addBtn.classList.remove('clicked');
                }, 400); // Match animation duration
                
                // Call the original function
                addNewCollection();
            });
        }

        // Add click outside handler to return to ADD NEW | CANCEL state
        const clickOutsideHandler = (e) => {
            if (!toggleBar.contains(e.target) && !savedButtonActive) {
                morphNavbarToSavedState();
                document.removeEventListener('click', clickOutsideHandler);
            }
        };
        
        // Add the click outside handler after a small delay to prevent immediate triggering
        setTimeout(() => {
            document.addEventListener('click', clickOutsideHandler);
        }, 100);

        console.log('Threadly: Navbar morphed to input mode');
    }

    // Function to reset navbar to original state
    function resetNavbarToOriginal() {
        console.log('Threadly: resetNavbarToOriginal called');
        const toggleBar = document.getElementById('threadly-toggle-bar');
        if (!toggleBar) {
            console.error('Threadly: Toggle bar not found');
            return;
        }

        // Remove any morphing classes
        toggleBar.classList.remove('morphed', 'morphing-to-input', 'morphing-to-selection', 'returning-from-input', 'returning-from-selection');
        
        // Reset to original HTML
        toggleBar.innerHTML = `
            <div class="threadly-toggle-segment" id="threadly-toggle-segment"></div>
            <span class="threadly-toggle-label you">YOU</span>
            <span class="threadly-toggle-label ai">AI</span>
            <span class="threadly-toggle-label fav">FAV</span>
        `;

        // Re-acquire the reference to the new element
        toggleSegment = document.getElementById('threadly-toggle-segment');

        // Set the segment class based on current filter state
        if (toggleSegment) {
            toggleSegment.classList.remove('user', 'assistant', 'fav', 'collection');
            toggleSegment.classList.add(messageFilterState === 'user' ? 'user' : messageFilterState === 'assistant' ? 'assistant' : messageFilterState === 'favorites' ? 'fav' : 'collection');
            console.log('Threadly: Set segment class to:', messageFilterState);
        }

        // Set panel data-filter attribute for CSS targeting
        const panel = document.getElementById('threadly-panel');
        if (panel) {
            panel.setAttribute('data-filter', messageFilterState);
            console.log('Threadly: Set panel data-filter to:', messageFilterState);
        }

        // Re-add original event listeners
        addToggleBarEventListeners();

        console.log('Threadly: Navbar reset to original state');
    }

    // Function to add toggle bar event listeners
    function addToggleBarEventListeners() {
        const toggleBar = document.getElementById('threadly-toggle-bar');
        if (!toggleBar) return;

        // Remove any existing event listeners to prevent duplicates
        const newToggleBar = toggleBar.cloneNode(true);
        toggleBar.parentNode.replaceChild(newToggleBar, toggleBar);

        // Add click listeners for each label to allow direct selection
        newToggleBar.addEventListener('click', async (e) => {
            if (e.target.classList.contains('threadly-toggle-label')) {
                if (e.target.classList.contains('user') || e.target.classList.contains('you')) {
                    await selectFilterState('user');
                } else if (e.target.classList.contains('assistant') || e.target.classList.contains('ai')) {
                    await selectFilterState('assistant');
                } else if (e.target.classList.contains('fav')) {
                    await selectFilterState('favorites');
                }
            }
        });
    }

    // Function to add new collection
    async function addNewCollection() {
        const input = document.getElementById('collectionNameInput');
        if (!input) {
            console.error('Threadly: Collection name input not found');
            return;
        }

        const collectionName = input.value.trim();
        if (!collectionName) {
            console.log('Threadly: No collection name provided');
            return;
        }

        try {
            // Create new collection
            const newCollection = {
                id: 'collection_' + Date.now(),
                name: collectionName,
                createdAt: Date.now(),
                platform: currentPlatformId,
                messageIds: []
            };

            // Load existing collections
            let collections = await loadCollectionsFromStorage();
            collections.push(newCollection);
            
            // Save to storage
            await saveCollectionsToStorage(collections);
            
            console.log('Threadly: Created new collection:', collectionName);
            
            // Check if we're in assignment mode - if so, automatically assign selected messages to the new collection
            if (isAssigningMode && selectedMessageIds.length > 0) {
                console.log('Threadly: In assignment mode - automatically assigning', selectedMessageIds.length, 'messages to new collection:', collectionName);
                
                // Assign the selected messages to the newly created collection
                const messagesAddedCount = await assignMessagesToCollection(newCollection.id);
                console.log('Threadly: Assigned', messagesAddedCount, 'messages to new collection:', collectionName);
                
                // Finalize the assignment and return to collections view
                await finalizeAssignmentAndReturnToCollections(newCollection.id, messagesAddedCount);
                
            } else {
                // Normal collection creation flow - show success feedback and stay in SAVED state
                showToast(`The collection "${collectionName}" has been created`);
                
                // Stay in SAVED state and re-render collections with a small delay for smooth transition
                setTimeout(async () => {
                    morphNavbarToSavedState();
                    await renderCollectionsView();
                }, 100);
            }
            
        } catch (error) {
            console.error('Threadly: Error creating collection:', error);
        }
    }

    // Function to enter input mode for new collection
    function enterInputMode() {
        console.log('Threadly: enterInputMode called');
        
        // Find the bottom navbar and transform it to input mode
        const bottomNavbar = document.querySelector('.threadly-bottom-navbar');
        if (!bottomNavbar) {
            console.error('Threadly: Bottom navbar not found for input mode');
            return;
        }
        
        // Transform to input mode: [Text Input] [+]
        bottomNavbar.innerHTML = `
            <input type="text" class="navbar-input" placeholder="Type collection name..." id="collectionNameInput" style="
                flex: 1;
                background: transparent;
                border: none;
                outline: none;
                padding: 16px 24px;
                font-size: 16px;
                color: white;
                border-radius: 25px;
                background: transparent;
                border: 1px solid transparent;
            ">
            <button class="add-collection-btn" id="add-collection-btn" style="
                background: transparent;
                border: none;
                width: 52px;
                height: 52px;
                border-radius: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                flex-shrink: 0;
                margin-left: 12px;
            ">
                <span class="plus-icon" style="color: white; font-size: 24px; font-weight: 300;">+</span>
            </button>
        `;
        
        // Add event listener for the add button
        const addBtn = bottomNavbar.querySelector('#add-collection-btn');
        if (addBtn) {
            addBtn.addEventListener('click', async (e) => {
                // Add click animation
                addBtn.classList.add('clicked');
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    addBtn.classList.remove('clicked');
                }, 400); // Match animation duration
                
                await addNewCollection();
            });
        }
        
        // Focus on input and add enter key support
        setTimeout(() => {
            const input = bottomNavbar.querySelector('#collectionNameInput');
            if (input) {
                input.focus();
                
                input.addEventListener('keypress', async (e) => {
                    if (e.key === 'Enter') {
                        await addNewCollection();
                    }
                });
            }
        }, 100);
        
        console.log('Threadly: Entered input mode for new collection');
    }


    // Function to show assignment navbar
    async function showAssignmentNavbar() {
        console.log('Threadly: showAssignmentNavbar called');
        const navbar = document.getElementById('threadly-bottom-navbar');
        if (!navbar) {
            console.error('Threadly: Bottom navbar not found!');
            return;
        }
        console.log('Threadly: Found bottom navbar, proceeding with assignment view');

        // Clear existing content
        navbar.innerHTML = '';

        // Create the main assignment view container
        const assignmentView = document.createElement('div');
        assignmentView.className = 'assignment-view';
        assignmentView.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: 100%;
        `;

        // Add title
        const title = document.createElement('div');
        title.textContent = 'Assign to Collection';
        title.style.cssText = `
            color: white;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
            margin-bottom: 8px;
        `;
        assignmentView.appendChild(title);

        // Get existing collections from Chrome storage
        let collections = [];
        try {
            collections = await loadCollectionsFromStorage();
        } catch (error) {
            console.error('Threadly: Error loading collections for assignment:', error);
            collections = [];
        }
        
        if (collections.length > 0) {
            // Add subtitle for existing collections
            const subtitle = document.createElement('div');
            subtitle.textContent = 'Choose existing collection:';
            subtitle.style.cssText = `
                color: transparent;
                font-size: 14px;
                text-align: center;
                margin-bottom: 12px;
            `;
            assignmentView.appendChild(subtitle);

            // Create existing collections list
            const collectionsList = document.createElement('div');
            collectionsList.className = 'existing-collections-list';
            collectionsList.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-height: 200px;
                overflow-y: auto;
                margin-bottom: 16px;
            `;

            collections.forEach((collection, index) => {
                const collectionItem = document.createElement('div');
                collectionItem.className = 'existing-collection-item';
                collectionItem.style.cssText = `
                    background: ${getPlatformCollectionColor(index)};
                    border: 1px solid ${getPlatformCollectionColor(index).replace('0.3', '0.6')};
                    border-radius: 20px;
                    padding: 12px 16px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                `;

                const collectionName = document.createElement('span');
                collectionName.textContent = collection.name;
                collectionName.style.cssText = `
                    color: white;
                    font-size: 14px;
                    font-weight: 500;
                `;

                const messageCount = document.createElement('span');
                messageCount.textContent = `${collection.messageCount || 0} messages`;
                messageCount.style.cssText = `
                    color: transparent;
                    font-size: 12px;
                `;

                collectionItem.appendChild(collectionName);
                collectionItem.appendChild(messageCount);

                // Add hover effect
                collectionItem.addEventListener('mouseenter', () => {
                    collectionItem.style.transform = 'translateY(-2px)';
                    collectionItem.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                });

                collectionItem.addEventListener('mouseleave', () => {
                    collectionItem.style.transform = 'translateY(0)';
                    collectionItem.style.boxShadow = 'none';
                });

                // Add click handler to assign to this collection
                collectionItem.addEventListener('click', async () => {
                    const messagesAddedCount = await assignMessagesToCollection(collection.id);
                    if (messagesAddedCount > 0) {
                        const collectionName = await getCollectionName(collection.id);
                        showToast(`Added ${messagesAddedCount} message(s) to '${collectionName}'`);
                    }
                });

                collectionsList.appendChild(collectionItem);
            });

            assignmentView.appendChild(collectionsList);
        }

        // Add divider
        const divider = document.createElement('div');
        divider.style.cssText = `
            height: 1px;
            background: transparent;
            margin: 8px 0;
        `;
        assignmentView.appendChild(divider);

        // Add subtitle for new collection
        const newCollectionSubtitle = document.createElement('div');
        newCollectionSubtitle.textContent = 'Or create new collection:';
        newCollectionSubtitle.style.cssText = `
            color: transparent;
            font-size: 14px;
            text-align: center;
            margin-bottom: 12px;
        `;
        assignmentView.appendChild(newCollectionSubtitle);

        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: center;
        `;

        // ADD NEW button
        const addNewBtn = document.createElement('button');
        addNewBtn.id = 'threadly-add-new-btn';
        addNewBtn.textContent = 'ADD NEW';
        addNewBtn.className = 'navbar-button';
        addNewBtn.style.cssText = `
                            background: transparent;
                border: 1px solid transparent;
            color: white;
            padding: 12px 24px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;

        addNewBtn.addEventListener('mouseenter', () => {
                            addNewBtn.style.background = 'transparent';
            addNewBtn.style.transform = 'translateY(-2px)';
        });

        addNewBtn.addEventListener('mouseleave', () => {
                            addNewBtn.style.background = 'transparent';
            addNewBtn.style.transform = 'translateY(0)';
        });

        addNewBtn.addEventListener('click', enterInputMode);

        // CANCEL button
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'threadly-cancel-btn';
        cancelBtn.textContent = 'CANCEL';
        cancelBtn.className = 'navbar-button';
        cancelBtn.style.cssText = `
            background: rgba(239, 68, 68, 0.8);
            border: 1px solid rgba(239, 68, 68, 0.6);
            color: white;
            padding: 12px 24px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;

        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = 'rgba(239, 68, 68, 1)';
            cancelBtn.style.transform = 'translateY(-2px)';
        });

        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = 'rgba(239, 68, 68, 0.8)';
            cancelBtn.style.transform = 'translateY(0)';
        });

        cancelBtn.addEventListener('click', cancelAssignment);

        buttonContainer.appendChild(addNewBtn);
        buttonContainer.appendChild(cancelBtn);
        assignmentView.appendChild(buttonContainer);

        navbar.appendChild(assignmentView);
        navbar.style.display = 'flex';
        navbar.style.opacity = '1';
        navbar.style.transform = 'translateY(0)';
        
        console.log('Threadly: Assignment navbar displayed with content');
        console.log('Threadly: Navbar element:', navbar);
        console.log('Threadly: Assignment view element:', assignmentView);
    }

    // Function to enter input mode for new collection
    function enterInputMode() {
        const bottomNavbar = document.getElementById('threadly-bottom-navbar');
        if (!bottomNavbar) return;
        
        // Transform to State B: [Text Input] [+]
        bottomNavbar.innerHTML = `
            <input type="text" class="navbar-input" placeholder="Type collection name..." id="collectionNameInput">
            <button class="add-collection-btn" id="add-collection-btn">
                <span class="plus-icon">+</span>
            </button>
        `;
        
        // Add event listener for the add button
        const addBtn = bottomNavbar.querySelector('#add-collection-btn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                // Add click animation
                addBtn.classList.add('clicked');
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    addBtn.classList.remove('clicked');
                }, 400); // Match animation duration
                
                addNewCollection();
            });
        }
        
        // Focus on input
        setTimeout(() => {
            const input = document.getElementById('collectionNameInput');
            if (input) {
                input.focus();
                
                // Add enter key support
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        addNewCollection();
                    }
                });
            }
        }, 100);
    }


    // Function to cancel assignment
    function cancelAssignment() {
        try {
            console.log('Threadly: cancelAssignment called');
            
            // Reset assignment mode
            isAssigningMode = false;
            
            // Reset SAVED button state
            setSavedButtonActive(false);
            
            // Reset navbar to original state
            resetNavbarToOriginal();
            
            // Exit selection mode
            exitSelectionMode();
            
            // Return to main messages
            returnToMainMessages();
            
            console.log('Threadly: Assignment cancelled');
        } catch (error) {
            console.error('Threadly: Error in cancelAssignment:', error);
            // Force reset on error
            isAssigningMode = false;
            setSavedButtonActive(false);
        }
    }

    // Function to exit assignment mode
    function exitAssignmentMode() {
        isAssigningMode = false;
        
        // Remove saved state
        const panel = document.getElementById('threadly-panel');
        if (panel) {
            panel.classList.remove('saved-state');
        }
        
        // Hide bottom navbar
        const bottomNavbar = document.getElementById('threadly-bottom-navbar');
        if (bottomNavbar) {
            bottomNavbar.style.opacity = '0';
            bottomNavbar.style.transform = 'translateY(20px)';
            setTimeout(() => {
                bottomNavbar.style.display = 'none';
            }, 400);
        }
        
        // Restore original contextual actions
        restoreOriginalContextualActions();
        
        // Exit selection mode
        exitSelectionMode();
    }

    // Function to show success message
    function showSuccessMessage(message) {
        showToast(message);
    }

    // --- Enhanced Checkbox Management --- //
    function updateCheckboxStates() {
        console.log('Threadly: updateCheckboxStates called');
        console.log('Threadly: isInSelectionMode:', isInSelectionMode);
        
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            const checkboxContainers = document.querySelectorAll('.threadly-message-checkbox-container');
            console.log('Threadly: Found', checkboxContainers.length, 'checkbox containers');
            console.log('Threadly: isInSelectionMode:', isInSelectionMode);
            
            if (checkboxContainers.length === 0) {
                console.log('Threadly: No checkbox containers found! This might be the issue.');
                // Try to find all message items to see if they exist
                const messageItems = document.querySelectorAll('.threadly-message-item');
                console.log('Threadly: Found', messageItems.length, 'message items');
            }
            
            checkboxContainers.forEach((container, index) => {
                if (isInSelectionMode) {
                    // In selection mode, show checkboxes for all messages
                    container.style.display = 'flex';
                    console.log(`Threadly: Showing checkbox container ${index}`);
                    
                    // Add event listener for checkbox changes
                    const checkbox = container.querySelector('.threadly-message-checkbox');
                    const messageId = checkbox ? checkbox.dataset.messageId : null;
                    
                    console.log(`Threadly: Container ${index} - checkbox:`, checkbox, 'messageId:', messageId);
                    
                    if (checkbox && messageId) {
                        console.log(`Threadly: Setting up checkbox for message ${messageId}`);
                        // Remove existing listeners to prevent duplicates
                        checkbox.removeEventListener('change', handleCheckboxChange);
                        checkbox.addEventListener('change', handleCheckboxChange);
                        
                        // Also add click event listener as a fallback
                        checkbox.removeEventListener('click', handleCheckboxClick);
                        checkbox.addEventListener('click', handleCheckboxClick);
                        
                        console.log(`Threadly: Event listeners attached for message ${messageId}`);
                    } else {
                        console.log(`Threadly: Checkbox or messageId not found in container ${index}`, { checkbox, messageId });
                    }
                } else {
                    // Exit selection mode, hide all checkboxes
                    container.style.display = 'none';
                    console.log(`Threadly: Hiding checkbox container ${index}`);
                }
            });
        }, 100); // Small delay to ensure DOM is ready
    }

    // --- Selection Mode Toggle Function --- //
    let lastToggleTime = 0;
    const TOGGLE_DEBOUNCE_TIME = 500; // 500ms debounce
    
    function toggleSelectionMode() {
        const now = Date.now();
        
        // Prevent multiple rapid clicks
        if (now - lastToggleTime < TOGGLE_DEBOUNCE_TIME) {
            console.log('Threadly: Toggle debounced, ignoring rapid click');
            return;
        }
        
        lastToggleTime = now;
        console.log('Threadly: Toggling selection mode, current state:', isInSelectionMode);
        console.log('Threadly: isInCollectionsView:', isInCollectionsView);
        console.log('Threadly: currentCollectionId:', currentCollectionId);
        
        if (isInSelectionMode) {
            exitSelectionMode();
        } else {
            enterSelectionMode();
        }
    }

    function handleCheckboxChange(e) {
        const checkbox = e.target;
        const messageId = checkbox.dataset.messageId;
        const isChecked = checkbox.checked;
        
        console.log('Threadly: Checkbox changed:', { messageId, isChecked, checkbox: checkbox.outerHTML });
        console.log('Threadly: Current selectedMessageIds before change:', [...selectedMessageIds]);
        console.log('Threadly: Current selectionContext:', selectionContext);
        console.log('Threadly: Current currentCollectionId:', currentCollectionId);
        console.log('Threadly: isInSelectionMode:', isInSelectionMode);
        
        if (messageId) {
            console.log('Threadly: Calling toggleMessageSelection for messageId:', messageId, 'isChecked:', isChecked);
            toggleMessageSelection(messageId, isChecked);
            console.log('Threadly: selectedMessageIds after toggleMessageSelection:', [...selectedMessageIds]);
            
            // Update button states based on selection context
            if (selectionContext === 'messages-in-collection' || selectionContext === 'collections') {
                updateDeleteModeButtonStates();
            } else {
                updateSelectionModeButtonStates();
            }
        } else {
            console.log('Threadly: No messageId found for checkbox change');
        }
    }

    function handleCheckboxClick(e) {
        // Fallback click handler for checkboxes
        const checkbox = e.target;
        const messageId = checkbox.dataset.messageId;
        
        console.log('Threadly: Checkbox clicked (fallback):', { messageId, checked: checkbox.checked });
        
        if (messageId) {
            // Use a small delay to ensure the checkbox state has updated
            setTimeout(() => {
                const isChecked = checkbox.checked;
                console.log('Threadly: Fallback handler - messageId:', messageId, 'isChecked:', isChecked);
                toggleMessageSelection(messageId, isChecked);
            }, 10);
        }
    }

    function updateSelectionInfo() {
        const selectionInfo = document.querySelector('.threadly-selection-info');
        const assignBtn = document.getElementById('threadly-assign-btn');
        const unstarBtn = document.getElementById('threadly-unstar-btn');
        
        if (selectionInfo) {
            if (selectedMessageIds.length === 0) {
                selectionInfo.textContent = 'Select items to organize';
            } else {
                selectionInfo.textContent = `${selectedMessageIds.length} item${selectedMessageIds.length === 1 ? '' : 's'} selected`;
            }
        }
        
        if (assignBtn) {
            assignBtn.disabled = selectedMessageIds.length === 0;
            assignBtn.textContent = selectedMessageIds.length > 0 ? 
                `Assign To (${selectedMessageIds.length})` : 'Assign To';
        }
        
        if (unstarBtn) {
            unstarBtn.disabled = selectedMessageIds.length === 0;
        }
        
        // Update delete mode button states if in delete mode
        if (selectionContext === 'messages-in-collection' || selectionContext === 'collections') {
            updateDeleteModeButtonStates();
        }
    }

    function toggleMessageSelection(messageId, checked) {
        console.log('Threadly: toggleMessageSelection called:', { messageId, checked, currentSelected: [...selectedMessageIds] });
        
        const index = selectedMessageIds.indexOf(messageId);
        if (checked) {
            if (index === -1) {
                selectedMessageIds.push(messageId);
                console.log('Threadly: Added message to selection:', messageId);
                console.log('Threadly: selectedMessageIds after adding:', [...selectedMessageIds]);
            }
        } else {
            if (index !== -1) {
                selectedMessageIds.splice(index, 1);
                console.log('Threadly: Removed message from selection:', messageId);
                console.log('Threadly: selectedMessageIds after removing:', [...selectedMessageIds]);
            }
        }
        
        updateSelectionInfo();
        
        // Update button states based on selection context
        if (selectionContext === 'messages-in-collection' || selectionContext === 'collections') {
            updateDeleteModeButtonStates();
        } else {
            updateSelectionModeButtonStates();
        }
        
        console.log('Threadly: Final selected messages:', selectedMessageIds);
    }

    // Function to toggle collection selection
    function toggleCollectionSelection(collectionId, checked) {
        console.log('Threadly: toggleCollectionSelection called:', { collectionId, checked, currentSelected: [...selectedCollectionIds] });
        
        const index = selectedCollectionIds.indexOf(collectionId);
        if (checked) {
            if (index === -1) {
                selectedCollectionIds.push(collectionId);
                console.log('Threadly: Added collection to selection:', collectionId);
            }
        } else {
            if (index !== -1) {
                selectedCollectionIds.splice(index, 1);
                console.log('Threadly: Removed collection from selection:', collectionId);
            }
        }
        
        // Update delete mode button states
        updateDeleteModeButtonStates();
        
        console.log('Threadly: Final selected collections:', selectedCollectionIds);
    }

    // --- Metaball Search Bar Functions --- //
    function handleSearchFocus(e) {
        console.log('Threadly: handleSearchFocus called with target:', e.target, 'target.id:', e.target.id);
        
        // Only handle main search input, not collection name input
        if (e.target.id !== 'threadly-search-input') {
            console.log('Threadly: handleSearchFocus - not main search input, returning');
            return;
        }
        
        console.log('Threadly: handleSearchFocus - main search input focused, isInCollectionsView:', isInCollectionsView);
        
        // If we're in collections view, return to main messages first
        if (isInCollectionsView) {
            console.log('Threadly: handleSearchFocus - exiting collections view');
            isInCollectionsView = false;
            // Small delay to ensure the flag is reset before filtering
            setTimeout(() => {
                filterMessages(searchInput.value);
            }, 50);
        }
        
        // Get the parent wrapper and switch to expanded state
        const wrapper = searchInput.closest('.threadly-metaball-wrapper');
        if (wrapper) {
            wrapper.classList.remove('stateB');
            wrapper.classList.add('stateA');
            console.log('Threadly: Search expanded - metaball animation triggered');
        }
    }

    function handleSearchBlur(e) {
        // Only handle main search input, not collection name input
        if (e.target.id !== 'threadly-search-input') {
            return;
        }
        
        // If we're in collections view, return to main messages first
        if (isInCollectionsView) {
            isInCollectionsView = false;
            // Small delay to ensure the flag is reset before filtering
            setTimeout(() => {
                filterMessages(searchInput.value);
            }, 50);
        }
        
        // Get the parent wrapper and switch to compact state if input is empty
        const wrapper = searchInput.closest('.threadly-metaball-wrapper');
        if (wrapper && !searchInput.value.trim()) {
            wrapper.classList.remove('stateA');
            wrapper.classList.add('stateB');
            console.log('Threadly: Search collapsed - metaball animation reversed');
        }
    }

    // Add input event listener to handle text changes
    function handleSearchInput(e) {
        // Only handle main search input, not collection name input
        if (e.target.id !== 'threadly-search-input') {
            return;
        }
        
        // If we're in collections view, return to main messages first
        if (isInCollectionsView) {
            isInCollectionsView = false;
            // Small delay to ensure the flag is reset before filtering
            setTimeout(() => {
                filterMessages(searchInput.value);
            }, 50);
        }
        
        const wrapper = searchInput.closest('.threadly-metaball-wrapper');
        if (wrapper) {
            // If there's text, ensure expanded state
            if (e.target.value.trim()) {
                wrapper.classList.remove('stateB');
                wrapper.classList.add('stateA');
            }
        }
    }

    // --- Legacy Fluid Search Bar Functions (for FAV mode) --- //
    function handleSearchClick(e) {
        // If we're in collections view, return to main messages first
        if (isInCollectionsView) {
            isInCollectionsView = false;
            // Small delay to ensure the flag is reset before filtering
            setTimeout(() => {
                filterMessages(searchInput.value);
            }, 50);
        }
        
        if (messageFilterState === 'favorites' && !searchInput.classList.contains('expanded')) {
            expandSearch();
            e.stopPropagation();
        }
    }

    function handleSearchKeydown(e) {
        // Don't handle keydown events when typing in collection input
        if (e.target.id === 'collectionNameInput') {
            return;
        }
        
        // If we're in collections view, return to main messages first
        if (isInCollectionsView) {
            isInCollectionsView = false;
            // Small delay to ensure the flag is reset before filtering
            setTimeout(() => {
                filterMessages(searchInput.value);
            }, 50);
        }
        
        if (e.key === 'Escape' && messageFilterState === 'favorites' && searchInput.classList.contains('expanded')) {
            collapseSearch();
        }
    }

    function expandSearch() {
        searchInput.classList.add('expanded');
        searchInput.style.cursor = 'default';
        searchInput.focus();
        
        // Trigger metaball animation for expanded state
        if (window.metaBallRenderer) {
            window.metaBallRenderer.setState(3);
        }
        
        console.log('Threadly: Search expanded');
    }

    function collapseSearch() {
        searchInput.classList.remove('expanded');
        searchInput.style.cursor = 'pointer';
        searchInput.value = '';
        searchInput.blur();
        
        // Trigger metaball animation for collapsed state
        if (window.metaBallRenderer) {
            window.metaBallRenderer.setState(2);
        }
        
        console.log('Threadly: Search collapsed');
    }

    // Function to assign selected messages to an existing collection
    async function assignMessagesToCollection(collectionId) {
        console.log('Threadly: assignMessagesToCollection called with collectionId:', collectionId);
        console.log('Threadly: selectedMessageIds:', selectedMessageIds);
        console.log('Threadly: selectedMessageIds length:', selectedMessageIds.length);
        
        if (selectedMessageIds.length === 0) {
            console.error('Threadly: No messages selected for assignment.');
            return 0; // Return 0 to indicate no messages were added
        }

        try {
            // THE FIX: Use the existing in-memory 'allMessages' array, which is in sync with the UI.
            console.log('Threadly: Using in-memory allMessages array with', allMessages.length, 'messages');
            console.log('Threadly: Available message IDs in allMessages:', allMessages.map(m => m.id));
            let messagesUpdatedCount = 0;

            // This loop will now find the messages because the IDs match.
            allMessages.forEach(message => {
                if (selectedMessageIds.includes(message.id)) {
                    console.log('Threadly: Found selected message:', message.id, 'Current collectionIds:', message.collectionIds);
                    if (!message.collectionIds) {
                        message.collectionIds = [];
                    }
                    if (!message.collectionIds.includes(collectionId)) {
                        message.collectionIds.push(collectionId);
                        messagesUpdatedCount++;
                        console.log('Threadly: Added collection to message:', message.id, 'New collectionIds:', message.collectionIds);
                    } else {
                        console.log('Threadly: Message', message.id, 'already contains collection', collectionId);
                    }
                }
            });

            if (messagesUpdatedCount === 0) {
                console.log('Threadly: All selected messages are already in this collection');
                return 0;
            }

            // Save the updated 'allMessages' array back to storage for the current page.
            await saveMessagesToStorage(allMessages);
            console.log('Threadly: Saved updated messages to storage');

            // Update other data sources as needed
            await updateGlobalFavorites();
            await updateCollectionMessageCounts();

            console.log('Threadly: Successfully added', messagesUpdatedCount, 'messages to collection');
            return messagesUpdatedCount; // Return the actual count of messages added

        } catch (error) {
            console.error('Threadly: Error assigning messages to collection:', error);
            showToast('Error assigning messages');
            return 0;
        }
    }

    // NEW FUNCTION: To handle the UI transition correctly after assignment.
    async function finalizeAssignmentAndReturnToCollections(collectionId, messagesAddedCount = 0) {
        console.log('Threadly: finalizeAssignmentAndReturnToCollections called for collectionId:', collectionId, 'with', messagesAddedCount, 'messages added');
        const collectionName = await getCollectionName(collectionId);
        console.log('Threadly: Collection name:', collectionName);
        
        // Use the actual count of messages that were added
        showToast(`Added ${messagesAddedCount} message(s) to '${collectionName}'`);

        // 1. Reset selection and assignment state variables
        console.log('Threadly: Resetting isAssigningMode from', isAssigningMode, 'to false');
        isAssigningMode = false;
        console.log('Threadly: Clearing selectedMessageIds:', selectedMessageIds);
        selectedMessageIds = [];
        
        // 2. Reset UI elements
        document.body.classList.remove('selection-mode');
        
        // Reset checkboxes
        const checkboxes = document.querySelectorAll('.threadly-message-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Return to collections view
        setSavedButtonActive(true);
        await renderCollectionsView(false);
        morphNavbarToSavedState();

        // 3. Reset select button
        const selectBulb = document.getElementById('threadly-select-bulb');
        if (selectBulb) {
            selectBulb.title = 'Enable selection mode';
            selectBulb.setAttribute('data-mode', 'select');
            selectBulb.classList.remove('close');
            selectBulb.classList.add('square');
        }
        console.log('Threadly: finalizeAssignmentAndReturnToCollections completed');
    }

    // --- Prompt Refiner Functions --- //
    
    function initializePromptRefiner() {
        console.log('Threadly: Initializing prompt refiner for all platforms...');
        
        // Prompt refiner is now available for all platforms
        // Individual platform sparkle functionality is handled by dedicated files
    }


    // ChatGPT sparkle functionality moved to dedicated chatgpt-sparkle.js file

    // --- Feedback Loop System (Pillar 2) ---
    
    // Listen for feedback requests from sparkle files
    window.addEventListener('threadly-triage-feedback-request', (event) => {
        const { prompt, incorrectCategory } = event.detail;
        createFeedbackModal(prompt, incorrectCategory);
    });

    function createFeedbackModal(prompt, incorrectCategory) {
        // Remove any existing feedback modal
        const existingModal = document.getElementById('threadly-feedback-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'threadly-feedback-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // Trigger animation
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            box-shadow: 
                0 25px 50px -12px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
            position: relative;
            transform: scale(0.9);
            transition: all 0.3s ease;
        `;
        
        // Trigger scale animation
        setTimeout(() => {
            modalContent.style.transform = 'scale(1)';
        }, 50);

        // Create title
        const title = document.createElement('h3');
        title.textContent = 'Help Threadly Learn';
        title.style.cssText = `
            margin: 0 0 20px 0;
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            text-align: center;
        `;

        // Create description
        const description = document.createElement('p');
        description.textContent = 'You undid the refinement. What category did you expect?';
        description.style.cssText = `
            margin: 0 0 24px 0;
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            line-height: 1.6;
            text-align: center;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        `;

        // Create predicted category display
        const predictedCategory = document.createElement('div');
        predictedCategory.innerHTML = `<strong>Threadly predicted:</strong> ${getCategoryDisplayName(incorrectCategory)}`;
        predictedCategory.style.cssText = `
            margin: 0 0 24px 0;
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            padding: 12px;
            background: rgba(255, 193, 7, 0.1);
            border-radius: 6px;
            border-left: 3px solid #fbbf24;
            text-align: center;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        `;

        // Create prompt preview
        const promptPreview = document.createElement('div');
        promptPreview.style.cssText = `
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 16px;
            margin: 0 0 24px 0;
            font-size: 16px;
            color: rgba(255, 255, 255, 0.95);
            max-height: 120px;
            overflow-y: auto;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        `;
        promptPreview.textContent = `"${prompt}"`;

        // Create category buttons
        const categories = [
            { key: 'grammar_spelling', name: 'Grammar & Spelling' },
            { key: 'image_generation', name: 'Image Generation' },
            { key: 'coding', name: 'Coding' },
            { key: 'research_analysis', name: 'Research & Analysis' },
            { key: 'content_creation', name: 'Content Creation' },
            { key: 'general', name: 'General' }
        ];

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-bottom: 20px;
        `;

        categories.forEach(category => {
            const button = document.createElement('button');
            button.textContent = category.name;
            button.style.cssText = `
                padding: 16px 20px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                color: rgba(255, 255, 255, 0.95);
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            `;

            button.addEventListener('mouseenter', () => {
                button.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            });

            button.addEventListener('click', async () => {
                // Add visual feedback
                button.style.backgroundColor = 'rgba(34, 197, 94, 0.3)';
                button.style.borderColor = 'rgba(34, 197, 94, 0.6)';
                button.style.color = '#ffffff';
                button.textContent = '✓ Submitting...';
                button.disabled = true;
                
                try {
                    await submitFeedback(prompt, incorrectCategory, category.key);
                    // Close modal after successful submission
                modal.remove();
                } catch (error) {
                    console.error('Threadly: Error submitting feedback:', error);
                    // Reset button state on error
                    button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    button.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    button.style.color = 'rgba(255, 255, 255, 0.95)';
                    button.textContent = category.name;
                    button.disabled = false;
                }
            });

            buttonContainer.appendChild(button);
        });

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '✕';
        closeButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            font-size: 18px;
            color: rgba(255, 255, 255, 0.8);
            cursor: pointer;
            padding: 8px;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;
        
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            closeButton.style.color = 'rgba(255, 255, 255, 1)';
            closeButton.style.transform = 'scale(1.1)';
        });
        
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            closeButton.style.color = 'rgba(255, 255, 255, 0.8)';
            closeButton.style.transform = 'scale(1)';
        });

        closeButton.addEventListener('click', () => {
            modal.remove();
        });

        // Assemble modal
        modalContent.appendChild(closeButton);
        modalContent.appendChild(title);
        modalContent.appendChild(description);
        modalContent.appendChild(predictedCategory);
        modalContent.appendChild(promptPreview);
        modalContent.appendChild(buttonContainer);
        modal.appendChild(modalContent);

        // Add to page
        document.body.appendChild(modal);

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // --- Enhanced Learning System --- //
    
    // Enhanced Context Capture System
    class EnhancedContextCapture {
        constructor() {
            this.platformDetector = new PlatformDetector();
            this.typingAnalyzer = new TypingAnalyzer();
            this.contextData = new Map();
            this.typingSessions = new Map();
        }

        async captureContext(prompt, textElement) {
            const context = {
                timestamp: Date.now(),
                prompt: prompt,
                platform: this.platformDetector.detectPlatform(),
                elementContext: this.getElementContext(textElement),
                typingPatterns: this.typingAnalyzer.getPatterns(textElement),
                previousHistory: await this.getPreviousHistory(textElement),
                timeBasedPatterns: this.getTimeBasedPatterns(),
                confidence: await this.calculateInitialConfidence(prompt)
            };

            // Store context for this session
            const sessionId = this.generateSessionId(textElement);
            this.contextData.set(sessionId, context);
            
            return context;
        }

        getElementContext(element) {
            return {
                tagName: element.tagName,
                id: element.id,
                className: element.className,
                parentId: element.parentElement?.id,
                parentClass: element.parentElement?.className,
                placeholder: element.placeholder,
                maxLength: element.maxLength,
                formId: element.form?.id,
                ariaLabel: element.getAttribute('aria-label'),
                role: element.getAttribute('role')
            };
        }

        async getPreviousHistory(element) {
            try {
                const history = await chrome.storage.local.get(['typingHistory']);
                const userHistory = history.typingHistory || [];
                
                // Get recent history for this element
                return userHistory
                    .filter(entry => entry.elementId === element.id)
                    .slice(-10); // Last 10 entries
            } catch (error) {
                console.error('Threadly: Error getting history:', error);
                return [];
            }
        }

        getTimeBasedPatterns() {
            const now = new Date();
            return {
                hour: now.getHours(),
                dayOfWeek: now.getDay(),
                isWeekend: now.getDay() === 0 || now.getDay() === 6,
                timeOfDay: this.getTimeOfDay(now.getHours()),
                month: now.getMonth(),
                season: this.getSeason(now.getMonth())
            };
        }

        getTimeOfDay(hour) {
            if (hour >= 6 && hour < 12) return 'morning';
            if (hour >= 12 && hour < 17) return 'afternoon';
            if (hour >= 17 && hour < 22) return 'evening';
            return 'night';
        }

        getSeason(month) {
            if (month >= 2 && month <= 4) return 'spring';
            if (month >= 5 && month <= 7) return 'summer';
            if (month >= 8 && month <= 10) return 'autumn';
            return 'winter';
        }

        async calculateInitialConfidence(prompt) {
            // Basic confidence based on prompt characteristics
            const length = prompt.length;
            const hasQuestionWords = /^(what|how|why|when|where|who|can|could|would|should)/i.test(prompt);
            const hasTechnicalTerms = /(function|class|def|import|const|let|var|algorithm|api|database)/i.test(prompt);
            
            let confidence = 0.5; // Base confidence
            
            if (length > 50) confidence += 0.1;
            if (hasQuestionWords) confidence += 0.1;
            if (hasTechnicalTerms) confidence += 0.2;
            
            return Math.min(confidence, 1.0);
        }

        generateSessionId(element) {
            return `${element.id || 'unknown'}_${Date.now()}`;
        }

        async storeContext(sessionId, context) {
            try {
                await chrome.storage.local.set({
                    [`context_${sessionId}`]: context
                });
            } catch (error) {
                console.error('Threadly: Error storing context:', error);
            }
        }
    }

    // Platform Detection Utility
    class PlatformDetector {
        detectPlatform() {
            const hostname = window.location.hostname;
            const pathname = window.location.pathname;
            
            // ChatGPT detection
            if (hostname.includes('chatgpt.com') || hostname.includes('openai.com')) {
                return {
                    name: 'chatgpt',
                    version: this.detectChatGPTVersion(),
                    features: ['conversation', 'code_interpreter', 'file_upload']
                };
            }
            
            // Claude detection
            if (hostname.includes('claude.ai') || hostname.includes('anthropic.com')) {
                return {
                    name: 'claude',
                    version: this.detectClaudeVersion(),
                    features: ['conversation', 'file_upload', 'web_search']
                };
            }
            
            // Gemini detection
            if (hostname.includes('gemini.google.com') || hostname.includes('aistudio.google.com')) {
                return {
                    name: 'gemini',
                    version: this.detectGeminiVersion(),
                    features: ['conversation', 'image_generation', 'code_execution']
                };
            }
            
            // Perplexity detection
            if (hostname.includes('perplexity.ai')) {
                return {
                    name: 'perplexity',
                    version: 'unknown',
                    features: ['search', 'sources', 'real_time']
                };
            }
            
            // Generic AI platform
            return {
                name: 'unknown',
                version: 'unknown',
                features: []
            };
        }

        detectChatGPTVersion() {
            // Check for ChatGPT-4, ChatGPT-3.5, etc.
            const versionElements = document.querySelectorAll('[data-testid*="model"], .model-selector, .gpt-version');
            for (const el of versionElements) {
                const text = el.textContent.toLowerCase();
                if (text.includes('gpt-4')) return 'gpt-4';
                if (text.includes('gpt-3.5')) return 'gpt-3.5';
            }
            return 'unknown';
        }

        detectClaudeVersion() {
            // Check for Claude-3, Claude-2, etc.
            const versionElements = document.querySelectorAll('[data-testid*="claude"], .claude-version');
            for (const el of versionElements) {
                const text = el.textContent.toLowerCase();
                if (text.includes('claude-3')) return 'claude-3';
                if (text.includes('claude-2')) return 'claude-2';
            }
            return 'unknown';
        }

        detectGeminiVersion() {
            // Check for Gemini Pro, Gemini Ultra, etc.
            const versionElements = document.querySelectorAll('.gemini-version, [data-model*="gemini"]');
            for (const el of versionElements) {
                const text = el.textContent.toLowerCase();
                if (text.includes('ultra')) return 'gemini-ultra';
                if (text.includes('pro')) return 'gemini-pro';
            }
            return 'unknown';
        }
    }

    // Typing Pattern Analyzer
    class TypingAnalyzer {
        constructor() {
            this.typingSessions = new Map();
            this.startTracking();
        }

        startTracking() {
            // Track typing patterns on all text inputs
            document.addEventListener('input', (e) => {
                if (this.isTextInput(e.target)) {
                    this.trackTyping(e.target);
                }
            });

            document.addEventListener('keydown', (e) => {
                if (this.isTextInput(e.target)) {
                    this.trackKeystroke(e.target, e);
                }
            });
        }

        isTextInput(element) {
            return element && (
                element.tagName === 'TEXTAREA' ||
                element.tagName === 'INPUT' ||
                element.contentEditable === 'true'
            );
        }

        trackTyping(element) {
            const sessionId = this.getSessionId(element);
            if (!this.typingSessions.has(sessionId)) {
                this.typingSessions.set(sessionId, {
                    startTime: Date.now(),
                    keystrokes: [],
                    pauses: [],
                    backspaces: 0,
                    totalChars: 0
                });
            }

            const session = this.typingSessions.get(sessionId);
            session.totalChars = element.value?.length || element.textContent?.length || 0;
        }

        trackKeystroke(element, event) {
            const sessionId = this.getSessionId(element);
            const session = this.typingSessions.get(sessionId);
            
            if (session) {
                const now = Date.now();
                const lastKeystroke = session.keystrokes[session.keystrokes.length - 1];
                
                if (lastKeystroke) {
                    const pause = now - lastKeystroke.timestamp;
                    if (pause > 1000) { // Pause longer than 1 second
                        session.pauses.push(pause);
                    }
                }

                session.keystrokes.push({
                    key: event.key,
                    timestamp: now,
                    isBackspace: event.key === 'Backspace'
                });

                if (event.key === 'Backspace') {
                    session.backspaces++;
                }
            }
        }

        getPatterns(element) {
            const sessionId = this.getSessionId(element);
            const session = this.typingSessions.get(sessionId);
            
            if (!session) return null;

            const duration = Date.now() - session.startTime;
            const typingSpeed = (session.totalChars / (duration / 1000)) * 60; // chars per minute
            const averagePause = session.pauses.length > 0 ? 
                session.pauses.reduce((a, b) => a + b, 0) / session.pauses.length : 0;
            const backspaceRate = session.backspaces / Math.max(session.keystrokes.length, 1);

            return {
                typingSpeed,
                averagePause,
                backspaceRate,
                totalKeystrokes: session.keystrokes.length,
                hesitationScore: this.calculateHesitationScore(session),
                confidence: this.calculateTypingConfidence(session)
            };
        }

        calculateHesitationScore(session) {
            // Higher score = more hesitation
            const longPauses = session.pauses.filter(p => p > 3000).length;
            const backspaceRate = session.backspaces / Math.max(session.keystrokes.length, 1);
            return Math.min((longPauses * 0.3) + (backspaceRate * 0.7), 1.0);
        }

        calculateTypingConfidence(session) {
            // Higher confidence = smoother typing
            const backspaceRate = session.backspaces / Math.max(session.keystrokes.length, 1);
            const pauseVariability = this.calculatePauseVariability(session.pauses);
            return Math.max(0, 1 - (backspaceRate * 0.6) - (pauseVariability * 0.4));
        }

        calculatePauseVariability(pauses) {
            if (pauses.length < 2) return 0;
            const mean = pauses.reduce((a, b) => a + b, 0) / pauses.length;
            const variance = pauses.reduce((acc, pause) => acc + Math.pow(pause - mean, 2), 0) / pauses.length;
            return Math.sqrt(variance) / mean; // Coefficient of variation
        }

        getSessionId(element) {
            return `${element.id || element.className || 'unknown'}_${element.tagName}`;
        }
    }

    // Implicit Feedback Tracking System
    class ImplicitFeedbackTracker {
        constructor() {
            this.activeTrackers = new Map();
            this.editDistanceCalculator = new EditDistanceCalculator();
            this.editClassifier = new EditClassifier();
            this.submissionDetector = new SubmissionDetector();
        }

        startTracking(element, originalText, refinedText) {
            const trackerId = this.generateTrackerId(element);
            
            // Stop any existing tracker for this element
            this.stopTracking(element);

            const tracker = {
                element,
                originalText,
                refinedText,
                startTime: Date.now(),
                lastText: refinedText,
                edits: [],
                observer: null,
                submissionDetected: false
            };

            // Set up MutationObserver to track changes
            tracker.observer = new MutationObserver((mutations) => {
                this.handleTextChange(tracker);
            });

            // Start observing
            tracker.observer.observe(element, {
                childList: true,
                subtree: true,
                characterData: true
            });

            // Also track input events for immediate feedback
            const inputHandler = () => this.handleTextChange(tracker);
            element.addEventListener('input', inputHandler);
            element.addEventListener('paste', inputHandler);

            // Set up submission detection
            this.submissionDetector.setupSubmissionDetection(element, () => {
                this.handleSubmission(tracker);
            });

            // Auto-stop after 5 minutes
            setTimeout(() => {
                this.stopTracking(element);
            }, 5 * 60 * 1000);

            this.activeTrackers.set(trackerId, tracker);
            return trackerId;
        }

        stopTracking(element) {
            const trackerId = this.generateTrackerId(element);
            const tracker = this.activeTrackers.get(trackerId);
            
            if (tracker) {
                if (tracker.observer) {
                    tracker.observer.disconnect();
                }
                this.activeTrackers.delete(trackerId);
            }
        }

        handleTextChange(tracker) {
            const currentText = tracker.element.value || 
                               tracker.element.textContent || 
                               tracker.element.innerText || '';

            if (currentText !== tracker.lastText) {
                const edit = this.analyzeEdit(tracker.lastText, currentText);
                tracker.edits.push(edit);
                tracker.lastText = currentText;

                // Classify the edit
                const editClassification = this.editClassifier.classify(edit);
                edit.classification = editClassification;

                console.log('Threadly: Implicit edit detected:', editClassification);
            }
        }

        handleSubmission(tracker) {
            tracker.submissionDetected = true;
            const finalAnalysis = this.analyzeFinalEdit(tracker);
            
            // Store implicit feedback
            this.storeImplicitFeedback(tracker, finalAnalysis);
            
            // Stop tracking
            this.stopTracking(tracker.element);
        }

        analyzeEdit(oldText, newText) {
            const distance = this.editDistanceCalculator.calculate(oldText, newText);
            const changes = this.identifyChanges(oldText, newText);
            
            return {
                timestamp: Date.now(),
                oldText,
                newText,
                distance,
                changes,
                lengthChange: newText.length - oldText.length,
                isAddition: newText.length > oldText.length,
                isDeletion: newText.length < oldText.length,
                isModification: newText.length === oldText.length && oldText !== newText
            };
        }

        analyzeFinalEdit(tracker) {
            const finalText = tracker.element.value || 
                             tracker.element.textContent || 
                             tracker.element.innerText || '';

            const totalDistance = this.editDistanceCalculator.calculate(tracker.refinedText, finalText);
            const acceptanceRate = this.calculateAcceptanceRate(tracker);
            const editPatterns = this.analyzeEditPatterns(tracker.edits);

            return {
                originalText: tracker.originalText,
                refinedText: tracker.refinedText,
                finalText,
                totalDistance,
                acceptanceRate,
                editPatterns,
                totalEdits: tracker.edits.length,
                timeToSubmission: Date.now() - tracker.startTime,
                submissionDetected: tracker.submissionDetected
            };
        }

        calculateAcceptanceRate(tracker) {
            if (tracker.edits.length === 0) return 1.0; // No edits = full acceptance
            
            const totalChanges = tracker.edits.reduce((sum, edit) => sum + edit.distance, 0);
            const originalLength = tracker.refinedText.length;
            
            return Math.max(0, 1 - (totalChanges / originalLength));
        }

        analyzeEditPatterns(edits) {
            const patterns = {
                formalityChanges: 0,
                lengthChanges: 0,
                technicalAdjustments: 0,
                structureChanges: 0,
                punctuationChanges: 0
            };

            edits.forEach(edit => {
                if (edit.classification) {
                    patterns[edit.classification] = (patterns[edit.classification] || 0) + 1;
                }
            });

            return patterns;
        }

        identifyChanges(oldText, newText) {
            const changes = [];
            const maxLength = Math.max(oldText.length, newText.length);
            
            for (let i = 0; i < maxLength; i++) {
                if (oldText[i] !== newText[i]) {
                    changes.push({
                        position: i,
                        oldChar: oldText[i] || '',
                        newChar: newText[i] || '',
                        type: oldText[i] ? (newText[i] ? 'modification' : 'deletion') : 'addition'
                    });
                }
            }
            
            return changes;
        }

        async storeImplicitFeedback(tracker, analysis) {
            try {
                const feedbackData = {
                    type: 'implicit_feedback',
                    timestamp: Date.now(),
                    analysis,
                    platform: window.location.hostname,
                    elementContext: {
                        tagName: tracker.element.tagName,
                        id: tracker.element.id,
                        className: tracker.element.className
                    }
                };

                await chrome.runtime.sendMessage({
                action: 'storeFeedback',
                    feedback: feedbackData
                });

                console.log('Threadly: Implicit feedback stored:', analysis);
            } catch (error) {
                console.error('Threadly: Error storing implicit feedback:', error);
            }
        }

        generateTrackerId(element) {
            return `${element.id || element.className || 'unknown'}_${Date.now()}`;
        }
    }

    // Edit Distance Calculator (Levenshtein Distance)
    class EditDistanceCalculator {
        calculate(str1, str2) {
            const matrix = [];
            const len1 = str1.length;
            const len2 = str2.length;

            // Initialize matrix
            for (let i = 0; i <= len1; i++) {
                matrix[i] = [i];
            }
            for (let j = 0; j <= len2; j++) {
                matrix[0][j] = j;
            }

            // Fill matrix
            for (let i = 1; i <= len1; i++) {
                for (let j = 1; j <= len2; j++) {
                    if (str1[i - 1] === str2[j - 1]) {
                        matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j] + 1,     // deletion
                            matrix[i][j - 1] + 1,     // insertion
                            matrix[i - 1][j - 1] + 1  // substitution
                        );
                    }
                }
            }

            return matrix[len1][len2];
        }
    }

    // Edit Classifier
    class EditClassifier {
        classify(edit) {
            const { oldText, newText, changes } = edit;
            
            // Check for formality changes
            if (this.isFormalityChange(oldText, newText)) {
                return 'formalityChanges';
            }
            
            // Check for length changes
            if (Math.abs(newText.length - oldText.length) > 10) {
                return 'lengthChanges';
            }
            
            // Check for technical adjustments
            if (this.isTechnicalAdjustment(oldText, newText)) {
                return 'technicalAdjustments';
            }
            
            // Check for structure changes
            if (this.isStructureChange(oldText, newText)) {
                return 'structureChanges';
            }
            
            // Check for punctuation changes
            if (this.isPunctuationChange(oldText, newText)) {
                return 'punctuationChanges';
            }
            
            return 'other';
        }

        isFormalityChange(oldText, newText) {
            const formalWords = ['please', 'could you', 'would you', 'thank you', 'appreciate'];
            const casualWords = ['hey', 'hi', 'thanks', 'thx', 'pls'];
            
            const oldFormal = formalWords.some(word => oldText.toLowerCase().includes(word));
            const newFormal = formalWords.some(word => newText.toLowerCase().includes(word));
            const oldCasual = casualWords.some(word => oldText.toLowerCase().includes(word));
            const newCasual = casualWords.some(word => newText.toLowerCase().includes(word));
            
            return (oldFormal && newCasual) || (oldCasual && newFormal);
        }

        isTechnicalAdjustment(oldText, newText) {
            const technicalTerms = ['function', 'class', 'method', 'algorithm', 'api', 'database', 'server'];
            const oldTechnical = technicalTerms.some(term => oldText.toLowerCase().includes(term));
            const newTechnical = technicalTerms.some(term => newText.toLowerCase().includes(term));
            
            return oldTechnical !== newTechnical;
        }

        isStructureChange(oldText, newText) {
            const oldSentences = oldText.split(/[.!?]+/).length;
            const newSentences = newText.split(/[.!?]+/).length;
            
            return Math.abs(oldSentences - newSentences) > 1;
        }

        isPunctuationChange(oldText, newText) {
            const oldPunctuation = (oldText.match(/[.!?,;:]/g) || []).length;
            const newPunctuation = (newText.match(/[.!?,;:]/g) || []).length;
            
            return Math.abs(oldPunctuation - newPunctuation) > 2;
        }
    }

    // Submission Detector
    class SubmissionDetector {
        setupSubmissionDetection(element, callback) {
            // Common submission patterns
            const submissionSelectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:contains("Send")',
                'button:contains("Submit")',
                'button:contains("Ask")',
                'button:contains("Go")',
                '[data-testid*="send"]',
                '[data-testid*="submit"]'
            ];

            // Find submission buttons
            const submissionButtons = [];
            submissionSelectors.forEach(selector => {
                try {
                    const buttons = document.querySelectorAll(selector);
                    submissionButtons.push(...Array.from(buttons));
                } catch (e) {
                    // Ignore invalid selectors
                }
            });

            // Add click listeners
            submissionButtons.forEach(button => {
                button.addEventListener('click', callback);
            });

            // Also listen for Enter key in textarea
            if (element.tagName === 'TEXTAREA') {
                const keyHandler = (e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        callback();
                    }
                };
                element.addEventListener('keydown', keyHandler);
            }
        }
    }

    // Confidence Scoring & Adaptive Feedback System
    class ConfidenceScorer {
        constructor() {
            this.historicalData = new Map();
            this.patternRecognition = new PatternRecognitionEngine();
        }

        async calculateConfidence(prompt, context) {
            const promptHash = this.hashPrompt(prompt);
            const historicalAccuracy = await this.getHistoricalAccuracy(promptHash);
            const patternConfidence = this.patternRecognition.analyzePatterns(prompt);
            const keywordConfidence = this.calculateKeywordConfidence(prompt);
            const contextConfidence = this.calculateContextConfidence(context);
            const ambiguityScore = this.calculateAmbiguityScore(prompt);

            // Weighted combination
            const confidence = (
                historicalAccuracy * 0.3 +
                patternConfidence.overallConfidence * 0.25 +
                keywordConfidence * 0.2 +
                contextConfidence * 0.15 +
                (1 - ambiguityScore) * 0.1
            );

            return Math.max(0, Math.min(1, confidence));
        }

        async getHistoricalAccuracy(promptHash) {
            try {
                const data = await chrome.storage.local.get([`predictions_${promptHash}`]);
                const predictions = data[`predictions_${promptHash}`] || [];
                
                if (predictions.length === 0) return 0.5; // Default for new prompts
                
                const correctPredictions = predictions.filter(p => p.correct).length;
                return correctPredictions / predictions.length;
        } catch (error) {
                console.error('Threadly: Error getting historical accuracy:', error);
                return 0.5;
            }
        }

        calculateKeywordConfidence(prompt) {
            const keywords = this.extractKeywords(prompt);
            const categoryKeywords = {
                coding: ['function', 'class', 'def', 'import', 'const', 'let', 'var', 'algorithm', 'api', 'database', 'server', 'code', 'programming', 'python', 'javascript', 'java', 'c++', 'html', 'css'],
                image_generation: ['image', 'picture', 'photo', 'draw', 'create', 'generate', 'visual', 'art', 'design', 'logo', 'banner', 'illustration', 'sketch'],
                grammar_spelling: ['grammar', 'spelling', 'correct', 'fix', 'error', 'mistake', 'typo', 'punctuation', 'sentence', 'word'],
                research_analysis: ['research', 'analyze', 'study', 'investigate', 'examine', 'evaluate', 'compare', 'contrast', 'data', 'statistics', 'report'],
                content_creation: ['write', 'article', 'blog', 'story', 'essay', 'content', 'copy', 'text', 'description', 'summary'],
                general: ['help', 'question', 'ask', 'explain', 'tell', 'what', 'how', 'why', 'when', 'where']
            };

            let maxConfidence = 0;
            for (const [category, words] of Object.entries(categoryKeywords)) {
                const matches = keywords.filter(keyword => 
                    words.some(word => word.toLowerCase().includes(keyword.toLowerCase()) || 
                                     keyword.toLowerCase().includes(word.toLowerCase()))
                ).length;
                const confidence = matches / Math.max(keywords.length, 1);
                maxConfidence = Math.max(maxConfidence, confidence);
            }

            return maxConfidence;
        }

        calculateContextConfidence(context) {
            let confidence = 0.5; // Base confidence

            // Platform-specific confidence
            if (context.platform) {
                const platformConfidence = {
                    'chatgpt': 0.8,
                    'claude': 0.8,
                    'gemini': 0.7,
                    'perplexity': 0.6
                };
                confidence += (platformConfidence[context.platform.name] || 0.5) * 0.2;
            }

            // Typing confidence
            if (context.typingPatterns) {
                confidence += context.typingPatterns.confidence * 0.2;
            }

            // Time-based confidence
            if (context.timeBasedPatterns) {
                const timeConfidence = this.getTimeBasedConfidence(context.timeBasedPatterns);
                confidence += timeConfidence * 0.1;
            }

            return Math.min(confidence, 1.0);
        }

        getTimeBasedConfidence(timePatterns) {
            // Higher confidence during typical work hours
            const hour = timePatterns.hour;
            if (hour >= 9 && hour <= 17) return 0.8;
            if (hour >= 18 && hour <= 22) return 0.6;
            return 0.4;
        }

        calculateAmbiguityScore(prompt) {
            // Check for ambiguous words that could fit multiple categories
            const ambiguousWords = ['help', 'create', 'make', 'build', 'write', 'generate'];
            const ambiguousCount = ambiguousWords.filter(word => 
                prompt.toLowerCase().includes(word)
            ).length;

            return Math.min(ambiguousCount * 0.2, 0.8);
        }

        extractKeywords(prompt) {
            return prompt.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 2)
                .filter(word => !this.isStopWord(word));
        }

        isStopWord(word) {
            const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'];
            return stopWords.includes(word);
        }

        hashPrompt(prompt) {
            // Simple hash function for prompt identification
            let hash = 0;
            for (let i = 0; i < prompt.length; i++) {
                const char = prompt.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return Math.abs(hash).toString(36);
        }
    }

    // Pattern Recognition Engine
    class PatternRecognitionEngine {
        analyzePatterns(prompt) {
            const patterns = {
                codeIndicators: this.detectCodeIndicators(prompt),
                questionPatterns: this.detectQuestionPatterns(prompt),
                technicalIndicators: this.detectTechnicalIndicators(prompt),
                urgencySentiment: this.detectUrgencySentiment(prompt),
                taskTypeSignals: this.detectTaskTypeSignals(prompt)
            };

            const suggestedCategories = this.suggestCategories(patterns);
            const overallConfidence = this.calculateOverallConfidence(patterns, suggestedCategories);

            return {
                patterns,
                suggestedCategories,
                overallConfidence
            };
        }

        detectCodeIndicators(prompt) {
            const codeKeywords = ['function', 'class', 'def', 'import', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'async', 'await'];
            const codeSyntax = [/\{[^}]*\}/, /\[[^\]]*\]/, /\([^)]*\)/, /=>/, /->/, /<[^>]*>/, /\/\*[\s\S]*?\*\//, /\/\/.*$/];
            const languages = ['python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'typescript', 'html', 'css', 'sql'];

            const keywordMatches = codeKeywords.filter(keyword => 
                prompt.toLowerCase().includes(keyword)
            ).length;

            const syntaxMatches = codeSyntax.filter(pattern => 
                pattern.test(prompt)
            ).length;

            const languageMatches = languages.filter(lang => 
                prompt.toLowerCase().includes(lang)
            ).length;

            const score = (keywordMatches * 0.4 + syntaxMatches * 0.4 + languageMatches * 0.2) / Math.max(codeKeywords.length, 1);
            
            return {
                score: Math.min(score, 1),
                patterns: {
                    keywords: keywordMatches,
                    syntax: syntaxMatches,
                    languages: languageMatches
                }
            };
        }

        detectQuestionPatterns(prompt) {
            const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'could', 'would', 'should', 'may', 'might'];
            const questionStructures = [/^can you/i, /^could you/i, /^would you/i, /^help me/i, /^i need to/i, /^how do i/i, /^what is/i, /^how to/i];
            
            const questionWordMatches = questionWords.filter(word => 
                prompt.toLowerCase().includes(word)
            ).length;

            const structureMatches = questionStructures.filter(pattern => 
                pattern.test(prompt)
            ).length;

            const score = (questionWordMatches * 0.6 + structureMatches * 0.4) / Math.max(questionWords.length, 1);
            
            return {
                score: Math.min(score, 1),
                patterns: {
                    questionWords: questionWordMatches,
                    structures: structureMatches
                }
            };
        }

        detectTechnicalIndicators(prompt) {
            const technicalTerms = ['algorithm', 'api', 'database', 'server', 'client', 'protocol', 'framework', 'library', 'architecture', 'system', 'platform', 'integration', 'deployment', 'configuration', 'optimization'];
            const jargonDensity = this.calculateJargonDensity(prompt, technicalTerms);
            const formalityScore = this.calculateFormalityScore(prompt);
            
            return {
                jargonDensity,
                formalityScore,
                technicalTerms: technicalTerms.filter(term => 
                    prompt.toLowerCase().includes(term)
                ).length
            };
        }

        detectUrgencySentiment(prompt) {
            const urgencyWords = ['urgent', 'asap', 'quickly', 'now', 'immediately', 'fast', 'rush', 'emergency', 'critical', 'important'];
            const sentimentWords = {
                positive: ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'love', 'like', 'good', 'best'],
                negative: ['bad', 'terrible', 'awful', 'hate', 'dislike', 'worst', 'horrible', 'annoying', 'frustrating', 'problem']
            };

            const urgencyScore = urgencyWords.filter(word => 
                prompt.toLowerCase().includes(word)
            ).length / Math.max(urgencyWords.length, 1);

            const positiveWords = sentimentWords.positive.filter(word => 
                prompt.toLowerCase().includes(word)
            ).length;

            const negativeWords = sentimentWords.negative.filter(word => 
                prompt.toLowerCase().includes(word)
            ).length;

            const sentimentScore = (positiveWords - negativeWords) / Math.max(positiveWords + negativeWords, 1);

            return {
                urgencyScore: Math.min(urgencyScore, 1),
                sentimentScore: Math.max(-1, Math.min(1, sentimentScore))
            };
        }

        detectTaskTypeSignals(prompt) {
            const taskSignals = {
                creative: ['story', 'poem', 'narrative', 'fiction', 'creative', 'imagine', 'design', 'art', 'draw', 'paint'],
                analysis: ['analyze', 'compare', 'evaluate', 'assess', 'examine', 'study', 'research', 'investigate', 'review'],
                generation: ['create', 'generate', 'make', 'build', 'write', 'produce', 'develop', 'construct', 'form'],
                explanation: ['explain', 'describe', 'tell', 'show', 'demonstrate', 'illustrate', 'clarify', 'define', 'teach']
            };

            const scores = {};
            for (const [type, words] of Object.entries(taskSignals)) {
                const matches = words.filter(word => 
                    prompt.toLowerCase().includes(word)
                ).length;
                scores[type] = matches / Math.max(words.length, 1);
            }

            return scores;
        }

        suggestCategories(patterns) {
            const suggestions = [];

            // Code indicators suggest coding
            if (patterns.codeIndicators.score > 0.3) {
                suggestions.push({
                    category: 'coding',
                    confidence: patterns.codeIndicators.score * 0.9
                });
            }

            // Image-related words suggest image generation
            const lowerPrompt = prompt.toLowerCase();
            const hasImageWords = lowerPrompt.includes('image') || lowerPrompt.includes('picture') || 
                                lowerPrompt.includes('photo') || lowerPrompt.includes('draw') || 
                                lowerPrompt.includes('art') || lowerPrompt.includes('visual');
            const hasCasualImageIntent = (lowerPrompt.includes('wanna') || lowerPrompt.includes('gonna')) && 
                                       (lowerPrompt.includes('make') || lowerPrompt.includes('create')) && hasImageWords;
            
            if ((patterns.taskTypeSignals.generation > 0.2 && hasImageWords) || hasCasualImageIntent) {
                const confidence = hasCasualImageIntent ? 0.9 : patterns.taskTypeSignals.generation * 0.8;
                suggestions.push({
                    category: 'image_generation',
                    confidence: confidence
                });
            }

            // Grammar/spelling indicators
            if (prompt.toLowerCase().includes('grammar') || 
                prompt.toLowerCase().includes('spelling') ||
                prompt.toLowerCase().includes('correct')) {
                suggestions.push({
                    category: 'grammar_spelling',
                    confidence: 0.8
                });
            }

            // Research/analysis indicators
            if (patterns.taskTypeSignals.analysis > 0.3) {
                suggestions.push({
                    category: 'research_analysis',
                    confidence: patterns.taskTypeSignals.analysis * 0.8
                });
            }

            // Content creation indicators
            if (patterns.taskTypeSignals.generation > 0.2 && 
                !prompt.toLowerCase().includes('image')) {
                suggestions.push({
                    category: 'content_creation',
                    confidence: patterns.taskTypeSignals.generation * 0.6
                });
            }

            // Default to general if no strong indicators
            if (suggestions.length === 0) {
                suggestions.push({
                    category: 'general',
                    confidence: 0.5
                });
            }

            return suggestions.sort((a, b) => b.confidence - a.confidence);
        }

        calculateOverallConfidence(patterns, suggestions) {
            if (suggestions.length === 0) return 0.3;

            const topSuggestion = suggestions[0];
            const confidenceFactors = [
                topSuggestion.confidence,
                patterns.codeIndicators.score,
                patterns.questionPatterns.score,
                patterns.technicalIndicators.jargonDensity,
                1 - Math.abs(patterns.urgencySentiment.sentimentScore) // Neutral sentiment is more confident
            ];

            return confidenceFactors.reduce((sum, factor) => sum + factor, 0) / confidenceFactors.length;
        }

        calculateJargonDensity(prompt, technicalTerms) {
            const words = prompt.toLowerCase().split(/\s+/);
            const technicalWordCount = words.filter(word => 
                technicalTerms.some(term => term.toLowerCase().includes(word) || word.includes(term.toLowerCase()))
            ).length;
            
            return technicalWordCount / Math.max(words.length, 1);
        }

        calculateFormalityScore(prompt) {
            const formalWords = ['please', 'could you', 'would you', 'thank you', 'appreciate', 'sir', 'madam'];
            const casualWords = ['hey', 'hi', 'thanks', 'thx', 'pls', 'yeah', 'yep', 'nope'];
            
            const formalCount = formalWords.filter(word => 
                prompt.toLowerCase().includes(word)
            ).length;
            
            const casualCount = casualWords.filter(word => 
                prompt.toLowerCase().includes(word)
            ).length;
            
            const total = formalCount + casualCount;
            return total === 0 ? 0.5 : formalCount / total;
        }
    }

    // Adaptive Feedback Controller
    class AdaptiveFeedbackController {
        constructor() {
            this.confidenceScorer = new ConfidenceScorer();
            this.feedbackThresholds = {
                high: 0.8,
                medium: 0.5,
                low: 0.0
            };
            this.feedbackRates = {
                high: 0.05,    // 5% random sampling
                medium: 0.30,  // 30% of the time
                low: 1.0       // Always ask
            };
        }

        async shouldShowFeedback(prompt, context) {
            const confidence = await this.confidenceScorer.calculateConfidence(prompt, context);
            const feedbackLevel = this.getFeedbackLevel(confidence);
            const shouldShow = this.calculateShouldShow(feedbackLevel, context);
            
            return {
                shouldShow,
                confidence,
                feedbackLevel,
                reason: this.getFeedbackReason(confidence, context)
            };
        }

        getFeedbackLevel(confidence) {
            if (confidence >= this.feedbackThresholds.high) return 'high';
            if (confidence >= this.feedbackThresholds.medium) return 'medium';
            return 'low';
        }

        calculateShouldShow(feedbackLevel, context) {
            const baseRate = this.feedbackRates[feedbackLevel];
            
            // Adjust based on context
            let adjustedRate = baseRate;
            
            // Increase rate for recent undos
            if (context.recentUndo) {
                adjustedRate = Math.min(adjustedRate * 1.5, 1.0);
            }
            
            // Increase rate for first-time patterns
            if (context.isFirstTimePattern) {
                adjustedRate = Math.min(adjustedRate * 2.0, 1.0);
            }
            
            // Decrease rate for high-confidence platforms
            if (context.platform && ['chatgpt', 'claude'].includes(context.platform.name)) {
                adjustedRate *= 0.8;
            }
            
            return Math.random() < adjustedRate;
        }

        getFeedbackReason(confidence, context) {
            if (confidence < this.feedbackThresholds.medium) {
                return 'Low confidence in categorization';
            }
            if (context.recentUndo) {
                return 'Recent undo detected - learning opportunity';
            }
            if (context.isFirstTimePattern) {
                return 'New pattern detected - need feedback';
            }
            return 'Random sampling for quality assurance';
        }
    }

    // User Personalization System
    class UserProfile {
        constructor() {
            this.userId = this.generateUserId();
            this.profile = this.getDefaultProfile();
            this.categoryStats = new Map();
            this.learningHistory = [];
        }

        generateUserId() {
            // Generate a unique user ID based on browser fingerprint
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Threadly User ID', 2, 2);
            
            const fingerprint = canvas.toDataURL() + 
                              navigator.userAgent + 
                              screen.width + 
                              screen.height + 
                              new Date().getTimezoneOffset();
            
            let hash = 0;
            for (let i = 0; i < fingerprint.length; i++) {
                const char = fingerprint.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return `user_${Math.abs(hash).toString(36)}`;
        }

        getDefaultProfile() {
            return {
                formality: 0.5,        // 0 = casual, 1 = formal
                verbosity: 0.5,        // 0 = concise, 1 = detailed
                technicalLevel: 0.5,   // 0 = beginner, 1 = expert
                preferences: {
                    useEmoji: false,
                    preferredGreeting: 'neutral',
                    sentenceStyle: 'mixed',
                    punctuationStyle: 'standard'
                },
                learningRate: 0.05,    // How fast to adjust preferences
                lastUpdated: Date.now()
            };
        }

        async loadProfile() {
            try {
                const data = await chrome.storage.local.get([`profile_${this.userId}`]);
                if (data[`profile_${this.userId}`]) {
                    this.profile = { ...this.getDefaultProfile(), ...data[`profile_${this.userId}`] };
                }
                
                const categoryData = await chrome.storage.local.get([`categoryStats_${this.userId}`]);
                if (categoryData[`categoryStats_${this.userId}`]) {
                    this.categoryStats = new Map(categoryData[`categoryStats_${this.userId}`]);
                }
            } catch (error) {
                console.error('Threadly: Error loading user profile:', error);
            }
        }

        async saveProfile() {
            try {
                await chrome.storage.local.set({
                    [`profile_${this.userId}`]: this.profile,
                    [`categoryStats_${this.userId}`]: Array.from(this.categoryStats.entries())
                });
            } catch (error) {
                console.error('Threadly: Error saving user profile:', error);
            }
        }

        updateFromFeedback(feedback) {
            const { category, feedback: userFeedback, context } = feedback;
            
            // Update category statistics
            this.updateCategoryStats(category, context);
            
            // Learn from implicit feedback
            if (feedback.type === 'implicit_feedback') {
                this.learnFromImplicitFeedback(feedback.analysis);
            }
            
            // Learn from explicit feedback
            if (userFeedback) {
                this.learnFromExplicitFeedback(userFeedback);
            }
            
            // Save updated profile
            this.saveProfile();
        }

        updateCategoryStats(category, context) {
            const now = Date.now();
            const stats = this.categoryStats.get(category) || {
                count: 0,
                lastUsed: now,
                avgConfidence: 0.5,
                totalConfidence: 0,
                contexts: []
            };
            
            stats.count++;
            stats.lastUsed = now;
            stats.contexts.push({
                timestamp: now,
                platform: context?.platform?.name,
                timeOfDay: context?.timeBasedPatterns?.timeOfDay
            });
            
            // Keep only last 50 contexts
            if (stats.contexts.length > 50) {
                stats.contexts = stats.contexts.slice(-50);
            }
            
            this.categoryStats.set(category, stats);
        }

        learnFromImplicitFeedback(analysis) {
            const { editPatterns, acceptanceRate } = analysis;
            
            // Learn formality preferences
            if (editPatterns.formalityChanges > 0) {
                const adjustment = acceptanceRate > 0.7 ? 0.02 : -0.02;
                this.adjustPreference('formality', adjustment);
            }
            
            // Learn verbosity preferences
            if (editPatterns.lengthChanges > 0) {
                const adjustment = acceptanceRate > 0.7 ? 0.02 : -0.02;
                this.adjustPreference('verbosity', adjustment);
            }
            
            // Learn technical level preferences
            if (editPatterns.technicalAdjustments > 0) {
                const adjustment = acceptanceRate > 0.7 ? 0.02 : -0.02;
                this.adjustPreference('technicalLevel', adjustment);
            }
        }

        learnFromExplicitFeedback(feedback) {
            const text = feedback.toLowerCase();
            
            // Learn formality preferences
            if (text.includes('formal') || text.includes('polite')) {
                this.adjustPreference('formality', 0.05);
            } else if (text.includes('casual') || text.includes('informal')) {
                this.adjustPreference('formality', -0.05);
            }
            
            // Learn verbosity preferences
            if (text.includes('detailed') || text.includes('verbose') || text.includes('longer')) {
                this.adjustPreference('verbosity', 0.05);
            } else if (text.includes('concise') || text.includes('short') || text.includes('brief')) {
                this.adjustPreference('verbosity', -0.05);
            }
            
            // Learn technical level preferences
            if (text.includes('technical') || text.includes('advanced') || text.includes('expert')) {
                this.adjustPreference('technicalLevel', 0.05);
            } else if (text.includes('simple') || text.includes('basic') || text.includes('beginner')) {
                this.adjustPreference('technicalLevel', -0.05);
            }
        }

        adjustPreference(preference, adjustment) {
            const oldValue = this.profile[preference];
            const newValue = Math.max(0, Math.min(1, oldValue + adjustment));
            this.profile[preference] = newValue;
            
            // Record learning history
            this.learningHistory.push({
                preference,
                oldValue,
                newValue,
                adjustment,
                timestamp: Date.now(),
                reason: 'user_feedback'
            });
            
            // Keep only last 100 learning events
            if (this.learningHistory.length > 100) {
                this.learningHistory = this.learningHistory.slice(-100);
            }
        }

        adaptRefinement(refinement, category) {
            let adaptedRefinement = refinement;
            
            // Apply formality adjustments
            if (this.profile.formality < 0.3) {
                adaptedRefinement = this.makeMoreCasual(adaptedRefinement);
            } else if (this.profile.formality > 0.7) {
                adaptedRefinement = this.makeMoreFormal(adaptedRefinement);
            }
            
            // Apply verbosity adjustments
            if (this.profile.verbosity < 0.3) {
                adaptedRefinement = this.makeMoreConcise(adaptedRefinement);
            } else if (this.profile.verbosity > 0.7) {
                adaptedRefinement = this.makeMoreDetailed(adaptedRefinement);
            }
            
            // Apply technical level adjustments
            if (this.profile.technicalLevel < 0.3) {
                adaptedRefinement = this.makeMoreBeginnerFriendly(adaptedRefinement);
            } else if (this.profile.technicalLevel > 0.7) {
                adaptedRefinement = this.makeMoreTechnical(adaptedRefinement);
            }
            
            return adaptedRefinement;
        }

        makeMoreCasual(text) {
            return text
                .replace(/Could you please/g, 'Can you')
                .replace(/Would you kindly/g, 'Can you')
                .replace(/I would appreciate it if/g, 'I need')
                .replace(/Thank you for your assistance/g, 'Thanks')
                .replace(/Please/g, '');
        }

        makeMoreFormal(text) {
            return text
                .replace(/Can you/g, 'Could you please')
                .replace(/I need/g, 'I would appreciate it if you could')
                .replace(/Thanks/g, 'Thank you for your assistance')
                .replace(/^/, 'Please ');
        }

        makeMoreConcise(text) {
            return text
                .replace(/\b(that|which|who|whom)\b/g, '')
                .replace(/\b(in order to|so as to)\b/g, 'to')
                .replace(/\b(due to the fact that|because of the fact that)\b/g, 'because')
                .replace(/\s+/g, ' ')
                .trim();
        }

        makeMoreDetailed(text) {
            return text
                .replace(/^/, 'I would like you to ')
                .replace(/\.$/, ' with detailed explanations and examples.');
        }

        makeMoreBeginnerFriendly(text) {
            return text
                .replace(/\balgorithm\b/g, 'step-by-step process')
                .replace(/\boptimize\b/g, 'improve')
                .replace(/\bimplement\b/g, 'create')
                .replace(/\bconfigure\b/g, 'set up');
        }

        makeMoreTechnical(text) {
            return text
                .replace(/\bstep-by-step process\b/g, 'algorithm')
                .replace(/\bimprove\b/g, 'optimize')
                .replace(/\bcreate\b/g, 'implement')
                .replace(/\bset up\b/g, 'configure');
        }
    }

    // A/B Testing Framework
    class ABTestingFramework {
        constructor() {
            this.experiments = new Map();
            this.userAssignments = new Map();
            this.metricsCollector = new MetricsCollector();
        }

        async createExperiment(experimentConfig) {
            const experiment = {
                id: experimentConfig.id,
                name: experimentConfig.name,
                description: experimentConfig.description,
                variants: experimentConfig.variants,
                metrics: experimentConfig.metrics,
                status: 'draft',
                startDate: null,
                endDate: null,
                minSamples: experimentConfig.minSamples || 100,
                significanceLevel: experimentConfig.significanceLevel || 0.05,
                results: {}
            };

            this.experiments.set(experiment.id, experiment);
            await this.saveExperiment(experiment);
            return experiment;
        }

        assignUserToVariant(experimentId, userId) {
            // Check if user already assigned
            if (this.userAssignments.has(`${experimentId}_${userId}`)) {
                return this.userAssignments.get(`${experimentId}_${userId}`);
            }

            const experiment = this.experiments.get(experimentId);
            if (!experiment || experiment.status !== 'running') {
                return null;
            }

            // Weighted random assignment
            const totalWeight = experiment.variants.reduce((sum, variant) => sum + variant.weight, 0);
            let random = Math.random() * totalWeight;
            
            for (const variant of experiment.variants) {
                random -= variant.weight;
                if (random <= 0) {
                    this.userAssignments.set(`${experimentId}_${userId}`, variant.id);
                    return variant.id;
                }
            }

            // Fallback to first variant
            const firstVariant = experiment.variants[0];
            this.userAssignments.set(`${experimentId}_${userId}`, firstVariant.id);
            return firstVariant.id;
        }

        async recordMetric(experimentId, userId, metricName, value) {
            const variantId = this.userAssignments.get(`${experimentId}_${userId}`);
            if (!variantId) return;

            const experiment = this.experiments.get(experimentId);
            if (!experiment) return;

            // Initialize results if needed
            if (!experiment.results[variantId]) {
                experiment.results[variantId] = {
                    samples: 0,
                    metrics: {}
                };
            }

            // Record metric
            if (!experiment.results[variantId].metrics[metricName]) {
                experiment.results[variantId].metrics[metricName] = [];
            }

            experiment.results[variantId].metrics[metricName].push({
                value,
                timestamp: Date.now()
            });

            experiment.results[variantId].samples++;
            await this.saveExperiment(experiment);
        }

        async saveExperiment(experiment) {
            try {
                await chrome.storage.local.set({
                    [`experiment_${experiment.id}`]: experiment
                });
            } catch (error) {
                console.error('Threadly: Error saving experiment:', error);
            }
        }
    }

    // Metrics Collector
    class MetricsCollector {
        constructor() {
            this.metrics = new Map();
        }

        recordMetric(experimentId, variantId, metricName, value, metadata = {}) {
            const key = `${experimentId}_${variantId}_${metricName}`;
            if (!this.metrics.has(key)) {
                this.metrics.set(key, []);
            }
            
            this.metrics.get(key).push({
                value,
                timestamp: Date.now(),
                metadata
            });
        }

        getMetrics(experimentId, variantId, metricName) {
            const key = `${experimentId}_${variantId}_${metricName}`;
            return this.metrics.get(key) || [];
        }
    }

    // --- Category Feedback Popup --- //
    
    function showCategoryFeedbackPopup(prompt, textElement) {
        console.log('Threadly: Showing category feedback popup for prompt:', prompt);
        
        // Remove any existing feedback popup
        const existingPopup = document.getElementById('threadly-category-feedback-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create popup container
        const popup = document.createElement('div');
        popup.id = 'threadly-category-feedback-popup';
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // Trigger animation
        setTimeout(() => {
            popup.style.opacity = '1';
        }, 10);

        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.style.cssText = `
            background: rgba(40, 40, 40, 0.5);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            position: relative;
            transform: scale(0.9);
            transition: all 0.3s ease;
        `;
        
        // Trigger scale animation
        setTimeout(() => {
            popupContent.style.transform = 'scale(1)';
        }, 50);

        // Create title
        const title = document.createElement('h3');
        title.textContent = 'Help Threadly Learn';
        title.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 24px;
            font-weight: 700;
                    color: #ffffff;
            text-align: center;
        `;

        // Create description
        const description = document.createElement('p');
        description.textContent = 'Did Threadly correctly recognize what type of task this was?';
        description.style.cssText = `
            margin: 0 0 24px 0;
            color: #e5e5e5;
            font-size: 16px;
            line-height: 1.6;
            text-align: center;
        `;

        // Create prompt preview
        const promptPreview = document.createElement('div');
        promptPreview.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            padding: 16px;
            border-radius: 8px;
                    font-size: 14px;
            color: #ffffff;
            margin: 0 0 24px 0;
            max-height: 100px;
            overflow-y: auto;
            border-left: 4px solid #6366f1;
        `;
        promptPreview.textContent = `"${prompt.substring(0, 200)}${prompt.length > 200 ? '...' : ''}"`;

        // Create category verification section
        const categorySection = document.createElement('div');
        categorySection.style.cssText = `
            margin-bottom: 24px;
        `;

        const categoryLabel = document.createElement('label');
        categoryLabel.textContent = 'What type of task is this?';
        categoryLabel.style.cssText = `
            display: block;
            margin-bottom: 12px;
            color: #ffffff;
            font-weight: 600;
            font-size: 16px;
        `;

        const categorySelect = document.createElement('select');
        categorySelect.id = 'category-select';
        categorySelect.style.cssText = `
            width: 100%;
            padding: 12px 16px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
                        color: #ffffff;
            font-size: 16px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        `;

        // Add category options
        const categories = [
            { value: 'grammar_spelling', label: 'Grammar & Spelling' },
            { value: 'image_generation', label: 'Image Generation' },
            { value: 'coding', label: 'Coding' },
            { value: 'research_analysis', label: 'Research & Analysis' },
            { value: 'content_creation', label: 'Content Creation' },
            { value: 'general', label: 'General' }
        ];

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = category.label;
            option.style.cssText = `
                background: #2a2a2a;
                color: #ffffff;
            `;
            categorySelect.appendChild(option);
        });

        categorySection.appendChild(categoryLabel);
        categorySection.appendChild(categorySelect);

        // Create feedback text area
        const feedbackSection = document.createElement('div');
        feedbackSection.style.cssText = `
            margin-bottom: 24px;
        `;

        const feedbackLabel = document.createElement('label');
        feedbackLabel.textContent = 'Additional feedback (optional)';
        feedbackLabel.style.cssText = `
            display: block;
            margin-bottom: 12px;
            color: #ffffff;
            font-weight: 600;
            font-size: 16px;
        `;

        const feedbackTextarea = document.createElement('textarea');
        feedbackTextarea.id = 'feedback-textarea';
        feedbackTextarea.placeholder = 'Tell us how we can improve the refinement...';
        feedbackTextarea.style.cssText = `
            width: 100%;
            height: 80px;
            padding: 12px 16px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
                        color: #ffffff;
            font-size: 14px;
            font-family: inherit;
            resize: vertical;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        `;

        feedbackSection.appendChild(feedbackLabel);
        feedbackSection.appendChild(feedbackTextarea);

        // Create buttons container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        `;

        // Create skip button
        const skipButton = document.createElement('button');
        skipButton.textContent = 'Skip';
        skipButton.style.cssText = `
            padding: 12px 24px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            color: #e5e5e5;
            font-size: 14px;
            font-weight: 600;
                        cursor: pointer;
            transition: all 0.2s ease;
        `;

        skipButton.addEventListener('mouseenter', () => {
            skipButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });

        skipButton.addEventListener('mouseleave', () => {
            skipButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });

        skipButton.addEventListener('click', () => {
            popup.remove();
        });

        // Create submit button
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit Feedback';
        submitButton.style.cssText = `
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            background: #6366f1;
            color: white;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        `;

        submitButton.addEventListener('mouseenter', () => {
            submitButton.style.backgroundColor = '#4f46e5';
            submitButton.style.transform = 'translateY(-1px)';
        });

        submitButton.addEventListener('mouseleave', () => {
            submitButton.style.backgroundColor = '#6366f1';
            submitButton.style.transform = 'translateY(0)';
        });

        submitButton.addEventListener('click', async () => {
            const selectedCategory = categorySelect.value;
            const feedback = feedbackTextarea.value.trim();
            
            try {
                await submitCategoryFeedback(prompt, selectedCategory, feedback);
                popup.remove();
                showToast('Thanks for the feedback! 🎉');
            } catch (error) {
                console.error('Threadly: Error submitting category feedback:', error);
                showToast('Failed to submit feedback. Please try again.');
            }
        });

        buttonContainer.appendChild(skipButton);
        buttonContainer.appendChild(submitButton);

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '✕';
        closeButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            font-size: 18px;
            color: rgba(255, 255, 255, 0.8);
            cursor: pointer;
            padding: 8px;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;
        
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            closeButton.style.color = 'rgba(255, 255, 255, 1)';
            closeButton.style.transform = 'scale(1.1)';
        });
        
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            closeButton.style.color = 'rgba(255, 255, 255, 0.8)';
            closeButton.style.transform = 'scale(1)';
        });

        closeButton.addEventListener('click', () => {
            popup.remove();
        });

        // Assemble popup
        popupContent.appendChild(closeButton);
        popupContent.appendChild(title);
        popupContent.appendChild(description);
        popupContent.appendChild(promptPreview);
        popupContent.appendChild(categorySection);
        popupContent.appendChild(feedbackSection);
        popupContent.appendChild(buttonContainer);
        popup.appendChild(popupContent);

        // Add to page
        document.body.appendChild(popup);

        // Close on background click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });
    }

    async function submitCategoryFeedback(prompt, category, feedback) {
        try {
            const feedbackData = {
                prompt: prompt,
                category: category,
                feedback: feedback,
                timestamp: Date.now(),
                type: 'category_feedback'
            };

            console.log('Threadly: Submitting category feedback:', feedbackData);

            // Send to background script
            const response = await chrome.runtime.sendMessage({
                action: 'storeFeedback',
                feedback: feedbackData
            });

            console.log('Threadly: Background script response:', response);

            if (response && response.success) {
                console.log('Threadly: Category feedback submitted successfully', feedbackData);
                return true;
            } else {
                console.error('Threadly: Failed to submit category feedback - no success response');
                throw new Error('No success response from background script');
            }
        } catch (error) {
            console.error('Threadly: Error submitting category feedback:', error);
            throw error;
        }
    }

    function getCategoryDisplayName(categoryKey) {
        const names = {
            'grammar_spelling': 'Grammar & Spelling',
            'image_generation': 'Image Generation',
            'coding': 'Coding',
            'research_analysis': 'Research & Analysis',
            'content_creation': 'Content Creation',
            'general': 'General'
        };
        return names[categoryKey] || categoryKey;
    }

    async function submitFeedback(prompt, incorrectCategory, correctCategory) {
        try {
            const feedback = {
                prompt: prompt,
                incorrectCategory: incorrectCategory,
                correctCategory: correctCategory,
                timestamp: Date.now()
            };

            console.log('Threadly: Submitting feedback:', feedback);

            // Send to background script
            const response = await chrome.runtime.sendMessage({
                action: 'storeFeedback',
                feedback: feedback
            });

            console.log('Threadly: Background script response:', response);

            if (response && response.success) {
                console.log('Threadly: Feedback submitted successfully', feedback);
                
                // Show success message
                showToast('Thanks for the feedback! 🎉');
                return true;
            } else {
                console.error('Threadly: Failed to submit feedback - no success response');
                showToast('Failed to submit feedback. Please try again.');
                throw new Error('No success response from background script');
            }
        } catch (error) {
            console.error('Threadly: Error submitting feedback:', error);
            showToast('Error submitting feedback. Please try again.');
            throw error; // Re-throw to allow calling code to handle it
        }
    }

    // --- Support Popup Notification System --- //
    
    // Listen for popup notification messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'showSupportPopup') {
            showSupportPopup();
            sendResponse({ success: true });
        }
    });

    /**
     * Initialize support popup system - shows every 8 hours
     */
    function initializeSupportPopup() {
        const now = Date.now();
        const lastPopupTime = localStorage.getItem('threadly_support_popup_last_shown');
        const eightHours = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
        
        // Check if 8 hours have passed since last popup
        if (!lastPopupTime || (now - parseInt(lastPopupTime)) >= eightHours) {
            // Show popup after a delay to let the page load
            setTimeout(() => {
                showSupportPopup();
                // Update last shown time
                localStorage.setItem('threadly_support_popup_last_shown', now.toString());
            }, 5000); // 5 seconds delay
        }
    }

    /**
     * Show support popup notification
     */
    function showSupportPopup() {
        // Check if popup already exists
        if (document.getElementById('threadly-support-popup')) {
            return;
        }

        // Create popup container with Threadly sidebar background
        const popup = document.createElement('div');
        popup.id = 'threadly-support-popup';
        popup.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 280px;
            background: transparent;
            color: #ffffff;
            padding: 0;
            border-radius: 18px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0px 6px 24px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            animation: popInFromTop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            backdrop-filter: blur(0px);
            -webkit-backdrop-filter: blur(0px);
            isolation: isolate;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            overflow: visible;
        `;

        // Add CSS animation and Threadly sidebar glass effects
        const style = document.createElement('style');
        style.textContent = `
            @keyframes popInFromTop {
                0% {
                    transform: translateX(-50%) translateY(-100%);
                    opacity: 0;
                    scale: 0.9;
                }
                50% {
                    transform: translateX(-50%) translateY(-5px);
                    opacity: 0.9;
                    scale: 1.02;
                }
                100% {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                    scale: 1;
                }
            }
            @keyframes popOutToTop {
                0% {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                    scale: 1;
                }
                100% {
                    transform: translateX(-50%) translateY(-100%);
                    opacity: 0;
                    scale: 0.9;
                }
            }
            
            /* Threadly sidebar glass effect layers */
            #threadly-support-popup::before {
                content: '';
                position: absolute;
                inset: 0;
                z-index: -2;
                border-radius: 18px;
                background: rgba(42, 42, 42, 0.8);
                box-shadow: 0px 6px 24px rgba(0, 0, 0, 0.1);
            }
            
            #threadly-support-popup::after {
                content: '';
                position: absolute;
                inset: 0;
                z-index: -1;
                border-radius: 18px;
                backdrop-filter: blur(0px);
                -webkit-backdrop-filter: blur(0px);
                pointer-events: none;
            }
            
            #threadly-support-popup .threadly-tint-layer {
                content: '';
                position: absolute;
                inset: 0;
                z-index: 0;
                border-radius: 18px;
                background-color: transparent;
                pointer-events: none;
            }
            
            /* Yellow hover effects */
            .threadly-popup-button:hover {
                background: rgba(255, 193, 7, 0.15) !important;
                border-color: rgba(255, 193, 7, 0.3) !important;
                color: #ffc107 !important;
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(255, 193, 7, 0.2);
            }
            
            /* Ensure title is centered */
            .threadly-brand {
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center;
            }
            
            /* Close button container */
            #threadly-popup-close {
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
            }
            
            /* Close button hover effect */
            #threadly-popup-close:hover {
                background: transparent !important;
                color: #ff0000 !important;
            }

            /* Confirmation state styles */
            #threadly-support-popup.confirmation-mode {
                animation: shake 0.5s ease-in-out;
            }

            @keyframes shake {
                0%, 100% { transform: translateX(-50%) translateY(0); }
                25% { transform: translateX(-50%) translateY(-5px) translateX(-2px); }
                75% { transform: translateX(-50%) translateY(-5px) translateX(2px); }
            }
        `;
        document.head.appendChild(style);

        // Create popup content with Threadly sidebar styling
        popup.innerHTML = `
            <div class="threadly-tint-layer"></div>
            <div style="position: relative; width: 100%; padding: 18px; z-index: 1;">
                <button id="threadly-popup-close" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: transparent;
                    border: none;
                    color: #ffffff;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0;
                    width: 25px;
                    height: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s;
                    z-index: 10;
                ">×</button>
                
                <div class="threadly-brand" style="margin: 0 0 10px 0; font-size: 17px; text-align: center; width: 100%;">
                    Support Threadly
                </div>
                
                <p style="margin: 0 0 14px 0; color: rgba(255, 255, 255, 0.8); font-size: 11px; line-height: 1.3; text-align: center;">
                    Help support the creator's work!
                </p>
                
                <div style="display: flex; gap: 8px; align-items: center; justify-content: center; flex-wrap: wrap;">
                    <a href="https://ko-fi.com/evinjohnn" target="_blank" class="threadly-popup-button" style="
                        background: rgba(255, 255, 255, 0.08);
                        color: #ffffff;
                        text-decoration: none;
                        padding: 7px 14px;
                        border-radius: 6px;
                        font-weight: 500;
                        transition: all 0.2s;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        font-size: 11px;
                        text-align: center;
                    ">Buy me a coffee</a>
                    <a href="https://github.com/evin/Threadly" target="_blank" class="threadly-popup-button" style="
                        background: rgba(255, 255, 255, 0.08);
                        color: #ffffff;
                        text-decoration: none;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        padding: 7px 14px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 11px;
                        transition: all 0.2s;
                        text-align: center;
                    ">Star the repo</a>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(popup);

        // Add event listeners
        const closeBtn = popup.querySelector('#threadly-popup-close');
        const starRepoLink = popup.querySelector('a[href="https://github.com/evin/Threadly"]');
        let isConfirmationMode = false;

        const removePopup = () => {
            popup.style.animation = 'popOutToTop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            }, 400);
        };

        const showConfirmation = () => {
            isConfirmationMode = true;
            popup.classList.add('confirmation-mode');
            
            // Change popup content to confirmation message
            const contentDiv = popup.querySelector('div[style*="position: relative"]');
            contentDiv.innerHTML = `
                <button id="threadly-popup-close" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: transparent;
                    border: none;
                    color: #ffffff;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0;
                    width: 25px;
                    height: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s;
                    z-index: 10;
                ">×</button>
                
                <div class="threadly-brand" style="margin: 0 0 10px 0; font-size: 17px; text-align: center; width: 100%;">
                    Are you sure? 😢
                </div>
                
                <p style="margin: 0 0 16px 0; color: rgba(255, 255, 255, 0.8); font-size: 11px; line-height: 1.3; text-align: center;">
                    Why don't you support the creator who spent countless hours building this amazing tool for you? A simple star on GitHub or a small donation would mean the world! 🌟
                </p>
                
                <div style="display: flex; gap: 8px; align-items: center; justify-content: center; flex-wrap: wrap;">
                    <button id="confirmStarBtn" class="threadly-popup-button" style="
                        background: rgba(255, 255, 255, 0.08);
                        color: #ffffff;
                        text-decoration: none;
                        padding: 7px 14px;
                        border-radius: 6px;
                        font-weight: 500;
                        transition: all 0.2s;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        font-size: 11px;
                        text-align: center;
                        cursor: pointer;
                    ">⭐ Star Repository</button>
                    <button id="confirmDonateBtn" class="threadly-popup-button" style="
                        background: rgba(255, 255, 255, 0.08);
                        color: #ffffff;
                        text-decoration: none;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        padding: 7px 14px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 11px;
                        transition: all 0.2s;
                        text-align: center;
                    ">💝 Donate</button>
                </div>
            `;
            
            // Re-add event listeners for new buttons
            const newCloseBtn = popup.querySelector('#threadly-popup-close');
            const confirmStarBtn = popup.querySelector('#confirmStarBtn');
            const confirmDonateBtn = popup.querySelector('#confirmDonateBtn');
            
            // Remove any existing event listeners and add new ones
            newCloseBtn.replaceWith(newCloseBtn.cloneNode(true));
            const freshCloseBtn = popup.querySelector('#threadly-popup-close');
            
            freshCloseBtn.addEventListener('click', removePopup);
            confirmStarBtn.addEventListener('click', () => {
                window.open('https://github.com/evin/Threadly', '_blank');
                removePopup();
            });
            confirmDonateBtn.addEventListener('click', () => {
                window.open('https://ko-fi.com/evinjohnn', '_blank');
                removePopup();
            });
        };

        closeBtn.addEventListener('click', showConfirmation);
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (document.getElementById('threadly-support-popup')) {
                removePopup();
            }
        }, 10000);
    }


})();