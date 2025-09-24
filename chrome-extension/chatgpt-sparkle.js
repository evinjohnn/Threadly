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
        let hoverTimeout;
        let popup = null;

        svg.addEventListener('mouseenter', () => {
            console.log('Threadly: Mouse entered sparkle');
            hoverTimeout = setTimeout(() => {
                console.log('Threadly: Creating popup after hover delay');
                popup = createModeSelectionPopup(svg);
            }, 300); // Show popup after 300ms hover
        });

        svg.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            if (popup) {
                popup.remove();
                popup = null;
            }
        });

        // Add click handler
        svg.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            console.log('Threadly: ChatGPT Sparkle clicked!');
            
            // If popup is visible, remove it and proceed with autonomous mode
            if (popup) {
                popup.remove();
                popup = null;
            }
            
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
    function createModeSelectionPopup(sparkleElement) {
        // Remove existing popup if any
        const existingPopup = document.querySelector('.threadly-mode-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create popup container
        const popup = document.createElement('div');
        popup.className = 'threadly-mode-popup';
        popup.innerHTML = `
            <div class="threadly-mode-option correction" data-mode="correction">
                <span class="mode-icon">✏️</span>
                <span class="mode-text">CORRECT</span>
            </div>
            <div class="threadly-mode-option image" data-mode="image">
                <span class="mode-icon">🎨</span>
                <span class="mode-text">IMAGE</span>
            </div>
            <div class="threadly-mode-option refine" data-mode="refine">
                <span class="mode-icon">✨</span>
                <span class="mode-text">REFINE</span>
            </div>
        `;

        // Position popup relative to sparkle element
        sparkleElement.style.position = 'relative';
        sparkleElement.appendChild(popup);

        // Show popup with animation
        setTimeout(() => {
            popup.classList.add('show');
        }, 10);

        // Add click handlers for each option
        popup.addEventListener('click', (e) => {
            const mode = e.target.closest('.threadly-mode-option')?.dataset.mode;
            if (mode) {
                handleModeSelection(mode, sparkleElement);
                popup.remove();
            }
        });

        // Hide popup when clicking outside
        const hidePopup = (e) => {
            if (!popup.contains(e.target) && !sparkleElement.contains(e.target)) {
                popup.remove();
                document.removeEventListener('click', hidePopup);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', hidePopup);
        }, 100);

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
        console.log('Threadly: ===== SPARKLE CLICK HANDLER CALLED =====');
        console.log('Threadly: Sparkle clicked - prompt refine activated!');
        console.log('Threadly: Current URL:', window.location.href);
        console.log('Threadly: Document ready state:', document.readyState);
        
        // Get current input text from ChatGPT textarea using specific selector
        const textArea = document.querySelector('#prompt-textarea');
        
        // Debug: log textarea details
        if (textArea) {
            console.log('Threadly: Found textarea:', {
                value: textArea.value,
                textContent: textArea.textContent,
                innerText: textArea.innerText,
                placeholder: textArea.placeholder,
                id: textArea.id
            });
        } else {
            console.log('Threadly: No textarea found with #prompt-textarea');
            // Fallback to any textarea
            const fallbackTextarea = document.querySelector('textarea');
            if (fallbackTextarea) {
                console.log('Threadly: Found fallback textarea:', {
                    value: fallbackTextarea.value,
                    textContent: fallbackTextarea.textContent,
                    innerText: fallbackTextarea.innerText,
                    placeholder: fallbackTextarea.placeholder,
                    id: fallbackTextarea.id
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
                    const rawRefinedPrompt = await promptRefiner.refinePrompt(currentText, 'chatgpt');
                    
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
                    
                } else {
                    console.error('Threadly: PromptRefiner class not available');
                    throw new Error('PromptRefiner not available');
                }
                
            } catch (error) {
                console.error('Threadly: Error refining prompt:', error);
                
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

        // Main function to insert the sparkle icon next to the mic button (original approach)
        async function insertSparkleIcon() {
            try {
                console.log('Threadly: Adding sparkle icon to ChatGPT input area...');
                
                // Check if sparkle already exists
                const existingSparkle = document.querySelector('[data-threadly-sparkle="true"]');
                if (existingSparkle) {
                    console.log('Threadly: Sparkle icon already exists, removing duplicates');
                    document.querySelectorAll('[data-threadly-sparkle="true"]').forEach(el => el.remove());
                }
                
                // Find the mic/dictate button - be more aggressive
                let micButton = null;
                
                // Try multiple approaches to find the mic button - updated for actual DOM structure
                const micSelectors = [
                    'button.composer-btn[aria-label*="dictate"]', // Specific composer-btn with dictate
                    'button.composer-btn[aria-label*="Dictate"]', // Case sensitive
                    'button[aria-label*="dictate"]',
                    'button[title*="dictate"]', 
                    'button[aria-label*="mic"]',
                    'button[title*="mic"]',
                    'button[aria-label*="voice"]',
                    'button[title*="voice"]'
                ];
                
                for (const selector of micSelectors) {
                    micButton = document.querySelector(selector);
                    if (micButton) {
                        console.log(`Threadly: Found mic button with selector: ${selector}`);
                        break;
                    }
                }
                
                // If still not found, search all buttons more thoroughly
                if (!micButton) {
                    const allButtons = document.querySelectorAll('button');
                    for (const button of allButtons) {
                        const text = button.textContent.toLowerCase();
                        const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
                        const title = (button.getAttribute('title') || '').toLowerCase();
                        const className = button.className.toLowerCase();
                        
                        if ((text.includes('mic') || text.includes('dictate') || 
                             ariaLabel.includes('mic') || ariaLabel.includes('dictate') ||
                             title.includes('mic') || title.includes('dictate') ||
                             className.includes('composer-btn')) &&
                            !text.includes('voice mode') && !ariaLabel.includes('voice mode') && 
                            !title.includes('voice mode') && !ariaLabel.includes('send')) {
                            micButton = button;
                            console.log(`Threadly: Found mic button: ${text || ariaLabel || title || className}`);
                            break;
                        }
                    }
                }
                
                if (!micButton) {
                    throw new Error("Could not find mic/dictate button");
                }
                
                console.log('Threadly: Mic button found:', micButton);
                console.log('Threadly: Mic button parent:', micButton.parentElement);
                
                // Create the sparkle icon
                const sparkleIcon = createSparkleIcon();
                
                // Style the sparkle icon
                sparkleIcon.style.display = 'inline-block';
                sparkleIcon.style.verticalAlign = 'middle';
                sparkleIcon.style.position = 'relative';
                sparkleIcon.style.top = '0';
                sparkleIcon.style.marginLeft = '0px';
                sparkleIcon.style.marginRight = '4px';
                
                // Ensure parent container is flex
                const parentContainer = micButton.parentElement;
                if (parentContainer) {
                    parentContainer.style.display = 'flex';
                    parentContainer.style.alignItems = 'center';
                    parentContainer.style.gap = '0';
                }
                
                // STABLE POSITIONING - Always position right before mic button within its span container
                console.log('Threadly: Attempting to insert sparkle...');
                console.log('Threadly: Mic button:', micButton);
                console.log('Threadly: Mic button parent:', micButton.parentElement);
                
                // Find the span container that holds the mic button
                const spanContainer = micButton.parentElement;
                if (spanContainer) {
                    // Ensure span container is flex with proper alignment (matching the actual DOM structure)
                    spanContainer.style.display = 'flex';
                    spanContainer.style.alignItems = 'center';
                    spanContainer.style.gap = '4px';
                    spanContainer.style.flexDirection = 'row';
                    
                    // Remove any existing sparkles first
                    const existingSparkles = spanContainer.querySelectorAll('[data-threadly-sparkle="true"]');
                    existingSparkles.forEach(sparkle => sparkle.remove());
                }
                
                // Always insert sparkle right before the mic button within the span container
                try {
                    micButton.parentNode.insertBefore(sparkleIcon, micButton);
                    console.log('Threadly: SUCCESS - Sparkle inserted before mic button in span container');
                } catch (error) {
                    console.error('Threadly: Insert before mic failed:', error);
                    // Fallback: append as first child if mic insertion fails
                    if (spanContainer && spanContainer.firstChild) {
                        spanContainer.insertBefore(sparkleIcon, spanContainer.firstChild);
                        console.log('Threadly: FALLBACK - Sparkle inserted as first child of span');
                    } else if (spanContainer) {
                        spanContainer.appendChild(sparkleIcon);
                        console.log('Threadly: FALLBACK - Sparkle appended to span container');
                    } else {
                        // Last resort: append to body
                        document.body.appendChild(sparkleIcon);
                        console.log('Threadly: FALLBACK - appended to body');
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
                
                console.log("Threadly: Successfully added sparkle icon to ChatGPT input area");
                
                // Dispatch success event
                window.dispatchEvent(new CustomEvent('threadly-sparkle-inserted', {
                    detail: { platform: 'chatgpt', success: true }
                }));
                
            } catch (error) {
                console.error("Threadly: Error inserting sparkle icon:", error);
                
                // Dispatch error event
                window.dispatchEvent(new CustomEvent('threadly-sparkle-error', {
                    detail: { platform: 'chatgpt', error: error.message }
                }));
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
                    // Check if sparkle is in the correct position (right before mic button)
                    const sparkle = existingSparkles[0];
                    const micButton = document.querySelector('button.composer-btn[aria-label*="dictate"], button[aria-label*="dictate"], button[title*="dictate"], button[aria-label*="mic"], button[title*="mic"]');
                    if (micButton && micButton.previousElementSibling !== sparkle) {
                        console.log('Threadly: Periodic check - repositioning sparkle before mic button');
                        // Remove and re-insert to ensure correct position
                        sparkle.remove();
                        insertSparkleIcon();
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
                            // Check if sparkle is in the correct position (right before mic button)
                            const sparkle = existingSparkles[0];
                            const micButton = document.querySelector('button.composer-btn[aria-label*="dictate"], button[aria-label*="dictate"], button[title*="dictate"], button[aria-label*="mic"], button[title*="mic"]');
                            if (micButton && micButton.previousElementSibling !== sparkle) {
                                console.log('Threadly: Repositioning sparkle before mic button after textarea input');
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
                            // Check if sparkle is in the correct position (right before mic button)
                            const sparkle = existingSparkles[0];
                            const micButton = document.querySelector('button.composer-btn[aria-label*="dictate"], button[aria-label*="dictate"], button[title*="dictate"], button[aria-label*="mic"], button[title*="mic"]');
                            if (micButton && micButton.previousElementSibling !== sparkle) {
                                console.log('Threadly: Repositioning sparkle before mic button after DOM change');
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

    // Initialize only if on ChatGPT's website
    if (isChatGPTWebsite()) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
        } else {
            initialize();
        }
    }

        // Export for testing and debugging
        window.ThreadlyChatGPTSparkle = {
            insertSparkleIcon,
            createSparkleIcon,
            handleSparkleClick,
            isChatGPTWebsite
        };
        
        // Also make handleSparkleClick globally accessible for testing
        window.handleSparkleClick = handleSparkleClick;

})();