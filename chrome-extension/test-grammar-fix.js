/**
 * Test script specifically for grammar/spelling correction issues
 * Tests the "heyy devi youre a bitsh" case and similar casual messages
 */

async function testGrammarSpellingFixes() {
    console.log('🧪 Testing Grammar/Spelling Correction Fixes...\n');
    
    // Test cases that should be classified as grammar_spelling
    const testCases = [
        {
            prompt: "heyy devi youre a bitsh",
            expected: "grammar_spelling",
            description: "Casual message with spelling errors",
            expectedOutput: "Hey Devi, you're a bitch"
        },
        {
            prompt: "wanna text my girlfriend",
            expected: "grammar_spelling", 
            description: "Casual message with contractions",
            expectedOutput: "Want to text my girlfriend" // or "Wanna text my girlfriend"
        },
        {
            prompt: "dont wanna go",
            expected: "grammar_spelling",
            description: "Casual message with contractions",
            expectedOutput: "Don't want to go" // or "Don't wanna go"
        },
        {
            prompt: "hey chatgpt fix my spelling",
            expected: "grammar_spelling",
            description: "Explicit spelling correction request",
            expectedOutput: "Hey ChatGPT, fix my spelling"
        },
        {
            prompt: "write a message to my boss",
            expected: "grammar_spelling",
            description: "Simple message writing request",
            expectedOutput: "Write a message to my boss"
        },
        {
            prompt: "help me write a birthday message",
            expected: "grammar_spelling",
            description: "Birthday message request",
            expectedOutput: "Help me write a birthday message"
        }
    ];

    // Check if PromptRefiner is available
    if (typeof PromptRefiner === 'undefined') {
        console.error('❌ PromptRefiner not found. Make sure Threadly extension is loaded.');
        return;
    }

    const refiner = new PromptRefiner();
    
    try {
        const initialized = await refiner.initialize();
        if (!initialized) {
            console.error('❌ Failed to initialize PromptRefiner. Check API key.');
            return;
        }

        console.log('✅ PromptRefiner initialized successfully\n');

        // Test each case
        for (let i = 0; i < testCases.length; i++) {
            const test = testCases[i];
            console.log(`\n📝 Test ${i + 1}: ${test.description}`);
            console.log(`Input: "${test.prompt}"`);
            console.log(`Expected Category: ${test.expected}`);
            console.log(`Expected Output: "${test.expectedOutput}"`);
            
            try {
                // Test classification
                const analysis = await refiner.analyzeContext(test.prompt);
                console.log(`🎯 Classified as: ${analysis.primaryCategory}`);
                console.log(`📊 Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
                console.log(`🔢 Weight: ${analysis.totalWeight}`);
                
                // Check if classification is correct
                const isCorrectCategory = analysis.primaryCategory === test.expected;
                console.log(`${isCorrectCategory ? '✅' : '❌'} Category: ${isCorrectCategory ? 'CORRECT' : 'INCORRECT'}`);
                
                if (!isCorrectCategory) {
                    console.log(`   Expected: ${test.expected}, Got: ${analysis.primaryCategory}`);
                }
                
                // Test refinement if it's grammar_spelling
                if (analysis.primaryCategory === 'grammar_spelling') {
                    console.log('🔧 Testing refinement...');
                    const refinedPrompt = await refiner.refinePrompt(test.prompt, 'chatgpt');
                    console.log(`Refined: "${refinedPrompt}"`);
                    
                    // Check if the output is reasonable (not expanded into research)
                    const isReasonable = refinedPrompt.length < test.prompt.length * 3 && 
                                       !refinedPrompt.toLowerCase().includes('help') &&
                                       !refinedPrompt.toLowerCase().includes('explain') &&
                                       !refinedPrompt.toLowerCase().includes('understand');
                    
                    console.log(`${isReasonable ? '✅' : '❌'} Refinement: ${isReasonable ? 'REASONABLE' : 'OVER-EXPANDED'}`);
                    
                    if (!isReasonable) {
                        console.log('   ⚠️  The refinement expanded the message too much or turned it into a research request');
                    }
                }
                
            } catch (error) {
                console.error(`❌ Error testing case:`, error);
            }
        }

        console.log('\n🏁 Grammar/Spelling correction test completed!');
        
    } catch (error) {
        console.error('❌ Failed to initialize test:', error);
    }
}

// Test the specific problematic case
async function testSpecificCase() {
    console.log('🎯 Testing the specific problematic case...\n');
    
    if (typeof PromptRefiner === 'undefined') {
        console.error('❌ PromptRefiner not found.');
        return;
    }

    const refiner = new PromptRefiner();
    await refiner.initialize();
    
    const problematicPrompt = "heyy devi youre a bitsh";
    console.log(`Input: "${problematicPrompt}"`);
    
    try {
        // Test classification
        const analysis = await refiner.analyzeContext(problematicPrompt);
        console.log(`Classification: ${analysis.primaryCategory}`);
        console.log(`Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
        console.log(`Weight: ${analysis.totalWeight}`);
        
        if (analysis.reasoningSteps) {
            console.log('Reasoning Steps:');
            analysis.reasoningSteps.forEach((step, index) => {
                console.log(`  ${index + 1}. ${step}`);
            });
        }
        
        if (analysis.keyIndicators) {
            console.log(`Key Indicators: ${analysis.keyIndicators.join(', ')}`);
        }
        
        // Test refinement
        if (analysis.primaryCategory === 'grammar_spelling') {
            console.log('\n🔧 Testing refinement...');
            const refinedPrompt = await refiner.refinePrompt(problematicPrompt, 'chatgpt');
            console.log(`Refined: "${refinedPrompt}"`);
            
            // Check if it's just a correction, not an expansion
            const isJustCorrection = refinedPrompt.length < 100 && 
                                   !refinedPrompt.toLowerCase().includes('help') &&
                                   !refinedPrompt.toLowerCase().includes('explain') &&
                                   !refinedPrompt.toLowerCase().includes('understand');
            
            console.log(`${isJustCorrection ? '✅' : '❌'} Result: ${isJustCorrection ? 'JUST CORRECTION' : 'OVER-EXPANDED'}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
    console.log('🚀 Threadly Grammar Fix Test Script Loaded');
    console.log('Available test functions:');
    console.log('- testGrammarSpellingFixes() - Test all grammar/spelling cases');
    console.log('- testSpecificCase() - Test the specific "heyy devi youre a bitsh" case');
    console.log('\nRun testSpecificCase() to test the problematic case!');
}
