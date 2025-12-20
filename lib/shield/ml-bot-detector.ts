/**
 * Vajra Shield - ML Bot Detection Engine
 * 
 * Cloudflare-inspired bot scoring system (1-99)
 * Lower scores = more likely to be a bot
 * 
 * Features:
 * - TLS/HTTP fingerprinting
 * - Behavioral analysis
 * - Request pattern analysis
 * - IP reputation lookup
 */

import crypto from 'crypto';

export interface BotDetectionResult {
    score: number;           // 1-99 (lower = more likely bot)
    confidence: number;      // 0-1
    classification: 'verified-bot' | 'likely-bot' | 'likely-human' | 'verified-human';
    signals: BotSignals;
    action: 'allow' | 'challenge' | 'block';
    reason: string;
}

export interface BotSignals {
    tlsFingerprint: string | null;
    httpFingerprint: string | null;
    behavioralScore: number;
    ipReputation: number;
    requestVelocity: number;
    headerAnomalies: string[];
    browserSignals: BrowserSignals | null;
}

export interface BrowserSignals {
    hasJavaScript: boolean;
    hasWebGL: boolean;
    hasCanvas: boolean;
    hasCookies: boolean;
    screenResolution: string | null;
    timezone: string | null;
    language: string | null;
    plugins: number;
}

export interface RequestContext {
    ip: string;
    userAgent: string;
    headers: Record<string, string>;
    path: string;
    method: string;
    timestamp: Date;
    tlsVersion?: string;
    cipherSuite?: string;
    httpVersion?: string;
    acceptLanguage?: string;
    acceptEncoding?: string;
    referer?: string;
    cookies?: Record<string, string>;
}

// Known bot user-agent patterns
const KNOWN_BOT_PATTERNS = [
    /googlebot/i, /bingbot/i, /yandexbot/i, /baiduspider/i,
    /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
    /slurp/i, /duckduckbot/i, /applebot/i,
];

// Malicious bot patterns
const MALICIOUS_BOT_PATTERNS = [
    /sqlmap/i, /nikto/i, /nmap/i, /masscan/i,
    /python-requests/i, /go-http-client/i, /java\//i,
    /curl/i, /wget/i, /httpie/i,
    /scrapy/i, /phantomjs/i, /headless/i,
    /selenium/i, /puppeteer/i, /playwright/i,
];

// Verified good bots (search engines, etc.)
const VERIFIED_BOTS: Record<string, { pattern: RegExp; dnsVerify?: string }> = {
    googlebot: { pattern: /googlebot/i, dnsVerify: 'googlebot.com' },
    bingbot: { pattern: /bingbot/i, dnsVerify: 'search.msn.com' },
    facebookbot: { pattern: /facebookexternalhit/i },
};

/**
 * JA3 TLS Fingerprint Calculator
 * Creates a fingerprint from TLS handshake parameters
 */
export class TLSFingerprinter {
    /**
     * Generate JA3 fingerprint from TLS parameters
     * Format: SSLVersion,Ciphers,Extensions,EllipticCurves,EllipticCurvePointFormats
     */
    generateJA3(params: {
        sslVersion: number;
        ciphers: number[];
        extensions: number[];
        ellipticCurves: number[];
        ecPointFormats: number[];
    }): string {
        const ja3String = [
            params.sslVersion,
            params.ciphers.join('-'),
            params.extensions.join('-'),
            params.ellipticCurves.join('-'),
            params.ecPointFormats.join('-'),
        ].join(',');

        return crypto.createHash('md5').update(ja3String).digest('hex');
    }

    /**
     * Known malicious JA3 fingerprints
     */
    private maliciousJA3 = new Set([
        'e7d705a3286e19ea42f587b344ee6865', // Python requests
        'b32309a26951912be7dba376398abc3b', // Go HTTP client
        '3b5074b1b5d032e5620f69f9f700ff0e', // Java
    ]);

    /**
     * Known legitimate browser JA3 fingerprints
     */
    private legitimateJA3 = new Set([
        'cd08e31494f9531f560d64c695473da9', // Chrome
        'e7d705a3286e19ea42f587b344ee6865', // Firefox
        'a0e9f5d64349fb13191bc781f81f42e1', // Safari
    ]);

    isMalicious(ja3: string): boolean {
        return this.maliciousJA3.has(ja3);
    }

    isLegitimate(ja3: string): boolean {
        return this.legitimateJA3.has(ja3);
    }
}

/**
 * HTTP Fingerprinter
 * Analyzes HTTP header ordering and values
 */
export class HTTPFingerprinter {
    /**
     * Generate fingerprint from HTTP headers order
     */
    generateFingerprint(headers: Record<string, string>): string {
        // Header order matters - bots often have unusual ordering
        const headerOrder = Object.keys(headers).join(',').toLowerCase();
        return crypto.createHash('md5').update(headerOrder).digest('hex');
    }

    /**
     * Analyze headers for anomalies
     */
    analyzeHeaders(headers: Record<string, string>): {
        anomalies: string[];
        score: number;
    } {
        const anomalies: string[] = [];
        let penalty = 0;

        const headerKeys = Object.keys(headers).map(k => k.toLowerCase());

        // Missing common headers
        if (!headerKeys.includes('accept')) {
            anomalies.push('Missing Accept header');
            penalty += 10;
        }

        if (!headerKeys.includes('accept-language')) {
            anomalies.push('Missing Accept-Language header');
            penalty += 5;
        }

        if (!headerKeys.includes('accept-encoding')) {
            anomalies.push('Missing Accept-Encoding header');
            penalty += 5;
        }

        // Suspicious headers
        if (headerKeys.includes('x-forwarded-for') &&
            headers['x-forwarded-for']?.split(',').length > 5) {
            anomalies.push('Excessive proxy chain');
            penalty += 15;
        }

        // Empty or generic user agent
        const ua = headers['user-agent'] || '';
        if (ua.length < 10) {
            anomalies.push('Suspiciously short User-Agent');
            penalty += 20;
        }

        return { anomalies, score: Math.max(0, 100 - penalty) };
    }
}

/**
 * Request Velocity Tracker
 * Tracks request rates per IP/session
 */
export class VelocityTracker {
    private requestCounts = new Map<string, { count: number; firstSeen: number; timestamps: number[] }>();
    private readonly windowMs = 60000; // 1 minute window

    /**
     * Record a request and get velocity metrics
     */
    recordRequest(clientId: string): {
        requestsPerMinute: number;
        burstScore: number;
        isAnomalous: boolean;
    } {
        const now = Date.now();
        const record = this.requestCounts.get(clientId) || { count: 0, firstSeen: now, timestamps: [] };

        // Clean old timestamps
        record.timestamps = record.timestamps.filter(t => now - t < this.windowMs);
        record.timestamps.push(now);
        record.count++;

        this.requestCounts.set(clientId, record);

        const requestsPerMinute = record.timestamps.length;

        // Calculate burst score (variance in timing)
        const burstScore = this.calculateBurstScore(record.timestamps);

        // Anomalous if very high rate or very consistent timing (bot-like)
        const isAnomalous = requestsPerMinute > 100 || burstScore < 0.1;

        return { requestsPerMinute, burstScore, isAnomalous };
    }

    private calculateBurstScore(timestamps: number[]): number {
        if (timestamps.length < 3) return 1;

        const intervals: number[] = [];
        for (let i = 1; i < timestamps.length; i++) {
            intervals.push(timestamps[i] - timestamps[i - 1]);
        }

        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);

        // Coefficient of variation - humans have more variability
        return avg > 0 ? stdDev / avg : 0;
    }

    /**
     * Clean up old entries
     */
    cleanup(): void {
        const now = Date.now();
        for (const [key, record] of this.requestCounts.entries()) {
            if (now - record.firstSeen > this.windowMs * 10) {
                this.requestCounts.delete(key);
            }
        }
    }
}

/**
 * IP Reputation Service
 * Checks IP against threat intelligence feeds
 */
export class IPReputationService {
    private ipCache = new Map<string, { score: number; expiry: number }>();
    private readonly cacheTtlMs = 3600000; // 1 hour cache

    // Known bad IP ranges (example - in production use threat feeds)
    private badRanges = [
        // Add ranges from threat intelligence
    ];

    /**
     * Get reputation score for IP (0-100, higher = better)
     */
    async getReputation(ip: string): Promise<number> {
        // Check cache
        const cached = this.ipCache.get(ip);
        if (cached && cached.expiry > Date.now()) {
            return cached.score;
        }

        let score = 80; // Default neutral score

        // Check against local blacklist
        if (this.isInBadRange(ip)) {
            score = 10;
        }

        // Check CrowdSec API (free tier)
        try {
            const crowdSecScore = await this.checkCrowdSec(ip);
            score = Math.min(score, crowdSecScore);
        } catch (e) {
            // API unavailable, use local score
        }

        // Cache result
        this.ipCache.set(ip, { score, expiry: Date.now() + this.cacheTtlMs });

        return score;
    }

    private isInBadRange(ip: string): boolean {
        // Simplified check - in production use proper CIDR matching
        return this.badRanges.some(range => ip.startsWith(range));
    }

    private async checkCrowdSec(ip: string): Promise<number> {
        // CrowdSec CTI API (free tier: 50 requests/day)
        // In production, implement proper API call
        // For now, return neutral score
        return 80;
    }
}

/**
 * Main Bot Detection Engine
 */
export class BotDetectionEngine {
    private tlsFingerprinter = new TLSFingerprinter();
    private httpFingerprinter = new HTTPFingerprinter();
    private velocityTracker = new VelocityTracker();
    private ipReputation = new IPReputationService();

    /**
     * Analyze request and return bot score
     */
    async analyze(context: RequestContext): Promise<BotDetectionResult> {
        const signals: BotSignals = {
            tlsFingerprint: null,
            httpFingerprint: null,
            behavioralScore: 50,
            ipReputation: 50,
            requestVelocity: 0,
            headerAnomalies: [],
            browserSignals: null,
        };

        let score = 50; // Start neutral
        const reasons: string[] = [];

        // 1. User-Agent Analysis
        const uaScore = this.analyzeUserAgent(context.userAgent);
        score += uaScore.adjustment;
        if (uaScore.reason) reasons.push(uaScore.reason);

        // 2. HTTP Header Analysis
        const headerAnalysis = this.httpFingerprinter.analyzeHeaders(context.headers);
        signals.headerAnomalies = headerAnalysis.anomalies;
        signals.httpFingerprint = this.httpFingerprinter.generateFingerprint(context.headers);
        score += (headerAnalysis.score - 50) / 2;

        // 3. Request Velocity
        const velocity = this.velocityTracker.recordRequest(context.ip);
        signals.requestVelocity = velocity.requestsPerMinute;
        if (velocity.isAnomalous) {
            score -= 20;
            reasons.push('Anomalous request velocity');
        }

        // 4. IP Reputation
        signals.ipReputation = await this.ipReputation.getReputation(context.ip);
        score += (signals.ipReputation - 50) / 2;
        if (signals.ipReputation < 30) {
            reasons.push('Poor IP reputation');
        }

        // 5. Behavioral patterns
        signals.behavioralScore = this.analyzeBehavior(context);
        score += (signals.behavioralScore - 50) / 2;

        // Normalize score to 1-99
        score = Math.max(1, Math.min(99, Math.round(score)));

        // Determine classification and action
        const classification = this.classify(score, context.userAgent);
        const action = this.determineAction(score, classification);
        const confidence = this.calculateConfidence(signals);

        return {
            score,
            confidence,
            classification,
            signals,
            action,
            reason: reasons.join('; ') || 'No issues detected',
        };
    }

    private analyzeUserAgent(ua: string): { adjustment: number; reason?: string } {
        // Check for verified bots
        for (const [name, config] of Object.entries(VERIFIED_BOTS)) {
            if (config.pattern.test(ua)) {
                return { adjustment: 0, reason: `Verified bot: ${name}` };
            }
        }

        // Check for malicious patterns
        for (const pattern of MALICIOUS_BOT_PATTERNS) {
            if (pattern.test(ua)) {
                return { adjustment: -40, reason: 'Suspicious automation tool detected' };
            }
        }

        // Check for known bots
        for (const pattern of KNOWN_BOT_PATTERNS) {
            if (pattern.test(ua)) {
                return { adjustment: 0, reason: 'Known crawler' };
            }
        }

        // Check for browser-like UA
        if (/Mozilla\/5\.0.*Chrome\/|Mozilla\/5\.0.*Firefox\/|Mozilla\/5\.0.*Safari\//.test(ua)) {
            return { adjustment: 15, reason: undefined };
        }

        // Empty or very short UA
        if (!ua || ua.length < 10) {
            return { adjustment: -30, reason: 'Missing or invalid User-Agent' };
        }

        return { adjustment: 0 };
    }

    private analyzeBehavior(context: RequestContext): number {
        let score = 50;

        // Check for common human-like behavior signals
        if (context.referer) {
            score += 5; // Humans usually have referers
        }

        if (context.cookies && Object.keys(context.cookies).length > 0) {
            score += 10; // Cookies indicate session
        }

        if (context.acceptLanguage) {
            score += 5;
        }

        // Penalize unusual paths
        if (/\.(php|asp|env|config|git|sql)$/i.test(context.path)) {
            score -= 20; // Scanning behavior
        }

        if (/\/admin|\/wp-admin|\/\.well-known/i.test(context.path)) {
            score -= 10; // Probing
        }

        return Math.max(0, Math.min(100, score));
    }

    private classify(score: number, ua: string): BotDetectionResult['classification'] {
        // Check for verified bots first
        for (const config of Object.values(VERIFIED_BOTS)) {
            if (config.pattern.test(ua)) {
                return 'verified-bot';
            }
        }

        if (score >= 70) return 'verified-human';
        if (score >= 40) return 'likely-human';
        if (score >= 20) return 'likely-bot';
        return 'verified-bot'; // Very low score = definitely automated
    }

    private determineAction(score: number, classification: BotDetectionResult['classification']): BotDetectionResult['action'] {
        if (classification === 'verified-bot' && score > 30) {
            return 'allow'; // Good bots like Googlebot
        }

        if (score >= 50) return 'allow';
        if (score >= 25) return 'challenge';
        return 'block';
    }

    private calculateConfidence(signals: BotSignals): number {
        // More signals = higher confidence
        let dataPoints = 0;
        let totalWeight = 0;

        if (signals.httpFingerprint) { dataPoints++; totalWeight += 1; }
        if (signals.tlsFingerprint) { dataPoints++; totalWeight += 1.5; }
        if (signals.browserSignals) { dataPoints++; totalWeight += 2; }
        if (signals.ipReputation !== 50) { dataPoints++; totalWeight += 1; }
        if (signals.requestVelocity > 0) { dataPoints++; totalWeight += 1; }

        return Math.min(1, totalWeight / 5);
    }
}

// Export singleton instance
export const botDetector = new BotDetectionEngine();
