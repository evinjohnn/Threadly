/**
 * Perplexity AI Sparkle Button Content Script
 * Adds a sparkle button before the submit button in Perplexity's input bar
 */

(function() {
    'use strict';

    console.log('Threadly: Perplexity sparkle script loaded');

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

    // Create the sparkle icon with glow effect (matching Claude's style)
    function createSparkleIcon() {
        // Create the main SVG container (1.5x bigger like Claude)
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

        // Add hover effects
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

        // Add click handler
        svg.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            console.log('Threadly: Sparkle clicked!');
            
            // If popup is visible, remove it and proceed with autonomous mode
            if (popup) {
                popup.remove();
                popup = null;
                hoverState.isHoveringPopup = false;
            }
            
            handleSparkleClick();
        });

        // Set proper aria-label for tooltip (matching Claude's style)
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

                // Replace text in the input using aggressive approach
                if (refinedPrompt) {
                    console.log('Threadly: Replacing text with aggressive clearing approach');
                    
                    // Check if this is a Lexical editor (Perplexity uses Lexical)
                    const isLexicalEditor = textArea.closest('div[contenteditable="true"][role="textbox"]') || 
                                          textArea.getAttribute('data-lexical-editor') === 'true' ||
                                          textArea.closest('[data-lexical-editor="true"]');
                    
                    if (isLexicalEditor) {
                        console.log('Threadly: Detected Lexical editor in mode selection, using aggressive clearing');
                        
                        // Find the true Lexical root node
                        let editorRoot = textArea.closest('div[contenteditable="true"][role="textbox"]') || 
                                       textArea.closest('[data-lexical-editor="true"]') ||
                                       textArea;
                        
                        if (editorRoot) {
                            // Focus editor
                            editorRoot.focus();
                            
                            // AGGRESSIVE CLEARING
                            editorRoot.textContent = '';
                            editorRoot.innerText = '';
                            editorRoot.innerHTML = '';
                            
                            // Clear React/Lexical internal state
                            if (editorRoot._valueTracker) {
                                editorRoot._valueTracker.setValue('');
                            }
                            if (editorRoot.__lexicalTextContent !== undefined) {
                                editorRoot.__lexicalTextContent = '';
                            }
                            
                            // execCommand clearing
                            document.execCommand('selectAll', false, null);
                            document.execCommand('delete', false, null);
                            
                            // Remove all child nodes
                            while (editorRoot.firstChild) {
                                editorRoot.removeChild(editorRoot.firstChild);
                            }
                            
                            // Wait and set new text
                            setTimeout(() => {
                                document.execCommand('insertText', false, refinedPrompt);
                                editorRoot.textContent = refinedPrompt;
                                editorRoot.innerText = refinedPrompt;
                                
                                // Update React/Lexical internal state
                                if (editorRoot._valueTracker) {
                                    editorRoot._valueTracker.setValue(refinedPrompt);
                                }
                                if (editorRoot.__lexicalTextContent !== undefined) {
                                    editorRoot.__lexicalTextContent = refinedPrompt;
                                }
                                
                                // Fire events
                                const events = ['input', 'change', 'keyup', 'keydown', 'compositionend', 'textInput'];
                                events.forEach(type => {
                                    editorRoot.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
                                });
                            }, 50);
                        }
                    } else if (textArea.tagName === 'TEXTAREA') {
                        // Clear first, then set new value
                        textArea.value = '';
                        textArea.value = refinedPrompt;
                    } else {
                        // Clear first, then set new content
                        textArea.textContent = '';
                        textArea.innerText = '';
                        textArea.innerHTML = '';
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

    // Handle sparkle click functionality with prompt refine feature
    async function handleSparkleClick() {
        console.log('Threadly: Sparkle clicked - prompt refine activated!');
        
        let textArea = null;
        let currentText = '';
        
        const selectors = [
            'div[contenteditable="true"][role="textbox"]',
            'textarea[placeholder*="Ask anything"]',
            'textarea'
        ];
        
        for (const selector of selectors) {
            textArea = document.querySelector(selector);
            if (textArea) {
                currentText = textArea.value || textArea.textContent || textArea.innerText || '';
                if (currentText.trim()) break;
            }
        }
        
        if (textArea && currentText.trim()) {
            const sparkleIcon = document.querySelector('[data-threadly-sparkle="true"]');
            if (sparkleIcon) {
                startClickAnimationSequence(sparkleIcon);
            }
            
            try {
                if (window.PromptRefiner) {
                    const promptRefiner = new window.PromptRefiner();
                    await promptRefiner.initialize();
                    
                    console.log('Threadly: Sending prompt for refinement...');
                    const rawRefinedPrompt = await promptRefiner.refinePrompt(currentText, 'perplexity');
                    const refinedPrompt = cleanRefinedPrompt(rawRefinedPrompt);
                    
                    console.log('Threadly: Replacing text by simulating user typing:', refinedPrompt);

                    const editorRoot = textArea.closest('div[contenteditable="true"][role="textbox"]') || textArea;
                    
                    // =================================================================================
                    // THE DEFINITIVE FIX: SIMULATE A REAL USER TYPING
                    // =================================================================================

                    // 1. Focus the editor to prepare it for input.
                    editorRoot.focus();
                    
                    // 2. Select all the existing text.
                    document.execCommand('selectAll', false, null);

                    // 3. Dispatch a 'beforeinput' event for deletion. This is crucial for frameworks like React.
                    const beforeInputDeleteEvent = new InputEvent('beforeinput', {
                        inputType: 'deleteContentBackward',
                        bubbles: true,
                        cancelable: true
                    });
                    editorRoot.dispatchEvent(beforeInputDeleteEvent);
                    
                    // 4. Clear the selected text by simulating a backspace key press.
                    document.execCommand('delete', false, null);

                    // 5. Dispatch a final 'input' event for the deletion to notify the framework.
                    editorRoot.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

                    // 6. Now, simulate typing the new text.
                    const beforeInputInsertEvent = new InputEvent('beforeinput', {
                        inputType: 'insertText',
                        data: refinedPrompt,
                        bubbles: true,
                        cancelable: true
                    });
                    editorRoot.dispatchEvent(beforeInputInsertEvent);
                    
                    document.execCommand('insertText', false, refinedPrompt);
                    
                    // 7. Dispatch the final 'input' event to confirm the new text.
                    editorRoot.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

                    console.log('Threadly: Text replacement by simulation completed.');
                    console.log('Threadly: Prompt refined successfully');
                    
                } else {
                    console.error('Threadly: PromptRefiner class not available');
                    throw new Error('PromptRefiner not available');
                }
                
            } catch (error) {
                console.error('Threadly: Error refining prompt:', error);
                window.dispatchEvent(new CustomEvent('threadly-prompt-refine-error', {
                    detail: { platform: 'perplexity', error: error.message, originalText: currentText }
                }));
            } finally {
                const sparkleIcon = document.querySelector('[data-threadly-sparkle="true"]');
                if (sparkleIcon) {
                    stopClickAnimationSequence(sparkleIcon);
                }
            }
        } else {
            console.log('Threadly: No text input found');
        }
        
        window.dispatchEvent(new CustomEvent('threadly-sparkle-clicked', {
            detail: { platform: 'perplexity', action: 'prompt-refine' }
        }));
    }
    
    // Clean up refined prompt to remove XML tags and unnecessary formatting
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
    
    // Start smooth glow morph breathe animation (matching Claude's style)
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
    
    // Stop glow animation smoothly by completing current cycle (matching Claude's style)
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

    // Main function to insert the sparkle icon before the submit button
    async function insertSparkleIcon() {
        try {
            // Check if sparkle already exists
            const existingSparkle = document.querySelector('[data-threadly-sparkle="true"]');
            if (existingSparkle) {
                document.querySelectorAll('[data-threadly-sparkle="true"]').forEach(el => el.remove());
            }
            
            // Find the target button (submit button for chat page, voice mode button for loading page)
            const submitButton = document.querySelector('button[data-testid="submit-button"]');
            const voiceModeButton = document.querySelector('button[aria-label="Voice mode"]');
            
            const targetButton = submitButton || voiceModeButton;
            
            if (!targetButton) {
                throw new Error("Could not find target button (submit or voice mode)");
            }
            
            // Create the sparkle icon
            const sparkleIcon = createSparkleIcon();
            
            // Create a wrapper span to match other buttons' structure
            const sparkleWrapper = document.createElement('span');
            sparkleWrapper.appendChild(sparkleIcon);
            
            // Style the sparkle icon to match Claude's design
            sparkleIcon.style.display = 'inline-flex';
            sparkleIcon.style.alignItems = 'center';
            sparkleIcon.style.justifyContent = 'center';
            sparkleIcon.style.verticalAlign = 'middle';
            sparkleIcon.style.position = 'relative';
            sparkleIcon.style.top = '0';
            sparkleIcon.style.marginRight = '6px';
            sparkleIcon.style.marginLeft = '1px';
            sparkleIcon.style.height = '36px';
            sparkleIcon.style.width = '36px';
            sparkleIcon.style.flexShrink = '0';
            
            // Style the wrapper to match other button wrappers
            sparkleWrapper.style.display = 'inline-flex';
            sparkleWrapper.style.alignItems = 'center';
            sparkleWrapper.style.marginRight = '0';
            sparkleWrapper.style.marginLeft = '0';
            
            // Multiple positioning attempts to place sparkle on the LEFT side
            let inserted = false;
            
            // Attempt 1: Insert at the very beginning of the main container (LEFTMOST position)
            const mainContainer = targetButton.closest('div[class*="flex"][class*="items-center"][class*="justify-self-end"]');
            if (mainContainer && !inserted) {
                try {
                    mainContainer.insertBefore(sparkleWrapper, mainContainer.firstChild);
                    inserted = true;
                } catch (error) {
                    // Silent fail
                }
            }
            
            // Attempt 2: Insert at the beginning of the button container (LEFT position)
            const buttonContainer = targetButton.closest('.flex.items-center');
            if (buttonContainer && !inserted) {
                try {
                    buttonContainer.insertBefore(sparkleWrapper, buttonContainer.firstChild);
                    inserted = true;
                } catch (error) {
                    // Silent fail
                }
            }
            
            // Attempt 3: Insert before the first child of button container
            if (buttonContainer && !inserted) {
                try {
                    const firstChild = buttonContainer.firstElementChild;
                    if (firstChild) {
                        buttonContainer.insertBefore(sparkleWrapper, firstChild);
                        inserted = true;
                    }
                } catch (error) {
                    // Silent fail
                }
            }
            
            // Attempt 4: Insert before target button wrapper (div.ml-2) - still left of target button
            const targetButtonWrapper = targetButton.closest('div.ml-2');
            if (targetButtonWrapper && !inserted) {
                try {
                    targetButtonWrapper.parentNode.insertBefore(sparkleWrapper, targetButtonWrapper);
                    inserted = true;
                } catch (error) {
                    // Silent fail
                }
            }
            
            // Attempt 5: Insert before target button directly (LEFT of target button)
            if (!inserted) {
                try {
                    targetButton.parentNode.insertBefore(sparkleWrapper, targetButton);
                    inserted = true;
                } catch (error) {
                    // Silent fail
                }
            }
            
            // Last resort: append to body
            if (!inserted) {
                try {
                    document.body.appendChild(sparkleWrapper);
                    inserted = true;
                } catch (error) {
                    console.error('Threadly: All positioning attempts failed:', error);
                }
            }
            
            // Dispatch success event
            window.dispatchEvent(new CustomEvent('threadly-sparkle-inserted', {
                detail: { platform: 'perplexity', success: true }
            }));
            
        } catch (error) {
            console.error("Threadly: Error inserting sparkle icon:", error);
            
            // Dispatch error event
            window.dispatchEvent(new CustomEvent('threadly-sparkle-error', {
                detail: { platform: 'perplexity', error: error.message }
            }));
        }
    }

    // Check if we're on Perplexity's website
    function isPerplexityWebsite() {
        return window.location.hostname === 'perplexity.ai' || 
               window.location.hostname.includes('perplexity.ai');
    }

    // Wait for Perplexity's interface to be ready (handles both loading page and chat page)
    function waitForPerplexityInterface() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 20; // Max 10 seconds (20 * 500ms)
            
            const checkInterface = () => {
                attempts++;
                
                // Check for chat page elements
                const submitButton = document.querySelector('button[data-testid="submit-button"]');
                const textarea = document.querySelector('textarea[placeholder*="Ask anything"], textarea[aria-label*="Ask anything"], textarea[data-testid="search-input"], textarea[placeholder*="Ask"], textarea[aria-label*="Ask"], textarea[placeholder*="Search"], textarea[aria-label*="Search"], div[contenteditable="true"]');
                
                // Check for loading page elements
                const voiceModeButton = document.querySelector('button[aria-label="Voice mode"]');
                const sourcesButton = document.querySelector('button[data-testid="sources-switcher-button"]');
                const modelButton = document.querySelector('button[aria-label="Choose a model"]');
                
                // Interface is ready if we have either:
                // 1. Chat page: submit button + textarea
                // 2. Loading page: voice mode button + sources button + model button
                const isChatPage = submitButton && textarea;
                const isLoadingPage = voiceModeButton && sourcesButton && modelButton;
                
                if (isChatPage || isLoadingPage) {
                    resolve(true);
                } else if (attempts < maxAttempts) {
                    setTimeout(checkInterface, 500);
                } else {
                    // Timeout after max attempts
                    resolve(false);
                }
            };
            
            checkInterface();
        });
    }

    // Global state management
    let isInitialized = false;
    let maintenanceInterval = null;
    let mainObserver = null;
    let textareaListenerAdded = false;

    // Initialize when page loads
    async function initialize() {
        if (isInitialized) {
            return; // Prevent multiple initializations
        }
        
        try {
            // Wait for Perplexity's interface to be ready
            const interfaceReady = await waitForPerplexityInterface();
            
            if (interfaceReady) {
            // Try to insert sparkle immediately
            insertSparkleIcon();
            
                // Set up maintenance interval (less frequent)
                if (!maintenanceInterval) {
                    maintenanceInterval = setInterval(() => {
                const existingSparkles = document.querySelectorAll('[data-threadly-sparkle="true"]');
                if (existingSparkles.length === 0) {
                    insertSparkleIcon();
                        } else if (existingSparkles.length > 1) {
                            // Keep only the first one, remove the rest
                            for (let i = 1; i < existingSparkles.length; i++) {
                                existingSparkles[i].remove();
                            }
                        }
                    }, 10000); // Check every 10 seconds (much less frequent)
                }
                
                // Add textarea listener only once
                if (!textareaListenerAdded) {
                    addTextareaListener();
                    textareaListenerAdded = true;
                }
                
                // Set up main observer only once
                if (!mainObserver) {
                    mainObserver = new MutationObserver((mutations) => {
                        const hasRelevantChanges = mutations.some(mutation => 
                            mutation.type === 'childList' && 
                            mutation.addedNodes.length > 0 &&
                            Array.from(mutation.addedNodes).some(node => 
                                node.nodeType === Node.ELEMENT_NODE && 
                                (node.querySelector && (
                                    node.querySelector('button[data-testid="submit-button"]') ||
                                    node.querySelector('button[aria-label="Voice mode"]') ||
                                    node.querySelector('textarea')
                                ))
                            )
                        );
                        
                        if (hasRelevantChanges) {
                            // Debounced check for sparkle positioning
                            setTimeout(() => {
            const existingSparkles = document.querySelectorAll('[data-threadly-sparkle="true"]');
            if (existingSparkles.length === 0) {
                insertSparkleIcon();
            } else if (existingSparkles.length > 1) {
                // Keep only the first one, remove the rest
                for (let i = 1; i < existingSparkles.length; i++) {
                    existingSparkles[i].remove();
                }
            }
                            }, 2000); // Slower response to avoid repositioning during typing
                        }
                    });
                    
                    mainObserver.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                }
                
                isInitialized = true;
            }
            
        } catch (error) {
            console.error('Threadly: Error waiting for Perplexity interface:', error);
            // Fallback: try to insert anyway
            insertSparkleIcon();
        }
    }
        
        // Add input listener to textarea to ensure sparkle positioning when typing
    function addTextareaListener() {
            const textarea = document.querySelector('textarea[placeholder*="Ask anything"], textarea[aria-label*="Ask anything"], textarea[data-testid="search-input"], textarea[placeholder*="Ask"], textarea[aria-label*="Ask"], textarea[placeholder*="Search"], textarea[aria-label*="Search"], div[contenteditable="true"]');
            if (textarea) {
                textarea.addEventListener('input', () => {
                    // Check and fix sparkle positioning after typing
                    setTimeout(() => {
                        const existingSparkles = document.querySelectorAll('[data-threadly-sparkle="true"]');
                        if (existingSparkles.length === 0) {
                            insertSparkleIcon();
                        } else if (existingSparkles.length > 1) {
                            // Keep only the first one, remove the rest
                            for (let i = 1; i < existingSparkles.length; i++) {
                                existingSparkles[i].remove();
                            }
                        }
                    }, 200);
                });
            }
    }
    
    // Cleanup function
    function cleanup() {
        if (maintenanceInterval) {
            clearInterval(maintenanceInterval);
            maintenanceInterval = null;
        }
        if (mainObserver) {
            mainObserver.disconnect();
            mainObserver = null;
        }
        isInitialized = false;
        textareaListenerAdded = false;
    }

    // Initialize only if on Perplexity's website
    console.log('Threadly: Checking if on Perplexity website...');
    if (isPerplexityWebsite()) {
        console.log('Threadly: On Perplexity website, starting initialization...');
        // Single initialization attempt
        function tryInitialize() {
            console.log('Threadly: tryInitialize called, isInitialized:', isInitialized);
            if (!isInitialized) {
                console.log('Threadly: Starting initialization...');
                try {
                    initialize().catch(error => {
                        console.error('Threadly: Initialization error:', error);
                    });
                } catch (error) {
                    console.error('Threadly: Initialization error (sync):', error);
                }
            }
        }
        
        // Try immediate insertion if elements are already available
        function tryImmediate() {
            const submitButton = document.querySelector('button[data-testid="submit-button"]');
            const voiceModeButton = document.querySelector('button[aria-label="Voice mode"]');
            const targetButton = submitButton || voiceModeButton;
            
            if (targetButton && !isInitialized) {
                insertSparkleIcon();
                // Still run full initialization for proper setup
                initialize();
            }
        }
        
        // Try immediate insertion first
        tryImmediate();
        
        // Try immediately if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryInitialize);
        } else {
            tryInitialize();
        }
        
        // Single fallback attempt after delay
        setTimeout(tryInitialize, 3000);
        
        // Try on window load as well
        window.addEventListener('load', tryInitialize);
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', cleanup);
    }

    // Export for testing and debugging
    window.ThreadlyPerplexitySparkle = {
        insertSparkleIcon,
        createSparkleIcon,
        handleSparkleClick,
        isPerplexityWebsite,
        initialize,
        cleanup,
        tryImmediate: function() {
            const submitButton = document.querySelector('button[data-testid="submit-button"]');
            const voiceModeButton = document.querySelector('button[aria-label="Voice mode"]');
            const targetButton = submitButton || voiceModeButton;
            
            if (targetButton) {
                insertSparkleIcon();
            }
        }
    };
    
    // Also make handleSparkleClick globally accessible for testing
    window.handlePerplexitySparkleClick = handleSparkleClick;
    window.testPerplexitySparkle = window.ThreadlyPerplexitySparkle.tryImmediate;

})();