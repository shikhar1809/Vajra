import { NextRequest, NextResponse } from 'next/server';
import { VajraClient } from './client';
import { VajraShieldConfig } from './types';

/**
 * Create Vajra Shield middleware for Next.js
 */
export function createVajraShield(config: VajraShieldConfig) {
    const client = new VajraClient(config);

    return async function middleware(request: NextRequest) {
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || '';
        const path = request.nextUrl.pathname;

        // Skip whitelisted IPs
        if (client.isWhitelisted(ip)) {
            return NextResponse.next();
        }

        // Skip whitelisted paths
        if (client.isPathWhitelisted(path)) {
            return NextResponse.next();
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
                    return new NextResponse(
                        JSON.stringify({
                            error: 'Verification Required',
                            message: 'Please complete the security challenge',
                            challenge,
                        }),
                        {
                            status: 403,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                }
            }

            return NextResponse.next();
        } catch (error) {
            console.error('[Vajra Shield] Error:', error);
            // Fail open - allow request if Shield is down
            return NextResponse.next();
        }
    };
}

/**
 * Protect individual API route
 */
export function vajraProtect(
    handler: (req: any, res: any) => Promise<any>,
    config?: Partial<VajraShieldConfig>
) {
    return async function protectedHandler(req: any, res: any) {
        const fullConfig: VajraShieldConfig = {
            apiKey: process.env.VAJRA_API_KEY!,
            workspaceId: process.env.VAJRA_WORKSPACE_ID!,
            ...config,
        };

        const client = new VajraClient(fullConfig);
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
        } catch (error) {
            console.error('[Vajra Shield] Error:', error);
            return await handler(req, res);
        }
    };
}
