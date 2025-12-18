import { NextResponse } from 'next/server';
import { vulnerabilityScanner } from '@/lib/agenios/vulnerability-scanner';

export async function POST(request: Request) {
    try {
        const { targetURL, scanType } = await request.json();

        if (!targetURL) {
            return NextResponse.json(
                { success: false, error: 'Target URL is required' },
                { status: 400 }
            );
        }

        console.log(`[API] Starting ${scanType || 'standard'} scan on: ${targetURL}`);

        // Perform vulnerability scan
        const scanResult = await vulnerabilityScanner.scan(targetURL, scanType || 'standard');

        // Generate report
        const report = vulnerabilityScanner.generateReport(scanResult);

        return NextResponse.json({
            success: true,
            data: {
                scan: scanResult,
                report,
            },
        });
    } catch (error) {
        console.error('Vulnerability scan error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to perform scan' },
            { status: 500 }
        );
    }
}

export async function GET() {
    // Return mock scan history for testing
    return NextResponse.json({
        success: true,
        data: {
            scans: [
                {
                    id: '1',
                    targetURL: 'https://example-ecommerce.com',
                    scanType: 'comprehensive',
                    status: 'completed',
                    securityScore: 82,
                    vulnerabilitiesFound: 5,
                    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                },
                {
                    id: '2',
                    targetURL: 'https://customer-portal.example.com',
                    scanType: 'standard',
                    status: 'completed',
                    securityScore: 75,
                    vulnerabilitiesFound: 8,
                    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                },
            ],
        },
    });
}
