/**
 * CSV Export Generator
 * Converts data to CSV format for download
 */

interface ExportData {
    headers: string[]
    rows: any[][]
}

/**
 * Generate CSV string from data
 */
export function generateCSV(data: ExportData): string {
    const { headers, rows } = data

    // Escape CSV values
    const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) return ''
        const str = String(value)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
        }
        return str
    }

    // Build CSV
    const csvLines: string[] = []

    // Add headers
    csvLines.push(headers.map(escapeCSV).join(','))

    // Add rows
    rows.forEach(row => {
        csvLines.push(row.map(escapeCSV).join(','))
    })

    return csvLines.join('\n')
}

/**
 * Export Shield traffic data to CSV
 */
export function exportShieldTraffic(trafficLogs: any[]): ExportData {
    return {
        headers: ['Timestamp', 'IP Address', 'Path', 'Method', 'Bot Score', 'Blocked', 'Country'],
        rows: trafficLogs.map(log => [
            new Date(log.created_at).toISOString(),
            log.ip_address,
            log.path,
            log.method,
            log.bot_score || 0,
            log.is_blocked ? 'Yes' : 'No',
            log.country || 'Unknown',
        ]),
    }
}

/**
 * Export Scout vendors to CSV
 */
export function exportScoutVendors(vendors: any[]): ExportData {
    return {
        headers: ['Name', 'Domain', 'Security Score', 'SSL Score', 'Breaches', 'Risk Level', 'Last Scan'],
        rows: vendors.map(vendor => [
            vendor.name,
            vendor.domain,
            vendor.security_score || 0,
            vendor.ssl_score || 0,
            vendor.breach_count || 0,
            vendor.risk_level || 'unknown',
            vendor.last_scan_at ? new Date(vendor.last_scan_at).toISOString() : 'Never',
        ]),
    }
}

/**
 * Export Sentry employees to CSV
 */
export function exportSentryEmployees(employees: any[]): ExportData {
    return {
        headers: ['Name', 'Email', 'Department', 'Security Score', 'Phishing Pass Rate', 'Training Completed', 'Points'],
        rows: employees.map(emp => [
            emp.name,
            emp.email,
            emp.department || 'N/A',
            emp.security_score || 0,
            emp.phishing_click_rate ? `${100 - emp.phishing_click_rate}%` : '0%',
            emp.training_completed || 0,
            emp.points || 0,
        ]),
    }
}

/**
 * Export Aegis projects to CSV
 */
export function exportAegisProjects(projects: any[]): ExportData {
    return {
        headers: ['Name', 'Repository', 'Security Score', 'Critical', 'High', 'Medium', 'Low', 'Last Scan'],
        rows: projects.map(proj => [
            proj.name,
            proj.repository_url || 'N/A',
            proj.security_score || 0,
            proj.vulnerabilities_critical || 0,
            proj.vulnerabilities_high || 0,
            proj.vulnerabilities_medium || 0,
            proj.vulnerabilities_low || 0,
            proj.last_scan_at ? new Date(proj.last_scan_at).toISOString() : 'Never',
        ]),
    }
}

/**
 * Create downloadable CSV file
 */
export function createCSVDownload(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
}
