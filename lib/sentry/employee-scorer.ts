/**
 * Employee Security Scorer
 * Calculates comprehensive security scores for employees
 */

interface Employee {
    security_score?: number
    phishing_tests_passed?: number
    phishing_tests_failed?: number
    training_completed?: number
    last_training_date?: Date
    points?: number
}

interface SecurityScore {
    overall: number // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    breakdown: {
        phishingScore: number
        trainingScore: number
        activityScore: number
    }
    recommendations: string[]
}

/**
 * Calculate employee security score
 */
export function calculateEmployeeScore(employee: Employee): SecurityScore {
    const phishingScore = calculatePhishingScore(employee)
    const trainingScore = calculateTrainingScore(employee)
    const activityScore = calculateActivityScore(employee)

    // Weighted average
    const overall = Math.round(
        phishingScore * 0.4 +
        trainingScore * 0.4 +
        activityScore * 0.2
    )

    const riskLevel = determineRiskLevel(overall)
    const recommendations = generateRecommendations({
        phishingScore,
        trainingScore,
        activityScore,
    })

    return {
        overall,
        riskLevel,
        breakdown: {
            phishingScore,
            trainingScore,
            activityScore,
        },
        recommendations,
    }
}

/**
 * Calculate phishing awareness score
 */
function calculatePhishingScore(employee: Employee): number {
    const passed = employee.phishing_tests_passed || 0
    const failed = employee.phishing_tests_failed || 0
    const total = passed + failed

    if (total === 0) return 50 // No data

    const passRate = (passed / total) * 100

    // Bonus for high pass rate
    if (passRate >= 90) return 100
    if (passRate >= 80) return 90
    if (passRate >= 70) return 80
    if (passRate >= 60) return 70
    if (passRate >= 50) return 60
    return Math.max(passRate, 30)
}

/**
 * Calculate training completion score
 */
function calculateTrainingScore(employee: Employee): number {
    const completed = employee.training_completed || 0

    // Score based on courses completed
    if (completed >= 10) return 100
    if (completed >= 7) return 90
    if (completed >= 5) return 80
    if (completed >= 3) return 70
    if (completed >= 1) return 60
    return 40 // No training
}

/**
 * Calculate activity score
 */
function calculateActivityScore(employee: Employee): number {
    const lastTraining = employee.last_training_date

    if (!lastTraining) return 40 // Never trained

    const daysSinceTraining = Math.floor(
        (Date.now() - lastTraining.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceTraining <= 30) return 100
    if (daysSinceTraining <= 60) return 80
    if (daysSinceTraining <= 90) return 60
    return 40
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
    phishingScore: number
    trainingScore: number
    activityScore: number
}): string[] {
    const recommendations: string[] = []

    if (breakdown.phishingScore < 70) {
        recommendations.push('Complete phishing awareness training')
    }

    if (breakdown.trainingScore < 70) {
        recommendations.push('Enroll in security awareness courses')
    }

    if (breakdown.activityScore < 70) {
        recommendations.push('Participate in regular security training')
    }

    if (recommendations.length === 0) {
        recommendations.push('Maintain excellent security practices')
    }

    return recommendations
}

/**
 * Calculate leaderboard rankings
 */
export function calculateLeaderboard(employees: Employee[]): Employee[] {
    return employees
        .map(emp => ({
            ...emp,
            calculatedScore: calculateEmployeeScore(emp).overall
        }))
        .sort((a, b) => (b.calculatedScore || 0) - (a.calculatedScore || 0))
}
