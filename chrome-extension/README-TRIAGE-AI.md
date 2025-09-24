# Threadly Triage AI Refine System

## Overview

The Threadly Triage AI Refine System is a sophisticated prompt refinement feature that intelligently analyzes user input and applies the most appropriate refinement strategy based on context and intent.

## How It Works

### 1. Context Analysis
The system analyzes user prompts using:
- **Keyword matching**: Identifies relevant terms and concepts
- **Pattern recognition**: Uses regex patterns to detect specific request types
- **Contextual understanding**: Considers prompt length, complexity, and intent
- **Prompt quality assessment**: Evaluates structure, clarity, and specificity
- **Similarity matching**: Finds related prompts from the database

### 2. Multi-Dimensional Scoring
Each prompt is evaluated across multiple dimensions:
- **Category Classification**: Grammar/Spelling, Image Generation, AI Prompting
- **Quality Score**: 0-100 based on structure, clarity, and specificity
- **Refinement Need**: High, Medium, or Low based on quality assessment
- **Similarity Matching**: Finds related successful prompts for reference

### 3. Intelligent Routing
Based on comprehensive analysis, the system routes prompts to:
- **Light Enhancement**: For high-quality prompts (minimal changes)
- **Grammar Correction**: For simple text improvement requests
- **Image Generation**: For visual/artistic content creation
- **AI Prompting**: For complex reasoning, coding, research, etc.

## Categories

### Grammar & Spelling Correction
**Triggers when:**
- Simple conversational requests ("hey chatgpt i wanna text my girlfriend")
- Direct grammar/spelling requests
- Short, personal messages
- Birthday wishes, greetings, etc.

**What it does:**
- Fixes spelling errors and typos
- Corrects grammar mistakes
- Improves sentence structure
- Maintains original tone and intent

### Image Generation Enhancement
**Triggers when:**
- Visual/artistic terms (image, picture, photo, art, visual)
- Style specifications (photorealistic, anime, stylized)
- Technical terms (camera angle, lighting, composition)
- Platform mentions (DALL-E, Midjourney, Stable Diffusion)
- Image editing requests (edit this photo, modify this image)
- References to shared images (use this photo, of these people)

**What it does:**
- Uses official Gemini image generation templates
- Detects when users have shared photos and includes them in prompts
- Applies appropriate templates for different image types:
  - Photorealistic scenes with camera specifications
  - Stylized illustrations and stickers
  - Text in images with font specifications
  - Product mockups and commercial photography
  - Minimalist and negative space designs
  - Sequential art and comic panels
- Handles image editing scenarios:
  - Adding/removing elements
  - Inpainting and semantic masking
  - Style transfer
  - Advanced composition
  - High-fidelity detail preservation

### AI Prompting Enhancement
**Triggers when:**
- Coding requests (write code, function, algorithm)
- Research tasks (analyze, study, investigate)
- Complex reasoning (explain, guide, tutorial)
- Technical assistance

**What it does:**
- Applies advanced prompting techniques
- Adds Chain-of-Thought reasoning
- Includes few-shot examples
- Uses meta-prompting strategies
- Structures with Persona + Task + Context + Format

## Advanced Prompting Techniques

### ChatGPT Optimization
- Chain-of-Thought prompting
- Few-shot examples
- Meta-prompting with expert personas
- Self-consistency techniques
- Program-aided reasoning

### Claude Optimization
- XML structure tags
- ReAct (Reasoning + Acting)
- Reflexion for iterative improvement
- Tree of Thoughts for complex reasoning
- Few-shot examples with clear patterns

### Gemini Optimization
- Rich contextual information
- Multimodal reasoning
- Graph-based prompting
- Self-consistency approaches
- Retrieval Augmented Generation

### Perplexity Optimization
- Evidence-based reasoning
- Source specification
- Citation formatting
- Data-driven insights
- Follow-up exploration

## Example Workflows

### High-Quality Prompt (Light Enhancement)
**Input:** "Act as a senior software engineer. Write a comprehensive Python function that calculates Fibonacci numbers efficiently, including error handling, documentation, and performance analysis."
**Analysis:**
- Category: ai_prompting (confidence: 95%)
- Quality Score: 85/100
- Refinement Need: LOW
- Reasoning: Well-structured, specific, includes context and format requirements
**Output:** Minimal changes - prompt is already well-optimized

### Grammar Correction Example
**Input:** "hey chatgpt i wanna text my girlfriend a birthday message"
**Analysis:** 
- Category: grammar_spelling (confidence: 85%)
- Quality Score: 25/100
- Refinement Need: HIGH
- Reasoning: keyword: text, keyword: girlfriend, keyword: birthday, pattern: conversational request
**Output:** "Hey ChatGPT, I want to text my girlfriend a birthday message."

### Image Generation Example
**Input:** "create a sunset image"
**Analysis:**
- Category: image_generation (confidence: 90%)
- Quality Score: 30/100
- Refinement Need: HIGH
- Has Shared Images: NO
- Reasoning: keyword: create, keyword: image, pattern: image creation
**Output:** "A photorealistic wide-angle shot of a vibrant sunset over rolling hills, with warm golden and orange hues illuminating the sky, captured with a 24mm lens, emphasizing the dramatic cloud formations and natural lighting, 16:9 aspect ratio."

### Image Editing Example
**Input:** "edit this photo to add a sunset background"
**Analysis:**
- Category: image_generation (confidence: 95%)
- Quality Score: 45/100
- Refinement Need: HIGH
- Has Shared Images: YES
- Reasoning: keyword: edit, keyword: photo, pattern: image editing, has shared images
**Output:** "Using the provided image, please add a vibrant sunset background to the scene. Ensure the change integrates seamlessly with the original lighting and composition, creating a warm, golden atmosphere that complements the existing elements while maintaining the original style and perspective."

### Platform-Specific Examples

#### ChatGPT (DALL-E)
**Input:** "create a logo for my startup"
**Platform:** ChatGPT
**Output:** "Professional startup logo design, minimalist style, modern typography, clean geometric shapes, high quality, detailed, no text, no watermark"

#### Gemini/AI Studio
**Input:** "create a logo for my startup"
**Platform:** Gemini
**Output:** "Create a modern, minimalist logo for a startup company with clean typography and geometric design elements. The design should be professional and memorable, with a contemporary color scheme suitable for digital and print applications, featuring sharp focus on brand identity and scalability."

#### DALL-E Example
**Input:** "anime character with blue hair"
**Platform:** ChatGPT (DALL-E)
**Output:** "Anime character with blue hair and green eyes, kawaii style, soft lighting, centered composition, detailed character design, high quality, no text, no watermark"

### AI Prompting Example
**Input:** "write code for fibonacci"
**Analysis:**
- Category: ai_prompting (confidence: 95%)
- Quality Score: 40/100
- Refinement Need: MEDIUM
- Reasoning: keyword: code, keyword: write, pattern: coding request
- Similar Prompts: Found 2 similar programming prompts in database
**Output:** "Act as a senior software engineer. Write a Python function that calculates Fibonacci numbers efficiently, considering I'm working on a performance-critical application. Present the code with proper error handling, documentation, and include both iterative and recursive approaches with time complexity analysis."

### Low-Quality Prompt Example
**Input:** "thing stuff whatever"
**Analysis:**
- Category: ai_prompting (confidence: 60%)
- Quality Score: 5/100
- Refinement Need: HIGH
- Reasoning: Vague language, no specific request, very short
**Output:** "I need help with something specific. Could you please provide more details about what you'd like me to help you with? Please be more specific about your request so I can assist you better."

## Testing

### Manual Testing
1. Load the extension in your browser
2. Open browser console on any supported AI platform
3. Run `testTriageAnalysis()` to test the triage system
4. Run `testRefinementWorkflow()` to test the complete workflow (requires API key)

### Test Cases
The system includes comprehensive test cases covering:
- Simple conversational requests
- Image generation prompts
- Coding requests
- Research tasks
- Grammar correction
- Mixed intent scenarios

## Configuration

### Adding New Categories
To add new refinement categories, update the `triageConfig` in `api-handler.js`:

```javascript
'new_category': {
    name: 'New Category Name',
    weight: 0,
    keywords: ['keyword1', 'keyword2'],
    patterns: [/regex pattern/i]
}
```

### Adjusting Confidence Thresholds
Modify the confidence thresholds in the `refinePrompt` method:
- Grammar correction: >70% confidence
- Image generation: >60% confidence
- AI prompting: Default fallback

### Customizing Patterns
Add new regex patterns to improve detection accuracy for specific use cases.

## Performance

The triage system is designed for:
- **Fast analysis**: Local processing without API calls
- **High accuracy**: Multi-layered detection with weighted scoring
- **Low latency**: Immediate categorization and routing
- **Scalability**: Easy to extend with new categories and patterns

## Integration

The triage system integrates seamlessly with:
- All supported AI platforms (ChatGPT, Claude, Gemini, Perplexity)
- Existing prompt refinement workflows
- Extension popup and settings
- Content script injection system

## New Features

### Prompt Quality Assessment
The system now evaluates prompt quality across multiple dimensions:
- **Length Analysis**: Short prompts (<20 chars) get -30 points, longer prompts get +10
- **Structure Indicators**: Questions (+5), periods (+3), commas (+2), colons (+3)
- **Clarity Words**: "please", "can you", "help me" (+2 each)
- **Specificity**: "specific", "detailed", "example" (+3 each)
- **Context**: "as a", "act as", "pretend" (+4 each)
- **Format**: "format", "structure", "list" (+3 each)
- **Grammar Issues**: "wanna", "gonna", "dont" (-2 each)
- **Vague Language**: "thing", "stuff", "whatever" (-2 each)

### Similarity Matching
The system now leverages the prompts.json database to:
- Find similar successful prompts using Jaccard similarity
- Provide context from related prompts during refinement
- Learn from 256+ categorized prompts across 13 categories
- Match keywords and patterns for better enhancement

### Refinement Need Detection
Intelligent assessment of whether refinement is actually needed:
- **HIGH** (score < 20): Significant improvement required
- **MEDIUM** (score 20-40): Moderate enhancement beneficial
- **LOW** (score > 40): Minimal changes needed

### Light Enhancement Mode
For high-quality prompts, the system now:
- Makes minimal changes to preserve original intent
- Only fixes minor issues without over-engineering
- Uses similar prompts as reference for subtle improvements
- Maintains the user's original tone and style

### Advanced Image Generation Features
The system now includes sophisticated image generation capabilities:

**Official Gemini Templates:**
- Photorealistic scenes with camera specifications
- Stylized illustrations and stickers with transparent backgrounds
- Text in images with font and design specifications
- Product mockups and commercial photography
- Minimalist and negative space designs
- Sequential art and comic panels

**Image Editing Support:**
- Adding/removing elements from existing images
- Inpainting and semantic masking
- Style transfer between different artistic styles
- Advanced composition combining multiple images
- High-fidelity detail preservation

**Smart Image Detection:**
- Detects when users reference shared/uploaded images
- Automatically includes "provided image" context in prompts
- Handles image editing scenarios appropriately
- Preserves references to user's photos and images

**Platform-Specific Optimization:**
- **ChatGPT**: Uses DALL-E prompting techniques
  - Natural, descriptive language (not technical parameters)
  - Quality boosters: "high quality", "detailed", "professional"
  - Negative prompts: "no text", "no watermark"
  - Artistic style references and lighting descriptions
  - Photography terminology and composition details
- **Gemini/AI Studio**: Uses official Gemini image generation templates
  - Photorealistic scenes with camera specifications
  - Stylized illustrations and stickers
  - Product mockups and commercial photography
  - Sequential art and comic panels

## Future Enhancements

Potential improvements include:
- Machine learning-based categorization
- User preference learning
- Context-aware refinement history
- Multi-language support
- Custom category definitions
- Advanced pattern matching with NLP
- Dynamic prompt database updates
- User feedback integration for continuous improvement
