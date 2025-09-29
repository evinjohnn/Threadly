/**
 * Simple test for the grammar correction fix
 * Tests the specific "heyy devi youre a bitsh" case
 */

async function testGrammarFix() {
    console.log('🧪 Testing Grammar Fix for "heyy devi youre a bitsh"...\n');
    
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
        
        // Test classification
        console.log('🔍 Testing classification...');
        const analysis = await refiner.analyzeContext(testPrompt);
        console.log(`Category: ${analysis.primaryCategory}`);
        console.log(`Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
        console.log(`Weight: ${analysis.totalWeight}`);
        
        if (analysis.reasoningSteps) {
            console.log('Reasoning:');
            analysis.reasoningSteps.forEach((step, index) => {
                console.log(`  ${index + 1}. ${step}`);
            });
        }
        
        // Test refinement
        if (analysis.primaryCategory === 'grammar_spelling') {
            console.log('\n🔧 Testing refinement...');
            const refinedPrompt = await refiner.refinePrompt(testPrompt, 'chatgpt');
            console.log(`Refined: "${refinedPrompt}"`);
            
            // Check if it's just a correction
            const isJustCorrection = refinedPrompt.length < 100 && 
                                   !refinedPrompt.toLowerCase().includes('help') &&
                                   !refinedPrompt.toLowerCase().includes('explain') &&
                                   !refinedPrompt.toLowerCase().includes('understand');
            
            console.log(`${isJustCorrection ? '✅' : '❌'} Result: ${isJustCorrection ? 'JUST CORRECTION' : 'OVER-EXPANDED'}`);
            
            if (isJustCorrection) {
                console.log('🎉 SUCCESS: The system correctly fixed the spelling without expanding it!');
            } else {
                console.log('⚠️  ISSUE: The system expanded the message instead of just fixing spelling');
            }
        } else {
            console.log(`❌ ISSUE: Expected 'grammar_spelling' but got '${analysis.primaryCategory}'`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        
        if (error.message.includes('Extension context invalidated')) {
            console.log('💡 Suggestion: Try refreshing the page to restore extension context');
        } else if (error.message.includes('API key not found')) {
            console.log('💡 Suggestion: Set your Gemini API key in the extension popup');
        }
    }
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
    console.log('🚀 Threadly Grammar Fix Test Loaded');
    console.log('Run testGrammarFix() to test the specific case!');
}
