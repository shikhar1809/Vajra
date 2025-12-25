/**
 * API Route: Sentry Employee Leaderboard
 * Returns employee security scores and rankings
 */

import { NextResponse } from 'next/server';
import { employeeScores } from '@/lib/sentry/employee-scoring';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const department = searchParams.get('department');
        const limit = parseInt(searchParams.get('limit') || '10');

        const leaderboard = employeeScores.getLeaderboard({
            department: department || undefined,
            limit,
        });

        const companyStats = employeeScores.getCompanyStats();

        return NextResponse.json({
            leaderboard,
            companyStats,
        });
    } catch (error) {
        console.error('[Sentry API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
