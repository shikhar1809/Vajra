import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ThreatFeedAggregator } from '@/lib/sentry/threat-feeds';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

interface DocumentScanResult {
    filename: string;
    fileHash: string;
    fileSize: number;
    fileType: string;
    threatLevel: 'safe' | 'suspicious' | 'dangerous' | 'malicious';
    isSafe: boolean;
    threats: string[];
    recommendations: string[];
    metadata: {
        hasMacros?: boolean;
        hasScripts?: boolean;
        hasEmbeddedFiles?: boolean;
        suspiciousPatterns?: string[];
    };
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'File size exceeds 10MB limit' },
                { status: 400 }
            );
        }

        // Read file buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Calculate file hash
        const sha256Hash = crypto.createHash('sha256').update(buffer).digest('hex');
        const md5Hash = crypto.createHash('md5').update(buffer).digest('hex');

        // Initialize scan result
        const result: DocumentScanResult = {
            filename: file.name,
            fileHash: sha256Hash,
            fileSize: file.size,
            fileType: file.type || 'unknown',
            threatLevel: 'safe',
            isSafe: true,
            threats: [],
            recommendations: [],
            metadata: {},
        };

        // 1. Check hash against malware database
        const hashCheck = await checkMalwareHash(sha256Hash, md5Hash);
        if (hashCheck.isMalicious) {
            result.threatLevel = 'malicious';
            result.isSafe = false;
            result.threats.push(`Known malware detected: ${hashCheck.family || 'Unknown family'}`);
            result.recommendations.push('DO NOT open this file');
            result.recommendations.push('Delete immediately');
            result.recommendations.push('Run full system scan');
        }

        // 2. Check file type and extension
        const extensionCheck = checkFileExtension(file.name, file.type);
        if (extensionCheck.suspicious) {
            result.threatLevel = result.threatLevel === 'safe' ? 'suspicious' : result.threatLevel;
            result.threats.push(...extensionCheck.threats);
            result.recommendations.push(...extensionCheck.recommendations);
        }

        // 3. Analyze file content
        const contentAnalysis = await analyzeFileContent(buffer, file.name);
        if (contentAnalysis.threats.length > 0) {
            result.threatLevel = contentAnalysis.threatLevel;
            result.isSafe = contentAnalysis.isSafe;
            result.threats.push(...contentAnalysis.threats);
            result.recommendations.push(...contentAnalysis.recommendations);
            result.metadata = { ...result.metadata, ...contentAnalysis.metadata };
        }

        // 4. Save scan result to database
        await saveScanResult(result);

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Document scan error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Scan failed',
            },
            { status: 500 }
        );
    }
}

/**
 * Check if file hash matches known malware
 */
async function checkMalwareHash(sha256: string, md5: string): Promise<{
    isMalicious: boolean;
    family?: string;
}> {
    // Check SHA256
    if (!supabase) return { isMalicious: false };

    const { data: sha256Match } = await supabase
        .from('malware_hashes')
        .select('malware_family, threat_level')
        .eq('hash', sha256)
        .single();

    if (sha256Match) {
        return { isMalicious: true, family: sha256Match.malware_family };
    }

    // Check MD5
    const { data: md5Match } = await supabase
        .from('malware_hashes')
        .select('malware_family, threat_level')
        .eq('hash', md5)
        .single();

    if (md5Match) {
        return { isMalicious: true, family: md5Match.malware_family };
    }

    // Check with MalwareBazaar API
    try {
        const apiKey = process.env.MALWAREBAZAAR_API_KEY;
        if (apiKey) {
            const aggregator = new ThreatFeedAggregator(apiKey);
            const apiCheck = await aggregator.checkHash(sha256);
            if (apiCheck.isMalicious) {
                return { isMalicious: true, family: apiCheck.details?.signature };
            }
        }
    } catch (error) {
        console.error('MalwareBazaar API check failed:', error);
    }

    return { isMalicious: false };
}

/**
 * Check for suspicious file extensions
 */
function checkFileExtension(filename: string, mimeType: string): {
    suspicious: boolean;
    threats: string[];
    recommendations: string[];
} {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const threats: string[] = [];
    const recommendations: string[] = [];

    // Executable files
    const executableExtensions = ['exe', 'bat', 'cmd', 'com', 'scr', 'vbs', 'js'];
    if (executableExtensions.includes(extension)) {
        threats.push('Executable file detected - high risk');
        recommendations.push('Only run if from trusted source');
        recommendations.push('Scan with antivirus before executing');
        return { suspicious: true, threats, recommendations };
    }

    // Double extensions (e.g., file.pdf.exe)
    const parts = filename.split('.');
    if (parts.length > 2) {
        threats.push('Multiple file extensions detected - possible disguise attempt');
        recommendations.push('Verify file authenticity');
        return { suspicious: true, threats, recommendations };
    }

    // Extension mismatch
    const mimeExtensionMap: Record<string, string[]> = {
        'application/pdf': ['pdf'],
        'application/zip': ['zip'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    };

    if (mimeType && mimeExtensionMap[mimeType]) {
        if (!mimeExtensionMap[mimeType].includes(extension)) {
            threats.push('File extension does not match content type');
            recommendations.push('File may be disguised as another type');
            return { suspicious: true, threats, recommendations };
        }
    }

    return { suspicious: false, threats, recommendations };
}

/**
 * Analyze file content for threats
 */
async function analyzeFileContent(buffer: Buffer, filename: string): Promise<{
    threatLevel: 'safe' | 'suspicious' | 'dangerous' | 'malicious';
    isSafe: boolean;
    threats: string[];
    recommendations: string[];
    metadata: any;
}> {
    const threats: string[] = [];
    const recommendations: string[] = [];
    const metadata: any = {};
    let threatLevel: 'safe' | 'suspicious' | 'dangerous' | 'malicious' = 'safe';

    // Convert buffer to string for pattern matching
    const content = buffer.toString('binary');

    // Check for macros (Office documents)
    if (content.includes('vbaProject') || content.includes('macros/')) {
        threats.push('VBA macros detected in document');
        recommendations.push('Enable macro protection');
        recommendations.push('Only enable macros if document is from trusted source');
        metadata.hasMacros = true;
        threatLevel = 'suspicious';
    }

    // Check for embedded scripts
    if (content.includes('<script') || content.includes('javascript:')) {
        threats.push('Embedded JavaScript detected');
        recommendations.push('Review script content before opening');
        metadata.hasScripts = true;
        threatLevel = 'suspicious';
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
        'powershell',
        'cmd.exe',
        'wscript',
        'cscript',
        'regsvr32',
        'rundll32',
    ];

    const foundPatterns: string[] = [];
    for (const pattern of suspiciousPatterns) {
        if (content.toLowerCase().includes(pattern)) {
            foundPatterns.push(pattern);
        }
    }

    if (foundPatterns.length > 0) {
        threats.push(`Suspicious system commands found: ${foundPatterns.join(', ')}`);
        recommendations.push('File may attempt to execute system commands');
        metadata.suspiciousPatterns = foundPatterns;
        threatLevel = 'dangerous';
    }

    // Check for embedded files (ZIP, RAR)
    if (content.includes('PK\x03\x04') || content.includes('Rar!')) {
        metadata.hasEmbeddedFiles = true;
    }

    return {
        threatLevel,
        isSafe: threatLevel === 'safe',
        threats,
        recommendations,
        metadata,
    };
}

/**
 * Save scan result to database
 */
async function saveScanResult(result: DocumentScanResult): Promise<void> {
    if (!supabase) return;
    await supabase.from('document_scan_history').insert({
        filename: result.filename,
        file_hash: result.fileHash,
        file_size: result.fileSize,
        file_type: result.fileType,
        threat_level: result.threatLevel,
        is_safe: result.isSafe,
        threats: result.threats,
        metadata: result.metadata,
    });
}
