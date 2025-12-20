"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VajraClient = void 0;
class VajraClient {
    constructor(config) {
        this.config = {
            enableBotDetection: true,
            enableBunkerMode: true,
            enableAnomalyDetection: true,
            bunkerModeThreshold: 80,
            logLevel: 'info',
            apiUrl: 'https://vajra-3l9tfhw8x-royalshikher-4385s-projects.vercel.app',
            ...config,
        };
        this.baseUrl = this.config.apiUrl;
    }
    /**
     * Log traffic to Vajra Shield
     */
    async logTraffic(data) {
        try {
            const response = await fetch(`${this.baseUrl}/api/shield/traffic`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
                body: JSON.stringify({
                    workspaceId: this.config.workspaceId,
                    ...data,
                }),
            });
            if (!response.ok) {
                throw new Error(`Failed to log traffic: ${response.statusText}`);
            }
            this.log('info', `Traffic logged for IP: ${data.ip_address}`);
        }
        catch (error) {
            this.log('error', `Error logging traffic: ${error}`);
            throw error;
        }
    }
    /**
     * Get bot score for an IP address
     */
    async getBotScore(ip) {
        try {
            const response = await fetch(`${this.baseUrl}/api/shield/traffic?workspaceId=${this.config.workspaceId}&ip=${ip}`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to get bot score: ${response.statusText}`);
            }
            const data = await response.json();
            const botScore = data.data?.traffic?.[0]?.bot_score || 0;
            if (botScore > this.config.bunkerModeThreshold && this.config.onBotDetected) {
                this.config.onBotDetected({
                    ip,
                    botScore,
                    userAgent: data.data?.traffic?.[0]?.user_agent || '',
                    timestamp: new Date().toISOString(),
                });
            }
            return botScore;
        }
        catch (error) {
            this.log('error', `Error getting bot score: ${error}`);
            return 0;
        }
    }
    /**
     * Generate bunker mode challenge
     */
    async generateChallenge() {
        try {
            const response = await fetch(`${this.baseUrl}/api/shield/bunker`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to generate challenge: ${response.statusText}`);
            }
            const data = await response.json();
            if (this.config.onBunkerModeTriggered) {
                this.config.onBunkerModeTriggered(data.data);
            }
            return data.data;
        }
        catch (error) {
            this.log('error', `Error generating challenge: ${error}`);
            throw error;
        }
    }
    /**
     * Verify bunker mode challenge answer
     */
    async verifyChallenge(challengeId, answer) {
        try {
            const response = await fetch(`${this.baseUrl}/api/shield/bunker`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
                body: JSON.stringify({
                    challengeId,
                    answer,
                }),
            });
            if (!response.ok) {
                return false;
            }
            const data = await response.json();
            return data.success && data.data.correct;
        }
        catch (error) {
            this.log('error', `Error verifying challenge: ${error}`);
            return false;
        }
    }
    /**
     * Check if IP is whitelisted
     */
    isWhitelisted(ip) {
        return this.config.whitelistedIPs?.includes(ip) || false;
    }
    /**
     * Check if path is whitelisted
     */
    isPathWhitelisted(path) {
        if (!this.config.whitelistedPaths)
            return false;
        return this.config.whitelistedPaths.some(pattern => {
            const regex = new RegExp(pattern.replace('*', '.*'));
            return regex.test(path);
        });
    }
    /**
     * Internal logging
     */
    log(level, message) {
        const levels = ['debug', 'info', 'warn', 'error'];
        const configLevel = this.config.logLevel || 'info';
        if (levels.indexOf(level) >= levels.indexOf(configLevel)) {
            console.log(`[Vajra Shield ${level.toUpperCase()}]`, message);
        }
    }
}
exports.VajraClient = VajraClient;
