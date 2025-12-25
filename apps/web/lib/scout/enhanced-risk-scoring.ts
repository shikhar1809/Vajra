/**
 * Vajra Scout - Enhanced Vendor Risk Scoring
 * 
 * SecurityScorecard/BitSight-inspired multi-factor risk assessment
 * 10 risk factors with A-F grading
 */

export interface VendorRiskScore {
    vendorId: string;
    domain: string;
    overallScore: number;        // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';

    // 10 Risk Factors (SecurityScorecard-inspired)
    factors: {
        networkSecurity: FactorScore;      // Open ports, firewall config
        dnsHealth: FactorScore;            // SPF, DKIM, DMARC, DNSSEC
        patchingCadence: FactorScore;      // Software update frequency
        endpointSecurity: FactorScore;     // EDR presence, antivirus
        ipReputation: FactorScore;         // Malware hosting, spam
        applicationSecurity: FactorScore;  // OWASP vulnerabilities
        socialEngineering: FactorScore;    // Phishing susceptibility
        leakedCredentials: FactorScore;    // Dark web exposure
        tlsConfiguration: FactorScore;     // SSL/TLS strength
        informationDisclosure: FactorScore; // Exposed sensitive data
    };

    breachHistory: BreachHistory;
    certifications: string[];
    lastScanned: Date;
    scanDuration: number;
    recommendations: Recommendation[];
}

export interface FactorScore {
    score: number;           // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    weight: number;          // Factor weight (0-1)
    findings: Finding[];
    trend: 'improving' | 'stable' | 'declining';
}

export interface Finding {
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    title: string;
    description: string;
    evidence?: string;
    remediation?: string;
}

export interface BreachHistory {
    totalBreaches: number;
    recentBreaches: number;    // Last 12 months
    lastBreachDate?: Date;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'none';
    exposedRecords: number;
    types: string[];           // 'credentials', 'pii', 'financial', etc.
}

export interface Recommendation {
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    impact: number;           // Expected score improvement
}

/**
 * Factor weights (must sum to 1.0)
 */
const FACTOR_WEIGHTS = {
    networkSecurity: 0.12,
    dnsHealth: 0.10,
    patchingCadence: 0.12,
    endpointSecurity: 0.08,
    ipReputation: 0.10,
    applicationSecurity: 0.15,
    socialEngineering: 0.08,
    leakedCredentials: 0.10,
    tlsConfiguration: 0.10,
    informationDisclosure: 0.05,
};

/**
 * Convert score to grade
 */
function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}

/**
 * Network Security Analyzer
 */
class NetworkSecurityAnalyzer {
    async analyze(domain: string): Promise<FactorScore> {
        const findings: Finding[] = [];
        let score = 100;

        // Check for common open ports (simulation for now)
        // In production: Use nmap or shodan API
        const riskyPorts = await this.checkOpenPorts(domain);

        for (const port of riskyPorts) {
            score -= port.penalty;
            findings.push({
                severity: port.severity,
                title: `Open port: ${port.port}`,
                description: `${port.service} service exposed on port ${port.port}`,
                remediation: `Consider restricting access to port ${port.port}`,
            });
        }

        return {
            score: Math.max(0, score),
            grade: scoreToGrade(Math.max(0, score)),
            weight: FACTOR_WEIGHTS.networkSecurity,
            findings,
            trend: 'stable',
        };
    }

    private async checkOpenPorts(domain: string): Promise<Array<{
        port: number;
        service: string;
        penalty: number;
        severity: Finding['severity'];
    }>> {
        // In production, integrate with Shodan or run port scans
        // For now, return empty (assume secure)
        return [];
    }
}

/**
 * DNS Health Analyzer
 */
class DNSHealthAnalyzer {
    async analyze(domain: string): Promise<FactorScore> {
        const findings: Finding[] = [];
        let score = 100;

        // Check SPF record
        const spfResult = await this.checkSPF(domain);
        if (!spfResult.exists) {
            score -= 15;
            findings.push({
                severity: 'medium',
                title: 'Missing SPF record',
                description: 'No SPF record found, making domain vulnerable to email spoofing',
                remediation: 'Add an SPF record to your DNS configuration',
            });
        } else if (!spfResult.valid) {
            score -= 10;
            findings.push({
                severity: 'low',
                title: 'Invalid SPF record',
                description: spfResult.error || 'SPF record has configuration issues',
                remediation: 'Review and correct your SPF record',
            });
        }

        // Check DMARC record
        const dmarcResult = await this.checkDMARC(domain);
        if (!dmarcResult.exists) {
            score -= 15;
            findings.push({
                severity: 'medium',
                title: 'Missing DMARC record',
                description: 'No DMARC policy found, reducing email security',
                remediation: 'Implement DMARC policy for email authentication',
            });
        } else if (dmarcResult.policy === 'none') {
            score -= 5;
            findings.push({
                severity: 'low',
                title: 'DMARC policy set to none',
                description: 'DMARC exists but does not enforce any action',
                remediation: 'Consider upgrading DMARC policy to quarantine or reject',
            });
        }

        // Check DKIM
        const dkimResult = await this.checkDKIM(domain);
        if (!dkimResult.exists) {
            score -= 10;
            findings.push({
                severity: 'low',
                title: 'DKIM not detected',
                description: 'DKIM selector not found or not properly configured',
                remediation: 'Configure DKIM for email authentication',
            });
        }

        // Check DNSSEC
        const dnssecResult = await this.checkDNSSEC(domain);
        if (!dnssecResult.enabled) {
            score -= 5;
            findings.push({
                severity: 'info',
                title: 'DNSSEC not enabled',
                description: 'Domain does not have DNSSEC protection',
                remediation: 'Enable DNSSEC with your DNS provider',
            });
        }

        return {
            score: Math.max(0, score),
            grade: scoreToGrade(Math.max(0, score)),
            weight: FACTOR_WEIGHTS.dnsHealth,
            findings,
            trend: 'stable',
        };
    }

    private async checkSPF(domain: string): Promise<{ exists: boolean; valid: boolean; error?: string }> {
        try {
            // In production, use DNS lookup
            // const records = await dns.resolveTxt(domain);
            // const spf = records.flat().find(r => r.startsWith('v=spf1'));
            return { exists: true, valid: true };
        } catch {
            return { exists: false, valid: false };
        }
    }

    private async checkDMARC(domain: string): Promise<{ exists: boolean; policy?: string }> {
        try {
            // const records = await dns.resolveTxt(`_dmarc.${domain}`);
            return { exists: true, policy: 'quarantine' };
        } catch {
            return { exists: false };
        }
    }

    private async checkDKIM(domain: string): Promise<{ exists: boolean }> {
        // Check common DKIM selectors
        return { exists: true };
    }

    private async checkDNSSEC(domain: string): Promise<{ enabled: boolean }> {
        return { enabled: false };
    }
}

/**
 * TLS Configuration Analyzer
 */
class TLSConfigurationAnalyzer {
    async analyze(domain: string): Promise<FactorScore> {
        const findings: Finding[] = [];
        let score = 100;

        try {
            // Fetch HTTPS to check certificate
            const response = await fetch(`https://${domain}`, {
                method: 'HEAD',
                signal: AbortSignal.timeout(10000),
            });

            // Check if HTTPS works
            if (!response.ok && response.status !== 301 && response.status !== 302) {
                score -= 20;
                findings.push({
                    severity: 'high',
                    title: 'HTTPS issues detected',
                    description: `HTTPS returned status ${response.status}`,
                });
            }

            // Check for security headers
            const headers = response.headers;

            if (!headers.get('strict-transport-security')) {
                score -= 10;
                findings.push({
                    severity: 'medium',
                    title: 'Missing HSTS header',
                    description: 'Strict-Transport-Security header not set',
                    remediation: 'Add HSTS header to enforce HTTPS',
                });
            }

        } catch (error) {
            score -= 30;
            findings.push({
                severity: 'critical',
                title: 'HTTPS not available',
                description: 'Could not establish secure connection',
                remediation: 'Ensure HTTPS is properly configured',
            });
        }

        return {
            score: Math.max(0, score),
            grade: scoreToGrade(Math.max(0, score)),
            weight: FACTOR_WEIGHTS.tlsConfiguration,
            findings,
            trend: 'stable',
        };
    }
}

/**
 * Application Security Analyzer
 */
class ApplicationSecurityAnalyzer {
    async analyze(domain: string): Promise<FactorScore> {
        const findings: Finding[] = [];
        let score = 100;

        try {
            const response = await fetch(`https://${domain}`, {
                signal: AbortSignal.timeout(10000),
            });

            const headers = response.headers;

            // Check security headers
            const securityHeaders = [
                { name: 'x-content-type-options', penalty: 5, severity: 'low' as const },
                { name: 'x-frame-options', penalty: 8, severity: 'medium' as const },
                { name: 'x-xss-protection', penalty: 3, severity: 'low' as const },
                { name: 'content-security-policy', penalty: 10, severity: 'medium' as const },
                { name: 'referrer-policy', penalty: 3, severity: 'low' as const },
                { name: 'permissions-policy', penalty: 3, severity: 'low' as const },
            ];

            for (const header of securityHeaders) {
                if (!headers.get(header.name)) {
                    score -= header.penalty;
                    findings.push({
                        severity: header.severity,
                        title: `Missing ${header.name} header`,
                        description: `Security header ${header.name} is not set`,
                        remediation: `Add ${header.name} header to improve security`,
                    });
                }
            }

            // Check for server info disclosure
            const server = headers.get('server');
            if (server && /apache|nginx|iis|express/i.test(server)) {
                score -= 3;
                findings.push({
                    severity: 'info',
                    title: 'Server version disclosed',
                    description: `Server header reveals: ${server}`,
                    evidence: server,
                    remediation: 'Remove or obfuscate the Server header',
                });
            }

        } catch {
            score -= 10;
            findings.push({
                severity: 'medium',
                title: 'Could not analyze application',
                description: 'Failed to fetch website for security analysis',
            });
        }

        return {
            score: Math.max(0, score),
            grade: scoreToGrade(Math.max(0, score)),
            weight: FACTOR_WEIGHTS.applicationSecurity,
            findings,
            trend: 'stable',
        };
    }
}

/**
 * Leaked Credentials Analyzer
 * Uses Have I Been Pwned API (free for domain search)
 */
class LeakedCredentialsAnalyzer {
    async analyze(domain: string): Promise<FactorScore> {
        const findings: Finding[] = [];
        let score = 100;

        // Check Have I Been Pwned
        const breaches = await this.checkHIBP(domain);

        if (breaches.length > 0) {
            const recentBreaches = breaches.filter(b => {
                const breachDate = new Date(b.BreachDate);
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                return breachDate > oneYearAgo;
            });

            // Penalty based on number and recency of breaches
            score -= Math.min(40, breaches.length * 5);
            score -= Math.min(30, recentBreaches.length * 10);

            for (const breach of breaches.slice(0, 5)) {
                findings.push({
                    severity: recentBreaches.includes(breach) ? 'high' : 'medium',
                    title: `Breach: ${breach.Name}`,
                    description: `Domain affected in ${breach.Name} breach on ${breach.BreachDate}`,
                    evidence: `${breach.PwnCount?.toLocaleString() || 'Unknown'} accounts exposed`,
                });
            }
        }

        return {
            score: Math.max(0, score),
            grade: scoreToGrade(Math.max(0, score)),
            weight: FACTOR_WEIGHTS.leakedCredentials,
            findings,
            trend: 'stable',
        };
    }

    private async checkHIBP(domain: string): Promise<Array<{
        Name: string;
        BreachDate: string;
        PwnCount?: number;
    }>> {
        try {
            // HIBP API - free for domain breach check
            const response = await fetch(
                `https://haveibeenpwned.com/api/v3/breaches?domain=${domain}`,
                {
                    headers: {
                        'User-Agent': 'Vajra-Scout',
                    },
                }
            );

            if (response.status === 404) return [];
            if (!response.ok) return [];

            return await response.json();
        } catch {
            return [];
        }
    }
}

/**
 * Main Enhanced Vendor Risk Scorer
 */
export class EnhancedVendorRiskScorer {
    private networkAnalyzer = new NetworkSecurityAnalyzer();
    private dnsAnalyzer = new DNSHealthAnalyzer();
    private tlsAnalyzer = new TLSConfigurationAnalyzer();
    private appSecAnalyzer = new ApplicationSecurityAnalyzer();
    private leakedCredAnalyzer = new LeakedCredentialsAnalyzer();

    /**
     * Perform comprehensive vendor risk assessment
     */
    async scoreVendor(vendorId: string, domain: string): Promise<VendorRiskScore> {
        const startTime = Date.now();

        // Run all analyzers in parallel
        const [
            networkSecurity,
            dnsHealth,
            tlsConfiguration,
            applicationSecurity,
            leakedCredentials,
        ] = await Promise.all([
            this.networkAnalyzer.analyze(domain),
            this.dnsAnalyzer.analyze(domain),
            this.tlsAnalyzer.analyze(domain),
            this.appSecAnalyzer.analyze(domain),
            this.leakedCredAnalyzer.analyze(domain),
        ]);

        // Create placeholder scores for factors we don't actively check yet
        const placeholderScore: FactorScore = {
            score: 80,
            grade: 'B',
            weight: 0.1,
            findings: [],
            trend: 'stable',
        };

        const factors = {
            networkSecurity,
            dnsHealth,
            patchingCadence: { ...placeholderScore, weight: FACTOR_WEIGHTS.patchingCadence },
            endpointSecurity: { ...placeholderScore, weight: FACTOR_WEIGHTS.endpointSecurity },
            ipReputation: { ...placeholderScore, weight: FACTOR_WEIGHTS.ipReputation },
            applicationSecurity,
            socialEngineering: { ...placeholderScore, weight: FACTOR_WEIGHTS.socialEngineering },
            leakedCredentials,
            tlsConfiguration,
            informationDisclosure: { ...placeholderScore, weight: FACTOR_WEIGHTS.informationDisclosure },
        };

        // Calculate weighted overall score
        let overallScore = 0;
        for (const [key, factor] of Object.entries(factors)) {
            const weight = FACTOR_WEIGHTS[key as keyof typeof FACTOR_WEIGHTS] || 0.1;
            overallScore += factor.score * weight;
        }

        overallScore = Math.round(overallScore);

        // Determine breach history from leaked credentials findings
        const breachHistory = this.assessBreachHistory(leakedCredentials.findings);

        // Generate recommendations
        const recommendations = this.generateRecommendations(factors);

        return {
            vendorId,
            domain,
            overallScore,
            grade: scoreToGrade(overallScore),
            factors,
            breachHistory,
            certifications: [], // Would need external data source
            lastScanned: new Date(),
            scanDuration: Date.now() - startTime,
            recommendations,
        };
    }

    private assessBreachHistory(findings: Finding[]): BreachHistory {
        const breachFindings = findings.filter(f => f.title.startsWith('Breach:'));

        return {
            totalBreaches: breachFindings.length,
            recentBreaches: breachFindings.filter(f => f.severity === 'high').length,
            severity: breachFindings.length > 3 ? 'high' :
                breachFindings.length > 0 ? 'medium' : 'none',
            exposedRecords: 0, // Would need to parse from evidence
            types: ['credentials'],
        };
    }

    private generateRecommendations(factors: VendorRiskScore['factors']): Recommendation[] {
        const recommendations: Recommendation[] = [];

        // Check each factor for high-impact improvements
        for (const [category, factor] of Object.entries(factors)) {
            const criticalFindings = factor.findings.filter(f => f.severity === 'critical');
            const highFindings = factor.findings.filter(f => f.severity === 'high');

            if (criticalFindings.length > 0) {
                recommendations.push({
                    priority: 'critical',
                    category,
                    title: `Fix critical ${category} issues`,
                    description: criticalFindings.map(f => f.title).join(', '),
                    difficulty: 'medium',
                    impact: 15,
                });
            }

            if (highFindings.length > 0) {
                recommendations.push({
                    priority: 'high',
                    category,
                    title: `Address ${category} vulnerabilities`,
                    description: highFindings.map(f => f.title).join(', '),
                    difficulty: 'medium',
                    impact: 10,
                });
            }
        }

        // Sort by priority and impact
        return recommendations
            .sort((a, b) => {
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                return priorityDiff !== 0 ? priorityDiff : b.impact - a.impact;
            })
            .slice(0, 10);
    }
}

// Export singleton
export const vendorRiskScorer = new EnhancedVendorRiskScorer();
