/**
 * API Route: Aegis Code Scanning
 * Triggers security scans on codebase
 */

import { NextResponse } from 'next/server';
import { createScanner } from '@/lib/aegis/code-scanner';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { projectPath, scanType, aiEnhanced } = body;

        const scanner = createScanner(projectPath);
        const result = await scanner.scan({
            scanType: scanType || 'full',
            aiEnhanced: aiEnhanced !== false,
        });

        return NextResponse.json({
            success: true,
            result,
        });
    } catch (error) {
        console.error('[Aegis API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to scan project' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Return mock scan history for now
        return NextResponse.json({
            scans: [
                {
                    id: '1',
                    scanType: 'full',
                    startTime: new Date(Date.now() - 3600000),
                    securityScore: 75,
                    summary: {
                        totalFiles: 150,
                        totalIssues: 12,
                        critical: 1,
                        high: 3,
                        medium: 5,
                        low: 3,
                    },
                },
            ],
        });
    } catch (error) {
        console.error('[Aegis API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch scans' },
            { status: 500 }
        );
    }
}
