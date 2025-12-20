import { VajraClient } from './client';
import { VajraShieldConfig } from './types';

/**
 * Create Vajra Shield middleware for Express
 */
export function vajraShield(config: VajraShieldConfig) {
    const client = new VajraClient(config);

    return async function middleware(req: any, res: any, next: any) {
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
        } catch (error) {
            console.error('[Vajra Shield] Error:', error);
            // Fail open - allow request if Shield is down
            next();
        }
    };
}
