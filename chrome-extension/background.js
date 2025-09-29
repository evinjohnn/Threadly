/**
 * Threadly Background Service Worker
 * Handles autonomous learning and Golden Set curation
 */

// Initialize the background service
chrome.runtime.onInstalled.addListener(() => {
    console.log('Threadly: Background service installed');
    
    // Create the daily curation alarm
    chrome.alarms.create('curateFeedbackAlarm', { 
        periodInMinutes: 1440 // Run once a day (24 hours)
    });
    
    // Also run immediately on install for initial setup
    curateGoldenSet();
});

// Handle alarm events
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'curateFeedbackAlarm') {
        console.log('Threadly: Running daily Golden Set curation...');
        await curateGoldenSet();
    }
});

// Listen for feedback events from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'storeFeedback') {
        storeFeedback(request.feedback).then(() => {
            sendResponse({ success: true });
        });
        return true; // Keep the message channel open for async response
    }
    
    if (request.action === 'getGoldenSet') {
        getGoldenSet().then(goldenSet => {
            sendResponse({ goldenSet });
        });
        return true;
    }
    
    if (request.action === 'getFeedbackStats') {
        getFeedbackStats().then(stats => {
            sendResponse({ stats });
        });
        return true;
    }
    
    if (request.action === 'exportFeedbackData') {
        exportFeedbackData().then(data => {
            sendResponse({ data });
        });
        return true;
    }
});

/**
 * Store user feedback for learning
 */
async function storeFeedback(feedback) {
    try {
        const { triageFeedback = [] } = await chrome.storage.local.get('triageFeedback');
        
        // Add the new feedback entry
        const feedbackEntry = {
            prompt: feedback.prompt,
            incorrect_category: feedback.incorrectCategory,
            correct_category: feedback.correctCategory,
            timestamp: Date.now(),
            confidence: feedback.confidence || 0.5
        };
        
        triageFeedback.push(feedbackEntry);
        
        // Keep only the last 1000 feedback entries to prevent storage bloat
        if (triageFeedback.length > 1000) {
            triageFeedback.splice(0, triageFeedback.length - 1000);
        }
        
        await chrome.storage.local.set({ triageFeedback });
        console.log('Threadly: Feedback stored successfully', feedbackEntry);
        
    } catch (error) {
        console.error('Threadly: Failed to store feedback:', error);
    }
}

/**
 * Get the current Golden Set
 */
async function getGoldenSet() {
    try {
        const { goldenSetExamples = [] } = await chrome.storage.local.get('goldenSetExamples');
        return goldenSetExamples;
    } catch (error) {
        console.error('Threadly: Failed to get Golden Set:', error);
        return [];
    }
}

/**
 * Curate the Golden Set from user feedback with intelligent quality-based pruning
 */
async function curateGoldenSet() {
    try {
        const { triageFeedback = [] } = await chrome.storage.local.get('triageFeedback');
        
        if (triageFeedback.length === 0) {
            console.log('Threadly: No feedback available for curation');
            return;
        }

        console.log(`Threadly: Curating Golden Set from ${triageFeedback.length} feedback entries`);

        // --- Enhanced Curation Logic with Quality-Based Pruning ---
        
        // 1. Count the most common misclassifications
        const errorPatterns = {};
        const categoryErrors = {};
        
        triageFeedback.forEach(item => {
            const patternKey = `${item.incorrect_category}->${item.correct_category}`;
            errorPatterns[patternKey] = (errorPatterns[patternKey] || 0) + 1;
            
            categoryErrors[item.incorrect_category] = (categoryErrors[item.incorrect_category] || 0) + 1;
        });

        // 2. Calculate quality scores for each feedback entry
        const scoredFeedback = triageFeedback.map(item => {
            const now = Date.now();
            const age = now - item.timestamp;
            const ageInDays = age / (1000 * 60 * 60 * 24);
            
            // Multi-factor quality scoring
            let qualityScore = 0;
            
            // Recency score (newer = higher score, max 30 points)
            qualityScore += Math.max(0, 30 - ageInDays);
            
            // User quality score (if available, max 20 points)
            if (item.user_quality_score) {
                qualityScore += (item.user_quality_score / 100) * 20;
            } else {
                qualityScore += 10; // Default middle score
            }
            
            // Confidence score (max 20 points)
            if (item.confidence) {
                qualityScore += item.confidence * 20;
            } else {
                qualityScore += 10; // Default middle score
            }
            
            // Reasoning quality (max 15 points) - based on prompt length and specificity
            const promptLength = item.prompt.length;
            if (promptLength > 50 && promptLength < 200) {
                qualityScore += 15; // Optimal length
            } else if (promptLength > 20 && promptLength < 500) {
                qualityScore += 10; // Good length
            } else {
                qualityScore += 5; // Basic score
            }
            
            // Error pattern frequency (max 15 points)
            const patternKey = `${item.incorrect_category}->${item.correct_category}`;
            const patternFreq = errorPatterns[patternKey] || 1;
            qualityScore += Math.min(15, Math.log(patternFreq) * 5);
            
            return {
                ...item,
                qualityScore: qualityScore
            };
        });

        // 3. Select the top 50 best examples using stratified sampling
        const NUM_EXAMPLES = 50; // Increased size for better learning
        const goldenSet = [];

        // Sort by quality score (highest first)
        const sortedFeedback = scoredFeedback.sort((a, b) => b.qualityScore - a.qualityScore);

        // Stratified sampling to ensure diversity
        const uniquePrompts = new Set();
        const categoryCounts = {};
        const minPerCategory = 5; // Ensure at least 5 examples per category
        const maxPerCategory = 10; // Max 10 examples per category

        // First pass: Ensure minimum examples per category
        const categories = ['grammar_spelling', 'image_generation', 'coding', 'research_analysis', 'content_creation', 'general'];
        
        for (const category of categories) {
            const categoryExamples = sortedFeedback
                .filter(item => item.correct_category === category && !uniquePrompts.has(item.prompt))
                .slice(0, minPerCategory);
            
            for (const item of categoryExamples) {
                goldenSet.push({
                    prompt: item.prompt,
                    correct_category: item.correct_category,
                    confidence: 'high',
                    rationale: `Corrected from ${item.incorrect_category} to ${item.correct_category}`,
                    qualityScore: item.qualityScore,
                    source: item.source || 'user_feedback'
                });
                
                uniquePrompts.add(item.prompt);
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }
        }

        // Second pass: Fill remaining slots with highest quality examples
        for (const item of sortedFeedback) {
            if (goldenSet.length >= NUM_EXAMPLES) break;
            
            const category = item.correct_category;
            const currentCount = categoryCounts[category] || 0;
            
            // Skip if we already have enough examples for this category
            if (currentCount >= maxPerCategory) continue;
            
            // Skip if we already have this prompt
            if (uniquePrompts.has(item.prompt)) continue;
            
            goldenSet.push({
                prompt: item.prompt,
                correct_category: item.correct_category,
                confidence: 'high',
                rationale: `Corrected from ${item.incorrect_category} to ${item.correct_category}`,
                qualityScore: item.qualityScore,
                source: item.source || 'user_feedback'
            });
            
            uniquePrompts.add(item.prompt);
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }

        // 4. Save the new "Golden Set" to storage
        await chrome.storage.local.set({ goldenSetExamples: goldenSet });
        
        console.log('Threadly: Golden Set curated successfully', {
            totalFeedback: triageFeedback.length,
            goldenSetSize: goldenSet.length,
            categories: Object.keys(categoryCounts),
            categoryDistribution: categoryCounts,
            topErrors: Object.entries(errorPatterns)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            qualityRange: {
                min: Math.min(...goldenSet.map(item => item.qualityScore)),
                max: Math.max(...goldenSet.map(item => item.qualityScore)),
                avg: goldenSet.reduce((sum, item) => sum + item.qualityScore, 0) / goldenSet.length
            }
        });

        // 5. Auto-cleanup: Remove old, low-quality feedback (every 2 weeks)
        const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
        const cleanedFeedback = triageFeedback
            .filter(item => {
                // Keep recent feedback (last 2 weeks)
                if (item.timestamp > twoWeeksAgo) return true;
                
                // Keep high-quality old feedback
                const qualityScore = item.qualityScore || 0;
                return qualityScore > 40; // Keep only high-quality old examples
            })
            .slice(-1000); // Keep max 1000 entries total
        
        if (cleanedFeedback.length !== triageFeedback.length) {
            await chrome.storage.local.set({ triageFeedback: cleanedFeedback });
            console.log(`Threadly: Auto-cleanup completed. Removed ${triageFeedback.length - cleanedFeedback.length} low-quality entries`);
        }

    } catch (error) {
        console.error('Threadly: Failed to curate Golden Set:', error);
    }
}

/**
 * Get analytics about the learning system
 */
async function getLearningAnalytics() {
    try {
        const { triageFeedback = [], goldenSetExamples = [] } = await chrome.storage.local.get(['triageFeedback', 'goldenSetExamples']);
        
        // Calculate error patterns
        const errorPatterns = {};
        const categoryErrors = {};
        
        triageFeedback.forEach(item => {
            const patternKey = `${item.incorrect_category}->${item.correct_category}`;
            errorPatterns[patternKey] = (errorPatterns[patternKey] || 0) + 1;
            categoryErrors[item.incorrect_category] = (categoryErrors[item.incorrect_category] || 0) + 1;
        });

        return {
            totalFeedback: triageFeedback.length,
            goldenSetSize: goldenSetExamples.length,
            topErrorPatterns: Object.entries(errorPatterns)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10),
            categoryErrorCounts: categoryErrors,
            lastCuration: new Date().toISOString()
        };
    } catch (error) {
        console.error('Threadly: Failed to get learning analytics:', error);
        return null;
    }
}

/**
 * Get detailed feedback statistics for monitoring
 */
async function getFeedbackStats() {
    try {
        const { triageFeedback = [], goldenSetExamples = [] } = await chrome.storage.local.get(['triageFeedback', 'goldenSetExamples']);
        
        if (triageFeedback.length === 0) {
            return {
                totalFeedback: 0,
                goldenSetSize: 0,
                message: "No feedback data available yet"
            };
        }

        // Calculate time-based statistics
        const now = Date.now();
        const oneDayAgo = now - (24 * 60 * 60 * 1000);
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

        const recentFeedback = triageFeedback.filter(item => item.timestamp > oneDayAgo);
        const weeklyFeedback = triageFeedback.filter(item => item.timestamp > oneWeekAgo);
        const monthlyFeedback = triageFeedback.filter(item => item.timestamp > oneMonthAgo);

        // Calculate error patterns
        const errorPatterns = {};
        const categoryDistribution = {};
        const sourceDistribution = {};
        
        triageFeedback.forEach(item => {
            const patternKey = `${item.incorrect_category}->${item.correct_category}`;
            errorPatterns[patternKey] = (errorPatterns[patternKey] || 0) + 1;
            
            categoryDistribution[item.correct_category] = (categoryDistribution[item.correct_category] || 0) + 1;
            sourceDistribution[item.source || 'unknown'] = (sourceDistribution[item.source || 'unknown'] || 0) + 1;
        });

        // Calculate quality metrics
        const qualityScores = triageFeedback
            .filter(item => item.qualityScore)
            .map(item => item.qualityScore);
        
        const avgQuality = qualityScores.length > 0 
            ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length 
            : 0;

        return {
            totalFeedback: triageFeedback.length,
            goldenSetSize: goldenSetExamples.length,
            timeBasedStats: {
                last24Hours: recentFeedback.length,
                lastWeek: weeklyFeedback.length,
                lastMonth: monthlyFeedback.length
            },
            errorPatterns: Object.entries(errorPatterns)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10),
            categoryDistribution,
            sourceDistribution,
            qualityMetrics: {
                averageQuality: Math.round(avgQuality * 100) / 100,
                highQualityCount: qualityScores.filter(score => score > 60).length,
                lowQualityCount: qualityScores.filter(score => score < 30).length
            },
            lastCuration: new Date().toISOString(),
            systemHealth: {
                feedbackRate: recentFeedback.length > 0 ? 'Active' : 'Inactive',
                learningProgress: goldenSetExamples.length > 20 ? 'Good' : 'Building',
                dataQuality: avgQuality > 50 ? 'High' : 'Improving'
            }
        };
    } catch (error) {
        console.error('Threadly: Failed to get feedback stats:', error);
        return null;
    }
}

/**
 * Export feedback data for analysis
 */
async function exportFeedbackData() {
    try {
        const { triageFeedback = [], goldenSetExamples = [] } = await chrome.storage.local.get(['triageFeedback', 'goldenSetExamples']);
        
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            feedback: triageFeedback.map(item => ({
                prompt: item.prompt,
                incorrect_category: item.incorrect_category,
                correct_category: item.correct_category,
                timestamp: new Date(item.timestamp).toISOString(),
                source: item.source || 'unknown',
                confidence: item.confidence || 0.5,
                qualityScore: item.qualityScore || 0
            })),
            goldenSet: goldenSetExamples.map(item => ({
                prompt: item.prompt,
                correct_category: item.correct_category,
                confidence: item.confidence,
                rationale: item.rationale,
                qualityScore: item.qualityScore,
                source: item.source
            })),
            summary: {
                totalFeedback: triageFeedback.length,
                goldenSetSize: goldenSetExamples.length,
                categories: [...new Set(triageFeedback.map(item => item.correct_category))],
                dateRange: {
                    earliest: triageFeedback.length > 0 ? new Date(Math.min(...triageFeedback.map(item => item.timestamp))).toISOString() : null,
                    latest: triageFeedback.length > 0 ? new Date(Math.max(...triageFeedback.map(item => item.timestamp))).toISOString() : null
                }
            }
        };

        return exportData;
    } catch (error) {
        console.error('Threadly: Failed to export feedback data:', error);
        return null;
    }
}

// Export for testing (if in Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        storeFeedback,
        getGoldenSet,
        curateGoldenSet,
        getLearningAnalytics
    };
}

