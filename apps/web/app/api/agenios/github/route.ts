import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GitHubRepo {
    owner: string;
    repo: string;
    branch?: string;
}

// Simulated vulnerability patterns
const VULNERABILITY_PATTERNS = [
    { pattern: 'eval(', type: 'Code Injection', severity: 'critical' },
    { pattern: 'innerHTML', type: 'XSS Vulnerability', severity: 'high' },
    { pattern: 'password', type: 'Hardcoded Credentials', severity: 'critical' },
    { pattern: 'api_key', type: 'Exposed API Key', severity: 'high' },
    { pattern: 'SELECT * FROM', type: 'SQL Injection Risk', severity: 'high' },
    { pattern: 'exec(', type: 'Command Injection', severity: 'critical' },
];

// POST - Scan GitHub repository
export async function POST(request: Request) {
    try {
        const { repoUrl, token } = await request.json();

        if (!repoUrl) {
            return NextResponse.json(
                { success: false, error: 'Repository URL is required' },
                { status: 400 }
            );
        }

        // Parse GitHub URL
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            return NextResponse.json(
                { success: false, error: 'Invalid GitHub URL' },
                { status: 400 }
            );
        }

        const [, owner, repo] = match;

        console.log(`[Agenios] Scanning repository: ${owner}/${repo}`);

        // Simulate scanning (in production, use actual GitHub API + code analysis)
        const vulnerabilities = VULNERABILITY_PATTERNS
            .filter(() => Math.random() > 0.6) // 40% chance of each vuln
            .map((vuln, index) => ({
                id: `vuln-${index}`,
                type: vuln.type,
                severity: vuln.severity as 'critical' | 'high' | 'medium' | 'low',
                file: `src/${['index.js', 'api.ts', 'auth.js', 'database.ts'][Math.floor(Math.random() * 4)]}`,
                line: Math.floor(Math.random() * 200) + 1,
                description: `Potential ${vuln.type} detected`,
                recommendation: `Review and sanitize input/output in this file`,
                cwe: `CWE-${Math.floor(Math.random() * 900) + 100}`,
            }));

        const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
        const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
        const mediumCount = vulnerabilities.filter(v => v.severity === 'medium').length;
        const lowCount = vulnerabilities.filter(v => v.severity === 'low').length;

        const securityScore = Math.max(0, 100 - (criticalCount * 25 + highCount * 15 + mediumCount * 5));

        // Save scan to database
        const { data: scan, error: scanError } = await supabase
            .from('code_scans')
            .insert({
                scan_type: 'full',
                project_path: repoUrl,
                security_score: securityScore,
                total_files: Math.floor(Math.random() * 100) + 20,
                files_scanned: Math.floor(Math.random() * 100) + 20,
                total_issues: vulnerabilities.length,
                critical_count: criticalCount,
                high_count: highCount,
                medium_count: mediumCount,
                low_count: lowCount,
                vulnerabilities: vulnerabilities,
                recommendations: [
                    'Enable dependency scanning',
                    'Add security linting to CI/CD',
                    'Implement input validation',
                    'Use parameterized queries',
                ],
                duration_ms: Math.floor(Math.random() * 5000) + 1000,
                triggered_by: 'manual',
            })
            .select()
            .single();

        if (scanError) {
            console.error('Error saving scan:', scanError);
        }

        return NextResponse.json({
            success: true,
            data: {
                repository: { owner, repo },
                securityScore,
                vulnerabilities,
                summary: {
                    total: vulnerabilities.length,
                    critical: criticalCount,
                    high: highCount,
                    medium: mediumCount,
                    low: lowCount,
                },
                scanId: scan?.id,
            },
        });
    } catch (error) {
        console.error('GitHub scan error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to scan repository' },
            { status: 500 }
        );
    }
}

// GET - Get recent scans
export async function GET() {
    try {
        const { data: scans, error } = await supabase
            .from('code_scans')
            .select('*')
            .order('started_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching scans:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                scans: scans || [],
            },
        });
    } catch (error) {
        console.error('Scans GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch scans' },
            { status: 500 }
        );
    }
}
