export interface RateLimitInfo {
    count: number;
    lastReset: number;
    isBlocked: boolean;
}

// In-memory store for rate limiting (Note: In a serverless/production environment with multiple instances, 
// this should be replaced with Redis or a database like KV store)
const ipRateLimit = new Map<string, RateLimitInfo>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const THRESHOLD = 100; // 100 requests per minute

export function checkRateLimit(ip: string): { success: boolean; remaining: number } {
    const now = Date.now();
    const info = ipRateLimit.get(ip) || { count: 0, lastReset: now, isBlocked: false };

    // Reset window if passed
    if (now - info.lastReset > WINDOW_MS) {
        info.count = 0;
        info.lastReset = now;
        info.isBlocked = false;
    }

    if (info.isBlocked) {
        return { success: false, remaining: 0 };
    }

    info.count++;
    ipRateLimit.set(ip, info);

    const remaining = Math.max(0, THRESHOLD - info.count);

    if (info.count > THRESHOLD) {
        info.isBlocked = true;
        return { success: false, remaining: 0 };
    }

    return { success: true, remaining };
}

export function resetRateLimit(ip: string) {
    ipRateLimit.delete(ip);
}
