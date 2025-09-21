/**
 * Perplexity AI Sparkle Button Content Script
 * Adds a sparkle button before the submit button in Perplexity's input bar
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

    // Create the sparkle icon with glow effect (same as other platforms)
    function createSparkleIcon() {
        // Create the main SVG container
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "32");
        svg.setAttribute("height", "32");
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
        filter.setAttribute("id", "perplexity-glow");
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
            sparklePath.setAttribute("filter", "url(#perplexity-glow)");
        });

        svg.addEventListener('mouseleave', () => {
            svg.style.opacity = "0.8";
            sparklePath.removeAttribute("filter");
        });

        // Add click handler
        svg.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            console.log('Threadly: Perplexity Sparkle clicked!');
            handleSparkleClick();
        });

        // Set proper aria-label for tooltip
        svg.setAttribute('aria-label', 'Refine prompt with AI');
        svg.setAttribute('title', 'Refine prompt with AI');

        return svg;
    }

    // Handle sparkle click functionality with prompt refine feature
    async function handleSparkleClick() {
        console.log('Threadly: ===== PERPLEXITY SPARKLE CLICK HANDLER CALLED =====');
        console.log('Threadly: Sparkle clicked - prompt refine activated!');
        console.log('Threadly: Current URL:', window.location.href);
        
        // Get current input text from Perplexity textarea
        const textArea = document.querySelector('textarea[placeholder*="Ask anything"], textarea[aria-label*="Ask anything"], textarea[data-testid="search-input"]');
        
        // Debug: log textarea details
        if (textArea) {
            console.log('Threadly: Found textarea:', {
                value: textArea.value,
                textContent: textArea.textContent,
                innerText: textArea.innerText,
                placeholder: textArea.placeholder,
                ariaLabel: textArea.getAttribute('aria-label')
            });
        } else {
            console.log('Threadly: No textarea found with Perplexity selectors');
            // Fallback to any textarea
            const fallbackTextarea = document.querySelector('textarea');
            if (fallbackTextarea) {
                console.log('Threadly: Found fallback textarea:', {
                    value: fallbackTextarea.value,
                    textContent: fallbackTextarea.textContent,
                    innerText: fallbackTextarea.innerText,
                    placeholder: fallbackTextarea.placeholder,
                    ariaLabel: fallbackTextarea.getAttribute('aria-label')
                });
            }
        }
        
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
                    await promptRefiner.initialize();
                    
                    console.log('Threadly: Sending prompt for refinement...');
                    const rawRefinedPrompt = await promptRefiner.refinePrompt(currentText, 'perplexity');
                    
                    // Clean up the refined prompt to remove XML tags and unnecessary formatting
                    const refinedPrompt = cleanRefinedPrompt(rawRefinedPrompt);
                    
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
                    
                    // Trigger multiple events to ensure Perplexity detects the change
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
    
    // Start smooth glow morph breathe animation
    function startClickAnimationSequence(sparkleIcon) {
        // Add CSS animations if not already added
        if (!document.getElementById('threadly-perplexity-glow-animation')) {
            const style = document.createElement('style');
            style.id = 'threadly-perplexity-glow-animation';
            style.textContent = `
                @keyframes perplexityGlowMorphBreathe {
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
        sparkleIcon.style.animation = 'perplexityGlowMorphBreathe 2.5s ease-in-out infinite';
    }
    
    // Stop glow animation smoothly by completing current cycle
    function stopClickAnimationSequence(sparkleIcon) {
        // Add a one-time animation that completes the current cycle and stops at default state
        if (!document.getElementById('threadly-perplexity-stop-animation')) {
            const style = document.createElement('style');
            style.id = 'threadly-perplexity-stop-animation';
            style.textContent = `
                @keyframes perplexitySmoothStop {
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
        sparkleIcon.style.animation = 'perplexitySmoothStop 1.25s ease-in-out 1';
        
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
            console.log('Threadly: ===== insertSparkleIcon called =====');
            console.log('Threadly: Adding sparkle icon to Perplexity input area...');
            
            // Check if sparkle already exists
            const existingSparkle = document.querySelector('[data-threadly-sparkle="true"]');
            if (existingSparkle) {
                console.log('Threadly: Sparkle icon already exists, removing duplicates');
                document.querySelectorAll('[data-threadly-sparkle="true"]').forEach(el => el.remove());
            }
            
            // Find the target button (submit button for chat page, voice mode button for loading page)
            const submitButton = document.querySelector('button[data-testid="submit-button"]');
            const voiceModeButton = document.querySelector('button[aria-label="Voice mode"]');
            
            const targetButton = submitButton || voiceModeButton;
            
            if (!targetButton) {
                throw new Error("Could not find target button (submit or voice mode)");
            }
            
            console.log('Threadly: Target button found:', targetButton);
            console.log('Threadly: Target button parent:', targetButton.parentElement);
            console.log('Threadly: Button type:', submitButton ? 'submit' : 'voice-mode');
            
            // Create the sparkle icon
            const sparkleIcon = createSparkleIcon();
            
            // Create a wrapper span to match other buttons' structure
            const sparkleWrapper = document.createElement('span');
            sparkleWrapper.appendChild(sparkleIcon);
            
            // Style the sparkle icon to match Perplexity's design
            sparkleIcon.style.display = 'inline-flex';
            sparkleIcon.style.alignItems = 'center';
            sparkleIcon.style.justifyContent = 'center';
            sparkleIcon.style.verticalAlign = 'middle';
            sparkleIcon.style.position = 'relative';
            sparkleIcon.style.top = '0';
            sparkleIcon.style.marginRight = '8px';
            sparkleIcon.style.marginLeft = '0';
            sparkleIcon.style.height = '32px';
            sparkleIcon.style.width = '32px';
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
                    console.log('Threadly: SUCCESS - Attempt 1: Sparkle inserted at LEFT of main container');
                    inserted = true;
                } catch (error) {
                    console.log('Threadly: Attempt 1 failed:', error.message);
                }
            }
            
            // Attempt 2: Insert at the beginning of the button container (LEFT position)
            const buttonContainer = targetButton.closest('.flex.items-center');
            if (buttonContainer && !inserted) {
                try {
                    buttonContainer.insertBefore(sparkleWrapper, buttonContainer.firstChild);
                    console.log('Threadly: SUCCESS - Attempt 2: Sparkle inserted at LEFT of button container');
                    inserted = true;
                } catch (error) {
                    console.log('Threadly: Attempt 2 failed:', error.message);
                }
            }
            
            // Attempt 3: Insert before the first child of button container
            if (buttonContainer && !inserted) {
                try {
                    const firstChild = buttonContainer.firstElementChild;
                    if (firstChild) {
                        buttonContainer.insertBefore(sparkleWrapper, firstChild);
                        console.log('Threadly: SUCCESS - Attempt 3: Sparkle inserted before first child (LEFT)');
                        inserted = true;
                    }
                } catch (error) {
                    console.log('Threadly: Attempt 3 failed:', error.message);
                }
            }
            
            // Attempt 4: Insert before target button wrapper (div.ml-2) - still left of target button
            const targetButtonWrapper = targetButton.closest('div.ml-2');
            if (targetButtonWrapper && !inserted) {
                try {
                    targetButtonWrapper.parentNode.insertBefore(sparkleWrapper, targetButtonWrapper);
                    console.log('Threadly: SUCCESS - Attempt 4: Sparkle inserted before target button wrapper (LEFT)');
                    inserted = true;
                } catch (error) {
                    console.log('Threadly: Attempt 4 failed:', error.message);
                }
            }
            
            // Attempt 5: Insert before target button directly (LEFT of target button)
            if (!inserted) {
                try {
                    targetButton.parentNode.insertBefore(sparkleWrapper, targetButton);
                    console.log('Threadly: SUCCESS - Attempt 5: Sparkle inserted before target button (LEFT)');
                    inserted = true;
                } catch (error) {
                    console.log('Threadly: Attempt 5 failed:', error.message);
                }
            }
            
            // Last resort: append to body
            if (!inserted) {
                try {
                    document.body.appendChild(sparkleWrapper);
                    console.log('Threadly: FALLBACK - Sparkle appended to body');
                    inserted = true;
                } catch (error) {
                    console.error('Threadly: All positioning attempts failed:', error);
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
            
            console.log("Threadly: Successfully added sparkle icon to Perplexity input area");
            
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
            const checkInterface = () => {
                console.log('Threadly: Checking for Perplexity interface elements...');
                
                // Check for chat page elements
                const submitButton = document.querySelector('button[data-testid="submit-button"]');
                const textarea = document.querySelector('textarea[placeholder*="Ask anything"], textarea[aria-label*="Ask anything"], textarea[data-testid="search-input"]');
                
                // Check for loading page elements
                const voiceModeButton = document.querySelector('button[aria-label="Voice mode"]');
                const sourcesButton = document.querySelector('button[data-testid="sources-switcher-button"]');
                const modelButton = document.querySelector('button[aria-label="Choose a model"]');
                
                console.log('Threadly: Submit button found:', !!submitButton);
                console.log('Threadly: Textarea found:', !!textarea);
                console.log('Threadly: Voice mode button found:', !!voiceModeButton);
                console.log('Threadly: Sources button found:', !!sourcesButton);
                console.log('Threadly: Model button found:', !!modelButton);
                
                // Interface is ready if we have either:
                // 1. Chat page: submit button + textarea
                // 2. Loading page: voice mode button + sources button + model button
                const isChatPage = submitButton && textarea;
                const isLoadingPage = voiceModeButton && sourcesButton && modelButton;
                
                if (isChatPage) {
                    console.log('Threadly: Perplexity chat page interface ready');
                    resolve(true);
                } else if (isLoadingPage) {
                    console.log('Threadly: Perplexity loading page interface ready');
                    resolve(true);
                } else {
                    console.log('Threadly: Waiting for Perplexity interface...');
                    setTimeout(checkInterface, 500);
                }
            };
            
            checkInterface();
        });
    }

    // Initialize when page loads
    async function initialize() {
        console.log('Threadly: Perplexity Sparkle Extension initializing...');
        console.log('Threadly: Current URL:', window.location.href);
        console.log('Threadly: Document ready state:', document.readyState);
        
        try {
            // Wait for Perplexity's interface to be ready
            await waitForPerplexityInterface();
            
            // Try to insert sparkle immediately
            insertSparkleIcon();
            
            // Also try again after a short delay to ensure DOM is fully ready
            setTimeout(() => {
                const existingSparkles = document.querySelectorAll('[data-threadly-sparkle="true"]');
                if (existingSparkles.length === 0) {
                    console.log('Threadly: Retry - inserting sparkle after delay');
                    insertSparkleIcon();
                }
            }, 1000);
            
        } catch (error) {
            console.error('Threadly: Error waiting for Perplexity interface:', error);
            // Fallback: try to insert anyway
            insertSparkleIcon();
        }
        
        // Also check periodically to ensure sparkle stays in place
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
                // Check if sparkle is in the correct position using multiple checks
                const sparkle = existingSparkles[0];
                const submitButton = document.querySelector('button[data-testid="submit-button"]');
                let needsRepositioning = false;
                
                if (submitButton) {
                    const submitButtonWrapper = submitButton.closest('div.ml-2');
                    const buttonContainer = submitButton.closest('.flex.items-center');
                    const mainContainer = submitButton.closest('div[class*="flex"][class*="items-center"][class*="justify-self-end"]');
                    
                    // Check if sparkle is at the LEFT position (beginning of main container)
                    if (mainContainer && mainContainer.firstChild !== sparkle) {
                        needsRepositioning = true;
                    }
                    // Check if sparkle is at the beginning of button container (LEFT)
                    else if (buttonContainer && buttonContainer.firstChild !== sparkle) {
                        needsRepositioning = true;
                    }
                    // Check if sparkle is before submit button wrapper (LEFT of submit button)
                    else if (submitButtonWrapper && submitButtonWrapper.previousElementSibling !== sparkle) {
                        needsRepositioning = true;
                    }
                    // Check if sparkle is before submit button (LEFT of submit button)
                    else if (submitButton.previousElementSibling !== sparkle) {
                        needsRepositioning = true;
                    }
                }
                
                if (needsRepositioning) {
                    console.log('Threadly: Periodic check - repositioning sparkle');
                    // Remove and re-insert to ensure correct position
                    sparkle.remove();
                    insertSparkleIcon();
                }
            }
        }, 3000); // Check every 3 seconds (more frequent)
        
        // Add input listener to textarea to ensure sparkle positioning when typing
        const addTextareaListener = () => {
            const textarea = document.querySelector('textarea[placeholder*="Ask anything"], textarea[aria-label*="Ask anything"], textarea[data-testid="search-input"]');
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
                            // Check if sparkle is in the correct position using multiple checks
                            const sparkle = existingSparkles[0];
                            const submitButton = document.querySelector('button[data-testid="submit-button"]');
                            let needsRepositioning = false;
                            
                            if (submitButton) {
                                const submitButtonWrapper = submitButton.closest('div.ml-2');
                                const buttonContainer = submitButton.closest('.flex.items-center');
                                const mainContainer = submitButton.closest('div[class*="flex"][class*="items-center"][class*="justify-self-end"]');
                                
                                // Check if sparkle is at the LEFT position (beginning of main container)
                                if (mainContainer && mainContainer.firstChild !== sparkle) {
                                    needsRepositioning = true;
                                }
                                // Check if sparkle is at the beginning of button container (LEFT)
                                else if (buttonContainer && buttonContainer.firstChild !== sparkle) {
                                    needsRepositioning = true;
                                }
                                // Check if sparkle is before submit button wrapper (LEFT of submit button)
                                else if (submitButtonWrapper && submitButtonWrapper.previousElementSibling !== sparkle) {
                                    needsRepositioning = true;
                                }
                                // Check if sparkle is before submit button (LEFT of submit button)
                                else if (submitButton.previousElementSibling !== sparkle) {
                                    needsRepositioning = true;
                                }
                            }
                            
                            if (needsRepositioning) {
                                console.log('Threadly: Repositioning sparkle after textarea input');
                                // Remove and re-insert to ensure correct position
                                sparkle.remove();
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
                            // Check if sparkle is in the correct position using multiple checks
                            const sparkle = existingSparkles[0];
                            const submitButton = document.querySelector('button[data-testid="submit-button"]');
                            let needsRepositioning = false;
                            
                            if (submitButton) {
                                const submitButtonWrapper = submitButton.closest('div.ml-2');
                                const buttonContainer = submitButton.closest('.flex.items-center');
                                const mainContainer = submitButton.closest('div[class*="flex"][class*="items-center"][class*="justify-self-end"]');
                                
                                // Check if sparkle is at the LEFT position (beginning of main container)
                                if (mainContainer && mainContainer.firstChild !== sparkle) {
                                    needsRepositioning = true;
                                }
                                // Check if sparkle is at the beginning of button container (LEFT)
                                else if (buttonContainer && buttonContainer.firstChild !== sparkle) {
                                    needsRepositioning = true;
                                }
                                // Check if sparkle is before submit button wrapper (LEFT of submit button)
                                else if (submitButtonWrapper && submitButtonWrapper.previousElementSibling !== sparkle) {
                                    needsRepositioning = true;
                                }
                                // Check if sparkle is before submit button (LEFT of submit button)
                                else if (submitButton.previousElementSibling !== sparkle) {
                                    needsRepositioning = true;
                                }
                            }
                            
                            if (needsRepositioning) {
                                console.log('Threadly: Repositioning sparkle after DOM change');
                                // Remove and re-insert to ensure correct position
                                sparkle.remove();
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

    // Initialize only if on Perplexity's website
    console.log('Threadly: Checking website...', window.location.hostname);
    console.log('Threadly: Is Perplexity website?', isPerplexityWebsite());
    
    if (isPerplexityWebsite()) {
        console.log('Threadly: Perplexity website detected, initializing...');
        
        // Multiple initialization attempts to ensure sparkle appears
        function tryInitialize() {
            console.log('Threadly: tryInitialize called');
            initialize();
        }
        
        // Also try a simple immediate attempt without waiting
        function tryImmediate() {
            console.log('Threadly: Trying immediate sparkle insertion...');
            const submitButton = document.querySelector('button[data-testid="submit-button"]');
            const voiceModeButton = document.querySelector('button[aria-label="Voice mode"]');
            const targetButton = submitButton || voiceModeButton;
            
            if (targetButton) {
                console.log('Threadly: Target button found, trying to insert sparkle immediately');
                insertSparkleIcon();
            } else {
                console.log('Threadly: Target button not found yet');
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
        
        // Also try after a delay to catch dynamic loading
        setTimeout(tryImmediate, 1000);
        setTimeout(tryInitialize, 2000);
        setTimeout(tryImmediate, 3000);
        setTimeout(tryInitialize, 5000);
        setTimeout(tryImmediate, 7000);
        setTimeout(tryInitialize, 10000);
        
        // Try on window load as well
        window.addEventListener('load', tryInitialize);
        
        // Try on any DOM changes that might indicate interface is ready
        const observer = new MutationObserver((mutations) => {
            // Check for chat page elements
            const hasSubmitButton = document.querySelector('button[data-testid="submit-button"]');
            const hasTextarea = document.querySelector('textarea[placeholder*="Ask anything"], textarea[aria-label*="Ask anything"], textarea[data-testid="search-input"]');
            
            // Check for loading page elements
            const hasVoiceModeButton = document.querySelector('button[aria-label="Voice mode"]');
            const hasSourcesButton = document.querySelector('button[data-testid="sources-switcher-button"]');
            const hasModelButton = document.querySelector('button[aria-label="Choose a model"]');
            
            const isChatPage = hasSubmitButton && hasTextarea;
            const isLoadingPage = hasVoiceModeButton && hasSourcesButton && hasModelButton;
            
            if (isChatPage || isLoadingPage) {
                console.log('Threadly: Interface elements detected via DOM observer, trying to insert sparkle');
                tryInitialize();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Export for testing and debugging
    window.ThreadlyPerplexitySparkle = {
        insertSparkleIcon,
        createSparkleIcon,
        handleSparkleClick,
        isPerplexityWebsite,
        initialize,
        tryImmediate: function() {
            console.log('Threadly: Manual test - trying immediate insertion');
            const submitButton = document.querySelector('button[data-testid="submit-button"]');
            const voiceModeButton = document.querySelector('button[aria-label="Voice mode"]');
            const targetButton = submitButton || voiceModeButton;
            
            if (targetButton) {
                console.log('Threadly: Target button found, inserting sparkle');
                insertSparkleIcon();
            } else {
                console.log('Threadly: Target button not found');
            }
        }
    };
    
    // Also make handleSparkleClick globally accessible for testing
    window.handlePerplexitySparkleClick = handleSparkleClick;
    window.testPerplexitySparkle = window.ThreadlyPerplexitySparkle.tryImmediate;

})();
