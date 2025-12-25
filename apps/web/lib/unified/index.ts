/**
 * Vajra - Unified Platform API
 * 
 * Exports all unified functionality for cross-module operations
 */

// Security Index (VSI)
export {
    VSICalculator,
    vsi,
} from './security-index';

export type {
    VajraSecurityIndex,
    ModuleScore,
    SecurityEvent as VSISecurityEvent,
    TopRecommendation
} from './security-index';

// Alert Manager
export {
    AlertManager,
    alerts,
} from './alert-manager';

export type {
    Alert,
    NotificationRecord,
    AlertConfig
} from './alert-manager';

// Import types for function signatures
import type { VajraSecurityIndex } from './security-index';

/**
 * Get current Vajra Security Index
 */
export function getSecurityIndex(): VajraSecurityIndex {
    const { vsi } = require('./security-index');
    return vsi.calculate();
}

/**
 * Get executive summary
 */
export function getExecutiveSummary() {
    const { vsi } = require('./security-index');
    return vsi.getExecutiveSummary();
}

/**
 * Send alert
 */
export async function sendAlert(params: {
    module: 'shield' | 'scout' | 'sentry' | 'aegis';
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    type: string;
    title: string;
    description: string;
    context?: Record<string, any>;
}) {
    const { alerts } = await import('./alert-manager');
    return alerts.alert(params);
}

/**
 * Get pending alerts
 */
export function getPendingAlerts() {
    const { alerts } = require('./alert-manager');
    return alerts.getAlerts({ status: ['pending'] });
}

/**
 * Get alert counts by severity
 */
export function getAlertCounts() {
    const { alerts } = require('./alert-manager');
    return alerts.getPendingCounts();
}

