/**
 * API Route: Sentry Phishing Campaigns
 * Manages phishing simulation campaigns
 */

import { NextResponse } from 'next/server';
import { phishingCampaigns } from '@/lib/sentry/phishing-simulator';

export async function GET() {
    try {
        const campaigns = phishingCampaigns.getCampaigns();
        const templates = phishingCampaigns.getTemplates();

        return NextResponse.json({
            campaigns,
            templates,
        });
    } catch (error) {
        console.error('[Sentry API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch campaigns' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, ...data } = body;

        if (action === 'create-ai') {
            // Create AI-generated campaign
            const campaign = await phishingCampaigns.createAICampaign({
                name: data.name,
                department: data.department,
                topic: data.topic,
                difficulty: data.difficulty,
                targetEmployees: data.targetEmployees,
                createdBy: data.createdBy || 'system',
            });

            return NextResponse.json({ success: true, campaign });
        }

        if (action === 'create-template') {
            // Create campaign from template
            const campaign = phishingCampaigns.createCampaign({
                name: data.name,
                templateKey: data.templateKey,
                targetDepartments: data.targetDepartments,
                targetEmployees: data.targetEmployees,
                difficulty: data.difficulty,
                createdBy: data.createdBy || 'system',
            });

            return NextResponse.json({ success: true, campaign });
        }

        if (action === 'record-event') {
            // Record campaign event (email open, link click, etc.)
            const { campaignId, employeeId, eventType, metadata } = data;

            switch (eventType) {
                case 'open':
                    phishingCampaigns.recordEmailOpen(campaignId, employeeId, metadata);
                    break;
                case 'click':
                    phishingCampaigns.recordLinkClick(campaignId, employeeId);
                    break;
                case 'report':
                    phishingCampaigns.recordReport(campaignId, employeeId);
                    break;
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('[Sentry API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to process campaign action' },
            { status: 500 }
        );
    }
}
