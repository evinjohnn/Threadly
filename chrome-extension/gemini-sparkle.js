/**
 * Gemini Sparkle Button Content Script
 * Adds a sparkle button with the same SVG, size, and animation as Claude version
 * next to the mic button in Gemini's text input bar
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

        svg.addEventListener('mouseenter', () => {
            console.log('Threadly: Mouse entered sparkle');
            hoverTimeout = setTimeout(() => {
                console.log('Threadly: Creating popup after hover delay');
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
            
            // If popup is visible, remove it and proceed with autonomous mode
            if (popup) {
                popup.remove();
                popup = null;
            }
            
            handleSparkleClick();
        });
        
        // Add mousedown for immediate feedback
        svg.addEventListener('mousedown', (event) => {
            event.preventDefault();
            event.stopPropagation();
            console.log('Threadly: Sparkle mousedown - immediate feedback');
            // Start animation immediately for better UX
            const sparkleIcon = document.querySelector('[data-threadly-sparkle="true"]');
            if (sparkleIcon) {
                startClickAnimationSequence(sparkleIcon);
            }
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
        console.log('Threadly: ===== GEMINI SPARKLE CLICK HANDLER CALLED =====');
        console.log('Threadly: Sparkle clicked - prompt refine activated!');
        console.log('Threadly: Current URL:', window.location.href);
        console.log('Threadly: Document ready state:', document.readyState);
        console.log('Threadly: PromptRefiner available:', !!window.PromptRefiner);
        console.log('Threadly: All available textareas:', document.querySelectorAll('textarea'));
        console.log('Threadly: All contenteditable elements:', document.querySelectorAll('[contenteditable="true"]'));
        console.log('Threadly: Rich textarea elements:', document.querySelectorAll('rich-textarea'));
        
        // Get current input text from Gemini textarea using specific selector
        // Gemini uses contenteditable div instead of textarea
        const textArea = document.querySelector('textarea[placeholder*="Start typing a prompt"], textarea[aria-label*="Start typing a prompt"], textarea[aria-label*="Type something"], textarea[placeholder*="Type something"], textarea, [contenteditable="true"][role="textbox"], .ql-editor[contenteditable="true"], rich-textarea [contenteditable="true"]');
        
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
            console.log('Threadly: No textarea found with Gemini selectors');
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
        const finalTextArea = textArea || document.querySelector('textarea, [contenteditable="true"][role="textbox"], .ql-editor[contenteditable="true"], rich-textarea [contenteditable="true"]');
        
        if (finalTextArea) {
            // Handle both textarea and contenteditable elements
            let currentText;
            if (finalTextArea.tagName === 'TEXTAREA') {
                currentText = finalTextArea.value;
            } else if (finalTextArea.contentEditable === 'true') {
                // For contenteditable elements, get text content and clean it up
                currentText = finalTextArea.textContent || finalTextArea.innerText;
                // Remove extra whitespace and normalize
                currentText = currentText.replace(/\s+/g, ' ').trim();
            } else {
                currentText = finalTextArea.value || finalTextArea.textContent || finalTextArea.innerText;
            }
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
                    
                    if (finalTextArea.tagName === 'TEXTAREA') {
                        finalTextArea.value = refinedPrompt;
                        console.log('Threadly: Updated textarea value');
                    } else if (finalTextArea.contentEditable === 'true') {
                        // For contenteditable elements, replace the content properly
                        finalTextArea.innerHTML = `<p>${refinedPrompt}</p>`;
                        console.log('Threadly: Updated contenteditable text');
                    } else {
                        finalTextArea.textContent = refinedPrompt;
                        console.log('Threadly: Updated text content');
                    }
                    
                    // Trigger multiple events to ensure Gemini detects the change
                    finalTextArea.dispatchEvent(new Event('input', { bubbles: true }));
                    finalTextArea.dispatchEvent(new Event('change', { bubbles: true }));
                    finalTextArea.dispatchEvent(new Event('keyup', { bubbles: true }));
                    finalTextArea.dispatchEvent(new Event('keydown', { bubbles: true }));
                    finalTextArea.dispatchEvent(new Event('paste', { bubbles: true }));
                    
                    // Additional events for rich text editors
                    if (finalTextArea.contentEditable === 'true') {
                        finalTextArea.dispatchEvent(new Event('blur', { bubbles: true }));
                        finalTextArea.dispatchEvent(new Event('focus', { bubbles: true }));
                        // Trigger on the parent rich-textarea element as well
                        const richTextarea = finalTextArea.closest('rich-textarea');
                        if (richTextarea) {
                            richTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                            richTextarea.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }
                    
                    // Force focus back to the text area
                    finalTextArea.focus();
                    
                    console.log('Threadly: Text replacement completed');
                    
                    console.log('Threadly: Prompt refined successfully');
                    
                    // Dispatch success event
                    window.dispatchEvent(new CustomEvent('threadly-prompt-refined', {
                        detail: { 
                            platform: 'gemini', 
                            originalText: currentText,
                            refinedText: refinedPrompt
                        }
                    }));
                    
                } else {
                    console.error('Threadly: PromptRefiner class not available, trying fallback...');
                    
                    // Fallback: Simple prompt improvement
                    const improvedPrompt = improvePromptFallback(currentText);
                    
                    if (finalTextArea.tagName === 'TEXTAREA') {
                        finalTextArea.value = improvedPrompt;
                        console.log('Threadly: Updated textarea value with fallback');
                    } else if (finalTextArea.contentEditable === 'true') {
                        // For contenteditable elements, replace the content properly
                        finalTextArea.innerHTML = `<p>${improvedPrompt}</p>`;
                        console.log('Threadly: Updated contenteditable text with fallback');
                    } else {
                        finalTextArea.textContent = improvedPrompt;
                        console.log('Threadly: Updated text content with fallback');
                    }
                    
                    // Trigger events
                    finalTextArea.dispatchEvent(new Event('input', { bubbles: true }));
                    finalTextArea.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    // Additional events for rich text editors
                    if (finalTextArea.contentEditable === 'true') {
                        finalTextArea.dispatchEvent(new Event('blur', { bubbles: true }));
                        finalTextArea.dispatchEvent(new Event('focus', { bubbles: true }));
                        // Trigger on the parent rich-textarea element as well
                        const richTextarea = finalTextArea.closest('rich-textarea');
                        if (richTextarea) {
                            richTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                            richTextarea.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }
                    
                    finalTextArea.focus();
                    
                    console.log('Threadly: Fallback prompt improvement completed');
                }
                
            } catch (error) {
                console.error('Threadly: Error refining prompt:', error);
                
                // Dispatch error event
                window.dispatchEvent(new CustomEvent('threadly-prompt-refine-error', {
                    detail: { 
                        platform: 'gemini', 
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
                platform: 'gemini', 
                action: 'prompt-refine'
            }
        }));
    }
    
    // Fallback prompt improvement function (simple version when PromptRefiner is not available)
    function improvePromptFallback(text) {
        console.log('Threadly: Using fallback prompt improvement');
        
        let improved = text.trim();
        
        // Basic improvements
        if (!improved.endsWith('.') && !improved.endsWith('!') && !improved.endsWith('?')) {
            improved += '.';
        }
        
        // Add some basic enhancements
        if (improved.length < 50) {
            improved = `Please provide a detailed and comprehensive response to: ${improved}`;
        } else if (!improved.toLowerCase().includes('please') && !improved.toLowerCase().includes('can you')) {
            improved = `Please ${improved.toLowerCase()}`;
        }
        
        return improved;
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

    // Main function to insert the sparkle icon next to the appropriate button
    function insertSparkleIcon() {
        try {
            console.log('Threadly: Adding sparkle icon to Gemini input area...');
            
            // Check if sparkle already exists
            const existingSparkle = document.querySelector('[data-threadly-sparkle="true"]');
            if (existingSparkle) {
                console.log('Threadly: Sparkle icon already exists, removing duplicates');
                document.querySelectorAll('[data-threadly-sparkle="true"]').forEach(el => el.remove());
            }
            
            // Create the sparkle icon
            const sparkleIcon = createSparkleIcon();
            
            // Style the sparkle icon
            sparkleIcon.style.display = 'inline-block';
            sparkleIcon.style.verticalAlign = 'middle';
            sparkleIcon.style.position = 'relative';
            sparkleIcon.style.top = '0';
            sparkleIcon.style.marginLeft = '0px';
            sparkleIcon.style.marginRight = '8px';
            sparkleIcon.style.alignSelf = 'center';
            
            // Check current state: mic visible or send visible
            const micContainer = document.querySelector('.mic-button-container');
            const sendContainer = document.querySelector('.send-button-container');
            
            let targetContainer = null;
            let targetButton = null;
            
            // Determine which container to use based on visibility
            if (micContainer && !micContainer.classList.contains('hidden') && sendContainer && sendContainer.classList.contains('hidden')) {
                // Mic is visible, send is hidden - use mic container
                console.log('Threadly: Using mic button container (mic visible, send hidden)');
                targetContainer = micContainer;
                targetButton = micContainer.querySelector('speech-dictation-mic-button');
            } else if (micContainer && micContainer.classList.contains('hidden') && sendContainer && !sendContainer.classList.contains('hidden')) {
                // Mic is hidden, send is visible - use send container
                console.log('Threadly: Using send button container (mic hidden, send visible)');
                targetContainer = sendContainer;
                targetButton = sendContainer.querySelector('button[aria-label*="Send message"]');
            } else if (micContainer && !micContainer.classList.contains('hidden')) {
                // Mic is visible - use mic container
                console.log('Threadly: Using mic button container (mic visible)');
                targetContainer = micContainer;
                targetButton = micContainer.querySelector('speech-dictation-mic-button');
            } else if (sendContainer && !sendContainer.classList.contains('hidden')) {
                // Send is visible - use send container
                console.log('Threadly: Using send button container (send visible)');
                targetContainer = sendContainer;
                targetButton = sendContainer.querySelector('button[aria-label*="Send message"]');
            }
            
            if (!targetContainer || !targetButton) {
                throw new Error("Could not find appropriate button container");
            }
            
            console.log('Threadly: Target container:', targetContainer);
            console.log('Threadly: Target button:', targetButton);
            
            // Ensure container is flex with proper alignment
            targetContainer.style.display = 'flex';
            targetContainer.style.alignItems = 'center';
            targetContainer.style.gap = '8px';
            targetContainer.style.flexDirection = 'row';
            
            // Remove any existing sparkles first
            const existingSparkles = targetContainer.querySelectorAll('[data-threadly-sparkle="true"]');
            existingSparkles.forEach(sparkle => sparkle.remove());
            
            // Insert sparkle right before the target button
            try {
                targetButton.parentNode.insertBefore(sparkleIcon, targetButton);
                console.log('Threadly: SUCCESS - Sparkle inserted before target button');
            } catch (error) {
                console.error('Threadly: Insert before target button failed:', error);
                // Fallback: append to target container
                targetContainer.appendChild(sparkleIcon);
                console.log('Threadly: FALLBACK - Sparkle appended to target container');
            }
            
            // Check if sparkle was inserted
            const insertedSparkle = document.querySelector('[data-threadly-sparkle="true"]');
            if (insertedSparkle) {
                console.log('Threadly: SUCCESS - Sparkle is now in DOM');
                console.log('Threadly: Sparkle parent:', insertedSparkle.parentElement);
            } else {
                console.error('Threadly: FAILED - Sparkle not found in DOM');
            }
            
            console.log("Threadly: Successfully added sparkle icon to Gemini input area");
            
            // Dispatch success event
            window.dispatchEvent(new CustomEvent('threadly-sparkle-inserted', {
                detail: { platform: 'gemini', success: true }
            }));
            
        } catch (error) {
            console.error("Threadly: Error inserting sparkle icon:", error);
            
            // Dispatch error event
            window.dispatchEvent(new CustomEvent('threadly-sparkle-error', {
                detail: { platform: 'gemini', error: error.message }
            }));
        }
    }

    // Check if we're on Gemini's website
    function isGeminiWebsite() {
        return window.location.hostname === 'gemini.google.com' || 
               window.location.hostname.includes('gemini.google.com');
    }

    // Global flag to prevent infinite loops
    let isInsertingSparkle = false;

    // Initialize when page loads
    function initialize() {
        console.log('Threadly: Gemini Sparkle Extension initializing...');
        
        // Wait for Gemini's interface to load
        setTimeout(() => {
            if (!isInsertingSparkle) {
                isInsertingSparkle = true;
                insertSparkleIcon();
                isInsertingSparkle = false;
            }
        }, 3000);
        
        // Also check periodically to ensure sparkle stays in place and is positioned correctly
        setInterval(() => {
            // Skip if we're currently inserting a sparkle to prevent infinite loops
            if (isInsertingSparkle) {
                return;
            }
            
            const existingSparkles = document.querySelectorAll('[data-threadly-sparkle="true"]');
            if (existingSparkles.length === 0) {
                console.log('Threadly: Periodic check - re-adding missing sparkle icon');
                isInsertingSparkle = true;
                insertSparkleIcon();
                isInsertingSparkle = false;
            } else if (existingSparkles.length > 1) {
                console.log('Threadly: Periodic check - removing duplicate sparkles');
                // Keep only the first one, remove the rest
                for (let i = 1; i < existingSparkles.length; i++) {
                    existingSparkles[i].remove();
                }
            } else {
                // Check if sparkle needs to be repositioned based on current state
                const sparkle = existingSparkles[0];
                const micContainer = document.querySelector('.mic-button-container');
                const sendContainer = document.querySelector('.send-button-container');
                
                // Check if sparkle is already in the correct position
                let needsRepositioning = false;
                
                // If mic container is hidden and send container is visible, sparkle should be in send container
                if (micContainer && micContainer.classList.contains('hidden') && sendContainer && !sendContainer.classList.contains('hidden')) {
                    if (!sendContainer.contains(sparkle)) {
                        needsRepositioning = true;
                        console.log('Threadly: Periodic check - moving sparkle to send button container (mic hidden)');
                    }
                }
                // If mic container is visible and send container is hidden, sparkle should be in mic container
                else if (micContainer && !micContainer.classList.contains('hidden') && sendContainer && sendContainer.classList.contains('hidden')) {
                    if (!micContainer.contains(sparkle)) {
                        needsRepositioning = true;
                        console.log('Threadly: Periodic check - moving sparkle to mic button container (send hidden)');
                    }
                }
                // If both are visible, check if sparkle is in the correct position
                else if (micContainer && !micContainer.classList.contains('hidden')) {
                    const speechDictationComponent = document.querySelector('speech-dictation-mic-button');
                    if (speechDictationComponent && speechDictationComponent.previousElementSibling !== sparkle) {
                        needsRepositioning = true;
                        console.log('Threadly: Periodic check - repositioning sparkle before speech-dictation-mic-button component');
                    }
                }
                
                // Only reposition if needed
                if (needsRepositioning) {
                    sparkle.remove();
                    isInsertingSparkle = true;
                    insertSparkleIcon();
                    isInsertingSparkle = false;
                }
            }
        }, 5000); // Check every 5 seconds
        
        // Add input listener to textarea to ensure sparkle positioning when typing
        const addTextareaListener = () => {
            const textarea = document.querySelector('textarea, [contenteditable="true"][role="textbox"], .ql-editor[contenteditable="true"], rich-textarea [contenteditable="true"]');
            if (textarea) {
                textarea.addEventListener('input', () => {
                    // Skip if we're currently inserting a sparkle to prevent infinite loops
                    if (isInsertingSparkle) {
                        return;
                    }
                    
                    // Check and fix sparkle positioning after typing
                    setTimeout(() => {
                        const existingSparkles = document.querySelectorAll('[data-threadly-sparkle="true"]');
                        if (existingSparkles.length === 0) {
                            console.log('Threadly: Re-adding missing sparkle after textarea input');
                            isInsertingSparkle = true;
                            insertSparkleIcon();
                            isInsertingSparkle = false;
                        } else if (existingSparkles.length > 1) {
                            console.log('Threadly: Removing duplicate sparkles after textarea input');
                            // Keep only the first one, remove the rest
                            for (let i = 1; i < existingSparkles.length; i++) {
                                existingSparkles[i].remove();
                            }
                        } else {
                            // Check if sparkle needs to be repositioned based on current state
                            const sparkle = existingSparkles[0];
                            const micContainer = document.querySelector('.mic-button-container');
                            const sendContainer = document.querySelector('.send-button-container');
                            
                            // Check if sparkle is already in the correct position
                            let needsRepositioning = false;
                            
                            // If mic container is hidden and send container is visible, sparkle should be in send container
                            if (micContainer && micContainer.classList.contains('hidden') && sendContainer && !sendContainer.classList.contains('hidden')) {
                                if (!sendContainer.contains(sparkle)) {
                                    needsRepositioning = true;
                                    console.log('Threadly: Moving sparkle to send button container after textarea input (mic hidden)');
                                }
                            }
                            // If mic container is visible and send container is hidden, sparkle should be in mic container
                            else if (micContainer && !micContainer.classList.contains('hidden') && sendContainer && sendContainer.classList.contains('hidden')) {
                                if (!micContainer.contains(sparkle)) {
                                    needsRepositioning = true;
                                    console.log('Threadly: Moving sparkle to mic button container after textarea input (send hidden)');
                                }
                            }
                            // If both are visible, check if sparkle is in the correct position
                            else if (micContainer && !micContainer.classList.contains('hidden')) {
                                const speechDictationComponent = document.querySelector('speech-dictation-mic-button');
                                if (speechDictationComponent && speechDictationComponent.previousElementSibling !== sparkle) {
                                    needsRepositioning = true;
                                    console.log('Threadly: Repositioning sparkle before speech-dictation-mic-button component after textarea input');
                                }
                            }
                            
                            // Only reposition if needed
                            if (needsRepositioning) {
                                sparkle.remove();
                                isInsertingSparkle = true;
                                insertSparkleIcon();
                                isInsertingSparkle = false;
                            }
                        }
                    }, 200);
                });
            }
        };
        
        // Add listener immediately and also periodically
        addTextareaListener();
        setInterval(() => {
            if (!isInsertingSparkle) {
                addTextareaListener();
            }
        }, 3000);
        
        // Watch for dynamic content changes and ensure proper positioning
        const observer = new MutationObserver((mutations) => {
            // Skip if we're currently inserting a sparkle to prevent infinite loops
            if (isInsertingSparkle) {
                return;
            }
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any of the added nodes are our sparkle icons
                    let hasSparkle = false;
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.hasAttribute && node.hasAttribute('data-threadly-sparkle')) {
                                hasSparkle = true;
                            } else if (node.querySelector && node.querySelector('[data-threadly-sparkle="true"]')) {
                                hasSparkle = true;
                            }
                        }
                    });
                    
                    // Skip if we just added a sparkle to prevent infinite loops
                    if (hasSparkle) {
                        return;
                    }
                    
                    // Check and fix sparkle positioning after DOM changes
                    setTimeout(() => {
                        const existingSparkles = document.querySelectorAll('[data-threadly-sparkle="true"]');
                        if (existingSparkles.length === 0) {
                            console.log('Threadly: Re-adding missing sparkle icon after DOM change');
                            isInsertingSparkle = true;
                            insertSparkleIcon();
                            isInsertingSparkle = false;
                        } else if (existingSparkles.length > 1) {
                            console.log('Threadly: Removing duplicate sparkles after DOM change');
                            // Keep only the first one, remove the rest
                            for (let i = 1; i < existingSparkles.length; i++) {
                                existingSparkles[i].remove();
                            }
                        } else {
                            // Check if sparkle needs to be repositioned based on current state
                            const sparkle = existingSparkles[0];
                            const micContainer = document.querySelector('.mic-button-container');
                            const sendContainer = document.querySelector('.send-button-container');
                            
                            // Check if sparkle is already in the correct position
                            let needsRepositioning = false;
                            
                            // If mic container is hidden and send container is visible, sparkle should be in send container
                            if (micContainer && micContainer.classList.contains('hidden') && sendContainer && !sendContainer.classList.contains('hidden')) {
                                if (!sendContainer.contains(sparkle)) {
                                    needsRepositioning = true;
                                    console.log('Threadly: Moving sparkle to send button container after DOM change (mic hidden)');
                                }
                            }
                            // If mic container is visible and send container is hidden, sparkle should be in mic container
                            else if (micContainer && !micContainer.classList.contains('hidden') && sendContainer && sendContainer.classList.contains('hidden')) {
                                if (!micContainer.contains(sparkle)) {
                                    needsRepositioning = true;
                                    console.log('Threadly: Moving sparkle to mic button container after DOM change (send hidden)');
                                }
                            }
                            // If both are visible, check if sparkle is in the correct position
                            else if (micContainer && !micContainer.classList.contains('hidden')) {
                                const speechDictationComponent = document.querySelector('speech-dictation-mic-button');
                                if (speechDictationComponent && speechDictationComponent.previousElementSibling !== sparkle) {
                                    needsRepositioning = true;
                                    console.log('Threadly: Repositioning sparkle before speech-dictation-mic-button component after DOM change');
                                }
                            }
                            
                            // Only reposition if needed
                            if (needsRepositioning) {
                                sparkle.remove();
                                isInsertingSparkle = true;
                                insertSparkleIcon();
                                isInsertingSparkle = false;
                            }
                        }
                    }, 1000); // Slower response to avoid repositioning during typing
                }
            });
        });
        
        // Also watch for class changes on the containers to detect state changes immediately
        const classObserver = new MutationObserver((mutations) => {
            // Skip if we're currently inserting a sparkle to prevent infinite loops
            if (isInsertingSparkle) {
                return;
            }
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('mic-button-container') || target.classList.contains('send-button-container')) {
                        console.log('Threadly: Container class changed, checking sparkle position');
                        setTimeout(() => {
                            const existingSparkles = document.querySelectorAll('[data-threadly-sparkle="true"]');
                            if (existingSparkles.length > 0) {
                                const sparkle = existingSparkles[0];
                                const micContainer = document.querySelector('.mic-button-container');
                                const sendContainer = document.querySelector('.send-button-container');
                                
                                // Check if sparkle is already in the correct position
                                let needsRepositioning = false;
                                
                                // If mic container is hidden and send container is visible, sparkle should be in send container
                                if (micContainer && micContainer.classList.contains('hidden') && sendContainer && !sendContainer.classList.contains('hidden')) {
                                    if (!sendContainer.contains(sparkle)) {
                                        needsRepositioning = true;
                                        console.log('Threadly: Moving sparkle to send button container after class change (mic hidden)');
                                    }
                                }
                                // If mic container is visible and send container is hidden, sparkle should be in mic container
                                else if (micContainer && !micContainer.classList.contains('hidden') && sendContainer && sendContainer.classList.contains('hidden')) {
                                    if (!micContainer.contains(sparkle)) {
                                        needsRepositioning = true;
                                        console.log('Threadly: Moving sparkle to mic button container after class change (send hidden)');
                                    }
                                }
                                
                                // Only reposition if needed
                                if (needsRepositioning) {
                                    sparkle.remove();
                                    isInsertingSparkle = true;
                                    insertSparkleIcon();
                                    isInsertingSparkle = false;
                                }
                            }
                        }, 100);
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Observe class changes on the containers
        const micContainer = document.querySelector('.mic-button-container');
        const sendContainer = document.querySelector('.send-button-container');
        if (micContainer) {
            classObserver.observe(micContainer, { attributes: true, attributeFilter: ['class'] });
        }
        if (sendContainer) {
            classObserver.observe(sendContainer, { attributes: true, attributeFilter: ['class'] });
        }
        
        // Also observe any new containers that might be added
        const containerObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const micContainer = node.querySelector ? node.querySelector('.mic-button-container') : null;
                            const sendContainer = node.querySelector ? node.querySelector('.send-button-container') : null;
                            if (micContainer) {
                                classObserver.observe(micContainer, { attributes: true, attributeFilter: ['class'] });
                            }
                            if (sendContainer) {
                                classObserver.observe(sendContainer, { attributes: true, attributeFilter: ['class'] });
                            }
                        }
                    });
                }
            });
        });
        
        containerObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize only if on Gemini's website
    if (isGeminiWebsite()) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
        } else {
            initialize();
        }
    }

    // Export for testing and debugging
    window.ThreadlyGeminiSparkle = {
        insertSparkleIcon,
        createSparkleIcon,
        handleSparkleClick,
        isGeminiWebsite
    };
    
    // Also make handleSparkleClick globally accessible for testing
    window.handleGeminiSparkleClick = handleSparkleClick;

})();
