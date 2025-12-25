
import { NextResponse } from 'next/server';
import { createScanner } from '@/lib/aegis/code-scanner';
import simpleGit from 'simple-git';
import * as fs from 'fs/promises';
import * as path from 'path';
import os from 'os';

export async function POST(request: Request) {
    let tempDir = '';
    try {
        const body = await request.json();
        const { repositoryUrl, scanType, aiEnhanced } = body;

        // Validation
        if (!repositoryUrl) {
            return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
        }

        // Create temp directory
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'vajra-scan-'));
        console.log(`[Aegis] Cloning ${repositoryUrl} to ${tempDir}...`);

        // Clone repository
        const git = simpleGit();
        await git.clone(repositoryUrl, tempDir);

        // Run Scan
        console.log('[Aegis] Starting scan...');
        const scanner = createScanner(tempDir);
        const result = await scanner.scan({
            scanType: scanType || 'full',
            aiEnhanced: aiEnhanced !== false,
        });

        // Add repository info to result
        (result.summary as any).repositoryUrl = repositoryUrl;

        return NextResponse.json({
            success: true,
            result,
        });
    } catch (error: any) {
        console.error('[Aegis API] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to scan project',
                details: error.message
            },
            { status: 500 }
        );
    } finally {
        // Cleanup
        if (tempDir) {
            try {
                // Node 14.14+ has recursive: true
                await fs.rm(tempDir, { recursive: true, force: true });
                console.log(`[Aegis] Cleaned up ${tempDir}`);
            } catch (cleanupError) {
                console.error('[Aegis] Cleanup failed:', cleanupError);
            }
        }
    }
}

export async function GET() {
    try {
        // Return mock scan history for now
        return NextResponse.json({
            scans: [
                {
                    id: '1',
                    scanType: 'full',
                    startTime: new Date(Date.now() - 3600000),
                    securityScore: 75,
                    summary: {
                        totalFiles: 150,
                        totalIssues: 12,
                        critical: 1,
                        high: 3,
                        medium: 5,
                        low: 3,
                    },
                },
            ],
        });
    } catch (error) {
        console.error('[Aegis API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch scans' },
            { status: 500 }
        );
    }
}
