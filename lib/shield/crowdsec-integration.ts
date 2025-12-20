/**
 * Vajra Shield - CrowdSec Integration
 * 
 * Integrates with CrowdSec's collaborative threat intelligence:
 * - IP reputation lookup
 * - Attack signal sharing
 * - Bouncer decisions
 * 
 * Free tier: 50 lookups/day with CTI API
 */

export interface CrowdSecDecision {
    id: number;
    origin: string;
    type: string;
    scope: string;
    value: string;
    duration: string;
    scenario: string;
    simulated: boolean;
}

export interface CTIResponse {
    ip: string;
    ip_range_score: number;
    ip_score: number;
    as_name: string;
    as_num: number;
    country: string;
    city: string;
    classifications: {
        name: string;
        label: string;
        description: string;
    }[];
    behaviors: {
        name: string;
        label: string;
        description: string;
    }[];
    attack_details: {
        name: string;
        label: string;
        description: string;
        references: string[];
    }[];
    target_countries: Record<string, number>;
    scores: {
        overall: {
            aggressiveness: number;
            threat: number;
            trust: number;
            anomaly: number;
            total: number;
        };
        last_day: {
            aggressiveness: number;
            threat: number;
            trust: number;
            anomaly: number;
            total: number;
        };
        last_week: {
            aggressiveness: number;
            threat: number;
            trust: number;
            anomaly: number;
            total: number;
        };
        last_month: {
            aggressiveness: number;
            threat: number;
            trust: number;
            anomaly: number;
            total: number;
        };
    };
    history: {
        full_age: number;
        days_age: number;
        first_seen: string;
        last_seen: string;
    };
}

export interface CrowdSecConfig {
    apiKey?: string;
    lapiUrl?: string;
    ctiApiKey?: string;
    enabled: boolean;
}

/**
 * CrowdSec CTI (Community Threat Intelligence) Client
 * Free tier: 50 queries/day
 */
export class CrowdSecCTI {
    private apiKey: string;
    private baseUrl = 'https://cti.api.crowdsec.net/v2';
    private cache = new Map<string, { data: CTIResponse; expiry: number }>();
    private readonly cacheTtlMs = 3600000; // 1 hour
    private dailyQueries = 0;
    private lastResetDate = new Date().toDateString();
    private readonly dailyLimit = 50;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Lookup IP reputation
     */
    async lookupIP(ip: string): Promise<CTIResponse | null> {
        // Check rate limit
        this.checkDailyReset();
        if (this.dailyQueries >= this.dailyLimit) {
            console.warn('[CrowdSec] Daily CTI limit reached');
            return null;
        }

        // Check cache
        const cached = this.cache.get(ip);
        if (cached && cached.expiry > Date.now()) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.baseUrl}/smoke/${ip}`, {
                headers: {
                    'x-api-key': this.apiKey,
                    'User-Agent': 'Vajra-Shield/1.0',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // IP not found = clean
                    return null;
                }
                throw new Error(`CrowdSec CTI error: ${response.status}`);
            }

            this.dailyQueries++;
            const data: CTIResponse = await response.json();

            // Cache result
            this.cache.set(ip, { data, expiry: Date.now() + this.cacheTtlMs });

            return data;
        } catch (error) {
            console.error('[CrowdSec CTI] Lookup failed:', error);
            return null;
        }
    }

    /**
     * Convert CTI response to risk score (0-100, higher = riskier)
     */
    getRiskScore(ctiData: CTIResponse): number {
        if (!ctiData) return 0;

        // Use overall scores
        const scores = ctiData.scores.overall;

        // Weight the scores
        const riskScore = (
            scores.aggressiveness * 0.3 +
            scores.threat * 0.4 +
            (5 - scores.trust) * 0.2 +  // Invert trust (lower trust = higher risk)
            scores.anomaly * 0.1
        ) * 20; // Scale to 0-100

        return Math.min(100, Math.max(0, riskScore));
    }

    /**
     * Get behavioral tags from CTI data
     */
    getBehaviors(ctiData: CTIResponse): string[] {
        return ctiData.behaviors?.map(b => b.name) || [];
    }

    private checkDailyReset(): void {
        const today = new Date().toDateString();
        if (today !== this.lastResetDate) {
            this.dailyQueries = 0;
            this.lastResetDate = today;
        }
    }
}

/**
 * CrowdSec Local API (LAPI) Client
 * For self-hosted CrowdSec instances
 */
export class CrowdSecLAPI {
    private apiUrl: string;
    private apiKey: string;

    constructor(apiUrl: string, apiKey: string) {
        this.apiUrl = apiUrl.replace(/\/$/, '');
        this.apiKey = apiKey;
    }

    /**
     * Query decisions for an IP
     */
    async getDecisions(ip: string): Promise<CrowdSecDecision[]> {
        try {
            const response = await fetch(`${this.apiUrl}/v1/decisions?ip=${ip}`, {
                headers: {
                    'X-Api-Key': this.apiKey,
                },
            });

            if (!response.ok) {
                if (response.status === 404) return [];
                throw new Error(`LAPI error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[CrowdSec LAPI] Query failed:', error);
            return [];
        }
    }

    /**
     * Report an attack signal
     */
    async reportSignal(signal: {
        ip: string;
        scenario: string;
        message: string;
        source?: string;
    }): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiUrl}/v1/alerts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': this.apiKey,
                },
                body: JSON.stringify([{
                    scenario: signal.scenario,
                    scenario_version: '1.0',
                    message: signal.message,
                    events_count: 1,
                    source: {
                        scope: 'ip',
                        value: signal.ip,
                    },
                    start_at: new Date().toISOString(),
                    stop_at: new Date().toISOString(),
                    labels: [],
                    decisions: [{
                        origin: 'vajra',
                        type: 'ban',
                        scope: 'ip',
                        value: signal.ip,
                        duration: '4h',
                        scenario: signal.scenario,
                    }],
                }]),
            });

            return response.ok;
        } catch (error) {
            console.error('[CrowdSec LAPI] Report failed:', error);
            return false;
        }
    }
}

/**
 * Combined CrowdSec Integration
 */
export class CrowdSecIntegration {
    private cti: CrowdSecCTI | null = null;
    private lapi: CrowdSecLAPI | null = null;
    private enabled: boolean;

    constructor(config: CrowdSecConfig) {
        this.enabled = config.enabled;

        if (config.ctiApiKey) {
            this.cti = new CrowdSecCTI(config.ctiApiKey);
        }

        if (config.lapiUrl && config.apiKey) {
            this.lapi = new CrowdSecLAPI(config.lapiUrl, config.apiKey);
        }
    }

    /**
     * Check IP reputation using all available sources
     */
    async checkIP(ip: string): Promise<{
        isBlocked: boolean;
        riskScore: number;
        behaviors: string[];
        decisions: CrowdSecDecision[];
        country?: string;
        asn?: string;
    }> {
        if (!this.enabled) {
            return {
                isBlocked: false,
                riskScore: 0,
                behaviors: [],
                decisions: [],
            };
        }

        const results = {
            isBlocked: false,
            riskScore: 0,
            behaviors: [] as string[],
            decisions: [] as CrowdSecDecision[],
            country: undefined as string | undefined,
            asn: undefined as string | undefined,
        };

        // Check LAPI for active decisions
        if (this.lapi) {
            results.decisions = await this.lapi.getDecisions(ip);
            results.isBlocked = results.decisions.some(d => d.type === 'ban');
        }

        // Check CTI for reputation
        if (this.cti) {
            const ctiData = await this.cti.lookupIP(ip);
            if (ctiData) {
                results.riskScore = this.cti.getRiskScore(ctiData);
                results.behaviors = this.cti.getBehaviors(ctiData);
                results.country = ctiData.country;
                results.asn = ctiData.as_name;
            }
        }

        return results;
    }

    /**
     * Report an attack for collaborative blocking
     */
    async reportAttack(ip: string, scenario: string, details: string): Promise<boolean> {
        if (!this.lapi) return false;

        return this.lapi.reportSignal({
            ip,
            scenario: `vajra/${scenario}`,
            message: details,
            source: 'vajra-shield',
        });
    }
}

// Factory function
export function createCrowdSecIntegration(): CrowdSecIntegration {
    const config: CrowdSecConfig = {
        enabled: !!process.env.CROWDSEC_CTI_API_KEY || !!process.env.CROWDSEC_LAPI_URL,
        ctiApiKey: process.env.CROWDSEC_CTI_API_KEY,
        lapiUrl: process.env.CROWDSEC_LAPI_URL,
        apiKey: process.env.CROWDSEC_API_KEY,
    };

    return new CrowdSecIntegration(config);
}

// Export singleton
export const crowdsec = createCrowdSecIntegration();
