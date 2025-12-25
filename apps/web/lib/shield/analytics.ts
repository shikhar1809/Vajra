import { getSupabaseClient } from '@/lib/supabase/client'

/**
 * Traffic Analytics Calculator
 * Aggregates and analyzes traffic data for dashboards
 */

interface TrafficAnalytics {
    totalRequests: number
    blockedRequests: number
    botRequests: number
    humanRequests: number
    uniqueIPs: number
    topCountries: Array<{ country: string; count: number }>
    topPaths: Array<{ path: string; count: number }>
    topBlockedIPs: Array<{ ip: string; count: number; reason: string }>
    trafficOverTime: Array<{ timestamp: string; total: number; blocked: number; bots: number }>
    averageBotScore: number
}

/**
 * Calculate analytics for a workspace
 */
export async function calculateAnalytics(
    workspaceId: string,
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
): Promise<TrafficAnalytics> {
    const supabase = getSupabaseClient()

    // Calculate time window
    const now = new Date()
    const startTime = getStartTime(now, timeRange)

    // Fetch traffic logs
    const { data: logs, error } = await supabase
        .from('traffic_logs')
        .select('*')
        .eq('workspace_id', workspaceId)
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: false })

    if (error || !logs) {
        console.error('Error fetching traffic logs:', error)
        return getEmptyAnalytics()
    }

    // Calculate metrics
    const totalRequests = logs.length
    const blockedRequests = logs.filter((l) => l.is_blocked).length
    const botRequests = logs.filter((l) => l.bot_score > 80).length
    const humanRequests = logs.filter((l) => l.bot_score <= 50).length

    // Unique IPs
    const uniqueIPs = new Set(logs.map((l) => l.ip_address)).size

    // Top countries
    const countryMap = new Map<string, number>()
    logs.forEach((log) => {
        const country = log.country || 'unknown'
        countryMap.set(country, (countryMap.get(country) || 0) + 1)
    })
    const topCountries = Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

    // Top paths
    const pathMap = new Map<string, number>()
    logs.forEach((log) => {
        const path = log.request_path || '/'
        pathMap.set(path, (pathMap.get(path) || 0) + 1)
    })
    const topPaths = Array.from(pathMap.entries())
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

    // Top blocked IPs
    const blockedLogs = logs.filter((l) => l.is_blocked)
    const blockedIPMap = new Map<string, { count: number; reason: string }>()
    blockedLogs.forEach((log) => {
        const ip = log.ip_address
        const existing = blockedIPMap.get(ip)
        if (existing) {
            existing.count++
        } else {
            blockedIPMap.set(ip, { count: 1, reason: log.block_reason || 'unknown' })
        }
    })
    const topBlockedIPs = Array.from(blockedIPMap.entries())
        .map(([ip, data]) => ({ ip, count: data.count, reason: data.reason }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

    // Traffic over time
    const trafficOverTime = aggregateByTime(logs, timeRange)

    // Average bot score
    const totalBotScore = logs.reduce((sum, log) => sum + (log.bot_score || 0), 0)
    const averageBotScore = logs.length > 0 ? Math.round(totalBotScore / logs.length) : 0

    return {
        totalRequests,
        blockedRequests,
        botRequests,
        humanRequests,
        uniqueIPs,
        topCountries,
        topPaths,
        topBlockedIPs,
        trafficOverTime,
        averageBotScore,
    }
}

/**
 * Aggregate traffic by time intervals
 */
function aggregateByTime(
    logs: any[],
    timeRange: string
): Array<{ timestamp: string; total: number; blocked: number; bots: number }> {
    // Determine interval based on time range
    let intervalMinutes: number
    switch (timeRange) {
        case '1h':
            intervalMinutes = 5 // 5-minute intervals
            break
        case '24h':
            intervalMinutes = 60 // 1-hour intervals
            break
        case '7d':
            intervalMinutes = 360 // 6-hour intervals
            break
        case '30d':
            intervalMinutes = 1440 // 1-day intervals
            break
        default:
            intervalMinutes = 60
    }

    const buckets = new Map<string, { total: number; blocked: number; bots: number }>()

    logs.forEach((log) => {
        const timestamp = new Date(log.timestamp)
        const bucketKey = getBucketKey(timestamp, intervalMinutes)

        const existing = buckets.get(bucketKey) || { total: 0, blocked: 0, bots: 0 }
        existing.total++
        if (log.is_blocked) existing.blocked++
        if (log.bot_score > 80) existing.bots++

        buckets.set(bucketKey, existing)
    })

    return Array.from(buckets.entries())
        .map(([timestamp, data]) => ({ timestamp, ...data }))
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

/**
 * Get bucket key for time aggregation
 */
function getBucketKey(date: Date, intervalMinutes: number): string {
    const minutes = date.getMinutes()
    const roundedMinutes = Math.floor(minutes / intervalMinutes) * intervalMinutes
    const bucketDate = new Date(date)
    bucketDate.setMinutes(roundedMinutes, 0, 0)
    return bucketDate.toISOString()
}

/**
 * Get start time based on time range
 */
function getStartTime(now: Date, timeRange: string): Date {
    const start = new Date(now)

    switch (timeRange) {
        case '1h':
            start.setHours(start.getHours() - 1)
            break
        case '24h':
            start.setHours(start.getHours() - 24)
            break
        case '7d':
            start.setDate(start.getDate() - 7)
            break
        case '30d':
            start.setDate(start.getDate() - 30)
            break
    }

    return start
}

/**
 * Empty analytics (fallback)
 */
function getEmptyAnalytics(): TrafficAnalytics {
    return {
        totalRequests: 0,
        blockedRequests: 0,
        botRequests: 0,
        humanRequests: 0,
        uniqueIPs: 0,
        topCountries: [],
        topPaths: [],
        topBlockedIPs: [],
        trafficOverTime: [],
        averageBotScore: 0,
    }
}
