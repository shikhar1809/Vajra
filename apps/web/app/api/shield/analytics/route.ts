import { NextRequest, NextResponse } from 'next/server'
import { calculateAnalytics } from '@/lib/shield/analytics'
import { rateLimit } from '@/lib/security/rate-limit'
import { getSupabaseClient } from '@/lib/supabase/client'

/**
 * Traffic Analytics API
 * GET /api/shield/analytics?workspaceId=xxx&timeRange=24h
 */
export async function GET(request: NextRequest) {
    try {
        // Rate limiting
        const { allowed, headers: rateLimitHeaders } = await rateLimit(request, 'api')
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: rateLimitHeaders }
            )
        }

        const searchParams = request.nextUrl.searchParams
        const workspaceId = searchParams.get('workspaceId')
        const timeRange = (searchParams.get('timeRange') || '24h') as '1h' | '24h' | '7d' | '30d'

        if (!workspaceId) {
            return NextResponse.json(
                { error: 'Missing required parameter: workspaceId' },
                { status: 400 }
            )
        }

        // Verify user has access to workspace
        const supabase = getSupabaseClient()
        const { data: workspace, error } = await supabase
            .from('workspaces')
            .select('id')
            .eq('id', workspaceId)
            .single()

        if (error || !workspace) {
            return NextResponse.json(
                { error: 'Workspace not found or access denied' },
                { status: 404 }
            )
        }

        // Calculate analytics
        const analytics = await calculateAnalytics(workspaceId, timeRange)

        return NextResponse.json({
            success: true,
            data: analytics,
        }, {
            headers: rateLimitHeaders
        })
    } catch (error) {
        console.error('Analytics calculation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
