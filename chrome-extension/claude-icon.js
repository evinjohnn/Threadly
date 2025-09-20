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
            console.log('Threadly: Sparkle clicked!');
            handleSparkleClick();
        });

        return svg;
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
                
                // Dispatch error event
                window.dispatchEvent(new CustomEvent('threadly-prompt-refine-error', {
                    detail: { 
                        platform: 'claude', 
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