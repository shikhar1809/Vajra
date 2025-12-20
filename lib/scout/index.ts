/**
 * Vajra - Scout Module Public API
 * 
 * Exports all Scout (Vendor Management) functionality
 */

// Enhanced Risk Scoring
export {
    EnhancedVendorRiskScorer,
    vendorRiskScorer,
} from './enhanced-risk-scoring';

export type {
    VendorRiskScore,
    FactorScore,
    Finding,
    BreachHistory,
    Recommendation
} from './enhanced-risk-scoring';

// Continuous Monitoring
export {
    VendorMonitoringService,
    vendorMonitor,
} from './continuous-monitor';

export type {
    MonitoredVendor,
    ScanInterval,
    VendorAlert,
    AlertType,
    MonitoringConfig
} from './continuous-monitor';

// Existing Scout modules
export { VendorScanner } from './vendor-scanner';
export { RiskScoringEngine } from './risk-scoring';

// Import types for function signatures
import type { VendorRiskScore } from './enhanced-risk-scoring';
import type { MonitoredVendor } from './continuous-monitor';

/**
 * Quick access to vendor scanning
 */
export async function scanVendor(domain: string): Promise<VendorRiskScore> {
    const { vendorRiskScorer } = await import('./enhanced-risk-scoring');
    return vendorRiskScorer.scoreVendor(crypto.randomUUID(), domain);
}

/**
 * Add vendor to monitoring
 */
export async function monitorVendor(vendor: {
    domain: string;
    name: string;
    dataAccessLevel?: 'none' | 'limited' | 'moderate' | 'extensive';
    businessCriticality?: 'low' | 'medium' | 'high' | 'critical';
}): Promise<MonitoredVendor> {
    const { vendorMonitor } = await import('./continuous-monitor');
    return vendorMonitor.addVendor({
        id: crypto.randomUUID(),
        ...vendor,
    });
}

/**
 * Get portfolio risk summary
 */
export function getPortfolioRisk() {
    const { vendorMonitor } = require('./continuous-monitor');
    return vendorMonitor.getPortfolioSummary();
}

