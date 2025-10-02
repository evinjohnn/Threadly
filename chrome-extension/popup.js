/**
 * Threadly Prompt Refiner - Popup Script
 * Handles API key management and popup UI interactions
 */

document.addEventListener('DOMContentLoaded', async function() {
    const apiKeyInput = document.getElementById('apiKey');
    const saveBtn = document.getElementById('saveBtn');
    const statusDiv = document.getElementById('status');
    const form = document.getElementById('apiKeyForm');
    const ratingBtn = document.getElementById('ratingBtn');
    const communityBtn = document.getElementById('communityBtn');
    const guideBtn = document.getElementById('guideBtn');
    const reportBtn = document.getElementById('reportBtn');
    const donateBtn = document.getElementById('donateBtn');

    // Add help text dynamically
    const helpText = document.createElement('div');
    helpText.innerHTML = `
        <div style="margin-top: 4px; font-size: 10px; color: #999999; text-align: center;">
            Get your key at <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: #00bfae; text-decoration: none;">Google AI Studio</a>
        </div>
    `;
    form.appendChild(helpText);

    // Load saved API key
    try {
        const result = await chrome.storage.local.get(['geminiApiKey']);
        if (result.geminiApiKey) {
            apiKeyInput.value = result.geminiApiKey;
            showStatus('API key successfully loaded', 'success');
        } else {
            showStatus('API key not found - please enter your Gemini API key', 'error');
        }
    } catch (error) {
        console.error('Failed to load API key:', error);
        showStatus('Failed to load saved API key', 'error');
    }

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus('Please enter your Gemini API key', 'error');
            return;
        }

        // Validate API key format (basic validation)
        if (!isValidApiKey(apiKey)) {
            showStatus('Incorrect or invalid API key format', 'error');
            return;
        }

        // Save API key
        try {
            await chrome.storage.local.set({ geminiApiKey: apiKey });
            showStatus('API key successfully loaded', 'success');
            
            // Test the API key
            await testApiKey(apiKey);
            
        } catch (error) {
            console.error('Failed to save API key:', error);
            showStatus('Failed to save API key. Please try again.', 'error');
        }
    });

    // Handle input changes
    apiKeyInput.addEventListener('input', function() {
        clearStatus();
    });

    // Handle Enter key
    apiKeyInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            form.dispatchEvent(new Event('submit'));
        }
    });

    // Handle community button click
    communityBtn.addEventListener('click', function() {
        // Open the r/ThreadlyExtension subreddit
        chrome.tabs.create({
            url: 'https://www.reddit.com/r/ThreadlyExtension'
        });
    });

    // Add right-click context menu for community button to restart tooltips
    communityBtn.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        // Send message to content script to restart tooltips
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'restartTooltips'}, function(response) {
                if (chrome.runtime.lastError) {
                    console.log('Could not restart tooltips:', chrome.runtime.lastError);
                } else {
                    showStatus('Tooltips restarted! Check the current tab.', 'success');
                }
            });
        });
    });

    // Handle rating button click
    ratingBtn.addEventListener('click', function() {
        chrome.tabs.create({
            url: 'https://chromewebstore.google.com/detail/gnnpjnaahnccnccaaaegapdnplkhfckh'
        });
    });

    // Handle Guide button click
    guideBtn.addEventListener('click', function() {
        // Create a new tab with the Arcade embed
        chrome.tabs.create({
            url: 'https://demo.arcade.software/HoiRhuZIDigdNmWQPgy0?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true'
        });
    });

    // Handle Report button click
    reportBtn.addEventListener('click', function() {
        chrome.tabs.create({
            url: 'https://github.com/evinjohnn/threadly/issues'
        });
    });

    // Handle Donate button click
    donateBtn.addEventListener('click', function() {
        chrome.tabs.create({
            url: 'https://ko-fi.com/evinjohnn'
        });
    });
});

function isValidApiKey(apiKey) {
    // Basic validation for Gemini API key format
    // Gemini API keys typically start with 'AIza' and are 39 characters long
    return apiKey.startsWith('AIza') && apiKey.length === 39;
}

async function testApiKey(apiKey) {
    const testPrompt = "Test prompt for API validation";
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: testPrompt
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 10
                }
            })
        });

        if (response.ok) {
            showStatus('API key validated successfully! Extension is ready to use.', 'success');
        } else {
            const errorData = await response.json();
            showStatus(`API key validation failed: ${errorData.error?.message || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        console.error('API key test failed:', error);
        showStatus('API key validation failed. Please check your internet connection.', 'error');
    }
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status show ${type}`;
}

function clearStatus() {
    const statusDiv = document.getElementById('status');
    statusDiv.className = 'status';
    statusDiv.textContent = '';
}

// Handle popup window events
window.addEventListener('beforeunload', function() {
    // Clean up any pending operations
    clearStatus();
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        document.getElementById('apiKeyForm').dispatchEvent(new Event('submit'));
    }
});
