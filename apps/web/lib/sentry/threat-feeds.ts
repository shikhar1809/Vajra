/**
 * Threat Feed Integration for Vajra Sentry
 * Aggregates malware intelligence from multiple free sources
 */

export interface MalwareHash {
    hash: string;
    hash_type: 'sha256' | 'md5' | 'sha1';
    malware_family?: string;
    file_type?: string;
    tags?: string[];
    threat_level: number; // 1-10
    source: 'malwarebazaar' | 'threatfox' | 'urlhaus' | 'circl' | 'alienvault';
    first_seen: Date;
    last_updated: Date;
}

export interface MaliciousURL {
    url: string;
    url_status: 'online' | 'offline' | 'unknown';
    threat_type: 'malware' | 'phishing' | 'c2' | 'exploit';
    tags?: string[];
    source: string;
    first_seen: Date;
    last_updated: Date;
}

export interface C2Server {
    ip_address: string;
    port?: number;
    malware_family?: string;
    confidence: number; // 0-100
    source: string;
    first_seen: Date;
    last_updated: Date;
}

export interface ThreatFeedUpdate {
    source: string;
    records_added: number;
    records_updated: number;
    status: 'success' | 'failed' | 'partial';
    error_message?: string;
    updated_at: Date;
}

/**
 * MalwareBazaar API Client
 * https://bazaar.abuse.ch/api/
 */
export class MalwareBazaarClient {
    private apiKey: string;
    private baseUrl = 'https://mb-api.abuse.ch/api/v1/';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Get recent malware samples
     */
    async getRecentSamples(limit: number = 100): Promise<any> {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'API-KEY': this.apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                query: 'get_recent',
                selector: limit.toString(),
            }),
        });

        if (!response.ok) {
            throw new Error(`MalwareBazaar API error: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Query hash
     */
    async queryHash(hash: string): Promise<any> {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'API-KEY': this.apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                query: 'get_info',
                hash: hash,
            }),
        });

        if (!response.ok) {
            throw new Error(`MalwareBazaar API error: ${response.statusText}`);
        }

        return response.json();
    }
}

/**
 * ThreatFox API Client
 * https://threatfox-api.abuse.ch/api/v1/
 */
export class ThreatFoxClient {
    private baseUrl = 'https://threatfox-api.abuse.ch/api/v1/';

    /**
     * Get recent IoCs
     */
    async getRecentIoCs(days: number = 1): Promise<any> {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: 'get_iocs',
                days: days,
            }),
        });

        if (!response.ok) {
            throw new Error(`ThreatFox API error: ${response.statusText}`);
        }

        return response.json();
    }
}

/**
 * URLhaus API Client
 * https://urlhaus-api.abuse.ch/v1/
 */
export class URLhausClient {
    private baseUrl = 'https://urlhaus-api.abuse.ch/v1/';

    /**
     * Get recent URLs
     */
    async getRecentURLs(limit: number = 100): Promise<any> {
        const response = await fetch(`${this.baseUrl}urls/recent/limit/${limit}/`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`URLhaus API error: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Query URL
     */
    async queryURL(url: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}url/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                url: url,
            }),
        });

        if (!response.ok) {
            throw new Error(`URLhaus API error: ${response.statusText}`);
        }

        return response.json();
    }
}

/**
 * CIRCL hashlookup Client
 * https://hashlookup.circl.lu/
 */
export class CIRCLClient {
    private baseUrl = 'https://hashlookup.circl.lu/';

    /**
     * Lookup hash
     */
    async lookupHash(hash: string, hashType: 'sha256' | 'md5' | 'sha1' = 'sha256'): Promise<any> {
        const response = await fetch(`${this.baseUrl}lookup/${hashType}/${hash}`, {
            method: 'GET',
        });

        if (response.status === 404) {
            return null; // Hash not found
        }

        if (!response.ok) {
            throw new Error(`CIRCL API error: ${response.statusText}`);
        }

        return response.json();
    }
}

/**
 * Threat Feed Aggregator
 * Combines data from all sources
 */
export class ThreatFeedAggregator {
    private malwareBazaar: MalwareBazaarClient;
    private threatFox: ThreatFoxClient;
    private urlhaus: URLhausClient;
    private circl: CIRCLClient;

    constructor(malwareBazaarApiKey: string) {
        this.malwareBazaar = new MalwareBazaarClient(malwareBazaarApiKey);
        this.threatFox = new ThreatFoxClient();
        this.urlhaus = new URLhausClient();
        this.circl = new CIRCLClient();
    }

    /**
     * Fetch latest threat intelligence from all sources
     */
    async fetchAllFeeds(): Promise<{
        malwareHashes: MalwareHash[];
        maliciousURLs: MaliciousURL[];
        c2Servers: C2Server[];
    }> {
        const [mbData, tfData, uhData] = await Promise.allSettled([
            this.malwareBazaar.getRecentSamples(100),
            this.threatFox.getRecentIoCs(1),
            this.urlhaus.getRecentURLs(100),
        ]);

        const malwareHashes: MalwareHash[] = [];
        const maliciousURLs: MaliciousURL[] = [];
        const c2Servers: C2Server[] = [];

        // Process MalwareBazaar data
        if (mbData.status === 'fulfilled' && mbData.value.query_status === 'ok') {
            for (const sample of mbData.value.data || []) {
                malwareHashes.push({
                    hash: sample.sha256_hash,
                    hash_type: 'sha256',
                    malware_family: sample.signature,
                    file_type: sample.file_type,
                    tags: sample.tags || [],
                    threat_level: this.calculateThreatLevel(sample),
                    source: 'malwarebazaar',
                    first_seen: new Date(sample.first_seen),
                    last_updated: new Date(),
                });
            }
        }

        // Process ThreatFox data
        if (tfData.status === 'fulfilled' && tfData.value.query_status === 'ok') {
            for (const ioc of tfData.value.data || []) {
                if (ioc.ioc_type === 'url') {
                    maliciousURLs.push({
                        url: ioc.ioc,
                        url_status: 'online',
                        threat_type: 'c2',
                        tags: ioc.tags || [],
                        source: 'threatfox',
                        first_seen: new Date(ioc.first_seen),
                        last_updated: new Date(),
                    });
                } else if (ioc.ioc_type === 'ip:port') {
                    const [ip, port] = ioc.ioc.split(':');
                    c2Servers.push({
                        ip_address: ip,
                        port: port ? parseInt(port) : undefined,
                        malware_family: ioc.malware,
                        confidence: ioc.confidence_level || 50,
                        source: 'threatfox',
                        first_seen: new Date(ioc.first_seen),
                        last_updated: new Date(),
                    });
                }
            }
        }

        // Process URLhaus data
        if (uhData.status === 'fulfilled' && uhData.value.query_status === 'ok') {
            for (const urlData of uhData.value.urls || []) {
                maliciousURLs.push({
                    url: urlData.url,
                    url_status: urlData.url_status,
                    threat_type: urlData.threat === 'malware_download' ? 'malware' : 'phishing',
                    tags: urlData.tags || [],
                    source: 'urlhaus',
                    first_seen: new Date(urlData.dateadded),
                    last_updated: new Date(),
                });
            }
        }

        return { malwareHashes, maliciousURLs, c2Servers };
    }

    /**
     * Check if a hash is malicious
     */
    async checkHash(hash: string): Promise<{ isMalicious: boolean; details?: any }> {
        try {
            const mbResult = await this.malwareBazaar.queryHash(hash);
            if (mbResult.query_status === 'ok') {
                return { isMalicious: true, details: mbResult.data[0] };
            }

            const circlResult = await this.circl.lookupHash(hash);
            if (circlResult) {
                return { isMalicious: false, details: circlResult }; // Known good file
            }

            return { isMalicious: false };
        } catch (error) {
            console.error('Error checking hash:', error);
            return { isMalicious: false };
        }
    }

    /**
     * Calculate threat level (1-10) based on malware characteristics
     */
    private calculateThreatLevel(sample: any): number {
        let level = 5; // Default medium threat

        // Increase for ransomware
        if (sample.signature?.toLowerCase().includes('ransom')) level += 3;

        // Increase for trojans
        if (sample.signature?.toLowerCase().includes('trojan')) level += 2;

        // Increase for recent samples
        const daysSinceFirstSeen = (Date.now() - new Date(sample.first_seen).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceFirstSeen < 7) level += 1;

        return Math.min(10, Math.max(1, level));
    }
}
