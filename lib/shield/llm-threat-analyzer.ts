/**
 * Vajra Shield - LLM Threat Analyzer
 * 
 * Uses free LLM providers to analyze complex threats
 * that rule-based systems might miss
 */

import { llm, LLMService } from '../llm/llm-provider';
import { RequestContext } from './ml-bot-detector';

export interface ThreatAnalysis {
    isMalicious: boolean;
    attackType: string | null;
    confidence: number;
    explanation: string;
    recommendedAction: 'allow' | 'challenge' | 'block' | 'monitor';
    mitreAttackMapping: string[];
    indicators: ThreatIndicator[];
}

export interface ThreatIndicator {
    type: 'url' | 'payload' | 'header' | 'pattern' | 'behavior';
    value: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
}

export interface RequestPayload {
    body?: string;
    query?: Record<string, string>;
    cookies?: Record<string, string>;
}

/**
 * LLM-Powered Threat Analyzer
 */
export class LLMThreatAnalyzer {
    private llmService: LLMService;
    private analysisCache = new Map<string, { result: ThreatAnalysis; expiry: number }>();
    private readonly cacheTtlMs = 300000; // 5 minutes

    constructor(service?: LLMService) {
        this.llmService = service || llm;
    }

    /**
     * Analyze a request for security threats using LLM
     */
    async analyzeRequest(
        context: RequestContext,
        payload?: RequestPayload
    ): Promise<ThreatAnalysis> {
        // Create cache key
        const cacheKey = this.createCacheKey(context, payload);
        const cached = this.analysisCache.get(cacheKey);
        if (cached && cached.expiry > Date.now()) {
            return cached.result;
        }

        // Build analysis prompt
        const prompt = this.buildAnalysisPrompt(context, payload);

        try {
            const response = await this.llmService.analyzeForSecurity(prompt);
            const parsed = this.parseAnalysisResponse(response);

            // Cache result
            this.analysisCache.set(cacheKey, {
                result: parsed,
                expiry: Date.now() + this.cacheTtlMs,
            });

            return parsed;
        } catch (error) {
            console.error('[LLMThreatAnalyzer] Analysis failed:', error);

            // Return safe default on failure
            return {
                isMalicious: false,
                attackType: null,
                confidence: 0,
                explanation: 'LLM analysis unavailable',
                recommendedAction: 'monitor',
                mitreAttackMapping: [],
                indicators: [],
            };
        }
    }

    /**
     * Analyze a batch of URLs for phishing
     */
    async analyzeURLs(urls: string[]): Promise<Array<{
        url: string;
        isPhishing: boolean;
        confidence: number;
        reason: string;
    }>> {
        const prompt = `
Analyze these URLs for phishing indicators:
${urls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

For each URL, check for:
- Domain spoofing (similar to legitimate domains)
- Suspicious TLD or subdomain patterns
- URL obfuscation techniques
- Known phishing patterns

Return JSON array with format:
[
  {
    "url": "...",
    "isPhishing": true/false,
    "confidence": 0-1,
    "reason": "explanation"
  }
]
`;

        try {
            const response = await this.llmService.analyzeForSecurity(prompt);
            const parsed = this.llmService.parseJSON<Array<{
                url: string;
                isPhishing: boolean;
                confidence: number;
                reason: string;
            }>>(response);

            return parsed || urls.map(url => ({
                url,
                isPhishing: false,
                confidence: 0,
                reason: 'Analysis failed',
            }));
        } catch (error) {
            console.error('[LLMThreatAnalyzer] URL analysis failed:', error);
            return urls.map(url => ({
                url,
                isPhishing: false,
                confidence: 0,
                reason: 'Analysis unavailable',
            }));
        }
    }

    /**
     * Analyze code for vulnerabilities
     */
    async analyzeCode(code: string, language: string): Promise<{
        vulnerabilities: Array<{
            type: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            line?: number;
            description: string;
            fix?: string;
            cwe?: string;
        }>;
        securityScore: number;
        summary: string;
    }> {
        const prompt = `
Analyze this ${language} code for security vulnerabilities:

\`\`\`${language}
${code.substring(0, 8000)} // Truncate for token limits
\`\`\`

Check for:
- Injection vulnerabilities (SQL, XSS, Command)
- Authentication/Authorization issues
- Cryptographic weaknesses
- Sensitive data exposure
- OWASP Top 10 2024 issues

Return JSON with format:
{
  "vulnerabilities": [
    {
      "type": "SQL Injection",
      "severity": "critical",
      "line": 42,
      "description": "User input directly concatenated into SQL query",
      "fix": "Use parameterized queries",
      "cwe": "CWE-89"
    }
  ],
  "securityScore": 0-100,
  "summary": "Brief overall assessment"
}
`;

        try {
            const response = await this.llmService.analyzeForSecurity(prompt);
            const parsed = this.llmService.parseJSON<{
                vulnerabilities: Array<{
                    type: string;
                    severity: 'low' | 'medium' | 'high' | 'critical';
                    line?: number;
                    description: string;
                    fix?: string;
                    cwe?: string;
                }>;
                securityScore: number;
                summary: string;
            }>(response);

            return parsed || {
                vulnerabilities: [],
                securityScore: 50,
                summary: 'Analysis incomplete',
            };
        } catch (error) {
            console.error('[LLMThreatAnalyzer] Code analysis failed:', error);
            return {
                vulnerabilities: [],
                securityScore: 50,
                summary: 'Analysis unavailable',
            };
        }
    }

    /**
     * Generate phishing email for training
     */
    async generatePhishingEmail(config: {
        department: string;
        topic: string;
        difficulty: 'easy' | 'medium' | 'hard';
        senderName?: string;
    }): Promise<{
        subject: string;
        body: string;
        senderEmail: string;
        senderName: string;
        redFlags: string[];
        trainingPoints: string[];
    }> {
        const prompt = `
Generate a SIMULATED phishing email for security awareness training.
This is for EDUCATIONAL PURPOSES ONLY to train employees to recognize phishing.

Target department: ${config.department}
Topic: ${config.topic}
Difficulty: ${config.difficulty}
${config.senderName ? `Impersonate: ${config.senderName}` : ''}

Difficulty levels:
- easy: Obvious red flags (typos, suspicious links)
- medium: More subtle but detectable with training
- hard: Highly sophisticated, few obvious indicators

Include realistic but HARMLESS content. Mark [TRAIN] where users should be suspicious.

Return JSON:
{
  "subject": "Email subject line",
  "body": "HTML email body with realistic formatting",
  "senderEmail": "fake-sender@example.com",
  "senderName": "Display Name",
  "redFlags": ["List of red flags users should notice"],
  "trainingPoints": ["What to teach from this example"]
}
`;

        try {
            const response = await this.llmService.analyzeForSecurity(prompt);
            const parsed = this.llmService.parseJSON<{
                subject: string;
                body: string;
                senderEmail: string;
                senderName: string;
                redFlags: string[];
                trainingPoints: string[];
            }>(response);

            return parsed || {
                subject: 'Training Email',
                body: '<p>Example phishing email for training</p>',
                senderEmail: 'training@example.com',
                senderName: 'Training System',
                redFlags: ['Unable to generate'],
                trainingPoints: ['LLM unavailable'],
            };
        } catch (error) {
            console.error('[LLMThreatAnalyzer] Email generation failed:', error);
            throw error;
        }
    }

    private buildAnalysisPrompt(context: RequestContext, payload?: RequestPayload): string {
        return `
Analyze this HTTP request for security threats:

Request Details:
- Method: ${context.method}
- Path: ${context.path}
- User-Agent: ${context.userAgent || 'Not provided'}
- IP: ${context.ip}
- Headers: ${JSON.stringify(context.headers, null, 2)}
${payload?.body ? `- Body: ${payload.body.substring(0, 2000)}` : ''}
${payload?.query ? `- Query: ${JSON.stringify(payload.query)}` : ''}

Analyze for:
1. SQL Injection attempts
2. XSS (Cross-Site Scripting)
3. Path traversal
4. Command injection
5. SSRF attempts
6. Authentication bypass
7. Bot/scanner behavior
8. Reconnaissance activity

Return JSON with this exact format:
{
  "isMalicious": true/false,
  "attackType": "type of attack or null",
  "confidence": 0.0-1.0,
  "explanation": "Brief explanation",
  "recommendedAction": "allow/challenge/block/monitor",
  "mitreAttackMapping": ["T1190", "T1059"],
  "indicators": [
    {
      "type": "payload",
      "value": "suspicious value",
      "severity": "high",
      "description": "why this is suspicious"
    }
  ]
}
`;
    }

    private parseAnalysisResponse(response: string): ThreatAnalysis {
        const parsed = this.llmService.parseJSON<Partial<ThreatAnalysis>>(response);

        if (!parsed) {
            // Try to extract key information from text
            const isMalicious = /malicious|attack|threat|dangerous/i.test(response);

            return {
                isMalicious,
                attackType: null,
                confidence: isMalicious ? 0.5 : 0.2,
                explanation: response.substring(0, 200),
                recommendedAction: isMalicious ? 'monitor' : 'allow',
                mitreAttackMapping: [],
                indicators: [],
            };
        }

        return {
            isMalicious: parsed.isMalicious ?? false,
            attackType: parsed.attackType ?? null,
            confidence: parsed.confidence ?? 0,
            explanation: parsed.explanation ?? 'Unknown',
            recommendedAction: parsed.recommendedAction ?? 'allow',
            mitreAttackMapping: parsed.mitreAttackMapping ?? [],
            indicators: parsed.indicators ?? [],
        };
    }

    private createCacheKey(context: RequestContext, payload?: RequestPayload): string {
        const keyData = {
            method: context.method,
            path: context.path,
            ua: context.userAgent,
            body: payload?.body?.substring(0, 100),
        };
        return JSON.stringify(keyData);
    }
}

// Export singleton
export const threatAnalyzer = new LLMThreatAnalyzer();
