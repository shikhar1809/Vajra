import { NextResponse } from 'next/server';
import { phishingDetector } from '@/lib/sentry/phishing-detector';

export async function POST(request: Request) {
    try {
        const { url, content } = await request.json();

        if (!url) {
            return NextResponse.json(
                { success: false, error: 'URL is required' },
                { status: 400 }
            );
        }

        console.log(`[API] Checking URL for phishing: ${url}`);

        // Perform phishing check
        const result = await phishingDetector.checkURL(url, content);

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Phishing check error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to check URL' },
            { status: 500 }
        );
    }
}

// Batch check endpoint
export async function PUT(request: Request) {
    try {
        const { urls } = await request.json();

        if (!urls || !Array.isArray(urls)) {
            return NextResponse.json(
                { success: false, error: 'URLs array is required' },
                { status: 400 }
            );
        }

        console.log(`[API] Batch checking ${urls.length} URLs`);

        const results = await phishingDetector.batchCheck(urls);

        return NextResponse.json({
            success: true,
            data: {
                results,
                summary: {
                    total: results.length,
                    safe: results.filter(r => r.isSafe).length,
                    suspicious: results.filter(r => r.threatLevel === 'suspicious').length,
                    dangerous: results.filter(r => r.threatLevel === 'dangerous').length,
                    malicious: results.filter(r => r.threatLevel === 'malicious').length,
                },
            },
        });
    } catch (error) {
        console.error('Batch phishing check error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to check URLs' },
            { status: 500 }
        );
    }
}
