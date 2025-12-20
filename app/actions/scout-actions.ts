'use server';

import dns from 'dns';
import https from 'https';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);

export interface VerificationResult {
    domain: string;
    ssl: {
        valid: boolean;
        issuer: string;
        expires: string;
        daysRemaining: number;
    };
    dns: {
        hasSPF: boolean;
        hasDMARC: boolean;
        spfRecord: string | null;
        dmarcRecord: string | null;
    };
    score: number;
    timestamp: string;
}

export async function analyzeVendorDomain(domain: string): Promise<VerificationResult> {
    // Basic URL cleanup
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    const result: VerificationResult = {
        domain: cleanDomain,
        ssl: { valid: false, issuer: 'Unknown', expires: '', daysRemaining: 0 },
        dns: { hasSPF: false, hasDMARC: false, spfRecord: null, dmarcRecord: null },
        score: 0,
        timestamp: new Date().toISOString(),
    };

    try {
        // 1. SSL/TLS Verification
        await new Promise<void>((resolve) => {
            const req = https.request(`https://${cleanDomain}`, {
                method: 'HEAD',
                agent: new https.Agent({ rejectUnauthorized: false }) // Allow checking mostly to see cert details even if self-signed (for analysis)
            }, (res) => {
                const cert = (res.socket as any).getPeerCertificate();
                if (cert && !Object.keys(cert).length) {
                    // Empty cert object
                } else if (cert) {
                    result.ssl.valid = true;
                    result.ssl.issuer = cert.issuer.O || cert.issuer.CN || 'Unknown';
                    result.ssl.expires = cert.valid_to;

                    const expiry = new Date(cert.valid_to);
                    const now = new Date();
                    const diffTime = Math.abs(expiry.getTime() - now.getTime());
                    result.ssl.daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }
                resolve();
            });

            req.on('error', () => {
                // SSL failed (host unreachable or no SSL)
                resolve();
            });
            req.end();
        });

        // 2. DNS Verification (SPF & DMARC)
        try {
            const txtRecords = await resolveTxt(cleanDomain);
            result.dns.spfRecord = txtRecords.flat().find(r => r.includes('v=spf1')) || null;
            result.dns.hasSPF = !!result.dns.spfRecord;
        } catch (e) {
            // No TXT records or DNS error
        }

        try {
            const dmarcRecords = await resolveTxt(`_dmarc.${cleanDomain}`);
            result.dns.dmarcRecord = dmarcRecords.flat().find(r => r.includes('v=DMARC1')) || null;
            result.dns.hasDMARC = !!result.dns.dmarcRecord;
        } catch (e) {
            // No DMARC record
        }

        // 3. Calculate Risk Score
        let score = 50; // Base score
        if (result.ssl.valid) score += 20;
        if (result.ssl.daysRemaining > 30) score += 10;
        if (result.dns.hasSPF) score += 10;
        if (result.dns.hasDMARC) score += 10;

        result.score = score;

    } catch (error) {
        console.error('Analysis failed:', error);
    }

    return result;
}
