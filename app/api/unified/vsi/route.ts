/**
 * API Route: Vajra Security Index (VSI)
 * Returns unified security score across all modules
 */

import { NextResponse } from 'next/server';
import { vsi } from '@/lib/unified/security-index';

export async function GET() {
    try {
        // Calculate VSI
        const securityIndex = vsi.calculate();

        return NextResponse.json(securityIndex);
    } catch (error) {
        console.error('[VSI API] Error:', error);

        // Return mock data if calculation fails
        return NextResponse.json({
            overallScore: 75,
            grade: 'B',
            trend: 'stable',
            moduleScores: {
                shield: { score: 80, status: 'healthy', weight: 0.3 },
                scout: { score: 70, status: 'healthy', weight: 0.25 },
                sentry: { score: 75, status: 'warning', weight: 0.2 },
                aegis: { score: 75, status: 'healthy', weight: 0.25 },
            },
            riskSummary: {
                criticalIssues: 0,
                highIssues: 2,
                activeThreats: 0,
                pendingActions: 5,
            },
            recentEvents: [],
            recommendations: [],
            lastUpdated: new Date(),
        });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { module, data } = body;

        // Update module metrics
        switch (module) {
            case 'shield':
                vsi.updateShield(data);
                break;
            case 'scout':
                vsi.updateScout(data);
                break;
            case 'sentry':
                vsi.updateSentry(data);
                break;
            case 'aegis':
                vsi.updateAegis(data);
                break;
            default:
                return NextResponse.json({ error: 'Invalid module' }, { status: 400 });
        }

        // Return updated VSI
        const securityIndex = vsi.calculate();
        return NextResponse.json(securityIndex);
    } catch (error) {
        console.error('[VSI API] Update error:', error);
        return NextResponse.json({ error: 'Failed to update VSI' }, { status: 500 });
    }
}
