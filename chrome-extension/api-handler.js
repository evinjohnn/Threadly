/**
 * Threadly Prompt Refiner - API Handler
 * Handles Gemini API calls and prompt refinement logic
 */

class PromptRefiner {
    constructor() {
        this.apiKey = null;
        this.promptsDatabase = null;
        this.feedbackData = []; // Store feedback data locally
        this.refinementHistory = new Map(); // Track refinement attempts for implicit feedback
        this.platformConfigs = {
            'chatgpt': {
                name: 'ChatGPT',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
                systemPrompt: this.getChatGPTSystemPrompt()
            },
            'claude': {
                name: 'Claude',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
                systemPrompt: this.getClaudeSystemPrompt()
            },
            'gemini': {
                name: 'Gemini',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
                systemPrompt: this.getGeminiSystemPrompt()
            },
            'perplexity': {
                name: 'Perplexity',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
                systemPrompt: this.getPerplexitySystemPrompt()
            }
        };
        
        // Triage AI configuration
        this.triageConfig = {
            categories: {
                'grammar_spelling': {
                    name: 'Grammar & Spelling Correction',
                    weight: 0,
                    keywords: ['text', 'message', 'email', 'letter', 'write', 'grammar', 'spelling', 'correct', 'girlfriend', 'boyfriend', 'birthday', 'wish', 'greeting'],
                    patterns: [
                        /^(hey|hi|hello)\s+(chatgpt|claude|gemini|ai)/i,
                        /^(can you|could you|please)\s+(help me|write|text|message)/i,
                        /^(i want to|i need to|i wanna)\s+(text|message|write|send)/i,
                        /(text|message|write)\s+(my|to my)\s+(girlfriend|boyfriend|friend|family)/i,
                        /(birthday|wish|greeting|congratulations)/i,
                        /(grammar|spelling|correct|fix)\s+(this|my|the)/i
                    ]
                },
                'image_generation': {
                    name: 'Image Generation',
                    weight: 0,
                    keywords: ['image', 'picture', 'photo', 'generate', 'create', 'draw', 'art', 'visual', 'design', 'portrait', 'landscape', 'scene', 'character', 'edit', 'modify', 'change', 'add', 'remove', 'transform', 'style', 'elephant', 'cat', 'dog', 'person', 'animal', 'building', 'car', 'wearing', 'suit', 'dress', 'at', 'in', 'with', 'holding'],
                    patterns: [
                        /(create|generate|make|draw)\s+(an?\s+)?(image|picture|photo|art|visual|portrait|landscape)/i,
                        /(image|picture|photo|art|visual|portrait|landscape)\s+(of|showing|with)/i,
                        /^(picture|photo|image)\s+(of|showing)/i,
                        /(photorealistic|stylized|illustration|sticker|logo|mockup|anime|realistic)/i,
                        /(dalle|midjourney|stable diffusion|ai art|ai image)/i,
                        /(camera angle|lighting|composition|aspect ratio)/i,
                        /(use this photo|of these people|this image|provided image|uploaded image)/i,
                        /(edit|modify|change|add|remove|transform)\s+(this|the|my)\s+(photo|image|picture)/i,
                        /(inpainting|style transfer|semantic masking|composite|combine)/i,
                        /(using the provided|with the image|based on this photo)/i,
                        /^(show me|i want|i need)\s+(a\s+)?(picture|photo|image)/i,
                        /(elephant|cat|dog|person|character|scene|landscape|building|car|animal)\s+(in|with|at|wearing|holding)/i
                    ]
                },
                'coding': {
                    name: 'Coding & Development',
                    weight: 0,
                    keywords: ['code', 'programming', 'app', 'application', 'program', 'software', 'c++', 'python', 'javascript', 'java', 'react', 'vue', 'angular', 'html', 'css', 'sql', 'database', 'api', 'function', 'class', 'method', 'variable', 'algorithm', 'debug', 'fix', 'implement', 'build', 'develop', 'create', 'make'],
                    patterns: [
                        /(write|create|generate|make|build|develop)\s+(code|program|script|function|app|application|software)/i,
                        /(make|create|build)\s+(me|a|an)\s+(c\+\+|python|javascript|java|react|vue|angular|html|css|sql|app|application|program|software)/i,
                        /(c\+\+|python|javascript|java|react|vue|angular|html|css|sql)\s+(app|application|program|code|function|class)/i,
                        /(calculator|todo|notes|chat|game|website|dashboard|portfolio)\s+(app|application|program)/i,
                        /(debug|fix|implement|optimize)\s+(code|program|function|algorithm)/i
                    ]
                },
                'research_analysis': {
                    name: 'Research & Analysis',
                    weight: 0,
                    keywords: ['research', 'analyze', 'study', 'investigate', 'explain', 'teach', 'guide', 'tutorial', 'how to', 'data', 'statistics', 'findings', 'report'],
                    patterns: [
                        /(research|analyze|study|investigate)/i,
                        /(explain|teach|guide|tutorial|how to)/i,
                        /(help me|assist me|guide me)/i,
                        /(data|statistics|findings|report|survey)/i
                    ]
                },
                'content_creation': {
                    name: 'Content Creation',
                    weight: 0,
                    keywords: ['write', 'create', 'content', 'blog', 'article', 'copy', 'marketing', 'social media', 'email', 'story', 'creative', 'brainstorm', 'design'],
                    patterns: [
                        /(write|create)\s+(article|blog|content|story|copy)/i,
                        /(marketing|social media|email)\s+(content|campaign|strategy)/i,
                        /(creative|brainstorm|design)\s+(idea|concept|solution)/i
                    ]
                },
                'general': {
                    name: 'General',
                    weight: 0,
                    keywords: ['help', 'assist', 'support', 'advice', 'guidance'],
                    patterns: [
                        /(help|assist|support|advice|guidance)/i
                    ]
                }
            }
        };
    }


    async loadPromptsDatabase() {
        try {
            const response = await fetch(chrome.runtime.getURL('prompts.json'));
            this.promptsDatabase = await response.json();
            console.log('Threadly: Loaded prompts database with', this.promptsDatabase.metadata.totalPrompts, 'prompts');
        } catch (error) {
            console.error('Threadly: Failed to load prompts database:', error);
            this.promptsDatabase = null;
        }
    }

    async refinePrompt(userPrompt, platform, taskCategory = 'general') {
        if (!this.apiKey) {
            throw new Error('Gemini API key not found. Please set it in the extension popup.');
        }

        const platformConfig = this.platformConfigs[platform];
        if (!platformConfig) {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        // Step 1: Analyze context and determine refinement type
        const triageResult = await this.analyzeContext(userPrompt);
        console.log('Threadly: Triage analysis result:', triageResult);

        // Step 2: Apply appropriate refinement based on analysis
        let refinedPrompt;
        
        // Check if refinement is actually needed
        if (triageResult.refinementNeed === 'low' && triageResult.promptQuality > 60) {
            console.log('Threadly: Prompt quality is high, minimal refinement needed');
            // For high-quality prompts, just do light enhancement
            refinedPrompt = await this.performLightEnhancement(userPrompt, platform, triageResult);
        } else if (triageResult.primaryCategory === 'grammar_spelling' && triageResult.confidence > 0.7) {
            // Simple grammar and spelling correction
            refinedPrompt = await this.performGrammarCorrection(userPrompt);
        } else if (triageResult.primaryCategory === 'image_generation' && triageResult.confidence > 0.4) {
            // Image generation prompt refinement
            refinedPrompt = await this.refineImageGenerationPrompt(userPrompt, platform, triageResult);
        } else if (triageResult.primaryCategory === 'coding' && triageResult.confidence > 0.6) {
            // Coding-specific refinement
            const systemPrompt = this.buildSystemPrompt(platform, 'coding', triageResult);
            refinedPrompt = await this.callGeminiAPI(systemPrompt, userPrompt);
        } else if (triageResult.primaryCategory === 'research_analysis' && triageResult.confidence > 0.6) {
            // Research and analysis refinement
            const systemPrompt = this.buildSystemPrompt(platform, 'research', triageResult);
            refinedPrompt = await this.callGeminiAPI(systemPrompt, userPrompt);
        } else if (triageResult.primaryCategory === 'content_creation' && triageResult.confidence > 0.6) {
            // Content creation refinement
            const systemPrompt = this.buildSystemPrompt(platform, 'content_creation', triageResult);
            refinedPrompt = await this.callGeminiAPI(systemPrompt, userPrompt);
        } else {
            // General AI prompting enhancement (default or when confidence is mixed)
            const systemPrompt = this.buildSystemPrompt(platform, taskCategory, triageResult);
            try {
                refinedPrompt = await this.callGeminiAPI(systemPrompt, userPrompt);
            } catch (error) {
                // If API fails, provide a basic enhancement
                console.log('Threadly: API call failed, providing basic enhancement');
                refinedPrompt = this.provideBasicEnhancement(userPrompt, triageResult);
            }
        }
        
        // Step 3: Track refinement attempt for feedback collection
        const attemptId = this.trackRefinementAttempt(userPrompt, triageResult, refinedPrompt);
        
        // Return both the refined prompt and attempt ID for feedback tracking
        return {
            refinedPrompt,
            attemptId,
            triageResult
        };
    }

    // Triage AI: Analyze context and determine refinement type
    async analyzeContext(userPrompt) {
        // --- STAGE 1: THE FAST PATH ---
        const fastAnalysis = this.runFastPathAnalysis(userPrompt);
        const HIGH_CONFIDENCE_THRESHOLD = 0.90; // 90% confidence
        const HIGH_WEIGHT_THRESHOLD = 4; // 4+ weight points

        if (fastAnalysis.confidence >= HIGH_CONFIDENCE_THRESHOLD && fastAnalysis.totalWeight > HIGH_WEIGHT_THRESHOLD) {
            console.log('Threadly: Triage AI - Fast Path Succeeded.', {
                category: fastAnalysis.primaryCategory,
                confidence: fastAnalysis.confidence,
                totalWeight: fastAnalysis.totalWeight,
                reasoning: fastAnalysis.reasoning
            });
            return fastAnalysis;
        }

        // --- STAGE 2: THE AI-POWERED SMART PATH ---
        console.log('Threadly: Triage AI - Fast Path failed, proceeding to Smart Path.');
        try {
            const masterPrompt = this.buildTriageMasterPrompt();
            const aiResponseString = await this.callGeminiAPI(masterPrompt, userPrompt);
            
            // Clean and parse the JSON response from the AI
            let jsonMatch = aiResponseString.match(/```json\n([\s\S]*?)\n```/);
            if (!jsonMatch) {
                // Try alternative JSON extraction patterns
                jsonMatch = aiResponseString.match(/```\n([\s\S]*?)\n```/);
                if (!jsonMatch) {
                    // Try to find JSON without code blocks
                    const jsonStart = aiResponseString.indexOf('{');
                    const jsonEnd = aiResponseString.lastIndexOf('}');
                    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                        jsonMatch = [null, aiResponseString.substring(jsonStart, jsonEnd + 1)];
                    } else {
                        throw new Error('No JSON found in AI response');
                    }
                }
            }
            
            const aiAnalysis = JSON.parse(jsonMatch[1]);

            // Validate AI analysis response
            if (!aiAnalysis.category || typeof aiAnalysis.confidence !== 'number' || 
                !aiAnalysis.rationale || typeof aiAnalysis.prompt_quality_score !== 'number' || 
                typeof aiAnalysis.refinement_needed !== 'boolean' || !aiAnalysis.chain_of_thought) {
                throw new Error('Invalid AI analysis response format');
            }

            // Ensure category is valid
            const validCategories = ['grammar_spelling', 'image_generation', 'coding', 'research_analysis', 'content_creation', 'general'];
            if (!validCategories.includes(aiAnalysis.category)) {
                console.warn('Threadly: Invalid category from AI, using general:', aiAnalysis.category);
                aiAnalysis.category = 'general';
            }

            // Clamp confidence and quality scores to valid ranges
            aiAnalysis.confidence = Math.max(0, Math.min(1, aiAnalysis.confidence));
            aiAnalysis.prompt_quality_score = Math.max(0, Math.min(100, aiAnalysis.prompt_quality_score));

            // Integrate the AI's analysis into our standard analysis object
            const finalAnalysis = {
                categories: fastAnalysis.categories, // Keep the fast path categories for reference
                primaryCategory: aiAnalysis.category,
                confidence: aiAnalysis.confidence,
                reasoning: [aiAnalysis.rationale],
                chainOfThought: aiAnalysis.chain_of_thought, // Store the reasoning chain
                refinementNeed: aiAnalysis.refinement_needed ? 'high' : 'low',
                promptQuality: aiAnalysis.prompt_quality_score,
                similarPrompts: fastAnalysis.similarPrompts, // Keep similar prompts from fast path
                hasSharedImages: fastAnalysis.hasSharedImages,
                totalWeight: fastAnalysis.totalWeight, // Keep total weight for reference
                aiAnalyst: true // Flag to indicate this came from AI analyst
            };
            
            console.log('Threadly: Triage AI - Smart Path Succeeded.', {
                category: finalAnalysis.primaryCategory,
                confidence: finalAnalysis.confidence,
                promptQuality: finalAnalysis.promptQuality,
                refinementNeed: finalAnalysis.refinementNeed,
                reasoning: finalAnalysis.reasoning
            });
            return finalAnalysis;

        } catch (error) {
            console.error('Threadly: Triage AI - Smart Path failed. Falling back to fast analysis.', error);
            
            // If it's an API overload error, we can still provide a basic analysis
            if (error.message.includes('overloaded') || error.message.includes('503')) {
                console.log('Threadly: API overload detected, using fast path with basic enhancement');
                // Enhance the fast analysis with basic improvements
                fastAnalysis.refinementNeed = 'medium'; // Assume some refinement needed
                fastAnalysis.promptQuality = Math.max(fastAnalysis.promptQuality, 40); // Minimum quality
            }
            
            // If the AI call fails for any reason, we still have the fast path result as a fallback.
            return fastAnalysis;
        }
    }

    // Stage 1: Fast Path Analysis - Extract existing keyword/regex logic
    runFastPathAnalysis(userPrompt) {
        const prompt = userPrompt.toLowerCase();
        const analysis = {
            categories: {},
            primaryCategory: 'general',
            confidence: 0,
            reasoning: [],
            refinementNeed: 'low',
            promptQuality: 0,
            similarPrompts: [],
            totalWeight: 0
        };

        // --- PILLAR 1: CERTAINTY ENGINE ---
        // Only apply strict rules to shorter prompts (under 150 characters)
        if (userPrompt.length <= 150) {
            const certaintyResult = this.runCertaintyEngine(userPrompt);
            if (certaintyResult) {
                console.log('Threadly: Certainty Engine triggered for:', certaintyResult.category);
                return certaintyResult;
            }
        }

        // Step 1: Assess prompt quality and refinement need
        const qualityAssessment = this.assessPromptQuality(userPrompt);
        analysis.promptQuality = qualityAssessment.score;
        analysis.refinementNeed = qualityAssessment.need;

        // Step 2: Find similar prompts from database
        if (this.promptsDatabase) {
            analysis.similarPrompts = this.findSimilarPrompts(userPrompt);
        }

        // Step 3: Check for shared images/photos
        analysis.hasSharedImages = this.detectSharedImages(userPrompt);

        // Calculate weights for each category
        for (const [categoryKey, category] of Object.entries(this.triageConfig.categories)) {
            let weight = 0;
            let matches = [];

            // Check keyword matches
            for (const keyword of category.keywords) {
                if (prompt.includes(keyword)) {
                    weight += 1;
                    matches.push(`keyword: ${keyword}`);
                }
            }

            // Check pattern matches (higher weight)
            for (const pattern of category.patterns) {
                if (pattern.test(userPrompt)) {
                    weight += 2;
                    matches.push(`pattern: ${pattern.source}`);
                }
            }

            // Special context analysis
            if (categoryKey === 'grammar_spelling') {
                // Check for simple, conversational requests
                if (prompt.length < 100 && 
                    (prompt.includes('text') || prompt.includes('message') || prompt.includes('write')) &&
                    !prompt.includes('code') && !prompt.includes('research') && !prompt.includes('analyze')) {
                    weight += 3;
                    matches.push('simple conversational request');
                }
            }

            if (categoryKey === 'image_generation') {
                // Check for visual/artistic terms
                const visualTerms = ['photorealistic', 'stylized', 'illustration', 'sticker', 'logo', 'mockup', 'art', 'drawing', 'painting'];
                for (const term of visualTerms) {
                    if (prompt.includes(term)) {
                        weight += 2;
                        matches.push(`visual term: ${term}`);
                    }
                }
            }

            analysis.categories[categoryKey] = {
                weight,
                matches,
                name: category.name
            };
        }

        // Special logic: Prioritize coding requests over image generation when there are conflicting signals
        const hasCodingKeywords = analysis.categories.coding.weight > 0;
        const hasImageKeywords = analysis.categories.image_generation.weight > 0;
        
        if (hasCodingKeywords && hasImageKeywords) {
            // Check if the request is primarily about creating code/apps
            const codingPatterns = [
                /make\s+(me\s+)?(a\s+)?(c\+\+|python|javascript|java|react|vue|angular|html|css|sql|app|application|program|software)/i,
                /create\s+(me\s+)?(a\s+)?(c\+\+|python|javascript|java|react|vue|angular|html|css|sql|app|application|program|software)/i,
                /build\s+(me\s+)?(a\s+)?(c\+\+|python|javascript|java|react|vue|angular|html|css|sql|app|application|program|software)/i,
                /(c\+\+|python|javascript|java|react|vue|angular|html|css|sql)\s+(app|application|program|code|function|class)/i
            ];
            
            const isPrimarilyCoding = codingPatterns.some(pattern => pattern.test(userPrompt));
            
            if (isPrimarilyCoding) {
                // Boost coding weight and reduce image weight
                analysis.categories.coding.weight += 5;
                analysis.categories.image_generation.weight = Math.max(0, analysis.categories.image_generation.weight - 3);
                analysis.reasoning.push('prioritized coding over image generation due to app creation request');
            }
        }

        // Determine primary category and confidence
        let maxWeight = 0;
        for (const [categoryKey, data] of Object.entries(analysis.categories)) {
            if (data.weight > maxWeight) {
                maxWeight = data.weight;
                analysis.primaryCategory = categoryKey;
            }
        }

        // Calculate total weight and confidence
        analysis.totalWeight = Object.values(analysis.categories).reduce((sum, cat) => sum + cat.weight, 0);
        if (analysis.totalWeight > 0) {
            analysis.confidence = maxWeight / analysis.totalWeight;
        }

        // Add reasoning
        analysis.reasoning = analysis.categories[analysis.primaryCategory].matches;

        return analysis;
    }

    // Pillar 1: Certainty Engine - Hyper-fast path with command-based triggers
    runCertaintyEngine(userPrompt) {
        const prompt = userPrompt.toLowerCase();
        
        // Command-based triggers for high certainty classification
        const certaintyRules = {
            grammar_spelling: [
                /^(fix|correct|rephrase|rewrite)\s+this:/i,
                /^(fix|correct|rephrase|rewrite)\s+(my|the)\s+(text|message|sentence|grammar|spelling)/i,
                /^(can you|could you)\s+(fix|correct|rephrase|rewrite)\s+(this|my|the)/i,
                /^(grammar|spelling|typo)\s+(check|fix|correct)/i
            ],
            image_generation: [
                /^(generate|create|draw)\s+(an?|me)\s+(image|picture|photo|logo|sticker)\s+of/i,
                /^(make|design)\s+(an?|me)\s+(image|picture|photo|logo|sticker)/i,
                /^(show me|i want|i need)\s+(a\s+)?(picture|photo|image|logo|sticker)/i,
                /^(draw|paint|illustrate)\s+(me|an?)\s+(image|picture|photo)/i
            ],
            coding: [
                /^(write|create|build|make)\s+(me\s+)?(a\s+)?(python|javascript|java|c\+\+|html|css|sql)\s+(script|code|function|app|program)/i,
                /^(code|program|script|function|app|program)\s+(in|for)\s+(python|javascript|java|c\+\+|html|css|sql)/i,
                /^(debug|fix|optimize)\s+(this|my|the)\s+(code|script|function|program)/i,
                /^(implement|build)\s+(a\s+)?(calculator|todo|notes|chat|game|website|dashboard)\s+(app|application|program)/i
            ],
            research_analysis: [
                /^(research|analyze|study|investigate)\s+(the|this|my)/i,
                /^(explain|teach|guide|tutorial)\s+(me\s+)?(about|how to)/i,
                /^(what|how|why|when|where)\s+(is|are|does|do|can|should|would)/i,
                /^(find|search|look up)\s+(information|data|facts|statistics)/i
            ],
            content_creation: [
                /^(write|create|compose)\s+(me\s+)?(a\s+)?(article|blog|story|email|letter|copy|content)/i,
                /^(draft|prepare)\s+(a\s+)?(marketing|social media|email)\s+(content|campaign|post)/i,
                /^(brainstorm|generate)\s+(ideas|concepts|solutions)/i
            ]
        };

        // Check for counter-signals that should prevent certainty classification
        const counterSignals = {
            grammar_spelling: [
                /create.*image/i,
                /generate.*picture/i,
                /write.*code/i,
                /build.*app/i,
                /research.*about/i
            ],
            image_generation: [
                /write.*code/i,
                /build.*app/i,
                /research.*about/i,
                /analyze.*data/i,
                /fix.*grammar/i
            ],
            coding: [
                /create.*image/i,
                /generate.*picture/i,
                /write.*article/i,
                /research.*about/i,
                /fix.*grammar/i
            ],
            research_analysis: [
                /create.*image/i,
                /generate.*picture/i,
                /write.*code/i,
                /build.*app/i,
                /fix.*grammar/i
            ],
            content_creation: [
                /create.*image/i,
                /generate.*picture/i,
                /write.*code/i,
                /build.*app/i,
                /research.*about/i
            ]
        };

        // Test each category for certainty
        for (const [category, patterns] of Object.entries(certaintyRules)) {
            const matchedPattern = patterns.find(pattern => pattern.test(userPrompt));
            
            if (matchedPattern) {
                // Check for counter-signals
                const hasCounterSignal = counterSignals[category]?.some(pattern => pattern.test(userPrompt));
                
                if (!hasCounterSignal) {
                    // High certainty classification
                    const analysis = {
                        categories: {
                            [category]: {
                                weight: 10, // High weight for certainty
                                matches: [`certainty: ${matchedPattern.source}`],
                                name: this.triageConfig.categories[category]?.name || category
                            }
                        },
                        primaryCategory: category,
                        confidence: 0.98, // Very high confidence
                        reasoning: [`certainty engine: ${matchedPattern.source}`],
                        refinementNeed: 'low',
                        promptQuality: 70, // Assume decent quality for command-based prompts
                        similarPrompts: [],
                        hasSharedImages: this.detectSharedImages(userPrompt),
                        totalWeight: 10,
                        certaintyEngine: true // Flag to indicate this came from certainty engine
                    };
                    
                    return analysis;
                } else {
                    console.log('Threadly: Certainty Engine blocked by counter-signal for category:', category);
                }
            }
        }

        return null; // No certainty classification possible
    }

    // Stage 2: Master Analysis Prompt for AI-Powered Smart Path
    buildTriageMasterPrompt() {
        const systemPrompt = `
You are an expert AI Prompt Triage Specialist. Your role is to analyze a user's raw prompt and classify its primary intent. You must return your analysis ONLY in a structured JSON format.

**Analysis Steps:**
1. **Chain of Thought:** First, in a 'chain_of_thought' field, reason step-by-step. Analyze keywords, sentence structure, and the user's likely goal. Consider ambiguities. For example, does "write a python script to generate images" mean coding or image generation? Conclude your reasoning with your final category choice.
2. **Categorization:** Based on your reasoning, select ONE primary category: "grammar_spelling", "image_generation", "coding", "research_analysis", "content_creation", or "general".
3. **Confidence Score:** Provide a confidence score (0.0 to 1.0).
4. **Rationale:** Provide a final, concise one-sentence rationale.
5. **Prompt Quality:** Score the prompt's quality (0-100).
6. **Refinement Needed:** State if refinement is needed (true/false).

**Output Format:**
You MUST respond with ONLY a single JSON object inside a markdown code block. Do not include any other text, greetings, or explanations.

Example JSON Output Structure:
\`\`\`json
{
  "chain_of_thought": "The user prompt is 'write a python script to generate images'. The keywords are 'python script' (coding) and 'generate images' (image_generation). The primary action is 'write a script', which is a coding task. The image generation is the *purpose* of the script, not the direct task for the AI. Therefore, the category is 'coding'.",
  "category": "coding",
  "confidence": 0.98,
  "rationale": "The prompt asks to write code, making 'coding' the primary category.",
  "prompt_quality_score": 80,
  "refinement_needed": true
}
\`\`\`
`;
        return systemPrompt;
    }

    // Provide basic enhancement when API calls fail
    provideBasicEnhancement(userPrompt, triageResult) {
        let enhancedPrompt = userPrompt;
        
        // Basic enhancements based on category
        switch (triageResult.primaryCategory) {
            case 'grammar_spelling':
                enhancedPrompt = `Please correct the grammar and spelling in the following text: "${userPrompt}"`;
                break;
            case 'image_generation':
                enhancedPrompt = `Create a detailed, high-quality image prompt for: ${userPrompt}`;
                break;
            case 'coding':
                enhancedPrompt = `Write clean, well-documented code for: ${userPrompt}`;
                break;
            case 'research_analysis':
                enhancedPrompt = `Provide a comprehensive analysis and research on: ${userPrompt}`;
                break;
            case 'content_creation':
                enhancedPrompt = `Create engaging, well-structured content about: ${userPrompt}`;
                break;
            default:
                enhancedPrompt = `Please provide a detailed, helpful response to: ${userPrompt}`;
        }
        
        return enhancedPrompt;
    }

    // Pillar 3: User-in-the-Loop Feedback System
    // Track refinement attempts for implicit feedback
    trackRefinementAttempt(userPrompt, triageResult, refinedPrompt) {
        const attemptId = Date.now().toString();
        this.refinementHistory.set(attemptId, {
            userPrompt,
            triageResult,
            refinedPrompt,
            timestamp: new Date().toISOString(),
            reRefineCount: 0,
            finalPrompt: null
        });
        return attemptId;
    }

    // Record re-refinement (implicit feedback that first refinement was poor)
    recordReRefinement(attemptId) {
        const attempt = this.refinementHistory.get(attemptId);
        if (attempt) {
            attempt.reRefineCount++;
            console.log('Threadly: Re-refinement detected - potential poor classification');
            
            // If user re-refines multiple times, it's strong negative feedback
            if (attempt.reRefineCount >= 2) {
                this.collectImplicitFeedback(attempt, 're_refine');
            }
        }
    }

    // Record final prompt after user edits (implicit feedback)
    recordFinalPrompt(attemptId, finalPrompt) {
        const attempt = this.refinementHistory.get(attemptId);
        if (attempt) {
            attempt.finalPrompt = finalPrompt;
            
            // Calculate edit distance to detect heavy editing
            const editDistance = this.calculateEditDistance(attempt.refinedPrompt, finalPrompt);
            const editRatio = editDistance / Math.max(attempt.refinedPrompt.length, finalPrompt.length);
            
            if (editRatio > 0.3) { // More than 30% change indicates poor refinement
                console.log('Threadly: Heavy editing detected - potential poor classification');
                this.collectImplicitFeedback(attempt, 'heavy_edit', { editRatio });
            }
        }
    }

    // Collect implicit feedback data
    collectImplicitFeedback(attempt, feedbackType, metadata = {}) {
        const feedback = {
            type: 'implicit',
            feedbackType,
            userPrompt: attempt.userPrompt,
            initialCategory: attempt.triageResult.primaryCategory,
            confidence: attempt.triageResult.confidence,
            refinedPrompt: attempt.refinedPrompt,
            finalPrompt: attempt.finalPrompt,
            timestamp: attempt.timestamp,
            metadata
        };
        
        this.feedbackData.push(feedback);
        console.log('Threadly: Implicit feedback collected:', feedbackType);
        
        // Store feedback data locally
        this.saveFeedbackData();
    }

    // Collect explicit feedback from user
    collectExplicitFeedback(attemptId, correctCategory) {
        const attempt = this.refinementHistory.get(attemptId);
        if (attempt) {
            const feedback = {
                type: 'explicit',
                userPrompt: attempt.userPrompt,
                initialCategory: attempt.triageResult.primaryCategory,
                correctCategory,
                confidence: attempt.triageResult.confidence,
                refinedPrompt: attempt.refinedPrompt,
                timestamp: attempt.timestamp
            };
            
            this.feedbackData.push(feedback);
            console.log('Threadly: Explicit feedback collected:', correctCategory);
            
            // Store feedback data locally
            this.saveFeedbackData();
        }
    }

    // Calculate edit distance between two strings
    calculateEditDistance(str1, str2) {
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;

        for (let i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[len2][len1];
    }

    // Save feedback data to local storage
    async saveFeedbackData() {
        try {
            if (chrome && chrome.storage && chrome.storage.local) {
                await chrome.storage.local.set({ 
                    threadlyFeedbackData: this.feedbackData 
                });
            }
        } catch (error) {
            console.error('Threadly: Failed to save feedback data:', error);
        }
    }

    // Load feedback data from local storage
    async loadFeedbackData() {
        try {
            if (chrome && chrome.storage && chrome.storage.local) {
                const result = await chrome.storage.local.get(['threadlyFeedbackData']);
                this.feedbackData = result.threadlyFeedbackData || [];
            }
        } catch (error) {
            console.error('Threadly: Failed to load feedback data:', error);
        }
    }

    // Get feedback statistics for analysis
    getFeedbackStats() {
        const total = this.feedbackData.length;
        const implicit = this.feedbackData.filter(f => f.type === 'implicit').length;
        const explicit = this.feedbackData.filter(f => f.type === 'explicit').length;
        
        const misclassifications = this.feedbackData.filter(f => 
            f.initialCategory !== f.correctCategory
        ).length;
        
        return {
            total,
            implicit,
            explicit,
            misclassifications,
            accuracy: total > 0 ? ((total - misclassifications) / total * 100).toFixed(2) : 'N/A'
        };
    }

    // Pillar 4: Long-Term Evolution - Data Analysis and Rule Refinement
    // Analyze feedback data to identify patterns and improve rules
    analyzeFeedbackPatterns() {
        const patterns = {
            commonMisclassifications: {},
            problematicKeywords: {},
            confidenceIssues: [],
            categoryConfusion: {}
        };

        // Analyze misclassifications
        const misclassifications = this.feedbackData.filter(f => 
            f.initialCategory !== f.correctCategory
        );

        misclassifications.forEach(feedback => {
            const key = `${feedback.initialCategory} -> ${feedback.correctCategory}`;
            patterns.commonMisclassifications[key] = (patterns.commonMisclassifications[key] || 0) + 1;
        });

        // Analyze problematic keywords
        misclassifications.forEach(feedback => {
            const words = feedback.userPrompt.toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (word.length > 3) { // Only consider meaningful words
                    const key = `${word} (${feedback.initialCategory} -> ${feedback.correctCategory})`;
                    patterns.problematicKeywords[key] = (patterns.problematicKeywords[key] || 0) + 1;
                }
            });
        });

        // Analyze confidence issues
        patterns.confidenceIssues = misclassifications
            .filter(f => f.confidence > 0.8) // High confidence but wrong
            .map(f => ({
                prompt: f.userPrompt,
                category: f.initialCategory,
                confidence: f.confidence
            }));

        return patterns;
    }

    // Generate rule refinement suggestions based on feedback analysis
    generateRuleRefinements() {
        const patterns = this.analyzeFeedbackPatterns();
        const suggestions = [];

        // Suggest new certainty rules for common patterns
        Object.entries(patterns.commonMisclassifications).forEach(([misclass, count]) => {
            if (count >= 3) { // Only suggest for patterns that occur 3+ times
                const [from, to] = misclass.split(' -> ');
                suggestions.push({
                    type: 'certainty_rule',
                    description: `Add certainty rule for ${from} -> ${to} (${count} occurrences)`,
                    priority: count
                });
            }
        });

        // Suggest keyword adjustments
        Object.entries(patterns.problematicKeywords).forEach(([keyword, count]) => {
            if (count >= 2) {
                suggestions.push({
                    type: 'keyword_adjustment',
                    description: `Adjust keyword handling for "${keyword}" (${count} misclassifications)`,
                    priority: count
                });
            }
        });

        // Suggest confidence threshold adjustments
        if (patterns.confidenceIssues.length > 0) {
            suggestions.push({
                type: 'confidence_threshold',
                description: `Review confidence thresholds - ${patterns.confidenceIssues.length} high-confidence misclassifications`,
                priority: patterns.confidenceIssues.length
            });
        }

        return suggestions.sort((a, b) => b.priority - a.priority);
    }

    // Export feedback data for external analysis
    exportFeedbackData() {
        return {
            feedbackData: this.feedbackData,
            stats: this.getFeedbackStats(),
            patterns: this.analyzeFeedbackPatterns(),
            suggestions: this.generateRuleRefinements(),
            exportDate: new Date().toISOString()
        };
    }

    // Create explicit feedback UI (to be called from content script)
    createFeedbackUI(attemptId, refinedPrompt) {
        // Create a subtle feedback button
        const feedbackButton = document.createElement('div');
        feedbackButton.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
            " onmouseover="this.style.background='rgba(0, 0, 0, 0.9)'" onmouseout="this.style.background='rgba(0, 0, 0, 0.8)'">
                Wrong category? <span style="color: #4CAF50;">Click here</span>
            </div>
        `;
        
        feedbackButton.addEventListener('click', () => {
            this.showFeedbackModal(attemptId, refinedPrompt);
            feedbackButton.remove();
        });
        
        document.body.appendChild(feedbackButton);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (feedbackButton.parentNode) {
                feedbackButton.remove();
            }
        }, 10000);
    }

    // Show feedback modal for category correction
    showFeedbackModal(attemptId, refinedPrompt) {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <div style="
                    background: white;
                    padding: 24px;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    max-width: 400px;
                    width: 90%;
                ">
                    <h3 style="margin: 0 0 16px 0; color: #333;">What was this about?</h3>
                    <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">
                        Help us improve by selecting the correct category:
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
                        <button class="feedback-option" data-category="coding" style="
                            padding: 12px 16px;
                            border: 1px solid #ddd;
                            background: white;
                            border-radius: 6px;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.2s ease;
                        ">💻 Coding & Development</button>
                        <button class="feedback-option" data-category="image_generation" style="
                            padding: 12px 16px;
                            border: 1px solid #ddd;
                            background: white;
                            border-radius: 6px;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.2s ease;
                        ">🎨 Image Generation</button>
                        <button class="feedback-option" data-category="grammar_spelling" style="
                            padding: 12px 16px;
                            border: 1px solid #ddd;
                            background: white;
                            border-radius: 6px;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.2s ease;
                        ">✏️ Grammar & Writing</button>
                        <button class="feedback-option" data-category="research_analysis" style="
                            padding: 12px 16px;
                            border: 1px solid #ddd;
                            background: white;
                            border-radius: 6px;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.2s ease;
                        ">🔍 Research & Analysis</button>
                        <button class="feedback-option" data-category="content_creation" style="
                            padding: 12px 16px;
                            border: 1px solid #ddd;
                            background: white;
                            border-radius: 6px;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.2s ease;
                        ">📝 Content Creation</button>
                        <button class="feedback-option" data-category="general" style="
                            padding: 12px 16px;
                            border: 1px solid #ddd;
                            background: white;
                            border-radius: 6px;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.2s ease;
                        ">❓ General</button>
                    </div>
                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                        <button id="cancel-feedback" style="
                            padding: 8px 16px;
                            border: 1px solid #ddd;
                            background: white;
                            border-radius: 6px;
                            cursor: pointer;
                        ">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add hover effects
        modal.querySelectorAll('.feedback-option').forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.background = '#f5f5f5';
                button.style.borderColor = '#4CAF50';
            });
            button.addEventListener('mouseleave', () => {
                button.style.background = 'white';
                button.style.borderColor = '#ddd';
            });
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                this.collectExplicitFeedback(attemptId, category);
                modal.remove();
            });
        });
        
        // Cancel button
        modal.querySelector('#cancel-feedback').addEventListener('click', () => {
            modal.remove();
        });
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal.firstElementChild) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    }

    // Initialize feedback data loading
    async initialize() {
        try {
            // Check if chrome.storage is available (extension context not invalidated)
            if (!chrome || !chrome.storage || !chrome.storage.local) {
                console.error('Threadly: Extension context invalidated. Please refresh the page.');
                throw new Error('Extension context invalidated. Please refresh the page to continue using Threadly.');
            }
            
            const result = await chrome.storage.local.get(['geminiApiKey']);
            this.apiKey = result.geminiApiKey;
            
            // Load prompts database
            await this.loadPromptsDatabase();
            
            // Load feedback data
            await this.loadFeedbackData();
            
            return !!this.apiKey;
        } catch (error) {
            console.error('Failed to initialize PromptRefiner:', error);
            
            // If it's a context invalidation error, provide a helpful message
            if (error.message.includes('Extension context invalidated')) {
                throw error; // Re-throw to be handled by the calling code
            }
            
            return false;
        }
    }

    // Assess prompt quality and determine refinement need
    assessPromptQuality(userPrompt) {
        const prompt = userPrompt.toLowerCase();
        let score = 50; // Start with neutral score - assume user knows what they want
        let need = 'low';
        
        // Length analysis - be more understanding
        if (userPrompt.length < 10) {
            score -= 20; // Very short prompts might need more context
        } else if (userPrompt.length < 30) {
            score -= 10; // Short prompts can be perfectly fine
        } else if (userPrompt.length > 200) {
            score += 5; // Longer prompts are usually more detailed
        }
        
        // Structure analysis - appreciate natural communication
        const hasQuestion = prompt.includes('?');
        const hasPeriod = prompt.includes('.');
        const hasComma = prompt.includes(',');
        const hasColon = prompt.includes(':');
        
        if (hasQuestion) score += 3; // Questions show engagement
        if (hasPeriod) score += 2; // Complete thoughts
        if (hasComma) score += 1; // Natural flow
        if (hasColon) score += 2; // Structured thinking
        
        // Clarity indicators - understand user intent
        const clarityWords = ['please', 'can you', 'could you', 'help me', 'i need', 'i want', 'explain', 'describe', 'create', 'write', 'generate'];
        const clarityCount = clarityWords.filter(word => prompt.includes(word)).length;
        score += clarityCount * 1; // Appreciate polite requests
        
        // Specificity indicators - value user's details
        const specificWords = ['specific', 'detailed', 'example', 'step by step', 'with', 'including', 'for', 'about'];
        const specificCount = specificWords.filter(word => prompt.includes(word)).length;
        score += specificCount * 2; // Value specificity
        
        // Context indicators - understand user's situation
        const contextWords = ['as a', 'act as', 'pretend', 'imagine', 'suppose', 'considering', 'given that'];
        const contextCount = contextWords.filter(word => prompt.includes(word)).length;
        score += contextCount * 3; // Appreciate context
        
        // Format indicators - optional, not required
        const formatWords = ['format', 'structure', 'list', 'table', 'code', 'json', 'markdown', 'bullet points'];
        const formatCount = formatWords.filter(word => prompt.includes(word)).length;
        score += formatCount * 2; // Nice to have
        
        // Grammar and spelling - be more forgiving of casual language
        const commonMistakes = ['wanna', 'gonna', 'dont', 'cant', 'wont', 'aint', 'ur', 'u', 'r', '2', '4'];
        const mistakeCount = commonMistakes.filter(mistake => prompt.includes(mistake)).length;
        score -= mistakeCount * 1; // Smaller penalty for casual language
        
        // Vague language - understand that sometimes users don't know exactly what they want
        const vagueWords = ['thing', 'stuff', 'something', 'anything', 'whatever', 'maybe', 'probably', 'kind of'];
        const vagueCount = vagueWords.filter(word => prompt.includes(word)).length;
        score -= vagueCount * 1; // Smaller penalty for uncertainty
        
        // Determine refinement need - more generous thresholds
        if (score < 30) {
            need = 'high';
        } else if (score < 50) {
            need = 'medium';
        } else {
            need = 'low';
        }
        
        return { score: Math.max(0, Math.min(100, score)), need };
    }

    // Find similar prompts from the database
    findSimilarPrompts(userPrompt, limit = 3) {
        if (!this.promptsDatabase || !this.promptsDatabase.prompts) {
            return [];
        }
        
        const userWords = this.extractKeywords(userPrompt);
        const similarities = [];
        
        for (const prompt of this.promptsDatabase.prompts) {
            const promptWords = this.extractKeywords(prompt.prompt);
            const similarity = this.calculateSimilarity(userWords, promptWords);
            
            if (similarity > 0.3) { // Only include reasonably similar prompts
                similarities.push({
                    prompt: prompt.prompt,
                    category: prompt.category,
                    similarity: similarity,
                    title: prompt.title || 'Untitled'
                });
            }
        }
        
        // Sort by similarity and return top matches
        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }

    // Extract keywords from text
    extractKeywords(text) {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);
        
        // Remove common stop words
        const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'];
        
        return words.filter(word => !stopWords.includes(word));
    }

    // Calculate similarity between two sets of keywords
    calculateSimilarity(words1, words2) {
        const set1 = new Set(words1);
        const set2 = new Set(words2);
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return intersection.size / union.size; // Jaccard similarity
    }

    // Detect if user has shared images/photos
    detectSharedImages(userPrompt) {
        const prompt = userPrompt.toLowerCase();
        
        // Check for explicit references to shared images
        const imageReferences = [
            'this photo', 'this image', 'this picture', 'the photo', 'the image', 'the picture',
            'my photo', 'my image', 'my picture', 'uploaded image', 'provided image',
            'use this photo', 'of these people', 'this person', 'these people',
            'the uploaded', 'the shared', 'attached image', 'attached photo'
        ];
        
        const hasImageReference = imageReferences.some(ref => prompt.includes(ref));
        
        // Check for image editing/modification requests
        const editingTerms = [
            'edit this', 'modify this', 'change this', 'add to this', 'remove from this',
            'transform this', 'style this', 'enhance this', 'improve this'
        ];
        
        const hasEditingRequest = editingTerms.some(term => prompt.includes(term));
        
        return hasImageReference || hasEditingRequest;
    }

    // Simple grammar and spelling correction
    async performGrammarCorrection(userPrompt) {
        const systemPrompt = `You are a grammar and spelling correction assistant. Your task is to correct grammar, spelling, and basic language issues while preserving the user's original intent and tone.

CORRECTION GUIDELINES:
- Fix spelling errors and typos
- Correct grammar mistakes
- Improve sentence structure for clarity
- Maintain the original tone and style
- Keep the same meaning and intent
- Make minimal changes - only fix what's broken
- Don't add extra content or explanations

IMPORTANT: Return ONLY the corrected text. Do not include any labels, headers, formatting, or explanations. Just the corrected text itself.`;

        return await this.callGeminiAPI(systemPrompt, userPrompt);
    }

    // Platform-specific image generation prompt refinement
    async refineImageGenerationPrompt(userPrompt, platform, triageResult = null) {
        let systemPrompt;
        
        // Choose the appropriate system prompt based on platform
        if (platform === 'chatgpt') {
            systemPrompt = this.getDALLEMidjourneySystemPrompt();
        } else if (platform === 'gemini' || platform === 'ai-studio') {
            systemPrompt = this.getGeminiImageSystemPrompt();
        } else {
            // Default to Gemini for other platforms
            systemPrompt = this.getGeminiImageSystemPrompt();
        }

        // Add context about shared images if detected
        if (triageResult && triageResult.hasSharedImages) {
            if (platform === 'chatgpt') {
                systemPrompt += `\n\nIMPORTANT: The user has referenced shared/uploaded images. Include references to "based on the provided image" or "using the uploaded photo" in your refined prompt.`;
            } else {
                systemPrompt += `\n\nIMPORTANT: The user has referenced shared/uploaded images. Make sure to include references to "the provided image" or "using the uploaded image" in your refined prompt.`;
            }
        }

        return await this.callGeminiAPI(systemPrompt, userPrompt);
    }

    // DALL-E/Midjourney system prompt for ChatGPT
    getDALLEMidjourneySystemPrompt() {
        return `You are a helpful assistant who understands what users want to create with images. Your task is to refine their image generation prompts to help them get better results.

HUMAN-LIKE IMAGE PROMPT REFINEMENT:

**Understanding the User's Vision:**
- Listen to what the user is really trying to create
- Understand their creative intent and emotional goals
- Help them express their vision more clearly
- Make their prompt more effective without losing their original idea

**DALL-E Optimization (Natural Language):**
- Use descriptive, conversational language
- Be specific about what they want to see
- Include style and mood that matches their intent
- Add helpful details that enhance their vision
- Use quality boosters when appropriate: "high quality", "detailed"
- Include negative prompts only when needed: "no text", "no watermark"

**Gentle Enhancement Approach:**
- Build on their original idea rather than replacing it
- Add helpful details that serve their creative vision
- Use photography and art terminology naturally
- Include lighting and composition that enhances their concept
- Focus on making their image generation more successful

**Example Enhancement:**
User: "elephant in red suit"
Enhanced: "A majestic elephant wearing a vibrant red suit, photorealistic style, dramatic lighting, centered composition, high quality, detailed, professional, no text, no watermark"

REFINEMENT PHILOSOPHY:
- Understand what the user really wants to create
- Enhance their prompt to help them achieve their vision
- Use natural language that feels conversational
- Focus on making their creative process easier and more successful
- Be empathetic to their creative goals

IMPORTANT: Return ONLY the refined prompt text. Do not include any labels, headers, formatting, or explanations. Just the refined prompt itself.`;
    }

    // Gemini/AI Studio system prompt using official templates
    getGeminiImageSystemPrompt() {
        return `You are a helpful assistant who understands what users want to create with images. Your task is to refine their image generation prompts to help them get better results using Gemini's capabilities.

OFFICIAL GEMINI IMAGE GENERATION TEMPLATES:

1. PHOTOREALISTIC SCENES:
Template: "A photorealistic [shot type] of [subject], [action or expression], set in [environment]. The scene is illuminated by [lighting description], creating a [mood] atmosphere. Captured with a [camera/lens details], emphasizing [key textures and details]. The image should be in a [aspect ratio] format."

2. STYLIZED ILLUSTRATIONS & STICKERS:
Template: "A [style] sticker of a [subject], featuring [key characteristics] and a [color palette]. The design should have [line style] and [shading style]. The background must be transparent."

3. ACCURATE TEXT IN IMAGES:
Template: "Create a [image type] for [brand/concept] with the text '[text to render]' in a [font style]. The design should be [style description], with a [color scheme]."

4. PRODUCT MOCKUPS & COMMERCIAL:
Template: "A high-resolution, studio-lit product photograph of a [product description] on a [background surface/description]. The lighting is a [lighting setup] to [lighting purpose]. The camera angle is a [angle type] to showcase [specific feature]. Ultra-realistic, with sharp focus on [key detail]. [Aspect ratio]."

5. MINIMALIST & NEGATIVE SPACE:
Template: "A minimalist composition featuring a single [subject] positioned in the [position] of the frame. The background is a vast, empty [color] canvas, creating significant negative space. Soft, subtle lighting. [Aspect ratio]."

6. SEQUENTIAL ART (COMIC PANEL):
Template: "A single comic book panel in a [art style] style. In the foreground, [character description and action]. In the background, [setting details]. The panel has a [dialogue/caption box] with the text '[Text]'. The lighting creates a [mood] mood. [Aspect ratio]."

IMAGE EDITING TEMPLATES:

1. ADDING/REMOVING ELEMENTS:
Template: "Using the provided image of [subject], please [add/remove/modify] [element] to/from the scene. Ensure the change is [description of how the change should integrate]."

2. INPAINTING (SEMANTIC MASKING):
Template: "Using the provided image, change only the [specific element] to [new element/description]. Keep everything else in the image exactly the same, preserving the original style, lighting, and composition."

3. STYLE TRANSFER:
Template: "Transform the provided photograph of [subject] into the artistic style of [artist/art style]. Preserve the original composition but render it with [description of stylistic elements]."

4. ADVANCED COMPOSITION:
Template: "Create a new image by combining the elements from the provided images. Take the [element from image 1] and place it with/on the [element from image 2]. The final image should be a [description of the final scene]."

5. HIGH-FIDELITY DETAIL PRESERVATION:
Template: "Using the provided images, place [element from image 2] onto [element from image 1]. Ensure that the features of [element from image 1] remain completely unchanged. The added element should [description of how the element should integrate]."

BEST PRACTICES:
- Be hyper-specific with details
- Provide context and intent
- Use step-by-step instructions for complex scenes
- Use semantic negative prompts (describe what you want, not what you don't)
- Control the camera with photographic language
- Include aspect ratio specifications

HUMAN-LIKE REFINEMENT APPROACH:
- Understand what the user really wants to create
- Choose the most appropriate template that serves their vision
- Fill in the template with their specific details and ideas
- Add helpful technical details that enhance their concept
- Include aspect ratio and quality specifications naturally
- For image editing requests, use the appropriate editing template
- Preserve any references to shared/uploaded images
- Focus on making their creative process easier and more successful

IMPORTANT: Return ONLY the refined prompt text. Do not include any labels, headers, formatting, or explanations. Just the refined prompt itself.`;
    }

    // Light enhancement for high-quality prompts
    async performLightEnhancement(userPrompt, platform, triageResult) {
        let systemPrompt = `You are a helpful assistant who understands what users really need. The user has provided a good prompt that just needs gentle improvement.

HUMAN-LIKE ENHANCEMENT APPROACH:
- Understand what the user is really trying to accomplish
- Make only helpful, minimal changes that serve the user's actual needs
- Fix obvious issues without being overly critical
- Enhance clarity where it genuinely helps the user
- Respect the user's communication style and preferences
- Be empathetic to the user's situation and goals
- Understand context vs literal keywords (e.g., "Apple-like UI" means design style, not Swift code)
- Choose appropriate tools/languages based on user's actual needs, not keyword matching

REFINEMENT NEED: ${triageResult.refinementNeed.toUpperCase()}
PROMPT QUALITY: ${triageResult.promptQuality}/100

IMPORTANT: Return ONLY the enhanced prompt text. Do not include any labels, headers, formatting, or explanations. Just the enhanced prompt itself.`;

        // Add similar prompts context if available
        if (triageResult.similarPrompts && triageResult.similarPrompts.length > 0) {
            systemPrompt += `\n\nSIMILAR SUCCESSFUL PROMPTS FOR REFERENCE:\n`;
            triageResult.similarPrompts.forEach((similar, index) => {
                systemPrompt += `${index + 1}. ${similar.prompt.substring(0, 200)}...\n`;
            });
        }

        return await this.callGeminiAPI(systemPrompt, userPrompt);
    }

    buildSystemPrompt(platform, taskCategory, triageResult = null) {
        const basePrompt = this.platformConfigs[platform].systemPrompt;
        const taskGuidelines = this.getTaskGuidelines(taskCategory);
        
        let triageContext = '';
        if (triageResult) {
            triageContext = `

TRIAGE ANALYSIS:
- Primary Category: ${triageResult.primaryCategory}
- Confidence: ${(triageResult.confidence * 100).toFixed(1)}%
- Refinement Need: ${triageResult.refinementNeed.toUpperCase()}
- Prompt Quality: ${triageResult.promptQuality}/100
- Has Shared Images: ${triageResult.hasSharedImages ? 'YES' : 'NO'}
- Reasoning: ${triageResult.reasoning.join(', ')}
- All Categories: ${Object.entries(triageResult.categories).map(([key, data]) => `${key}: ${data.weight}`).join(', ')}`;

            // Add similar prompts context if available
            if (triageResult.similarPrompts && triageResult.similarPrompts.length > 0) {
                triageContext += `\n\nSIMILAR SUCCESSFUL PROMPTS FOR REFERENCE:\n`;
                triageResult.similarPrompts.forEach((similar, index) => {
                    triageContext += `${index + 1}. [${similar.category}] ${similar.prompt.substring(0, 150)}...\n`;
                });
            }
        }
        
        return `${basePrompt}

TASK CATEGORY: ${taskCategory.toUpperCase()}${triageContext}
${taskGuidelines}

HUMAN-LIKE REFINEMENT APPROACH:
1. Understand the user's true intent and emotional context behind their request
2. Preserve the user's original meaning while making it more effective
3. Add helpful structure and clarity that serves the user's actual needs
4. If the prompt is already good, make only gentle improvements
5. Respect the user's communication style and preferences
6. Enhance understanding without being overly prescriptive or rigid
7. Be empathetic to what the user is really trying to accomplish
8. Focus on making the user's life easier, not following strict rules
9. Understand context vs literal keywords (e.g., "Apple-like UI" means design style, not Swift code)
10. Choose appropriate tools/languages based on user's actual needs, not keyword matching

USER'S ORIGINAL PROMPT TO REFINE:

CONTEXT UNDERSTANDING EXAMPLES:
- "Apple-like UI" = Clean, minimalist design style (not Swift/iOS requirement)
- "Google-style search" = Fast, relevant results (not Google's specific code)
- "Netflix-like interface" = Intuitive, personalized UI (not their tech stack)
- "Spotify-like music app" = Music streaming features (not their specific implementation)

IMPORTANT: Return ONLY the refined prompt text. Do not include any labels, headers, formatting, or explanations. Just the refined prompt itself.`;
    }

    getTaskGuidelines(taskCategory) {
        const guidelines = {
            'coding': `
- Understand what the user is really trying to build or solve
- Help them express their coding needs clearly
- Include practical considerations that matter to them
- Request helpful examples and documentation
- Consider their skill level and project context
- Choose appropriate programming languages based on their actual needs, not keyword matching
- Understand design references (e.g., "Apple-like UI" means design style, not Swift requirement)
- Suggest the best tools and frameworks for their specific use case`,

            'research': `
- Understand what the user is really trying to learn or discover
- Help them find the information they actually need
- Request credible sources that serve their purpose
- Ask for recent data that's relevant to their situation
- Consider their research goals and context`,

            'personal_support': `
- Be genuinely empathetic and understanding
- Listen to what the user is really going through
- Provide specific, actionable advice that helps them
- Offer step-by-step guidance that feels supportive
- Consider their unique situation and needs
- Suggest professional help when it would genuinely benefit them`,

            'content_creation': `
- Understand what the user is really trying to communicate
- Help them connect with their intended audience
- Create engaging content that serves their purpose
- Include SEO optimization when it helps their goals
- Suggest call-to-actions that feel natural and helpful
- Respect their voice and communication style`,

            'learning': `
- Understand what the user is really trying to learn
- Break down concepts in a way that makes sense to them
- Use analogies and examples that resonate with their experience
- Provide practice opportunities that help them grow
- Consider their current knowledge level and learning style
- Include visual aids when they genuinely help understanding`,

            'technical_assistance': `
- Understand what the user is really trying to accomplish
- Provide step-by-step help that makes sense to them
- Include safety precautions that protect them
- Ask for system details that help solve their problem
- Offer alternative solutions that work for their situation
- Include prevention tips that help them avoid future issues`,

            'creativity': `
- Understand what the user is really trying to create or express
- Encourage their unique perspective and original ideas
- Offer multiple options that serve their creative vision
- Help them find inspiration that resonates with their goals
- Include constraints that actually help their creative process
- Suggest ways to develop their ideas that feel natural and exciting`
        };

        return guidelines[taskCategory] || guidelines['general'];
    }

    getChatGPTSystemPrompt() {
        return `You are an expert prompt engineer specializing in ChatGPT optimization using advanced prompting techniques. Your task is to refine user prompts to get better responses from ChatGPT.

CHATGPT OPTIMIZATION GUIDELINES:
- Use clear, direct instructions with specific roles/personas
- Apply Chain-of-Thought prompting for complex reasoning
- Use few-shot examples when beneficial
- Specify desired tone, length, and format
- Include context and constraints
- Use structured formatting with headers
- Apply meta-prompting for self-improvement
- Use self-consistency techniques for better results

ADVANCED PROMPTING TECHNIQUES:
1. PERSONA + TASK + CONTEXT + FORMAT structure
2. Chain-of-Thought: "Let's think step by step..."
3. Few-shot examples for complex tasks
4. Meta-prompting: "Act as an expert in..."
5. Self-consistency: "Provide multiple perspectives..."
6. Retrieval Augmented Generation context
7. Program-aided reasoning for technical tasks

REFINEMENT APPROACH:
- Enhance clarity without changing meaning
- Add specific role assignments and expertise levels
- Structure prompts with clear sections (Persona/Task/Context/Format)
- Include output format specifications
- Add reasoning chains for complex problems
- Include examples when helpful
- Apply appropriate prompting techniques based on task type`;
    }

    getClaudeSystemPrompt() {
        return `You are an expert prompt engineer specializing in Claude optimization using advanced prompting techniques. Your task is to refine user prompts to get better responses from Claude.

CLAUDE OPTIMIZATION GUIDELINES:
- Use XML tags for structure (<instruction>, <context>, <task>, <example>)
- Assign clear roles and personas with expertise levels
- Include few-shot examples when beneficial
- Encourage step-by-step reasoning with Chain-of-Thought
- Use clear, conversational language
- Break complex tasks into subtasks
- Apply ReAct (Reasoning + Acting) for problem-solving
- Use Reflexion for iterative improvement

ADVANCED PROMPTING TECHNIQUES:
1. XML Structure: <instruction>, <context>, <task>, <example>
2. Chain-of-Thought: "Let's work through this step by step..."
3. ReAct: "Let me think about this... I need to..."
4. Reflexion: "Let me reconsider this approach..."
5. Few-shot examples with clear patterns
6. Meta-prompting with expert personas
7. Tree of Thoughts for complex reasoning

REFINEMENT APPROACH:
- Add XML structure for better organization
- Include relevant examples when helpful
- Assign appropriate roles and personas with expertise
- Encourage chain-of-thought reasoning
- Structure complex requests into clear steps
- Apply ReAct methodology for problem-solving
- Use Reflexion for iterative improvement`;
    }

    getGeminiSystemPrompt() {
        return `You are an expert prompt engineer specializing in Gemini optimization using advanced prompting techniques. Your task is to refine user prompts to get better responses from Gemini.

GEMINI OPTIMIZATION GUIDELINES:
- Use explicit, clear instructions with rich context
- Provide comprehensive background information
- Specify desired output format and style
- Use conversational, natural language
- Include examples when helpful
- Structure with clear headings and sections
- Apply multimodal reasoning when relevant
- Use graph-based prompting for complex relationships

ADVANCED PROMPTING TECHNIQUES:
1. Rich Context: Provide comprehensive background
2. Multimodal CoT: "Let's analyze this step by step..."
3. Graph Prompting: "Consider the relationships between..."
4. Self-Consistency: "Provide multiple approaches..."
5. Few-shot examples with clear patterns
6. Meta-prompting with domain expertise
7. Retrieval Augmented Generation context

REFINEMENT APPROACH:
- Add explicit instructions and rich context
- Specify output format and style
- Include relevant background information
- Use natural, conversational tone
- Add structure with clear sections
- Include examples when beneficial
- Apply multimodal reasoning techniques
- Use graph-based thinking for complex problems`;
    }

    getPerplexitySystemPrompt() {
        return `You are an expert prompt engineer specializing in Perplexity optimization using advanced prompting techniques. Your task is to refine user prompts to get better responses from Perplexity.

PERPLEXITY OPTIMIZATION GUIDELINES:
- Start with clear, specific instructions
- Provide relevant background and context
- Specify data sources and keywords
- Request data-backed insights and citations
- Ask for specific output formats
- Include follow-up question suggestions
- Apply Retrieval Augmented Generation principles
- Use evidence-based reasoning

ADVANCED PROMPTING TECHNIQUES:
1. RAG Context: "Based on recent data and research..."
2. Evidence-Based: "Provide sources and citations for..."
3. Keyword Optimization: "Focus on these specific terms..."
4. Follow-up Exploration: "What additional questions should I ask?"
5. Data-Driven: "Include statistics and recent findings..."
6. Source Specification: "Use these types of sources..."
7. Citation Format: "Provide citations in this format..."

REFINEMENT APPROACH:
- Add clear instruction statements
- Include relevant background context
- Specify desired data sources and keywords
- Request evidence-based responses with citations
- Add output format specifications
- Include follow-up exploration suggestions
- Apply RAG principles for better retrieval
- Use evidence-based reasoning techniques`;
    }

    async callGeminiAPI(systemPrompt, userPrompt) {
        const requestBody = {
            contents: [{
                parts: [{
                    text: `${systemPrompt}\n\n"${userPrompt}"`
                }]
            }],
            generationConfig: {
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        };

        try {
            const response = await fetch(`${this.platformConfigs['gemini'].baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response from Gemini API');
            }

            return data.candidates[0].content.parts[0].text.trim();
        } catch (error) {
            console.error('Gemini API call failed:', error);
            throw new Error(`Failed to refine prompt: ${error.message}`);
        }
    }

    detectTaskCategory(userPrompt) {
        const prompt = userPrompt.toLowerCase();
        
        // Coding keywords
        if (prompt.includes('code') || prompt.includes('programming') || prompt.includes('function') || 
            prompt.includes('algorithm') || prompt.includes('debug') || prompt.includes('api') ||
            prompt.includes('javascript') || prompt.includes('python') || prompt.includes('java') ||
            prompt.includes('html') || prompt.includes('css') || prompt.includes('sql')) {
            return 'coding';
        }
        
        // Research keywords
        if (prompt.includes('research') || prompt.includes('study') || prompt.includes('analysis') ||
            prompt.includes('data') || prompt.includes('statistics') || prompt.includes('survey') ||
            prompt.includes('findings') || prompt.includes('report') || prompt.includes('investigate')) {
            return 'research';
        }
        
        // Personal support keywords
        if (prompt.includes('help me') || prompt.includes('advice') || prompt.includes('struggling') ||
            prompt.includes('problem') || prompt.includes('difficult') || prompt.includes('support') ||
            prompt.includes('guidance') || prompt.includes('counseling') || prompt.includes('therapy')) {
            return 'personal_support';
        }
        
        // Content creation keywords
        if (prompt.includes('write') || prompt.includes('create') || prompt.includes('content') ||
            prompt.includes('blog') || prompt.includes('article') || prompt.includes('copy') ||
            prompt.includes('marketing') || prompt.includes('social media') || prompt.includes('email')) {
            return 'content_creation';
        }
        
        // Learning keywords
        if (prompt.includes('learn') || prompt.includes('teach') || prompt.includes('explain') ||
            prompt.includes('understand') || prompt.includes('tutorial') || prompt.includes('course') ||
            prompt.includes('education') || prompt.includes('study guide') || prompt.includes('how to')) {
            return 'learning';
        }
        
        // Technical assistance keywords
        if (prompt.includes('troubleshoot') || prompt.includes('fix') || prompt.includes('error') ||
            prompt.includes('install') || prompt.includes('setup') || prompt.includes('configure') ||
            prompt.includes('technical') || prompt.includes('computer') || prompt.includes('software')) {
            return 'technical_assistance';
        }
        
        // Creativity keywords
        if (prompt.includes('creative') || prompt.includes('idea') || prompt.includes('brainstorm') ||
            prompt.includes('design') || prompt.includes('story') || prompt.includes('art') ||
            prompt.includes('imagine') || prompt.includes('invent') || prompt.includes('innovative')) {
            return 'creativity';
        }
        
        return 'general';
    }

    detectPlatform(url) {
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

    // Test function for triage system (for development/testing)
    async testTriageSystem() {
        const testPrompts = [
            "hey chatgpt i wanna text my girlfriend a birthday message",
            "create a photorealistic image of a sunset over mountains",
            "write code for a Python function that calculates fibonacci numbers",
            "can you help me write a professional email to my boss",
            "generate an anime-style character with blue hair and green eyes",
            "research the latest trends in artificial intelligence",
            "fix the grammar in this sentence: 'i am go to store yesterday'",
            "make a logo for my coffee shop called 'The Daily Grind'",
            "Act as a senior software engineer. Write a comprehensive Python function that calculates Fibonacci numbers efficiently, including error handling, documentation, and performance analysis.",
            "thing stuff whatever",
            "edit this photo to add a sunset background",
            "use this image to create a professional headshot",
            "transform the provided image into anime style",
            "create a logo for my startup",
            "photorealistic portrait of a CEO, professional headshot, studio lighting",
            "picture of a elephant in red suit at met gala",
            "make me a c++ calculator app with pretty apple like ui, the 0 should be in red color, which can be previewed in chatgpt canvas"
        ];

        console.log('Threadly: Testing Enhanced Triage System...');
        
        for (const prompt of testPrompts) {
            try {
                const analysis = await this.analyzeContext(prompt);
                console.log(`\n📝 Prompt: "${prompt}"`);
                console.log(`🎯 Primary Category: ${analysis.primaryCategory}`);
                console.log(`📊 Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
                console.log(`⭐ Prompt Quality: ${analysis.promptQuality}/100`);
                console.log(`🔧 Refinement Need: ${analysis.refinementNeed.toUpperCase()}`);
                console.log(`📸 Has Shared Images: ${analysis.hasSharedImages ? 'YES' : 'NO'}`);
                console.log(`💭 Reasoning: ${analysis.reasoning.join(', ')}`);
                console.log(`⚖️ All Weights: ${Object.entries(analysis.categories).map(([key, data]) => `${key}: ${data.weight}`).join(', ')}`);
                
                if (analysis.similarPrompts && analysis.similarPrompts.length > 0) {
                    console.log(`🔍 Similar Prompts Found: ${analysis.similarPrompts.length}`);
                    analysis.similarPrompts.forEach((similar, index) => {
                        console.log(`   ${index + 1}. [${similar.category}] Similarity: ${(similar.similarity * 100).toFixed(1)}%`);
                    });
                } else {
                    console.log(`🔍 No similar prompts found`);
                }
            } catch (error) {
                console.error(`❌ Error testing prompt "${prompt}":`, error);
            }
        }
    }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromptRefiner;
} else {
    window.PromptRefiner = PromptRefiner;
}
