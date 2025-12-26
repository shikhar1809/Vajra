import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

export async function GET() {
    try {
        if (!supabase) return NextResponse.json({ success: true, data: { summary: {}, trafficLogs: [] } });

        // Get traffic logs from last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data: trafficLogs, error: trafficError } = await supabase
            .from('traffic_logs')
            .select('*')
            .gte('timestamp', twentyFourHoursAgo)
            .order('timestamp', { ascending: false })
            .limit(1000);

        if (trafficError) {
            console.error('Error fetching traffic logs:', trafficError);
        }

        // Get anomaly events
        const { data: anomalies, error: anomalyError } = await supabase
            .from('anomaly_events')
            .select('*')
            .eq('resolved', false)
            .order('timestamp', { ascending: false })
            .limit(50);

        if (anomalyError) {
            console.error('Error fetching anomalies:', anomalyError);
        }

        // Get bot detections from last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        const { data: botDetections, error: botError } = await supabase
            .from('bot_detections')
            .select('*')
            .gte('detected_at', oneHourAgo)
            .order('detected_at', { ascending: false })
            .limit(100);

        if (botError) {
            console.error('Error fetching bot detections:', botError);
        }

        // Calculate summary statistics
        const totalRequests = trafficLogs?.length || 0;
        const botCount = botDetections?.filter(b => b.classification === 'likely-bot' || b.classification === 'verified-bot').length || 0;
        const humanCount = botDetections?.filter(b => b.classification === 'likely-human' || b.classification === 'verified-human').length || 0;

        // Group traffic by hour for chart
        const trafficByHour = new Array(24).fill(0);
        trafficLogs?.forEach(log => {
            const hour = new Date(log.timestamp).getHours();
            trafficByHour[hour]++;
        });

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalRequests,
                    botCount,
                    humanCount,
                    anomalyCount: anomalies?.length || 0,
                },
                trafficLogs: trafficLogs || [],
                anomalies: anomalies || [],
                botDetections: botDetections || [],
                trafficByHour,
            },
        });
    } catch (error) {
        console.error('Shield traffic API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch traffic data',
            },
            { status: 500 }
        );
    }
}

// POST endpoint to log new traffic
export async function POST(request: Request) {
    try {
        if (!supabase) return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 503 });

        const body = await request.json();
        const { ip_address, user_agent, request_method, request_path, status_code, response_time_ms } = body;

        // Insert traffic log
        const { data, error } = await supabase
            .from('traffic_logs')
            .insert({
                ip_address,
                user_agent,
                request_method,
                request_path,
                status_code,
                response_time_ms,
                timestamp: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error inserting traffic log:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Shield traffic POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to log traffic' },
            { status: 500 }
        );
    }
}
