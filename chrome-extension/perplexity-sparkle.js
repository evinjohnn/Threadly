/**
 * Perplexity AI Sparkle Button Content Script
 * Adds a sparkle button before the submit button in Perplexity's input bar
 */

(function() {
    'use strict';

    console.log('Threadly: Perplexity sparkle script loaded');
    console.log('Threadly: Current URL:', window.location.href);
    console.log('Threadly: Current hostname:', window.location.hostname);

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

        // Add click handler
        svg.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            handleSparkleClick();
        });

        // Set proper aria-label for tooltip (matching Claude's style)
        svg.setAttribute('aria-label', 'Refine prompt with AI');
        svg.setAttribute('title', 'Refine prompt with AI');

        return svg;
    }

    // Handle sparkle click functionality with prompt refine feature
    async function handleSparkleClick() {
        console.log('Threadly: Sparkle clicked - prompt refine activated!');
        
        // Get current input text from Perplexity's specific input elements
        let textArea = null;
        let currentText = '';
        
        // Find the specific text element that contains the visible text
        const textElement = document.querySelector('span[data-lexical-text="true"]');
        if (textElement) {
            textArea = textElement;
            currentText = textElement.textContent || textElement.innerText || '';
            console.log('Threadly: Found Lexical text element:', textElement.tagName, textElement.className);
            console.log('Threadly: Current prompt:', currentText);
        } else {
            // Fallback to the original selectors with updated modern selectors
            const selectors = [
                'div[contenteditable="true"][id="ask-input"]',
                'div[contenteditable="true"][data-lexical-editor="true"]',
                'div[contenteditable="true"][role="textbox"]',
                'div[contenteditable="true"]',
                'textarea[placeholder*="Ask anything"]',
                'textarea[aria-label*="Ask anything"]', 
                'textarea[data-testid="search-input"]',
                'textarea[placeholder*="Ask"]',
                'textarea[aria-label*="Ask"]',
                'textarea[placeholder*="Search"]',
                'textarea[aria-label*="Search"]',
                'textarea'
            ];
            
            for (const selector of selectors) {
                textArea = document.querySelector(selector);
                if (textArea) {
                    console.log('Threadly: Found textarea with selector:', selector);
                    currentText = textArea.value || textArea.textContent || textArea.innerText || '';
                    if (currentText.trim()) {
                        console.log('Threadly: Current prompt:', currentText);
                        break;
                    }
                }
            }
        }
        
        if (textArea && currentText.trim()) {
            
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
                    const rawRefinedPrompt = await promptRefiner.refinePrompt(currentText, 'perplexity');
                    
                    // Clean up the refined prompt to remove XML tags and unnecessary formatting
                    const refinedPrompt = cleanRefinedPrompt(rawRefinedPrompt);
                    
                    // Replace the text with refined version
                    console.log('Threadly: Replacing text with refined prompt:', refinedPrompt);
                    
                    // Check if this is a Lexical editor (Perplexity uses Lexical)
                    const isLexicalEditor = textArea.closest('div[contenteditable="true"][role="textbox"]') || 
                                          textArea.getAttribute('data-lexical-editor') === 'true' ||
                                          textArea.closest('[data-lexical-editor="true"]');
                    
                    if (isLexicalEditor) {
                        console.log('Threadly: Detected Lexical editor, using execCommand approach');
                        
                        // Find the true Lexical root node
                        let editorRoot = textArea.closest('div[contenteditable="true"][role="textbox"]') || 
                                       textArea.closest('[data-lexical-editor="true"]') ||
                                       textArea;
                        
                        if (!editorRoot) {
                            console.error('Threadly: Could not find Lexical editor root');
                        } else {
                            console.log('Threadly: Found Lexical editor root:', editorRoot.tagName, editorRoot.className);
                            
                            // Focus editor
                            editorRoot.focus();
                            
                            // Clear existing content using execCommand
                            document.execCommand('selectAll', false, null);
                            document.execCommand('delete', false, null);
                            
                            // Insert refined text using Lexical-compatible execCommand
                            document.execCommand('insertText', false, refinedPrompt);
                            
                            console.log('Threadly: Inserted text via execCommand');
                            
                            // Fire events to be extra safe
                            const events = ['input', 'change', 'keyup', 'keydown', 'compositionend', 'textInput'];
                            events.forEach(type => {
                                editorRoot.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
                            });
                        }
                    } else if (textArea.tagName === 'TEXTAREA' || textArea.tagName === 'INPUT') {
                        // Handle regular textarea/input elements
                        textArea.value = refinedPrompt;
                        console.log('Threadly: Updated textarea/input value');
                        
                        // Trigger events for regular inputs
                        const events = ['input', 'change', 'keyup', 'keydown', 'paste', 'blur', 'focus'];
                        events.forEach(eventType => {
                            textArea.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
                        });
                    } else {
                        // Fallback for other contenteditable elements
                        console.log('Threadly: Using fallback approach for contenteditable');
                        textArea.innerHTML = `<p>${refinedPrompt}</p>`;
                        
                        // Trigger events
                        const events = ['input', 'change', 'keyup', 'keydown', 'paste', 'blur', 'focus'];
                        events.forEach(eventType => {
                            textArea.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
                        });
                    }
                    
                    // Also try triggering React events if Perplexity uses React
                    if (textArea._valueTracker) {
                        textArea._valueTracker.setValue('');
                    }
                    
                    // Force focus back to the text area
                    textArea.focus();
                    
                    // Additional attempt: try to find and update any hidden input fields
                    const hiddenInputs = document.querySelectorAll('input[type="hidden"], input[style*="display: none"]');
                    hiddenInputs.forEach(input => {
                        if (input.name && input.name.includes('query')) {
                            input.value = refinedPrompt;
                            console.log('Threadly: Updated hidden input:', input.name);
                        }
                    });
                    
                    // Try to find the actual input field that Perplexity is using
                    const allInputs = document.querySelectorAll('input, textarea, [contenteditable]');
                    allInputs.forEach(input => {
                        if (input !== textArea && (input.value === currentText || input.textContent === currentText)) {
                            console.log('Threadly: Found matching input field:', input.tagName, input.type);
                            if (input.tagName === 'TEXTAREA' || input.type === 'text') {
                                input.value = refinedPrompt;
                            } else if (input.contentEditable === 'true') {
                                // Use execCommand for contenteditable elements
                                input.focus();
                                document.execCommand('selectAll', false, null);
                                document.execCommand('delete', false, null);
                                document.execCommand('insertText', false, refinedPrompt);
                            } else {
                                input.textContent = refinedPrompt;
                                input.innerText = refinedPrompt;
                            }
                            // Trigger events on this input too
                            events.forEach(eventType => {
                                input.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
                            });
                        }
                    });
                    
                    // Final attempt: Try to find any element that contains the current text and replace it
                    const allElements = document.querySelectorAll('*');
                    allElements.forEach(element => {
                        if (element.textContent === currentText && element !== textArea) {
                            console.log('Threadly: Found element with matching text:', element.tagName, element.className);
                            element.textContent = refinedPrompt;
                            element.innerText = refinedPrompt;
                        }
                    });
                    
                    // Additional attempt: Look for any element that might be the actual input field
                    const possibleInputs = document.querySelectorAll('[contenteditable], input, textarea, [role="textbox"]');
                    possibleInputs.forEach(input => {
                        if (input.textContent === currentText || input.value === currentText) {
                            console.log('Threadly: Found potential input with current text:', input.tagName, input.className);
                            if (input.tagName === 'TEXTAREA' || input.type === 'text') {
                                input.value = refinedPrompt;
                            } else if (input.contentEditable === 'true') {
                                // Use execCommand for contenteditable elements
                                input.focus();
                                document.execCommand('selectAll', false, null);
                                document.execCommand('delete', false, null);
                                document.execCommand('insertText', false, refinedPrompt);
                            } else {
                                input.textContent = refinedPrompt;
                                input.innerText = refinedPrompt;
                            }
                        }
                    });
                    
                    // Wait a bit and try again to handle dynamic updates
                    setTimeout(() => {
                        const currentValue = textArea.value || textArea.textContent || textArea.innerText || '';
                        if (currentValue !== refinedPrompt) {
                            console.log('Threadly: Retrying text replacement...');
                            
                            // Try a more direct approach for Lexical editor
                            if (textArea.getAttribute('data-lexical-editor') === 'true') {
                                console.log('Threadly: Retrying with character-by-character simulation');
                                
                                // Focus and clear
                                textArea.focus();
                                textArea.innerHTML = '<p><br></p>';
                                
                                // Simulate typing character by character (faster for retry)
                                const characters = refinedPrompt.split('');
                                let currentText = '';
                                
                                characters.forEach((char, index) => {
                                    setTimeout(() => {
                                        currentText += char;
                                        textArea.textContent = currentText;
                                        textArea.innerText = currentText;
                                        
                                        if (textArea.__lexicalTextContent !== undefined) {
                                            textArea.__lexicalTextContent = currentText;
                                        }
                                        
                                        const inputEvent = new InputEvent('input', {
                                            data: char,
                                            inputType: 'insertText',
                                            bubbles: true,
                                            cancelable: true
                                        });
                                        textArea.dispatchEvent(inputEvent);
                                        
                                        if (index === characters.length - 1) {
                                            console.log('Threadly: Retry simulation completed');
                                        }
                                    }, index * 5); // Faster for retry (5ms delay)
                                });
                            } else if (textArea.tagName === 'TEXTAREA') {
                                textArea.value = refinedPrompt;
                            } else if (textArea.contentEditable === 'true') {
                                // Use execCommand for contenteditable elements
                                textArea.focus();
                                document.execCommand('selectAll', false, null);
                                document.execCommand('delete', false, null);
                                document.execCommand('insertText', false, refinedPrompt);
                            } else {
                                textArea.textContent = refinedPrompt;
                                textArea.innerText = refinedPrompt;
                            }
                            
                            events.forEach(eventType => {
                                textArea.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
                            });
                        }
                    }, 100);
                    
                    console.log('Threadly: Text replacement completed');
                    console.log('Threadly: Prompt refined successfully');
                    
                    // Dispatch success event
                    window.dispatchEvent(new CustomEvent('threadly-prompt-refined', {
                        detail: { 
                            platform: 'perplexity', 
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
                        platform: 'perplexity', 
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
                platform: 'perplexity', 
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