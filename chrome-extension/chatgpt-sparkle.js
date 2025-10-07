/**
 * ChatGPT Sparkle Button Content Script
 * Adds a sparkle button with the same SVG, size, and animation as Claude version
 * next to the mic button in ChatGPT's text input bar
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

    // Global variables for popup management
    let globalHidePopupTimeout = null;
    let globalHoverTimeout = null;

    // Create the sparkle icon with glow effect (same as Claude version)
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

        // Add hover popup functionality
        let popup = null;
        const hoverState = {
            isHoveringSparkle: false,
            isHoveringPopup: false
        };

        const showPopup = () => {
            clearTimeout(globalHidePopupTimeout);
            if (popup) return; // Don't create a new popup if one is already visible
            globalHoverTimeout = setTimeout(() => {
                popup = createModeSelectionPopup(svg, hoverState);
            }, 300);
        };

        const hidePopup = () => {
            clearTimeout(globalHoverTimeout);
            globalHidePopupTimeout = setTimeout(() => {
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
            console.log('Threadly: ChatGPT Sparkle clicked!');
            
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
        
        // Also add a direct click handler to the SVG element
        svg.onclick = function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log('Threadly: Direct onclick handler triggered!');
            
            // If popup is visible, remove it and proceed with autonomous mode
            if (popup) {
                popup.remove();
                popup = null;
            }
            
            handleSparkleClick();
        };

        // Set proper aria-label for tooltip
        svg.setAttribute('aria-label', 'Refine prompt with AI');
        svg.setAttribute('title', 'Refine prompt with AI');

        return svg;
    }

    // Create mode selection popup
    function createModeSelectionPopup(sparkleElement, hoverState = {}) {
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
        const existingPopups = document.querySelectorAll('.pill-popup');
        existingPopups.forEach(popup => {
            console.log('Threadly: Removing existing pill popup before creating new one');
            popup.remove();
        });

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

        // Initialize timeout tracking
        if (!window.threadlyPillTimeouts) {
            window.threadlyPillTimeouts = [];
        }

        // Start the pill emergence animation
        const emergenceTimeout = setTimeout(() => {
            popup.classList.add('growing');
            popup.style.pointerEvents = 'all';
            
            // Show content after animation starts
            const contentTimeout = setTimeout(() => {
                contentContainer.style.opacity = '1';
            }, 400);
            window.threadlyPillTimeouts.push(contentTimeout);
        }, 10);
        window.threadlyPillTimeouts.push(emergenceTimeout);

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
            clearTimeout(globalHidePopupTimeout);
        });
        
        popup.addEventListener('mouseleave', () => {
            hoverState.isHoveringPopup = false;
            // Only hide if not hovering over sparkle either
            if (!hoverState.isHoveringSparkle) {
                globalHidePopupTimeout = setTimeout(() => {
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
        
        // Get current input text using ChatGPT-specific selectors
        let textArea = document.querySelector('#prompt-textarea');
        if (!textArea) {
            // Fallback to other possible selectors
            textArea = document.querySelector('textarea[data-id="root"]') || 
                      document.querySelector('textarea[placeholder*="Message"]') ||
                      document.querySelector('textarea[placeholder*="Send a message"]') ||
                      document.querySelector('textarea');
        }
        
        if (!textArea) {
            console.log('Threadly: No text area found');
            return;
        }

        const currentText = textArea.value || textArea.textContent || textArea.innerText;
        if (!currentText || currentText.trim() === '') {
            console.log('Threadly: No text to process');
            return;
        }
        
        console.log('Threadly: Found text to process:', currentText);

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
                        // CORRECT mode: Only fix spelling and grammar, no other changes
                        refinedPrompt = await promptRefiner.performGrammarCorrection(currentText);
                        break;
                    case 'image':
                        // Use triage AI for image generation
                        refinedPrompt = await promptRefiner.refineImageGenerationPrompt(currentText, platform);
                        break;
                    case 'refine':
                        // Use triage AI for intelligent refinement
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
            console.error('Threadly: Error processing prompt with triage AI:', error);
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

    // Handle sparkle click functionality with prompt refine feature (exact copy from Claude)
    async function handleSparkleClick() {
        console.log('Threadly: Sparkle clicked - prompt refine activated!');
        
        // Get current input text from ChatGPT textarea using specific selector
        const textArea = document.querySelector('#prompt-textarea');
        
        // Textarea detection and fallback logic
        // Use the main textarea or fallback
        const finalTextArea = textArea || document.querySelector('textarea');
        
        if (finalTextArea) {
            const currentText = finalTextArea.value || finalTextArea.textContent || finalTextArea.innerText;
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
                    
                    // Try to initialize with fallback handling
                    try {
                        await promptRefiner.initialize();
                    } catch (initError) {
                        if (initError.message.includes('Extension context invalidated')) {
                            console.warn('Threadly: Extension context invalidated, trying fallback initialization...');
                            const fallbackInitialized = await promptRefiner.initializeWithFallback();
                            if (!fallbackInitialized) {
                                throw initError; // Re-throw if fallback also fails
                            }
                        } else {
                            throw initError; // Re-throw other errors
                        }
                    }
                    
                    console.log('Threadly: Sending prompt for refinement...');
                    const rawRefinedPrompt = await promptRefiner.refinePrompt(currentText, 'chatgpt');
                    
                    // Clean up the refined prompt to remove XML tags and unnecessary formatting
                    const refinedPrompt = cleanRefinedPrompt(rawRefinedPrompt);
                    
                    // Store original text for undo detection
                    const originalText = currentText;
                    
                    // Replace the text with refined version
                    console.log('Threadly: Replacing text with refined prompt:', refinedPrompt);
                    
                    if (finalTextArea.tagName === 'TEXTAREA') {
                        finalTextArea.value = refinedPrompt;
                        console.log('Threadly: Updated textarea value');
                    } else if (finalTextArea.contentEditable === 'true') {
                        finalTextArea.textContent = refinedPrompt;
                        finalTextArea.innerText = refinedPrompt;
                        console.log('Threadly: Updated contenteditable text');
                    } else {
                        finalTextArea.textContent = refinedPrompt;
                        console.log('Threadly: Updated text content');
                    }
                    
                    // Trigger multiple events to ensure ChatGPT detects the change
                    finalTextArea.dispatchEvent(new Event('input', { bubbles: true }));
                    finalTextArea.dispatchEvent(new Event('change', { bubbles: true }));
                    finalTextArea.dispatchEvent(new Event('keyup', { bubbles: true }));
                    
                    // Force focus back to the text area
                    finalTextArea.focus();
                    
                    console.log('Threadly: Text replacement completed');
                    
                    
                    console.log('Threadly: Prompt refined successfully');
                    
                    // Dispatch success event
                    window.dispatchEvent(new CustomEvent('threadly-prompt-refined', {
                        detail: { 
                            platform: 'chatgpt', 
                            originalText: currentText,
                            refinedText: refinedPrompt
                        }
                    }));
                    // Attach undo feedback detection on the same input
                    try {
                        const attachUndoListener = (el, refiner) => {
                            if (!el || !refiner) return;
                            let undoDebounce;
                            const handler = async () => {
                                clearTimeout(undoDebounce);
                                undoDebounce = setTimeout(async () => {
                                    const txt = el.value || el.textContent || el.innerText || '';
                                    try { await refiner.detectUndoAndCollectFeedback(txt); } catch (e) { /* noop */ }
                                }, 150);
                            };
                            el.removeEventListener('input', handler);
                            el.addEventListener('input', handler);
                        };
                        attachUndoListener(finalTextArea, promptRefiner);
                    } catch (_) {}
                    
                } else {
                    console.error('Threadly: PromptRefiner class not available');
                    throw new Error('PromptRefiner not available');
                }
                
            } catch (error) {
                console.error('Threadly: Error refining prompt:', error);
                
                // Show user-friendly error message
                if (error.message.includes('Extension context invalidated')) {
                    alert('Threadly: Extension context invalidated. Please refresh the page to continue using Threadly.');
                } else if (error.message.includes('API key not found')) {
                    // Show tooltip instead of alert
                    if (window.ThreadlyTooltip && window.ThreadlyTooltip.showApiKeyTooltip) {
                        window.ThreadlyTooltip.showApiKeyTooltip(sparkleIcon);
                    } else {
                        alert('Threadly: Please set your Gemini API key in the extension popup first.');
                    }
                } else {
                    alert('Threadly: Error refining prompt. Please try again.');
                }
                
                // Dispatch error event
                window.dispatchEvent(new CustomEvent('threadly-prompt-refine-error', {
                    detail: { 
                        platform: 'chatgpt', 
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
                platform: 'chatgpt', 
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

// Main function to insert the sparkle icon with a wrapper
async function insertSparkleIcon() {
    try {
        console.log('Threadly: Starting insertSparkleIcon...');
        
        // Use a unique attribute for the wrapper to prevent duplicates
        const existingWrapper = document.querySelector('[data-threadly-sparkle-wrapper="true"]');
        if (existingWrapper) {
            // Check if the wrapper actually contains a sparkle icon
            const sparkleIcon = existingWrapper.querySelector('[data-threadly-sparkle="true"]');
            if (sparkleIcon) {
                console.log('Threadly: Sparkle wrapper and icon already exist, skipping...');
                return; // Already exists with icon, do nothing
            } else {
                console.log('Threadly: Sparkle wrapper exists but icon is missing, removing wrapper and recreating...');
                existingWrapper.remove(); // Remove empty wrapper so we can recreate properly
            }
        }

        // Updated selectors to match current ChatGPT DOM structure
        const micSelectors = [
            'button[aria-label="Dictate button"]', // Exact match for current ChatGPT
            'button.composer-btn[aria-label*="dictate"]',
            'button[aria-label*="dictate"]',
            'button[title*="dictate"]',
            'button[aria-label*="mic"]',
            'button[title*="mic"]',
        ];
        
        let micButton = null;
        for (const selector of micSelectors) {
            micButton = document.querySelector(selector);
            if (micButton) {
                console.log(`Threadly: Found mic button with selector: ${selector}`);
                break;
            }
        }

        let parentContainer;
        if (!micButton) {
            console.log('Threadly: Mic button not found with selectors, trying fallback...');
            // If specific selectors fail, try to find the trailing area container
            const trailingContainer = document.querySelector('[grid-area\\:trailing]');
            if (trailingContainer) {
                console.log('Threadly: Found trailing container');
                // Look for the ms-auto container within trailing
                const msAutoContainer = trailingContainer.querySelector('.ms-auto');
                if (msAutoContainer) {
                    console.log('Threadly: Found ms-auto container');
                    parentContainer = msAutoContainer;
                    // Insert as first child in this case
                    micButton = msAutoContainer.firstChild;
                } else {
                    parentContainer = trailingContainer;
                    micButton = trailingContainer.firstChild;
                }
            } else {
                // Last resort: find any composer button area
                const composerArea = document.querySelector('.flex.items-center.gap-2');
                if (composerArea) {
                    console.log('Threadly: Found composer area as fallback');
                    parentContainer = composerArea;
                    micButton = composerArea.firstChild;
                } else {
                    throw new Error("Could not find a suitable insertion point for the sparkle button.");
                }
            }
        } else {
            parentContainer = micButton.parentElement;
        }
        
        if (!parentContainer) {
            throw new Error("Could not find the parent container of the mic button.");
        }

        console.log('Threadly: Parent container found:', parentContainer);

        // Create the sparkle icon
        const sparkleIcon = createSparkleIcon();

        // *** THE FIX: Create the dedicated wrapper div ***
        const sparkleWrapper = document.createElement('div');
        sparkleWrapper.setAttribute('data-threadly-sparkle-wrapper', 'true');
        sparkleWrapper.style.display = 'flex';
        sparkleWrapper.style.alignItems = 'center';
        sparkleWrapper.style.justifyContent = 'center';
        // This margin creates the necessary space to avoid tooltip conflicts
        sparkleWrapper.style.marginRight = '8px';
        sparkleWrapper.appendChild(sparkleIcon);

        // Insert the wrapper before the mic button (or its container)
        parentContainer.insertBefore(sparkleWrapper, micButton);

        // Ensure the parent container uses flexbox for proper alignment
        parentContainer.style.display = 'flex';
        parentContainer.style.alignItems = 'center';

        console.log("Threadly: Successfully added sparkle icon with isolated wrapper.");

    } catch (error) {
        console.error("Threadly: Error inserting sparkle icon:", error);
    }
}

    // Check if we're on ChatGPT's website
    function isChatGPTWebsite() {
        return window.location.hostname === 'chat.openai.com' || 
               window.location.hostname === 'chatgpt.com' ||
               window.location.hostname.includes('openai.com');
    }

    // Initialize when page loads
    function initialize() {
        console.log('Threadly: ChatGPT Sparkle Extension initializing...');
        
        // Wait for ChatGPT's interface to load
        setTimeout(() => {
            insertSparkleIcon();
        }, 3000);
        
            // Also check periodically to ensure sparkle stays in place and is positioned correctly
            setInterval(() => {
                const existingWrappers = document.querySelectorAll('[data-threadly-sparkle-wrapper="true"]');
                if (existingWrappers.length === 0) {
                    console.log('Threadly: Periodic check - re-adding missing sparkle icon');
                    insertSparkleIcon();
                } else if (existingWrappers.length > 1) {
                    console.log('Threadly: Periodic check - removing duplicate sparkles');
                    // Keep only the first one, remove the rest
                    for (let i = 1; i < existingWrappers.length; i++) {
                        existingWrappers[i].remove();
                    }
                } else {
                    // Check if the wrapper contains a sparkle icon
                    const wrapper = existingWrappers[0];
                    const sparkleIcon = wrapper.querySelector('[data-threadly-sparkle="true"]');
                    if (!sparkleIcon) {
                        console.log('Threadly: Periodic check - wrapper exists but sparkle icon missing, recreating...');
                        wrapper.remove();
                        insertSparkleIcon();
                    } else {
                        // Check if sparkle is in the correct position (right before mic button)
                        const micButton = document.querySelector('button[aria-label*="dictate"], button[title*="dictate"]');
                        if (micButton && micButton.previousElementSibling !== wrapper) {
                            console.log('Threadly: Periodic check - repositioning sparkle before mic button');
                            // Remove and re-insert to ensure correct position
                            wrapper.remove();
                            insertSparkleIcon();
                        }
                    }
                }
            }, 5000); // Check every 5 seconds
        
        // Add input listener to textarea to ensure sparkle positioning when typing
        const addTextareaListener = () => {
            const textarea = document.querySelector('#prompt-textarea, textarea[data-id="root"], textarea[placeholder*="Message"], textarea[placeholder*="Send a message"]');
            if (textarea) {
                textarea.addEventListener('input', () => {
                    // Check and fix sparkle positioning after typing
                    setTimeout(() => {
                        const existingWrappers = document.querySelectorAll('[data-threadly-sparkle-wrapper="true"]');
                        if (existingWrappers.length === 0) {
                            console.log('Threadly: Re-adding missing sparkle after textarea input');
                            insertSparkleIcon();
                        } else if (existingWrappers.length > 1) {
                            console.log('Threadly: Removing duplicate sparkles after textarea input');
                            // Keep only the first one, remove the rest
                            for (let i = 1; i < existingWrappers.length; i++) {
                                existingWrappers[i].remove();
                            }
                        } else {
                            // Check if the wrapper contains a sparkle icon
                            const wrapper = existingWrappers[0];
                            const sparkleIcon = wrapper.querySelector('[data-threadly-sparkle="true"]');
                            if (!sparkleIcon) {
                                console.log('Threadly: Wrapper exists but sparkle icon missing after textarea input, recreating...');
                                wrapper.remove();
                                insertSparkleIcon();
                            } else {
                                // Check if sparkle is in the correct position (right before mic button)
                                const micButton = document.querySelector('button[aria-label*="dictate"], button[title*="dictate"]');
                                if (micButton && micButton.previousElementSibling !== wrapper) {
                                    console.log('Threadly: Repositioning sparkle before mic button after textarea input');
                                    // Remove and re-insert to ensure correct position
                                    wrapper.remove();
                                    insertSparkleIcon();
                                }
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
                        const existingWrappers = document.querySelectorAll('[data-threadly-sparkle-wrapper="true"]');
                        if (existingWrappers.length === 0) {
                            console.log('Threadly: Re-adding missing sparkle icon after DOM change');
                            insertSparkleIcon();
                        } else if (existingWrappers.length > 1) {
                            console.log('Threadly: Removing duplicate sparkles after DOM change');
                            // Keep only the first one, remove the rest
                            for (let i = 1; i < existingWrappers.length; i++) {
                                existingWrappers[i].remove();
                            }
                        } else {
                            // Check if the wrapper contains a sparkle icon
                            const wrapper = existingWrappers[0];
                            const sparkleIcon = wrapper.querySelector('[data-threadly-sparkle="true"]');
                            if (!sparkleIcon) {
                                console.log('Threadly: Wrapper exists but sparkle icon missing after DOM change, recreating...');
                                wrapper.remove();
                                insertSparkleIcon();
                            } else {
                                // Check if sparkle is in the correct position (right before mic button)
                                const micButton = document.querySelector('button[aria-label*="dictate"], button[title*="dictate"]');
                                if (micButton && micButton.previousElementSibling !== wrapper) {
                                    console.log('Threadly: Repositioning sparkle before mic button after DOM change');
                                    // Remove and re-insert to ensure correct position
                                    wrapper.remove();
                                    insertSparkleIcon();
                                }
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

    // Initialize only if on ChatGPT's website
    if (isChatGPTWebsite()) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
        } else {
            initialize();
        }
    }

        // Global cleanup function for pill popups
        function cleanupPillPopups() {
            const pillPopups = document.querySelectorAll('.pill-popup');
            pillPopups.forEach(popup => {
                console.log('Threadly: Cleaning up pill popup');
                popup.remove();
            });
            
            // Clear timeouts
            if (window.threadlyPillTimeouts) {
                window.threadlyPillTimeouts.forEach(timeout => clearTimeout(timeout));
                window.threadlyPillTimeouts = [];
            }
        }

        // Make cleanup function globally accessible
        window.threadlyCleanupPillPopups = cleanupPillPopups;

        // Export for testing and debugging
        window.ThreadlyChatGPTSparkle = {
            insertSparkleIcon,
            createSparkleIcon,
            handleSparkleClick,
            isChatGPTWebsite,
            cleanupPillPopups
        };
        
        // Also make handleSparkleClick globally accessible for testing
        window.handleSparkleClick = handleSparkleClick;

})();