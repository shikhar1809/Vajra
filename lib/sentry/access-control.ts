import { NextRequest } from 'next/server';

interface AccessResult {
    allowed: boolean;
    reason?: string;
    geo?: {
        country: string;
        city: string;
    };
}

// Mock Allowed Router IPs (Real world: corporate VPN/Gateway IPs)
const CORPORATE_ROUTER_IPS = [
    '203.0.113.1',
    '198.51.100.1',
    '127.0.0.1', // Localhost
    '::1'
];

const ALLOWED_COUNTRIES = ['US', 'IN', 'GB', 'CA'];

export async function checkAccess(req: NextRequest): Promise<AccessResult> {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    // In Vercel, use 'x-vercel-ip-country' header
    const country = req.headers.get('x-vercel-ip-country') || 'IN'; // Default to IN for checking
    const city = req.headers.get('x-vercel-ip-city') || 'Unknown';

    // 1. Geo-Fencing Check
    if (!ALLOWED_COUNTRIES.includes(country)) {
        return {
            allowed: false,
            reason: `Access denied from restricted location: ${country}`,
            geo: { country, city }
        };
    }

    // 2. Router/IP Access Control (Optional "Corporate Mode")
    // For this app, we might check a header or a specific strict mode setting.
    // Here we simulate checking if the IP matches known corporate router IPs.
    // NOTE: For demo purposes, we are NOT enforcing this strictly on *all* users 
    // to avoid locking you out, but the logic is here.

    // const isCorporateIP = CORPORATE_ROUTER_IPS.includes(ip);
    // if (process.env.STRICT_ROUTER_MODE === 'true' && !isCorporateIP) {
    //     return { allowed: false, reason: 'Device not connected to Corporate Router' };
    // }

    return {
        allowed: true,
        geo: { country, city }
    };
}
