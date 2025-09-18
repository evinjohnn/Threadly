/**
 * Threadly Prompt Refiner - API Handler
 * Handles Gemini API calls and prompt refinement logic
 */

class PromptRefiner {
    constructor() {
        this.apiKey = null;
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
    }

    async initialize() {
        try {
            const result = await chrome.storage.local.get(['geminiApiKey']);
            this.apiKey = result.geminiApiKey;
            return !!this.apiKey;
        } catch (error) {
            console.error('Failed to initialize PromptRefiner:', error);
            return false;
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

        const systemPrompt = this.buildSystemPrompt(platform, taskCategory);
        const refinedPrompt = await this.callGeminiAPI(systemPrompt, userPrompt);
        
        return refinedPrompt;
    }

    buildSystemPrompt(platform, taskCategory) {
        const basePrompt = this.platformConfigs[platform].systemPrompt;
        const taskGuidelines = this.getTaskGuidelines(taskCategory);
        
        return `${basePrompt}

TASK CATEGORY: ${taskCategory.toUpperCase()}
${taskGuidelines}

IMPORTANT REFINEMENT RULES:
1. NEVER omit or change the user's original intent, context, or specific values
2. ALWAYS preserve the core meaning and purpose of the user's request
3. Only add structure, clarity, and platform-specific formatting
4. If the user's prompt is already well-structured, make minimal changes
5. Always maintain the user's original tone and style preferences
6. Add context only when it enhances understanding without changing intent

USER'S ORIGINAL PROMPT TO REFINE:`;
    }

    getTaskGuidelines(taskCategory) {
        const guidelines = {
            'coding': `
- Specify programming language and framework when relevant
- Include error handling and edge cases
- Request code examples and documentation
- Ask for performance considerations
- Specify testing requirements`,

            'research': `
- Request credible sources and citations
- Ask for recent data and statistics
- Specify scope and depth of research
- Request multiple perspectives
- Ask for methodology details`,

            'personal_support': `
- Maintain empathetic and supportive tone
- Request specific, actionable advice
- Ask for step-by-step guidance
- Consider individual circumstances
- Suggest professional help when appropriate`,

            'content_creation': `
- Specify target audience and platform
- Request engaging and compelling content
- Ask for SEO optimization when relevant
- Include call-to-action suggestions
- Specify tone and style requirements`,

            'learning': `
- Break down complex concepts into digestible parts
- Request analogies and real-world examples
- Ask for practice exercises or quizzes
- Specify difficulty level and prerequisites
- Include visual aids when helpful`,

            'technical_assistance': `
- Provide step-by-step troubleshooting
- Include safety precautions
- Ask for system specifications
- Request alternative solutions
- Include prevention tips`,

            'creativity': `
- Encourage unique and original ideas
- Request multiple options or variations
- Ask for inspiration sources
- Include specific constraints or requirements
- Suggest ways to develop ideas further`
        };

        return guidelines[taskCategory] || guidelines['general'];
    }

    getChatGPTSystemPrompt() {
        return `You are an expert prompt engineer specializing in ChatGPT optimization. Your task is to refine user prompts to get better responses from ChatGPT.

CHATGPT OPTIMIZATION GUIDELINES:
- Use clear, direct instructions
- Assign specific roles or personas
- Specify desired tone, length, and format
- Request reasoning or step-by-step explanations
- Include context and constraints
- Use structured formatting with headers when appropriate

REFINEMENT APPROACH:
- Enhance clarity without changing meaning
- Add specific role assignments when helpful
- Structure prompts with clear sections
- Include output format specifications
- Add context that improves response quality`;
    }

    getClaudeSystemPrompt() {
        return `You are an expert prompt engineer specializing in Claude optimization. Your task is to refine user prompts to get better responses from Claude.

CLAUDE OPTIMIZATION GUIDELINES:
- Use XML tags for structure (<instruction>, <context>, <task>, <example>)
- Assign clear roles and personas
- Include few-shot examples when beneficial
- Encourage step-by-step reasoning
- Use clear, conversational language
- Break complex tasks into subtasks

REFINEMENT APPROACH:
- Add XML structure for better organization
- Include relevant examples when helpful
- Assign appropriate roles and personas
- Encourage chain-of-thought reasoning
- Structure complex requests into clear steps`;
    }

    getGeminiSystemPrompt() {
        return `You are an expert prompt engineer specializing in Gemini optimization. Your task is to refine user prompts to get better responses from Gemini.

GEMINI OPTIMIZATION GUIDELINES:
- Use explicit, clear instructions
- Provide rich contextual information
- Specify desired output format and style
- Use conversational, natural language
- Include examples when helpful
- Structure with clear headings and sections

REFINEMENT APPROACH:
- Add explicit instructions and context
- Specify output format and style
- Include relevant background information
- Use natural, conversational tone
- Add structure with clear sections
- Include examples when beneficial`;
    }

    getPerplexitySystemPrompt() {
        return `You are an expert prompt engineer specializing in Perplexity optimization. Your task is to refine user prompts to get better responses from Perplexity.

PERPLEXITY OPTIMIZATION GUIDELINES:
- Start with clear, specific instructions
- Provide relevant background and context
- Specify data sources and keywords
- Request data-backed insights and citations
- Ask for specific output formats
- Include follow-up question suggestions

REFINEMENT APPROACH:
- Add clear instruction statements
- Include relevant background context
- Specify desired data sources and keywords
- Request evidence-based responses
- Add output format specifications
- Include follow-up exploration suggestions`;
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
        } else if (url.includes('gemini.google.com') || url.includes('aistudio.google.com')) {
            return 'gemini';
        } else if (url.includes('perplexity.ai')) {
            return 'perplexity';
        }
        return 'chatgpt'; // default fallback
    }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromptRefiner;
} else {
    window.PromptRefiner = PromptRefiner;
}
