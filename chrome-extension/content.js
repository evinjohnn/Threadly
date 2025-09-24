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
        'x-ai': {
            name: 'X.AI',
            chatContainer: 'div[style*="flex-direction: column;"], main',
            userSelector: 'div.user-message, [data-role="user"]',
        },
        'ai-studio': {
            name: 'AI Studio',
            chatContainer: 'div.chat-container, main, .conversation-container',
            userSelector: 'ms-cmark-node.user-chunk span, ms-cmark-node.user-chunk p span',
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
    let debouncedUpdate = debounce(async () => await updateAndSaveConversation(), 750); // Increased debounce
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

    // --- DOM Elements --- //
    let container, panel, closeButton, messageList, searchInput, platformIndicator, toggleBar, toggleSegment, scrollIndicator;

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
        
        console.log('Threadly: Unknown platform');
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
        console.log('Threadly: Found', userMessages.length, 'user messages');
        
        if (userMessages.length === 0) {
            console.log('Threadly: No user messages, hiding dots');
            scrollIndicator.style.display = 'none';
            scrollIndicator.classList.remove('visible');
            return;
        }
        
        // Create dots for each user message
        userMessages.forEach((msg, index) => {
            const dot = document.createElement('div');
            dot.className = 'threadly-scroll-dot';
            dot.dataset.messageIndex = messages.indexOf(msg);
            dot.title = `Jump to user message ${index + 1}`;
            
            // Apply platform-specific color
            const platformColor = getPlatformSavedIconColor();
            dot.style.setProperty('--platform-color', platformColor);
            
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
                scrollToMessage(msg, messages.indexOf(msg));
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
        if (!message.element || !document.body.contains(message.element)) {
            console.warn('Threadly: Message element not found for scroll');
            return;
        }
        
        // Scroll to the message
        message.element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
        });
        
        // Highlight the message
        const originalBg = message.element.style.backgroundColor;
        const originalTransition = message.element.style.transition;
        message.element.style.transition = 'background-color 0.3s ease';
        message.element.style.backgroundColor = getPlatformHighlightColor();
        
        // Update active dot
        updateActiveScrollDot(index);
        
        // Reset highlight after delay
        setTimeout(() => {
            message.element.style.backgroundColor = originalBg;
            message.element.style.transition = originalTransition;
        }, 1500);
        
        console.log('Threadly: Scrolled to message', index + 1);
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

    // --- Enhanced UI Injection --- //
    function injectUI() {
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
                <filter id="threadly-goo" x="0%" y="0%" width="100%" height="100%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" 
                        values="1 0 0 0 0  
                                0 1 0 0 0  
                                0 0 1 0 0  
                                0 0 0 25 -10" result="goo" />
                    <feBlend in="SourceGraphic" in2="goo" />
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
                // Toggle the visual state - like selection button (square ↔ X)
                console.log('Threadly: SAVED bulb clicked - current state:', savedButtonActive);
                setSavedButtonActive(!savedButtonActive);
                console.log('Threadly: SAVED bulb clicked - new state:', savedButtonActive);
                
                if (!savedButtonActive) {
                    // If deactivating (click 2), return to previous active state
                    console.log('Threadly: Returning to previous state:', messageFilterState);
                    console.log('Threadly: Calling resetNavbarToOriginal');
                    resetNavbarToOriginal();
                    
                    // Return message area to normal view
                    console.log('Threadly: Calling returnToMainMessages');
                    returnToMainMessages();
                } else {
                    // If activating (click 1), show collections view
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
                    setSavedButtonActive(!savedButtonActive);
                    renderCollectionsView();
                    morphNavbarToSavedState();
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
        
        document.addEventListener('click', handleClickOutside);
    }
    
    function handleClickOutside(e) {
        // Don't close panel if we're in collections view (SAVED state)
        // Also don't close if clicking on navigation dots
        if (panel.classList.contains('threadly-expanded') && 
            !panel.contains(e.target) && 
            !isInCollectionsView &&
            !e.target.closest('#threadly-scroll-indicator')) {
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
            
            
            setTimeout(async () => {
                await updateAndSaveConversation();
            }, 300);
        } else {
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
                        platform: msg.platform || platformFromKey // Use stored platform or extract from key
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

    // --- Enhanced Chat Extraction --- //
    function extractConversation() {
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
                    
                    
                    // Try different text extraction methods
                    if (userEl.textContent) {
                        text = userEl.textContent.trim();
                    } else if (userEl.innerText) {
                        text = userEl.innerText.trim();
                    } else if (userEl.value) {
                        text = userEl.value.trim();
                    }
                    
                    if (text && text.length > 2) { // Minimum length check
                        // AI Studio specific filtering: simple and direct
                        if (currentPlatformId === 'ai-studio') {
                            // Skip if text is too short
                            if (text.length < 5) {
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
                        
                        // Extracted user message
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
            aiSelectors = 'ms-chat-turn .model-prompt-container .turn-content ms-prompt-chunk:not(:has(ms-thought-chunk)) span, ms-chat-turn .model-prompt-container .turn-content ms-prompt-chunk:not(:has(ms-thought-chunk)) p span';
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
            
            
            aiElements.forEach((aiEl, index) => {
                let text = '';
                
                if (aiEl.textContent) {
                    text = aiEl.textContent.trim();
                } else if (aiEl.innerText) {
                    text = aiEl.innerText.trim();
                }
                
                if (text && text.length > 2) {
                    // For AI Studio, simple filtering
                    if (currentPlatformId === 'ai-studio') {
                        // Skip if text is too short
                        if (text.length < 10) {
                            return; // Skip this element
                        }
                        
                        // Skip if it looks like HTML/XML markup
                        if (text.includes('<') && text.includes('>')) {
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
                    
                    // Extracted AI message
                    extracted.push({
                        role: 'assistant',
                        content: text,
                        element: aiEl
                    });
                }
            });
            
            // Simple fallback for AI Studio
            if (aiElements.length === 0 && currentPlatformId === 'ai-studio') {
                console.log('Threadly: Trying simple AI Studio fallback...');
                
                // Look for any span elements that might contain AI responses
                const allSpans = document.querySelectorAll('span');
                allSpans.forEach(span => {
                    const text = span.textContent?.trim() || '';
                    if (text.length > 20 && text.length < 1000) {
                        // Skip if it's likely a user message
                        const isUserMessage = extracted.some(msg => 
                            msg.content === text || msg.element === span
                        );
                        
                        if (!isUserMessage) {
                            extracted.push({
                                role: 'assistant',
                                content: text,
                                element: span
                            });
                        }
                    }
                });
            }
        } catch (error) {
            console.warn('Threadly: Error extracting AI responses:', error);
        }
        
        // Debug: Log what elements are available for better debugging (only in development)
        if (extracted.length === 0 && window.location.hostname === 'localhost') {
            const debugElements = document.querySelectorAll('div, p, span');
            
            // Log first few elements for debugging
            Array.from(debugElements).slice(0, 5).forEach((el, i) => {
                const text = el.textContent?.trim() || '';
                if (text.length > 5) {
                    console.log(`Threadly: Debug - Element ${i}:`, text.substring(0, 50) + '...');
                }
            });
        }
        
        return extracted;
    }

    // --- Enhanced Rendering --- //
    function renderMessages(messagesToRender) {
        console.log('Threadly: renderMessages called with', messagesToRender.length, 'messages, isInCollectionsView:', isInCollectionsView);
        
        // Check if we're in input mode (typing collection name) - if so, don't render messages
        const isInInputMode = document.querySelector('#collectionNameInput');
        if (isInInputMode && isInCollectionsView) {
            console.log('Threadly: renderMessages - in input mode, keeping collections view');
            return;
        }
        
        if (!messageList) return;
        
        // Update navigation dots with the messages being rendered
        updateScrollIndicator(messagesToRender);
        
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
            item.dataset.messageId = msg.id;
            
            if (msg.isFavorited) {
                item.classList.add('favorited');
                item.setAttribute('data-starred', 'true');
                // Set left border color based on the original platform where message was pinned
                let leftBorderColor;
                if (msg.originalPlatform && msg.originalPlatform !== currentPlatformId) {
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
                    leftBorderColor = originalPlatformColors[msg.originalPlatform] || 'rgba(0, 191, 174, 0.8)';
                } else {
                    // Use current platform's accent color
                    leftBorderColor = getPlatformHighlightColor().replace('0.2', '0.8');
                }
                item.style.borderLeft = `4px solid ${leftBorderColor}`;
            } else {
                item.setAttribute('data-starred', 'false');
                // Set platform-specific left border color for regular messages
                const platformAccentColor = getPlatformHighlightColor().replace('0.2', '0.8');
                item.style.borderLeft = `4px solid ${platformAccentColor}`;
            }
            
            // Check if message is longer than 10 words
            const wordCount = msg.content.trim().split(/\s+/).length;
            const isLongMessage = wordCount > 10;
            
            const roleText = msg.role === 'user' ? `You (#${index + 1})` : `AI (#${index + 1})`;
            
            // Add platform indicator for favorited messages
            let platformIndicator = '';
            if (msg.isFavorited && msg.originalPlatform && msg.originalPlatform !== currentPlatformId) {
                const platformName = PLATFORM_CONFIG[msg.originalPlatform]?.name || msg.originalPlatform;
                platformIndicator = `<span class="threadly-platform-badge" data-original-platform="${msg.originalPlatform}">${platformName}</span>`;
            }
            
            // Get platform accent color
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
            starBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(msg, index);
            });

            // Check if text is actually truncated and only show "See More" when needed
            const messageText = item.querySelector('.threadly-message-text');
            const readMoreBtn = item.querySelector('.threadly-read-more');
            
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

            // Add copy button event listener
            const copyBtn = item.querySelector('.threadly-copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    copyMessageToClipboard(msg.content);
                });
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
            
            if (msg.element && document.body.contains(msg.element)) {
                // Only enable scroll behavior if not in selection mode
                if (!isInSelectionMode) {
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
                } else {
                    // In selection mode, just show it's clickable for the checkbox
                    item.style.cursor = 'default';
                }
            }
            fragment.appendChild(item);
        });
        messageList.appendChild(fragment);
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
        } else if (messageFilterState === 'assistant') {
            filtered = filtered.filter(m => m.role === 'assistant');
        } else if (messageFilterState === 'favorites') {
            // For favorites, we need to load and show all global favorites
            await loadAndShowAllFavorites();
            return; // Exit early as loadAndShowAllFavorites will handle rendering
        }
        
        renderMessages(filtered);
    }

    async function loadAndShowAllFavorites() {
        try {
            const globalFavorites = await loadFavoritesFromStorage();
            
            if (globalFavorites.length === 0) {
                messageList.innerHTML = '<div class="threadly-empty-state">No favorited messages found. Star some messages to see them here!</div>';
                return;
            }
            
            // Create a display list of all global favorites
            const favoritesToShow = globalFavorites.map((fav, index) => ({
                content: fav.content,
                role: fav.role,
                isFavorited: true,
                originalPlatform: fav.platform,
                chatPath: fav.chatPath,
                timestamp: fav.timestamp,
                element: null, // No element reference for cross-platform favorites
                index: index
            }));
            
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
                            <input type="checkbox" class="threadly-message-checkbox" id="global_checkbox_${index}" data-message-id="${fav.id || `global_fav_${index}`}">
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
        // If we're in collections view, return to main messages first
        if (isInCollectionsView) {
            isInCollectionsView = false;
        }
        
        messageFilterState = state;
        
        // Update the toggle segment position
        toggleSegment.classList.remove('user', 'assistant', 'fav', 'collection');
        toggleSegment.classList.add(state === 'user' ? 'user' : state === 'assistant' ? 'assistant' : state === 'favorites' ? 'fav' : 'collection');
        
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
        
        await filterMessages(searchInput.value);
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
            if (!messageList) {
                console.error('Threadly: messageList not found in renderCollectionsView');
                return;
            }
            
            // Set flag to indicate we're in collections view
            isInCollectionsView = true;
            
            // Clear current collection ID since we're viewing the collections list
            currentCollectionId = null;
            
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
                    await assignMessagesToCollection(collection.id);
                    console.log('Threadly: assignMessagesToCollection completed for:', collection.name);
                    
                    // Step 2: Call the new function to correctly reset the UI
                    console.log('Threadly: About to call finalizeAssignmentAndReturnToCollections for:', collection.name);
                    await finalizeAssignmentAndReturnToCollections(collection.id);
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
                
                // Debug first few messages
                if (idx < 3) {
                    console.log('Threadly: Message', idx, 'platform info:', {
                        platform: message.platform,
                        originalPlatform: message.originalPlatform,
                        content: message.content.substring(0, 30)
                    });
                }
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
            
            backButton.addEventListener('mouseenter', () => {
                backButton.style.background = 'transparent';
            });
            
            backButton.addEventListener('mouseleave', () => {
                backButton.style.background = 'transparent';
            });
            
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
            collectionMessages.forEach((msg, index) => {
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
                
                fragment.appendChild(item);
            });
            
            messageList.appendChild(fragment);
            
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
            const messages = await loadMessagesFromStorage();
            messages.forEach(message => {
                if (message.collectionIds && message.collectionIds.includes(collectionId)) {
                    message.collectionIds = message.collectionIds.filter(id => id !== collectionId);
                }
            });
            
            // Save updated messages
            await saveMessagesToStorage(messages);
            
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
        try {
            // Load messages from storage
            const messages = await loadMessagesFromStorage();
            
            // Find the message
            const messageIndex = messages.findIndex(m => m.id === message.id);
            if (messageIndex === -1) {
                console.error('Threadly: Message not found:', message.id);
                return;
            }
            
            // Remove collection ID from the message's collectionIds array
            if (messages[messageIndex].collectionIds && messages[messageIndex].collectionIds.includes(collectionId)) {
                messages[messageIndex].collectionIds = messages[messageIndex].collectionIds.filter(id => id !== collectionId);
                
                // Save updated messages
                await saveMessagesToStorage(messages);
                
                // Update collection message counts
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
        if (!currentCollectionId || selectedMessageIds.length === 0) {
            console.error('Threadly: No collection or messages selected for deletion');
            return;
        }

        try {
            console.log('Threadly: Deleting messages from collection:', currentCollectionId, 'Messages:', selectedMessageIds);
            
            // Load collections from storage
            const collections = await loadCollectionsFromStorage();
            
            // Find the specific collection
            const collection = collections.find(c => c.id === currentCollectionId);
            if (!collection) {
                console.error('Threadly: Collection not found:', currentCollectionId);
                showToast('Collection not found');
                return;
            }
            
            // Remove the selected message IDs from the collection's messageIds array
            const originalCount = collection.messageIds.length;
            collection.messageIds = collection.messageIds.filter(id => !selectedMessageIds.includes(id));
            const removedCount = originalCount - collection.messageIds.length;
            
            // Save the updated collections
            await saveCollectionsToStorage(collections);
            
            // Update collection message counts
            await updateCollectionMessageCounts();
            
            console.log('Threadly: Removed', removedCount, 'messages from collection:', collection.name);
            
            // Show confirmation toast
            showToast(`Removed ${removedCount} message(s) from '${collection.name}'`);
            
            // Exit selection mode and refresh the collection view
            await exitSelectionMode();
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
            const messages = await loadMessagesFromStorage();
            messages.forEach(message => {
                if (message.collectionIds) {
                    message.collectionIds = message.collectionIds.filter(id => !selectedCollectionIds.includes(id));
                }
            });
            
            // Save updated messages
            await saveMessagesToStorage(messages);
            
            // Update global favorites if needed
            await updateGlobalFavorites();
            
            // Update collection message counts
            await updateCollectionMessageCounts();
            
            console.log('Threadly: Deleted collections:', deletedNames);
            
            // Show confirmation toast
            showToast(`Deleted ${deletedNames.length} saved folder(s): ${deletedNames.join(', ')}`);
            
            // Exit selection mode and refresh the collections view
            await exitSelectionMode();
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
            // Load messages from storage
            const messages = await loadMessagesFromStorage();
            
            // Update messages with collection ID
            messageIds.forEach(id => {
                const messageIndex = messages.findIndex(m => (m.id || m.content) === id);
                if (messageIndex !== -1) {
                    if (!messages[messageIndex].collectionIds) {
                        messages[messageIndex].collectionIds = [];
                    }
                    if (!messages[messageIndex].collectionIds.includes(collectionId)) {
                        messages[messageIndex].collectionIds.push(collectionId);
                    }
                }
            });
            
            // Save updated messages
            await saveMessagesToStorage(messages);
            
            // Update global favorites if needed
            await updateGlobalFavorites();
            
            // Update collection message counts
            await updateCollectionMessageCounts();
            
            // Show confirmation toast
            const collectionName = await getCollectionName(collectionId);
            showToast(`Moved ${messageIds.length} items to '${collectionName}'`);
            
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
            // Load messages from storage
            const messages = await loadMessagesFromStorage();
            
            // Unstar selected messages
            for (const messageId of selectedMessageIds) {
                // Find the message in messages
                const messageIndex = messages.findIndex(m => (m.id || m.content) === messageId);
                
                if (messageIndex !== -1) {
                    messages[messageIndex].isFavorited = false;
                    if (messages[messageIndex].collectionIds) {
                        messages[messageIndex].collectionIds = [];
                    }
                }
            }
            
            // Save updated messages
            await saveMessagesToStorage(messages);
            
            // Update global favorites
            await updateGlobalFavorites();
            
            // Update collection message counts
            await updateCollectionMessageCounts();
            
            // Exit selection mode
            exitSelectionMode();
            
            // Refresh the display
            await filterMessages(searchInput.value);
            
            // Show success toast
            showToast(`Unstarred ${selectedMessageIds.length} message(s)`);
            
        } catch (error) {
            console.error('Threadly: Error unstarring messages:', error);
            showToast('Error unstarring messages');
        }
    }

    function showToast(message) {
        console.log('Threadly: showToast called with message:', message);
        
        // Find the search elements
        const searchInput = document.querySelector('.threadly-search-pill input');
        const searchPill = document.querySelector('.threadly-search-pill');
        
        console.log('Threadly: searchInput found:', !!searchInput);
        console.log('Threadly: searchPill found:', !!searchPill);
        console.log('Threadly: searchInput element:', searchInput);
        console.log('Threadly: searchPill element:', searchPill);
        
        if (searchInput && searchPill) {
            // Store original state
            const originalPlaceholder = searchInput.placeholder;
            const originalValue = searchInput.value;
            
            // Calculate dynamic width based on actual text measurement
            const baseWidth = 184; // Same as --search-pill-compact-width
            const maxWidth = 500; // Allow for longer messages
            const padding = 32; // Account for padding (16px on each side)
            
            // Create a temporary element to measure text width accurately
            const tempElement = document.createElement('span');
            tempElement.style.position = 'absolute';
            tempElement.style.visibility = 'hidden';
            tempElement.style.whiteSpace = 'nowrap';
            tempElement.style.fontSize = '1rem'; // Same as search input
            tempElement.style.fontFamily = 'inherit';
            tempElement.textContent = message;
            document.body.appendChild(tempElement);
            
            const textWidth = tempElement.offsetWidth;
            document.body.removeChild(tempElement);
            
            const dynamicWidth = Math.min(Math.max(textWidth + padding, baseWidth), maxWidth);
            
            console.log('Threadly: Message length:', message.length);
            console.log('Threadly: Calculated dynamic width:', dynamicWidth);
            
            // Set up toast message
            searchInput.placeholder = '';
            searchInput.value = message;
            searchInput.readOnly = true;
            searchInput.style.textAlign = 'center';
            searchInput.style.cursor = 'default';
            
            // Apply dynamic width to search pill using CSS custom property
            // This ensures the transition works properly
            searchPill.style.setProperty('--search-pill-expanded-width', `${dynamicWidth}px`);
            searchPill.style.width = `${dynamicWidth}px`;
            
            // Add toast styling (subtle success color)
            searchPill.style.background = 'rgba(0, 191, 174, 0.12)';
            searchPill.style.borderColor = 'rgba(0, 191, 174, 0.25)';
            searchPill.style.boxShadow = '0 0 0 2px rgba(0, 191, 174, 0.15)';
            
            // Reuse the existing metaball animation system
            // This will trigger the same expansion animation as typing
            console.log('Threadly: Calling handleSearchFocus for toast');
            
            // Create a proper event object that will pass the ID check
            const fakeEvent = {
                target: {
                    ...searchInput,
                    id: 'threadly-search-input'
                }
            };
            handleSearchFocus(fakeEvent);
            
            console.log('Threadly: Toast expanded with message:', message);
            
            // Restore original state after 3 seconds
            setTimeout(() => {
                // Restore input state
                searchInput.placeholder = originalPlaceholder;
                searchInput.value = originalValue;
                searchInput.readOnly = false;
                searchInput.style.textAlign = '';
                searchInput.style.cursor = '';
                
                // Restore original pill styling
                searchPill.style.removeProperty('--search-pill-expanded-width');
                searchPill.style.width = '';
                searchPill.style.background = '';
                searchPill.style.borderColor = '';
                searchPill.style.boxShadow = '';
                
                // Reuse the existing metaball animation system to collapse
                // This will trigger the same collapse animation as blur
                const fakeBlurEvent = {
                    target: {
                        ...searchInput,
                        id: 'threadly-search-input'
                    }
                };
                handleSearchBlur(fakeBlurEvent);
                
                console.log('Threadly: Toast collapsed, restored to normal state');
            }, 3000);
        } else {
            // Fallback: create traditional toast if search elements not found
            const toast = document.createElement('div');
            toast.className = 'threadly-toast';
            toast.textContent = message;
            
            // Calculate dynamic width based on message length
            const baseWidth = 200;
            const charWidth = 8;
            const maxWidth = 400;
            const dynamicWidth = Math.min(Math.max(message.length * charWidth, baseWidth), maxWidth);
            
            toast.style.width = `${dynamicWidth}px`;
            toast.style.minWidth = `${baseWidth}px`;
            toast.style.maxWidth = `${maxWidth}px`;
            
            // Find the search container
            const searchContainer = document.querySelector('.threadly-search-container');
            if (searchContainer) {
                searchContainer.style.position = 'relative';
                searchContainer.appendChild(toast);
                
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 3000);
            } else {
                // Final fallback to panel
                const panel = document.getElementById('threadly-panel');
                if (panel) {
                    panel.appendChild(toast);
                    setTimeout(() => {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    }, 3000);
                }
            }
        }
    }

    // --- Enhanced Update Logic --- //
    async function updateAndSaveConversation() {
        console.log('Threadly: Updating conversation for', currentPlatformId);
        
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
            
            // Prefer live messages if available, otherwise use saved
            allMessages = liveMessages.length > 0 ? liveMessages : 
                        savedMessages.map(m => ({ 
                            content: m.content, 
                            element: null, 
                            role: m.role || 'user',
                            isFavorited: m.isFavorited || false,
                            collectionId: m.collectionId || null
                        }));

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
            updateScrollIndicator(allMessages);
            
            console.log('Threadly: Initialization complete for', currentPlatformId);
            
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
            lastUrl = url;
            
            // Debounce re-initialization to avoid excessive calls
            if (reinitTimeout) {
                clearTimeout(reinitTimeout);
            }
            
            reinitTimeout = setTimeout(() => {
                // Only re-initialize if we're still on a supported platform
                const platform = detectPlatform();
                if (platform !== 'unknown') {
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
        selectedMessageIds = [];
        selectedCollectionIds = []; // Reset collection selection
        
        // Determine selection context based on current view
        if (isInCollectionsView && currentCollectionId) {
            // We're viewing messages within a specific collection
            selectionContext = 'messages-in-collection';
            console.log('Threadly: Entering selection mode for messages in collection:', currentCollectionId);
        } else if (isInCollectionsView && !currentCollectionId) {
            // We're viewing the collections list
            selectionContext = 'collections';
            console.log('Threadly: Entering selection mode for collections');
        } else {
            // We're in the main messages view (not in collections)
            selectionContext = 'messages-in-collection'; // Default to message selection
            console.log('Threadly: Entering selection mode for messages in main view');
        }
        
        // Show checkboxes on all messages
        document.body.classList.add('selection-mode');
        
        // Morph navbar based on selection context
        if (selectionContext === 'collections') {
            morphNavbarToDeleteMode();
        } else {
            morphNavbarToSelectionMode();
        }
        
        // Update select button to show it's in close mode
        const selectBulb = document.getElementById('threadly-select-bulb');
        if (selectBulb) {
            selectBulb.title = 'Click to exit selection mode';
            selectBulb.setAttribute('data-mode', 'close');
        }
        
        // Update checkbox states
        updateCheckboxStates();
        
        // Update selection info
        updateSelectionInfo();
        console.log('Threadly: Entered selection mode');
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
        
        // Update select button to show it's in select mode
        const selectBulb = document.getElementById('threadly-select-bulb');
        if (selectBulb) {
            selectBulb.title = 'Enable selection mode';
            selectBulb.setAttribute('data-mode', 'select');
        }
        
        // Restore the previous filter state FIRST
        console.log('Threadly: Restoring previous state:', previousFilterState);
        messageFilterState = previousFilterState; // Set the state before resetting navbar
        
        // Morph navbar back to original YOU | AI | FAV with correct state
        resetNavbarToOriginal();
        
        // Filter messages to show the correct state
        await filterMessages('');
        
        // Update checkbox states
        updateCheckboxStates();
        
        // Update selection info
        updateSelectionInfo();
        console.log('Threadly: Exited selection mode and restored to:', previousFilterState);
    }




    // Function to enter assignment mode
    async function enterAssignmentMode() {
        console.log('Threadly: enterAssignmentMode called with selectedMessageIds:', selectedMessageIds);
        if (selectedMessageIds.length === 0) {
            console.log('Threadly: No messages selected, returning');
            return;
        }
        
        isAssigningMode = true;
        console.log('Threadly: Set isAssigningMode to true');
        
        // Set SAVED button as active to show collections
        setSavedButtonActive(true);
        
        // Morph UI to SAVED state with animation
        morphToSavedState();
        console.log('Threadly: Called morphToSavedState');
        
        // Switch to SAVED state and show collections with assignment mode
        await renderCollectionsView(true); // true = isAssigning mode
        console.log('Threadly: Switched to SAVED state with assignment mode');
        
        // Morph navbar to show ADD NEW | CANCEL for assignment mode
        morphNavbarToAssignmentMode();
        console.log('Threadly: Entered assignment mode');
    }

    // Function to morph navbar to selection mode (ASSIGN TO | UNSTAR)
    function morphNavbarToSelectionMode() {
        console.log('Threadly: morphNavbarToSelectionMode called');
        const toggleBar = document.getElementById('threadly-toggle-bar');
        if (!toggleBar) {
            console.error('Threadly: Toggle bar not found');
            return;
        }

        
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
                if (selectedMessageIds.length > 0) {
                    enterAssignmentMode();
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
        const toggleBar = document.getElementById('threadly-toggle-bar');
        if (!toggleBar) return;
        
        const labels = toggleBar.querySelectorAll('.threadly-toggle-label');
        const deleteBtn = labels[0]; // First label is DELETE
        const cancelBtn = labels[1]; // Second label is CANCEL
        
        let hasSelection = false;
        if (selectionContext === 'messages-in-collection') {
            hasSelection = selectedMessageIds.length > 0;
        } else if (selectionContext === 'collections') {
            hasSelection = selectedCollectionIds.length > 0;
        }
        
        if (deleteBtn && deleteBtn.classList.contains('delete')) {
            deleteBtn.disabled = !hasSelection;
            deleteBtn.style.opacity = hasSelection ? '1' : '0.5';
            deleteBtn.style.cursor = hasSelection ? 'pointer' : 'not-allowed';
        }
        
        // CANCEL button is always enabled
        if (cancelBtn && cancelBtn.classList.contains('cancel')) {
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
            
            labels[0].textContent = 'DELETE';
            labels[0].className = 'threadly-toggle-label delete';
            labels[1].textContent = 'CANCEL';
            labels[1].className = 'threadly-toggle-label cancel';
            
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
        
        // Add event listeners for the buttons
        if (labels[0]) {
            labels[0].addEventListener('click', () => {
                if (selectionContext === 'messages-in-collection' && selectedMessageIds.length > 0) {
                    deleteSelectedMessagesFromCollection();
                } else if (selectionContext === 'collections' && selectedCollectionIds.length > 0) {
                    deleteSelectedCollections();
                }
            });
        }
        
        if (labels[1]) {
            labels[1].addEventListener('click', () => {
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
                
                // BACK button - completely rebuilt from scratch
                console.log('Threadly: BACK clicked - rebuilding from scratch');
                
                // Deactivate SAVED state
                setSavedButtonActive(false);
                resetNavbarToOriginal();
                
                // Set filter state WITHOUT calling selectFilterState (which sets isInCollectionsView = false)
                const panel = document.getElementById('threadly-panel');
                if (panel) {
                    panel.setAttribute('data-filter', messageFilterState);
                }
                
                // Update toggle segment position manually
                const toggleSegment = document.querySelector('.threadly-toggle-segment');
                if (toggleSegment) {
                    toggleSegment.classList.remove('user', 'assistant', 'fav', 'collection');
                    toggleSegment.classList.add(messageFilterState === 'user' ? 'user' : messageFilterState === 'assistant' ? 'assistant' : messageFilterState === 'favorites' ? 'fav' : 'collection');
                }
                
                // Filter messages without changing isInCollectionsView
                filterMessages(searchInput.value);
                
                console.log('Threadly: BACK - returned to previous state');
            });
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
        // Reset navbar to original YOU AI FAV state
        resetNavbarToOriginal();
        
        // Set YOU state as active (user messages)
        selectFilterState('user');
        
        // DO NOT call setSavedButtonActive(false) - this closes the extension!
        // Just reset the navbar and go to YOU state
        
        console.log('Threadly: Exited saved state - returned to YOU state');
    }

    // Function to handle CANCEL button click
    function handleCancelClick() {
        console.log('Threadly: CANCEL clicked');
        
        // Reset navbar to original YOU AI FAV state
        resetNavbarToOriginal();
        
        // Exit saved state
        setSavedButtonActive(false);
        
        // Set YOU state as active (user messages)
        selectFilterState('user');
        
        console.log('Threadly: CANCEL - returned to YOU state');
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

        // Set the segment class based on current filter state
        const segment = document.getElementById('threadly-toggle-segment');
        if (segment) {
            segment.classList.remove('user', 'assistant', 'fav', 'collection');
            segment.classList.add(messageFilterState === 'user' ? 'user' : messageFilterState === 'assistant' ? 'assistant' : messageFilterState === 'favorites' ? 'fav' : 'collection');
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

        // Remove return animation class after animation completes
        if (isReturningFromInput) {
            setTimeout(() => {
                toggleBar.classList.remove('returning-from-input');
                console.log('Threadly: Return animation completed');
            }, 400); // Match the animation duration
        }

        console.log('Threadly: Navbar reset to original state');
    }

    // Function to add toggle bar event listeners
    function addToggleBarEventListeners() {
        const toggleBar = document.getElementById('threadly-toggle-bar');
        if (!toggleBar) return;

        // Add click listeners for each label to allow direct selection
        toggleBar.addEventListener('click', async (e) => {
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
            
            // Show success feedback
            showToast(`"${collectionName}" created!`);
            
            // Stay in SAVED state and re-render collections with a small delay for smooth transition
            setTimeout(async () => {
                morphNavbarToSavedState();
                await renderCollectionsView();
            }, 100);
            
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
                    await assignMessagesToCollection(collection.id);
                    // Call the finalization function to properly reset UI state
                    await finalizeAssignmentAndReturnToCollections(collection.id);
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
        const checkboxContainers = document.querySelectorAll('.threadly-message-checkbox-container');
        checkboxContainers.forEach(container => {
            if (isInSelectionMode) {
                // In selection mode, show checkboxes for all messages
                container.style.display = 'flex';
                
                // Add event listener for checkbox changes
                const checkbox = container.querySelector('.threadly-message-checkbox');
                const messageId = checkbox.dataset.messageId;
                
                if (checkbox && messageId) {
                    // Remove existing listeners to prevent duplicates
                    checkbox.removeEventListener('change', handleCheckboxChange);
                    checkbox.addEventListener('change', handleCheckboxChange);
                }
            } else {
                // Exit selection mode, hide all checkboxes
                container.style.display = 'none';
            }
        });
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
        
        if (messageId) {
            toggleMessageSelection(messageId, isChecked);
            // Update button states in selection mode
            updateSelectionModeButtonStates();
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
            }
        } else {
            if (index !== -1) {
                selectedMessageIds.splice(index, 1);
                console.log('Threadly: Removed message from selection:', messageId);
            }
        }
        
        updateSelectionInfo();
        
        // Update delete mode button states if in delete mode
        if (selectionContext === 'messages-in-collection') {
            updateDeleteModeButtonStates();
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
        
        const collections = await loadCollectionsFromStorage();
        const collection = collections.find(c => c.id === collectionId);
        
        if (!collection) {
            console.error('Threadly: Collection not found:', collectionId);
            return;
        }

        console.log('Threadly: Found collection:', collection);

        // Get selected message IDs
        const selectedIds = Array.from(selectedMessageIds);
        console.log('Threadly: Selected IDs:', selectedIds);
        
        if (selectedIds.length === 0) {
            console.error('Threadly: No messages selected');
            return;
        }

        // SIMPLE APPROACH: Just like starring, save the selected messages to the collection
        // Get current messages from the UI (the ones that are actually displayed and selected)
        console.log('Threadly: allMessages length:', allMessages.length);
        console.log('Threadly: allMessages IDs:', allMessages.map(m => m.id));
        console.log('Threadly: selectedIds:', selectedIds);
        
        const currentMessages = allMessages.filter(msg => selectedIds.includes(msg.id));
        console.log('Threadly: Current messages to assign:', currentMessages);

        if (currentMessages.length === 0) {
            console.error('Threadly: No current messages found for selected IDs');
            return;
        }

        // Update collection with new message IDs
        if (!collection.messageIds) {
            collection.messageIds = [];
        }
        
        // Add new message IDs (avoid duplicates)
        let addedCount = 0;
        currentMessages.forEach(msg => {
            if (!collection.messageIds.includes(msg.id)) {
                collection.messageIds.push(msg.id);
                addedCount++;
            }
        });
        
        if (addedCount === 0) {
            console.log('Threadly: All selected messages are already in this collection');
            // Still exit selection mode even if no new messages were added
            isAssigningMode = false;
            await exitSelectionMode();
            returnToMainMessages();
            return;
        }
        
        console.log('Threadly: Added', addedCount, 'new messages to collection');

        // Update Chrome storage for collections
        await saveCollectionsToStorage(collections);
        console.log('Threadly: Updated collections in Chrome storage');

        // Update the messages with collection IDs (just like starring)
        currentMessages.forEach(msg => {
            if (!msg.collectionIds) {
                msg.collectionIds = [];
            }
            if (!msg.collectionIds.includes(collectionId)) {
                msg.collectionIds.push(collectionId);
            }
        });

        // Save updated messages back to storage
        await saveMessagesToStorage(allMessages);
        console.log('Threadly: Updated messages in Chrome storage');

        // Update collection message counts
        await updateCollectionMessageCounts();

        // Show success message
        showToast(`Messages added to "${collection.name}"`);

        // Use the new function to properly handle UI transition
        await finalizeAssignmentAndReturnToCollections(collectionId);
        
        console.log('Threadly: Successfully assigned messages to collection:', collection.name);
    }

    // NEW FUNCTION: To handle the UI transition correctly after assignment.
    async function finalizeAssignmentAndReturnToCollections(collectionId) {
        console.log('Threadly: finalizeAssignmentAndReturnToCollections called for collectionId:', collectionId);
        const collectionName = await getCollectionName(collectionId);
        console.log('Threadly: Collection name:', collectionName);
        showToast(`Moved ${selectedMessageIds.length} items to '${collectionName}'`);

        // 1. Reset selection and assignment state variables
        console.log('Threadly: Resetting isAssigningMode from', isAssigningMode, 'to false');
        isAssigningMode = false;
        console.log('Threadly: Clearing selectedMessageIds:', selectedMessageIds);
        selectedMessageIds = [];

        // 2. Manually reset the UI elements without a full exit
        document.body.classList.remove('selection-mode');
        console.log('Threadly: Removed selection-mode class from body');

        const selectBulb = document.getElementById('threadly-select-bulb');
        if (selectBulb) {
            selectBulb.title = 'Enable selection mode';
            selectBulb.setAttribute('data-mode', 'select');
            console.log('Threadly: Reset select bulb');
        }

        // Uncheck all checkboxes
        const checkboxes = document.querySelectorAll('.threadly-message-checkbox');
        console.log('Threadly: Found', checkboxes.length, 'checkboxes to uncheck');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            const container = checkbox.closest('.threadly-message-checkbox-container');
            if(container) container.style.display = 'none';
        });
        
        // 3. Morph the UI back to the DEFAULT SAVED state
        console.log('Threadly: Setting savedButtonActive to true');
        setSavedButtonActive(true); // Keep the saved button active
        console.log('Threadly: Calling renderCollectionsView(false)');
        await renderCollectionsView(false); // Re-render collections in default (non-assignment) mode
        console.log('Threadly: Calling morphNavbarToSavedState()');
        morphNavbarToSavedState(); // Morph navbar to "ADD NEW | BACK"
        console.log('Threadly: finalizeAssignmentAndReturnToCollections completed');
    }

    // --- Prompt Refiner Functions --- //
    
    function initializePromptRefiner() {
        console.log('Threadly: Initializing prompt refiner for all platforms...');
        
        // Prompt refiner is now available for all platforms
        // Individual platform sparkle functionality is handled by dedicated files
    }

    // ChatGPT sparkle functionality moved to dedicated chatgpt-sparkle.js file

})();
