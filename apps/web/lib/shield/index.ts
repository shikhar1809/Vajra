/**
 * Vajra - Shield Module Public API
 * 
 * Exports all Shield functionality for external use
 */

// Bot Detection
export {
    BotDetectionEngine,
    botDetector,
} from './ml-bot-detector';

export type {
    BotDetectionResult,
    BotSignals,
    BrowserSignals,
    RequestContext
} from './ml-bot-detector';

// LLM Threat Analysis
export {
    LLMThreatAnalyzer,
    threatAnalyzer,
} from './llm-threat-analyzer';

export type {
    ThreatAnalysis,
    ThreatIndicator
} from './llm-threat-analyzer';

// CrowdSec Integration
export {
    CrowdSecIntegration,
    CrowdSecCTI,
    CrowdSecLAPI,
    crowdsec,
    createCrowdSecIntegration,
} from './crowdsec-integration';

export type {
    CrowdSecDecision,
    CTIResponse,
    CrowdSecConfig
} from './crowdsec-integration';

// Existing Shield modules
export {
    getShieldConfig,
    updateShieldConfig,
    evaluateRequest
} from './shield-config';

export {
    AnomalyDetectionEngine
} from './anomaly-detector';

export {
    BunkerModeManager
} from './bunker-mode';

// Import types for function signatures
import type { ThreatAnalysis } from './llm-threat-analyzer';

/**
 * Quick access to Shield protection
 */
export async function analyzeRequest(context: {
    ip: string;
    userAgent: string;
    headers: Record<string, string>;
    path: string;
    method: string;
    body?: string;
}): Promise<{
    allowed: boolean;
    botScore: number;
    action: 'allow' | 'challenge' | 'block';
    reason: string;
    crowdsecBlocked: boolean;
    threatAnalysis?: ThreatAnalysis;
}> {
    const { botDetector } = await import('./ml-bot-detector');
    const { crowdsec } = await import('./crowdsec-integration');
    const { threatAnalyzer } = await import('./llm-threat-analyzer');

    // 1. Check CrowdSec first (fastest)
    const crowdsecResult = await crowdsec.checkIP(context.ip);

    if (crowdsecResult.isBlocked) {
        return {
            allowed: false,
            botScore: 1,
            action: 'block',
            reason: 'IP blocked by CrowdSec community',
            crowdsecBlocked: true,
        };
    }

    // 2. Bot detection
    const botResult = await botDetector.analyze({
        ...context,
        timestamp: new Date(),
    });

    // 3. LLM threat analysis for suspicious requests (optional, based on score)
    let threatAnalysisResult: ThreatAnalysis | undefined;
    if (botResult.score < 40) {
        threatAnalysisResult = await threatAnalyzer.analyzeRequest(
            { ...context, timestamp: new Date() },
            { body: context.body }
        );
    }

    return {
        allowed: botResult.action === 'allow',
        botScore: botResult.score,
        action: botResult.action,
        reason: botResult.reason,
        crowdsecBlocked: false,
        threatAnalysis: threatAnalysisResult,
    };
}
