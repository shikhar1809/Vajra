import crypto from 'crypto'

/**
 * Bot Detection Logic
 * Analyzes requests to determine if they're from bots or humans
 */

interface BotScore {
    score: number // 0-100 (0 = definitely human, 100 = definitely bot)
    classification: 'bot' | 'human' | 'suspicious'
    reasons: string[]
    fingerprint: string
}

interface RequestData {
    userAgent: string
    ip: string
    headers: Record<string, string>
    path: string
    method: string
}

/**
 * Known bot patterns
 */
const KNOWN_BOTS = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http-client/i,
    /axios/i,
    /node-fetch/i,
]

const HEADLESS_BROWSERS = [
    /headless/i,
    /phantom/i,
    /selenium/i,
    /puppeteer/i,
    /playwright/i,
]

/**
 * Generate browser fingerprint
 */
export function generateFingerprint(data: RequestData): string {
    const components = [
        data.userAgent,
        data.headers['accept-language'] || '',
        data.headers['accept-encoding'] || '',
        data.headers['accept'] || '',
    ].filter(Boolean)

    return crypto
        .createHash('sha256')
        .update(components.join('|'))
        .digest('hex')
        .substring(0, 32)
}

/**
 * Check if user agent matches known bot patterns
 */
function checkKnownBots(userAgent: string): { isBot: boolean; botType?: string } {
    for (const pattern of KNOWN_BOTS) {
        if (pattern.test(userAgent)) {
            return { isBot: true, botType: pattern.source }
        }
    }

    for (const pattern of HEADLESS_BROWSERS) {
        if (pattern.test(userAgent)) {
            return { isBot: true, botType: 'headless-browser' }
        }
    }

    return { isBot: false }
}

/**
 * Analyze request headers for bot indicators
 */
function analyzeHeaders(headers: Record<string, string>): {
    score: number
    reasons: string[]
} {
    const reasons: string[] = []
    let score = 0

    // Missing common browser headers
    if (!headers['accept-language']) {
        score += 20
        reasons.push('missing-accept-language')
    }

    if (!headers['accept-encoding']) {
        score += 15
        reasons.push('missing-accept-encoding')
    }

    // Suspicious user agent
    const ua = headers['user-agent'] || ''
    if (!ua) {
        score += 30
        reasons.push('no-user-agent')
    } else if (ua.length < 20) {
        score += 25
        reasons.push('short-user-agent')
    }

    // Check for automation tools
    if (headers['x-requested-with'] === 'XMLHttpRequest' && !headers['referer']) {
        score += 10
        reasons.push('suspicious-ajax')
    }

    // Datacenter IP indicators (simplified)
    const via = headers['via'] || ''
    if (via.includes('proxy') || via.includes('cache')) {
        score += 15
        reasons.push('proxy-detected')
    }

    return { score, reasons }
}

/**
 * Analyze behavioral patterns
 */
function analyzeBehavior(data: RequestData): {
    score: number
    reasons: string[]
} {
    const reasons: string[] = []
    let score = 0

    // Check for common bot paths
    const botPaths = ['/wp-admin', '/xmlrpc.php', '/.env', '/admin', '/phpmyadmin']
    if (botPaths.some(path => data.path.includes(path))) {
        score += 40
        reasons.push('scanning-common-paths')
    }

    // Suspicious HTTP methods
    if (['TRACE', 'TRACK', 'OPTIONS'].includes(data.method.toUpperCase())) {
        score += 20
        reasons.push('suspicious-http-method')
    }

    return { score, reasons }
}

/**
 * Main bot detection function
 */
export async function detectBot(data: RequestData): Promise<BotScore> {
    const reasons: string[] = []
    let totalScore = 0

    // 1. Check known bots (high confidence)
    const knownBot = checkKnownBots(data.userAgent)
    if (knownBot.isBot) {
        totalScore += 80
        reasons.push(`known-bot: ${knownBot.botType}`)
    }

    // 2. Analyze headers
    const headerAnalysis = analyzeHeaders(data.headers)
    totalScore += headerAnalysis.score
    reasons.push(...headerAnalysis.reasons)

    // 3. Analyze behavior
    const behaviorAnalysis = analyzeBehavior(data)
    totalScore += behaviorAnalysis.score
    reasons.push(...behaviorAnalysis.reasons)

    // Cap at 100
    const finalScore = Math.min(totalScore, 100)

    // Classify
    let classification: 'bot' | 'human' | 'suspicious'
    if (finalScore >= 80) {
        classification = 'bot'
    } else if (finalScore >= 50) {
        classification = 'suspicious'
    } else {
        classification = 'human'
    }

    return {
        score: finalScore,
        classification,
        reasons,
        fingerprint: generateFingerprint(data),
    }
}

/**
 * Check if request should be blocked based on bot score
 */
export function shouldBlockRequest(botScore: number, threshold: number = 80): boolean {
    return botScore >= threshold
}
