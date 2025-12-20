"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vajraShield = vajraShield;
const client_1 = require("./client");
/**
 * Create Vajra Shield middleware for Express
 */
function vajraShield(config) {
    const client = new client_1.VajraClient(config);
    return async function middleware(req, res, next) {
        const ip = req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || '';
        const path = req.path;
        // Skip whitelisted IPs
        if (client.isWhitelisted(ip)) {
            return next();
        }
        // Skip whitelisted paths
        if (client.isPathWhitelisted(path)) {
            return next();
        }
        try {
            // Log traffic
            await client.logTraffic({
                ip_address: ip,
                user_agent: userAgent,
                request_path: path,
                request_method: req.method,
            });
            // Check bot score if enabled
            if (config.enableBotDetection) {
                const botScore = await client.getBotScore(ip);
                // Trigger bunker mode if threshold exceeded
                if (config.enableBunkerMode && botScore > (config.bunkerModeThreshold || 80)) {
                    const challenge = await client.generateChallenge();
                    return res.status(403).json({
                        error: 'Verification Required',
                        message: 'Please complete the security challenge',
                        challenge,
                    });
                }
            }
            next();
        }
        catch (error) {
            console.error('[Vajra Shield] Error:', error);
            // Fail open - allow request if Shield is down
            next();
        }
    };
}
