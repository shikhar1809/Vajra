// Shield Module Types
export interface TrafficLog {
    id: string
    timestamp: string
    ip_address: string
    user_agent: string
    endpoint: string
    response_time: number
    status_code: number
    organization_id: string
}

export interface AnomalyEvent {
    id: string
    timestamp: string
    type: 'traffic_spike' | 'unusual_pattern' | 'suspicious_ip'
    severity: 'critical' | 'high' | 'medium' | 'low'
    description: string
    metrics: Record<string, any>
    bunker_mode_activated: boolean
    organization_id: string
}

export interface BunkerChallenge {
    id: string
    user_id: string
    challenge_type: 'otp' | 'pen_tool' | 'captcha' | 'behavioral' | 'device_fingerprint'
    status: 'pending' | 'completed' | 'failed'
    created_at: string
    completed_at?: string
    metadata: Record<string, any>
}

// Scout Module Types
export interface Vendor {
    id: string
    name: string
    domain: string
    contact_email: string
    security_score: number
    last_assessment: string
    compliance_certifications: string[]
    organization_id: string
    created_at: string
}

export interface VendorAssessment {
    id: string
    vendor_id: string
    assessment_date: string
    ssl_score: number
    breach_history_score: number
    compliance_score: number
    dns_security_score: number
    overall_score: number
    findings: AssessmentFinding[]
}

export interface AssessmentFinding {
    category: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    description: string
    recommendation: string
}

export interface BreachIncident {
    id: string
    vendor_id: string
    incident_date: string
    description: string
    affected_records: number
    data_types: string[]
    resolution_status: 'open' | 'investigating' | 'resolved'
    attribution_confidence: number
}

// Sentry Module Types
export interface EmployeeLocation {
    id: string
    employee_id: string
    latitude: number
    longitude: number
    timestamp: string
    is_within_geofence: boolean
    network_ssid?: string
    device_id: string
}

export interface PhishingCheck {
    id: string
    url: string
    employee_id: string
    check_date: string
    is_safe: boolean
    threat_types: string[]
    source: 'google_safe_browsing' | 'custom_algorithm' | 'blacklist'
}

export interface DocumentScan {
    id: string
    file_name: string
    file_hash: string
    employee_id: string
    scan_date: string
    is_clean: boolean
    threats_found: ThreatInfo[]
    scan_engine: string
}

export interface ThreatInfo {
    type: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    description: string
}

export interface Geofence {
    id: string
    name: string
    latitude: number
    longitude: number
    radius_meters: number
    organization_id: string
}

// Agenios Module Types
export interface CodeScan {
    id: string
    project_name: string
    repository_url?: string
    scan_date: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    total_files: number
    lines_of_code: number
    vulnerabilities_found: number
    security_score: number
    organization_id: string
}

export interface Vulnerability {
    id: string
    scan_id: string
    type: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    file_path: string
    line_number: number
    description: string
    cwe_id?: string
    cvss_score?: number
    recommendation: string
    code_snippet: string
}

export interface AttackSimulation {
    id: string
    scan_id: string
    attack_type: string
    target_endpoint: string
    execution_date: string
    success: boolean
    details: string
    impact_assessment: string
}

export interface SecurityReport {
    id: string
    scan_id: string
    generated_date: string
    executive_summary: string
    vulnerability_breakdown: Record<string, number>
    compliance_status: Record<string, boolean>
    recommendations: string[]
    pdf_url?: string
}

// Shared Types
export interface Organization {
    id: string
    name: string
    industry: string
    created_at: string
    settings: OrganizationSettings
}

export interface OrganizationSettings {
    shield_enabled: boolean
    scout_enabled: boolean
    sentry_enabled: boolean
    agenios_enabled: boolean
    anomaly_threshold: number
    bunker_mode_auto_activate: boolean
    notification_preferences: NotificationPreferences
}

export interface NotificationPreferences {
    email: boolean
    sms: boolean
    in_app: boolean
    severity_threshold: 'critical' | 'high' | 'medium' | 'low'
}

export interface User {
    id: string
    email: string
    full_name: string
    role: 'admin' | 'manager' | 'employee'
    organization_id: string
    created_at: string
}

export interface Notification {
    id: string
    user_id: string
    title: string
    message: string
    type: 'alert' | 'info' | 'warning' | 'success'
    severity: 'critical' | 'high' | 'medium' | 'low'
    read: boolean
    created_at: string
    module: 'shield' | 'scout' | 'sentry' | 'agenios'
}
