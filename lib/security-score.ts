interface SecurityMetrics {
    activeThreats: number
    criticalThreats: number
    malwareFound: number
    suspiciousTransactions: number
    deepfakesFound: number
}

export function calculateSecurityScore(metrics: SecurityMetrics): number {
    let score = 100

    // Deduct points based on severity
    score -= metrics.criticalThreats * 10  // -10 per critical threat
    score -= metrics.activeThreats * 5     // -5 per active threat
    score -= metrics.malwareFound * 8      // -8 per malware
    score -= metrics.suspiciousTransactions * 3  // -3 per suspicious transaction
    score -= metrics.deepfakesFound * 5    // -5 per deepfake

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)))
}

export function getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
}

export function getScoreBgColor(score: number): string {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
}

export function getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
}

export function getScoreDescription(score: number): string {
    if (score >= 80) return 'Your security posture is strong. Keep up the good work!'
    if (score >= 60) return 'Your security is good, but there are some areas to improve.'
    if (score >= 40) return 'Your security needs attention. Address the issues promptly.'
    return 'Critical security issues detected. Immediate action required!'
}
