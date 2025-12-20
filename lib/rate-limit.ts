import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Note: You'll need to set up Upstash Redis and add these to .env:
// UPSTASH_REDIS_REST_URL=your_url
// UPSTASH_REDIS_REST_TOKEN=your_token

// For now, we'll create a simple in-memory rate limiter as fallback
class InMemoryRateLimiter {
    private requests: Map<string, number[]> = new Map();
    private limitCount: number;
    private window: number; // in milliseconds

    constructor(limitCount: number, windowSeconds: number) {
        this.limitCount = limitCount;
        this.window = windowSeconds * 1000;
    }

    async limit(identifier: string): Promise<{ success: boolean; remaining: number }> {
        const now = Date.now();
        const requests = this.requests.get(identifier) || [];

        // Remove old requests outside the window
        const validRequests = requests.filter(time => now - time < this.window);

        if (validRequests.length >= this.limitCount) {
            this.requests.set(identifier, validRequests);
            return { success: false, remaining: 0 };
        }

        validRequests.push(now);
        this.requests.set(identifier, validRequests);

        return { success: true, remaining: this.limitCount - validRequests.length };
    }
}

// Try to use Upstash, fallback to in-memory
let rateLimiter: any;

try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        rateLimiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(10, '10 s'),
            analytics: true,
        });
    } else {
        console.warn('Upstash Redis not configured, using in-memory rate limiter');
        rateLimiter = new InMemoryRateLimiter(10, 10);
    }
} catch (error) {
    console.warn('Failed to initialize Upstash, using in-memory rate limiter');
    rateLimiter = new InMemoryRateLimiter(10, 10);
}

/**
 * Rate limit a request by IP address
 * Returns true if request should be allowed, false if rate limited
 */
export async function rateLimit(request: Request): Promise<{ success: boolean; remaining: number }> {
    const ip = request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'anonymous';

    const { success, remaining } = await rateLimiter.limit(ip);

    return { success, remaining };
}

/**
 * Rate limit by custom identifier (e.g., user ID, API key)
 */
export async function rateLimitByIdentifier(identifier: string): Promise<{ success: boolean; remaining: number }> {
    const { success, remaining } = await rateLimiter.limit(identifier);
    return { success, remaining };
}

/**
 * Create a rate limit response
 */
export function rateLimitResponse(remaining: number = 0) {
    return Response.json(
        {
            success: false,
            error: 'Rate limit exceeded. Please try again later.',
            remaining,
        },
        {
            status: 429,
            headers: {
                'Retry-After': '10',
                'X-RateLimit-Remaining': remaining.toString(),
            },
        }
    );
}
