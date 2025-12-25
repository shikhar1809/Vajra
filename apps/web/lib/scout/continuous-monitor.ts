/**
 * Vajra Scout - Continuous Vendor Monitoring
 * 
 * Automated continuous monitoring of vendor security posture
 * Features:
 * - Scheduled re-scanning
 * - Change detection
 * - Real-time alerts
 * - Breach notifications
 */

import { EnhancedVendorRiskScorer, VendorRiskScore } from './enhanced-risk-scoring';
import { securityGraph } from '../graph/security-graph';

export interface MonitoredVendor {
    id: string;
    domain: string;
    name: string;
    lastScore?: VendorRiskScore;
    previousScore?: VendorRiskScore;
    lastScan?: Date;
    nextScan?: Date;
    scanInterval: ScanInterval;
    status: 'active' | 'paused' | 'pending';
    alerts: VendorAlert[];
    dataAccessLevel: 'none' | 'limited' | 'moderate' | 'extensive';
    businessCriticality: 'low' | 'medium' | 'high' | 'critical';
}

export type ScanInterval = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface VendorAlert {
    id: string;
    vendorId: string;
    type: AlertType;
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    createdAt: Date;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
}

export type AlertType =
    | 'score_drop'
    | 'new_breach'
    | 'new_vulnerability'
    | 'certificate_expiry'
    | 'compliance_change'
    | 'security_incident';

export interface MonitoringConfig {
    defaultInterval: ScanInterval;
    alertThresholds: {
        scoreDrop: number;          // Alert if score drops by this much
        minimumScore: number;       // Alert if score falls below this
    };
    notifications: {
        email: boolean;
        slack: boolean;
        webhook?: string;
    };
}

/**
 * Vendor Monitoring Service
 */
export class VendorMonitoringService {
    private vendors = new Map<string, MonitoredVendor>();
    private scorer = new EnhancedVendorRiskScorer();
    private config: MonitoringConfig;

    constructor(config?: Partial<MonitoringConfig>) {
        this.config = {
            defaultInterval: 'weekly',
            alertThresholds: {
                scoreDrop: 10,
                minimumScore: 60,
            },
            notifications: {
                email: true,
                slack: false,
            },
            ...config,
        };
    }

    /**
     * Add a vendor to monitoring
     */
    async addVendor(vendor: {
        id: string;
        domain: string;
        name: string;
        dataAccessLevel?: MonitoredVendor['dataAccessLevel'];
        businessCriticality?: MonitoredVendor['businessCriticality'];
        scanInterval?: ScanInterval;
    }): Promise<MonitoredVendor> {
        // Perform initial scan
        const initialScore = await this.scorer.scoreVendor(vendor.id, vendor.domain);

        const monitoredVendor: MonitoredVendor = {
            id: vendor.id,
            domain: vendor.domain,
            name: vendor.name,
            lastScore: initialScore,
            lastScan: new Date(),
            nextScan: this.calculateNextScan(vendor.scanInterval || this.config.defaultInterval),
            scanInterval: vendor.scanInterval || this.config.defaultInterval,
            status: 'active',
            alerts: [],
            dataAccessLevel: vendor.dataAccessLevel || 'limited',
            businessCriticality: vendor.businessCriticality || 'medium',
        };

        this.vendors.set(vendor.id, monitoredVendor);

        // Add to security graph
        securityGraph.upsertEntity({
            type: 'vendor',
            name: vendor.name,
            properties: {
                domain: vendor.domain,
                score: initialScore.overallScore,
                grade: initialScore.grade,
                dataAccessLevel: monitoredVendor.dataAccessLevel,
                criticality: monitoredVendor.businessCriticality,
            },
            riskScore: 100 - initialScore.overallScore,
            tags: [initialScore.grade, monitoredVendor.businessCriticality],
        });

        // Check for initial alerts
        await this.checkAlerts(monitoredVendor);

        return monitoredVendor;
    }

    /**
     * Get all monitored vendors
     */
    getVendors(): MonitoredVendor[] {
        return Array.from(this.vendors.values());
    }

    /**
     * Get vendor by ID
     */
    getVendor(id: string): MonitoredVendor | undefined {
        return this.vendors.get(id);
    }

    /**
     * Manually trigger a vendor scan
     */
    async scanVendor(vendorId: string): Promise<VendorRiskScore | null> {
        const vendor = this.vendors.get(vendorId);
        if (!vendor) return null;

        // Store previous score
        vendor.previousScore = vendor.lastScore;

        // Perform new scan
        const newScore = await this.scorer.scoreVendor(vendorId, vendor.domain);

        vendor.lastScore = newScore;
        vendor.lastScan = new Date();
        vendor.nextScan = this.calculateNextScan(vendor.scanInterval);

        // Update security graph
        securityGraph.upsertEntity({
            type: 'vendor',
            name: vendor.name,
            properties: {
                domain: vendor.domain,
                score: newScore.overallScore,
                grade: newScore.grade,
                previousScore: vendor.previousScore?.overallScore,
                scoreChange: newScore.overallScore - (vendor.previousScore?.overallScore || 0),
            },
            riskScore: 100 - newScore.overallScore,
            tags: [newScore.grade, vendor.businessCriticality],
        });

        // Check for alerts
        await this.checkAlerts(vendor);

        return newScore;
    }

    /**
     * Get vendors due for scanning
     */
    getVendorsDueForScan(): MonitoredVendor[] {
        const now = new Date();
        return Array.from(this.vendors.values())
            .filter(v => v.status === 'active' && v.nextScan && v.nextScan <= now);
    }

    /**
     * Run scheduled scans for all due vendors
     */
    async runScheduledScans(): Promise<Array<{
        vendorId: string;
        success: boolean;
        score?: VendorRiskScore;
        error?: string;
    }>> {
        const dueVendors = this.getVendorsDueForScan();
        const results = [];

        for (const vendor of dueVendors) {
            try {
                const score = await this.scanVendor(vendor.id);
                results.push({ vendorId: vendor.id, success: true, score: score || undefined });
            } catch (error) {
                results.push({
                    vendorId: vendor.id,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return results;
    }

    /**
     * Get portfolio risk summary
     */
    getPortfolioSummary(): {
        totalVendors: number;
        averageScore: number;
        riskDistribution: Record<string, number>;
        criticalAlerts: number;
        vendorsByRisk: {
            low: MonitoredVendor[];
            medium: MonitoredVendor[];
            high: MonitoredVendor[];
            critical: MonitoredVendor[];
        };
    } {
        const vendors = this.getVendors();

        const riskDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        const vendorsByRisk: { low: MonitoredVendor[]; medium: MonitoredVendor[]; high: MonitoredVendor[]; critical: MonitoredVendor[] } = {
            low: [],
            medium: [],
            high: [],
            critical: [],
        };

        let totalScore = 0;
        let criticalAlerts = 0;

        for (const vendor of vendors) {
            const score = vendor.lastScore?.overallScore || 0;
            const grade = vendor.lastScore?.grade || 'F';

            totalScore += score;
            riskDistribution[grade]++;

            // Categorize by risk (inverse of score)
            if (score >= 80) vendorsByRisk.low.push(vendor);
            else if (score >= 60) vendorsByRisk.medium.push(vendor);
            else if (score >= 40) vendorsByRisk.high.push(vendor);
            else vendorsByRisk.critical.push(vendor);

            criticalAlerts += vendor.alerts.filter(a =>
                a.severity === 'critical' && !a.acknowledged
            ).length;
        }

        return {
            totalVendors: vendors.length,
            averageScore: vendors.length > 0 ? Math.round(totalScore / vendors.length) : 0,
            riskDistribution,
            criticalAlerts,
            vendorsByRisk,
        };
    }

    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(vendorId: string, alertId: string, acknowledgedBy: string): boolean {
        const vendor = this.vendors.get(vendorId);
        if (!vendor) return false;

        const alert = vendor.alerts.find(a => a.id === alertId);
        if (!alert) return false;

        alert.acknowledged = true;
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = new Date();

        return true;
    }

    /**
     * Get all unacknowledged alerts
     */
    getUnacknowledgedAlerts(): VendorAlert[] {
        return Array.from(this.vendors.values())
            .flatMap(v => v.alerts)
            .filter(a => !a.acknowledged)
            .sort((a, b) => {
                const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return severityOrder[a.severity] - severityOrder[b.severity];
            });
    }

    // Private helper methods

    private calculateNextScan(interval: ScanInterval): Date {
        const now = new Date();
        const next = new Date(now);

        switch (interval) {
            case 'daily':
                next.setDate(next.getDate() + 1);
                break;
            case 'weekly':
                next.setDate(next.getDate() + 7);
                break;
            case 'biweekly':
                next.setDate(next.getDate() + 14);
                break;
            case 'monthly':
                next.setMonth(next.getMonth() + 1);
                break;
        }

        return next;
    }

    private async checkAlerts(vendor: MonitoredVendor): Promise<void> {
        if (!vendor.lastScore) return;

        const score = vendor.lastScore.overallScore;
        const previousScore = vendor.previousScore?.overallScore;

        // Check for score drop
        if (previousScore && previousScore - score >= this.config.alertThresholds.scoreDrop) {
            this.addAlert(vendor, {
                type: 'score_drop',
                severity: previousScore - score >= 20 ? 'critical' : 'high',
                title: 'Significant score drop detected',
                description: `Vendor score dropped from ${previousScore} to ${score} (-${previousScore - score} points)`,
            });
        }

        // Check for minimum score
        if (score < this.config.alertThresholds.minimumScore) {
            this.addAlert(vendor, {
                type: 'security_incident',
                severity: score < 40 ? 'critical' : 'high',
                title: 'Vendor score below threshold',
                description: `Vendor score (${score}) is below minimum threshold (${this.config.alertThresholds.minimumScore})`,
            });
        }

        // Check for new breaches
        const breachFindings = vendor.lastScore.factors.leakedCredentials.findings
            .filter(f => f.title.startsWith('Breach:'));
        const previousBreachCount = vendor.previousScore?.factors.leakedCredentials.findings
            .filter(f => f.title.startsWith('Breach:')).length || 0;

        if (breachFindings.length > previousBreachCount) {
            const newBreaches = breachFindings.slice(previousBreachCount);
            for (const breach of newBreaches) {
                this.addAlert(vendor, {
                    type: 'new_breach',
                    severity: 'critical',
                    title: breach.title,
                    description: breach.description,
                });
            }
        }

        // Check for critical findings
        for (const [factorName, factor] of Object.entries(vendor.lastScore.factors)) {
            const criticalFindings = factor.findings.filter(f => f.severity === 'critical');
            for (const finding of criticalFindings) {
                // Avoid duplicate alerts
                const existingAlert = vendor.alerts.find(a =>
                    a.title === finding.title &&
                    a.createdAt.toDateString() === new Date().toDateString()
                );

                if (!existingAlert) {
                    this.addAlert(vendor, {
                        type: 'new_vulnerability',
                        severity: 'critical',
                        title: finding.title,
                        description: finding.description,
                    });
                }
            }
        }
    }

    private addAlert(vendor: MonitoredVendor, alert: Omit<VendorAlert, 'id' | 'vendorId' | 'createdAt' | 'acknowledged'>): void {
        const newAlert: VendorAlert = {
            id: crypto.randomUUID(),
            vendorId: vendor.id,
            createdAt: new Date(),
            acknowledged: false,
            ...alert,
        };

        vendor.alerts.push(newAlert);

        // Send notifications
        this.sendNotification(vendor, newAlert);
    }

    private async sendNotification(vendor: MonitoredVendor, alert: VendorAlert): Promise<void> {
        // In production, implement actual notification sending
        console.log(`[VendorMonitor] Alert for ${vendor.name}: ${alert.title}`);

        if (this.config.notifications.webhook) {
            try {
                await fetch(this.config.notifications.webhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        vendor: { id: vendor.id, name: vendor.name, domain: vendor.domain },
                        alert,
                    }),
                });
            } catch (error) {
                console.error('[VendorMonitor] Webhook notification failed:', error);
            }
        }
    }
}

// Export singleton
export const vendorMonitor = new VendorMonitoringService();
