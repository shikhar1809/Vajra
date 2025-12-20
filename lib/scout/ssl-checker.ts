/**
 * SSL Certificate Checker
 * Analyzes SSL certificates for security and expiry
 */

interface SSLCheckResult {
    grade: string // A+, A, B, C, D, F
    score: number // 0-100
    expiryDate: Date | null
    daysUntilExpiry: number
    issuer: string
    validFrom: Date | null
    validTo: Date | null
    issues: string[]
    warnings: string[]
    details: {
        protocol: string
        cipherSuite: string
        keySize: number
        certificateChain: number
    }
}

/**
 * Check SSL certificate for a domain
 */
export async function checkSSLCertificate(domain: string): Promise<SSLCheckResult> {
    try {
        // Use SSL Labs API for comprehensive analysis
        const sslLabsResult = await checkWithSSLLabs(domain)

        if (sslLabsResult) {
            return sslLabsResult
        }

        // Fallback to basic check
        return await basicSSLCheck(domain)
    } catch (error) {
        console.error('SSL check error:', error)
        return getDefaultSSLResult()
    }
}

/**
 * Check using SSL Labs API
 */
async function checkWithSSLLabs(domain: string): Promise<SSLCheckResult | null> {
    const apiKey = process.env.SSLLABS_API_KEY

    if (!apiKey) {
        return null
    }

    try {
        // Start analysis
        const analyzeUrl = `https://api.ssllabs.com/api/v3/analyze?host=${domain}&fromCache=on&maxAge=24`

        const response = await fetch(analyzeUrl, {
            headers: { 'User-Agent': 'Vajra-Scout/1.0' }
        })

        if (!response.ok) {
            return null
        }

        const data = await response.json()

        // Parse SSL Labs response
        if (data.endpoints && data.endpoints.length > 0) {
            const endpoint = data.endpoints[0]

            return {
                grade: endpoint.grade || 'T',
                score: gradeToScore(endpoint.grade),
                expiryDate: data.certs?.[0]?.notAfter ? new Date(data.certs[0].notAfter) : null,
                daysUntilExpiry: calculateDaysUntilExpiry(data.certs?.[0]?.notAfter),
                issuer: data.certs?.[0]?.issuerLabel || 'Unknown',
                validFrom: data.certs?.[0]?.notBefore ? new Date(data.certs[0].notBefore) : null,
                validTo: data.certs?.[0]?.notAfter ? new Date(data.certs[0].notAfter) : null,
                issues: extractIssues(endpoint),
                warnings: extractWarnings(endpoint),
                details: {
                    protocol: endpoint.details?.protocols?.[0]?.name || 'Unknown',
                    cipherSuite: endpoint.details?.suites?.list?.[0]?.name || 'Unknown',
                    keySize: endpoint.details?.key?.size || 0,
                    certificateChain: data.certs?.length || 0,
                },
            }
        }

        return null
    } catch (error) {
        console.error('SSL Labs API error:', error)
        return null
    }
}

/**
 * Basic SSL check (fallback)
 */
async function basicSSLCheck(domain: string): Promise<SSLCheckResult> {
    try {
        // Try to fetch the domain over HTTPS
        const response = await fetch(`https://${domain}`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000),
        })

        const issues: string[] = []
        const warnings: string[] = []

        if (!response.ok) {
            issues.push('HTTPS connection failed')
        }

        // Basic scoring
        const score = response.ok ? 70 : 0
        const grade = scoreToGrade(score)

        return {
            grade,
            score,
            expiryDate: null,
            daysUntilExpiry: -1,
            issuer: 'Unknown',
            validFrom: null,
            validTo: null,
            issues,
            warnings,
            details: {
                protocol: 'Unknown',
                cipherSuite: 'Unknown',
                keySize: 0,
                certificateChain: 0,
            },
        }
    } catch (error) {
        return getDefaultSSLResult()
    }
}

/**
 * Convert grade to score
 */
function gradeToScore(grade: string): number {
    const gradeMap: Record<string, number> = {
        'A+': 100,
        'A': 95,
        'A-': 90,
        'B': 80,
        'C': 70,
        'D': 60,
        'E': 50,
        'F': 40,
        'T': 0, // Trust issues
    }
    return gradeMap[grade] || 0
}

/**
 * Convert score to grade
 */
function scoreToGrade(score: number): string {
    if (score >= 95) return 'A+'
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    if (score >= 50) return 'E'
    return 'F'
}

/**
 * Calculate days until expiry
 */
function calculateDaysUntilExpiry(expiryDate: number | undefined): number {
    if (!expiryDate) return -1

    const now = Date.now()
    const expiry = expiryDate
    const diff = expiry - now
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    return days
}

/**
 * Extract issues from SSL Labs result
 */
function extractIssues(endpoint: any): string[] {
    const issues: string[] = []

    if (endpoint.grade === 'F' || endpoint.grade === 'T') {
        issues.push('Critical SSL configuration issues')
    }

    if (endpoint.details?.certChains?.[0]?.issues) {
        issues.push('Certificate chain issues')
    }

    if (endpoint.details?.protocols) {
        const hasOldProtocols = endpoint.details.protocols.some(
            (p: any) => p.name === 'TLS' && parseFloat(p.version) < 1.2
        )
        if (hasOldProtocols) {
            issues.push('Outdated TLS protocol versions')
        }
    }

    return issues
}

/**
 * Extract warnings from SSL Labs result
 */
function extractWarnings(endpoint: any): string[] {
    const warnings: string[] = []

    if (endpoint.grade === 'B' || endpoint.grade === 'C') {
        warnings.push('SSL configuration could be improved')
    }

    const daysUntilExpiry = calculateDaysUntilExpiry(endpoint.details?.cert?.notAfter)
    if (daysUntilExpiry > 0 && daysUntilExpiry < 30) {
        warnings.push(`Certificate expires in ${daysUntilExpiry} days`)
    }

    return warnings
}

/**
 * Get default SSL result (error case)
 */
function getDefaultSSLResult(): SSLCheckResult {
    return {
        grade: 'F',
        score: 0,
        expiryDate: null,
        daysUntilExpiry: -1,
        issuer: 'Unknown',
        validFrom: null,
        validTo: null,
        issues: ['Unable to check SSL certificate'],
        warnings: [],
        details: {
            protocol: 'Unknown',
            cipherSuite: 'Unknown',
            keySize: 0,
            certificateChain: 0,
        },
    }
}

/**
 * Batch check multiple domains
 */
export async function checkMultipleSSL(domains: string[]): Promise<Map<string, SSLCheckResult>> {
    const results = new Map<string, SSLCheckResult>()

    // Check domains in parallel (with rate limiting)
    const chunks = chunkArray(domains, 3) // 3 at a time

    for (const chunk of chunks) {
        const promises = chunk.map(async (domain) => {
            const result = await checkSSLCertificate(domain)
            return [domain, result] as [string, SSLCheckResult]
        })

        const chunkResults = await Promise.all(promises)
        chunkResults.forEach(([domain, result]) => results.set(domain, result))

        // Small delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    return results
}

/**
 * Helper: chunk array
 */
function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
    }
    return chunks
}
