/**
 * Auto-Blocker
 * Automatically blocks IPs based on configurable thresholds
 */

interface AutoBlockConfig {
    enabled: boolean
    thresholds: {
        failedRequests: number // Block after N failed requests
        highBotScore: number // Block if bot score > N
        requestRate: number // Block if requests/minute > N
    }
    duration: number // Block duration in minutes
}

interface IPActivity {
    ip: string
    failedRequests: number
    totalRequests: number
    avgBotScore: number
    lastRequestAt: Date
}

/**
 * Check if IP should be auto-blocked
 */
export function shouldAutoBlock(
    activity: IPActivity,
    config: AutoBlockConfig
): { shouldBlock: boolean; reason?: string } {
    if (!config.enabled) {
        return { shouldBlock: false }
    }

    // Check failed requests threshold
    if (activity.failedRequests >= config.thresholds.failedRequests) {
        return {
            shouldBlock: true,
            reason: `Exceeded failed requests threshold (${activity.failedRequests}/${config.thresholds.failedRequests})`,
        }
    }

    // Check bot score threshold
    if (activity.avgBotScore >= config.thresholds.highBotScore) {
        return {
            shouldBlock: true,
            reason: `High bot score detected (${activity.avgBotScore}/${config.thresholds.highBotScore})`,
        }
    }

    // Check request rate
    const minutesSinceLastRequest = (Date.now() - activity.lastRequestAt.getTime()) / 60000
    const requestRate = minutesSinceLastRequest > 0 ? activity.totalRequests / minutesSinceLastRequest : 0

    if (requestRate >= config.thresholds.requestRate) {
        return {
            shouldBlock: true,
            reason: `High request rate detected (${Math.round(requestRate)}/${config.thresholds.requestRate} req/min)`,
        }
    }

    return { shouldBlock: false }
}

/**
 * Default auto-block configuration
 */
export const DEFAULT_AUTO_BLOCK_CONFIG: AutoBlockConfig = {
    enabled: true,
    thresholds: {
        failedRequests: 10,
        highBotScore: 85,
        requestRate: 100,
    },
    duration: 60, // 1 hour
}

/**
 * Calculate block expiry time
 */
export function calculateBlockExpiry(durationMinutes: number): Date {
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + durationMinutes)
    return expiry
}
