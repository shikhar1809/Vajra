/**
 * Performance Optimizer
 * Caching and query optimization utilities
 */

// Simple in-memory cache (production should use Redis)
const cache = new Map<string, { data: any; expires: number }>()

/**
 * Cache data with TTL
 */
export function cacheSet(key: string, data: any, ttlSeconds: number = 300): void {
    const expires = Date.now() + ttlSeconds * 1000
    cache.set(key, { data, expires })
}

/**
 * Get cached data
 */
export function cacheGet<T>(key: string): T | null {
    const cached = cache.get(key)

    if (!cached) return null

    if (Date.now() > cached.expires) {
        cache.delete(key)
        return null
    }

    return cached.data as T
}

/**
 * Clear cache
 */
export function cacheClear(pattern?: string): void {
    if (!pattern) {
        cache.clear()
        return
    }

    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key)
        }
    }
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
    fn: T,
    ttlSeconds: number = 300
): T {
    return ((...args: any[]) => {
        const key = `memoize:${fn.name}:${JSON.stringify(args)}`
        const cached = cacheGet(key)

        if (cached !== null) return cached

        const result = fn(...args)
        cacheSet(key, result, ttlSeconds)

        return result
    }) as T
}

/**
 * Batch database queries
 */
export async function batchQueries<T>(
    queries: (() => Promise<T>)[],
    batchSize: number = 5
): Promise<T[]> {
    const results: T[] = []

    for (let i = 0; i < queries.length; i += batchSize) {
        const batch = queries.slice(i, i + batchSize)
        const batchResults = await Promise.all(batch.map(q => q()))
        results.push(...batchResults)
    }

    return results
}
