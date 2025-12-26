import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
import { vendorScanner } from '@/lib/scout/vendor-scanner';
import { riskEngine } from '@/lib/scout/risk-scoring';
import { validateData, vendorScanSchema } from '@/lib/validation';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

// GET - Fetch all vendors from database
export async function GET() {
    try {
        if (!supabase) return NextResponse.json({ success: true, data: { vendors: [] } });

        const { data: vendors, error } = await supabase
            .from('vendors')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching vendors:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                vendors: vendors || [],
            },
        });
    } catch (error) {
        console.error('Vendor GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch vendors' },
            { status: 500 }
        );
    }
}

// POST - Scan vendor and save to database
export async function POST(request: Request) {
    try {
        // Rate limiting
        const { success: rateLimitSuccess, remaining } = await rateLimit(request);
        if (!rateLimitSuccess) {
            return rateLimitResponse(remaining);
        }

        const body = await request.json();

        // Validate input
        const validation = validateData(vendorScanSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const { vendorId, domain } = validation.data;

        console.log(`[API] Scanning vendor: ${domain}`);

        // Perform security scan
        const scanResult = await vendorScanner.scanVendor(vendorId, domain);

        // Calculate risk assessment
        const riskAssessment = riskEngine.assessRisk({
            securityScore: scanResult.scores.overall,
            complianceScore: 75,
            reputationScore: 80,
            incidentHistory: {
                totalIncidents: 0,
                criticalIncidents: 0,
                resolvedIncidents: 0,
            },
            dataAccess: 'moderate',
            businessCriticality: 'medium',
        });

        // Generate recommendations
        const recommendations = vendorScanner.generateRecommendations(scanResult);

        // Save vendor to database
        let vendor;
        if (supabase) {
            const { data: v, error: vendorError } = await supabase
                .from('vendors')
                .upsert({
                    id: vendorId,
                    domain: domain,
                    security_score: scanResult.scores.overall,
                    status: 'active',
                    last_assessment: new Date().toISOString(),
                }, {
                    onConflict: 'domain'
                })
                .select()
                .single();

            if (vendorError) {
                console.error('Error saving vendor:', vendorError);
            }
            vendor = v;
        }

        // Save detailed risk scores
        if (vendor) {
            const { error: scoreError } = await supabase
                .from('vendor_risk_scores')
                .insert({
                    vendor_id: vendor.id,
                    domain: domain,
                    overall_score: scanResult.scores.overall,
                    grade: scanResult.scores.overall >= 90 ? 'A' :
                        scanResult.scores.overall >= 80 ? 'B' :
                            scanResult.scores.overall >= 70 ? 'C' :
                                scanResult.scores.overall >= 60 ? 'D' : 'F',
                    network_security_score: scanResult.scores.ssl,
                    dns_health_score: scanResult.scores.dns,
                    application_security_score: scanResult.scores.headers,
                    tls_configuration_score: scanResult.scores.ssl,
                    findings: scanResult.findings,
                    recommendations: recommendations,
                    scan_duration_ms: 1000, // Placeholder
                });

            if (scoreError) {
                console.error('Error saving risk scores:', scoreError);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                scan: scanResult,
                risk: riskAssessment,
                recommendations,
                vendor,
            },
        });
    } catch (error) {
        console.error('Vendor scan error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to scan vendor' },
            { status: 500 }
        );
    }
}
