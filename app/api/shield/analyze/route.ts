/**
 * API Route: Shield Bot Detection
 * Analyzes requests for bot activity
 */

import { NextResponse } from 'next/server';
import { botDetector } from '@/lib/shield/ml-bot-detector';
import { crowdsec } from '@/lib/shield/crowdsec-integration';
import { threatAnalyzer } from '@/lib/shield/llm-threat-analyzer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ip, userAgent, headers, path, method, requestBody } = body;

        // 1. Check CrowdSec first
        const crowdsecResult = await crowdsec.checkIP(ip);

        if (crowdsecResult.isBlocked) {
            return NextResponse.json({
                allowed: false,
                botScore: 1,
                action: 'block',
                reason: 'IP blocked by CrowdSec community',
                crowdsecBlocked: true,
                crowdsecData: {
                    riskScore: crowdsecResult.riskScore,
                    behaviors: crowdsecResult.behaviors,
                    country: crowdsecResult.country,
                },
            });
        }

        // 2. Bot detection
        const botResult = await botDetector.analyze({
            ip,
            userAgent,
            headers,
            path,
            method,
            timestamp: new Date(),
        });

        // 3. LLM threat analysis for suspicious requests
        let threatAnalysis = null;
        if (botResult.score < 40) {
            threatAnalysis = await threatAnalyzer.analyzeRequest(
                { ip, userAgent, headers, path, method, timestamp: new Date() },
                { body: requestBody }
            );
        }

        return NextResponse.json({
            allowed: botResult.action === 'allow',
            botScore: botResult.score,
            classification: botResult.classification,
            action: botResult.action,
            reason: botResult.reason,
            signals: botResult.signals,
            crowdsecBlocked: false,
            crowdsecData: {
                riskScore: crowdsecResult.riskScore,
                behaviors: crowdsecResult.behaviors,
            },
            threatAnalysis,
        });
    } catch (error) {
        console.error('[Shield API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze request' },
            { status: 500 }
        );
    }
}
