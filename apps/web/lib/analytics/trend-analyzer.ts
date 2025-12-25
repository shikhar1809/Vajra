/**
 * Trend Analyzer
 * Analyzes trends and provides insights
 */

interface TrendData {
    current: number
    previous: number
    change: number
    changePercent: number
    trend: 'up' | 'down' | 'stable'
}

interface AnalyticsTrend {
    totalRequests: TrendData
    blockedRequests: TrendData
    botRequests: TrendData
    uniqueIPs: TrendData
}

/**
 * Calculate trend between two periods
 */
export function calculateTrend(current: number, previous: number): TrendData {
    const change = current - previous
    const changePercent = previous > 0 ? (change / previous) * 100 : 0

    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (Math.abs(changePercent) > 5) {
        trend = change > 0 ? 'up' : 'down'
    }

    return {
        current,
        previous,
        change,
        changePercent: Math.round(changePercent * 10) / 10,
        trend,
    }
}

/**
 * Analyze week-over-week trends
 */
export function analyzeWeekOverWeek(
    currentWeek: any,
    previousWeek: any
): AnalyticsTrend {
    return {
        totalRequests: calculateTrend(
            currentWeek.totalRequests || 0,
            previousWeek.totalRequests || 0
        ),
        blockedRequests: calculateTrend(
            currentWeek.blockedRequests || 0,
            previousWeek.blockedRequests || 0
        ),
        botRequests: calculateTrend(
            currentWeek.botRequests || 0,
            previousWeek.botRequests || 0
        ),
        uniqueIPs: calculateTrend(
            currentWeek.uniqueIPs || 0,
            previousWeek.uniqueIPs || 0
        ),
    }
}

/**
 * Generate predictive insights
 */
export function generateInsights(trends: AnalyticsTrend): string[] {
    const insights: string[] = []

    // Traffic insights
    if (trends.totalRequests.trend === 'up' && trends.totalRequests.changePercent > 20) {
        insights.push(`🚀 Traffic increased by ${trends.totalRequests.changePercent}% - Consider scaling resources`)
    }

    // Security insights
    if (trends.blockedRequests.trend === 'up' && trends.blockedRequests.changePercent > 30) {
        insights.push(`⚠️ Blocked requests up ${trends.blockedRequests.changePercent}% - Possible attack detected`)
    }

    // Bot insights
    if (trends.botRequests.trend === 'up' && trends.botRequests.changePercent > 25) {
        insights.push(`🤖 Bot activity increased ${trends.botRequests.changePercent}% - Review bot detection rules`)
    }

    // Positive insights
    if (trends.blockedRequests.trend === 'down' && Math.abs(trends.blockedRequests.changePercent) > 20) {
        insights.push(`✅ Security improved - Blocked requests down ${Math.abs(trends.blockedRequests.changePercent)}%`)
    }

    // Default insight
    if (insights.length === 0) {
        insights.push(`📊 Traffic patterns are stable - No significant changes detected`)
    }

    return insights
}

/**
 * Detect anomalies
 */
export function detectAnomalies(data: number[]): { hasAnomaly: boolean; anomalyIndex?: number } {
    if (data.length < 3) return { hasAnomaly: false }

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length
    const stdDev = Math.sqrt(
        data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    )

    // Check if any value is more than 2 standard deviations from mean
    for (let i = 0; i < data.length; i++) {
        if (Math.abs(data[i] - mean) > 2 * stdDev) {
            return { hasAnomaly: true, anomalyIndex: i }
        }
    }

    return { hasAnomaly: false }
}
