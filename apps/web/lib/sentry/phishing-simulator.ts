/**
 * Vajra Sentry - AI Phishing Simulator
 * 
 * KnowBe4-inspired phishing simulation for security awareness training
 * Features:
 * - AI-generated phishing campaigns
 * - Multiple attack types (email, QR, SMS)
 * - Click tracking and reporting
 * - Training integration
 */

import { llm } from '../llm/llm-provider';

export interface PhishingCampaign {
    id: string;
    name: string;
    type: 'email' | 'qr' | 'sms' | 'voice';
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    topic: string;
    status: 'draft' | 'scheduled' | 'active' | 'completed';
    targetDepartments: string[];
    targetEmployees: string[];
    launchDate?: Date;
    endDate?: Date;
    template: PhishingTemplate;
    metrics: CampaignMetrics;
    createdAt: Date;
    createdBy: string;
}

export interface PhishingTemplate {
    id: string;
    name: string;
    subject?: string;
    senderName: string;
    senderEmail: string;
    body: string;
    landingPageHtml?: string;
    redFlags: string[];
    trainingPoints: string[];
    category: string;
    aiGenerated: boolean;
}

export interface CampaignMetrics {
    totalTargets: number;
    emailsSent: number;
    emailsOpened: number;
    linksClicked: number;
    dataSubmitted: number;
    reported: number;

    // Calculated rates
    openRate: number;
    clickRate: number;
    reportRate: number;
    phishPronePercentage: number;
}

export interface EmployeePhishingResult {
    employeeId: string;
    employeeEmail: string;
    campaignId: string;

    // Actions taken
    emailOpened: boolean;
    emailOpenedAt?: Date;
    linkClicked: boolean;
    linkClickedAt?: Date;
    dataSubmitted: boolean;
    dataSubmittedAt?: Date;
    reported: boolean;
    reportedAt?: Date;

    // Metadata
    userAgent?: string;
    ipAddress?: string;
    geoLocation?: string;
}

// Built-in phishing templates
const PHISHING_TEMPLATES: Record<string, Partial<PhishingTemplate>> = {
    password_reset: {
        name: 'Password Reset Required',
        category: 'IT Security',
        subject: 'Action Required: Your password expires in 24 hours',
        senderName: 'IT Help Desk',
        redFlags: [
            'Urgency in subject line',
            'Generic greeting',
            'Suspicious sender email',
            'Link to external domain',
        ],
        trainingPoints: [
            'Always verify password reset requests through official IT channels',
            'Check the sender email carefully',
            'Look for urgency tactics designed to make you act quickly',
        ],
    },
    ceo_request: {
        name: 'CEO Urgent Request',
        category: 'Business Email Compromise',
        subject: 'Quick favor needed',
        senderName: 'CEO',
        redFlags: [
            'Request for urgency',
            'Unusual communication pattern',
            'Request to bypass normal procedures',
            'Email from personal domain',
        ],
        trainingPoints: [
            'CEOs rarely ask for urgent financial actions via email',
            'Verify unusual requests through a separate channel',
            'Look for impersonation of internal executives',
        ],
    },
    invoice_payment: {
        name: 'Invoice Payment',
        category: 'Financial Fraud',
        subject: 'Invoice #INV-2024-XXXX - Payment Due',
        senderName: 'Accounts Payable',
        redFlags: [
            'Unexpected invoice',
            'Attachment or link to download',
            'Pressure to pay quickly',
            'Changed bank details',
        ],
        trainingPoints: [
            'Verify invoices through known vendor contacts',
            'Be suspicious of changed payment details',
            'Never rush financial transactions',
        ],
    },
    shared_document: {
        name: 'Shared Document',
        category: 'Credential Theft',
        subject: 'Document shared with you: Q4 Report.docx',
        senderName: 'Microsoft SharePoint',
        redFlags: [
            'Unexpected shared document',
            'Login required to view',
            'Sender email doesn\'t match Microsoft domain',
        ],
        trainingPoints: [
            'Verify document shares through the official platform',
            'Never enter credentials on linked login pages',
            'Check if you expected the document',
        ],
    },
    delivery_notification: {
        name: 'Package Delivery',
        category: 'Consumer Phishing',
        subject: 'Your package delivery is on hold',
        senderName: 'FedEx Delivery',
        redFlags: [
            'Unexpected delivery notification',
            'Request to click link to confirm',
            'Sender domain doesn\'t match official domain',
        ],
        trainingPoints: [
            'Go directly to carrier websites instead of clicking links',
            'Be suspicious of unexpected delivery notifications',
            'Check tracking numbers on official sites',
        ],
    },
};

/**
 * AI Phishing Generator
 */
class AIPhishingGenerator {
    /**
     * Generate a phishing email using AI
     */
    async generateEmail(config: {
        department: string;
        topic: string;
        difficulty: 'easy' | 'medium' | 'hard' | 'expert';
        companyName?: string;
        senderName?: string;
    }): Promise<PhishingTemplate> {
        const difficultyPrompt = {
            easy: 'Include obvious red flags like typos, suspicious URLs, and generic greetings',
            medium: 'Make it more realistic but include subtle red flags like urgency and slightly suspicious sender',
            hard: 'Create a highly convincing email with very subtle red flags that require careful inspection',
            expert: 'Create an extremely sophisticated email that mimics real corporate communications closely',
        };

        const prompt = `
Generate a SIMULATED phishing email for security awareness TRAINING ONLY.
This will be used to educate employees, not for malicious purposes.

Configuration:
- Target Department: ${config.department}
- Topic: ${config.topic}
- Difficulty: ${config.difficulty}
- Company: ${config.companyName || 'the target company'}
${config.senderName ? `- Impersonate: ${config.senderName}` : ''}

Difficulty instructions: ${difficultyPrompt[config.difficulty]}

IMPORTANT: Make sure the email is realistic for training but HARMLESS.
All links should point to training pages, not real phishing sites.

Return JSON:
{
  "subject": "Email subject line",
  "senderName": "Display name",
  "senderEmail": "sender@example.com (make plausible for the scenario)",
  "body": "HTML email body with realistic formatting. Use [TRAINING_LINK] as placeholder for tracking link",
  "redFlags": ["List of 3-5 red flags users should notice"],
  "trainingPoints": ["3-4 key lessons from this email"]
}
`;

        try {
            const response = await llm.analyzeForSecurity(prompt);
            const parsed = llm.parseJSON<{
                subject: string;
                senderName: string;
                senderEmail: string;
                body: string;
                redFlags: string[];
                trainingPoints: string[];
            }>(response);

            if (!parsed) {
                throw new Error('Failed to parse AI response');
            }

            return {
                id: crypto.randomUUID(),
                name: `AI Generated: ${config.topic}`,
                subject: parsed.subject,
                senderName: parsed.senderName,
                senderEmail: parsed.senderEmail,
                body: parsed.body,
                redFlags: parsed.redFlags,
                trainingPoints: parsed.trainingPoints,
                category: config.department,
                aiGenerated: true,
            };
        } catch (error) {
            console.error('[AIPhishing] Generation failed:', error);
            throw error;
        }
    }

    /**
     * Generate a QR code phishing campaign
     */
    async generateQRPhish(config: {
        topic: string;
        context: string;  // e.g., "wifi password", "menu", "payment"
    }): Promise<{
        template: Partial<PhishingTemplate>;
        qrContext: string;
        physicalPlacement: string;
    }> {
        const prompt = `
Generate a QR code phishing scenario for security training.
Topic: ${config.topic}
Context: ${config.context}

Return JSON:
{
  "qrContext": "What the QR code supposedly links to",
  "physicalPlacement": "Where the QR code would be placed",
  "landingPage": "Description of the fake landing page",
  "redFlags": ["Red flags for QR phishing"],
  "trainingPoints": ["Lessons about QR code safety"]
}
`;

        const response = await llm.analyzeForSecurity(prompt);
        const parsed = llm.parseJSON<{
            qrContext: string;
            physicalPlacement: string;
            landingPage: string;
            redFlags: string[];
            trainingPoints: string[];
        }>(response);

        return {
            template: {
                name: `QR Phish: ${config.topic}`,
                redFlags: parsed?.redFlags || [],
                trainingPoints: parsed?.trainingPoints || [],
                category: 'QR Code Phishing',
            },
            qrContext: parsed?.qrContext || config.context,
            physicalPlacement: parsed?.physicalPlacement || 'Unknown',
        };
    }
}

/**
 * Phishing Campaign Manager
 */
export class PhishingCampaignManager {
    private campaigns = new Map<string, PhishingCampaign>();
    private results = new Map<string, EmployeePhishingResult[]>();
    private aiGenerator = new AIPhishingGenerator();

    /**
     * Create a new campaign from a pre-built template
     */
    createCampaign(config: {
        name: string;
        templateKey: keyof typeof PHISHING_TEMPLATES;
        targetDepartments: string[];
        targetEmployees: string[];
        difficulty: PhishingCampaign['difficulty'];
        launchDate?: Date;
        createdBy: string;
    }): PhishingCampaign {
        const baseTemplate = PHISHING_TEMPLATES[config.templateKey];

        const template: PhishingTemplate = {
            id: crypto.randomUUID(),
            name: baseTemplate.name || config.name,
            subject: baseTemplate.subject || '',
            senderName: baseTemplate.senderName || '',
            senderEmail: `${baseTemplate.senderName?.toLowerCase().replace(/\s/g, '.')}@training.example.com`,
            body: this.generateEmailBody(baseTemplate, config.difficulty),
            redFlags: baseTemplate.redFlags || [],
            trainingPoints: baseTemplate.trainingPoints || [],
            category: baseTemplate.category || 'General',
            aiGenerated: false,
        };

        const campaign: PhishingCampaign = {
            id: crypto.randomUUID(),
            name: config.name,
            type: 'email',
            difficulty: config.difficulty,
            topic: baseTemplate.category || 'Security Awareness',
            status: config.launchDate ? 'scheduled' : 'draft',
            targetDepartments: config.targetDepartments,
            targetEmployees: config.targetEmployees,
            launchDate: config.launchDate,
            template,
            metrics: {
                totalTargets: config.targetEmployees.length,
                emailsSent: 0,
                emailsOpened: 0,
                linksClicked: 0,
                dataSubmitted: 0,
                reported: 0,
                openRate: 0,
                clickRate: 0,
                reportRate: 0,
                phishPronePercentage: 0,
            },
            createdAt: new Date(),
            createdBy: config.createdBy,
        };

        this.campaigns.set(campaign.id, campaign);
        this.results.set(campaign.id, []);

        return campaign;
    }

    /**
     * Create a campaign with AI-generated content
     */
    async createAICampaign(config: {
        name: string;
        department: string;
        topic: string;
        difficulty: PhishingCampaign['difficulty'];
        targetEmployees: string[];
        companyName?: string;
        createdBy: string;
    }): Promise<PhishingCampaign> {
        const template = await this.aiGenerator.generateEmail({
            department: config.department,
            topic: config.topic,
            difficulty: config.difficulty,
            companyName: config.companyName,
        });

        const campaign: PhishingCampaign = {
            id: crypto.randomUUID(),
            name: config.name,
            type: 'email',
            difficulty: config.difficulty,
            topic: config.topic,
            status: 'draft',
            targetDepartments: [config.department],
            targetEmployees: config.targetEmployees,
            template,
            metrics: {
                totalTargets: config.targetEmployees.length,
                emailsSent: 0,
                emailsOpened: 0,
                linksClicked: 0,
                dataSubmitted: 0,
                reported: 0,
                openRate: 0,
                clickRate: 0,
                reportRate: 0,
                phishPronePercentage: 0,
            },
            createdAt: new Date(),
            createdBy: config.createdBy,
        };

        this.campaigns.set(campaign.id, campaign);
        this.results.set(campaign.id, []);

        return campaign;
    }

    /**
     * Record an email open
     */
    recordEmailOpen(campaignId: string, employeeId: string, metadata: {
        userAgent?: string;
        ipAddress?: string;
    }): void {
        const campaign = this.campaigns.get(campaignId);
        const results = this.results.get(campaignId);

        if (!campaign || !results) return;

        let result = results.find(r => r.employeeId === employeeId);

        if (!result) {
            result = {
                employeeId,
                employeeEmail: '', // Would be filled from employee data
                campaignId,
                emailOpened: false,
                linkClicked: false,
                dataSubmitted: false,
                reported: false,
            };
            results.push(result);
        }

        if (!result.emailOpened) {
            result.emailOpened = true;
            result.emailOpenedAt = new Date();
            result.userAgent = metadata.userAgent;
            result.ipAddress = metadata.ipAddress;

            campaign.metrics.emailsOpened++;
            this.updateMetrics(campaign);
        }
    }

    /**
     * Record a link click
     */
    recordLinkClick(campaignId: string, employeeId: string): void {
        const campaign = this.campaigns.get(campaignId);
        const results = this.results.get(campaignId);

        if (!campaign || !results) return;

        const result = results.find(r => r.employeeId === employeeId);
        if (!result) return;

        if (!result.linkClicked) {
            result.linkClicked = true;
            result.linkClickedAt = new Date();

            campaign.metrics.linksClicked++;
            this.updateMetrics(campaign);
        }
    }

    /**
     * Record a phishing report (good behavior!)
     */
    recordReport(campaignId: string, employeeId: string): void {
        const campaign = this.campaigns.get(campaignId);
        const results = this.results.get(campaignId);

        if (!campaign || !results) return;

        const result = results.find(r => r.employeeId === employeeId);
        if (!result) return;

        if (!result.reported) {
            result.reported = true;
            result.reportedAt = new Date();

            campaign.metrics.reported++;
            this.updateMetrics(campaign);
        }
    }

    /**
     * Get campaign by ID
     */
    getCampaign(id: string): PhishingCampaign | undefined {
        return this.campaigns.get(id);
    }

    /**
     * Get all campaigns
     */
    getCampaigns(): PhishingCampaign[] {
        return Array.from(this.campaigns.values());
    }

    /**
     * Get campaign results
     */
    getCampaignResults(campaignId: string): EmployeePhishingResult[] {
        return this.results.get(campaignId) || [];
    }

    /**
     * Get available templates
     */
    getTemplates(): Array<{ key: string; template: Partial<PhishingTemplate> }> {
        return Object.entries(PHISHING_TEMPLATES).map(([key, template]) => ({
            key,
            template,
        }));
    }

    private generateEmailBody(
        template: Partial<PhishingTemplate>,
        difficulty: PhishingCampaign['difficulty']
    ): string {
        // Generate email body based on difficulty
        // More typos and suspicious elements for easier difficulty
        const baseBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <p>Dear Employee,</p>
  <p>[Email content based on template would go here]</p>
  <p>Please click the link below to proceed:</p>
  <p><a href="[TRAINING_LINK]">Click Here to Continue</a></p>
  <p>Best regards,<br>${template.senderName || 'Team'}</p>
</div>
    `;

        return baseBody;
    }

    private updateMetrics(campaign: PhishingCampaign): void {
        const m = campaign.metrics;

        m.openRate = m.emailsSent > 0 ? (m.emailsOpened / m.emailsSent) * 100 : 0;
        m.clickRate = m.emailsOpened > 0 ? (m.linksClicked / m.emailsOpened) * 100 : 0;
        m.reportRate = m.emailsSent > 0 ? (m.reported / m.emailsSent) * 100 : 0;
        m.phishPronePercentage = m.emailsSent > 0 ? (m.linksClicked / m.emailsSent) * 100 : 0;
    }
}

// Export singleton
export const phishingCampaigns = new PhishingCampaignManager();
