import DOMPurify from 'isomorphic-dompurify'
import validator from 'validator'

/**
 * Input Sanitization and Validation
 * Protects against XSS, SQL injection, and other injection attacks
 */

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHTML(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href'],
    })
}

/**
 * Sanitize plain text (strip all HTML)
 */
export function sanitizeText(text: string): string {
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
    const trimmed = email.trim().toLowerCase()
    if (!validator.isEmail(trimmed)) {
        return null
    }
    return validator.normalizeEmail(trimmed) || trimmed
}

/**
 * Validate and sanitize URL
 */
export function sanitizeURL(url: string): string | null {
    const trimmed = url.trim()
    if (!validator.isURL(trimmed, { require_protocol: true })) {
        return null
    }
    return trimmed
}

/**
 * Sanitize workspace slug (alphanumeric + hyphens only)
 */
export function sanitizeSlug(slug: string): string {
    return slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50)
}

/**
 * Validate and sanitize domain name
 */
export function sanitizeDomain(domain: string): string | null {
    const trimmed = domain.trim().toLowerCase()
    if (!validator.isFQDN(trimmed)) {
        return null
    }
    return trimmed
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string | null {
    const cleaned = phone.replace(/\D/g, '')
    if (!validator.isMobilePhone(cleaned)) {
        return null
    }
    return cleaned
}

/**
 * Validate IP address
 */
export function isValidIP(ip: string): boolean {
    return validator.isIP(ip)
}

/**
 * Sanitize GitHub URL
 */
export function sanitizeGitHubURL(url: string): string | null {
    const trimmed = url.trim()

    // Match GitHub URLs
    const githubPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/

    if (!githubPattern.test(trimmed)) {
        return null
    }

    return trimmed
}

/**
 * Sanitize API key (format: vjs_[64 hex chars])
 */
export function isValidAPIKey(key: string): boolean {
    return /^vjs_[a-f0-9]{64}$/.test(key)
}

/**
 * Sanitize object (recursively sanitize all string values)
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = {} as T

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key as keyof T] = sanitizeText(value) as T[keyof T]
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key as keyof T] = sanitizeObject(value)
        } else {
            sanitized[key as keyof T] = value
        }
    }

    return sanitized
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): {
    valid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters')
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character')
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

/**
 * Escape SQL-like patterns (for LIKE queries)
 */
export function escapeSQLLike(str: string): string {
    return str.replace(/[%_]/g, '\\$&')
}
