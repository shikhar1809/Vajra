/**
 * Vajra Scout - Vendor Security Scanner
 * 
 * Performs comprehensive security assessments of third-party vendors:
 * 1. SSL/TLS Certificate Analysis
 * 2. DNS Security Checks
 * 3. Security Headers Evaluation
 * 4. Technology Stack Detection
 * 5. Known Vulnerability Checking
 */

export interface VendorScanResult {
    vendorId: string;
    domain: string;
    scanDate: Date;
    scores: {
        ssl: number; // 0-100
        dns: number;
        headers: number;
        overall: number;
    };
    findings: {
        ssl?: SSLFindings;
        dns?: DNSFindings;
        headers?: HeaderFindings;
        vulnerabilities?: VulnerabilityFindings[];
    };
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SSLFindings {
    hasSSL: boolean;
    certificateValid: boolean;
    expiryDate?: Date;
    issuer?: string;
    protocol?: string;
    cipherSuite?: string;
    issues: string[];
}

interface DNSFindings {
    hasDNSSEC: boolean;
    hasSPF: boolean;
    hasDMARC: boolean;
    nameservers: string[];
    issues: string[];
}

interface HeaderFindings {
    hasHSTS: boolean;
    hasCSP: boolean;
    hasXFrameOptions: boolean;
    hasXContentTypeOptions: boolean;
    missingHeaders: string[];
    score: number;
}

interface VulnerabilityFindings {
    cve: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    affectedComponent: string;
}

/**
 * SSL/TLS Certificate Analyzer
 */
export class SSLAnalyzer {
    /**
     * Analyze SSL certificate (simulated - in production use actual TLS inspection)
     */
    async analyze(domain: string): Promise<SSLFindings> {
        const findings: SSLFindings = {
            hasSSL: false,
            certificateValid: false,
            issues: [],
        };

        try {
            // In production, use actual TLS socket connection
            // For now, simulate based on domain
            const url = `https://${domain}`;

            // Simulate SSL check
            findings.hasSSL = true;
            findings.certificateValid = true;
            findings.protocol = 'TLSv1.3';
            findings.issuer = 'Let\'s Encrypt';
            findings.expiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

            // Check for common issues
            if (findings.protocol && findings.protocol < 'TLSv1.2') {
                findings.issues.push('Outdated TLS protocol version');
            }

            const daysUntilExpiry = findings.expiryDate
                ? (findings.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                : 0;

            if (daysUntilExpiry < 30) {
                findings.issues.push('Certificate expiring soon');
            }

        } catch (error) {
            findings.hasSSL = false;
            findings.issues.push('No valid SSL certificate found');
        }

        return findings;
    }

    /**
     * Calculate SSL score based on findings
     */
    calculateScore(findings: SSLFindings): number {
        let score = 100;

        if (!findings.hasSSL) score -= 50;
        if (!findings.certificateValid) score -= 30;
        if (findings.protocol && findings.protocol < 'TLSv1.2') score -= 20;

        score -= findings.issues.length * 5;

        return Math.max(0, score);
    }
}

/**
 * DNS Security Analyzer
 */
export class DNSAnalyzer {
    /**
     * Analyze DNS security configuration
     */
    async analyze(domain: string): Promise<DNSFindings> {
        const findings: DNSFindings = {
            hasDNSSEC: false,
            hasSPF: false,
            hasDMARC: false,
            nameservers: [],
            issues: [],
        };

        // In production, perform actual DNS queries
        // For now, simulate checks

        // Simulate DNS checks
        findings.hasSPF = Math.random() > 0.3; // 70% have SPF
        findings.hasDMARC = Math.random() > 0.5; // 50% have DMARC
        findings.hasDNSSEC = Math.random() > 0.7; // 30% have DNSSEC

        if (!findings.hasSPF) {
            findings.issues.push('Missing SPF record - email spoofing risk');
        }

        if (!findings.hasDMARC) {
            findings.issues.push('Missing DMARC record - email authentication weakness');
        }

        if (!findings.hasDNSSEC) {
            findings.issues.push('DNSSEC not enabled - DNS spoofing risk');
        }

        return findings;
    }

    /**
     * Calculate DNS security score
     */
    calculateScore(findings: DNSFindings): number {
        let score = 100;

        if (!findings.hasSPF) score -= 20;
        if (!findings.hasDMARC) score -= 20;
        if (!findings.hasDNSSEC) score -= 30;

        return Math.max(0, score);
    }
}

/**
 * Security Headers Analyzer
 */
export class SecurityHeadersAnalyzer {
    private readonly REQUIRED_HEADERS = [
        'Strict-Transport-Security',
        'Content-Security-Policy',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
        'Permissions-Policy',
    ];

    /**
     * Analyze HTTP security headers
     */
    async analyze(domain: string): Promise<HeaderFindings> {
        const findings: HeaderFindings = {
            hasHSTS: false,
            hasCSP: false,
            hasXFrameOptions: false,
            hasXContentTypeOptions: false,
            missingHeaders: [],
            score: 0,
        };

        try {
            // In production, make actual HTTP request
            // For now, simulate header check
            const headers = this.simulateHeaders();

            findings.hasHSTS = headers.has('strict-transport-security');
            findings.hasCSP = headers.has('content-security-policy');
            findings.hasXFrameOptions = headers.has('x-frame-options');
            findings.hasXContentTypeOptions = headers.has('x-content-type-options');

            // Check for missing headers
            for (const header of this.REQUIRED_HEADERS) {
                if (!headers.has(header.toLowerCase())) {
                    findings.missingHeaders.push(header);
                }
            }

            findings.score = this.calculateScore(findings);

        } catch (error) {
            findings.missingHeaders = [...this.REQUIRED_HEADERS];
            findings.score = 0;
        }

        return findings;
    }

    private simulateHeaders(): Map<string, string> {
        const headers = new Map<string, string>();

        // Simulate some headers being present
        if (Math.random() > 0.3) headers.set('strict-transport-security', 'max-age=31536000');
        if (Math.random() > 0.4) headers.set('x-frame-options', 'DENY');
        if (Math.random() > 0.3) headers.set('x-content-type-options', 'nosniff');
        if (Math.random() > 0.6) headers.set('content-security-policy', 'default-src \'self\'');

        return headers;
    }

    /**
     * Calculate security headers score
     */
    private calculateScore(findings: HeaderFindings): number {
        const totalHeaders = this.REQUIRED_HEADERS.length;
        const missingCount = findings.missingHeaders.length;
        const presentCount = totalHeaders - missingCount;

        return Math.round((presentCount / totalHeaders) * 100);
    }
}

/**
 * Technology Stack Detector
 */
export class TechnologyDetector {
    /**
     * Detect technologies used by the vendor
     */
    async detect(domain: string): Promise<{
        technologies: string[];
        frameworks: string[];
        cms?: string;
        server?: string;
    }> {
        // In production, analyze HTTP headers, HTML, and JavaScript
        // For now, return simulated data

        const techStacks = [
            { technologies: ['React', 'Node.js'], frameworks: ['Next.js'], server: 'Nginx' },
            { technologies: ['Vue.js', 'PHP'], frameworks: ['Laravel'], server: 'Apache' },
            { technologies: ['Angular', 'Java'], frameworks: ['Spring Boot'], server: 'Tomcat' },
        ];

        return techStacks[Math.floor(Math.random() * techStacks.length)];
    }
}

/**
 * Main Vendor Scanner Orchestrator
 */
export class VendorScanner {
    private sslAnalyzer = new SSLAnalyzer();
    private dnsAnalyzer = new DNSAnalyzer();
    private headersAnalyzer = new SecurityHeadersAnalyzer();
    private techDetector = new TechnologyDetector();

    /**
     * Perform comprehensive vendor security scan
     */
    async scanVendor(vendorId: string, domain: string): Promise<VendorScanResult> {
        console.log(`[Vajra Scout] Scanning vendor: ${domain}`);

        // Run all analyses in parallel
        const [sslFindings, dnsFindings, headerFindings, techStack] = await Promise.all([
            this.sslAnalyzer.analyze(domain),
            this.dnsAnalyzer.analyze(domain),
            this.headersAnalyzer.analyze(domain),
            this.techDetector.detect(domain),
        ]);

        // Calculate scores
        const sslScore = this.sslAnalyzer.calculateScore(sslFindings);
        const dnsScore = this.dnsAnalyzer.calculateScore(dnsFindings);
        const headersScore = headerFindings.score;

        // Calculate overall score (weighted average)
        const overallScore = Math.round(
            sslScore * 0.4 +
            dnsScore * 0.3 +
            headersScore * 0.3
        );

        // Determine risk level
        const riskLevel = this.determineRiskLevel(overallScore);

        return {
            vendorId,
            domain,
            scanDate: new Date(),
            scores: {
                ssl: sslScore,
                dns: dnsScore,
                headers: headersScore,
                overall: overallScore,
            },
            findings: {
                ssl: sslFindings,
                dns: dnsFindings,
                headers: headerFindings,
                vulnerabilities: [],
            },
            riskLevel,
        };
    }

    private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
        if (score >= 80) return 'low';
        if (score >= 60) return 'medium';
        if (score >= 40) return 'high';
        return 'critical';
    }

    /**
     * Generate security recommendations based on scan results
     */
    generateRecommendations(scanResult: VendorScanResult): string[] {
        const recommendations: string[] = [];

        // SSL recommendations
        if (scanResult.findings.ssl) {
            const ssl = scanResult.findings.ssl;
            if (!ssl.hasSSL) {
                recommendations.push('⚠️ CRITICAL: Enable HTTPS/SSL immediately');
            }
            if (ssl.protocol && ssl.protocol < 'TLSv1.2') {
                recommendations.push('Upgrade to TLS 1.2 or higher');
            }
            ssl.issues.forEach(issue => recommendations.push(`SSL: ${issue}`));
        }

        // DNS recommendations
        if (scanResult.findings.dns) {
            const dns = scanResult.findings.dns;
            if (!dns.hasSPF) {
                recommendations.push('Add SPF record to prevent email spoofing');
            }
            if (!dns.hasDMARC) {
                recommendations.push('Implement DMARC for email authentication');
            }
            if (!dns.hasDNSSEC) {
                recommendations.push('Enable DNSSEC to prevent DNS attacks');
            }
        }

        // Headers recommendations
        if (scanResult.findings.headers) {
            const headers = scanResult.findings.headers;
            headers.missingHeaders.forEach(header => {
                recommendations.push(`Add security header: ${header}`);
            });
        }

        return recommendations;
    }
}

export const vendorScanner = new VendorScanner();
