import { NextResponse } from 'next/server';
import { runThreatIntelligenceUpdate } from '@/lib/sentry/auto-updater';

/**
 * Vercel Cron Job Endpoint
 * Automatically updates threat intelligence every 6 hours
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-threats",
 *     "schedule": "0 *\/6 * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
    try {
        // Verify cron secret (optional but recommended)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[Cron] Starting threat intelligence update...');
        const results = await runThreatIntelligenceUpdate();

        const summary = {
            timestamp: new Date().toISOString(),
            results: results.map(r => ({
                source: r.source,
                added: r.recordsAdded,
                updated: r.recordsUpdated,
                status: r.status,
            })),
            totalAdded: results.reduce((sum, r) => sum + r.recordsAdded, 0),
            totalUpdated: results.reduce((sum, r) => sum + r.recordsUpdated, 0),
        };

        console.log('[Cron] Update completed:', summary);

        return NextResponse.json({
            success: true,
            message: 'Threat intelligence updated successfully',
            ...summary,
        });
    } catch (error) {
        console.error('[Cron] Update failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// Allow POST as well for manual triggers
export async function POST(request: Request) {
    return GET(request);
}
