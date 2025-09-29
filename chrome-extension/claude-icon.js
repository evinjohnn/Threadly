/**
 * Claude Prompt Refine Content Script
 * Adds a Prompt Refine button with sparkle icon next to the Claude model selector
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

    // Add CSS styles for the popup with pill animations
    function addPopupStyles() {
        if (document.getElementById('threadly-pill-animations')) return;

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
            }

            /* Yellow hover effect - only color change, no background, no movement */
            .threadly-mode-option:hover {
                color: #ffcc00 !important;
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
                }
                
                20% {
                    width: 170px;
                    height: 32px;
                    opacity: 0.9;
                    border-radius: 16px;
                }
                
                40% {
                    width: 140px;
                    height: 30px;
                    opacity: 0.7;
                    border-radius: 15px;
                }
                
                60% {
                    width: 80px;
                    height: 28px;
                    opacity: 0.5;
                    border-radius: 20px;
                }
                
                80% {
                    width: 28px;
                    height: 28px;
                    opacity: 0.3;
                    border-radius: 50%;
                }
                
                100% {
                    width: 0;
                    height: 0;
                    opacity: 0;
                    border-radius: 50%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Create the sparkle icon with glow effect
    function createSparkleIcon() {
        // Create the main SVG container (1.5x bigger)
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

        // Create the main sparkle path with glow effect
        const sparklePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        sparklePath.setAttribute("d", "M50,30 L55,45 L70,50 L55,55 L50,70 L45,55 L30,50 L45,45 Z");
        sparklePath.setAttribute("fill", "#FFFFFF");
        sparklePath.setAttribute("opacity", "1");
        sparklePath.style.transition = "filter 0.3s ease";
        svg.appendChild(sparklePath);

        // Add hover effects for the sparkle itself
        svg.addEventListener('mouseenter', () => {
            svg.style.opacity = "1";
            sparklePath.setAttribute("filter", "url(#sparkle-glow)");
        });

        svg.addEventListener('mouseleave', () => {
            svg.style.opacity = "0.8";
            sparklePath.removeAttribute("filter");
        });

        // Add hover popup functionality with shared state management
        let hoverTimeout;
        let hidePopupTimeout;
        let popup = null;
        const hoverState = {
            isHoveringSparkle: false,
            isHoveringPopup: false
        };

        const showPopup = () => {
            clearTimeout(hidePopupTimeout);
            if (popup) return; // Don't create a new popup if one is already visible
            hoverTimeout = setTimeout(() => {
                popup = createModeSelectionPopup(svg, hoverState);
            }, 300);
        };

        const hidePopup = () => {
            clearTimeout(hoverTimeout);
            window.threadlyHideTimeout = setTimeout(() => {
                // Only hide if not hovering over either sparkle or popup
                if (!hoverState.isHoveringSparkle && !hoverState.isHoveringPopup && popup) {
                    if (popup.classList.contains('growing')) {
                        popup.classList.remove('growing');
                        popup.classList.add('shrinking');
                        setTimeout(() => {
                            if (popup) popup.remove();
                            popup = null;
                        }, 600);
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

        // Add click handler
        svg.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            console.log('Threadly: Sparkle clicked!');
            
            // If popup is visible, remove it with shrinking animation
            if (popup) {
                if (popup.classList.contains('growing')) {
                    popup.classList.remove('growing');
                    popup.classList.add('shrinking');
                    setTimeout(() => {
                        popup.remove();
                        popup = null;
                    }, 600);
                } else {
                    popup.remove();
                    popup = null;
                }
            }
            
            // Also remove any existing popups with shrinking animation
            const existingPopups = document.querySelectorAll('.pill-popup');
            existingPopups.forEach(popup => {
                if (popup.classList.contains('growing')) {
                    popup.classList.remove('growing');
                    popup.classList.add('shrinking');
                    setTimeout(() => popup.remove(), 600);
                } else {
                    popup.remove();
                }
            });
            
            handleSparkleClick();
        });

        return svg;
    }

    // Create mode selection popup
    function createModeSelectionPopup(sparkleElement, hoverState = {}) {
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
        contentContainer.style.height = '32px';
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

        // Reset any existing transitions
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
            // Clear any existing hide timeout
            if (window.threadlyHideTimeout) {
                clearTimeout(window.threadlyHideTimeout);
            }
        });
        
        popup.addEventListener('mouseleave', () => {
            hoverState.isHoveringPopup = false;
            // Only hide if not hovering over sparkle either
            if (!hoverState.isHoveringSparkle) {
                window.threadlyHideTimeout = setTimeout(() => {
                    if (!hoverState.isHoveringSparkle && !hoverState.isHoveringPopup && popup) {
                        popup.classList.remove('growing');
                        popup.classList.add('shrinking');
                        setTimeout(() => {
                            if (popup) popup.remove();
                            popup = null;
                        }, 600);
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

        // Visual feedback
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
                }
            }
        } catch (error) {
            console.error('Threadly: Error processing prompt:', error);
            
            // Handle extension context invalidation specifically
            if (error.message.includes('Extension context invalidated')) {
                // Show a user-friendly notification
                showContextInvalidatedNotification();
            }
        } finally {
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

    // Handle sparkle click functionality with prompt refine feature
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
                    const promptRefiner = new window.PromptRefiner();
                    await promptRefiner.initialize();
                    
                    console.log('Threadly: Sending prompt for refinement...');
                    const rawRefinedPrompt = await promptRefiner.refinePrompt(currentText, 'claude');
                    
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
                    
                    // Trigger multiple events to ensure Claude detects the change
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
                            platform: 'claude', 
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
                
                // Handle extension context invalidation specifically
                if (error.message.includes('Extension context invalidated')) {
                    // Show a user-friendly notification
                    showContextInvalidatedNotification();
                } else {
                    // Dispatch error event for other errors
                    window.dispatchEvent(new CustomEvent('threadly-prompt-refine-error', {
                        detail: { 
                            platform: 'claude', 
                            error: error.message,
                            originalText: currentText
                        }
                    }));
                }
                
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
                platform: 'claude', 
                action: 'prompt-refine'
            }
        }));
    }
    
    // Clean up refined prompt to remove XML tags and unnecessary formatting
    function cleanRefinedPrompt(rawText) {
        let cleaned = rawText.trim();
        
        console.log('Threadly: Raw refined text:', cleaned);
        
        // Remove XML/HTML tags (more comprehensive)
        cleaned = cleaned.replace(/<[^>]*>/g, '');
        cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');
        
        // Remove XML-like patterns and content indicators
        cleaned = cleaned.replace(/\[xml[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[content[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[refined[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[response[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[instruction[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[context[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[task[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[example[^\]]*\]/gi, '');
        
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
        cleaned = cleaned.replace(/^instruction[:\-\s]*/gi, '');
        cleaned = cleaned.replace(/^context[:\-\s]*/gi, '');
        cleaned = cleaned.replace(/^task[:\-\s]*/gi, '');
        
        // Remove brackets and parentheses content that looks like metadata
        cleaned = cleaned.replace(/\[[^\]]*(xml|content|response|refined|instruction|context|task|example)[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\([^)]*(xml|content|response|refined|instruction|context|task|example)[^)]*\)/gi, '');
        
        // Remove patterns like "xml text, text, xml" or similar
        cleaned = cleaned.replace(/\b(xml\s+)?text\s*,\s*text\s*,\s*(xml\s+)?/gi, '');
        cleaned = cleaned.replace(/\b(xml\s+)?content\s*,\s*content\s*,\s*(xml\s+)?/gi, '');
        cleaned = cleaned.replace(/\b(xml\s+)?response\s*,\s*response\s*,\s*(xml\s+)?/gi, '');
        
        // Remove extra whitespace and normalize
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        // Remove quotes if the entire text is wrapped in them
        if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
            (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
            cleaned = cleaned.slice(1, -1).trim();
        }
        
        // Remove trailing metadata-like text
        cleaned = cleaned.replace(/\s*\[.*(xml|content|response|refined|instruction|context|task|example).*\]\s*$/gi, '');
        
        // Final cleanup
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        // Ensure proper sentence structure
        if (cleaned && !cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
            cleaned += '.';
        }
        
        console.log('Threadly: Cleaned refined text:', cleaned);
        
        return cleaned;
    }
    
    // Start smooth glow morph breathe animation
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
    
    // Stop glow animation smoothly by completing current cycle
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

    // Debug function to help find the model selector
    function debugFindModelSelector() {
        console.log("=== Threadly: DEBUGGING MODEL SELECTOR SEARCH ===");
        
        // Test different selectors for the model dropdown/button
        const selectors = [
            'button > div[class*="font-claude-response"]',
            '[id^="radix-"] button',
            'button[class*="flex"][class*="items-center"]',
            'button div[class*="font-claude-response"]'
        ];
        
        selectors.forEach(selector => {
            const element = document.querySelector(selector);
            console.log(`Selector "${selector}":`, element);
        });
        
        // Find buttons containing "Sonnet" or "Claude"
        const modelButton = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent.includes('Sonnet') || btn.textContent.includes('Claude')
        );
        console.log("Model button found:", modelButton);
        
        return modelButton;
    }

    // Main function to insert the sparkle icon in the input area
    async function insertSparkleIcon() {
        try {
            console.log('Threadly: Adding sparkle icon to input area...');
            
            // Add popup styles first
            addPopupStyles();
            
            // Check if sparkle already exists - more thorough check
            const existingSparkle = document.querySelector('[data-threadly-sparkle="true"]');
            if (existingSparkle) {
                console.log('Threadly: Sparkle icon already exists, removing duplicates');
                // Remove any existing sparkles to prevent duplicates
                document.querySelectorAll('[data-threadly-sparkle="true"]').forEach(el => el.remove());
            }
            
            // Find the input area container based on your provided selector
            let inputContainer = null;
            
            // Try the specific selector you provided first
            const specificSelector = 'div.flex.gap-2\\.5.w-full.items-center';
            inputContainer = document.querySelector(specificSelector);
            
            if (inputContainer) {
                console.log('Threadly: Found input container with specific selector');
            } else {
                // Fallback selectors for the input area
                const fallbackSelectors = [
                    'div.flex.gap-2\\.5.w-full.items-center',
                    'div[class*="flex"][class*="gap-2"][class*="items-center"]',
                    'div.flex.gap-2\\.5',
                    '[data-testid="composer"] div.flex',
                    '.composer div.flex'
                ];
                
                for (const selector of fallbackSelectors) {
                    inputContainer = document.querySelector(selector);
                    if (inputContainer) {
                        console.log(`Threadly: Found input container with: ${selector}`);
                        break;
                    }
                }
            }
            
            if (!inputContainer) {
                // Last resort: look for any flex container with gap
                inputContainer = document.querySelector('div[class*="flex"][class*="gap"]');
                if (inputContainer) {
                    console.log('Threadly: Found fallback flex container');
                }
            }
            
            if (!inputContainer) {
                throw new Error("Could not find input area container");
            }
            
            // Create the sparkle icon
            const sparkleIcon = createSparkleIcon();
            
            // Position the sparkle icon inline in the input area (moved right)
            sparkleIcon.style.marginLeft = '6px';
            sparkleIcon.style.marginRight = '1px';
            sparkleIcon.style.display = 'inline-flex';
            sparkleIcon.style.alignItems = 'center';
            sparkleIcon.style.justifyContent = 'center';
            
            // Find the model selector button to position sparkle just before it
            let modelSelector = null;
            const children = Array.from(inputContainer.children);
            
            // Look for the model selector button (should be around 3rd or 4th position)
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child.tagName === 'BUTTON' && 
                    (child.textContent.includes('Sonnet') || 
                     child.textContent.includes('Claude') ||
                     child.textContent.includes('Haiku') ||
                     child.textContent.includes('Opus'))) {
                    modelSelector = child;
                    console.log(`Threadly: Found model selector at position ${i}`);
                    break;
                }
            }
            
            // Insert the sparkle icon one position before the model selector
            if (modelSelector) {
                // Find the element that comes before the model selector
                const modelIndex = Array.from(inputContainer.children).indexOf(modelSelector);
                if (modelIndex > 0) {
                    // Insert before the element that's before the model selector
                    inputContainer.insertBefore(sparkleIcon, inputContainer.children[modelIndex - 1]);
                    console.log("Threadly: Inserted sparkle one position before model selector");
                } else {
                    // If model selector is first, insert at the very beginning
                    inputContainer.insertBefore(sparkleIcon, modelSelector);
                    console.log("Threadly: Inserted sparkle at beginning (model selector was first)");
                }
            } else {
                // Fallback: insert at 2nd position if no model selector found
                if (children.length >= 1) {
                    inputContainer.insertBefore(sparkleIcon, children[1]);
                    console.log("Threadly: Inserted sparkle at 2nd position");
                } else {
                    inputContainer.appendChild(sparkleIcon);
                    console.log("Threadly: Inserted sparkle at end as fallback");
                }
            }
            
            console.log("Threadly: Successfully added sparkle icon to input area");
            
            // Dispatch success event
            window.dispatchEvent(new CustomEvent('threadly-sparkle-inserted', {
                detail: { platform: 'claude', success: true }
            }));
            
        } catch (error) {
            console.error("Threadly: Error inserting sparkle icon:", error);
            
            // Dispatch error event
            window.dispatchEvent(new CustomEvent('threadly-sparkle-error', {
                detail: { platform: 'claude', error: error.message }
            }));
        }
    }

    // Check if we're on Claude's website
    function isClaudeWebsite() {
        return window.location.hostname === 'claude.ai' || 
               window.location.hostname.includes('claude');
    }

    // Initialize when page loads
    function initialize() {
        console.log('Threadly: Sparkle Extension initializing...');
        
        // Wait for Claude's interface to load
        setTimeout(() => {
            insertSparkleIcon();
        }, 3000);
        
        // Watch for dynamic content changes (in case Claude rebuilds the interface)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if we need to re-add the sparkle
                    setTimeout(() => {
                        const existingSparkles = document.querySelectorAll('[data-threadly-sparkle="true"]');
                        if (existingSparkles.length === 0) {
                            console.log('Threadly: Re-adding sparkle icon after DOM change');
                            insertSparkleIcon();
                        } else if (existingSparkles.length > 1) {
                            console.log('Threadly: Removing duplicate sparkles');
                            // Keep only the first one, remove the rest
                            for (let i = 1; i < existingSparkles.length; i++) {
                                existingSparkles[i].remove();
                            }
                        }
                    }, 1000);
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Function to show context invalidated notification
    function showContextInvalidatedNotification() {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            max-width: 300px;
            cursor: pointer;
            animation: slideInRight 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">🔄 Threadly Extension Updated</div>
            <div style="font-size: 13px; opacity: 0.9;">Please refresh the page to continue using the refine feature.</div>
        `;
        
        // Add animation keyframes
        if (!document.getElementById('threadly-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'threadly-notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add click handler to refresh page
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                window.location.reload();
            }, 300);
        });
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 10000);
        
        document.body.appendChild(notification);
    }

    // Initialize only if on Claude's website
    if (isClaudeWebsite()) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
        } else {
            initialize();
        }
    }

    // Export for testing and debugging
    window.ThreadlyClaudeSparkle = {
        insertSparkleIcon,
        createSparkleIcon,
        handleSparkleClick,
        debugFindModelSelector
    };

})();