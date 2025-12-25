"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVajraShield = createVajraShield;
exports.vajraProtect = vajraProtect;
const server_1 = require("next/server");
const client_1 = require("./client");
/**
 * Create Vajra Shield middleware for Next.js
 */
function createVajraShield(config) {
    const client = new client_1.VajraClient(config);
    return async function middleware(request) {
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || '';
        const path = request.nextUrl.pathname;
        // Skip whitelisted IPs
        if (client.isWhitelisted(ip)) {
            return server_1.NextResponse.next();
        }
        // Skip whitelisted paths
        if (client.isPathWhitelisted(path)) {
            return server_1.NextResponse.next();
        }
        try {
            // Log traffic
            await client.logTraffic({
                ip_address: ip,
                user_agent: userAgent,
                request_path: path,
                request_method: request.method,
            });
            // Check bot score if enabled
            if (config.enableBotDetection) {
                const botScore = await client.getBotScore(ip);
                // Trigger bunker mode if threshold exceeded
                if (config.enableBunkerMode && botScore > (config.bunkerModeThreshold || 80)) {
                    const challenge = await client.generateChallenge();
                    // Return challenge page
                    return new server_1.NextResponse(JSON.stringify({
                        error: 'Verification Required',
                        message: 'Please complete the security challenge',
                        challenge,
                    }), {
                        status: 403,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                }
            }
            return server_1.NextResponse.next();
        }
        catch (error) {
            console.error('[Vajra Shield] Error:', error);
            // Fail open - allow request if Shield is down
            return server_1.NextResponse.next();
        }
    };
}
/**
 * Protect individual API route
 */
function vajraProtect(handler, config) {
    return async function protectedHandler(req, res) {
        const fullConfig = {
            apiKey: process.env.VAJRA_API_KEY,
            workspaceId: process.env.VAJRA_WORKSPACE_ID,
            ...config,
        };
        const client = new client_1.VajraClient(fullConfig);
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        try {
            // Log traffic
            await client.logTraffic({
                ip_address: ip,
                user_agent: req.headers['user-agent'],
                request_path: req.url,
                request_method: req.method,
            });
            // Check bot score
            const botScore = await client.getBotScore(ip);
            if (botScore > (fullConfig.bunkerModeThreshold || 80)) {
                const challenge = await client.generateChallenge();
                return res.status(403).json({
                    error: 'Verification Required',
                    challenge,
                });
            }
            // Continue to handler
            return await handler(req, res);
        }
        catch (error) {
            console.error('[Vajra Shield] Error:', error);
            return await handler(req, res);
        }
    };
}
