/**
 * AI Studio Sparkle Button Content Script
 * Adds a sparkle button with the same SVG, size, and animation as Claude version
 * next to the upload button in AI Studio's text input bar
 */

(function() {
    'use strict';

    // Wait for DOM element to be ready
    function waitForElement(selector, timeout = 10000) {
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

    // Create the sparkle icon with glow effect (exact same as Claude version)
    function createSparkleIcon() {
        // Create the main SVG container (same size as Claude - 1.5x bigger)
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "36");
        svg.setAttribute("height", "36");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.style.cursor = "pointer";
        svg.style.opacity = "0.8";
        svg.style.transition = "opacity 0.2s ease";
        svg.style.overflow = "visible";
        svg.setAttribute("data-threadly-sparkle", "true");

        // Create the defs section with glow filter
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        
        const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        filter.setAttribute("id", "glow");
        filter.setAttribute("x", "-50%");
        filter.setAttribute("y", "-50%");
        filter.setAttribute("width", "200%");
        filter.setAttribute("height", "200%");
        
        const gaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
        gaussianBlur.setAttribute("stdDeviation", "4");
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
        defs.appendChild(filter);
        svg.appendChild(defs);

        // Create the main sparkle path with glow effect (same as Claude)
        const sparklePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        sparklePath.setAttribute("d", "M50,30 L55,45 L70,50 L55,55 L50,70 L45,55 L30,50 L45,45 Z");
        sparklePath.setAttribute("fill", "#FFFFFF");
        sparklePath.setAttribute("opacity", "1");
        sparklePath.style.transition = "filter 0.3s ease";
        svg.appendChild(sparklePath);

        // Add hover effects (exact same as Claude)
        svg.addEventListener('mouseenter', () => {
            svg.style.opacity = "1";
            sparklePath.setAttribute("filter", "url(#glow)");
        });

        svg.addEventListener('mouseleave', () => {
            svg.style.opacity = "0.8";
            sparklePath.removeAttribute("filter");
        });

        // Add hover popup functionality with shared state management
        let hoverTimeout;
        let hidePopupTimeout;
        let popup = null;
        const hoverState = { isHoveringSparkle: false, isHoveringPopup: false };
        const timeoutRef = { hidePopupTimeout };

        const showPopup = () => {
            clearTimeout(hidePopupTimeout);
            if (popup) return; // Don't create a new popup if one is already visible
            hoverTimeout = setTimeout(() => {
                popup = createModeSelectionPopup(svg, hoverState, timeoutRef);
            }, 300);
        };

        const hidePopup = () => {
            clearTimeout(hoverTimeout);
            timeoutRef.hidePopupTimeout = setTimeout(() => {
                if (popup) {
                    if (popup.classList.contains('growing')) {
                        popup.classList.remove('growing');
                        popup.classList.add('shrinking');
                        // Ensure animation completes before removing
                        setTimeout(() => {
                            if (popup) popup.remove();
                            popup = null;
                        }, 650); // Slightly longer than animation duration
                } else {
                        if (popup) popup.remove();
                        popup = null;
                    }
                }
            }, 100); // Reduced delay for more responsive hiding
        };

        svg.addEventListener('mouseenter', () => {
            hoverState.isHoveringSparkle = true;
            showPopup();
        });

        svg.addEventListener('mouseleave', () => {
            hoverState.isHoveringSparkle = false;
            hidePopup();
        });

        // Add click handler (exact same as Claude)
        svg.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            console.log('Threadly: Sparkle clicked!');
            
            // Test: Manually trigger hover event for debugging
            console.log('Threadly: Manually triggering hover test');
            const testEvent = new MouseEvent('mouseenter', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            svg.dispatchEvent(testEvent);
            
            // If popup is visible, remove it and proceed with autonomous mode
            if (popup) {
                popup.remove();
                popup = null;
                hoverState.isHoveringPopup = false;
            }
            
            handleSparkleClick();
        });

        // Set proper aria-label for tooltip
        svg.setAttribute('aria-label', 'Refine prompt with AI');
        svg.setAttribute('title', 'Refine prompt with AI');

        return svg;
    }

    // Create mode selection popup
    function createModeSelectionPopup(sparkleElement, hoverState = {}, timeoutRef = {}) {
        // Inject pill animation CSS if not already present
        if (!document.querySelector('#threadly-pill-animations')) {
            const style = document.createElement('style');
            style.id = 'threadly-pill-animations';
            style.textContent = `
                /* Pill-shaped popup animation */
                .pill-popup {
                    position: fixed;
                    z-index: 10000;
                    overflow: hidden;
                    pointer-events: none;
                }

                /* Growing animation */
                .pill-popup.growing {
                    animation: pill-emerge 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                /* Shrinking animation */
                .pill-popup.shrinking {
                    animation: pill-contract 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                    animation-fill-mode: forwards;
                }

                /* Platform-specific hover effect - only color change, no background, no movement */
                .threadly-mode-option:hover {
                    color: ${getPlatformAccentColor(detectCurrentPlatform())} !important;
                    background: transparent !important;
                    background-color: transparent !important;
                    box-shadow: none !important;
                    border: none !important;
                    outline: none !important;
                    transform: none !important;
                    transition: color 0.2s ease !important;
                }
                
                /* Ensure no background colors or movement on any state */
                .threadly-mode-option {
                    background: transparent !important;
                    background-color: transparent !important;
                    box-shadow: none !important;
                    border: none !important;
                    outline: none !important;
                    transform: none !important;
                    transition: color 0.2s ease !important;
                }

                /* Text fade during contraction */
                .pill-popup.shrinking .threadly-mode-option.correction {
                    animation: fadeOut 0.3s ease 0.1s forwards;
                }
                
                .pill-popup.shrinking .threadly-mode-option.refine {
                    animation: fadeOut 0.3s ease 0.1s forwards;
                }
                
                .pill-popup.shrinking .threadly-mode-option.image {
                    animation: fadeOut 0.3s ease 0.4s forwards;
                }

                @keyframes fadeOut {
                    to {
                        opacity: 0;
                    }
                }

                    /* Emergence keyframes */
                    @keyframes pill-emerge {
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
                            width: 80px;
                            height: 28px;
                            border-radius: 20px;
                        }
                        
                        70% {
                            width: 140px;
                            height: 30px;
                            border-radius: 15px;
                        }
                        
                        85% {
                            width: 170px;
                            height: 32px;
                            border-radius: 16px;
                        }
                        
                        100% {
                            width: 190px;
                            height: 32px;
                            opacity: 1;
                            border-radius: 16px;
                        }
                    }

                /* Contraction keyframes */
                @keyframes pill-contract {
                    0% {
                        width: 190px;
                        height: 32px;
                        opacity: 1;
                        border-radius: 16px;
                        transform: translateX(-50%);
                    }
                    
                    10% {
                        width: 170px;
                        height: 32px;
                        border-radius: 16px;
                        transform: translateX(-50%);
                    }
                    
                    20% {
                        width: 140px;
                        height: 30px;
                        border-radius: 15px;
                        transform: translateX(-50%);
                    }
                    
                    35% {
                        width: 100px;
                        height: 30px;
                        border-radius: 15px;
                        transform: translateX(-50%);
                    }
                    
                    50% {
                        width: 60px;
                        height: 30px;
                        border-radius: 15px;
                        transform: translateX(-50%);
                    }
                    
                    70% {
                        width: 40px;
                        height: 30px;
                        border-radius: 15px;
                        transform: translateX(-50%);
                    }
                    
                    85% {
                        width: 20px;
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
        
            // Remove existing popup if any
        const existingPopup = document.querySelector('.pill-popup');
            if (existingPopup) {
                existingPopup.remove();
            }

        // Create popup container with pill animation
            const popup = document.createElement('div');
        popup.className = 'pill-popup';
        
        // Add inline styles for pill animation
        popup.style.position = 'fixed';
        popup.style.zIndex = '10000';
        popup.style.overflow = 'hidden';
        popup.style.pointerEvents = 'none';
        
        // Create content container for the pill
        const contentContainer = document.createElement('div');
        contentContainer.style.display = 'flex';
        contentContainer.style.alignItems = 'center';
        contentContainer.style.justifyContent = 'space-evenly';
        contentContainer.style.height = '100%';
        contentContainer.style.width = '100%';
        contentContainer.style.opacity = '0';
        contentContainer.style.transition = 'opacity 0.3s ease 0.4s';

        contentContainer.innerHTML = `
            <span class="threadly-mode-option correction" data-mode="correction" style="cursor: pointer; transition: color 0.2s ease; font-size: 9px; font-weight: 600; color: #ffffff; text-transform: uppercase; letter-spacing: 0.2px; white-space: nowrap;">CORRECT</span>
            <span class="threadly-mode-option image" data-mode="image" style="cursor: pointer; transition: color 0.2s ease; font-size: 9px; font-weight: 600; color: #ffffff; text-transform: uppercase; letter-spacing: 0.2px; white-space: nowrap;">IMAGE</span>
            <span class="threadly-mode-option refine" data-mode="refine" style="cursor: pointer; transition: color 0.2s ease; font-size: 9px; font-weight: 600; color: #ffffff; text-transform: uppercase; letter-spacing: 0.2px; white-space: nowrap;">REFINE</span>
        `;
        
        popup.appendChild(contentContainer);

        // Position popup relative to document body to avoid clipping
        document.body.appendChild(popup);
        
        // Get sparkle element position and adjust popup position
        const sparkleRect = sparkleElement.getBoundingClientRect();
        
        // Set initial position for pill animation (centered above the sparkle)
        popup.style.top = (sparkleRect.top - 45) + 'px'; // Adjusted for smaller height + gap
        popup.style.left = (sparkleRect.left + sparkleRect.width / 2) + 'px';
        popup.style.transform = 'translateX(-50%)'; // Horizontally center the popup
        
        // Add pill animation styles with Threadly liquid glass design
        popup.style.width = '0';
        popup.style.height = '0';
        popup.style.background = 'rgba(255, 255, 255, 0.08)';
        popup.style.backdropFilter = 'blur(4px)';
        popup.style.webkitBackdropFilter = 'blur(4px)';
        popup.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        popup.style.borderRadius = '50px';
        popup.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        popup.style.transformOrigin = 'center center';
        popup.style.transition = 'none';
        popup.style.opacity = '0';

        // Start the pill emergence animation
            setTimeout(() => {
            popup.classList.add('growing');
            popup.style.pointerEvents = 'all';
            
            // Show content after animation starts
            setTimeout(() => {
                contentContainer.style.opacity = '1';
            }, 400);
            }, 10);

            // Add click handlers for each option
            popup.addEventListener('click', (e) => {
                const mode = e.target.closest('.threadly-mode-option')?.dataset.mode;
                if (mode) {
                    handleModeSelection(mode, sparkleElement);
                if (popup) {
                    popup.remove();
                    // Reset hover state when popup is closed
                    hoverState.isHoveringPopup = false;
                }
            }
        });

        // Keep popup open when hovering over it
        popup.addEventListener('mouseenter', () => {
            hoverState.isHoveringPopup = true;
            clearTimeout(timeoutRef.hidePopupTimeout);
        });
        
        popup.addEventListener('mouseleave', () => {
            hoverState.isHoveringPopup = false;
            // Only hide if not hovering over sparkle either
            if (!hoverState.isHoveringSparkle) {
                timeoutRef.hidePopupTimeout = setTimeout(() => {
                    if (!hoverState.isHoveringSparkle && !hoverState.isHoveringPopup && popup) {
                        popup.classList.remove('growing');
                        popup.classList.add('shrinking');
                        // Ensure animation completes before removing
            setTimeout(() => {
                            if (popup) popup.remove();
                            popup = null;
                        }, 650); // Slightly longer than animation duration
                    }
            }, 100);
            }
        });

            return popup;
    }

    // Handle mode selection
    async function handleModeSelection(mode, sparkleElement) {
        console.log('Threadly: Mode selected:', mode);
        
        // Get current input text
        const textArea = document.querySelector('textarea, [contenteditable="true"]');
        if (!textArea) {
            console.log('Threadly: No text area found');
            return;
        }

        const currentText = textArea.value || textArea.textContent || textArea.innerText;
        if (!currentText || currentText.trim() === '') {
            console.log('Threadly: No text to process');
            return;
        }

        // Start sparkle breathing animation
        startClickAnimationSequence(sparkleElement);

        try {
            if (window.PromptRefiner) {
                const promptRefiner = new window.PromptRefiner();
                await promptRefiner.initialize();

                let refinedPrompt;
                const platform = detectCurrentPlatform();

                switch (mode) {
                    case 'correction':
                        refinedPrompt = await promptRefiner.performGrammarCorrection(currentText);
                        break;
                    case 'image':
                        refinedPrompt = await promptRefiner.refineImageGenerationPrompt(currentText, platform);
                        break;
                    case 'refine':
                        refinedPrompt = await promptRefiner.refinePrompt(currentText, platform);
                        break;
                }

                // Replace text in the input
                if (refinedPrompt) {
                    if (textArea.tagName === 'TEXTAREA') {
                        textArea.value = refinedPrompt;
                    } else {
                        textArea.textContent = refinedPrompt;
                    }
                    
                    // Trigger input event to notify the platform
                    textArea.dispatchEvent(new Event('input', { bubbles: true }));
                    textArea.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    console.log('Threadly: Prompt refined successfully with triage AI');
                    
                    // Stop sparkle breathing animation when result is replaced
                    stopClickAnimationSequence(sparkleElement);
                } else {
                    // Stop animation even if no result (error case)
                    stopClickAnimationSequence(sparkleElement);
                }
            } else {
                // Stop animation if PromptRefiner is not available
                stopClickAnimationSequence(sparkleElement);
            }
        } catch (error) {
            console.error('Threadly: Error processing prompt:', error);
            // Stop animation on error
            stopClickAnimationSequence(sparkleElement);
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

    function getPlatformAccentColor(platform) {
        const accentColors = {
            'chatgpt': '#ffcc00',    // ChatGPT yellow
            'claude': '#d97706',     // Claude orange
            'ai-studio': '#4285f4',  // AI Studio blue
            'gemini': '#87ceeb',     // Gemini sky blue
            'perplexity': '#20b2aa'  // Perplexity teal
        };
        return accentColors[platform] || '#ffcc00'; // fallback to yellow
    }

    // Handle sparkle click functionality with prompt refine feature (exact copy from Claude)
    async function handleSparkleClick() {
        console.log('Threadly: Sparkle clicked - prompt refine activated!');
        
        // Get current input text from textarea or contenteditable
        const textArea = document.querySelector('textarea, [contenteditable="true"]');
        if (textArea) {
            const currentText = textArea.value || textArea.textContent || textArea.innerText;
            console.log('Threadly: Current prompt:', currentText);
            
            if (!currentText || currentText.trim() === '') {
                console.log('Threadly: No text to refine');
                return;
            }
            
            // Visual feedback - start animation sequence
            const sparkleIcon = document.querySelector('[data-threadly-sparkle="true"]');
            if (sparkleIcon) {
                startClickAnimationSequence(sparkleIcon);
            }
            
            try {
                // Use the existing PromptRefiner class
                if (window.PromptRefiner) {
                    console.log('Threadly: PromptRefiner found, creating instance...');
                    const promptRefiner = new window.PromptRefiner();
                    
                    console.log('Threadly: Initializing PromptRefiner...');
                    await promptRefiner.initialize();
                    
                    console.log('Threadly: PromptRefiner initialized, checking API key...');
                    // Check if API key is available
                    const apiKey = await new Promise((resolve) => {
                        chrome.storage.local.get(['geminiApiKey'], (result) => {
                            resolve(result.geminiApiKey);
                        });
                    });
                    console.log('Threadly: API key available:', !!apiKey);
                    
                    console.log('Threadly: Sending prompt for refinement...');
                    let rawRefinedPrompt;
                    try {
                        rawRefinedPrompt = await promptRefiner.refinePrompt(currentText, 'gemini');
                    } catch (apiError) {
                        console.log('Threadly: Gemini platform failed, trying ChatGPT platform...');
                        try {
                            rawRefinedPrompt = await promptRefiner.refinePrompt(currentText, 'chatgpt');
                        } catch (chatgptError) {
                            console.log('Threadly: ChatGPT platform failed, trying Claude platform...');
                            rawRefinedPrompt = await promptRefiner.refinePrompt(currentText, 'claude');
                        }
                    }
                    
                    // Clean up the refined prompt to remove XML tags and unnecessary formatting
                    const refinedPrompt = cleanRefinedPrompt(rawRefinedPrompt);
                    
                    // Replace the text with refined version
                    console.log('Threadly: Replacing text with refined prompt:', refinedPrompt);
                    
                    if (textArea.tagName === 'TEXTAREA') {
                        textArea.value = refinedPrompt;
                        console.log('Threadly: Updated textarea value');
                    } else if (textArea.contentEditable === 'true') {
                        textArea.textContent = refinedPrompt;
                        textArea.innerText = refinedPrompt;
                        console.log('Threadly: Updated contenteditable text');
                    } else {
                        textArea.textContent = refinedPrompt;
                        console.log('Threadly: Updated text content');
                    }
                    
                    // Trigger multiple events to ensure AI Studio detects the change
                    textArea.dispatchEvent(new Event('input', { bubbles: true }));
                    textArea.dispatchEvent(new Event('change', { bubbles: true }));
                    textArea.dispatchEvent(new Event('keyup', { bubbles: true }));
                    
                    // Force focus back to the text area
                    textArea.focus();
                    
                    console.log('Threadly: Text replacement completed');
                    
                    console.log('Threadly: Prompt refined successfully');
                    
                    // Dispatch success event
                    window.dispatchEvent(new CustomEvent('threadly-prompt-refined', {
                        detail: { 
                            platform: 'ai-studio', 
                            originalText: currentText,
                            refinedText: refinedPrompt
                        }
                    }));
                    
                } else {
                    console.error('Threadly: PromptRefiner class not available');
                    throw new Error('PromptRefiner not available');
                }
                
            } catch (error) {
                console.error('Threadly: Error refining prompt:', error);
                
                // Dispatch error event
                window.dispatchEvent(new CustomEvent('threadly-prompt-refine-error', {
                    detail: { 
                        platform: 'ai-studio', 
                        error: error.message,
                        originalText: currentText
                    }
                }));
                
            } finally {
                // Stop animation and end at fade out state
                if (sparkleIcon) {
                    stopClickAnimationSequence(sparkleIcon);
                }
            }
            
        } else {
            console.log('Threadly: No text input found');
        }
        
        // Dispatch click event for other parts of the extension
        window.dispatchEvent(new CustomEvent('threadly-sparkle-clicked', {
            detail: { 
                platform: 'ai-studio', 
                action: 'prompt-refine'
            }
        }));
    }
    
    // Clean up refined prompt to remove XML tags and unnecessary formatting (same as Claude)
    function cleanRefinedPrompt(rawText) {
        let cleaned = rawText.trim();
        
        console.log('Threadly: Raw refined text:', cleaned);
        
        // Remove XML/HTML tags (more comprehensive)
        cleaned = cleaned.replace(/<[^>]*>/g, '');
        cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');
        
        // Remove XML-like patterns
        cleaned = cleaned.replace(/\[xml[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[content[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[refined[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[response[^\]]*\]/gi, '');
        
        // Remove markdown formatting
        cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
        cleaned = cleaned.replace(/\*(.*?)\*/g, '$1'); // Italic
        cleaned = cleaned.replace(/`(.*?)`/g, '$1'); // Code
        cleaned = cleaned.replace(/```[\s\S]*?```/g, ''); // Code blocks
        
        // Remove common AI response prefixes and wrappers
        cleaned = cleaned.replace(/^(refined|improved|enhanced|optimized|xml contents?)[:\-\s]*/gi, '');
        cleaned = cleaned.replace(/^(here's|here is|the following|below is)[:\-\s]*/gi, '');
        cleaned = cleaned.replace(/^(the refined prompt is|refined prompt|response|answer)[:\-\s]*/gi, '');
        
        // Remove XML-like content indicators
        cleaned = cleaned.replace(/^xml\s+contents?[:\-\s]*/gi, '');
        cleaned = cleaned.replace(/^content[:\-\s]*/gi, '');
        cleaned = cleaned.replace(/^response[:\-\s]*/gi, '');
        
        // Remove brackets and parentheses content that looks like metadata
        cleaned = cleaned.replace(/\[[^\]]*(xml|content|response|refined)[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\([^)]*(xml|content|response|refined)[^)]*\)/gi, '');
        
        // Remove extra whitespace and normalize
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        // Remove quotes if the entire text is wrapped in them
        if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
            (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
            cleaned = cleaned.slice(1, -1).trim();
        }
        
        // Remove trailing metadata-like text
        cleaned = cleaned.replace(/\s*\[.*xml.*\]\s*$/gi, '');
        cleaned = cleaned.replace(/\s*\[.*content.*\]\s*$/gi, '');
        
        // Final cleanup
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        // Ensure proper sentence structure
        if (cleaned && !cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
            cleaned += '.';
        }
        
        console.log('Threadly: Cleaned refined text:', cleaned);
        
        return cleaned;
    }
    
    // Start smooth glow morph breathe animation (exact same as Claude)
    function startClickAnimationSequence(sparkleIcon) {
        // Add CSS animations if not already added
        if (!document.getElementById('threadly-glow-animation')) {
            const style = document.createElement('style');
            style.id = 'threadly-glow-animation';
            style.textContent = `
                @keyframes glowMorphBreathe {
                    0%, 100% { 
                        filter: none;
                        transform: scale(1);
                        transform-origin: center center;
                    }
                    50% { 
                        filter: drop-shadow(0 0 20px rgba(255,255,255,1));
                        transform: scale(1.2);
                        transform-origin: center center;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Start the smooth glow morph breathe animation
        sparkleIcon.style.animation = 'glowMorphBreathe 2.5s ease-in-out infinite';
    }
    
    // Stop glow animation smoothly by completing current cycle (exact same as Claude)
    function stopClickAnimationSequence(sparkleIcon) {
        // Add a one-time animation that completes the current cycle and stops at default state
        if (!document.getElementById('threadly-stop-animation')) {
            const style = document.createElement('style');
            style.id = 'threadly-stop-animation';
            style.textContent = `
                @keyframes smoothStop {
                    0% { 
                        filter: drop-shadow(0 0 20px rgba(255,255,255,1));
                        transform: scale(1.2);
                        transform-origin: center center;
                    }
                    100% { 
                        filter: none;
                        transform: scale(1);
                        transform-origin: center center;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Start the smooth stop animation (completes in 1.25s - half of the full cycle)
        sparkleIcon.style.animation = 'smoothStop 1.25s ease-in-out 1';
        
        // After the smooth stop completes, ensure it's at default state
        setTimeout(() => {
            sparkleIcon.style.animation = '';
            sparkleIcon.style.filter = 'none';
            sparkleIcon.style.transform = 'scale(1)';
            sparkleIcon.style.opacity = '0.8';
        }, 1250);
    }

    // Main function to insert the sparkle icon next to the upload button
    async function insertSparkleIcon() {
        try {
            console.log('Threadly: Adding sparkle icon to AI Studio input area...');
            
            // Check if sparkle already exists
            const existingSparkle = document.querySelector('[data-threadly-sparkle="true"]');
            if (existingSparkle) {
                console.log('Threadly: Sparkle icon already exists, removing duplicates');
                document.querySelectorAll('[data-threadly-sparkle="true"]').forEach(el => el.remove());
            }
            
            // Find the upload button (add_circle) - be more aggressive
            let uploadButton = null;
            
            // Try multiple approaches to find the upload button
            const uploadSelectors = [
                'button[aria-label*="Insert assets such as images, videos, files, or audio"]',
                'button[iconname="add_circle"]',
                'ms-add-chunk-menu button',
                'button .material-symbols-outlined:contains("add_circle")',
                'button[aria-label*="add"]',
                'button[aria-label*="upload"]',
                'button[aria-label*="attach"]',
                '.button-wrapper button',
                '[class*="add-chunk"] button'
            ];
            
            for (const selector of uploadSelectors) {
                uploadButton = document.querySelector(selector);
                if (uploadButton) {
                    console.log(`Threadly: Found upload button with selector: ${selector}`);
                    break;
                }
            }
            
            // If still not found, search all buttons more thoroughly
            if (!uploadButton) {
                const allButtons = document.querySelectorAll('button');
                for (const button of allButtons) {
                    const text = button.textContent.toLowerCase();
                    const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
                    const className = button.className.toLowerCase();
                    const iconName = button.getAttribute('iconname') || '';
                    
                    if ((text.includes('add') || ariaLabel.includes('insert') || ariaLabel.includes('assets') || 
                         iconName.includes('add_circle') || className.includes('add-chunk')) &&
                        !text.includes('run') && !ariaLabel.includes('run')) {
                        uploadButton = button;
                        console.log(`Threadly: Found upload button: ${text || ariaLabel || className || iconName}`);
                        break;
                    }
                }
            }
            
            if (!uploadButton) {
                throw new Error("Could not find upload button");
            }
            
            console.log('Threadly: Upload button found:', uploadButton);
            console.log('Threadly: Upload button parent:', uploadButton.parentElement);
            
            // Create the sparkle icon
            console.log('Threadly: Creating sparkle icon');
            const sparkleIcon = createSparkleIcon();
            console.log('Threadly: Sparkle icon created:', sparkleIcon);
            
            // Style the sparkle icon
            sparkleIcon.style.display = 'inline-block';
            sparkleIcon.style.verticalAlign = 'middle';
            sparkleIcon.style.position = 'relative';
            sparkleIcon.style.top = '0';
            sparkleIcon.style.marginLeft = '0px';
            sparkleIcon.style.marginRight = '8px';
            console.log('Threadly: Sparkle icon styled');
            
            // Find the main text bar container using multiple selectors for different page states
            let textBarContainer = document.querySelector("body > app-root > ms-app > div > div > div.layout-wrapper.ng-tns-c895710572-0 > div > span > ms-prompt-switcher > ms-chunk-editor > section > footer > ms-prompt-input-wrapper > div > div > div");
            
            // Fallback selectors for different page states
            if (!textBarContainer) {
                const fallbackSelectors = [
                    '.prompt-input-wrapper-container',
                    '.prompt-input-wrapper',
                    '[class*="prompt-input"]',
                    '[class*="composer"]',
                    'ms-prompt-input-wrapper',
                    'ms-chunk-editor'
                ];
                
                for (const selector of fallbackSelectors) {
                    textBarContainer = document.querySelector(selector);
                    if (textBarContainer) {
                        console.log(`Threadly: Found text bar container with fallback selector: ${selector}`);
                        break;
                    }
                }
            }
            
            // Ensure we have the right container - it should contain both text-wrapper and button-wrapper
            if (textBarContainer && !textBarContainer.querySelector('.text-wrapper') && !textBarContainer.querySelector('.button-wrapper')) {
                // Look for a parent that contains both elements
                let parent = textBarContainer.parentElement;
                while (parent && parent !== document.body) {
                    if (parent.querySelector('.text-wrapper') && parent.querySelector('.button-wrapper')) {
                        textBarContainer = parent;
                        console.log('Threadly: Found better container that contains both text and button wrappers');
                        break;
                    }
                    parent = parent.parentElement;
                }
            }
            
            if (textBarContainer) {
                console.log('Threadly: Found text bar container:', textBarContainer);
                
                // Ensure container is flex with proper alignment
                textBarContainer.style.display = 'flex';
                textBarContainer.style.alignItems = 'center';
                textBarContainer.style.gap = '8px';
                textBarContainer.style.flexDirection = 'row';
                
                // Remove any existing sparkles first
                const existingSparkles = textBarContainer.querySelectorAll('[data-threadly-sparkle="true"]');
                existingSparkles.forEach(sparkle => sparkle.remove());
                
                // Find the upload button's wrapper to position sparkle before it
                const uploadButtonWrapper = uploadButton.closest('.button-wrapper');
                if (uploadButtonWrapper) {
                    // Create a dedicated wrapper for the sparkle to ensure proper positioning
                    const sparkleWrapper = document.createElement('div');
                    sparkleWrapper.className = 'button-wrapper';
                    sparkleWrapper.style.display = 'flex';
                    sparkleWrapper.style.alignItems = 'center';
                    sparkleWrapper.style.gap = '8px';
                    sparkleWrapper.style.flexDirection = 'row';
                    sparkleWrapper.appendChild(sparkleIcon);
                    
                    // Insert sparkle wrapper right before the upload button wrapper in the main container
                    try {
                        textBarContainer.insertBefore(sparkleWrapper, uploadButtonWrapper);
                        console.log('Threadly: SUCCESS - Sparkle wrapper inserted before upload button wrapper');
                        console.log('Threadly: Sparkle icon in DOM:', document.querySelector('[data-threadly-sparkle="true"]'));
                        console.log('Threadly: Sparkle icon position:', sparkleIcon.getBoundingClientRect());
                    } catch (error) {
                        console.error('Threadly: Insert sparkle wrapper failed:', error);
                        // Fallback: append to text bar container
                        textBarContainer.appendChild(sparkleWrapper);
                        console.log('Threadly: FALLBACK - Sparkle wrapper appended to text bar container');
                        console.log('Threadly: Sparkle icon in DOM:', document.querySelector('[data-threadly-sparkle="true"]'));
                    }
                } else {
                    // Try to find the parent container of the upload button and insert before it
                    let parentContainer = uploadButton.parentElement;
                    while (parentContainer && parentContainer !== textBarContainer) {
                        if (parentContainer.classList.contains('button-wrapper') || 
                            parentContainer.classList.contains('prompt-input-wrapper-container') ||
                            parentContainer.tagName.toLowerCase() === 'div') {
                            try {
                                // Create a dedicated wrapper for the sparkle
                                const sparkleWrapper = document.createElement('div');
                                sparkleWrapper.className = 'button-wrapper';
                                sparkleWrapper.style.display = 'flex';
                                sparkleWrapper.style.alignItems = 'center';
                                sparkleWrapper.style.gap = '8px';
                                sparkleWrapper.style.flexDirection = 'row';
                                sparkleWrapper.appendChild(sparkleIcon);
                                
                                parentContainer.parentNode.insertBefore(sparkleWrapper, parentContainer);
                                console.log('Threadly: SUCCESS - Sparkle wrapper inserted before parent container');
                                break;
                            } catch (error) {
                                console.log('Threadly: Insert sparkle wrapper before parent failed, trying next level up');
                            }
                        }
                        parentContainer = parentContainer.parentElement;
                    }
                    
                    // If all else fails, append to text bar container
                    if (!parentContainer || parentContainer === textBarContainer) {
                        const sparkleWrapper = document.createElement('div');
                        sparkleWrapper.className = 'button-wrapper';
                        sparkleWrapper.style.display = 'flex';
                        sparkleWrapper.style.alignItems = 'center';
                        sparkleWrapper.style.gap = '8px';
                        sparkleWrapper.style.flexDirection = 'row';
                        sparkleWrapper.appendChild(sparkleIcon);
                        
                        textBarContainer.appendChild(sparkleWrapper);
                        console.log('Threadly: FALLBACK - Sparkle wrapper appended to text bar container');
                    }
                }
            } else {
                // Fallback: find the button wrapper container
                const buttonWrapper = uploadButton.closest('.button-wrapper');
                if (buttonWrapper) {
                    // Ensure button wrapper is flex with proper alignment
                    buttonWrapper.style.display = 'flex';
                    buttonWrapper.style.alignItems = 'center';
                    buttonWrapper.style.gap = '8px';
                    buttonWrapper.style.flexDirection = 'row';
                    
                    // Remove any existing sparkles first
                    const existingSparkles = buttonWrapper.querySelectorAll('[data-threadly-sparkle="true"]');
                    existingSparkles.forEach(sparkle => sparkle.remove());
                    
                    // Insert sparkle right before the upload button
                    try {
                        uploadButton.parentNode.insertBefore(sparkleIcon, uploadButton);
                        console.log('Threadly: SUCCESS - Sparkle inserted before upload button (fallback)');
                    } catch (error) {
                        console.error('Threadly: Insert before upload failed:', error);
                        // Fallback: append to button wrapper
                        buttonWrapper.appendChild(sparkleIcon);
                        console.log('Threadly: FALLBACK - Sparkle appended to button wrapper');
                    }
                } else {
                    // Last resort: insert before upload button directly
                    try {
                        uploadButton.parentNode.insertBefore(sparkleIcon, uploadButton);
                        console.log('Threadly: SUCCESS - Sparkle inserted before upload button (last resort)');
                    } catch (error) {
                        console.error('Threadly: All methods failed:', error);
                        // Last resort: append to body
                        document.body.appendChild(sparkleIcon);
                        console.log('Threadly: FALLBACK - appended to body');
                    }
                }
            }
            
            // Check if sparkle was inserted
            const insertedSparkle = document.querySelector('[data-threadly-sparkle="true"]');
            if (insertedSparkle) {
                console.log('Threadly: SUCCESS - Sparkle is now in DOM');
                console.log('Threadly: Sparkle parent:', insertedSparkle.parentElement);
            } else {
                console.error('Threadly: FAILED - Sparkle not found in DOM');
            }
            
            console.log("Threadly: Successfully added sparkle icon to AI Studio input area");
            
            // Dispatch success event
            window.dispatchEvent(new CustomEvent('threadly-sparkle-inserted', {
                detail: { platform: 'ai-studio', success: true }
            }));
            
        } catch (error) {
            console.error("Threadly: Error inserting sparkle icon:", error);
            
            // Dispatch error event
            window.dispatchEvent(new CustomEvent('threadly-sparkle-error', {
                detail: { platform: 'ai-studio', error: error.message }
            }));
        }
    }

    // Check if we're on AI Studio's website
    function isAIStudioWebsite() {
        return window.location.hostname === 'aistudio.google.com' || 
               window.location.hostname.includes('aistudio.google.com') ||
               window.location.hostname.includes('ai.google.dev');
    }

    // Initialize when page loads
    function initialize() {
        console.log('Threadly: AI Studio Sparkle Extension initializing...');
        
        // Wait for AI Studio's interface to load with multiple attempts for different page states
        const attemptInsertion = (attempt = 1) => {
            console.log(`Threadly: AI Studio attempt ${attempt} - Attempting sparkle insertion...`);
            try {
                insertSparkleIcon();
                console.log(`Threadly: AI Studio attempt ${attempt} - SUCCESS`);
            } catch (error) {
                console.log(`Threadly: AI Studio attempt ${attempt} - FAILED:`, error.message);
                if (attempt < 5) {
                    setTimeout(() => attemptInsertion(attempt + 1), 2000);
                } else {
                    console.error('Threadly: AI Studio - All insertion attempts failed');
                }
            }
        };
        
        // Try multiple times with increasing delays to catch different page states
        setTimeout(() => attemptInsertion(1), 1000);
        setTimeout(() => attemptInsertion(2), 3000);
        setTimeout(() => attemptInsertion(3), 5000);
        
        // Also check periodically to ensure sparkle stays in place and is positioned correctly
        setInterval(() => {
            const existingSparkles = document.querySelectorAll('[data-threadly-sparkle="true"]');
            if (existingSparkles.length === 0) {
                console.log('Threadly: Periodic check - re-adding missing sparkle icon');
                insertSparkleIcon();
            } else if (existingSparkles.length > 1) {
                console.log('Threadly: Periodic check - removing duplicate sparkles');
                // Keep only the first one, remove the rest
                for (let i = 1; i < existingSparkles.length; i++) {
                    existingSparkles[i].remove();
                }
            } else {
                // Check if sparkle is in the correct position (right before upload button wrapper)
                const sparkle = existingSparkles[0];
                const uploadButton = document.querySelector('button[aria-label*="Insert assets such as images, videos, files, or audio"], button[iconname="add_circle"], ms-add-chunk-menu button');
                const uploadButtonWrapper = uploadButton?.closest('.button-wrapper');
                const sparkleWrapper = sparkle?.closest('.button-wrapper');
                
                if (uploadButtonWrapper && sparkleWrapper && uploadButtonWrapper.previousElementSibling !== sparkleWrapper) {
                    console.log('Threadly: Periodic check - repositioning sparkle before upload button wrapper');
                    // Remove and re-insert to ensure correct position
                    sparkleWrapper.remove();
                    insertSparkleIcon();
                }
            }
        }, 5000); // Check every 5 seconds
        
        // Add input listener to textarea to ensure sparkle positioning when typing
        const addTextareaListener = () => {
            const textarea = document.querySelector('textarea, [contenteditable="true"]');
            if (textarea) {
                textarea.addEventListener('input', () => {
                    // Check and fix sparkle positioning after typing
                    setTimeout(() => {
                        const existingSparkles = document.querySelectorAll('[data-threadly-sparkle="true"]');
                        if (existingSparkles.length === 0) {
                            console.log('Threadly: Re-adding missing sparkle after textarea input');
                            insertSparkleIcon();
                        } else if (existingSparkles.length > 1) {
                            console.log('Threadly: Removing duplicate sparkles after textarea input');
                            // Keep only the first one, remove the rest
                            for (let i = 1; i < existingSparkles.length; i++) {
                                existingSparkles[i].remove();
                            }
                        } else {
                            // Check if sparkle is in the correct position (right before upload button wrapper)
                            const sparkle = existingSparkles[0];
                            const uploadButton = document.querySelector('button[aria-label*="Insert assets such as images, videos, files, or audio"], button[iconname="add_circle"], ms-add-chunk-menu button');
                            const uploadButtonWrapper = uploadButton?.closest('.button-wrapper');
                            const sparkleWrapper = sparkle?.closest('.button-wrapper');
                            
                            if (uploadButtonWrapper && sparkleWrapper && uploadButtonWrapper.previousElementSibling !== sparkleWrapper) {
                                console.log('Threadly: Repositioning sparkle before upload button wrapper after textarea input');
                                // Remove and re-insert to ensure correct position
                                sparkleWrapper.remove();
                                insertSparkleIcon();
                            }
                        }
                    }, 200);
                });
            }
        };
        
        // Add listener immediately and also periodically
        addTextareaListener();
        setInterval(addTextareaListener, 3000);
        
        // Watch for dynamic content changes and ensure proper positioning
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check and fix sparkle positioning after DOM changes
                    setTimeout(() => {
                        const existingSparkles = document.querySelectorAll('[data-threadly-sparkle="true"]');
                        if (existingSparkles.length === 0) {
                            console.log('Threadly: Re-adding missing sparkle icon after DOM change');
                            insertSparkleIcon();
                        } else if (existingSparkles.length > 1) {
                            console.log('Threadly: Removing duplicate sparkles after DOM change');
                            // Keep only the first one, remove the rest
                            for (let i = 1; i < existingSparkles.length; i++) {
                                existingSparkles[i].remove();
                            }
                        } else {
                            // Check if sparkle is in the correct position (right before upload button wrapper)
                            const sparkle = existingSparkles[0];
                            const uploadButton = document.querySelector('button[aria-label*="Insert assets such as images, videos, files, or audio"], button[iconname="add_circle"], ms-add-chunk-menu button');
                            const uploadButtonWrapper = uploadButton?.closest('.button-wrapper');
                            const sparkleWrapper = sparkle?.closest('.button-wrapper');
                            
                            if (uploadButtonWrapper && sparkleWrapper && uploadButtonWrapper.previousElementSibling !== sparkleWrapper) {
                                console.log('Threadly: Repositioning sparkle before upload button wrapper after DOM change');
                                // Remove and re-insert to ensure correct position
                                sparkleWrapper.remove();
                                insertSparkleIcon();
                            }
                        }
                    }, 1000); // Slower response to avoid repositioning during typing
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize only if on AI Studio's website
    if (isAIStudioWebsite()) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
        } else {
            initialize();
        }
    }

    // Export for testing and debugging
    window.ThreadlyAIStudioSparkle = {
        insertSparkleIcon,
        createSparkleIcon,
        handleSparkleClick,
        isAIStudioWebsite
    };
    
    // Also make handleSparkleClick globally accessible for testing
    window.handleAIStudioSparkleClick = handleSparkleClick;

})();