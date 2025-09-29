/**
 * Enhanced Test Script for Threadly Adaptive Triage AI System
 * Demonstrates all the new features: CoT reasoning, anti-hallucination safeguards, 
 * intelligent example management, and monitoring analytics
 */

async function testEnhancedTriageSystem() {
    console.log('🧪 Testing Threadly Enhanced Adaptive Triage AI System...\n');
    
    // Test prompts covering different scenarios
    const testPrompts = [
        {
            prompt: "hey chatgpt i wanna text my girlfriend a birthday message",
            expected: "grammar_spelling",
            description: "Simple conversational request (should use Fast Path)",
            complexity: "simple"
        },
        {
            prompt: "create a photorealistic image of a sunset over mountains with dramatic lighting",
            expected: "image_generation", 
            description: "Clear image generation request (should use Fast Path)",
            complexity: "simple"
        },
        {
            prompt: "write a Python function that calculates fibonacci numbers with memoization",
            expected: "coding",
            description: "Coding request with specific language (should use Fast Path)",
            complexity: "simple"
        },
        {
            prompt: "Apple-like UI design for a mobile app with clean minimalist interface",
            expected: "content_creation",
            description: "Design request (should NOT be confused with coding) - tests anti-hallucination",
            complexity: "complex"
        },
        {
            prompt: "analyze the economic impact of climate change on developing countries",
            expected: "research_analysis",
            description: "Complex research request (should use Smart Path with CoT reasoning)",
            complexity: "complex"
        },
        {
            prompt: "write a blog post about sustainable living practices for beginners",
            expected: "content_creation",
            description: "Content creation request (should use Smart Path)",
            complexity: "complex"
        },
        {
            prompt: "help me understand quantum computing and its applications",
            expected: "research_analysis",
            description: "Educational request (should use Smart Path)",
            complexity: "complex"
        },
        {
            prompt: "thing stuff whatever",
            expected: "general",
            description: "Vague, low-quality prompt (should use Smart Path)",
            complexity: "complex"
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

        // Test each prompt
        for (let i = 0; i < testPrompts.length; i++) {
            const test = testPrompts[i];
            console.log(`\n📝 Test ${i + 1}: ${test.description}`);
            console.log(`Prompt: "${test.prompt}"`);
            console.log(`Expected: ${test.expected} | Complexity: ${test.complexity}`);
            
            try {
                const startTime = performance.now();
                const analysis = await refiner.analyzeContext(test.prompt);
                const endTime = performance.now();
                const processingTime = (endTime - startTime).toFixed(2);
                
                console.log(`🎯 Result: ${analysis.primaryCategory}`);
                console.log(`📊 Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
                console.log(`⭐ Prompt Quality: ${analysis.promptQuality}/100`);
                console.log(`🔧 Refinement Need: ${analysis.refinementNeed.toUpperCase()}`);
                console.log(`🔢 Total Weight: ${analysis.totalWeight}`);
                console.log(`⏱️ Processing Time: ${processingTime}ms`);
                
                // Enhanced logging with reasoning steps
                if (analysis.reasoningSteps && analysis.reasoningSteps.length > 0) {
                    console.log(`🧠 Chain-of-Thought Reasoning:`);
                    analysis.reasoningSteps.forEach((step, index) => {
                        console.log(`   ${index + 1}. ${step}`);
                    });
                }
                
                if (analysis.keyIndicators && analysis.keyIndicators.length > 0) {
                    console.log(`🔍 Key Indicators: ${analysis.keyIndicators.join(', ')}`);
                }
                
                // Check if result matches expected
                const isCorrect = analysis.primaryCategory === test.expected;
                console.log(`${isCorrect ? '✅' : '❌'} Classification: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
                
                if (!isCorrect) {
                    console.log(`   Expected: ${test.expected}, Got: ${analysis.primaryCategory}`);
                }
                
                // Determine which path was used
                const usedFastPath = analysis.totalWeight > 4 && analysis.confidence >= 0.9;
                console.log(`🚀 Path Used: ${usedFastPath ? 'FAST PATH (Keywords/Regex)' : 'SMART PATH (AI Function Calling with CoT)'}`);
                
            } catch (error) {
                console.error(`❌ Error testing prompt:`, error);
            }
        }

        // Test the learning system
        console.log('\n🧠 Testing Enhanced Learning System...');
        await testEnhancedLearningSystem();

        // Test monitoring and analytics
        console.log('\n📊 Testing Monitoring & Analytics...');
        await testMonitoringAnalytics();

        console.log('\n🏁 Enhanced Triage system test completed!');
        
    } catch (error) {
        console.error('❌ Failed to initialize test:', error);
    }
}

async function testEnhancedLearningSystem() {
    try {
        // Test storing feedback with enhanced data
        console.log('📝 Testing enhanced feedback storage...');
        
        const testFeedback = {
            prompt: "Apple-like UI design for mobile app",
            incorrectCategory: "coding",
            correctCategory: "content_creation",
            timestamp: Date.now(),
            source: "user_correction",
            confidence: 0.8,
            user_quality_score: 85
        };

        const response = await chrome.runtime.sendMessage({
            action: 'storeFeedback',
            feedback: testFeedback
        });

        if (response && response.success) {
            console.log('✅ Enhanced feedback stored successfully');
        } else {
            console.log('❌ Failed to store feedback');
        }

        // Test getting Golden Set with quality metrics
        console.log('📚 Testing Golden Set with quality metrics...');
        
        const goldenSetResponse = await chrome.runtime.sendMessage({
            action: 'getGoldenSet'
        });

        if (goldenSetResponse && goldenSetResponse.goldenSet) {
            console.log(`✅ Golden Set retrieved: ${goldenSetResponse.goldenSet.length} examples`);
            if (goldenSetResponse.goldenSet.length > 0) {
                console.log('📋 Sample Golden Set entries with quality scores:');
                goldenSetResponse.goldenSet.slice(0, 3).forEach((example, index) => {
                    console.log(`   ${index + 1}. "${example.prompt}" -> ${example.correct_category} (Quality: ${example.qualityScore || 'N/A'})`);
                });
            }
        } else {
            console.log('ℹ️ No Golden Set available yet (normal for new installations)');
        }

    } catch (error) {
        console.error('❌ Error testing enhanced learning system:', error);
    }
}

async function testMonitoringAnalytics() {
    try {
        // Test feedback statistics
        console.log('📊 Testing feedback statistics...');
        
        const statsResponse = await chrome.runtime.sendMessage({
            action: 'getFeedbackStats'
        });

        if (statsResponse && statsResponse.stats) {
            const stats = statsResponse.stats;
            console.log('✅ Feedback Statistics:');
            console.log(`   Total Feedback: ${stats.totalFeedback}`);
            console.log(`   Golden Set Size: ${stats.goldenSetSize}`);
            console.log(`   Last 24 Hours: ${stats.timeBasedStats?.last24Hours || 0}`);
            console.log(`   Last Week: ${stats.timeBasedStats?.lastWeek || 0}`);
            console.log(`   Average Quality: ${stats.qualityMetrics?.averageQuality || 'N/A'}`);
            console.log(`   System Health: ${JSON.stringify(stats.systemHealth || {})}`);
            
            if (stats.errorPatterns && stats.errorPatterns.length > 0) {
                console.log('   Top Error Patterns:');
                stats.errorPatterns.slice(0, 3).forEach((pattern, index) => {
                    console.log(`     ${index + 1}. ${pattern[0]} (${pattern[1]} times)`);
                });
            }
        } else {
            console.log('ℹ️ No feedback statistics available yet');
        }

        // Test data export
        console.log('📤 Testing data export...');
        
        const exportResponse = await chrome.runtime.sendMessage({
            action: 'exportFeedbackData'
        });

        if (exportResponse && exportResponse.data) {
            const data = exportResponse.data;
            console.log('✅ Data export successful:');
            console.log(`   Export Date: ${data.exportDate}`);
            console.log(`   Total Feedback: ${data.summary.totalFeedback}`);
            console.log(`   Golden Set Size: ${data.summary.goldenSetSize}`);
            console.log(`   Categories: ${data.summary.categories.join(', ')}`);
            console.log(`   Date Range: ${data.summary.dateRange.earliest} to ${data.summary.dateRange.latest}`);
        } else {
            console.log('ℹ️ No data available for export');
        }

    } catch (error) {
        console.error('❌ Error testing monitoring analytics:', error);
    }
}

// Test the enhanced feedback modal UI
function testEnhancedFeedbackModal() {
    console.log('🎯 Testing Enhanced Feedback Modal UI...');
    
    // Simulate a feedback request with enhanced data
    const testEvent = new CustomEvent('threadly-triage-feedback-request', {
        detail: {
            prompt: "Apple-like UI design for mobile app with clean minimalist interface",
            incorrectCategory: "coding"
        }
    });
    
    window.dispatchEvent(testEvent);
    console.log('✅ Enhanced feedback modal should have appeared with better UI');
}

// Test function to simulate undo detection with enhanced feedback
function testEnhancedUndoDetection() {
    console.log('↩️ Testing Enhanced Undo Detection...');
    console.log('To test enhanced undo detection:');
    console.log('1. Use the sparkle button to refine a prompt');
    console.log('2. Press Cmd+Z (Mac) or Ctrl+Z (Windows) to undo');
    console.log('3. The enhanced feedback modal should appear with:');
    console.log('   - Better visual design');
    console.log('   - Category icons and descriptions');
    console.log('   - Quality scoring');
    console.log('   - Enhanced user experience');
}

// Test Chain-of-Thought reasoning
function testChainOfThoughtReasoning() {
    console.log('🧠 Testing Chain-of-Thought Reasoning...');
    console.log('The system now provides step-by-step reasoning for complex prompts:');
    console.log('1. Intent detection beyond keywords');
    console.log('2. Context understanding');
    console.log('3. Key indicator identification');
    console.log('4. Explicit reasoning steps');
    console.log('5. Anti-hallucination safeguards');
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
    console.log('🚀 Threadly Enhanced Triage Test Script Loaded');
    console.log('Available test functions:');
    console.log('- testEnhancedTriageSystem() - Test the full enhanced system');
    console.log('- testEnhancedFeedbackModal() - Test the enhanced feedback modal');
    console.log('- testEnhancedUndoDetection() - Instructions for testing undo detection');
    console.log('- testChainOfThoughtReasoning() - Information about CoT reasoning');
    console.log('\nRun testEnhancedTriageSystem() to start testing!');
}
