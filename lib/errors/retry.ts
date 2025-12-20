/**
 * Retry Logic with Exponential Backoff
 * Handles transient failures gracefully
 */

interface RetryOptions {
    maxAttempts?: number
    initialDelay?: number
    maxDelay?: number
    backoffFactor?: number
    retryableErrors?: (error: Error) => boolean
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryableErrors: (error) => {
        // Retry on network errors, timeouts, and 5xx errors
        return (
            error.message.includes('fetch') ||
            error.message.includes('timeout') ||
            error.message.includes('ECONNREFUSED') ||
            (error as any).statusCode >= 500
        )
    },
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    let lastError: Error
    let delay = opts.initialDelay

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error as Error

            // Don't retry if error is not retryable
            if (!opts.retryableErrors(lastError)) {
                throw lastError
            }

            // Don't retry on last attempt
            if (attempt === opts.maxAttempts) {
                throw lastError
            }

            // Wait before retrying
            await sleep(delay)

            // Increase delay for next attempt
            delay = Math.min(delay * opts.backoffFactor, opts.maxDelay)

            console.log(`Retry attempt ${attempt}/${opts.maxAttempts} after ${delay}ms`)
        }
    }

    throw lastError!
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry with jitter (randomized delay to prevent thundering herd)
 */
export async function retryWithJitter<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    let lastError: Error

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error as Error

            if (!opts.retryableErrors(lastError)) {
                throw lastError
            }

            if (attempt === opts.maxAttempts) {
                throw lastError
            }

            // Calculate delay with jitter
            const baseDelay = opts.initialDelay * Math.pow(opts.backoffFactor, attempt - 1)
            const jitter = Math.random() * baseDelay * 0.1 // 10% jitter
            const delay = Math.min(baseDelay + jitter, opts.maxDelay)

            await sleep(delay)
        }
    }

    throw lastError!
}
