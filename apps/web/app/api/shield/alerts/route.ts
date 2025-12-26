import { NextRequest, NextResponse } from 'next/server'
import { sendAlert } from '@/lib/shield/alerts'
import { rateLimit } from '@/lib/security/rate-limit'
import { supabaseAdmin as supabase } from '@/lib/supabase/server'

/**
 * Alerts API
 * POST /api/shield/alerts - Send alert
 * GET /api/shield/alerts - Get recent alerts
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
        const { workspaceId, alertType, severity, title, message, metadata } = body

        if (!workspaceId || !alertType || !severity || !title || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Send alert
        await sendAlert({
            workspaceId,
            alertType,
            severity,
            title,
            message,
            metadata,
        })

        // Log alert to database
        await supabase.from('alert_logs').insert({
            workspace_id: workspaceId,
            alert_type: alertType,
            severity,
            title,
            message,
            metadata,
        })

        return NextResponse.json({
            success: true,
            message: 'Alert sent successfully',
        }, {
            headers: rateLimitHeaders
        })
    } catch (error) {
        console.error('Alert sending error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

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

        // Get recent alerts
        const { data: alerts, error } = await supabase
            .from('alert_logs')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            throw error
        }

        return NextResponse.json({
            success: true,
            data: alerts || [],
        }, {
            headers: rateLimitHeaders
        })
    } catch (error) {
        console.error('Error fetching alerts:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
