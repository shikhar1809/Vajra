import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/security/rate-limit'
import type { FirewallRule } from '@/lib/shield/rules-engine'

/**
 * Firewall Rules API
 * GET /api/shield/rules?workspaceId=xxx - List rules
 * POST /api/shield/rules - Create rule
 * PUT /api/shield/rules - Update rule
 * DELETE /api/shield/rules?id=xxx - Delete rule
 */

export async function GET(request: NextRequest) {
    try {
        const { allowed, headers: rateLimitHeaders } = await rateLimit(request, 'api')
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
        }

        const searchParams = request.nextUrl.searchParams
        const workspaceId = searchParams.get('workspaceId')

        if (!workspaceId) {
            return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 })
        }


        const { data: rules, error } = await supabase
            .from('firewall_rules')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('priority', { ascending: false })

        if (error) throw error

        return NextResponse.json({ rules: rules || [] }, { headers: rateLimitHeaders })
    } catch (error) {
        console.error('Error fetching rules:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { allowed, headers: rateLimitHeaders } = await rateLimit(request, 'api')
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
        }

        const body = await request.json()
        const { workspaceId, rule } = body

        if (!workspaceId || !rule) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }


        const { data, error } = await supabase
            .from('firewall_rules')
            .insert({
                workspace_id: workspaceId,
                name: rule.name,
                enabled: rule.enabled,
                priority: rule.priority,
                conditions: rule.conditions,
                action: rule.action,
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ rule: data }, { headers: rateLimitHeaders })
    } catch (error) {
        console.error('Error creating rule:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { allowed, headers: rateLimitHeaders } = await rateLimit(request, 'api')
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
        }

        const body = await request.json()
        const { id, rule } = body

        if (!id || !rule) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }


        const { data, error } = await supabase
            .from('firewall_rules')
            .update({
                name: rule.name,
                enabled: rule.enabled,
                priority: rule.priority,
                conditions: rule.conditions,
                action: rule.action,
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ rule: data }, { headers: rateLimitHeaders })
    } catch (error) {
        console.error('Error updating rule:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { allowed, headers: rateLimitHeaders } = await rateLimit(request, 'api')
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
        }

        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 })
        }


        const { error } = await supabase
            .from('firewall_rules')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true }, { headers: rateLimitHeaders })
    } catch (error) {
        console.error('Error deleting rule:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
