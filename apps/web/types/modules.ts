export interface ThreatIntelligence {
    id: string
    workspace_id: string
    created_by: string
    threat_type: 'malware' | 'phishing' | 'ransomware' | 'ddos' | 'data_breach' | 'other'
    severity: 'critical' | 'high' | 'medium' | 'low'
    title: string
    description?: string
    source?: string
    indicators?: Record<string, any>
    status: 'active' | 'mitigated' | 'false_positive' | 'archived'
    assigned_to?: string
    detected_at: string
    resolved_at?: string
    created_at: string
    updated_at: string
}

export interface DocumentScan {
    id: string
    workspace_id: string
    created_by: string
    file_name: string
    file_size?: number
    file_type?: string
    file_url?: string
    scan_status: 'pending' | 'scanning' | 'completed' | 'failed'
    risk_score?: number
    threats_found?: Record<string, any>
    malware_detected: boolean
    suspicious_content: boolean
    scanned_at?: string
    created_at: string
    updated_at: string
}

export interface FinancialTransaction {
    id: string
    workspace_id: string
    created_by: string
    transaction_id?: string
    amount: number
    currency: string
    transaction_type?: string
    merchant?: string
    category?: string
    risk_score?: number
    is_suspicious: boolean
    fraud_indicators?: Record<string, any>
    status: 'pending' | 'approved' | 'flagged' | 'blocked'
    reviewed_by?: string
    reviewed_at?: string
    transaction_date?: string
    created_at: string
    updated_at: string
}

export interface DeepfakeDetection {
    id: string
    workspace_id: string
    created_by: string
    media_type: 'image' | 'video' | 'audio'
    media_url?: string
    file_name?: string
    detection_status: 'pending' | 'analyzing' | 'completed' | 'failed'
    is_deepfake?: boolean
    confidence_score?: number
    manipulation_type?: string
    analysis_details?: Record<string, any>
    analyzed_at?: string
    created_at: string
    updated_at: string
}

export interface ActivityLog {
    id: string
    workspace_id: string
    user_id: string
    action: string
    resource_type: string
    resource_id?: string
    description: string
    metadata?: Record<string, any>
    ip_address?: string
    user_agent?: string
    created_at: string
}

export interface WorkspaceMetrics {
    workspace_id: string
    workspace_name: string
    active_threats: number
    critical_threats: number
    total_scans: number
    malware_found: number
    suspicious_transactions: number
    flagged_amount: number
    total_detections: number
    deepfakes_found: number
    security_score: number
    last_updated: string
}
