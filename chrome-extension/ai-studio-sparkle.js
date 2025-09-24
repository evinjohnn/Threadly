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

        // Add hover popup functionality
        let hoverTimeout;
        let popup = null;

        console.log('Threadly: Adding hover events to sparkle element');
        console.log('Threadly: SVG element:', svg);
        console.log('Threadly: SVG position:', svg.getBoundingClientRect());

        svg.addEventListener('mouseenter', () => {
            console.log('Threadly: Mouse entered sparkle - HOVER EVENT TRIGGERED!');
            hoverTimeout = setTimeout(() => {
                console.log('Threadly: Creating popup after hover delay');
                
                // Create a simple test popup first
                const testPopup = document.createElement('div');
                testPopup.style.position = 'absolute';
                testPopup.style.top = '-50px';
                testPopup.style.left = '50%';
                testPopup.style.transform = 'translateX(-50%)';
                testPopup.style.background = 'red';
                testPopup.style.color = 'white';
                testPopup.style.padding = '10px';
                testPopup.style.borderRadius = '5px';
                testPopup.style.zIndex = '99999';
                testPopup.textContent = 'TEST POPUP';
                svg.style.position = 'relative';
                svg.appendChild(testPopup);
                console.log('Threadly: Test popup created and appended');
                console.log('Threadly: SVG children count:', svg.children.length);
                
                // Then try the real popup
                popup = createModeSelectionPopup(svg);
                if (popup) {
                    console.log('Threadly: Popup created successfully');
                } else {
                    console.log('Threadly: Popup creation failed');
                }
            }, 300); // Show popup after 300ms hover
        });

        svg.addEventListener('mouseleave', () => {
            console.log('Threadly: Mouse left sparkle');
            clearTimeout(hoverTimeout);
            
            // Remove test popup
            const testPopup = svg.querySelector('div[style*="background: red"]');
            if (testPopup) {
                testPopup.remove();
                console.log('Threadly: Test popup removed');
            }
            
            if (popup) {
                console.log('Threadly: Removing popup');
                popup.remove();
                popup = null;
            }
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
            }
            
            handleSparkleClick();
        });

        // Set proper aria-label for tooltip
        svg.setAttribute('aria-label', 'Refine prompt with AI');
        svg.setAttribute('title', 'Refine prompt with AI');

        return svg;
    }

    // Create mode selection popup
    function createModeSelectionPopup(sparkleElement) {
        console.log('Threadly: Creating mode selection popup');
        console.log('Threadly: Sparkle element:', sparkleElement);
        
        try {
            // Remove existing popup if any
            const existingPopup = document.querySelector('.threadly-mode-popup');
            if (existingPopup) {
                console.log('Threadly: Removing existing popup');
                existingPopup.remove();
            }

            // Create popup container
            console.log('Threadly: Creating popup div element');
            const popup = document.createElement('div');
            popup.className = 'threadly-mode-popup';
            console.log('Threadly: Setting popup innerHTML');
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
            console.log('Threadly: Setting sparkle element position');
            sparkleElement.style.position = 'relative';
            console.log('Threadly: Appending popup to sparkle element');
            sparkleElement.appendChild(popup);
            console.log('Threadly: Popup appended to sparkle element');
            console.log('Threadly: Popup element:', popup);
            console.log('Threadly: Sparkle element position:', sparkleElement.getBoundingClientRect());

            // Show popup with animation
            setTimeout(() => {
                console.log('Threadly: Adding show class to popup');
                popup.classList.add('show');
                console.log('Threadly: Popup classes:', popup.className);
                console.log('Threadly: Popup position:', popup.getBoundingClientRect());
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
        } catch (error) {
            console.error('Threadly: Error creating popup:', error);
            return null;
        }
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