import { NextResponse } from 'next/server';
import { vendorScanner } from '@/lib/scout/vendor-scanner';
import { riskEngine } from '@/lib/scout/risk-scoring';

export async function POST(request: Request) {
    try {
        const { vendorId, domain } = await request.json();

        if (!domain) {
            return NextResponse.json(
                { success: false, error: 'Domain is required' },
                { status: 400 }
            );
        }

        console.log(`[API] Scanning vendor: ${domain}`);

        // Perform security scan
        const scanResult = await vendorScanner.scanVendor(vendorId || crypto.randomUUID(), domain);

        // Calculate risk assessment
        const riskAssessment = riskEngine.assessRisk({
            securityScore: scanResult.scores.overall,
            complianceScore: 75, // Simulated
            reputationScore: 80, // Simulated
            incidentHistory: {
                totalIncidents: 2,
                criticalIncidents: 0,
                resolvedIncidents: 2,
            },
            dataAccess: 'moderate',
            businessCriticality: 'medium',
        });

        // Generate recommendations
        const recommendations = vendorScanner.generateRecommendations(scanResult);

        return NextResponse.json({
            success: true,
            data: {
                scan: scanResult,
                risk: riskAssessment,
                recommendations,
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

export async function GET() {
    // Return mock vendor data for testing
    return NextResponse.json({
        success: true,
        data: {
            vendors: [
                {
                    id: '1',
                    name: 'CloudStorage Inc.',
                    domain: 'cloudstorage.com',
                    securityScore: 85,
                    riskLevel: 'low',
                    lastAssessment: new Date().toISOString(),
                },
                {
                    id: '2',
                    name: 'PaymentGateway Pro',
                    domain: 'paymentgateway.com',
                    securityScore: 72,
                    riskLevel: 'medium',
                    lastAssessment: new Date().toISOString(),
                },
                {
                    id: '3',
                    name: 'EmailService Ltd',
                    domain: 'emailservice.com',
                    securityScore: 45,
                    riskLevel: 'high',
                    lastAssessment: new Date().toISOString(),
                },
            ],
        },
    });
}
