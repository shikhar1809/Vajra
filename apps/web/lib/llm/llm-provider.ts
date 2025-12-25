/**
 * Vajra - Free LLM Provider
 * 
 * Supports multiple free LLM providers:
 * - Google Gemini (free tier)
 * - Groq (free tier - very fast)
 * - Ollama (local, no API needed)
 * - HuggingFace Inference (free tier)
 */

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMResponse {
    content: string;
    provider: string;
    model: string;
    tokensUsed?: number;
    latencyMs: number;
}

export interface LLMConfig {
    provider: 'gemini' | 'groq' | 'ollama' | 'huggingface';
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    maxTokens?: number;
    temperature?: number;
}

// Default models for each provider
const DEFAULT_MODELS: Record<string, string> = {
    gemini: 'gemini-1.5-flash',
    groq: 'llama-3.1-70b-versatile',
    ollama: 'llama3.2',
    huggingface: 'mistralai/Mistral-7B-Instruct-v0.2',
};

/**
 * Google Gemini Provider (Free tier: 15 RPM, 1M tokens/day)
 */
class GeminiProvider {
    private apiKey: string;
    private model: string;

    constructor(apiKey: string, model: string = DEFAULT_MODELS.gemini) {
        this.apiKey = apiKey;
        this.model = model;
    }

    async generate(messages: LLMMessage[]): Promise<LLMResponse> {
        const startTime = Date.now();

        // Convert messages to Gemini format
        const contents = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
            }));

        // Add system message as first user message if present
        const systemMessage = messages.find(m => m.role === 'system');
        if (systemMessage) {
            contents.unshift({
                role: 'user',
                parts: [{ text: `System Instructions: ${systemMessage.content}` }],
            });
            contents.splice(1, 0, {
                role: 'model',
                parts: [{ text: 'Understood. I will follow these instructions.' }],
            });
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 4096,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API error: ${error}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return {
            content,
            provider: 'gemini',
            model: this.model,
            tokensUsed: data.usageMetadata?.totalTokenCount,
            latencyMs: Date.now() - startTime,
        };
    }
}

/**
 * Groq Provider (Free tier: 30 RPM, very fast inference)
 */
class GroqProvider {
    private apiKey: string;
    private model: string;

    constructor(apiKey: string, model: string = DEFAULT_MODELS.groq) {
        this.apiKey = apiKey;
        this.model = model;
    }

    async generate(messages: LLMMessage[]): Promise<LLMResponse> {
        const startTime = Date.now();

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages,
                max_tokens: 4096,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Groq API error: ${error}`);
        }

        const data = await response.json();

        return {
            content: data.choices[0]?.message?.content || '',
            provider: 'groq',
            model: this.model,
            tokensUsed: data.usage?.total_tokens,
            latencyMs: Date.now() - startTime,
        };
    }
}

/**
 * Ollama Provider (Local - completely free, no API key needed)
 */
class OllamaProvider {
    private baseUrl: string;
    private model: string;

    constructor(baseUrl: string = 'http://localhost:11434', model: string = DEFAULT_MODELS.ollama) {
        this.baseUrl = baseUrl;
        this.model = model;
    }

    async generate(messages: LLMMessage[]): Promise<LLMResponse> {
        const startTime = Date.now();

        // Convert to Ollama format
        const prompt = messages.map(m => {
            if (m.role === 'system') return `System: ${m.content}`;
            if (m.role === 'user') return `User: ${m.content}`;
            return `Assistant: ${m.content}`;
        }).join('\n\n');

        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                prompt: prompt + '\n\nAssistant:',
                stream: false,
                options: {
                    temperature: 0.7,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Ollama error: ${error}`);
        }

        const data = await response.json();

        return {
            content: data.response || '',
            provider: 'ollama',
            model: this.model,
            tokensUsed: data.eval_count,
            latencyMs: Date.now() - startTime,
        };
    }

    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`, { method: 'GET' });
            return response.ok;
        } catch {
            return false;
        }
    }
}

/**
 * HuggingFace Inference Provider (Free tier: limited)
 */
class HuggingFaceProvider {
    private apiKey: string;
    private model: string;

    constructor(apiKey: string, model: string = DEFAULT_MODELS.huggingface) {
        this.apiKey = apiKey;
        this.model = model;
    }

    async generate(messages: LLMMessage[]): Promise<LLMResponse> {
        const startTime = Date.now();

        // Format for instruction-following models
        const prompt = messages.map(m => {
            if (m.role === 'system') return `[INST] ${m.content} [/INST]`;
            if (m.role === 'user') return `[INST] ${m.content} [/INST]`;
            return m.content;
        }).join('\n');

        const response = await fetch(
            `https://api-inference.huggingface.co/models/${this.model}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 2048,
                        temperature: 0.7,
                        return_full_text: false,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HuggingFace API error: ${error}`);
        }

        const data = await response.json();
        const content = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;

        return {
            content: content || '',
            provider: 'huggingface',
            model: this.model,
            latencyMs: Date.now() - startTime,
        };
    }
}

/**
 * Main LLM Service with fallback support
 */
export class LLMService {
    private providers: Array<{
        name: string;
        provider: GeminiProvider | GroqProvider | OllamaProvider | HuggingFaceProvider;
    }> = [];

    constructor() {
        this.initializeProviders();
    }

    private initializeProviders(): void {
        // Try to initialize providers based on available API keys
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
        const groqKey = process.env.GROQ_API_KEY;
        const hfKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;

        // Priority order: Groq (fastest) > Gemini > Ollama > HuggingFace
        if (groqKey) {
            this.providers.push({ name: 'groq', provider: new GroqProvider(groqKey) });
        }

        if (geminiKey) {
            this.providers.push({ name: 'gemini', provider: new GeminiProvider(geminiKey) });
        }

        // Always add Ollama as fallback (local)
        this.providers.push({ name: 'ollama', provider: new OllamaProvider() });

        if (hfKey) {
            this.providers.push({ name: 'huggingface', provider: new HuggingFaceProvider(hfKey) });
        }
    }

    /**
     * Generate response using available providers with fallback
     */
    async generate(messages: LLMMessage[]): Promise<LLMResponse> {
        const errors: string[] = [];

        for (const { name, provider } of this.providers) {
            try {
                // Check Ollama availability first
                if (provider instanceof OllamaProvider) {
                    const available = await provider.isAvailable();
                    if (!available) {
                        errors.push(`${name}: not running`);
                        continue;
                    }
                }

                return await provider.generate(messages);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`${name}: ${message}`);
                console.warn(`[LLM] ${name} failed:`, message);
            }
        }

        throw new Error(`All LLM providers failed: ${errors.join('; ')}`);
    }

    /**
     * Helper for security analysis
     */
    async analyzeForSecurity(prompt: string): Promise<string> {
        const response = await this.generate([
            {
                role: 'system',
                content: `You are a cybersecurity expert AI assistant. Analyze security threats, 
                  provide risk assessments, and give actionable recommendations.
                  Always respond in valid JSON format when asked for structured data.
                  Be concise but thorough.`,
            },
            { role: 'user', content: prompt },
        ]);

        return response.content;
    }

    /**
     * Parse JSON from LLM response
     */
    parseJSON<T>(response: string): T | null {
        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Try array
            const arrayMatch = response.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
                return JSON.parse(arrayMatch[0]) as T;
            }

            return null;
        } catch {
            return null;
        }
    }
}

// Export singleton
export const llm = new LLMService();

// Export provider classes for custom usage
export { GeminiProvider, GroqProvider, OllamaProvider, HuggingFaceProvider };
