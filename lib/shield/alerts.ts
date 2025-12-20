/**
 * Alert Service
 * Sends notifications via Slack, Email, and Webhooks
 */

interface Alert {
    workspaceId: string
    alertType: 'ddos' | 'bot_spike' | 'malicious_ip' | 'high_traffic'
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    message: string
    metadata?: Record<string, any>
}

interface AlertRule {
    id: string
    workspace_id: string
    rule_type: string
    threshold: number
    notification_channel: string
    channel_config: any
    is_active: boolean
}

/**
 * Send alert to configured channels
 */
export async function sendAlert(alert: Alert): Promise<void> {
    try {
        // Get alert rules for workspace
        const rules = await getActiveAlertRules(alert.workspaceId)

        for (const rule of rules) {
            // Check if alert matches rule type
            if (shouldTriggerAlert(alert, rule)) {
                await sendToChannel(alert, rule)
            }
        }
    } catch (error) {
        console.error('Error sending alert:', error)
    }
}

/**
 * Send to Slack
 */
async function sendSlackAlert(webhookUrl: string, alert: Alert): Promise<void> {
    const color = getSeverityColor(alert.severity)

    const payload = {
        attachments: [
            {
                color,
                title: `🛡️ ${alert.title}`,
                text: alert.message,
                fields: [
                    {
                        title: 'Severity',
                        value: alert.severity.toUpperCase(),
                        short: true,
                    },
                    {
                        title: 'Type',
                        value: alert.alertType,
                        short: true,
                    },
                    {
                        title: 'Timestamp',
                        value: new Date().toISOString(),
                        short: false,
                    },
                ],
                footer: 'Vajra Shield',
                footer_icon: 'https://vajra-protection.vercel.app/logo.png',
            },
        ],
    }

    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
}

/**
 * Send email alert
 */
async function sendEmailAlert(email: string, alert: Alert): Promise<void> {
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
        console.warn('Resend API key not configured')
        return
    }

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
          .severity { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; }
          .critical { background: #dc2626; color: white; }
          .high { background: #f59e0b; color: white; }
          .medium { background: #3b82f6; color: white; }
          .low { background: #10b981; color: white; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ Vajra Shield Alert</h1>
          </div>
          <div class="content">
            <h2>${alert.title}</h2>
            <p>${alert.message}</p>
            <p>
              <strong>Severity:</strong> 
              <span class="severity ${alert.severity}">${alert.severity.toUpperCase()}</span>
            </p>
            <p><strong>Type:</strong> ${alert.alertType}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              This is an automated alert from Vajra Shield. 
              <a href="https://vajra-protection.vercel.app">View Dashboard</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `

    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
            from: 'Vajra Shield <alerts@vajra.dev>',
            to: email,
            subject: `🛡️ ${alert.severity.toUpperCase()}: ${alert.title}`,
            html,
        }),
    })
}

/**
 * Send to custom webhook
 */
async function sendWebhookAlert(webhookUrl: string, alert: Alert): Promise<void> {
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event: 'shield.alert',
            alert,
            timestamp: new Date().toISOString(),
        }),
    })
}

/**
 * Send to appropriate channel
 */
async function sendToChannel(alert: Alert, rule: AlertRule): Promise<void> {
    const channel = rule.notification_channel
    const config = rule.channel_config

    try {
        if (channel === 'slack' && config.webhookUrl) {
            await sendSlackAlert(config.webhookUrl, alert)
        } else if (channel === 'email' && config.email) {
            await sendEmailAlert(config.email, alert)
        } else if (channel === 'webhook' && config.webhookUrl) {
            await sendWebhookAlert(config.webhookUrl, alert)
        }
    } catch (error) {
        console.error(`Error sending to ${channel}:`, error)
    }
}

/**
 * Check if alert should trigger based on rule
 */
function shouldTriggerAlert(alert: Alert, rule: AlertRule): boolean {
    // Match alert type to rule type
    if (rule.rule_type !== alert.alertType && rule.rule_type !== 'all') {
        return false
    }

    // Check severity threshold
    const severityLevels: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 }
    const alertLevel = severityLevels[alert.severity] || 1
    const minSeverity = rule.channel_config?.minSeverity || 'low'
    const ruleLevel = severityLevels[minSeverity] || 1

    return alertLevel >= ruleLevel
}

/**
 * Get active alert rules for workspace
 */
async function getActiveAlertRules(workspaceId: string): Promise<AlertRule[]> {
    // This would fetch from database
    // For now, return empty array
    return []
}

/**
 * Get severity color for Slack
 */
function getSeverityColor(severity: string): string {
    const colors = {
        low: '#10b981',
        medium: '#3b82f6',
        high: '#f59e0b',
        critical: '#dc2626',
    }
    return colors[severity as keyof typeof colors] || '#6b7280'
}

/**
 * Create DDoS alert
 */
export function createDDoSAlert(requestCount: number, threshold: number): Alert {
    return {
        workspaceId: '',
        alertType: 'ddos',
        severity: requestCount > threshold * 2 ? 'critical' : 'high',
        title: 'DDoS Attack Detected',
        message: `Unusual traffic spike detected: ${requestCount} requests in the last minute (threshold: ${threshold})`,
        metadata: { requestCount, threshold },
    }
}

/**
 * Create bot spike alert
 */
export function createBotSpikeAlert(botPercentage: number): Alert {
    return {
        workspaceId: '',
        alertType: 'bot_spike',
        severity: botPercentage > 80 ? 'high' : 'medium',
        title: 'Bot Traffic Spike',
        message: `Bot traffic increased to ${botPercentage}% of total requests`,
        metadata: { botPercentage },
    }
}

/**
 * Create malicious IP alert
 */
export function createMaliciousIPAlert(ip: string, abuseScore: number): Alert {
    return {
        workspaceId: '',
        alertType: 'malicious_ip',
        severity: abuseScore > 90 ? 'critical' : 'high',
        title: 'Malicious IP Detected',
        message: `IP ${ip} flagged as malicious (abuse score: ${abuseScore})`,
        metadata: { ip, abuseScore },
    }
}
