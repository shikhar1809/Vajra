/**
 * Custom Error Classes
 * Provides structured error handling across the application
 */

export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string,
        public isOperational: boolean = true
    ) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}

export class ValidationError extends AppError {
    constructor(message: string, public fields?: Record<string, string>) {
        super(message, 400, 'VALIDATION_ERROR')
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR')
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Insufficient permissions') {
        super(message, 403, 'AUTHORIZATION_ERROR')
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND')
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT')
    }
}

export class RateLimitError extends AppError {
    constructor(retryAfter?: number) {
        super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED')
        if (retryAfter) {
            this.retryAfter = retryAfter
        }
    }
    retryAfter?: number
}

export class DatabaseError extends AppError {
    constructor(message: string, public originalError?: Error) {
        super(message, 500, 'DATABASE_ERROR', false)
    }
}

export class ExternalServiceError extends AppError {
    constructor(service: string, message: string) {
        super(`${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', false)
    }
}

/**
 * Error response formatter
 */
export function formatErrorResponse(error: Error) {
    if (error instanceof AppError) {
        return {
            error: {
                message: error.message,
                code: error.code,
                statusCode: error.statusCode,
                ...(error instanceof ValidationError && error.fields ? { fields: error.fields } : {}),
                ...(error instanceof RateLimitError && error.retryAfter ? { retryAfter: error.retryAfter } : {}),
            },
        }
    }

    // Unknown error - don't expose details in production
    return {
        error: {
            message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
            code: 'INTERNAL_ERROR',
            statusCode: 500,
        },
    }
}
