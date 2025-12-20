import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Rate Limiting with Upstash Redis
 * Protects against DDoS and brute force attacks
 */

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    : null

// Create rate limiters for different endpoints
export const rateLimiters = {
    // API endpoints: 100 requests per minute
    api: redis
        ? new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(100, '1 m'),
            analytics: true,
        })
        : null,

    // Auth endpoints: 5 requests per minute (stricter)
    auth: redis
        ? new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(5, '1 m'),
            analytics: true,
        })
        : null,

    // Workspace creation: 10 per hour
    workspace: redis
        ? new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(10, '1 h'),
            analytics: true,
        })
        : null,

    // Data mutations: 50 per minute
    mutation: redis
        ? new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(50, '1 m'),
            analytics: true,
        })
        : null,
}

/**
 * Check rate limit for a given identifier
 */
export async function checkRateLimit(
    limiter: Ratelimit | null,
    identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    if (!limiter) {
        // Fallback to in-memory rate limiting if Redis not configured
        return inMemoryRateLimit(identifier)
    }

    const { success, limit, remaining, reset } = await limiter.limit(identifier)

    return {
        success,
        limit,
        remaining,
        reset,
    }
}

/**
 * In-memory rate limiting fallback
 * Not recommended for production (doesn't work across instances)
 */
const inMemoryStore = new Map<string, { count: number; resetAt: number }>()

function inMemoryRateLimit(identifier: string) {
    const now = Date.now()
    const limit = 100
    const window = 60 * 1000 // 1 minute

    const existing = inMemoryStore.get(identifier)

    if (!existing || now > existing.resetAt) {
        inMemoryStore.set(identifier, {
            count: 1,
            resetAt: now + window,
        })
        return {
            success: true,
            limit,
            remaining: limit - 1,
            reset: now + window,
        }
    }

    existing.count++

    if (existing.count > limit) {
        return {
            success: false,
            limit,
            remaining: 0,
            reset: existing.resetAt,
        }
    }

    return {
        success: true,
        limit,
        remaining: limit - existing.count,
        reset: existing.resetAt,
    }
}

/**
 * Get identifier from request (IP address or user ID)
 */
export function getIdentifier(request: Request, userId?: string): string {
    if (userId) return `user:${userId}`

    // Get IP from various headers
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'

    return `ip:${ip}`
}

/**
 * Rate limit middleware
 */
export async function rateLimit(
    request: Request,
    limiterType: keyof typeof rateLimiters = 'api',
    userId?: string
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
    const identifier = getIdentifier(request, userId)
    const limiter = rateLimiters[limiterType]

    const { success, limit, remaining, reset } = await checkRateLimit(limiter, identifier)

    return {
        allowed: success,
        headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
        },
    }
}
