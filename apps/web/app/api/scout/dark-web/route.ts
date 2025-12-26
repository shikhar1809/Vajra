import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simulated dark web breach database
const KNOWN_BREACHES = [
    { name: 'LinkedIn 2021', records: 700000000, date: '2021-06-22', severity: 'high' },
    { name: 'Facebook 2019', records: 533000000, date: '2019-04-03', severity: 'critical' },
    { name: 'Yahoo 2013', records: 3000000000, date: '2013-08-01', severity: 'critical' },
    { name: 'Adobe 2013', records: 153000000, date: '2013-10-04', severity: 'high' },
    { name: 'Dropbox 2012', records: 68000000, date: '2012-07-01', severity: 'medium' },
];

interface BreachResult {
    domain: string;
    breaches: Array<{
        name: string;
        date: string;
        records: number;
        severity: 'low' | 'medium' | 'high' | 'critical';
        dataTypes: string[];
        description: string;
    }>;
    totalBreaches: number;
    totalRecords: number;
    riskScore: number;
}

// POST - Check domain for dark web breaches
export async function POST(request: Request) {
    try {
        const { domain } = await request.json();

        if (!domain) {
            return NextResponse.json(
                { success: false, error: 'Domain is required' },
                { status: 400 }
            );
        }

        console.log(`[Dark Web Monitor] Checking domain: ${domain}`);

        // Simulate dark web check (in production, use actual breach APIs like HaveIBeenPwned)
        const breaches = KNOWN_BREACHES
            .filter(() => Math.random() > 0.6) // 40% chance of being in breach
            .map(breach => ({
                name: breach.name,
                date: breach.date,
                records: breach.records,
                severity: breach.severity as 'low' | 'medium' | 'high' | 'critical',
                dataTypes: ['emails', 'passwords', 'names', 'phone numbers'],
                description: `Data breach affecting ${breach.records.toLocaleString()} records`,
            }));

        const totalRecords = breaches.reduce((sum, b) => sum + b.records, 0);
        const riskScore = Math.min(100, breaches.length * 20 + (totalRecords > 1000000 ? 20 : 0));

        const result: BreachResult = {
            domain,
            breaches,
            totalBreaches: breaches.length,
            totalRecords,
            riskScore,
        };

        // Save to database
        const { error: dbError } = await supabase
            .from('vendors')
            .update({
                security_score: Math.max(0, 100 - riskScore),
                last_assessment: new Date().toISOString(),
            })
            .eq('domain', domain);

        if (dbError) {
            console.error('Error updating vendor:', dbError);
        }

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Dark web monitoring error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to check dark web' },
            { status: 500 }
        );
    }
}

// GET - Get recent dark web monitoring results
export async function GET() {
    try {
        // In production, fetch from a dark_web_monitoring table
        // For now, return sample data
        return NextResponse.json({
            success: true,
            data: {
                recentScans: [
                    {
                        domain: 'example.com',
                        scannedAt: new Date().toISOString(),
                        breaches: 2,
                        riskScore: 45,
                    },
                ],
            },
        });
    } catch (error) {
        console.error('Dark web GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch scans' },
            { status: 500 }
        );
    }
}
