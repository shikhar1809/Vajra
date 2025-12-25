/**
 * Breach Checker
 * Checks for data breaches using Have I Been Pwned API
 */

interface BreachResult {
    breachCount: number
    breaches: Breach[]
    severity: 'low' | 'medium' | 'high' | 'critical'
    lastBreachDate: Date | null
    totalAffectedAccounts: number
}

interface Breach {
    name: string
    title: string
    domain: string
    breachDate: Date
    addedDate: Date
    pwnCount: number
    dataClasses: string[]
    isVerified: boolean
    isSensitive: boolean
}

/**
 * Check domain for breaches
 */
export async function checkBreaches(domain: string): Promise<BreachResult> {
    try {
        const apiKey = process.env.HIBP_API_KEY

        if (!apiKey) {
            return getDefaultBreachResult()
        }

        const response = await fetch(
            `https://haveibeenpwned.com/api/v3/breaches?domain=${domain}`,
            {
                headers: {
                    'hibp-api-key': apiKey,
                    'User-Agent': 'Vajra-Scout',
                },
            }
        )

        if (!response.ok) {
            if (response.status === 404) {
                // No breaches found
                return {
                    breachCount: 0,
                    breaches: [],
                    severity: 'low',
                    lastBreachDate: null,
                    totalAffectedAccounts: 0,
                }
            }
            throw new Error(`HIBP API error: ${response.status}`)
        }

        const data = await response.json()
        const breaches: Breach[] = data.map((b: any) => ({
            name: b.Name,
            title: b.Title,
            domain: b.Domain,
            breachDate: new Date(b.BreachDate),
            addedDate: new Date(b.AddedDate),
            pwnCount: b.PwnCount,
            dataClasses: b.DataClasses,
            isVerified: b.IsVerified,
            isSensitive: b.IsSensitive,
        }))

        const totalAffectedAccounts = breaches.reduce((sum, b) => sum + b.pwnCount, 0)
        const lastBreachDate = breaches.length > 0
            ? new Date(Math.max(...breaches.map(b => b.breachDate.getTime())))
            : null

        const severity = calculateBreachSeverity(breaches)

        return {
            breachCount: breaches.length,
            breaches,
            severity,
            lastBreachDate,
            totalAffectedAccounts,
        }
    } catch (error) {
        console.error('Breach check error:', error)
        return getDefaultBreachResult()
    }
}

/**
 * Calculate breach severity
 */
function calculateBreachSeverity(breaches: Breach[]): 'low' | 'medium' | 'high' | 'critical' {
    if (breaches.length === 0) return 'low'

    const recentBreaches = breaches.filter(b => {
        const monthsAgo = (Date.now() - b.breachDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        return monthsAgo < 12
    })

    const sensitiveBreaches = breaches.filter(b => b.isSensitive)
    const largeBreaches = breaches.filter(b => b.pwnCount > 1000000)

    if (recentBreaches.length > 0 || sensitiveBreaches.length > 0) {
        return 'critical'
    }

    if (largeBreaches.length > 2) {
        return 'high'
    }

    if (breaches.length > 3) {
        return 'medium'
    }

    return 'low'
}

/**
 * Get default breach result
 */
function getDefaultBreachResult(): BreachResult {
    return {
        breachCount: 0,
        breaches: [],
        severity: 'low',
        lastBreachDate: null,
        totalAffectedAccounts: 0,
    }
}
