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
    let debouncedUpdate = debounce(async () => await updateAndSaveConversation(), 750); // Increased debounce
    let retryCount = 0;
    const MAX_RETRIES = 5;
    let messageFilterState = 'user'; // 'user', 'assistant', or 'favorites'
    let isInSelectionMode = false;
    let selectedMessageIds = [];
    let collections = [];
    let currentFilter = { type: 'all' }; // 'all', 'starred', or 'collection'
    let isInCollectionsView = false; // Track if we're viewing collections
    
    // Saved button state management (like React useState)
    let savedButtonActive = false; // persisted state via click
    let savedButtonHover = false;  // transient state via hover
    
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
        'perplexity': 'rgba(255, 255, 255, 0.3)',     // Perplexity white
        'grok': 'rgba(31, 41, 55, 0.3)',             // Grok dark gray
        'copilot': 'rgba(0, 120, 212, 0.3)'          // Copilot blue
    };
    
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
    
    function setSavedButtonHover(hover) {
        savedButtonHover = hover;
        updateSavedButtonVisualState();
    }
    
    function updateSavedButtonVisualState() {
        const savedBulb = document.getElementById('threadly-saved-bulb');
        if (!savedBulb) return;
        
        const svg = savedBulb.querySelector('svg');
        if (!svg) return;
        
        const isFilled = savedButtonActive || savedButtonHover;
        
        if (isFilled) {
            svg.style.fill = getPlatformSavedIconColor();
            svg.style.stroke = getPlatformSavedIconColor();
        } else {
            svg.style.fill = 'none';
            svg.style.stroke = 'var(--threadly-text-secondary)';
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
            'perplexity': '#ffffff',
            'grok': '#1f2937',
            'copilot': '#0078d4'
        };
        return platformColors[currentPlatformId] || 'var(--threadly-primary-accent)';
    }

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
        // Check if UI already exists
        if (document.getElementById('threadly-panel')) {
            return;
        }
        
        // Contextual Actions Bar HTML (defined first)
        const contextualActionsHTML = `
            <div id="threadly-contextual-actions" class="threadly-contextual-actions" style="display: none;">
                <div class="threadly-selection-info">
                    <span id="threadly-selection-count">Select items to organize</span>
                </div>
                <div class="threadly-action-buttons">
                    <button id="threadly-assign-btn" class="threadly-action-btn" disabled>
                        ASSIGN TO
                    </button>
                    <button id="threadly-unstar-btn" class="threadly-action-btn" disabled>
                        Unstar
                    </button>
                </div>
            </div>
        `;
        
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
                            ${contextualActionsHTML}
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
                        ${contextualActionsHTML}
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
        
        // Add event listeners for contextual action buttons
        document.getElementById('threadly-assign-btn').addEventListener('click', () => {
            // Enter assign mode
            enterAssignmentMode();
        });
        document.getElementById('threadly-unstar-btn').addEventListener('click', unstarMessages);
        
        // Add event listener for select bulb
        const selectBulb = document.getElementById('threadly-select-bulb');
        if (selectBulb) {
            selectBulb.addEventListener('click', toggleSelectionMode);
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
                setSavedButtonActive(!savedButtonActive);
                renderCollectionsView();
            });
            
            // Add hover event listeners for smooth fill animation
            savedBulb.addEventListener('mouseenter', () => setSavedButtonHover(true));
            savedBulb.addEventListener('mouseleave', () => setSavedButtonHover(false));
            
            // Add keyboard support
            savedBulb.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSavedButtonActive(!savedButtonActive);
                    renderCollectionsView();
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
        if (panel.classList.contains('threadly-expanded') && !panel.contains(e.target) && !isInCollectionsView) {
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
        console.log('Threadly: Storage key:', key);
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
                collectionIds: msg.collectionIds || [] // Use collectionIds array instead of collectionId
            }));
            
            if (storableMessages.length > 0) {
                await chrome.storage.local.set({ [key]: storableMessages });
                console.log('Threadly: Saved', storableMessages.length, 'messages for', currentPlatformId);
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
            console.log('Threadly: Loaded', messages.length, 'messages for', currentPlatformId);
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

    // Load all messages from all platforms for global collection access
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
                    console.log('Threadly: Loading messages from key:', key, 'count:', messages.length);
                    allMessages.push(...messages);
                }
            }
            
            console.log('Threadly: Total messages loaded from all platforms:', allMessages.length);
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
            item.dataset.messageId = msg.id;
            
            if (msg.isFavorited) {
                item.classList.add('favorited');
                item.setAttribute('data-starred', 'true');
            } else {
                item.setAttribute('data-starred', 'false');
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
    
    async function filterMessages(query) {
        // If we're in collections view, return to main messages first
        if (isInCollectionsView) {
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
            
            console.log('Threadly: Loaded global favorites, marked', globalFavorites.length, 'as favorited');
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
            console.log('Threadly: messageList element:', messageList);
            console.log('Threadly: messageList exists:', !!messageList);
            
            if (!messageList) {
                console.error('Threadly: messageList not found in renderCollectionsView');
                return;
            }
            
            // Set flag to indicate we're in collections view
            isInCollectionsView = true;
            console.log('Threadly: Set isInCollectionsView to true');
            
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
            
            // Show different content based on mode
            if (isAssigning) {
                // Assignment mode: show "+" to indicate adding messages
                collectionPill.innerHTML = `
                    <span class="collection-pill-name">${collection.name}</span>
                    <span class="collection-pill-add">+</span>
                `;
                collectionPill.title = `Add selected messages to "${collection.name}"`;
            } else {
                // Normal mode: show ">" to indicate viewing messages
                collectionPill.innerHTML = `
                    <span class="collection-pill-name">${collection.name}</span>
                    <span class="collection-pill-arrow">></span>
                `;
                collectionPill.title = `View messages in "${collection.name}"`;
            }
            
            // Add long-press gesture for deletion
            let longPressTimer;
            collectionPill.addEventListener('mousedown', () => {
                longPressTimer = setTimeout(() => {
                    showDeleteConfirmation(collection.id, collection.name);
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
                console.log('Threadly: Event target:', e.target);
                
                if (isAssigning) {
                    console.log('Threadly: Adding messages to collection:', collection.name);
                    await assignMessagesToCollection(collection.id);
                } else {
                    console.log('Threadly: Viewing collection messages');
                    await renderMessagesForCollection(collection.id);
                }
            });
            
            fragment.appendChild(collectionPill);
        });
        
        messageList.appendChild(fragment);
        
        // Add bottom navbar with ADD NEW and CANCEL buttons if in assignment mode
        if (isAssigningMode) {
            const bottomNavbar = document.createElement('div');
            bottomNavbar.className = 'threadly-bottom-navbar';
            bottomNavbar.style.cssText = `
                display: flex;
                justify-content: center;
                gap: 12px;
                margin-top: 20px;
                padding: 16px;
            `;
            
            // ADD NEW button
            const addNewBtn = document.createElement('button');
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
            
            addNewBtn.addEventListener('click', () => {
                enterInputMode();
            });
            
            // CANCEL button
            const cancelBtn = document.createElement('button');
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
            
            cancelBtn.addEventListener('click', () => {
                cancelAssignment();
            });
            
            bottomNavbar.appendChild(addNewBtn);
            bottomNavbar.appendChild(cancelBtn);
            messageList.appendChild(bottomNavbar);
            
            console.log('Threadly: Added bottom navbar with ADD NEW and CANCEL buttons');
        }
        
        } catch (error) {
            console.error('Threadly: Error rendering collections view:', error);
            // Show error state
            if (messageList) {
                messageList.innerHTML = '<div class="threadly-empty-state">Error loading collections. Please try again.</div>';
            }
        }
    }
    
    // Function to assign selected messages to a collection
    async function assignSelectedMessagesToCollection(collectionId) {
        try {
            if (selectedMessageIds.length === 0) {
                console.warn('Threadly: No messages selected for assignment');
                return;
            }
            
            // Call existing assignToCollection function
            await assignToCollection(selectedMessageIds, collectionId);
            
            // Exit selection mode
            exitSelectionMode();
            
            // Reset assignment mode
            isAssigningMode = false;
            
            // Re-render the original view
            await filterMessages(searchInput.value);
            
            console.log('Threadly: Successfully assigned messages to collection');
        } catch (error) {
            console.error('Threadly: Error assigning messages to collection:', error);
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
    
    async function renderMessagesForCollection(collectionId) {
        try {
            console.log('Threadly: renderMessagesForCollection called with collectionId:', collectionId);
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
            
            console.log('Threadly: Filtered collection messages:', collectionMessages.length);
            
            // Clear message list first
            messageList.innerHTML = '';
            
            // Create header with collection info and back button
            const headerDiv = document.createElement('div');
            headerDiv.className = 'threadly-collection-header';
            headerDiv.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                background: rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                margin-bottom: 8px;
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
            
            backButton.addEventListener('click', () => {
                console.log('Threadly: Back button clicked, going to collections view');
                console.log('Threadly: Current panel state:', panel?.classList.toString());
                console.log('Threadly: Current isInCollectionsView:', isInCollectionsView);
                
                // Go back to collections view (SAVED state)
                isInCollectionsView = true;
                
                // Ensure panel stays expanded when going back to collections
                if (panel && !panel.classList.contains('threadly-expanded')) {
                    panel.classList.add('threadly-expanded');
                    console.log('Threadly: Added threadly-expanded class to panel');
                }
                
                console.log('Threadly: About to call renderCollectionsView(false)');
                renderCollectionsView(false);
                console.log('Threadly: renderCollectionsView completed');
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
                item.dataset.role = msg.role || 'user';
                item.dataset.messageId = msg.id;
                
                                    // Use the same styling as main message items
                    item.style.cssText = `
                        background: rgba(255, 255, 255, 0.08);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 10px;
                        padding: 10px;
                        margin-bottom: 8px;
                        transition: all 0.2s ease;
                        backdrop-filter: blur(4px);
                        -webkit-backdrop-filter: blur(4px);
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    `;
                    
                    // Add hover effect (same as main message items)
                    item.addEventListener('mouseenter', () => {
                        item.style.background = 'rgba(255, 255, 255, 0.12)';
                        item.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        item.style.transform = 'translateY(-1px)';
                    });
                    
                    item.addEventListener('mouseleave', () => {
                        item.style.background = 'rgba(255, 255, 255, 0.08)';
                        item.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        item.style.transform = 'translateY(0)';
                    });
                
                // Get platform accent color
                const platformColor = getPlatformHighlightColor().replace('0.2', '0.8');
                
                // Determine role text
                const roleText = (msg.role === 'user' || msg.role === 'assistant') 
                    ? (msg.role === 'user' ? `You (#${index + 1})` : `AI (#${index + 1})`)
                    : `Message #${index + 1}`;
                
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
                            ">${roleText}</div>
                        </div>
                        <div class="threadly-message-right">
                            <button class="threadly-star-btn" title="Add to favorites" style="
                                background: none;
                                border: none;
                                color: ${platformColor};
                                cursor: pointer;
                                font-size: 18px;
                                padding: 4px;
                                transition: all 0.3s ease;
                            ">
                                <span class="threadly-star-icon">☆</span>
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
                starBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Toggle star state
                    const starIcon = starBtn.querySelector('.threadly-star-icon');
                    if (starIcon.textContent === '☆') {
                        starIcon.textContent = '★';
                        starIcon.style.color = platformColor;
                        starBtn.title = 'Remove from favorites';
                    } else {
                        starIcon.textContent = '☆';
                        starIcon.style.color = platformColor;
                        starBtn.title = 'Add to favorites';
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
                    backButton.addEventListener('click', () => {
                        renderCollectionsView();
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
            
            console.log('Threadly: Deleted collection:', collectionName);
            
            // Show confirmation toast
            const collectionName = await getCollectionName(collectionId);
            showToast(`Moved ${messageIds.length} items to '${collectionName}'`);
            
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
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'threadly-toast';
        toast.textContent = message;
        
        // Add to panel
        const panel = document.getElementById('threadly-panel');
        if (panel) {
            panel.appendChild(toast);
            
            // Remove after 3 seconds
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 3000);
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
            'perplexity': 'rgba(255, 255, 255, 0.2)',
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
            
            // Update collection message counts
            await updateCollectionMessageCounts();
            
            if (panel && panel.classList.contains('threadly-expanded')) {
                renderMessages(allMessages);
            }

            startObserver();
            
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

    // --- Selection Mode Management --- //
    function enterSelectionMode() {
        isInSelectionMode = true;
        selectedMessageIds = [];
        
        // Show checkboxes on all messages
        document.body.classList.add('selection-mode');
        
        // Show contextual actions bar
        showContextualActions();
        
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
    
    function exitSelectionMode() {
        isInSelectionMode = false;
        selectedMessageIds = [];
        
        // Reset assign mode
        isAssigningMode = false;
        
        // Hide checkboxes
        document.body.classList.remove('selection-mode');
        
        // Hide contextual actions
        hideContextualActions();
        
        // Uncheck all checkboxes
        const checkboxes = document.querySelectorAll('.threadly-message-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Update select button to show it's in select mode
        const selectBulb = document.getElementById('threadly-select-bulb');
        if (selectBulb) {
            selectBulb.title = 'Enable selection mode';
            selectBulb.setAttribute('data-mode', 'select');
        }
        
        // Update checkbox states
        updateCheckboxStates();
        
        // Update selection info
        updateSelectionInfo();
        console.log('Threadly: Exited selection mode');
    }

    // Function to restore original contextual actions
    function restoreOriginalContextualActions() {
        const contextualActions = document.querySelector('.threadly-contextual-actions');
        if (contextualActions) {
            const addNewBtn = contextualActions.querySelector('#threadly-add-new-btn');
            const cancelBtn = contextualActions.querySelector('#threadly-cancel-btn');
            
            if (addNewBtn) {
                addNewBtn.textContent = 'Assign To';
                addNewBtn.id = 'threadly-assign-btn';
                addNewBtn.style.background = '';
                addNewBtn.style.borderColor = '';
                
                // Restore original event listener
                addNewBtn.replaceWith(addNewBtn.cloneNode(true));
                const newAssignBtn = contextualActions.querySelector('#threadly-assign-btn');
                newAssignBtn.addEventListener('click', () => {
                    enterAssignmentMode();
                });
            }
            
            if (cancelBtn) {
                cancelBtn.textContent = 'Unstar';
                cancelBtn.id = 'threadly-unstar-btn';
                cancelBtn.style.background = '';
                cancelBtn.style.borderColor = '';
                
                // Restore original event listener
                cancelBtn.replaceWith(cancelBtn.cloneNode(true));
                const newUnstarBtn = contextualActions.querySelector('#threadly-unstar-btn');
                newUnstarBtn.addEventListener('click', () => {
                    unstarMessages();
                });
            }
            
            console.log('Threadly: Restored original contextual actions [Assign To] [Unstar]');
        }
    }

    // Function to show contextual actions bar
    function showContextualActions() {
        const contextualActions = document.querySelector('.threadly-contextual-actions');
        if (contextualActions) {
            contextualActions.style.display = 'flex';
            contextualActions.style.opacity = '1';
            contextualActions.style.transform = 'scale(1)';
            
            // If in assignment mode, change the buttons to [ADD NEW] [CANCEL]
            if (isAssigningMode) {
                const assignBtn = contextualActions.querySelector('#threadly-assign-btn');
                const unstarBtn = contextualActions.querySelector('#threadly-unstar-btn');
                
                if (assignBtn) {
                    assignBtn.textContent = 'ADD NEW';
                    assignBtn.id = 'threadly-add-new-btn';
                                    assignBtn.style.background = 'transparent';
                assignBtn.style.borderColor = 'transparent';
                    
                    // Remove old event listener and add new one
                    assignBtn.replaceWith(assignBtn.cloneNode(true));
                    const newAddBtn = contextualActions.querySelector('#threadly-add-new-btn');
                    newAddBtn.addEventListener('click', () => {
                        enterInputMode();
                    });
                }
                
                if (unstarBtn) {
                    unstarBtn.textContent = 'CANCEL';
                    unstarBtn.id = 'threadly-cancel-btn';
                    unstarBtn.style.background = 'rgba(239, 68, 68, 0.8)';
                    unstarBtn.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                    
                    // Remove old event listener and add new one
                    unstarBtn.replaceWith(unstarBtn.cloneNode(true));
                    const newCancelBtn = contextualActions.querySelector('#threadly-cancel-btn');
                    newCancelBtn.addEventListener('click', () => {
                        cancelAssignment();
                    });
                }
                
                console.log('Threadly: Changed contextual actions to [ADD NEW] [CANCEL] for assignment mode');
            }
        }
    }

    // Function to hide contextual actions bar
    function hideContextualActions() {
        const contextualActions = document.querySelector('.threadly-contextual-actions');
        if (contextualActions) {
            contextualActions.style.opacity = '0';
            contextualActions.style.transform = 'scale(0.95)';
            setTimeout(() => {
                contextualActions.style.display = 'none';
            }, 600);
        }
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
        
        // Morph UI to SAVED state with animation
        morphToSavedState();
        console.log('Threadly: Called morphToSavedState');
        
        // Switch to SAVED state and show collections with assignment mode
        await renderCollectionsView(true); // true = isAssigning mode
        console.log('Threadly: Switched to SAVED state with assignment mode');
        
        console.log('Threadly: Entered assignment mode');
    }

    // Function to morph UI to SAVED state
    function morphToSavedState() {
        console.log('Threadly: morphToSavedState called');
        const panel = document.getElementById('threadly-panel');
        if (panel) {
            console.log('Threadly: Found panel, adding morphing-to-saved class');
            panel.classList.add('morphing-to-saved');
            
            setTimeout(() => {
                console.log('Threadly: Removing morphing-to-saved and adding saved-state class');
                panel.classList.remove('morphing-to-saved');
                panel.classList.add('saved-state');
                console.log('Threadly: Panel classes after morph:', panel.className);
            }, 400);
        } else {
            console.error('Threadly: Panel not found in morphToSavedState');
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
            addBtn.addEventListener('click', async () => {
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

    // Function to add new collection
    async function addNewCollection() {
        console.log('Threadly: addNewCollection called');
        
        const input = document.querySelector('#collectionNameInput');
        if (!input) {
            console.error('Threadly: Collection name input not found');
            return;
        }
        
        const name = input.value.trim();
        if (!name) {
            console.log('Threadly: No collection name provided');
            return;
        }
        
        try {
            // Create new collection
            const newCollection = await createCollection(name);
            console.log('Threadly: Created new collection:', newCollection);
            
            // Assign selected messages to the new collection
            await assignMessagesToCollection(newCollection.id);
            console.log('Threadly: Assigned messages to new collection');
            
            // Show success message
            showSuccessMessage(`Created "${name}" and added messages`);
            
        } catch (error) {
            console.error('Threadly: Error creating collection:', error);
            showToast('Error creating collection');
        }
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
                collectionItem.addEventListener('click', () => {
                    assignMessagesToCollection(collection.id);
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
            addBtn.addEventListener('click', addNewCollection);
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

    // Function to add new collection
    async function addNewCollection() {
        const input = document.getElementById('collectionNameInput');
        if (!input) return;
        
        const name = input.value.trim();
        if (!name) return;
        
        try {
            // Create new collection
            const newCollection = await createCollection(name);
            
            // Assign selected messages to the new collection
            await assignToCollection(selectedMessageIds, newCollection.id);
            
            // Show success message
            showSuccessMessage(`Added to "${name}"`);
            
            // Exit assignment mode
            exitAssignmentMode();
            
            console.log('Threadly: Created collection and assigned messages:', name);
        } catch (error) {
            console.error('Threadly: Error creating collection:', error);
            showToast('Error creating collection');
        }
    }

    // Function to cancel assignment
    function cancelAssignment() {
        exitAssignmentMode();
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
    function toggleSelectionMode() {
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
        console.log('Threadly: Final selected messages:', selectedMessageIds);
    }

    // --- Enhanced Event Listeners --- //
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
        
        // Add event listeners for contextual action buttons
        document.getElementById('threadly-assign-btn').addEventListener('click', () => {
            // Enter assign mode
            enterAssignmentMode();
        });
        document.getElementById('threadly-unstar-btn').addEventListener('click', unstarMessages);
        
        // Add event listener for select bulb
        const selectBulb = document.getElementById('threadly-select-bulb');
        if (selectBulb) {
            selectBulb.addEventListener('click', toggleSelectionMode);
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
                setSavedButtonActive(!savedButtonActive);
                renderCollectionsView();
            });
            
            // Add hover event listeners for smooth fill animation
            savedBulb.addEventListener('mouseenter', () => setSavedButtonHover(true));
            savedBulb.addEventListener('mouseleave', () => setSavedButtonHover(false));
            
            // Add keyboard support
            savedBulb.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSavedButtonActive(!savedButtonActive);
                    renderCollectionsView();
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

    // --- Metaball Search Bar Functions --- //
    function handleSearchFocus(e) {
        // If we're in collections view, return to main messages first
        if (isInCollectionsView) {
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
        currentMessages.forEach(msg => {
            if (!collection.messageIds.includes(msg.id)) {
                collection.messageIds.push(msg.id);
            }
        });

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
        showSuccessMessage(`Messages assigned to "${collection.name}"`);

        // Exit assignment mode and selection mode
        exitAssignmentMode();
        exitSelectionMode();

        // Refresh the collections view to show updated message counts
        if (isInCollectionsView) {
            renderCollectionsView();
        } else {
            // If not in collections view, refresh the main view
            filterMessages(searchInput.value);
        }
        
        console.log('Threadly: Successfully assigned messages to collection:', collection.name);
    }

})();