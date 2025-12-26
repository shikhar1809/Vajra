import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/security/rate-limit'
import {
    generateCSV,
    exportShieldTraffic,
    exportScoutVendors,
    exportSentryEmployees,
    exportAegisProjects,
} from '@/lib/export/csv-generator'

/**
 * Export API endpoint
 * GET /api/export/[module]?workspaceId=xxx&format=csv
 */

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ module: string }> }
) {
    const params = await context.params
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
        const format = searchParams.get('format') || 'csv'

        if (!workspaceId) {
            return NextResponse.json(
                { error: 'Missing workspaceId parameter' },
                { status: 400 }
            )
        }

        const module = params.module

        let csvData: any
        let filename: string

        // Export based on module
        switch (module) {
            case 'shield': {
                const { data: trafficLogs } = await supabase
                    .from('traffic_logs')
                    .select('*')
                    .eq('workspace_id', workspaceId)
                    .order('created_at', { ascending: false })
                    .limit(1000)

                csvData = exportShieldTraffic(trafficLogs || [])
                filename = `shield-traffic-${Date.now()}.csv`
                break
            }

            case 'scout': {
                const { data: vendors } = await supabase
                    .from('vendors')
                    .select('*')
                    .eq('workspace_id', workspaceId)
                    .order('security_score', { ascending: false })

                csvData = exportScoutVendors(vendors || [])
                filename = `scout-vendors-${Date.now()}.csv`
                break
            }

            case 'sentry': {
                const { data: employees } = await supabase
                    .from('employees')
                    .select('*')
                    .eq('workspace_id', workspaceId)
                    .order('security_score', { ascending: false })

                csvData = exportSentryEmployees(employees || [])
                filename = `sentry-employees-${Date.now()}.csv`
                break
            }

            case 'aegis': {
                const { data: projects } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('workspace_id', workspaceId)
                    .order('security_score', { ascending: false })

                csvData = exportAegisProjects(projects || [])
                filename = `aegis-projects-${Date.now()}.csv`
                break
            }

            default:
                return NextResponse.json(
                    { error: 'Invalid module' },
                    { status: 400 }
                )
        }

        // Generate CSV
        const csvContent = generateCSV(csvData)

        // Return CSV file
        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`,
                ...rateLimitHeaders,
            },
        })
    } catch (error) {
        console.error('Export error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
