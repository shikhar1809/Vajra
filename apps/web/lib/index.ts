/**
 * Vajra Security Platform - Main Entry Point
 * 
 * Unified export of all security modules
 */

// Shield - External Protection
export * as Shield from './shield';

// Scout - Vendor Management
export * as Scout from './scout';

// Sentry - Employee Security
export * as Sentry from './sentry';

// Aegis - Code Security
export * as Aegis from './aegis';

// Unified - Cross-module
export * as Unified from './unified';

// Security Graph
export { SecurityGraph, securityGraph } from './graph/security-graph';

// LLM Provider
export { LLMService, llm } from './llm/llm-provider';

/**
 * Vajra Platform - Quick Start
 * 
 * @example
 * ```typescript
 * import { Vajra } from './lib';
 * 
 * // Get security index
 * const vsi = await Vajra.getSecurityIndex();
 * console.log(`Security Score: ${vsi.overallScore}/100`);
 * 
 * // Analyze request
 * const result = await Vajra.analyzeRequest({ ip: '1.2.3.4', ... });
 * 
 * // Scan code
 * const scan = await Vajra.scanProject();
 * 
 * // Monitor vendor
 * const vendor = await Vajra.monitorVendor({ domain: 'vendor.com', name: 'Vendor' });
 * ```
 */
export const Vajra = {
    // Unified
    getSecurityIndex: () => require('./unified').getSecurityIndex(),
    getExecutiveSummary: () => require('./unified').getExecutiveSummary(),
    sendAlert: (params: any) => require('./unified').sendAlert(params),
    getPendingAlerts: () => require('./unified').getPendingAlerts(),

    // Shield
    analyzeRequest: (context: any) => require('./shield').analyzeRequest(context),

    // Scout
    scanVendor: (domain: string) => require('./scout').scanVendor(domain),
    monitorVendor: (vendor: any) => require('./scout').monitorVendor(vendor),
    getPortfolioRisk: () => require('./scout').getPortfolioRisk(),

    // Sentry
    createPhishingCampaign: (config: any) => require('./sentry').createPhishingCampaign(config),
    getEmployeeScore: (id: string) => require('./sentry').getEmployeeScore(id),
    getLeaderboard: (dept?: string, limit?: number) => require('./sentry').getLeaderboard(dept, limit),
    getCompanySecurityStats: () => require('./sentry').getCompanySecurityStats(),

    // Aegis
    scanProject: (path?: string) => require('./aegis').scanProject(path),
    scanSecrets: (path?: string) => require('./aegis').scanSecrets(path),
    scanDependencies: (path?: string) => require('./aegis').scanDependencies(path),
    generateSecurityWorkflow: (config?: any) => require('./aegis').generateSecurityWorkflow(config),
};

export default Vajra;
