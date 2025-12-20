export interface VajraShieldConfig {
    // Required
    apiKey: string;
    workspaceId: string;
    apiUrl?: string;

    // Optional features
    enableBotDetection?: boolean;
    enableBunkerMode?: boolean;
    enableAnomalyDetection?: boolean;
    bunkerModeThreshold?: number;

    // Whitelist
    whitelistedIPs?: string[];
    whitelistedPaths?: string[];

    // Logging
    logLevel?: 'debug' | 'info' | 'warn' | 'error';

    // Callbacks
    onBotDetected?: (data: BotDetectionData) => void;
    onAnomalyDetected?: (data: AnomalyData) => void;
    onBunkerModeTriggered?: (data: ChallengeData) => void;
}

export interface BotDetectionData {
    ip: string;
    botScore: number;
    userAgent: string;
    timestamp: string;
}

export interface AnomalyData {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    ip: string;
    description: string;
}

export interface ChallengeData {
    challengeId: string;
    type: 'math' | 'pattern' | 'captcha' | 'slider';
    question: string;
    options?: any[];
}

export interface TrafficLog {
    ip_address: string;
    user_agent: string;
    request_path: string;
    request_method: string;
    country?: string;
    city?: string;
    bot_score?: number;
}
