/**
 * Vajra - Sentry Module Public API
 * 
 * Exports all Sentry (Employee Security) functionality
 */

// Phishing Simulator
export {
    PhishingCampaignManager,
    phishingCampaigns,
} from './phishing-simulator';

export type {
    PhishingCampaign,
    PhishingTemplate,
    CampaignMetrics,
    EmployeePhishingResult
} from './phishing-simulator';

// Employee Scoring
export {
    EmployeeScoreManager,
    employeeScores,
} from './employee-scoring';

export type {
    EmployeeSecurityScore,
    ComponentScore,
    Achievement,
    ScoreHistoryEntry,
    SecurityEvent
} from './employee-scoring';

// Existing Sentry modules
export { PhishingDetector } from './phishing-detector';
export { ThreatFeedAggregator } from './threat-feeds';

// Import types for function signatures
import type { PhishingCampaign } from './phishing-simulator';
import type { EmployeeSecurityScore } from './employee-scoring';

/**
 * Quick actions
 */

// Create a phishing campaign
export async function createPhishingCampaign(config: {
    name: string;
    department: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    targetEmployees: string[];
}): Promise<PhishingCampaign> {
    const { phishingCampaigns } = await import('./phishing-simulator');
    return phishingCampaigns.createAICampaign({
        ...config,
        createdBy: 'system',
    });
}

// Get employee score
export function getEmployeeScore(employeeId: string): EmployeeSecurityScore | undefined {
    const { employeeScores } = require('./employee-scoring');
    return employeeScores.getScore(employeeId);
}

// Get leaderboard
export function getLeaderboard(department?: string, limit: number = 10) {
    const { employeeScores } = require('./employee-scoring');
    return employeeScores.getLeaderboard({ department, limit });
}

// Get company-wide stats
export function getCompanySecurityStats() {
    const { employeeScores } = require('./employee-scoring');
    return employeeScores.getCompanyStats();
}

