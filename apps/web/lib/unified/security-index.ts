/**
 * Vajra - Unified Security Index (VSI)
 * 
 * Calculates a holistic security score across all modules
 * Provides executive-level overview of security posture
 */

import { securityGraph } from '../graph/security-graph';

export interface VajraSecurityIndex {
    overallScore: number;           // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    trend: 'improving' | 'stable' | 'declining';

    moduleScores: {
        shield: ModuleScore;
        scout: ModuleScore;
        sentry: ModuleScore;
        aegis: ModuleScore;
    };

    riskSummary: {
        criticalIssues: number;
        highIssues: number;
        activeThreats: number;
        pendingActions: number;
    };

    recentEvents: SecurityEvent[];
    recommendations: TopRecommendation[];

    lastUpdated: Date;
}

export interface ModuleScore {
    score: number;
    weight: number;
    status: 'healthy' | 'warning' | 'critical';
    trend: 'improving' | 'stable' | 'declining';
    keyMetrics: Record<string, number | string>;
    lastActivity: Date | null;
}

export interface SecurityEvent {
    id: string;
    module: 'shield' | 'scout' | 'sentry' | 'aegis';
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    title: string;
    description: string;
    timestamp: Date;
    handled: boolean;
}

export interface TopRecommendation {
    priority: number;
    module: 'shield' | 'scout' | 'sentry' | 'aegis';
    title: string;
    description: string;
    impact: string;
    actionUrl?: string;
}

// Module weights for VSI calculation
const MODULE_WEIGHTS = {
    shield: 0.30,   // External protection - highest risk
    scout: 0.25,    // Vendor management
    aegis: 0.25,    // Code security
    sentry: 0.20,   // Employee security
};

/**
 * Vajra Security Index Calculator
 */
export class VSICalculator {
    private events: SecurityEvent[] = [];
    private moduleData: {
        shield: ModuleData;
        scout: ModuleData;
        sentry: ModuleData;
        aegis: ModuleData;
    };

    constructor() {
        // Initialize with default data
        this.moduleData = {
            shield: this.createDefaultModuleData(),
            scout: this.createDefaultModuleData(),
            sentry: this.createDefaultModuleData(),
            aegis: this.createDefaultModuleData(),
        };
    }

    /**
     * Calculate the Vajra Security Index
     */
    calculate(): VajraSecurityIndex {
        const moduleScores = {
            shield: this.calculateModuleScore('shield'),
            scout: this.calculateModuleScore('scout'),
            sentry: this.calculateModuleScore('sentry'),
            aegis: this.calculateModuleScore('aegis'),
        };

        // Calculate weighted overall score
        let overallScore = 0;
        for (const [module, weight] of Object.entries(MODULE_WEIGHTS)) {
            overallScore += moduleScores[module as keyof typeof moduleScores].score * weight;
        }
        overallScore = Math.round(overallScore);

        // Get risk summary from security graph
        const graphStats = securityGraph.getStats();
        const toxicCombinations = securityGraph.findToxicCombinations();

        const riskSummary = {
            criticalIssues: toxicCombinations.filter(t => t.priority === 'critical').length,
            highIssues: toxicCombinations.filter(t => t.priority === 'high').length,
            activeThreats: this.events.filter(e => !e.handled && e.severity === 'critical').length,
            pendingActions: this.events.filter(e => !e.handled).length,
        };

        // Get recent events
        const recentEvents = this.events
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);

        // Generate recommendations
        const recommendations = this.generateRecommendations(moduleScores, toxicCombinations);

        return {
            overallScore,
            grade: this.scoreToGrade(overallScore),
            trend: this.calculateTrend(),
            moduleScores,
            riskSummary,
            recentEvents,
            recommendations,
            lastUpdated: new Date(),
        };
    }

    /**
     * Update Shield metrics
     */
    updateShield(data: {
        blockedThreats: number;
        requestsAnalyzed: number;
        averageBotScore: number;
        bunkerModeActivations: number;
        ddosAttacks: number;
    }): void {
        this.moduleData.shield = {
            ...this.moduleData.shield,
            ...data,
            lastUpdated: new Date(),
        };
    }

    /**
     * Update Scout metrics
     */
    updateScout(data: {
        vendorCount: number;
        averageVendorScore: number;
        highRiskVendors: number;
        recentBreaches: number;
        complianceRate: number;
    }): void {
        this.moduleData.scout = {
            ...this.moduleData.scout,
            ...data,
            lastUpdated: new Date(),
        };
    }

    /**
     * Update Sentry metrics
     */
    updateSentry(data: {
        employeeCount: number;
        averageSecurityScore: number;
        phishPronePercentage: number;
        trainingCompletion: number;
        mfaAdoption: number;
        recentPhishingClicks: number;
    }): void {
        this.moduleData.sentry = {
            ...this.moduleData.sentry,
            ...data,
            lastUpdated: new Date(),
        };
    }

    /**
     * Update Aegis metrics
     */
    updateAegis(data: {
        securityScore: number;
        criticalVulns: number;
        highVulns: number;
        mediumVulns: number;
        secretsFound: number;
        outdatedDeps: number;
    }): void {
        this.moduleData.aegis = {
            ...this.moduleData.aegis,
            ...data,
            lastUpdated: new Date(),
        };
    }

    /**
     * Record a security event
     */
    recordEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
        this.events.push({
            ...event,
            id: crypto.randomUUID(),
            timestamp: new Date(),
        });

        // Trim old events
        if (this.events.length > 1000) {
            this.events = this.events.slice(-500);
        }
    }

    /**
     * Mark event as handled
     */
    handleEvent(eventId: string): void {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            event.handled = true;
        }
    }

    /**
     * Get executive summary
     */
    getExecutiveSummary(): {
        headline: string;
        mainRisk: string | null;
        keyMetrics: Array<{ label: string; value: string; trend: string }>;
        actionItems: string[];
    } {
        const vsi = this.calculate();

        let headline: string;
        if (vsi.overallScore >= 80) {
            headline = '✅ Security posture is strong';
        } else if (vsi.overallScore >= 60) {
            headline = '⚠️ Security posture needs attention';
        } else {
            headline = '🚨 Critical security issues require immediate action';
        }

        const mainRisk = vsi.recommendations.length > 0
            ? vsi.recommendations[0].title
            : null;

        const keyMetrics = [
            {
                label: 'Security Score',
                value: `${vsi.overallScore}/100 (${vsi.grade})`,
                trend: vsi.trend === 'improving' ? '↑' : vsi.trend === 'declining' ? '↓' : '→'
            },
            {
                label: 'Active Threats',
                value: vsi.riskSummary.activeThreats.toString(),
                trend: vsi.riskSummary.activeThreats > 0 ? '↑' : '→'
            },
            {
                label: 'Pending Actions',
                value: vsi.riskSummary.pendingActions.toString(),
                trend: '→'
            },
        ];

        const actionItems = vsi.recommendations
            .slice(0, 5)
            .map(r => r.title);

        return { headline, mainRisk, keyMetrics, actionItems };
    }

    // Private methods

    private createDefaultModuleData(): ModuleData {
        return {
            score: 75,
            lastUpdated: null,
        };
    }

    private calculateModuleScore(module: keyof typeof MODULE_WEIGHTS): ModuleScore {
        const data = this.moduleData[module];
        let score = 75; // Default
        let status: ModuleScore['status'] = 'healthy';
        const keyMetrics: Record<string, number | string> = {};

        switch (module) {
            case 'shield':
                // Calculate based on threat blocking effectiveness
                const shieldData = data as ShieldData;
                if (shieldData.blockedThreats !== undefined) {
                    keyMetrics['Threats Blocked'] = shieldData.blockedThreats;
                    keyMetrics['Avg Bot Score'] = shieldData.averageBotScore?.toFixed(1) || 'N/A';

                    // Higher score if blocking threats effectively
                    score = Math.min(100, 75 + (shieldData.blockedThreats > 100 ? 15 : 0));
                    if (shieldData.ddosAttacks && shieldData.ddosAttacks > 0) {
                        score -= 10;
                        status = 'warning';
                    }
                }
                break;

            case 'scout':
                const scoutData = data as ScoutData;
                if (scoutData.averageVendorScore !== undefined) {
                    score = scoutData.averageVendorScore;
                    keyMetrics['Vendors'] = scoutData.vendorCount || 0;
                    keyMetrics['High Risk'] = scoutData.highRiskVendors || 0;
                    keyMetrics['Compliance'] = `${scoutData.complianceRate || 0}%`;

                    if (scoutData.highRiskVendors && scoutData.highRiskVendors > 0) {
                        status = 'warning';
                    }
                    if (scoutData.recentBreaches && scoutData.recentBreaches > 0) {
                        status = 'critical';
                    }
                }
                break;

            case 'sentry':
                const sentryData = data as SentryData;
                if (sentryData.averageSecurityScore !== undefined) {
                    score = sentryData.averageSecurityScore;
                    keyMetrics['Employees'] = sentryData.employeeCount || 0;
                    keyMetrics['Training'] = `${sentryData.trainingCompletion || 0}%`;
                    keyMetrics['MFA'] = `${sentryData.mfaAdoption || 0}%`;
                    keyMetrics['Phish-Prone'] = `${sentryData.phishPronePercentage || 0}%`;

                    if (sentryData.phishPronePercentage && sentryData.phishPronePercentage > 30) {
                        status = 'warning';
                    }
                    if (sentryData.recentPhishingClicks && sentryData.recentPhishingClicks > 5) {
                        status = 'critical';
                    }
                }
                break;

            case 'aegis':
                const aegisData = data as AegisData;
                if (aegisData.securityScore !== undefined) {
                    score = aegisData.securityScore;
                    keyMetrics['Critical'] = aegisData.criticalVulns || 0;
                    keyMetrics['High'] = aegisData.highVulns || 0;
                    keyMetrics['Secrets'] = aegisData.secretsFound || 0;

                    if (aegisData.criticalVulns && aegisData.criticalVulns > 0) {
                        status = 'critical';
                    } else if (aegisData.highVulns && aegisData.highVulns > 3) {
                        status = 'warning';
                    }
                }
                break;
        }

        return {
            score,
            weight: MODULE_WEIGHTS[module],
            status,
            trend: 'stable', // Would need historical data
            keyMetrics,
            lastActivity: data.lastUpdated,
        };
    }

    private scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    private calculateTrend(): VajraSecurityIndex['trend'] {
        // Would compare with historical data
        return 'stable';
    }

    private generateRecommendations(
        moduleScores: VajraSecurityIndex['moduleScores'],
        toxicCombinations: Array<{ priority: string; description: string }>
    ): TopRecommendation[] {
        const recommendations: TopRecommendation[] = [];
        let priority = 1;

        // Add toxic combination recommendations
        for (const combination of toxicCombinations.slice(0, 3)) {
            recommendations.push({
                priority: priority++,
                module: 'shield' as const,
                title: `Fix: ${combination.description.substring(0, 50)}...`,
                description: combination.description,
                impact: 'Reduces attack surface significantly',
            });
        }

        // Add module-specific recommendations
        for (const [module, score] of Object.entries(moduleScores)) {
            if (score.status === 'critical') {
                recommendations.push({
                    priority: priority++,
                    module: module as TopRecommendation['module'],
                    title: `Critical issues in ${module.toUpperCase()}`,
                    description: `${module.toUpperCase()} module has critical issues that need immediate attention`,
                    impact: 'Prevents potential compromise',
                });
            }
        }

        return recommendations.sort((a, b) => a.priority - b.priority);
    }
}

// Type definitions for module data
interface ModuleData {
    score: number;
    lastUpdated: Date | null;
}

interface ShieldData extends ModuleData {
    blockedThreats?: number;
    requestsAnalyzed?: number;
    averageBotScore?: number;
    bunkerModeActivations?: number;
    ddosAttacks?: number;
}

interface ScoutData extends ModuleData {
    vendorCount?: number;
    averageVendorScore?: number;
    highRiskVendors?: number;
    recentBreaches?: number;
    complianceRate?: number;
}

interface SentryData extends ModuleData {
    employeeCount?: number;
    averageSecurityScore?: number;
    phishPronePercentage?: number;
    trainingCompletion?: number;
    mfaAdoption?: number;
    recentPhishingClicks?: number;
}

interface AegisData extends ModuleData {
    securityScore?: number;
    criticalVulns?: number;
    highVulns?: number;
    mediumVulns?: number;
    secretsFound?: number;
    outdatedDeps?: number;
}

// Export singleton
export const vsi = new VSICalculator();
