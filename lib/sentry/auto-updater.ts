/**
 * Automatic Threat Intelligence Updater
 * Runs periodically to fetch latest threat data
 */

import { createClient } from '@supabase/supabase-js';
import { ThreatFeedAggregator, MalwareHash, MaliciousURL, C2Server } from './threat-feeds';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UpdateResult {
    source: string;
    recordsAdded: number;
    recordsUpdated: number;
    status: 'success' | 'failed' | 'partial';
    errorMessage?: string;
}

/**
 * Auto-updater class for threat intelligence
 */
export class ThreatIntelligenceUpdater {
    private aggregator: ThreatFeedAggregator;

    constructor() {
        const apiKey = process.env.MALWAREBAZAAR_API_KEY;
        if (!apiKey) {
            throw new Error('MALWAREBAZAAR_API_KEY environment variable is required');
        }
        this.aggregator = new ThreatFeedAggregator(apiKey);
    }

    /**
     * Update all threat feeds
     */
    async updateAllFeeds(): Promise<UpdateResult[]> {
        const results: UpdateResult[] = [];

        try {
            console.log('[ThreatUpdater] Starting threat intelligence update...');
            const { malwareHashes, maliciousURLs, c2Servers } = await this.aggregator.fetchAllFeeds();

            // Update malware hashes
            const hashResult = await this.updateMalwareHashes(malwareHashes);
            results.push(hashResult);

            // Update malicious URLs
            const urlResult = await this.updateMaliciousURLs(maliciousURLs);
            results.push(urlResult);

            // Update C2 servers
            const c2Result = await this.updateC2Servers(c2Servers);
            results.push(c2Result);

            // Log update results
            await this.logUpdateResults(results);

            console.log('[ThreatUpdater] Update completed successfully');
            return results;
        } catch (error) {
            console.error('[ThreatUpdater] Update failed:', error);
            const errorResult: UpdateResult = {
                source: 'all',
                recordsAdded: 0,
                recordsUpdated: 0,
                status: 'failed',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            };
            await this.logUpdateResults([errorResult]);
            return [errorResult];
        }
    }

    /**
     * Update malware hashes in database
     */
    private async updateMalwareHashes(hashes: MalwareHash[]): Promise<UpdateResult> {
        let added = 0;
        let updated = 0;

        try {
            for (const hash of hashes) {
                const { data: existing } = await supabase
                    .from('malware_hashes')
                    .select('hash')
                    .eq('hash', hash.hash)
                    .single();

                if (existing) {
                    // Update existing record
                    await supabase
                        .from('malware_hashes')
                        .update({
                            malware_family: hash.malware_family,
                            tags: hash.tags,
                            threat_level: hash.threat_level,
                            last_updated: new Date().toISOString(),
                        })
                        .eq('hash', hash.hash);
                    updated++;
                } else {
                    // Insert new record
                    await supabase.from('malware_hashes').insert({
                        hash: hash.hash,
                        hash_type: hash.hash_type,
                        malware_family: hash.malware_family,
                        file_type: hash.file_type,
                        tags: hash.tags,
                        threat_level: hash.threat_level,
                        source: hash.source,
                    });
                    added++;
                }
            }

            return {
                source: 'malware_hashes',
                recordsAdded: added,
                recordsUpdated: updated,
                status: 'success',
            };
        } catch (error) {
            return {
                source: 'malware_hashes',
                recordsAdded: added,
                recordsUpdated: updated,
                status: 'failed',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Update malicious URLs in database
     */
    private async updateMaliciousURLs(urls: MaliciousURL[]): Promise<UpdateResult> {
        let added = 0;
        let updated = 0;

        try {
            for (const urlData of urls) {
                const { data: existing } = await supabase
                    .from('malicious_urls')
                    .select('url')
                    .eq('url', urlData.url)
                    .single();

                if (existing) {
                    await supabase
                        .from('malicious_urls')
                        .update({
                            url_status: urlData.url_status,
                            tags: urlData.tags,
                            last_updated: new Date().toISOString(),
                        })
                        .eq('url', urlData.url);
                    updated++;
                } else {
                    await supabase.from('malicious_urls').insert({
                        url: urlData.url,
                        url_status: urlData.url_status,
                        threat_type: urlData.threat_type,
                        tags: urlData.tags,
                        source: urlData.source,
                    });
                    added++;
                }
            }

            return {
                source: 'malicious_urls',
                recordsAdded: added,
                recordsUpdated: updated,
                status: 'success',
            };
        } catch (error) {
            return {
                source: 'malicious_urls',
                recordsAdded: added,
                recordsUpdated: updated,
                status: 'failed',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Update C2 servers in database
     */
    private async updateC2Servers(servers: C2Server[]): Promise<UpdateResult> {
        let added = 0;
        let updated = 0;

        try {
            for (const server of servers) {
                const { data: existing } = await supabase
                    .from('c2_servers')
                    .select('ip_address')
                    .eq('ip_address', server.ip_address)
                    .single();

                if (existing) {
                    await supabase
                        .from('c2_servers')
                        .update({
                            malware_family: server.malware_family,
                            confidence: server.confidence,
                            last_updated: new Date().toISOString(),
                        })
                        .eq('ip_address', server.ip_address);
                    updated++;
                } else {
                    await supabase.from('c2_servers').insert({
                        ip_address: server.ip_address,
                        port: server.port,
                        malware_family: server.malware_family,
                        confidence: server.confidence,
                        source: server.source,
                    });
                    added++;
                }
            }

            return {
                source: 'c2_servers',
                recordsAdded: added,
                recordsUpdated: updated,
                status: 'success',
            };
        } catch (error) {
            return {
                source: 'c2_servers',
                recordsAdded: added,
                recordsUpdated: updated,
                status: 'failed',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Log update results to database
     */
    private async logUpdateResults(results: UpdateResult[]): Promise<void> {
        for (const result of results) {
            await supabase.from('threat_feed_updates').insert({
                source: result.source,
                records_added: result.recordsAdded,
                records_updated: result.recordsUpdated,
                status: result.status,
                error_message: result.errorMessage,
            });
        }
    }

    /**
     * Get update statistics
     */
    async getUpdateStats(days: number = 7): Promise<any> {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const { data, error } = await supabase
            .from('threat_feed_updates')
            .select('*')
            .gte('updated_at', since.toISOString())
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching update stats:', error);
            return null;
        }

        return {
            totalUpdates: data.length,
            successfulUpdates: data.filter(u => u.status === 'success').length,
            failedUpdates: data.filter(u => u.status === 'failed').length,
            totalRecordsAdded: data.reduce((sum, u) => sum + (u.records_added || 0), 0),
            totalRecordsUpdated: data.reduce((sum, u) => sum + (u.records_updated || 0), 0),
            recentUpdates: data.slice(0, 10),
        };
    }
}

/**
 * Run update (for manual execution or testing)
 */
export async function runThreatIntelligenceUpdate(): Promise<UpdateResult[]> {
    const updater = new ThreatIntelligenceUpdater();
    return await updater.updateAllFeeds();
}
