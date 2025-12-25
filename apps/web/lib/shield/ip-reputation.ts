/**
 * IP Reputation Service
 * Checks IP addresses against threat databases
 */

interface IPReputation {
    reputation: 'clean' | 'suspicious' | 'malicious'
    abuseScore: number // 0-100
    country: string
    isTor: boolean
    isVPN: boolean
    isDatacenter: boolean
    shouldBlock: boolean
    details: string[]
}

/**
 * Check IP reputation using AbuseIPDB
 */
export async function checkIPReputation(ip: string): Promise<IPReputation> {
    const apiKey = process.env.ABUSEIPDB_API_KEY

    if (!apiKey) {
        // Fallback to basic checks if API key not configured
        return basicIPCheck(ip)
    }

    try {
        const response = await fetch(
            `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`,
            {
                headers: {
                    Key: apiKey,
                    Accept: 'application/json',
                },
            }
        )

        if (!response.ok) {
            console.error('AbuseIPDB API error:', response.statusText)
            return basicIPCheck(ip)
        }

        const data = await response.json()
        return parseAbuseIPDBResponse(data.data)
    } catch (error) {
        console.error('Error checking IP reputation:', error)
        return basicIPCheck(ip)
    }
}

/**
 * Parse AbuseIPDB API response
 */
function parseAbuseIPDBResponse(data: any): IPReputation {
    const abuseScore = data.abuseConfidenceScore || 0
    const details: string[] = []

    if (data.totalReports > 0) {
        details.push(`${data.totalReports} abuse reports`)
    }

    if (data.isWhitelisted) {
        details.push('whitelisted')
    }

    if (data.isTor) {
        details.push('tor-exit-node')
    }

    // Determine reputation
    let reputation: 'clean' | 'suspicious' | 'malicious'
    if (abuseScore >= 75) {
        reputation = 'malicious'
    } else if (abuseScore >= 25) {
        reputation = 'suspicious'
    } else {
        reputation = 'clean'
    }

    return {
        reputation,
        abuseScore,
        country: data.countryCode || 'unknown',
        isTor: data.isTor || false,
        isVPN: false, // AbuseIPDB doesn't provide this
        isDatacenter: data.usageType === 'Data Center/Web Hosting/Transit',
        shouldBlock: abuseScore >= 75 || data.isTor,
        details,
    }
}

/**
 * Basic IP check (fallback when API not available)
 */
function basicIPCheck(ip: string): IPReputation {
    const details: string[] = []

    // Check for private/local IPs
    if (isPrivateIP(ip)) {
        details.push('private-ip')
        return {
            reputation: 'clean',
            abuseScore: 0,
            country: 'local',
            isTor: false,
            isVPN: false,
            isDatacenter: false,
            shouldBlock: false,
            details,
        }
    }

    // Default to unknown
    return {
        reputation: 'clean',
        abuseScore: 0,
        country: 'unknown',
        isTor: false,
        isVPN: false,
        isDatacenter: false,
        shouldBlock: false,
        details: ['no-api-key-configured'],
    }
}

/**
 * Check if IP is private/local
 */
function isPrivateIP(ip: string): boolean {
    const parts = ip.split('.').map(Number)

    if (parts.length !== 4) return false

    // 10.0.0.0/8
    if (parts[0] === 10) return true

    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true

    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true

    // 127.0.0.0/8 (localhost)
    if (parts[0] === 127) return true

    return false
}

/**
 * Batch check multiple IPs
 */
export async function checkMultipleIPs(ips: string[]): Promise<Map<string, IPReputation>> {
    const results = new Map<string, IPReputation>()

    // Check IPs in parallel (with rate limiting)
    const chunks = chunkArray(ips, 5) // 5 at a time

    for (const chunk of chunks) {
        const promises = chunk.map(async (ip) => {
            const reputation = await checkIPReputation(ip)
            return [ip, reputation] as [string, IPReputation]
        })

        const chunkResults = await Promise.all(promises)
        chunkResults.forEach(([ip, reputation]) => results.set(ip, reputation))

        // Small delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 100))
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
