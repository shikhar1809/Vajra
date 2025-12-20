'use server';

import fs from 'fs/promises';
import path from 'path';

export interface SystemScanResult {
    dependencies: {
        total: number;
        vulnerable: number;
        list: Array<{ name: string; version: string; status: 'safe' | 'warning' | 'critical' }>;
    };
    environment: {
        score: number;
        issues: string[];
    };
    system: {
        platform: string;
        nodeVersion: string;
        memoryUsage: string;
    };
    scanDate: string;
}

// Mock database of known vulnerable packages for demonstration
const VULNERABLE_PACKAGES = {
    'lodash': '4.17.20', // Example
    'axios': '0.21.0',
    'express': '4.16.0'
};

export async function scanSystem(): Promise<SystemScanResult> {
    const result: SystemScanResult = {
        dependencies: { total: 0, vulnerable: 0, list: [] },
        environment: { score: 100, issues: [] },
        system: {
            platform: process.platform,
            nodeVersion: process.version,
            memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
        },
        scanDate: new Date().toISOString()
    };

    try {
        // 1. Scan package.json
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        for (const [name, version] of Object.entries(deps)) {
            let status: 'safe' | 'warning' | 'critical' = 'safe';

            // Check against mock vulnerability DB
            // (In production, checking against actual semver match)
            if (Object.keys(VULNERABLE_PACKAGES).includes(name)) {
                status = 'warning'; // Just flagging for demo
            }

            // Flag debug libraries in production
            if (name.includes('debug') || name.includes('console')) {
                status = 'warning';
            }

            if (status !== 'safe') {
                result.dependencies.vulnerable++;
            }

            result.dependencies.list.push({
                name,
                version: version as string,
                status
            });
        }
        result.dependencies.total = result.dependencies.list.length;

        // 2. Scan Environment
        if (process.env.NODE_ENV !== 'production') {
            result.environment.score -= 20;
            result.environment.issues.push('Running in non-production mode');
        }

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            result.environment.score -= 50;
            result.environment.issues.push('Missing Supabase Config');
        }

        // Check for exposed secrets (heuristic)
        const envKeys = Object.keys(process.env);
        const dangerousKeys = envKeys.filter(k => k.includes('SECRET') || k.includes('KEY'));

        // This is just a simulation of checking if secrets are exposed to client, 
        // essentially we just confirm they exist on server which is good.
        if (dangerousKeys.length === 0) {
            // Maybe warning if no secrets found?
        }

    } catch (error) {
        console.error('System Scan Failed:', error);
        result.environment.issues.push('Failed to read system configuration');
    }

    return result;
}
