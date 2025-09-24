/**
 * Enhanced Sparkle Button with Pill Animation
 * Improved version with better performance, error handling, and UX
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        HOVER_DELAY: 200,
        ANIMATION_DURATION: 800,
        SHRINK_DURATION: 600,
        PROXIMITY_THRESHOLD: 300, // Increased for easier hovering
        DEBOUNCE_DELAY: 100,
        POPUP_HIDE_DELAY: 3000 // 3 second delay before hiding popup when mouse leaves
    };

    // State management
    const state = {
        activePopup: null,
        hoverTimeout: null,
        proximityTimeout: null,
        isAnimating: false,
        sparkleElements: new Set()
    };

    // Utility functions
    const utils = {
        // Debounce function for performance
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Check if element is in viewport
        isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        // Calculate distance between two points
        getDistance(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        },

        // Wait for element with better error handling
        waitForElement(selector, timeout = 10000) {
            return new Promise((resolve, reject) => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }

                const observer = new MutationObserver((mutations, obs) => {
                    const element = document.querySelector(selector);
                    if (element) {
                        obs.disconnect();
                        resolve(element);
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                }, timeout);
            });
        }
    };

    // CSS injection with improved animations
    function injectStyles() {
        if (document.querySelector('#threadly-styles')) return;

        const style = document.createElement('style');
        style.id = 'threadly-styles';
        style.textContent = `
            /* Sparkle icon styles */
            .threadly-sparkle {
                cursor: pointer;
                opacity: 0.8;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: visible;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
            }

            .threadly-sparkle:hover {
                opacity: 1;
                transform: scale(1.05);
                filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
            }

            .threadly-sparkle:active {
                transform: scale(0.95);
            }

            /* Pill popup styles */
            .threadly-pill-popup {
                position: fixed;
                z-index: 10000;
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.25);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                transform-origin: center center;
                overflow: hidden;
                pointer-events: none;
                will-change: transform, opacity, width, height;
            }

            .threadly-pill-popup.growing {
                animation: threadly-pill-emerge ${CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            }

            .threadly-pill-popup.shrinking {
                animation: threadly-pill-contract ${CONFIG.SHRINK_DURATION}ms cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
            }

            .threadly-pill-popup.fully-grown {
                pointer-events: all;
            }

            @keyframes threadly-pill-emerge {
                0% {
                    width: 0;
                    height: 0;
                    opacity: 0;
                    border-radius: 50%;
                    transform: translateX(-50%) translateY(0);
                }
                30% {
                    width: 40px;
                    height: 40px;
                    opacity: 1;
                    border-radius: 50%;
                    transform: translateX(-50%) translateY(0);
                }
                70% {
                    width: 180px;
                    height: 36px;
                    border-radius: 18px;
                    transform: translateX(-50%) translateY(0);
                }
                100% {
                    width: 200px;
                    height: 40px;
                    opacity: 1;
                    border-radius: 20px;
                    transform: translateX(-50%) translateY(0);
                }
            }

            @keyframes threadly-pill-contract {
                0% {
                    width: 200px;
                    height: 40px;
                    opacity: 1;
                    border-radius: 20px;
                    transform: translateX(-50%) translateY(0);
                }
                30% {
                    width: 120px;
                    height: 32px;
                    border-radius: 16px;
                    transform: translateX(-50%) translateY(0);
                }
                70% {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    transform: translateX(-50%) translateY(0);
                }
                100% {
                    width: 0;
                    height: 0;
                    opacity: 0;
                    border-radius: 50%;
                    transform: translateX(-50%) translateY(0);
                }
            }

            /* Popup content styles */
            .threadly-popup-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                height: 100%;
                width: 100%;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .threadly-pill-popup.fully-grown .threadly-popup-content {
                opacity: 1;
            }

            .threadly-mode-option {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px 16px;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                border-radius: 18px;
                position: relative;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
            }

            .threadly-mode-option:hover {
                background: rgba(255, 255, 255, 0.25);
                transform: translateY(-1px) scale(1.02);
            }

            .threadly-mode-option:active {
                transform: translateY(0) scale(0.98);
            }

            .threadly-mode-option .mode-text {
                font-size: 11px;
                font-weight: 600;
                color: #ffffff;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }

            /* Accessibility improvements */
            .threadly-sparkle:focus {
                outline: 2px solid rgba(255, 255, 255, 0.5);
                outline-offset: 2px;
            }

            .threadly-mode-option:focus {
                outline: 2px solid rgba(255, 255, 255, 0.5);
                outline-offset: 1px;
            }

            /* Animation performance optimization */
            .threadly-pill-popup * {
                pointer-events: auto;
            }
        `;
        document.head.appendChild(style);
    }

    // Enhanced sparkle icon creation
    function createSparkleIcon() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "36");
        svg.setAttribute("height", "36");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.className = "threadly-sparkle";
        svg.setAttribute("data-threadly-sparkle", "true");
        svg.setAttribute("role", "button");
        svg.setAttribute("tabindex", "0");
        svg.setAttribute("aria-label", "AI-powered text refinement");

        // Enhanced gradient and glow effects
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        
        // Gradient definition
        const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        gradient.setAttribute("id", `sparkle-gradient-${Date.now()}`);
        gradient.setAttribute("gradientUnits", "objectBoundingBox");
        
        const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop1.setAttribute("offset", "0%");
        stop1.setAttribute("stop-color", "#ffd89b");
        
        const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop2.setAttribute("offset", "100%");
        stop2.setAttribute("stop-color", "#19547b");
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        
        // Glow filter
        const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        filter.setAttribute("id", `glow-${Date.now()}`);
        filter.setAttribute("x", "-50%");
        filter.setAttribute("y", "-50%");
        filter.setAttribute("width", "200%");
        filter.setAttribute("height", "200%");
        
        const gaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
        gaussianBlur.setAttribute("stdDeviation", "3");
        gaussianBlur.setAttribute("result", "coloredBlur");
        
        const feMerge = document.createElementNS("http://www.w3.org/2000/svg", "feMerge");
        const feMergeNode1 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
        feMergeNode1.setAttribute("in", "coloredBlur");
        const feMergeNode2 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
        feMergeNode2.setAttribute("in", "SourceGraphic");
        
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        filter.appendChild(gaussianBlur);
        filter.appendChild(feMerge);
        
        defs.appendChild(gradient);
        defs.appendChild(filter);
        svg.appendChild(defs);

        // Enhanced sparkle shape
        const sparklePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        sparklePath.setAttribute("d", "M50,25 L57,42 L75,50 L57,58 L50,75 L43,58 L25,50 L43,42 Z");
        sparklePath.setAttribute("fill", `url(#sparkle-gradient-${Date.now()})`);
        sparklePath.style.transition = "filter 0.3s ease";
        svg.appendChild(sparklePath);

        // Add interaction handlers
        setupSparkleInteractions(svg, sparklePath, filter.id);
        
        // Track sparkle elements for cleanup
        state.sparkleElements.add(svg);

        return svg;
    }

    // Setup sparkle interactions with improved UX
    function setupSparkleInteractions(svg, sparklePath, filterId) {
        let isHovered = false;

        // Mouse enter with debouncing
        const handleMouseEnter = utils.debounce(() => {
            if (state.isAnimating) return;
            
            isHovered = true;
            sparklePath.setAttribute("filter", `url(#${filterId})`);
            
            // Clear any existing timeouts
            clearTimeout(state.hoverTimeout);
            clearTimeout(state.proximityTimeout);
            
            // Show popup after delay
            state.hoverTimeout = setTimeout(() => {
                if (isHovered && !state.activePopup) {
                    showModeSelectionPopup(svg);
                }
            }, CONFIG.HOVER_DELAY);
        }, CONFIG.DEBOUNCE_DELAY);

        // Mouse leave
        const handleMouseLeave = () => {
            isHovered = false;
            sparklePath.removeAttribute("filter");
            clearTimeout(state.hoverTimeout);
        };

        // Click handler with improved feedback
        const handleClick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            // Immediate visual feedback
            svg.style.transform = 'scale(0.95)';
            setTimeout(() => {
                svg.style.transform = '';
            }, 150);

            // Handle autonomous mode
            handleSparkleClick();
            
            // Hide popup if visible
            hideActivePopup();
        };

        // Keyboard support
        const handleKeydown = (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleClick(event);
            }
        };

        // Attach event listeners
        svg.addEventListener('mouseenter', handleMouseEnter);
        svg.addEventListener('mouseleave', handleMouseLeave);
        svg.addEventListener('click', handleClick);
        svg.addEventListener('keydown', handleKeydown);
    }

    // Enhanced popup creation with better positioning
    function createModeSelectionPopup(sparkleElement) {
        const popup = document.createElement('div');
        popup.className = 'threadly-pill-popup';
        
        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'threadly-popup-content';
        
        // Mode options with better structure
        const modes = [
            { key: 'correction', label: 'CORRECT', description: 'Fix grammar and spelling' },
            { key: 'image', label: 'PHOTO', description: 'Generate related image' },
            { key: 'refine', label: 'REFINE', description: 'Improve and enhance text' }
        ];

        modes.forEach((mode, index) => {
            const option = document.createElement('div');
            option.className = 'threadly-mode-option';
            option.setAttribute('data-mode', mode.key);
            option.setAttribute('role', 'button');
            option.setAttribute('tabindex', '0');
            option.setAttribute('aria-label', mode.description);
            option.setAttribute('title', mode.description);
            
            const text = document.createElement('span');
            text.className = 'mode-text';
            text.textContent = mode.label;
            
            option.appendChild(text);
            contentContainer.appendChild(option);

            // Add click handler
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                handleModeSelection(mode.key, sparkleElement);
                hideActivePopup();
            });

            // Keyboard support
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    option.click();
                }
            });
        });
        
        popup.appendChild(contentContainer);
        return popup;
    }

    // Show popup with improved positioning and animation
    function showModeSelectionPopup(sparkleElement) {
        if (state.activePopup || state.isAnimating) return;

        state.isAnimating = true;
        
        // Hide any existing popups
        hideActivePopup();

        const popup = createModeSelectionPopup(sparkleElement);
        document.body.appendChild(popup);

        // Position popup centered above the sparkle
        const sparkleRect = sparkleElement.getBoundingClientRect();
        const centerX = sparkleRect.left + sparkleRect.width / 2;
        const topY = sparkleRect.top - 50; // Closer to sparkle

        popup.style.left = centerX + 'px';
        popup.style.top = Math.max(10, topY) + 'px'; // Ensure it doesn't go off-screen
        
        // Set initial state
        popup.style.width = '0';
        popup.style.height = '0';
        popup.style.opacity = '0';
        popup.style.borderRadius = '50%';

        // Start animation
        requestAnimationFrame(() => {
            popup.classList.add('growing');
            
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.classList.add('fully-grown');
                    state.isAnimating = false;
                    
                    // Focus first option for keyboard navigation
                    const firstOption = popup.querySelector('.threadly-mode-option');
                    if (firstOption) {
                        firstOption.focus();
                    }
                }
            }, CONFIG.ANIMATION_DURATION - 100);
        });

        state.activePopup = popup;
        
        // Setup proximity detection
        setupProximityDetection(sparkleElement, popup);
        
        // Setup escape key handler
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                hideActivePopup();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // Simplified proximity detection
    function setupProximityDetection(sparkleElement, popup) {
        let isMouseOverSparkle = false;
        let isMouseOverPopup = false;

        // Track mouse over sparkle
        sparkleElement.addEventListener('mouseenter', () => {
            isMouseOverSparkle = true;
            clearTimeout(state.proximityTimeout);
        });

        sparkleElement.addEventListener('mouseleave', () => {
            isMouseOverSparkle = false;
            if (!isMouseOverPopup) {
                state.proximityTimeout = setTimeout(() => {
                    hideActivePopup();
                }, CONFIG.POPUP_HIDE_DELAY);
            }
        });

        // Track mouse over popup
        popup.addEventListener('mouseenter', () => {
            isMouseOverPopup = true;
            clearTimeout(state.proximityTimeout);
        });

        popup.addEventListener('mouseleave', () => {
            isMouseOverPopup = false;
            if (!isMouseOverSparkle) {
                state.proximityTimeout = setTimeout(() => {
                    hideActivePopup();
                }, CONFIG.POPUP_HIDE_DELAY);
            }
        });

        // Cleanup function
        const cleanup = () => {
            clearTimeout(state.proximityTimeout);
        };

        popup._cleanup = cleanup;
    }

    // Hide active popup with animation
    function hideActivePopup() {
        if (!state.activePopup) return;

        const popup = state.activePopup;
        state.activePopup = null;
        state.isAnimating = true;

        // Cleanup proximity detection
        if (popup._cleanup) {
            popup._cleanup();
        }

        popup.classList.remove('growing', 'fully-grown');
        popup.classList.add('shrinking');

        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
            state.isAnimating = false;
        }, CONFIG.SHRINK_DURATION);
    }

    // Enhanced mode selection handler
    async function handleModeSelection(mode, sparkleElement) {
        console.log('Threadly: Mode selected:', mode);
        
        try {
            const textArea = findTextInput();
            if (!textArea) {
                console.warn('Threadly: No text area found');
                return;
            }

            const currentText = getTextFromElement(textArea);
            if (!currentText || currentText.trim() === '') {
                console.warn('Threadly: No text to process');
                return;
            }

            // Show processing state
            showProcessingState(sparkleElement);

            // Process based on mode
            switch (mode) {
                case 'correction':
                    await processGrammarCorrection(currentText, textArea);
                    break;
                case 'image':
                    await processImageGeneration(currentText, textArea);
                    break;
                case 'refine':
                    await processTextRefinement(currentText, textArea);
                    break;
                default:
                    console.warn('Threadly: Unknown mode:', mode);
            }
        } catch (error) {
            console.error('Threadly: Error processing mode selection:', error);
            showErrorState(sparkleElement);
        }
    }

    // Enhanced sparkle click handler
    async function handleSparkleClick() {
        console.log('Threadly: Autonomous mode activated');
        
        try {
            const textArea = findTextInput();
            if (!textArea) {
                console.warn('Threadly: No text area found');
                return;
            }

            const currentText = getTextFromElement(textArea);
            if (!currentText || currentText.trim() === '') {
                console.warn('Threadly: No text to process');
                return;
            }

            // Process autonomous refinement
            await processAutonomousRefinement(currentText, textArea);
        } catch (error) {
            console.error('Threadly: Error in autonomous mode:', error);
        }
    }

    // Utility functions for text processing
    function findTextInput() {
        const selectors = [
            'textarea:focus',
            '[contenteditable="true"]:focus',
            'textarea',
            '[contenteditable="true"]',
            'input[type="text"]'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && utils.isInViewport(element)) {
                return element;
            }
        }

        return null;
    }

    function getTextFromElement(element) {
        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
            return element.value;
        } else if (element.contentEditable === 'true') {
            return element.textContent || element.innerText;
        }
        return '';
    }

    function setTextToElement(element, text) {
        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
            element.value = text;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (element.contentEditable === 'true') {
            element.textContent = text;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    // Processing functions - Connect to existing AI system
    async function processGrammarCorrection(text, textArea) {
        console.log('Processing grammar correction for:', text);
        
        try {
            if (window.PromptRefiner) {
                const promptRefiner = new window.PromptRefiner();
                await promptRefiner.initialize();
                
                const correctedText = await promptRefiner.performGrammarCorrection(text);
                if (correctedText) {
                    setTextToElement(textArea, correctedText);
                    console.log('Threadly: Grammar correction completed');
                }
            } else {
                console.warn('Threadly: PromptRefiner not available');
            }
        } catch (error) {
            console.error('Threadly: Grammar correction failed:', error);
        }
    }

    async function processImageGeneration(text, textArea) {
        console.log('Processing image generation for:', text);
        
        try {
            if (window.PromptRefiner) {
                const promptRefiner = new window.PromptRefiner();
                await promptRefiner.initialize();
                
                const platform = detectCurrentPlatform();
                const imagePrompt = await promptRefiner.refineImageGenerationPrompt(text, platform);
                if (imagePrompt) {
                    setTextToElement(textArea, imagePrompt);
                    console.log('Threadly: Image generation prompt created');
                }
            } else {
                console.warn('Threadly: PromptRefiner not available');
            }
        } catch (error) {
            console.error('Threadly: Image generation failed:', error);
        }
    }

    async function processTextRefinement(text, textArea) {
        console.log('Processing text refinement for:', text);
        
        try {
            if (window.PromptRefiner) {
                const promptRefiner = new window.PromptRefiner();
                await promptRefiner.initialize();
                
                const platform = detectCurrentPlatform();
                const refinedText = await promptRefiner.refinePrompt(text, platform);
                if (refinedText) {
                    setTextToElement(textArea, refinedText);
                    console.log('Threadly: Text refinement completed');
                }
            } else {
                console.warn('Threadly: PromptRefiner not available');
            }
        } catch (error) {
            console.error('Threadly: Text refinement failed:', error);
        }
    }

    async function processAutonomousRefinement(text, textArea) {
        console.log('Processing autonomous refinement for:', text);
        
        try {
            if (window.PromptRefiner) {
                const promptRefiner = new window.PromptRefiner();
                await promptRefiner.initialize();
                
                const platform = detectCurrentPlatform();
                const refinedText = await promptRefiner.refinePrompt(text, platform);
                if (refinedText) {
                    setTextToElement(textArea, refinedText);
                    console.log('Threadly: Autonomous refinement completed');
                }
            } else {
                console.warn('Threadly: PromptRefiner not available');
            }
        } catch (error) {
            console.error('Threadly: Autonomous refinement failed:', error);
        }
    }

    // Detect current platform
    function detectCurrentPlatform() {
        const url = window.location.href;
        if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) {
            return 'chatgpt';
        } else if (url.includes('claude.ai')) {
            return 'claude';
        } else if (url.includes('aistudio.google.com')) {
            return 'ai-studio';
        } else if (url.includes('gemini.google.com')) {
            return 'gemini';
        } else if (url.includes('perplexity.ai')) {
            return 'perplexity';
        }
        return 'chatgpt'; // default fallback
    }

    // Visual feedback functions
    function showProcessingState(sparkleElement) {
        sparkleElement.style.opacity = '0.5';
        sparkleElement.style.animation = 'pulse 1s infinite';
    }

    function showErrorState(sparkleElement) {
        sparkleElement.style.opacity = '1';
        sparkleElement.style.animation = 'none';
        sparkleElement.style.filter = 'hue-rotate(0deg) brightness(1.2)';
        
        setTimeout(() => {
            sparkleElement.style.filter = '';
        }, 1000);
    }

    // Enhanced insertion with better targeting
    function insertSparkleButton() {
        const targetSelectors = [
            'textarea',
            '[contenteditable="true"]',
            'input[type="text"]'
        ];

        // Try each selector
        for (const selector of targetSelectors) {
            utils.waitForElement(selector, 5000).then((textArea) => {
                // Check if sparkle already exists nearby
                const existingSparkle = textArea.parentElement?.querySelector('[data-threadly-sparkle]');
                if (existingSparkle) {
                    console.log('Threadly: Sparkle already exists for this input');
                    return;
                }

                insertSparkleForElement(textArea);
            }).catch((error) => {
                console.log(`Threadly: No ${selector} found, trying next selector...`);
            });
        }
    }

    function insertSparkleForElement(textArea) {
        try {
            // Find appropriate container
            const container = findBestContainer(textArea);
            if (!container) {
                console.warn('Threadly: Could not find suitable container for sparkle');
                return;
            }

            // Create wrapper
            const sparkleWrapper = document.createElement('div');
            sparkleWrapper.setAttribute('data-threadly-sparkle-wrapper', 'true');
            sparkleWrapper.style.cssText = `
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin: 0 8px;
                vertical-align: middle;
            `;

            // Create and append sparkle
            const sparkleIcon = createSparkleIcon();
            sparkleWrapper.appendChild(sparkleIcon);

            // Insert in optimal position
            insertInOptimalPosition(container, sparkleWrapper, textArea);

            console.log('Threadly: Sparkle button inserted successfully');
        } catch (error) {
            console.error('Threadly: Failed to insert sparkle button:', error);
        }
    }

    function findBestContainer(textArea) {
        // Look for common UI patterns
        const candidates = [
            textArea.closest('[role="toolbar"]'),
            textArea.closest('.input-group'),
            textArea.closest('.form-group'),
            textArea.parentElement
        ];

        return candidates.find(container => container && container.tagName !== 'BODY') || textArea.parentElement;
    }

    function insertInOptimalPosition(container, sparkleWrapper, textArea) {
        // Try different insertion strategies
        const strategies = [
            () => {
                // Strategy 1: Insert as sibling before the text area
                if (textArea.parentElement === container) {
                    container.insertBefore(sparkleWrapper, textArea);
                    return true;
                }
                return false;
            },
            () => {
                // Strategy 2: Append to container
                container.appendChild(sparkleWrapper);
                return true;
            }
        ];

        for (const strategy of strategies) {
            try {
                if (strategy()) {
                    return;
                }
            } catch (error) {
                console.warn('Threadly: Insertion strategy failed:', error);
            }
        }

        console.warn('Threadly: All insertion strategies failed');
    }

    // Cleanup function
    function cleanup() {
        // Clear timeouts
        clearTimeout(state.hoverTimeout);
        clearTimeout(state.proximityTimeout);

        // Remove active popup
        hideActivePopup();

        // Remove sparkle elements
        state.sparkleElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.remove();
            }
        });
        state.sparkleElements.clear();

        // Remove styles
        const styles = document.querySelector('#threadly-styles');
        if (styles) {
            styles.remove();
        }
    }

    // Initialize with better error handling
    function initialize() {
        try {
            // Inject styles first
            injectStyles();

            // Insert sparkle button
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', insertSparkleButton);
            } else {
                insertSparkleButton();
            }

            // Handle page navigation (for SPAs)
            let lastUrl = location.href;
            new MutationObserver(() => {
                const url = location.href;
                if (url !== lastUrl) {
                    lastUrl = url;
                    setTimeout(insertSparkleButton, 1000); // Delay for SPA rendering
                }
            }).observe(document, { subtree: true, childList: true });

            console.log('Threadly: Successfully initialized');
        } catch (error) {
            console.error('Threadly: Initialization failed:', error);
        }
    }

    // Expose cleanup for testing/debugging
    window.ThreadlySparkle = { cleanup, initialize };

    // Initialize
    initialize();

})();
