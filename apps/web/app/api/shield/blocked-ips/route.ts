import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/security/rate-limit'
import { supabaseAdmin as supabase } from '@/lib/supabase/server'

/**
 * Blocked IPs API
 * GET /api/shield/blocked-ips - List blocked IPs
 * POST /api/shield/blocked-ips - Block an IP
 * DELETE /api/shield/blocked-ips/[id] - Unblock an IP
 */

export async function GET(request: NextRequest) {
    try {
        const { allowed, headers: rateLimitHeaders } = await rateLimit(request, 'api')
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: rateLimitHeaders }
            )
        }

        const searchParams = request.nextUrl.searchParams
        const workspaceId = searchParams.get('workspaceId')

        if (!workspaceId) {
            return NextResponse.json(
                { error: 'Missing workspaceId parameter' },
                { status: 400 }
            )
        }


        const { data: blockedIPs, error } = await supabase
            .from('blocked_ips')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('blocked_at', { ascending: false })

        if (error) {
            throw error
        }

        return NextResponse.json({
            success: true,
            data: blockedIPs || [],
        }, {
            headers: rateLimitHeaders
        })
    } catch (error) {
        console.error('Error fetching blocked IPs:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const { allowed, headers: rateLimitHeaders } = await rateLimit(request, 'mutation')
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: rateLimitHeaders }
            )
        }

        const body = await request.json()
        const { workspaceId, ipAddress, reason, isPermanent, expiresAt } = body

        if (!workspaceId || !ipAddress || !reason) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }


        const { data, error } = await supabase
            .from('blocked_ips')
            .insert({
                workspace_id: workspaceId,
                ip_address: ipAddress,
                reason,
                is_permanent: isPermanent || false,
                expires_at: expiresAt || null,
            })
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({
            success: true,
            data,
            message: 'IP blocked successfully',
        }, {
            headers: rateLimitHeaders
        })
    } catch (error) {
        console.error('Error blocking IP:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { allowed, headers: rateLimitHeaders } = await rateLimit(request, 'mutation')
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: rateLimitHeaders }
            )
        }

        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'Missing id parameter' },
                { status: 400 }
            )
        }


        const { error } = await supabase
            .from('blocked_ips')
            .delete()
            .eq('id', id)

        if (error) {
            throw error
        }

        return NextResponse.json({
            success: true,
            message: 'IP unblocked successfully',
        }, {
            headers: rateLimitHeaders
        })
    } catch (error) {
        console.error('Error unblocking IP:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
