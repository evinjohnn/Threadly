/**
 * Threadly Prompt Refiner - API Handler
 * Handles Gemini API calls and prompt refinement logic
 */

class PromptRefiner {
    constructor() {
        this.apiKey = null;
        this.promptsDatabase = null;
        this.platformConfigs = {
            'chatgpt': {
                name: 'ChatGPT',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
                systemPrompt: this.getChatGPTSystemPrompt()
            },
            'claude': {
                name: 'Claude',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
                systemPrompt: this.getClaudeSystemPrompt()
            },
            'gemini': {
                name: 'Gemini',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
                systemPrompt: this.getGeminiSystemPrompt()
            },
            'perplexity': {
                name: 'Perplexity',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
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
                'ai_prompting': {
                    name: 'AI Prompting Enhancement',
                    weight: 0,
                    keywords: ['code', 'research', 'analyze', 'explain', 'help', 'assist', 'guide', 'tutorial', 'app', 'application', 'program', 'software', 'c++', 'python', 'javascript', 'java', 'react', 'vue', 'angular', 'html', 'css', 'sql', 'database', 'api', 'function', 'class', 'method', 'variable', 'algorithm', 'debug', 'fix', 'implement', 'build', 'develop', 'create', 'make'],
                    patterns: [
                        /(write|create|generate|make|build|develop)\s+(code|program|script|function|app|application|software)/i,
                        /(make|create|build)\s+(me|a|an)\s+(c\+\+|python|javascript|java|react|vue|angular|html|css|sql|app|application|program|software)/i,
                        /(research|analyze|study|investigate)/i,
                        /(explain|teach|guide|tutorial|how to)/i,
                        /(help me|assist me|guide me)/i,
                        /(c\+\+|python|javascript|java|react|vue|angular|html|css|sql)\s+(app|application|program|code|function|class)/i,
                        /(calculator|todo|notes|chat|game|website|dashboard|portfolio)\s+(app|application|program)/i,
                        /(debug|fix|implement|optimize)\s+(code|program|function|algorithm)/i
                    ]
                }
            }
        };
    }

    async initialize() {
        try {
            const result = await chrome.storage.local.get(['geminiApiKey']);
            this.apiKey = result.geminiApiKey;
            
            // Load prompts database
            await this.loadPromptsDatabase();
            
            return !!this.apiKey;
        } catch (error) {
            console.error('Failed to initialize PromptRefiner:', error);
            return false;
        }
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
        } else {
            // AI prompting enhancement (default or when confidence is mixed)
            const systemPrompt = this.buildSystemPrompt(platform, taskCategory, triageResult);
            refinedPrompt = await this.callGeminiAPI(systemPrompt, userPrompt);
        }
        
        return refinedPrompt;
    }

    // Triage AI: Analyze context and determine refinement type
    async analyzeContext(userPrompt) {
        const prompt = userPrompt.toLowerCase();
        const analysis = {
            categories: {},
            primaryCategory: 'ai_prompting',
            confidence: 0,
            reasoning: [],
            refinementNeed: 'low',
            promptQuality: 0,
            similarPrompts: []
        };

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
        const hasCodingKeywords = analysis.categories.ai_prompting.weight > 0;
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
                analysis.categories.ai_prompting.weight += 5;
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

        // Calculate confidence based on weight distribution
        const totalWeight = Object.values(analysis.categories).reduce((sum, cat) => sum + cat.weight, 0);
        if (totalWeight > 0) {
            analysis.confidence = maxWeight / totalWeight;
        }

        // Add reasoning
        analysis.reasoning = analysis.categories[analysis.primaryCategory].matches;

        return analysis;
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
