'use client'

import { useEffect, useState } from 'react'
import { Bell, AlertTriangle, Shield, Activity, Clock } from 'lucide-react'

interface AlertsPanelProps {
    workspaceId: string
}

interface Alert {
    id: string
    alert_type: string
    severity: string
    title: string
    message: string
    created_at: string
}

export default function AlertsPanel({ workspaceId }: AlertsPanelProps) {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadAlerts()
        // Refresh every 30 seconds
        const interval = setInterval(loadAlerts, 30000)
        return () => clearInterval(interval)
    }, [workspaceId])

    async function loadAlerts() {
        try {
            const response = await fetch(`/api/shield/alerts?workspaceId=${workspaceId}`)
            const result = await response.json()

            if (result.success) {
                setAlerts(result.data.slice(0, 10)) // Show last 10
            }
        } catch (error) {
            console.error('Error loading alerts:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getSeverityColor = (severity: string) => {
        const colors = {
            low: 'text-green-400',
            medium: 'text-blue-400',
            high: 'text-yellow-400',
            critical: 'text-red-400',
        }
        return colors[severity as keyof typeof colors] || 'text-slate-400'
    }

    const getSeverityBg = (severity: string) => {
        const colors = {
            low: 'bg-green-500/20',
            medium: 'bg-blue-500/20',
            high: 'bg-yellow-500/20',
            critical: 'bg-red-500/20',
        }
        return colors[severity as keyof typeof colors] || 'bg-slate-500/20'
    }

    const getAlertIcon = (type: string) => {
        const icons = {
            ddos: Shield,
            bot_spike: Activity,
            malicious_ip: AlertTriangle,
            high_traffic: Activity,
        }
        return icons[type as keyof typeof icons] || Bell
    }

    if (isLoading) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                <div className="text-slate-400">Loading alerts...</div>
            </div>
        )
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
                    <p className="text-sm text-slate-400">Last 10 security events</p>
                </div>
            </div>

            {alerts.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-slate-400">No alerts</p>
                    <p className="text-sm text-slate-500 mt-1">All systems operational</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {alerts.map((alert) => {
                        const Icon = getAlertIcon(alert.alert_type)
                        return (
                            <div
                                key={alert.id}
                                className="bg-slate-950/50 rounded-lg p-4 hover:bg-slate-950/70 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 ${getSeverityBg(alert.severity)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        <Icon className={`w-4 h-4 ${getSeverityColor(alert.severity)}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-white font-semibold">{alert.title}</h4>
                                            <span className={`px-2 py-0.5 rounded text-xs ${getSeverityBg(alert.severity)} ${getSeverityColor(alert.severity)}`}>
                                                {alert.severity.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 mb-2">{alert.message}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(alert.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
