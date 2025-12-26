import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { phishingDetector } from '@/lib/sentry/phishing-detector';
import { validateData, phishingCheckSchema } from '@/lib/validation';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

export async function POST(request: Request) {
    try {
        // Rate limiting
        const { success: rateLimitSuccess, remaining } = await rateLimit(request);
        if (!rateLimitSuccess) {
            return rateLimitResponse(remaining);
        }

        const body = await request.json();

        // Validate input
        const validation = validateData(phishingCheckSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const { url } = validation.data;

        console.log(`[API] Checking URL for phishing: ${url}`);

        // Perform phishing check
        const result = await phishingDetector.checkURL(url);

        // Save to database
        if (supabase) {
            const { data: savedCheck, error: dbError } = await supabase
                .from('phishing_checks')
                .insert({
                    url,
                    is_safe: result.isSafe,
                    threat_level: result.threatLevel,
                    confidence: result.confidence,
                    threats: result.threats,
                    recommendations: result.recommendations,
                })
                .select()
                .single();

            if (dbError) {
                console.error('Error saving phishing check:', dbError);
            }
        }

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

// GET - Fetch recent phishing checks
export async function GET() {
    try {
        if (!supabase) return NextResponse.json({ success: true, data: { checks: [] } });

        const { data: checks, error } = await supabase
            .from('phishing_checks')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching phishing checks:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                checks: checks || [],
            },
        });
    } catch (error) {
        console.error('Phishing GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch checks' },
            { status: 500 }
        );
    }
}
