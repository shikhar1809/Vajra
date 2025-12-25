import crypto from 'crypto'

/**
 * CSRF Token Management
 * Protects against Cross-Site Request Forgery attacks
 */

const CSRF_TOKEN_LENGTH = 32
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour

interface CSRFToken {
    token: string
    createdAt: number
}

// In-memory store (use Redis in production)
const tokenStore = new Map<string, CSRFToken>()

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
    const token = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex')

    tokenStore.set(token, {
        token,
        createdAt: Date.now(),
    })

    // Clean up expired tokens
    cleanupExpiredTokens()

    return token
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(token: string | null): boolean {
    if (!token) return false

    const storedToken = tokenStore.get(token)
    if (!storedToken) return false

    // Check if token is expired
    if (Date.now() - storedToken.createdAt > CSRF_TOKEN_EXPIRY) {
        tokenStore.delete(token)
        return false
    }

    return true
}

/**
 * Invalidate a CSRF token after use
 */
export function invalidateCSRFToken(token: string): void {
    tokenStore.delete(token)
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens(): void {
    const now = Date.now()

    for (const [token, data] of tokenStore.entries()) {
        if (now - data.createdAt > CSRF_TOKEN_EXPIRY) {
            tokenStore.delete(token)
        }
    }
}

/**
 * Middleware to add CSRF token to response
 */
export function addCSRFTokenToResponse(response: Response, token: string): Response {
    response.headers.set('X-CSRF-Token', token)
    return response
}

/**
 * Extract CSRF token from request
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
    // Check header first
    const headerToken = request.headers.get('X-CSRF-Token')
    if (headerToken) return headerToken

    // Check body for form submissions
    const contentType = request.headers.get('content-type')
    if (contentType?.includes('application/x-www-form-urlencoded')) {
        // Would need to parse body here
        // For now, rely on header
    }

    return null
}
