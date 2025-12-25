import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================

export const emailSchema = z.string().email('Invalid email address');

export const urlSchema = z.string().url('Invalid URL format');

export const uuidSchema = z.string().uuid('Invalid UUID format');

// ============================================
// Shield Module Schemas
// ============================================

export const botDetectionSchema = z.object({
    ip_address: z.string().ip(),
    user_agent: z.string().optional(),
    bot_score: z.number().int().min(1).max(99),
    classification: z.enum(['verified-bot', 'likely-bot', 'likely-human', 'verified-human']),
});

export const trafficLogSchema = z.object({
    ip_address: z.string().ip(),
    user_agent: z.string().optional(),
    request_method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']),
    request_path: z.string(),
    status_code: z.number().int().min(100).max(599),
});

// ============================================
// Scout Module Schemas
// ============================================

export const vendorScanSchema = z.object({
    vendorId: uuidSchema,
    domain: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, 'Invalid domain format'),
});

export const addVendorSchema = z.object({
    name: z.string().min(1, 'Vendor name is required').max(255),
    domain: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, 'Invalid domain format'),
    contact_email: emailSchema.optional(),
    contact_name: z.string().max(255).optional(),
    description: z.string().max(1000).optional(),
});

// ============================================
// Sentry Module Schemas
// ============================================

export const phishingCheckSchema = z.object({
    url: urlSchema,
});

export const documentScanSchema = z.object({
    filename: z.string().min(1).max(255),
    fileSize: z.number().int().positive().max(10 * 1024 * 1024), // Max 10MB
    fileType: z.string().regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/i, 'Invalid MIME type'),
});

// ============================================
// Agenios Module Schemas
// ============================================

export const codeScanSchema = z.object({
    targetURL: urlSchema,
    scanType: z.enum(['quick', 'standard', 'comprehensive']),
});

export const githubScanSchema = z.object({
    repoUrl: z.string().regex(/^https:\/\/github\.com\/[\w-]+\/[\w-]+$/, 'Invalid GitHub repository URL'),
    token: z.string().optional(),
});

// ============================================
// Helper Functions
// ============================================

/**
 * Validate data against a schema and return typed result
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return { success: false, error: errorMessage };
        }
        return { success: false, error: 'Validation failed' };
    }
}

/**
 * Sanitize string input (remove potential XSS)
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
}

/**
 * Sanitize URL (ensure it's safe)
 */
export function sanitizeUrl(url: string): string {
    try {
        const parsed = new URL(url);
        // Only allow http and https
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Invalid protocol');
        }
        return parsed.toString();
    } catch {
        throw new Error('Invalid URL');
    }
}
