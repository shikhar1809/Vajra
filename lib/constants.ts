// Severity Levels
export const SEVERITY_LEVELS = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    INFO: 'info',
} as const

export type SeverityLevel = typeof SEVERITY_LEVELS[keyof typeof SEVERITY_LEVELS]

// Shield Module Constants
export const BUNKER_CHALLENGE_TYPES = {
    OTP: 'otp',
    PEN_TOOL: 'pen_tool',
    CAPTCHA: 'captcha',
    BEHAVIORAL: 'behavioral',
    DEVICE_FINGERPRINT: 'device_fingerprint',
} as const

export type BunkerChallengeType = typeof BUNKER_CHALLENGE_TYPES[keyof typeof BUNKER_CHALLENGE_TYPES]

export const ANOMALY_THRESHOLDS = {
    TRAFFIC_SPIKE_MULTIPLIER: 3, // 3x normal traffic
    TIME_WINDOW_MINUTES: 5,
    MIN_REQUESTS_FOR_ANALYSIS: 100,
}

// Scout Module Constants
export const VENDOR_SECURITY_CATEGORIES = {
    SSL_SECURITY: 'ssl_security',
    BREACH_HISTORY: 'breach_history',
    COMPLIANCE: 'compliance',
    DNS_SECURITY: 'dns_security',
    VULNERABILITY_DISCLOSURE: 'vulnerability_disclosure',
} as const

export const COMPLIANCE_STANDARDS = [
    'SOC 2',
    'ISO 27001',
    'GDPR',
    'HIPAA',
    'PCI DSS',
    'CCPA',
] as const

// Sentry Module Constants
export const PHISHING_CHECK_SOURCES = {
    GOOGLE_SAFE_BROWSING: 'google_safe_browsing',
    CUSTOM_ALGORITHM: 'custom_algorithm',
    BLACKLIST: 'blacklist',
} as const

export const MALWARE_SCAN_ENGINES = {
    SIGNATURE_BASED: 'signature_based',
    HEURISTIC: 'heuristic',
    HASH_LOOKUP: 'hash_lookup',
} as const

export const GEOFENCE_STATUS = {
    INSIDE: 'inside',
    OUTSIDE: 'outside',
    UNKNOWN: 'unknown',
} as const

// Agenios Module Constants
export const VULNERABILITY_TYPES = {
    SQL_INJECTION: 'sql_injection',
    XSS: 'xss',
    CSRF: 'csrf',
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    SENSITIVE_DATA_EXPOSURE: 'sensitive_data_exposure',
    XXE: 'xxe',
    BROKEN_ACCESS_CONTROL: 'broken_access_control',
    SECURITY_MISCONFIGURATION: 'security_misconfiguration',
    INSECURE_DESERIALIZATION: 'insecure_deserialization',
    USING_COMPONENTS_WITH_KNOWN_VULNERABILITIES: 'using_components_with_known_vulnerabilities',
    INSUFFICIENT_LOGGING: 'insufficient_logging',
} as const

export const ATTACK_TYPES = {
    PENETRATION_TEST: 'penetration_test',
    FUZZING: 'fuzzing',
    BRUTE_FORCE: 'brute_force',
    DOS: 'dos',
    MITM: 'mitm',
} as const

export const SCAN_STATUS = {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
} as const

// Color mappings for severity
export const SEVERITY_COLORS = {
    critical: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-black',
    low: 'bg-blue-500 text-white',
    info: 'bg-gray-500 text-white',
} as const

// Module routes
export const ROUTES = {
    HOME: '/',
    SHIELD: '/shield',
    SHIELD_ANALYTICS: '/shield/analytics',
    SHIELD_BUNKER: '/shield/bunker',
    SCOUT: '/scout',
    SCOUT_VENDORS: '/scout/vendors',
    SENTRY: '/sentry',
    SENTRY_PHISHING: '/sentry/phishing',
    SENTRY_SCANNER: '/sentry/scanner',
    SENTRY_LOCATION: '/sentry/location',
    AGENIOS: '/agenios',
    AGENIOS_SCAN: '/agenios/scan',
    AGENIOS_REPORTS: '/agenios/reports',
} as const
