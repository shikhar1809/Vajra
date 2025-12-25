/**
 * API Route: Scout Vendor Scanning
 * Triggers vendor security scans
 */

import { NextResponse } from 'next/server';
import { vendorRiskScorer } from '@/lib/scout/enhanced-risk-scoring';
import { vendorMonitor } from '@/lib/scout/continuous-monitor';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { domain, vendorId, action } = body;

        if (action === 'scan') {
            // Perform immediate scan
            const result = await vendorRiskScorer.scoreVendor(vendorId || crypto.randomUUID(), domain);

            return NextResponse.json({
                success: true,
                result,
            });
        }

        if (action === 'monitor') {
            // Add to continuous monitoring
            const { name, dataAccessLevel, businessCriticality, scanInterval } = body;

            const monitoredVendor = await vendorMonitor.addVendor({
                id: vendorId || crypto.randomUUID(),
                domain,
                name,
                dataAccessLevel,
                businessCriticality,
                scanInterval,
            });

            return NextResponse.json({
                success: true,
                vendor: monitoredVendor,
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('[Scout API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to scan vendor' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');

        if (vendorId) {
            // Get specific vendor
            const vendor = vendorMonitor.getVendor(vendorId);
            return NextResponse.json({ vendor });
        }

        // Get all monitored vendors
        const vendors = vendorMonitor.getVendors();
        const summary = vendorMonitor.getPortfolioSummary();

        return NextResponse.json({
            vendors,
            summary,
        });
    } catch (error) {
        console.error('[Scout API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch vendors' },
            { status: 500 }
        );
    }
}
