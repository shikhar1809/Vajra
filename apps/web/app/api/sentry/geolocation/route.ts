import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

// Simulated IP geolocation (in production, use ipapi.co or similar)
async function getLocationFromIP(ip: string) {
    // Simulate geolocation data
    const locations = [
        { city: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060, timezone: 'America/New_York' },
        { city: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
        { city: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo' },
        { city: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, timezone: 'Asia/Kolkata' },
        { city: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
    ];

    return locations[Math.floor(Math.random() * locations.length)];
}

// POST - Track employee location
export async function POST(request: Request) {
    try {
        const { employeeId, ip, userAgent } = await request.json();

        if (!employeeId) {
            return NextResponse.json(
                { success: false, error: 'Employee ID is required' },
                { status: 400 }
            );
        }

        // Get location from IP
        const location = await getLocationFromIP(ip || '127.0.0.1');

        // Check if location is within geofence (simulated)
        const isWithinGeofence = Math.random() > 0.3; // 70% within geofence

        // Save to database (using security_entities table)
        if (supabase) {
            const { data: entity, error: entityError } = await supabase
                .from('security_entities')
                .insert({
                    entity_type: 'employee',
                    name: employeeId,
                    properties: {
                        last_location: location,
                        ip_address: ip,
                        user_agent: userAgent,
                        within_geofence: isWithinGeofence,
                        timestamp: new Date().toISOString(),
                    },
                    risk_score: isWithinGeofence ? 0 : 50,
                })
                .select()
                .single();

            if (entityError) {
                console.error('Error saving location:', entityError);
            }

            // Create alert if outside geofence
            if (!isWithinGeofence) {
                await supabase.from('security_alerts').insert({
                    module: 'sentry',
                    severity: 'medium',
                    type: 'geofence_violation',
                    title: 'Employee Outside Geofence',
                    description: `Employee ${employeeId} detected outside authorized area`,
                    context: {
                        employeeId,
                        location,
                        ip,
                    },
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                location,
                isWithinGeofence,
                alert: !isWithinGeofence,
            },
        });
    } catch (error) {
        console.error('Geolocation tracking error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to track location' },
            { status: 500 }
        );
    }
}

// GET - Get employee locations
export async function GET() {
    try {
        if (!supabase) return NextResponse.json({ success: true, data: { employees: [] } });

        const { data: entities, error } = await supabase
            .from('security_entities')
            .select('*')
            .eq('entity_type', 'employee')
            .order('last_seen', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching locations:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                employees: entities || [],
            },
        });
    } catch (error) {
        console.error('Geolocation GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch locations' },
            { status: 500 }
        );
    }
}
