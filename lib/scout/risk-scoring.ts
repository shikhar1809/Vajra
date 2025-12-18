/**
 * Vajra Scout - Risk Scoring Algorithm
 * 
 * Multi-factor risk assessment for third-party vendors:
 * - Security posture (40%)
 * - Compliance status (30%)
 * - Reputation & history (20%)
 * - Incident history (10%)
 */

export interface RiskFactors {
    securityScore: number; // 0-100
    complianceScore: number; // 0-100
    reputationScore: number; // 0-100
    incidentHistory: {
        totalIncidents: number;
        criticalIncidents: number;
        lastIncidentDate?: Date;
        resolvedIncidents: number;
    };
    dataAccess: 'none' | 'limited' | 'moderate' | 'extensive';
    businessCriticality: 'low' | 'medium' | 'high' | 'critical';
}

export interface RiskAssessment {
    overallScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: {
        security: { score: number; weight: number };
        compliance: { score: number; weight: number };
        reputation: { score: number; weight: number };
        incidents: { score: number; weight: number };
    };
    recommendations: string[];
    actionRequired: boolean;
}

/**
 * Compliance Checker
 */
export class ComplianceChecker {
    private readonly FRAMEWORKS = {
        'SOC 2': {
            requirements: ['Access Controls', 'Encryption', 'Monitoring', 'Incident Response'],
            weight: 0.3,
        },
        'ISO 27001': {
            requirements: ['ISMS', 'Risk Assessment', 'Asset Management', 'Access Control'],
            weight: 0.35,
        },
        'PCI DSS': {
            requirements: ['Firewall', 'Encryption', 'Access Control', 'Monitoring'],
            weight: 0.25,
        },
        'GDPR': {
            requirements: ['Data Protection', 'Privacy', 'Consent', 'Data Breach Notification'],
            weight: 0.3,
        },
        'HIPAA': {
            requirements: ['Privacy Rule', 'Security Rule', 'Breach Notification'],
            weight: 0.35,
        },
    };

    /**
     * Check compliance with specific framework
     */
    checkCompliance(
        framework: keyof typeof this.FRAMEWORKS,
        certifications: string[],
        implementedControls: string[]
    ): { compliant: boolean; score: number; missingRequirements: string[] } {
        const frameworkData = this.FRAMEWORKS[framework];
        const missingRequirements: string[] = [];

        // Check if vendor has certification
        const hasCertification = certifications.includes(framework);

        // Check implemented controls
        for (const requirement of frameworkData.requirements) {
            if (!implementedControls.includes(requirement)) {
                missingRequirements.push(requirement);
            }
        }

        const implementedCount = frameworkData.requirements.length - missingRequirements.length;
        const score = hasCertification ? 100 : (implementedCount / frameworkData.requirements.length) * 100;

        return {
            compliant: hasCertification || missingRequirements.length === 0,
            score: Math.round(score),
            missingRequirements,
        };
    }

    /**
     * Calculate overall compliance score across all frameworks
     */
    calculateOverallCompliance(
        certifications: string[],
        implementedControls: string[]
    ): { score: number; details: Record<string, any> } {
        const details: Record<string, any> = {};
        let weightedScore = 0;
        let totalWeight = 0;

        for (const [framework, data] of Object.entries(this.FRAMEWORKS)) {
            const result = this.checkCompliance(
                framework as keyof typeof this.FRAMEWORKS,
                certifications,
                implementedControls
            );

            details[framework] = result;
            weightedScore += result.score * data.weight;
            totalWeight += data.weight;
        }

        return {
            score: Math.round(weightedScore / totalWeight),
            details,
        };
    }
}

/**
 * Incident History Analyzer
 */
export class IncidentAnalyzer {
    /**
     * Calculate incident score based on history
     */
    calculateIncidentScore(incidents: {
        totalIncidents: number;
        criticalIncidents: number;
        lastIncidentDate?: Date;
        resolvedIncidents: number;
    }): number {
        let score = 100;

        // Penalize for total incidents
        score -= incidents.totalIncidents * 5;

        // Heavy penalty for critical incidents
        score -= incidents.criticalIncidents * 15;

        // Penalty for recent incidents
        if (incidents.lastIncidentDate) {
            const daysSinceLastIncident =
                (Date.now() - incidents.lastIncidentDate.getTime()) / (1000 * 60 * 60 * 24);

            if (daysSinceLastIncident < 30) {
                score -= 20; // Recent incident
            } else if (daysSinceLastIncident < 90) {
                score -= 10;
            }
        }

        // Bonus for resolution rate
        if (incidents.totalIncidents > 0) {
            const resolutionRate = incidents.resolvedIncidents / incidents.totalIncidents;
            score += resolutionRate * 10;
        }

        return Math.max(0, Math.min(100, score));
    }
}

/**
 * Main Risk Scoring Engine
 */
export class RiskScoringEngine {
    private complianceChecker = new ComplianceChecker();
    private incidentAnalyzer = new IncidentAnalyzer();

    /**
     * Calculate comprehensive risk assessment
     */
    assessRisk(factors: RiskFactors): RiskAssessment {
        // Calculate incident score
        const incidentScore = this.incidentAnalyzer.calculateIncidentScore(factors.incidentHistory);

        // Define weights
        const weights = {
            security: 0.4,
            compliance: 0.3,
            reputation: 0.2,
            incidents: 0.1,
        };

        // Calculate weighted overall score
        const overallScore = Math.round(
            factors.securityScore * weights.security +
            factors.complianceScore * weights.compliance +
            factors.reputationScore * weights.reputation +
            incidentScore * weights.incidents
        );

        // Adjust score based on data access and business criticality
        const adjustedScore = this.adjustForContext(
            overallScore,
            factors.dataAccess,
            factors.businessCriticality
        );

        // Determine risk level
        const riskLevel = this.determineRiskLevel(adjustedScore);

        // Generate recommendations
        const recommendations = this.generateRecommendations(factors, adjustedScore);

        return {
            overallScore: adjustedScore,
            riskLevel,
            factors: {
                security: { score: factors.securityScore, weight: weights.security },
                compliance: { score: factors.complianceScore, weight: weights.compliance },
                reputation: { score: factors.reputationScore, weight: weights.reputation },
                incidents: { score: incidentScore, weight: weights.incidents },
            },
            recommendations,
            actionRequired: riskLevel === 'high' || riskLevel === 'critical',
        };
    }

    /**
     * Adjust risk score based on context
     */
    private adjustForContext(
        baseScore: number,
        dataAccess: RiskFactors['dataAccess'],
        businessCriticality: RiskFactors['businessCriticality']
    ): number {
        let adjusted = baseScore;

        // Increase risk if vendor has extensive data access
        const dataAccessPenalty = {
            none: 0,
            limited: 5,
            moderate: 10,
            extensive: 20,
        };
        adjusted -= dataAccessPenalty[dataAccess];

        // Increase risk if vendor is business-critical
        const criticalityPenalty = {
            low: 0,
            medium: 5,
            high: 10,
            critical: 15,
        };
        adjusted -= criticalityPenalty[businessCriticality];

        return Math.max(0, Math.min(100, adjusted));
    }

    /**
     * Determine risk level from score
     */
    private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
        if (score >= 80) return 'low';
        if (score >= 60) return 'medium';
        if (score >= 40) return 'high';
        return 'critical';
    }

    /**
     * Generate actionable recommendations
     */
    private generateRecommendations(factors: RiskFactors, score: number): string[] {
        const recommendations: string[] = [];

        if (factors.securityScore < 70) {
            recommendations.push('🔒 Require vendor to improve security posture');
            recommendations.push('Request recent penetration test results');
        }

        if (factors.complianceScore < 70) {
            recommendations.push('📋 Verify compliance certifications');
            recommendations.push('Request compliance audit reports');
        }

        if (factors.incidentHistory.criticalIncidents > 0) {
            recommendations.push('⚠️ Review incident response procedures');
            recommendations.push('Request post-incident reports');
        }

        if (factors.dataAccess === 'extensive' && score < 80) {
            recommendations.push('🔐 Implement additional access controls');
            recommendations.push('Require data encryption at rest and in transit');
        }

        if (factors.businessCriticality === 'critical' && score < 85) {
            recommendations.push('🎯 Establish backup vendor relationship');
            recommendations.push('Create contingency plan for vendor failure');
        }

        if (score < 60) {
            recommendations.push('🚨 URGENT: Consider terminating vendor relationship');
            recommendations.push('Conduct immediate security review');
        }

        return recommendations;
    }

    /**
     * Compare vendor risk scores
     */
    compareVendors(assessments: RiskAssessment[]): {
        bestVendor: number;
        worstVendor: number;
        averageScore: number;
        riskDistribution: Record<string, number>;
    } {
        const scores = assessments.map(a => a.overallScore);
        const bestVendor = Math.max(...scores);
        const worstVendor = Math.min(...scores);
        const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

        const riskDistribution = {
            low: assessments.filter(a => a.riskLevel === 'low').length,
            medium: assessments.filter(a => a.riskLevel === 'medium').length,
            high: assessments.filter(a => a.riskLevel === 'high').length,
            critical: assessments.filter(a => a.riskLevel === 'critical').length,
        };

        return {
            bestVendor,
            worstVendor,
            averageScore: Math.round(averageScore),
            riskDistribution,
        };
    }
}

export const riskEngine = new RiskScoringEngine();
export const complianceChecker = new ComplianceChecker();
