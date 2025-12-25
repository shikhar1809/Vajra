import type {
    ThreatIntelligence,
    DocumentScan,
    FinancialTransaction,
    DeepfakeDetection
} from '@/types/modules'
import type { WorkspaceMember, UserProfile } from '@/types/workspace'

// Generate realistic test threats for Shield (Network-level protection)
export function generateTestThreats(count: number = 18): ThreatIntelligence[] {
    const threatTypes = ['ddos', 'sql_injection', 'xss', 'csrf', 'brute_force'] as const
    const severities = ['critical', 'high', 'medium', 'low'] as const
    const statuses = ['active', 'mitigated', 'false_positive', 'archived'] as const

    const threatTemplates = [
        { type: 'ddos', severity: 'critical', title: 'DDoS Attack Detected', desc: 'Distributed denial of service attack targeting web servers - 50K requests/sec' },
        { type: 'sql_injection', severity: 'critical', title: 'SQL Injection Attempt', desc: 'Malicious SQL query detected in login form - attempting database access' },
        { type: 'xss', severity: 'high', title: 'Cross-Site Scripting (XSS)', desc: 'Malicious JavaScript injection detected in user input fields' },
        { type: 'csrf', severity: 'high', title: 'CSRF Attack Blocked', desc: 'Cross-site request forgery attempt from unauthorized origin' },
        { type: 'brute_force', severity: 'high', title: 'Brute Force Login Attempt', desc: '500+ failed login attempts from single IP in 5 minutes' },
        { type: 'ddos', severity: 'critical', title: 'Layer 7 DDoS Attack', desc: 'Application-layer DDoS targeting API endpoints' },
        { type: 'sql_injection', severity: 'high', title: 'Blind SQL Injection', desc: 'Time-based SQL injection detected in search parameter' },
        { type: 'xss', severity: 'medium', title: 'Stored XSS Vulnerability', desc: 'Persistent XSS payload found in comment section' },
        { type: 'csrf', severity: 'medium', title: 'Missing CSRF Token', desc: 'Form submission without valid CSRF protection' },
        { type: 'brute_force', severity: 'high', title: 'API Rate Limit Exceeded', desc: 'Suspicious API calls exceeding rate limits - possible bot attack' },
        { type: 'ddos', severity: 'high', title: 'SYN Flood Attack', desc: 'TCP SYN flood detected - connection pool exhaustion attempt' },
        { type: 'sql_injection', severity: 'critical', title: 'Union-Based SQL Injection', desc: 'UNION SELECT attack attempting to extract user credentials' },
        { type: 'xss', severity: 'low', title: 'Reflected XSS Attempt', desc: 'XSS payload in URL parameter - blocked by WAF' },
        { type: 'brute_force', severity: 'medium', title: 'Password Spray Attack', desc: 'Common passwords tested across multiple accounts' },
        { type: 'ddos', severity: 'medium', title: 'HTTP Flood', desc: 'HTTP GET/POST flood from botnet - 10K requests/min' },
    ]

    return Array.from({ length: count }, (_, i) => {
        const template = threatTemplates[i % threatTemplates.length]
        const daysAgo = Math.floor(Math.random() * 30)
        const isActive = i < count * 0.4 // 40% active
        const isCritical = template.severity === 'critical'

        return {
            id: `test-threat-${i + 1}`,
            workspace_id: 'test',
            created_by: 'test-user',
            threat_type: 'other' as any, // Network threats: DDoS, SQL injection, XSS, CSRF, brute force
            severity: template.severity as 'critical' | 'high' | 'medium' | 'low',
            title: template.title,
            description: template.desc,
            source: ['Web Application Firewall', 'Network IDS/IPS', 'API Gateway', 'Load Balancer'][Math.floor(Math.random() * 4)],
            indicators: {
                ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                port: [445, 3389, 22, 80, 443][Math.floor(Math.random() * 5)],
                hash: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
            },
            status: isActive ? 'active' : (isCritical ? 'mitigated' : statuses[Math.floor(Math.random() * statuses.length)]),
            assigned_to: isActive ? 'test-user' : undefined,
            detected_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
            resolved_at: isActive ? undefined : new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
        }
    })
}

// Generate realistic document scans
export function generateTestScans(count: number = 24): DocumentScan[] {
    const fileTypes = ['pdf', 'docx', 'xlsx', 'pptx', 'zip', 'exe']
    const cleanFiles = [
        'Q4_Financial_Report.pdf',
        'Employee_Handbook.docx',
        'Sales_Data_2024.xlsx',
        'Marketing_Presentation.pptx',
        'Project_Archive.zip',
        'Meeting_Notes.pdf'
    ]
    const maliciousFiles = [
        'invoice_urgent.exe',
        'document_encrypted.zip',
        'resume_virus.docx',
        'payment_details.pdf.exe',
        'confidential_macro.xlsx'
    ]

    return Array.from({ length: count }, (_, i) => {
        const isMalicious = i < count * 0.15 // 15% malicious
        const isSuspicious = !isMalicious && i < count * 0.30 // 15% suspicious
        const fileName = isMalicious
            ? maliciousFiles[i % maliciousFiles.length]
            : cleanFiles[i % cleanFiles.length]
        const daysAgo = Math.floor(Math.random() * 30)

        return {
            id: `test-scan-${i + 1}`,
            workspace_id: 'test',
            created_by: 'test-user',
            file_name: fileName,
            file_size: Math.floor(Math.random() * 10000000) + 100000,
            file_type: fileTypes[Math.floor(Math.random() * fileTypes.length)],
            file_url: `/test/files/${fileName}`,
            scan_status: 'completed',
            risk_score: isMalicious ? Math.floor(Math.random() * 20) + 80 : (isSuspicious ? Math.floor(Math.random() * 40) + 30 : Math.floor(Math.random() * 30)),
            threats_found: isMalicious ? ['Trojan.Generic', 'Backdoor.Win32', 'Malware.Suspicious'] : (isSuspicious ? ['PUA.Adware'] : []),
            malware_detected: isMalicious,
            suspicious_content: isSuspicious,
            scanned_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
        }
    })
}

// Generate realistic financial transactions
export function generateTestTransactions(count: number = 35): FinancialTransaction[] {
    const merchants = [
        { name: 'Amazon Web Services', category: 'Cloud Services', safe: true },
        { name: 'Microsoft Azure', category: 'Cloud Services', safe: true },
        { name: 'Salesforce', category: 'Software', safe: true },
        { name: 'Office Depot', category: 'Supplies', safe: true },
        { name: 'Unknown Vendor (Nigeria)', category: 'Wire Transfer', safe: false },
        { name: 'Crypto Exchange XYZ', category: 'Cryptocurrency', safe: false },
        { name: 'Offshore Account LLC', category: 'Wire Transfer', safe: false },
    ]

    return Array.from({ length: count }, (_, i) => {
        const merchant = merchants[i % merchants.length]
        const isSuspicious = !merchant.safe || (i % 7 === 0)
        const amount = isSuspicious
            ? Math.floor(Math.random() * 9000) + 1000
            : Math.floor(Math.random() * 500) + 50
        const daysAgo = Math.floor(Math.random() * 30)

        return {
            id: `test-txn-${i + 1}`,
            workspace_id: 'test',
            created_by: 'test-user',
            transaction_id: `TXN-2024-${String(i + 1).padStart(4, '0')}`,
            amount: amount,
            currency: 'USD',
            transaction_type: isSuspicious ? 'wire_transfer' : 'purchase',
            merchant: merchant.name,
            category: merchant.category,
            risk_score: isSuspicious ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 30),
            is_suspicious: isSuspicious,
            fraud_indicators: isSuspicious ? ['Unusual location', 'Large amount', 'New vendor', 'Unusual time'] : [],
            status: isSuspicious ? (i % 3 === 0 ? 'blocked' : 'flagged') : 'approved',
            reviewed_by: isSuspicious ? 'test-user' : undefined,
            reviewed_at: isSuspicious ? new Date().toISOString() : undefined,
            transaction_date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
        }
    })
}

// Generate realistic deepfake detections
export function generateTestDetections(count: number = 18): DeepfakeDetection[] {
    const mediaFiles = [
        { name: 'CEO_announcement.mp4', type: 'video', fake: false },
        { name: 'team_meeting.mp4', type: 'video', fake: false },
        { name: 'executive_interview.mp4', type: 'video', fake: true },
        { name: 'product_demo.mp4', type: 'video', fake: false },
        { name: 'deepfake_ceo.mp4', type: 'video', fake: true },
        { name: 'conference_call.mp3', type: 'audio', fake: false },
        { name: 'voice_message.mp3', type: 'audio', fake: true },
        { name: 'profile_photo.jpg', type: 'image', fake: false },
        { name: 'manipulated_image.jpg', type: 'image', fake: true },
    ]

    return Array.from({ length: count }, (_, i) => {
        const media = mediaFiles[i % mediaFiles.length]
        const daysAgo = Math.floor(Math.random() * 30)

        return {
            id: `test-detection-${i + 1}`,
            workspace_id: 'test',
            created_by: 'test-user',
            media_type: media.type as 'audio' | 'video' | 'image',
            media_url: `/test/media/${media.name}`,
            file_name: media.name,
            detection_status: 'completed',
            is_deepfake: media.fake,
            confidence_score: media.fake ? Math.floor(Math.random() * 10) + 90 : Math.floor(Math.random() * 10) + 90,
            manipulation_type: media.fake ? ['Face Swap', 'Voice Clone', 'Lip Sync', 'Face Reenactment'][Math.floor(Math.random() * 4)] : undefined,
            analysis_details: media.fake ? {
                facial_artifacts: true,
                audio_mismatch: media.type === 'video',
                lighting_inconsistencies: true,
                temporal_inconsistencies: media.type === 'video'
            } : undefined,
            analyzed_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
        } as DeepfakeDetection
    })
}

// Generate test workspace metrics
export function generateTestMetrics() {
    const threats = generateTestThreats()
    const scans = generateTestScans()
    const transactions = generateTestTransactions()
    const detections = generateTestDetections()

    return {
        workspace_id: 'test',
        security_score: 78,
        active_threats: threats.filter(t => t.status === 'active').length,
        critical_threats: threats.filter(t => t.severity === 'critical' && t.status === 'active').length,
        total_scans: scans.length,
        malware_found: scans.filter(s => s.malware_detected).length,
        suspicious_transactions: transactions.filter(t => t.is_suspicious).length,
        flagged_amount: transactions.filter(t => t.is_suspicious).reduce((sum, t) => sum + t.amount, 0),
        deepfakes_found: detections.filter(d => d.is_deepfake).length,
        total_detections: detections.length,
        last_updated: new Date().toISOString()
    }
}
