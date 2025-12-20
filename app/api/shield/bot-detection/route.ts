import { NextRequest, NextResponse } from 'next/server'
import { detectBot } from '@/lib/shield/bot-detection'
import { rateLimit } from '@/lib/security/rate-limit'

/**
 * Bot Detection API
 * POST /api/shield/bot-detection
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const { allowed, headers: rateLimitHeaders } = await rateLimit(request, 'api')
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: rateLimitHeaders }
            )
        }

        const body = await request.json()
        const { userAgent, ip, headers, path, method } = body

        if (!userAgent || !ip) {
            return NextResponse.json(
                { error: 'Missing required fields: userAgent, ip' },
                { status: 400 }
            )
        }

        // Detect bot
        const result = await detectBot({
            userAgent,
            ip,
            headers: headers || {},
            path: path || '/',
            method: method || 'GET',
        })

        return NextResponse.json({
            success: true,
            data: result,
        }, {
            headers: rateLimitHeaders
        })
    } catch (error) {
        console.error('Bot detection error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
