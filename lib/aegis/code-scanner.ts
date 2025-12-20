/**
 * Vajra Aegis - Enhanced Code Security Scanner
 * 
 * Wiz/Snyk-inspired code security analysis
 * Features:
 * - Multi-engine SAST scanning
 * - Dependency vulnerability checking (SCA)
 * - Secret detection
 * - AI-enhanced analysis
 * - Remediation suggestions
 */

import { llm } from '../llm/llm-provider';
import { securityGraph } from '../graph/security-graph';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ScanResult {
    id: string;
    scanType: 'sast' | 'sca' | 'secrets' | 'full';
    startTime: Date;
    endTime: Date;
    duration: number;

    summary: {
        totalFiles: number;
        filesScanned: number;
        totalIssues: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
    };

    vulnerabilities: Vulnerability[];
    dependencies: DependencyIssue[];
    secrets: SecretFinding[];

    securityScore: number;
    recommendations: Recommendation[];
}

export interface Vulnerability {
    id: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;

    location: {
        file: string;
        startLine: number;
        endLine: number;
        codeSnippet: string;
    };

    cwe?: string;
    cvss?: number;
    mitreAttack?: string[];

    remediation?: {
        description: string;
        fixCode?: string;
        effort: 'low' | 'medium' | 'high';
    };

    aiAnalysis?: string;
}

export interface DependencyIssue {
    package: string;
    installedVersion: string;
    vulnerableVersions: string;
    fixedVersion?: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    cve: string;
    description: string;
    references: string[];
}

export interface SecretFinding {
    type: string;
    severity: 'critical' | 'high' | 'medium';
    file: string;
    line: number;
    match: string;          // Redacted match
    description: string;
    recommendation: string;
}

export interface Recommendation {
    priority: number;
    category: string;
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    affectedFiles: number;
}

// Common vulnerability patterns (Semgrep-style rules)
const VULN_PATTERNS: Array<{
    id: string;
    type: string;
    severity: Vulnerability['severity'];
    pattern: RegExp;
    languages: string[];
    title: string;
    description: string;
    cwe: string;
    fix: string;
}> = [
        {
            id: 'sql-injection',
            type: 'SQL Injection',
            severity: 'critical',
            pattern: /(?:execute|query|raw)\s*\(\s*[`'"].*\$\{.*\}|(?:execute|query|raw)\s*\(\s*.*\+\s*(?:req|request|params|body)/gi,
            languages: ['javascript', 'typescript'],
            title: 'Potential SQL Injection',
            description: 'User input appears to be concatenated directly into SQL query',
            cwe: 'CWE-89',
            fix: 'Use parameterized queries or prepared statements',
        },
        {
            id: 'xss-vulnerability',
            type: 'Cross-Site Scripting',
            severity: 'high',
            pattern: /innerHTML\s*=\s*(?:req|request|params|body|user)|dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html:\s*(?!sanitize)/gi,
            languages: ['javascript', 'typescript'],
            title: 'Potential XSS Vulnerability',
            description: 'User input is directly inserted into HTML without sanitization',
            cwe: 'CWE-79',
            fix: 'Sanitize user input before inserting into HTML',
        },
        {
            id: 'command-injection',
            type: 'Command Injection',
            severity: 'critical',
            pattern: /(?:exec|spawn|execSync|spawnSync)\s*\(\s*[`'"].*\$\{|child_process.*(?:req|request|params|body)/gi,
            languages: ['javascript', 'typescript'],
            title: 'Potential Command Injection',
            description: 'User input may be executed as system command',
            cwe: 'CWE-78',
            fix: 'Avoid executing user input as commands or use strict input validation',
        },
        {
            id: 'path-traversal',
            type: 'Path Traversal',
            severity: 'high',
            pattern: /(?:readFile|writeFile|unlink|readdir)\s*\(\s*(?:req|request|params|body)|path\.join\s*\([^)]*(?:req|request|params|body)/gi,
            languages: ['javascript', 'typescript'],
            title: 'Potential Path Traversal',
            description: 'User input used in file path operations',
            cwe: 'CWE-22',
            fix: 'Validate and sanitize file paths, use path.basename()',
        },
        {
            id: 'hardcoded-secret',
            type: 'Hardcoded Secret',
            severity: 'high',
            pattern: /(?:password|secret|api_key|apikey|token|auth)\s*[:=]\s*["'][^"']{8,}["']/gi,
            languages: ['javascript', 'typescript', 'python'],
            title: 'Hardcoded Secret',
            description: 'Sensitive value appears to be hardcoded',
            cwe: 'CWE-798',
            fix: 'Use environment variables or a secrets manager',
        },
        {
            id: 'weak-crypto',
            type: 'Weak Cryptography',
            severity: 'medium',
            pattern: /createHash\s*\(\s*["'](?:md5|sha1)["']\)|crypto\.(?:createCipher|createDecipher)\s*\(/gi,
            languages: ['javascript', 'typescript'],
            title: 'Weak Cryptographic Algorithm',
            description: 'Using deprecated or weak cryptographic functions',
            cwe: 'CWE-327',
            fix: 'Use SHA-256 or stronger hashing and AES-GCM for encryption',
        },
        {
            id: 'insecure-random',
            type: 'Insecure Randomness',
            severity: 'medium',
            pattern: /Math\.random\s*\(\)\s*(?:.*(?:token|secret|key|password|id))/gi,
            languages: ['javascript', 'typescript'],
            title: 'Insecure Random Number Generation',
            description: 'Using Math.random() for security-sensitive operations',
            cwe: 'CWE-330',
            fix: 'Use crypto.randomBytes() or crypto.randomUUID()',
        },
        {
            id: 'eval-usage',
            type: 'Code Injection',
            severity: 'critical',
            pattern: /\beval\s*\(|new\s+Function\s*\([^)]*(?:req|request|params|body)/gi,
            languages: ['javascript', 'typescript'],
            title: 'Dangerous eval() Usage',
            description: 'eval() or Function constructor with user input',
            cwe: 'CWE-94',
            fix: 'Avoid eval() entirely, use safer alternatives',
        },
    ];

// Secret patterns
const SECRET_PATTERNS: Array<{
    type: string;
    pattern: RegExp;
    severity: SecretFinding['severity'];
}> = [
        { type: 'AWS Access Key', pattern: /(?:AKIA|A3T|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g, severity: 'critical' },
        { type: 'AWS Secret Key', pattern: /[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])/g, severity: 'critical' },
        { type: 'GitHub Token', pattern: /ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|ghu_[a-zA-Z0-9]{36}|ghs_[a-zA-Z0-9]{36}|ghr_[a-zA-Z0-9]{36}/g, severity: 'critical' },
        { type: 'Google API Key', pattern: /AIza[0-9A-Za-z-_]{35}/g, severity: 'high' },
        { type: 'Slack Token', pattern: /xox[baprs]-[0-9]{10,13}-[a-zA-Z0-9-]+/g, severity: 'high' },
        { type: 'Stripe Key', pattern: /sk_live_[a-zA-Z0-9]{24,34}/g, severity: 'critical' },
        { type: 'Private Key', pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g, severity: 'critical' },
        { type: 'JWT Token', pattern: /eyJ[a-zA-Z0-9-_]+\.eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+/g, severity: 'high' },
        { type: 'Database URL', pattern: /(?:mongodb|postgres|mysql|redis):\/\/[^\s'"]+:[^\s'"]+@[^\s'"]+/g, severity: 'critical' },
        { type: 'Generic API Key', pattern: /(?:api[_-]?key|apikey|api[_-]?secret)\s*[:=]\s*["'][a-zA-Z0-9-_]{20,}["']/gi, severity: 'high' },
    ];

// Known vulnerable packages (simplified DB - in production use Snyk/OSV)
const VULNERABLE_PACKAGES: Record<string, Array<{
    vulnerableVersions: string;
    fixedVersion: string;
    severity: DependencyIssue['severity'];
    cve: string;
    description: string;
}>> = {
    'lodash': [{
        vulnerableVersions: '<4.17.21',
        fixedVersion: '4.17.21',
        severity: 'high',
        cve: 'CVE-2021-23337',
        description: 'Command Injection in lodash',
    }],
    'axios': [{
        vulnerableVersions: '<1.6.0',
        fixedVersion: '1.6.0',
        severity: 'high',
        cve: 'CVE-2023-45857',
        description: 'SSRF vulnerability in axios',
    }],
    'express': [{
        vulnerableVersions: '<4.19.2',
        fixedVersion: '4.19.2',
        severity: 'medium',
        cve: 'CVE-2024-29041',
        description: 'Open redirect vulnerability',
    }],
    'tar': [{
        vulnerableVersions: '<6.2.1',
        fixedVersion: '6.2.1',
        severity: 'high',
        cve: 'CVE-2024-28863',
        description: 'Denial of Service via crafted tar file',
    }],
    'jsonwebtoken': [{
        vulnerableVersions: '<9.0.0',
        fixedVersion: '9.0.0',
        severity: 'critical',
        cve: 'CVE-2022-23529',
        description: 'Improper signature validation',
    }],
    'next': [{
        vulnerableVersions: '<14.1.1',
        fixedVersion: '14.1.1',
        severity: 'high',
        cve: 'CVE-2024-34350',
        description: 'Server-Side Request Forgery',
    }],
};

/**
 * Code Security Scanner Engine
 */
export class CodeSecurityScanner {
    private projectPath: string;

    constructor(projectPath: string) {
        this.projectPath = projectPath;
    }

    /**
     * Perform full security scan
     */
    async scan(options: {
        scanType?: 'sast' | 'sca' | 'secrets' | 'full';
        aiEnhanced?: boolean;
        maxFiles?: number;
    } = {}): Promise<ScanResult> {
        const startTime = new Date();
        const scanType = options.scanType || 'full';

        const vulnerabilities: Vulnerability[] = [];
        const dependencies: DependencyIssue[] = [];
        const secrets: SecretFinding[] = [];

        // Get files to scan
        const files = await this.getSourceFiles(options.maxFiles || 100);

        // SAST Scanning
        if (scanType === 'sast' || scanType === 'full') {
            for (const file of files) {
                const fileVulns = await this.scanFile(file, options.aiEnhanced || false);
                vulnerabilities.push(...fileVulns);
            }
        }

        // SCA - Dependency Scanning
        if (scanType === 'sca' || scanType === 'full') {
            const depIssues = await this.scanDependencies();
            dependencies.push(...depIssues);
        }

        // Secret Scanning
        if (scanType === 'secrets' || scanType === 'full') {
            for (const file of files) {
                const fileSecrets = await this.scanForSecrets(file);
                secrets.push(...fileSecrets);
            }
        }

        const endTime = new Date();

        // Calculate summary
        const summary = {
            totalFiles: files.length,
            filesScanned: files.length,
            totalIssues: vulnerabilities.length + dependencies.length + secrets.length,
            critical: this.countBySeverity([...vulnerabilities, ...dependencies], 'critical'),
            high: this.countBySeverity([...vulnerabilities, ...dependencies], 'high'),
            medium: this.countBySeverity([...vulnerabilities, ...dependencies], 'medium'),
            low: this.countBySeverity([...vulnerabilities, ...dependencies], 'low'),
        };

        // Calculate security score
        const securityScore = this.calculateSecurityScore(summary);

        // Generate recommendations
        const recommendations = this.generateRecommendations(vulnerabilities, dependencies, secrets);

        // Update security graph
        this.updateSecurityGraph(vulnerabilities, dependencies);

        return {
            id: crypto.randomUUID(),
            scanType,
            startTime,
            endTime,
            duration: endTime.getTime() - startTime.getTime(),
            summary,
            vulnerabilities,
            dependencies,
            secrets,
            securityScore,
            recommendations,
        };
    }

    /**
     * Scan a single file for vulnerabilities
     */
    private async scanFile(filePath: string, aiEnhanced: boolean): Promise<Vulnerability[]> {
        const vulnerabilities: Vulnerability[] = [];

        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n');
            const ext = path.extname(filePath);
            const language = this.getLanguage(ext);

            // Run pattern matching
            for (const rule of VULN_PATTERNS) {
                if (!rule.languages.includes(language)) continue;

                const matches = content.matchAll(rule.pattern);

                for (const match of matches) {
                    if (!match.index) continue;

                    const lineNumber = this.getLineNumber(content, match.index);
                    const codeSnippet = lines[lineNumber - 1] || '';

                    const vuln: Vulnerability = {
                        id: crypto.randomUUID(),
                        type: rule.type,
                        severity: rule.severity,
                        title: rule.title,
                        description: rule.description,
                        location: {
                            file: filePath,
                            startLine: lineNumber,
                            endLine: lineNumber,
                            codeSnippet: codeSnippet.trim(),
                        },
                        cwe: rule.cwe,
                        remediation: {
                            description: rule.fix,
                            effort: 'medium',
                        },
                    };

                    vulnerabilities.push(vuln);
                }
            }

            // AI-enhanced analysis for complex vulnerabilities
            if (aiEnhanced && vulnerabilities.length > 0) {
                await this.enhanceWithAI(vulnerabilities, content);
            }

        } catch (error) {
            // File read error - skip
        }

        return vulnerabilities;
    }

    /**
     * Scan for secrets
     */
    private async scanForSecrets(filePath: string): Promise<SecretFinding[]> {
        const secrets: SecretFinding[] = [];

        // Skip certain files
        if (filePath.includes('node_modules') ||
            filePath.includes('.git') ||
            filePath.includes('.lock') ||
            filePath.includes('.min.js')) {
            return secrets;
        }

        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n');

            for (const pattern of SECRET_PATTERNS) {
                const matches = content.matchAll(pattern.pattern);

                for (const match of matches) {
                    if (!match.index) continue;

                    const lineNumber = this.getLineNumber(content, match.index);
                    const matchValue = match[0];

                    // Skip if in comments or test files
                    const line = lines[lineNumber - 1] || '';
                    if (line.trim().startsWith('//') ||
                        line.trim().startsWith('#') ||
                        filePath.includes('.test.') ||
                        filePath.includes('.spec.')) {
                        continue;
                    }

                    secrets.push({
                        type: pattern.type,
                        severity: pattern.severity,
                        file: filePath,
                        line: lineNumber,
                        match: this.redactSecret(matchValue),
                        description: `Potential ${pattern.type} found in source code`,
                        recommendation: 'Use environment variables or a secrets manager',
                    });
                }
            }
        } catch {
            // File read error - skip
        }

        return secrets;
    }

    /**
     * Scan dependencies for vulnerabilities
     */
    private async scanDependencies(): Promise<DependencyIssue[]> {
        const issues: DependencyIssue[] = [];

        try {
            const packageJsonPath = path.join(this.projectPath, 'package.json');
            const content = await fs.readFile(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(content);

            const allDeps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies,
            };

            for (const [pkg, version] of Object.entries(allDeps)) {
                const vulns = VULNERABLE_PACKAGES[pkg];
                if (!vulns) continue;

                for (const vuln of vulns) {
                    // Simple version comparison (in production use semver)
                    const installedVersion = (version as string).replace(/^[\^~]/, '');

                    if (this.isVulnerableVersion(installedVersion, vuln.vulnerableVersions)) {
                        issues.push({
                            package: pkg,
                            installedVersion,
                            vulnerableVersions: vuln.vulnerableVersions,
                            fixedVersion: vuln.fixedVersion,
                            severity: vuln.severity,
                            cve: vuln.cve,
                            description: vuln.description,
                            references: [`https://nvd.nist.gov/vuln/detail/${vuln.cve}`],
                        });
                    }
                }
            }
        } catch {
            // No package.json or parse error
        }

        return issues;
    }

    /**
     * Enhance vulnerabilities with AI analysis
     */
    private async enhanceWithAI(vulnerabilities: Vulnerability[], fileContent: string): Promise<void> {
        // Batch analyze for efficiency
        for (const vuln of vulnerabilities.slice(0, 5)) { // Limit to first 5 for cost
            try {
                const prompt = `
Analyze this potential security vulnerability:

Type: ${vuln.type}
File: ${vuln.location.file}
Line: ${vuln.location.startLine}
Code: ${vuln.location.codeSnippet}

Surrounding context (nearby lines):
${this.getContext(fileContent, vuln.location.startLine)}

Provide:
1. Is this a true positive or false positive?
2. If true positive, how severe is it in context?
3. What's the attack scenario?
4. Suggested fix code if applicable

Be concise.
`;

                const response = await llm.analyzeForSecurity(prompt);
                vuln.aiAnalysis = response.substring(0, 500);

            } catch {
                // AI analysis failed - continue without
            }
        }
    }

    /**
     * Generate recommendations
     */
    private generateRecommendations(
        vulns: Vulnerability[],
        deps: DependencyIssue[],
        secrets: SecretFinding[]
    ): Recommendation[] {
        const recommendations: Recommendation[] = [];

        // Priority 1: Critical vulnerabilities
        const criticalVulns = vulns.filter(v => v.severity === 'critical');
        if (criticalVulns.length > 0) {
            const types = [...new Set(criticalVulns.map(v => v.type))];
            recommendations.push({
                priority: 1,
                category: 'Critical Vulnerabilities',
                title: `Fix ${criticalVulns.length} critical security issues`,
                description: `Found critical vulnerabilities: ${types.join(', ')}`,
                impact: 'Prevents potential system compromise',
                effort: 'high',
                affectedFiles: new Set(criticalVulns.map(v => v.location.file)).size,
            });
        }

        // Priority 2: Secrets
        if (secrets.length > 0) {
            recommendations.push({
                priority: 2,
                category: 'Secret Management',
                title: `Remove ${secrets.length} exposed secrets`,
                description: 'Secrets found in source code should be moved to environment variables',
                impact: 'Prevents credential leakage',
                effort: 'low',
                affectedFiles: new Set(secrets.map(s => s.file)).size,
            });
        }

        // Priority 3: Dependency updates
        const criticalDeps = deps.filter(d => d.severity === 'critical' || d.severity === 'high');
        if (criticalDeps.length > 0) {
            recommendations.push({
                priority: 3,
                category: 'Dependencies',
                title: `Update ${criticalDeps.length} vulnerable packages`,
                description: `Packages with known vulnerabilities: ${criticalDeps.map(d => d.package).join(', ')}`,
                impact: 'Eliminates known vulnerability vectors',
                effort: 'low',
                affectedFiles: 1,
            });
        }

        return recommendations;
    }

    // Helper methods

    private async getSourceFiles(maxFiles: number): Promise<string[]> {
        const files: string[] = [];
        const extensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.go'];
        const ignore = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];

        const walk = async (dir: string): Promise<void> => {
            if (files.length >= maxFiles) return;

            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });

                for (const entry of entries) {
                    if (files.length >= maxFiles) break;

                    const fullPath = path.join(dir, entry.name);

                    if (entry.isDirectory()) {
                        if (!ignore.includes(entry.name)) {
                            await walk(fullPath);
                        }
                    } else {
                        const ext = path.extname(entry.name);
                        if (extensions.includes(ext)) {
                            files.push(fullPath);
                        }
                    }
                }
            } catch {
                // Permission error - skip
            }
        };

        await walk(this.projectPath);
        return files;
    }

    private getLanguage(ext: string): string {
        const map: Record<string, string> = {
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.py': 'python',
            '.rb': 'ruby',
            '.go': 'go',
        };
        return map[ext] || 'unknown';
    }

    private getLineNumber(content: string, index: number): number {
        return content.substring(0, index).split('\n').length;
    }

    private getContext(content: string, lineNumber: number): string {
        const lines = content.split('\n');
        const start = Math.max(0, lineNumber - 3);
        const end = Math.min(lines.length, lineNumber + 2);
        return lines.slice(start, end).join('\n');
    }

    private redactSecret(secret: string): string {
        if (secret.length <= 8) return '*'.repeat(secret.length);
        return secret.substring(0, 4) + '*'.repeat(secret.length - 8) + secret.substring(secret.length - 4);
    }

    private isVulnerableVersion(installed: string, vulnerable: string): boolean {
        // Simplified version check - in production use semver
        if (vulnerable.startsWith('<')) {
            const targetVersion = vulnerable.substring(1);
            return installed < targetVersion;
        }
        return false;
    }

    private countBySeverity(items: Array<{ severity: string }>, severity: string): number {
        return items.filter(i => i.severity === severity).length;
    }

    private calculateSecurityScore(summary: ScanResult['summary']): number {
        // Start with 100, deduct based on issues
        let score = 100;
        score -= summary.critical * 20;
        score -= summary.high * 10;
        score -= summary.medium * 5;
        score -= summary.low * 2;
        return Math.max(0, Math.min(100, score));
    }

    private updateSecurityGraph(vulns: Vulnerability[], deps: DependencyIssue[]): void {
        for (const vuln of vulns) {
            securityGraph.upsertEntity({
                type: 'vulnerability',
                name: vuln.title,
                properties: {
                    type: vuln.type,
                    cwe: vuln.cwe,
                    file: vuln.location.file,
                    line: vuln.location.startLine,
                },
                riskScore: vuln.severity === 'critical' ? 100 : vuln.severity === 'high' ? 75 : 50,
                tags: [vuln.severity, vuln.type],
            });
        }

        for (const dep of deps) {
            securityGraph.upsertEntity({
                type: 'vulnerability',
                name: `${dep.package}@${dep.installedVersion}`,
                properties: {
                    cve: dep.cve,
                    fixedVersion: dep.fixedVersion,
                },
                riskScore: dep.severity === 'critical' ? 100 : dep.severity === 'high' ? 75 : 50,
                tags: [dep.severity, 'dependency'],
            });
        }
    }
}

// Factory function
export function createScanner(projectPath?: string): CodeSecurityScanner {
    return new CodeSecurityScanner(projectPath || process.cwd());
}
