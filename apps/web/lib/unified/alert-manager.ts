/**
 * Vajra - Unified Alerting System
 * 
 * Cross-module alert management with multiple notification channels
 * Features:
 * - Alert aggregation
 * - Deduplication
 * - Escalation
 * - Multiple channels (Email, Slack, Discord, Webhook)
 */

export interface Alert {
    id: string;
    module: 'shield' | 'scout' | 'sentry' | 'aegis';
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    type: string;
    title: string;
    description: string;
    context: Record<string, any>;

    status: 'pending' | 'acknowledged' | 'resolved' | 'dismissed';
    createdAt: Date;
    updatedAt: Date;
    acknowledgedAt?: Date;
    resolvedAt?: Date;

    acknowledgedBy?: string;
    resolvedBy?: string;
    resolution?: string;

    escalationLevel: number;
    notificationsSent: NotificationRecord[];
}

export interface NotificationRecord {
    channel: 'email' | 'slack' | 'discord' | 'webhook' | 'sms';
    sentAt: Date;
    success: boolean;
    error?: string;
}

export interface AlertConfig {
    channels: {
        email?: {
            enabled: boolean;
            recipients: string[];
            minSeverity: Alert['severity'];
        };
        slack?: {
            enabled: boolean;
            webhookUrl: string;
            channel: string;
            minSeverity: Alert['severity'];
        };
        discord?: {
            enabled: boolean;
            webhookUrl: string;
            minSeverity: Alert['severity'];
        };
        webhook?: {
            enabled: boolean;
            url: string;
            headers?: Record<string, string>;
            minSeverity: Alert['severity'];
        };
    };

    deduplication: {
        enabled: boolean;
        windowSeconds: number;
    };

    escalation: {
        enabled: boolean;
        levels: Array<{
            afterMinutes: number;
            notifyChannels: string[];
        }>;
    };

    quietHours?: {
        enabled: boolean;
        start: string;  // "22:00"
        end: string;    // "08:00"
        exceptSeverities: Alert['severity'][];
    };
}

// Severity order for comparison
const SEVERITY_ORDER: Record<Alert['severity'], number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
};

/**
 * Alert Manager
 */
export class AlertManager {
    private alerts = new Map<string, Alert>();
    private config: AlertConfig;
    private deduplicationCache = new Map<string, Date>();

    constructor(config?: Partial<AlertConfig>) {
        this.config = {
            channels: {},
            deduplication: { enabled: true, windowSeconds: 300 },
            escalation: { enabled: false, levels: [] },
            ...config,
        };
    }

    /**
     * Create and send an alert
     */
    async alert(params: {
        module: Alert['module'];
        severity: Alert['severity'];
        type: string;
        title: string;
        description: string;
        context?: Record<string, any>;
    }): Promise<Alert> {
        // Check deduplication
        if (this.isDuplicate(params)) {
            const existing = this.findExisting(params);
            if (existing) {
                return existing;
            }
        }

        // Create alert
        const alert: Alert = {
            id: crypto.randomUUID(),
            module: params.module,
            severity: params.severity,
            type: params.type,
            title: params.title,
            description: params.description,
            context: params.context || {},
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            escalationLevel: 0,
            notificationsSent: [],
        };

        this.alerts.set(alert.id, alert);
        this.updateDeduplicationCache(params);

        // Send notifications (non-blocking)
        this.sendNotifications(alert).catch(console.error);

        return alert;
    }

    /**
     * Acknowledge an alert
     */
    acknowledge(alertId: string, acknowledgedBy: string): boolean {
        const alert = this.alerts.get(alertId);
        if (!alert || alert.status !== 'pending') return false;

        alert.status = 'acknowledged';
        alert.acknowledgedAt = new Date();
        alert.acknowledgedBy = acknowledgedBy;
        alert.updatedAt = new Date();

        return true;
    }

    /**
     * Resolve an alert
     */
    resolve(alertId: string, resolvedBy: string, resolution: string): boolean {
        const alert = this.alerts.get(alertId);
        if (!alert) return false;

        alert.status = 'resolved';
        alert.resolvedAt = new Date();
        alert.resolvedBy = resolvedBy;
        alert.resolution = resolution;
        alert.updatedAt = new Date();

        return true;
    }

    /**
     * Dismiss an alert
     */
    dismiss(alertId: string): boolean {
        const alert = this.alerts.get(alertId);
        if (!alert) return false;

        alert.status = 'dismissed';
        alert.updatedAt = new Date();

        return true;
    }

    /**
     * Get all alerts
     */
    getAlerts(options: {
        status?: Alert['status'][];
        severity?: Alert['severity'][];
        module?: Alert['module'][];
        limit?: number;
    } = {}): Alert[] {
        let alerts = Array.from(this.alerts.values());

        if (options.status && options.status.length > 0) {
            alerts = alerts.filter(a => options.status!.includes(a.status));
        }

        if (options.severity && options.severity.length > 0) {
            alerts = alerts.filter(a => options.severity!.includes(a.severity));
        }

        if (options.module && options.module.length > 0) {
            alerts = alerts.filter(a => options.module!.includes(a.module));
        }

        // Sort by severity and date
        alerts.sort((a, b) => {
            const severityDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
            if (severityDiff !== 0) return severityDiff;
            return b.createdAt.getTime() - a.createdAt.getTime();
        });

        if (options.limit) {
            alerts = alerts.slice(0, options.limit);
        }

        return alerts;
    }

    /**
     * Get alert by ID
     */
    getAlert(id: string): Alert | undefined {
        return this.alerts.get(id);
    }

    /**
     * Get pending alerts count by severity
     */
    getPendingCounts(): Record<Alert['severity'], number> {
        const counts: Record<Alert['severity'], number> = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0,
        };

        for (const alert of this.alerts.values()) {
            if (alert.status === 'pending') {
                counts[alert.severity]++;
            }
        }

        return counts;
    }

    /**
     * Run escalation check (call periodically)
     */
    async checkEscalations(): Promise<void> {
        if (!this.config.escalation.enabled) return;

        const now = new Date();

        for (const alert of this.alerts.values()) {
            if (alert.status !== 'pending') continue;

            const ageMinutes = (now.getTime() - alert.createdAt.getTime()) / 60000;

            for (const level of this.config.escalation.levels) {
                if (ageMinutes >= level.afterMinutes && alert.escalationLevel < this.config.escalation.levels.indexOf(level) + 1) {
                    alert.escalationLevel++;

                    // Send escalation notifications
                    for (const channel of level.notifyChannels) {
                        await this.sendToChannel(alert, channel as keyof AlertConfig['channels']);
                    }
                }
            }
        }
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<AlertConfig>): void {
        this.config = { ...this.config, ...config };
    }

    // Private methods

    private isDuplicate(params: {
        module: Alert['module'];
        type: string;
        title: string;
    }): boolean {
        if (!this.config.deduplication.enabled) return false;

        const key = `${params.module}:${params.type}:${params.title}`;
        const lastSeen = this.deduplicationCache.get(key);

        if (!lastSeen) return false;

        const ageSeconds = (Date.now() - lastSeen.getTime()) / 1000;
        return ageSeconds < this.config.deduplication.windowSeconds;
    }

    private findExisting(params: {
        module: Alert['module'];
        type: string;
        title: string;
    }): Alert | undefined {
        for (const alert of this.alerts.values()) {
            if (alert.module === params.module &&
                alert.type === params.type &&
                alert.title === params.title &&
                alert.status === 'pending') {
                return alert;
            }
        }
        return undefined;
    }

    private updateDeduplicationCache(params: {
        module: Alert['module'];
        type: string;
        title: string;
    }): void {
        const key = `${params.module}:${params.type}:${params.title}`;
        this.deduplicationCache.set(key, new Date());

        // Clean old entries
        const cutoff = Date.now() - this.config.deduplication.windowSeconds * 1000;
        for (const [k, v] of this.deduplicationCache) {
            if (v.getTime() < cutoff) {
                this.deduplicationCache.delete(k);
            }
        }
    }

    private async sendNotifications(alert: Alert): Promise<void> {
        // Check quiet hours
        if (this.isQuietHours() && !this.config.quietHours?.exceptSeverities.includes(alert.severity)) {
            return;
        }

        const channels = Object.entries(this.config.channels) as Array<[keyof AlertConfig['channels'], any]>;

        for (const [channel, config] of channels) {
            if (!config?.enabled) continue;
            if (!this.meetsMinSeverity(alert.severity, config.minSeverity)) continue;

            await this.sendToChannel(alert, channel);
        }
    }

    private async sendToChannel(alert: Alert, channel: keyof AlertConfig['channels']): Promise<void> {
        const record: NotificationRecord = {
            channel,
            sentAt: new Date(),
            success: false,
        };

        try {
            switch (channel) {
                case 'slack':
                    await this.sendSlackNotification(alert);
                    break;
                case 'discord':
                    await this.sendDiscordNotification(alert);
                    break;
                case 'webhook':
                    await this.sendWebhookNotification(alert);
                    break;
                // Email and SMS would require additional services
            }
            record.success = true;
        } catch (error) {
            record.error = error instanceof Error ? error.message : 'Unknown error';
        }

        alert.notificationsSent.push(record);
    }

    private async sendSlackNotification(alert: Alert): Promise<void> {
        const config = this.config.channels.slack;
        if (!config) return;

        const color = {
            critical: '#dc3545',
            high: '#fd7e14',
            medium: '#ffc107',
            low: '#17a2b8',
            info: '#6c757d',
        }[alert.severity];

        const payload = {
            channel: config.channel,
            attachments: [{
                color,
                title: `🚨 ${alert.title}`,
                text: alert.description,
                fields: [
                    { title: 'Module', value: alert.module.toUpperCase(), short: true },
                    { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
                    { title: 'Type', value: alert.type, short: true },
                ],
                footer: 'Vajra Security Platform',
                ts: Math.floor(alert.createdAt.getTime() / 1000),
            }],
        };

        await fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }

    private async sendDiscordNotification(alert: Alert): Promise<void> {
        const config = this.config.channels.discord;
        if (!config) return;

        const color = {
            critical: 0xdc3545,
            high: 0xfd7e14,
            medium: 0xffc107,
            low: 0x17a2b8,
            info: 0x6c757d,
        }[alert.severity];

        const payload = {
            embeds: [{
                title: `🚨 ${alert.title}`,
                description: alert.description,
                color,
                fields: [
                    { name: 'Module', value: alert.module.toUpperCase(), inline: true },
                    { name: 'Severity', value: alert.severity.toUpperCase(), inline: true },
                    { name: 'Type', value: alert.type, inline: true },
                ],
                footer: { text: 'Vajra Security Platform' },
                timestamp: alert.createdAt.toISOString(),
            }],
        };

        await fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }

    private async sendWebhookNotification(alert: Alert): Promise<void> {
        const config = this.config.channels.webhook;
        if (!config) return;

        await fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...config.headers,
            },
            body: JSON.stringify({
                alert: {
                    id: alert.id,
                    module: alert.module,
                    severity: alert.severity,
                    type: alert.type,
                    title: alert.title,
                    description: alert.description,
                    context: alert.context,
                    createdAt: alert.createdAt.toISOString(),
                },
                source: 'vajra-security',
                version: '1.0',
            }),
        });
    }

    private isQuietHours(): boolean {
        if (!this.config.quietHours?.enabled) return false;

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const start = this.config.quietHours.start;
        const end = this.config.quietHours.end;

        // Handle overnight quiet hours (e.g., 22:00 to 08:00)
        if (start > end) {
            return currentTime >= start || currentTime < end;
        }

        return currentTime >= start && currentTime < end;
    }

    private meetsMinSeverity(severity: Alert['severity'], minSeverity: Alert['severity']): boolean {
        return SEVERITY_ORDER[severity] <= SEVERITY_ORDER[minSeverity];
    }
}

// Export singleton
export const alerts = new AlertManager();
