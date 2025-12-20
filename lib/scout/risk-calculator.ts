/**
 * Vendor Risk Calculator
 * Calculates comprehensive risk scores for vendors
 */

interface RiskScore {
    overall: number // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    breakdown: {
        sslScore: number
        breachRisk: number
        complianceRisk: number
        stalenessRisk: number
    }
    recommendations: string[]
}

interface Vendor {
    security_score?: number
    ssl_score?: number
    ssl_expiry?: Date
    breach_count?: number
    compliance_status?: any
    last_scan_at?: Date
}

/**
 * Calculate vendor risk score
 */
export function calculateVendorRisk(vendor: Vendor): RiskScore {
    const sslScore = calculateSSLRisk(vendor)
    const breachRisk = calculateBreachRisk(vendor.breach_count || 0)
    const complianceRisk = calculateComplianceRisk(vendor.compliance_status)
    const stalenessRisk = calculateStalenessRisk(vendor.last_scan_at)

    // Weighted average
    const overall = Math.round(
        sslScore * 0.3 +
        breachRisk * 0.3 +
        complianceRisk * 0.25 +
        stalenessRisk * 0.15
    )

    const riskLevel = determineRiskLevel(overall)
    const recommendations = generateRecommendations({
        sslScore,
        breachRisk,
        complianceRisk,
        stalenessRisk,
    })

    return {
        overall,
        riskLevel,
        breakdown: {
            sslScore,
            breachRisk,
            complianceRisk,
            stalenessRisk,
        },
        recommendations,
    }
}

/**
 * Calculate SSL risk component
 */
function calculateSSLRisk(vendor: Vendor): number {
    const sslScore = vendor.ssl_score || 0

    // Check expiry
    if (vendor.ssl_expiry) {
        const daysUntilExpiry = Math.floor(
            (vendor.ssl_expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )

        if (daysUntilExpiry < 0) {
            return 0 // Expired
        } else if (daysUntilExpiry < 7) {
            return Math.max(sslScore - 30, 0)
        } else if (daysUntilExpiry < 30) {
            return Math.max(sslScore - 15, 0)
        }
    }

    return sslScore
}

/**
 * Calculate breach risk component
 */
export function calculateBreachRisk(breachCount: number): number {
    if (breachCount === 0) return 100
    if (breachCount === 1) return 80
    if (breachCount === 2) return 60
    if (breachCount <= 4) return 40
    return 20
}

/**
 * Calculate compliance risk component
 */
function calculateComplianceRisk(complianceStatus: any): number {
    if (!complianceStatus || Object.keys(complianceStatus).length === 0) {
        return 50 // Unknown
    }

    const statuses = Object.values(complianceStatus)
    const compliantCount = statuses.filter(s => s === 'compliant').length
    const totalCount = statuses.length

    if (totalCount === 0) return 50

    return Math.round((compliantCount / totalCount) * 100)
}

/**
 * Calculate staleness risk component
 */
function calculateStalenessRisk(lastScanAt?: Date): number {
    if (!lastScanAt) return 50 // Never scanned

    const daysSinceLastScan = Math.floor(
        (Date.now() - lastScanAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceLastScan <= 1) return 100
    if (daysSinceLastScan <= 7) return 90
    if (daysSinceLastScan <= 30) return 70
    if (daysSinceLastScan <= 90) return 50
    return 30
}

/**
 * Determine risk level from score
 */
function determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'low'
    if (score >= 60) return 'medium'
    if (score >= 40) return 'high'
    return 'critical'
}

/**
 * Generate recommendations
 */
function generateRecommendations(breakdown: {
    sslScore: number
    breachRisk: number
    complianceRisk: number
    stalenessRisk: number
}): string[] {
    const recommendations: string[] = []

    if (breakdown.sslScore < 70) {
        recommendations.push('Improve SSL/TLS configuration')
    }

    if (breakdown.breachRisk < 80) {
        recommendations.push('Review breach history and security practices')
    }

    if (breakdown.complianceRisk < 70) {
        recommendations.push('Obtain compliance certifications (SOC 2, ISO 27001)')
    }

    if (breakdown.stalenessRisk < 70) {
        recommendations.push('Schedule regular security scans')
    }

    if (recommendations.length === 0) {
        recommendations.push('Maintain current security posture')
    }

    return recommendations
}
