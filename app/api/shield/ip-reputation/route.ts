import { NextRequest, NextResponse } from 'next/server'
import { checkIPReputation } from '@/lib/shield/ip-reputation'
import { rateLimit } from '@/lib/security/rate-limit'

/**
 * IP Reputation API
 * POST /api/shield/ip-reputation
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
        const { ip } = body

        if (!ip) {
            return NextResponse.json(
                { error: 'Missing required field: ip' },
                { status: 400 }
            )
        }

        // Check IP reputation
        const reputation = await checkIPReputation(ip)

        return NextResponse.json({
            success: true,
            data: reputation,
        }, {
            headers: rateLimitHeaders
        })
    } catch (error) {
        console.error('IP reputation check error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
