import { VajraShieldConfig, TrafficLog, ChallengeData } from './types';
export declare class VajraClient {
    private config;
    private baseUrl;
    constructor(config: VajraShieldConfig);
    /**
     * Log traffic to Vajra Shield
     */
    logTraffic(data: TrafficLog): Promise<void>;
    /**
     * Get bot score for an IP address
     */
    getBotScore(ip: string): Promise<number>;
    /**
     * Generate bunker mode challenge
     */
    generateChallenge(): Promise<ChallengeData>;
    /**
     * Verify bunker mode challenge answer
     */
    verifyChallenge(challengeId: string, answer: string): Promise<boolean>;
    /**
     * Check if IP is whitelisted
     */
    isWhitelisted(ip: string): boolean;
    /**
     * Check if path is whitelisted
     */
    isPathWhitelisted(path: string): boolean;
    /**
     * Internal logging
     */
    private log;
}
