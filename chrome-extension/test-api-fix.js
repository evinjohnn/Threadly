/**
 * Test script to verify the API fix works
 * Tests the specific "heyy devi youre a bitsh" case with the corrected API call
 */

async function testAPIFix() {
    console.log('🧪 Testing API Fix for "heyy devi youre a bitsh"...\n');
    
    if (typeof PromptRefiner === 'undefined') {
        console.error('❌ PromptRefiner not found. Make sure Threadly extension is loaded.');
        return;
    }

    const refiner = new PromptRefiner();
    
    try {
        // Try to initialize with fallback
        const initialized = await refiner.initializeWithFallback();
        if (!initialized) {
            console.error('❌ Failed to initialize PromptRefiner. Check API key.');
            return;
        }

        console.log('✅ PromptRefiner initialized successfully\n');

        const testPrompt = "heyy devi youre a bitsh";
        console.log(`Input: "${testPrompt}"`);
        
        // Test the full refinement process
        console.log('🔍 Testing full refinement process...');
        const refinedPrompt = await refiner.refinePrompt(testPrompt, 'chatgpt');
        console.log(`Refined: "${refinedPrompt}"`);
        
        // Check if it's just a correction
        const isJustCorrection = refinedPrompt.length < 100 && 
                               !refinedPrompt.toLowerCase().includes('help') &&
                               !refinedPrompt.toLowerCase().includes('explain') &&
                               !refinedPrompt.toLowerCase().includes('understand') &&
                               !refinedPrompt.toLowerCase().includes('research');
        
        console.log(`${isJustCorrection ? '✅' : '❌'} Result: ${isJustCorrection ? 'JUST CORRECTION' : 'OVER-EXPANDED'}`);
        
        if (isJustCorrection) {
            console.log('🎉 SUCCESS: The system correctly fixed the spelling without expanding it!');
        } else {
            console.log('⚠️  ISSUE: The system expanded the message instead of just fixing spelling');
            console.log('Expected: Simple grammar/spelling correction');
            console.log('Got: Expanded response with explanations');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        
        if (error.message.includes('Extension context invalidated')) {
            console.log('💡 Suggestion: Try refreshing the page to restore extension context');
        } else if (error.message.includes('API key not found')) {
            console.log('💡 Suggestion: Set your Gemini API key in the extension popup');
        } else if (error.message.includes('Invalid JSON payload')) {
            console.log('💡 Suggestion: API format issue - check the request structure');
        } else if (error.message.includes('400')) {
            console.log('💡 Suggestion: Bad request - check API parameters');
        }
    }
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
    console.log('🚀 Threadly API Fix Test Loaded');
    console.log('Run testAPIFix() to test the corrected API call!');
}
