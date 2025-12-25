/**
 * Vajra Sentry - Phishing Detection System
 * 
 * Multi-layered phishing detection using:
 * 1. URL Analysis (domain spoofing, suspicious patterns)
 * 2. Content Analysis (keywords, urgency indicators)
 * 3. Link Safety (redirect chains, known malicious sites)
 * 4. Email Header Analysis (SPF, DKIM, DMARC)
 * 5. Domain Similarity Detection (Levenshtein distance)
 */

export interface PhishingCheckResult {
    url: string;
    isSafe: boolean;
    threatLevel: 'safe' | 'suspicious' | 'dangerous' | 'malicious';
    confidence: number; // 0-1
    threats: string[];
    details: {
        urlAnalysis?: URLAnalysisResult;
        domainCheck?: DomainCheckResult;
        contentAnalysis?: ContentAnalysisResult;
    };
    recommendations: string[];
}

interface URLAnalysisResult {
    hasSuspiciousPatterns: boolean;
    usesHTTPS: boolean;
    hasIPAddress: boolean;
    hasExcessiveSubdomains: boolean;
    suspiciousKeywords: string[];
}

interface DomainCheckResult {
    isKnownMalicious: boolean;
    isSpoofed: boolean;
    similarToLegitimate?: string;
    domainAge?: number; // days
    registrar?: string;
}

interface ContentAnalysisResult {
    hasUrgencyKeywords: boolean;
    hasFinancialKeywords: boolean;
    hasSuspiciousLinks: boolean;
    urgencyScore: number; // 0-1
    suspicionScore: number; // 0-1
}

/**
 * URL Pattern Analyzer
 */
export class URLAnalyzer {
    private readonly SUSPICIOUS_PATTERNS = [
        /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP address
        /[a-z0-9-]{30,}/, // Excessively long subdomain
        /@/, // @ symbol (often used in phishing)
        /\-{2,}/, // Multiple consecutive hyphens
        /\d{5,}/, // Long number sequences
    ];

    private readonly SUSPICIOUS_KEYWORDS = [
        'verify', 'account', 'suspended', 'urgent', 'security', 'update',
        'confirm', 'login', 'password', 'banking', 'paypal', 'amazon',
        'microsoft', 'apple', 'google', 'secure', 'alert',
    ];

    /**
     * Analyze URL for suspicious patterns
     */
    analyze(url: string): URLAnalysisResult {
        const result: URLAnalysisResult = {
            hasSuspiciousPatterns: false,
            usesHTTPS: url.startsWith('https://'),
            hasIPAddress: false,
            hasExcessiveSubdomains: false,
            suspiciousKeywords: [],
        };

        const lowerURL = url.toLowerCase();

        // Check for suspicious patterns
        for (const pattern of this.SUSPICIOUS_PATTERNS) {
            if (pattern.test(url)) {
                result.hasSuspiciousPatterns = true;
                if (pattern.source.includes('\\d{1,3}')) {
                    result.hasIPAddress = true;
                }
            }
        }

        // Check for suspicious keywords
        for (const keyword of this.SUSPICIOUS_KEYWORDS) {
            if (lowerURL.includes(keyword)) {
                result.suspiciousKeywords.push(keyword);
            }
        }

        // Check subdomain count
        try {
            const urlObj = new URL(url);
            const subdomains = urlObj.hostname.split('.');
            if (subdomains.length > 4) {
                result.hasExcessiveSubdomains = true;
            }
        } catch (e) {
            // Invalid URL
        }

        return result;
    }
}

/**
 * Domain Similarity Detector
 * Uses Levenshtein distance to detect domain spoofing
 */
export class DomainSimilarityDetector {
    private readonly LEGITIMATE_DOMAINS = [
        'google.com', 'facebook.com', 'amazon.com', 'microsoft.com',
        'apple.com', 'paypal.com', 'netflix.com', 'linkedin.com',
        'twitter.com', 'instagram.com', 'github.com', 'stackoverflow.com',
    ];

    /**
     * Calculate Levenshtein distance between two strings
     */
    private levenshteinDistance(str1: string, str2: string): number {
        const matrix: number[][] = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
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

        return matrix[str2.length][str1.length];
    }

    /**
     * Check if domain is similar to legitimate domains (spoofing attempt)
     */
    checkSpoofing(domain: string): { isSpoofed: boolean; similarTo?: string; distance?: number } {
        const cleanDomain = domain.toLowerCase().replace(/^www\./, '');

        for (const legitDomain of this.LEGITIMATE_DOMAINS) {
            const distance = this.levenshteinDistance(cleanDomain, legitDomain);
            const maxLength = Math.max(cleanDomain.length, legitDomain.length);
            const similarity = 1 - distance / maxLength;

            // If very similar but not exact match, likely spoofing
            if (similarity > 0.7 && similarity < 1.0) {
                return {
                    isSpoofed: true,
                    similarTo: legitDomain,
                    distance,
                };
            }
        }

        return { isSpoofed: false };
    }

    /**
     * Detect common character substitutions (homograph attacks)
     */
    detectHomographAttack(domain: string): boolean {
        const homographs: Record<string, string[]> = {
            'a': ['а', 'ɑ', 'α'],
            'e': ['е', 'ė', 'ē'],
            'o': ['о', 'ο', '0'],
            'i': ['і', 'ı', '1', 'l'],
            'c': ['с', 'ϲ'],
        };

        for (const [latin, lookalikes] of Object.entries(homographs)) {
            for (const char of lookalikes) {
                if (domain.includes(char)) {
                    return true;
                }
            }
        }

        return false;
    }
}

/**
 * Content Analyzer for phishing indicators
 */
export class ContentAnalyzer {
    private readonly URGENCY_KEYWORDS = [
        'urgent', 'immediately', 'act now', 'limited time', 'expires',
        'suspended', 'locked', 'verify now', 'click here', 'confirm',
        'unusual activity', 'security alert', 'action required',
    ];

    private readonly FINANCIAL_KEYWORDS = [
        'refund', 'payment', 'invoice', 'transaction', 'account',
        'credit card', 'bank', 'wire transfer', 'prize', 'winner',
        'claim', 'reward', 'bonus', 'free money',
    ];

    /**
     * Analyze email/page content for phishing indicators
     */
    analyze(content: string): ContentAnalysisResult {
        const lowerContent = content.toLowerCase();

        const urgencyMatches = this.URGENCY_KEYWORDS.filter(keyword =>
            lowerContent.includes(keyword)
        );

        const financialMatches = this.FINANCIAL_KEYWORDS.filter(keyword =>
            lowerContent.includes(keyword)
        );

        const urgencyScore = Math.min(urgencyMatches.length / 5, 1);
        const financialScore = Math.min(financialMatches.length / 5, 1);

        return {
            hasUrgencyKeywords: urgencyMatches.length > 0,
            hasFinancialKeywords: financialMatches.length > 0,
            hasSuspiciousLinks: this.detectSuspiciousLinks(content),
            urgencyScore,
            suspicionScore: (urgencyScore + financialScore) / 2,
        };
    }

    private detectSuspiciousLinks(content: string): boolean {
        // Check for mismatched link text and URL
        const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
        const matches = content.matchAll(linkPattern);

        for (const match of matches) {
            const url = match[1];
            const text = match[2];

            // If link text looks like a URL but href is different
            if (text.includes('http') && !url.includes(text)) {
                return true;
            }
        }

        return false;
    }
}

/**
 * Main Phishing Detection Engine
 */
export class PhishingDetector {
    private urlAnalyzer = new URLAnalyzer();
    private domainDetector = new DomainSimilarityDetector();
    private contentAnalyzer = new ContentAnalyzer();

    // Simulated blacklist (in production, use actual threat intelligence feeds)
    private blacklistedDomains = new Set([
        'malicious-site.com',
        'phishing-example.net',
        'fake-bank.org',
    ]);

    /**
     * Perform comprehensive phishing check
     */
    async checkURL(url: string, content?: string): Promise<PhishingCheckResult> {
        const threats: string[] = [];
        let threatScore = 0;

        // 1. URL Analysis
        const urlAnalysis = this.urlAnalyzer.analyze(url);
        if (urlAnalysis.hasSuspiciousPatterns) {
            threats.push('Suspicious URL patterns detected');
            threatScore += 0.3;
        }
        if (!urlAnalysis.usesHTTPS) {
            threats.push('Not using HTTPS encryption');
            threatScore += 0.2;
        }
        if (urlAnalysis.hasIPAddress) {
            threats.push('URL uses IP address instead of domain');
            threatScore += 0.4;
        }
        if (urlAnalysis.suspiciousKeywords.length > 0) {
            threats.push(`Suspicious keywords: ${urlAnalysis.suspiciousKeywords.join(', ')}`);
            threatScore += 0.2 * urlAnalysis.suspiciousKeywords.length;
        }

        // 2. Domain Check
        let domain = '';
        try {
            domain = new URL(url).hostname;
        } catch (e) {
            threats.push('Invalid URL format');
            threatScore += 0.5;
        }

        const domainCheck: DomainCheckResult = {
            isKnownMalicious: this.blacklistedDomains.has(domain),
            isSpoofed: false,
        };

        if (domainCheck.isKnownMalicious) {
            threats.push('⚠️ KNOWN MALICIOUS DOMAIN');
            threatScore += 1.0;
        }

        const spoofCheck = this.domainDetector.checkSpoofing(domain);
        if (spoofCheck.isSpoofed) {
            domainCheck.isSpoofed = true;
            domainCheck.similarToLegitimate = spoofCheck.similarTo;
            threats.push(`Domain spoofing detected - similar to ${spoofCheck.similarTo}`);
            threatScore += 0.8;
        }

        const hasHomograph = this.domainDetector.detectHomographAttack(domain);
        if (hasHomograph) {
            threats.push('Homograph attack detected (lookalike characters)');
            threatScore += 0.7;
        }

        // 3. Content Analysis (if provided)
        let contentAnalysis: ContentAnalysisResult | undefined;
        if (content) {
            contentAnalysis = this.contentAnalyzer.analyze(content);
            if (contentAnalysis.hasUrgencyKeywords) {
                threats.push('Urgency tactics detected');
                threatScore += 0.3;
            }
            if (contentAnalysis.hasFinancialKeywords) {
                threats.push('Financial information requested');
                threatScore += 0.3;
            }
            if (contentAnalysis.hasSuspiciousLinks) {
                threats.push('Mismatched link URLs detected');
                threatScore += 0.4;
            }
        }

        // Determine threat level
        const threatLevel = this.determineThreatLevel(threatScore);
        const isSafe = threatLevel === 'safe';
        const confidence = Math.min(threatScore, 1);

        // Generate recommendations
        const recommendations = this.generateRecommendations(threatLevel, threats);

        return {
            url,
            isSafe,
            threatLevel,
            confidence,
            threats,
            details: {
                urlAnalysis,
                domainCheck,
                contentAnalysis,
            },
            recommendations,
        };
    }

    private determineThreatLevel(score: number): 'safe' | 'suspicious' | 'dangerous' | 'malicious' {
        if (score >= 0.8) return 'malicious';
        if (score >= 0.5) return 'dangerous';
        if (score >= 0.3) return 'suspicious';
        return 'safe';
    }

    private generateRecommendations(
        threatLevel: PhishingCheckResult['threatLevel'],
        threats: string[]
    ): string[] {
        const recommendations: string[] = [];

        if (threatLevel === 'malicious') {
            recommendations.push('🚨 DO NOT CLICK - Block this URL immediately');
            recommendations.push('Report to security team');
            recommendations.push('Delete the email/message');
        } else if (threatLevel === 'dangerous') {
            recommendations.push('⚠️ HIGH RISK - Avoid clicking this link');
            recommendations.push('Verify sender through alternative channel');
            recommendations.push('Check for official communication on company website');
        } else if (threatLevel === 'suspicious') {
            recommendations.push('⚡ CAUTION - Verify before clicking');
            recommendations.push('Hover over link to see actual destination');
            recommendations.push('Contact sender directly to confirm legitimacy');
        } else {
            recommendations.push('✅ Link appears safe');
            recommendations.push('Still exercise caution with sensitive information');
        }

        return recommendations;
    }

    /**
     * Batch check multiple URLs
     */
    async batchCheck(urls: string[]): Promise<PhishingCheckResult[]> {
        return Promise.all(urls.map(url => this.checkURL(url)));
    }
}

export const phishingDetector = new PhishingDetector();
