'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Ban, Clock } from 'lucide-react'

interface IPReputationListProps {
    workspaceId: string
    timeRange?: '1h' | '24h' | '7d' | '30d'
}

interface BlockedIP {
    ip: string
    count: number
    reason: string
}

export default function IPReputationList({ workspaceId, timeRange = '24h' }: IPReputationListProps) {
    const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadBlockedIPs()
    }, [workspaceId, timeRange])

    async function loadBlockedIPs() {
        try {
            setIsLoading(true)
            const response = await fetch(
                `/api/shield/analytics?workspaceId=${workspaceId}&timeRange=${timeRange}`
            )
            const result = await response.json()

            if (result.success) {
                setBlockedIPs(result.data.topBlockedIPs || [])
            }
        } catch (error) {
            console.error('Error loading blocked IPs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getSeverityColor = (reason: string) => {
        if (reason.includes('malicious') || reason.includes('tor')) return 'text-red-400'
        if (reason.includes('bot') || reason.includes('suspicious')) return 'text-yellow-400'
        return 'text-slate-400'
    }

    const getSeverityBg = (reason: string) => {
        if (reason.includes('malicious') || reason.includes('tor')) return 'bg-red-500/20'
        if (reason.includes('bot') || reason.includes('suspicious')) return 'bg-yellow-500/20'
        return 'bg-slate-500/20'
    }

    if (isLoading) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                <div className="text-slate-400">Loading blocked IPs...</div>
            </div>
        )
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Ban className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Blocked IPs</h3>
                        <p className="text-sm text-slate-400">Top threats blocked</p>
                    </div>
                </div>
                <div className="text-2xl font-bold text-red-400">{blockedIPs.length}</div>
            </div>

            {blockedIPs.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AlertTriangle className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-slate-400">No blocked IPs in this time range</p>
                    <p className="text-sm text-slate-500 mt-1">Your traffic is clean!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {blockedIPs.map((item, index) => (
                        <div
                            key={item.ip}
                            className="bg-slate-950/50 rounded-lg p-4 hover:bg-slate-950/70 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-white font-mono font-semibold">{item.ip}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${getSeverityBg(item.reason)} ${getSeverityColor(item.reason)}`}>
                                            {item.reason}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Ban className="w-3 h-3" />
                                            <span>{item.count} blocked requests</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>Last {timeRange}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-red-400">#{index + 1}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {blockedIPs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="text-xs text-slate-500 text-center">
                        Showing top {blockedIPs.length} blocked IPs from the last {timeRange}
                    </div>
                </div>
            )}
        </div>
    )
}
