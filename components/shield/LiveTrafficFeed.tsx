'use client'

import { Activity, Wifi, WifiOff } from 'lucide-react'
import { useSSE } from '@/hooks/useSSE'

interface LiveTrafficFeedProps {
    workspaceId: string
}

export default function LiveTrafficFeed({ workspaceId }: LiveTrafficFeedProps) {
    const { data, isConnected, reconnect } = useSSE({
        url: `/api/shield/traffic/stream?workspaceId=${workspaceId}`,
        enabled: true,
    })

    const getEventColor = (event: any) => {
        if (event.blocked) return 'border-red-500 bg-red-500/10'
        if (event.botScore > 70) return 'border-yellow-500 bg-yellow-500/10'
        return 'border-green-500 bg-green-500/10'
    }

    const getEventIcon = (event: any) => {
        if (event.blocked) return '🚫'
        if (event.botScore > 70) return '🤖'
        return '✅'
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Live Traffic Feed</h3>
                        <p className="text-sm text-slate-400">Real-time monitoring</p>
                    </div>
                </div>

                {/* Connection Status */}
                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <>
                            <Wifi className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400">Connected</span>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-red-400">Disconnected</span>
                            <button
                                onClick={reconnect}
                                className="ml-2 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded transition-colors"
                            >
                                Reconnect
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Live Stats */}
            {data?.data && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-950/50 rounded-lg p-3">
                        <div className="text-xs text-slate-500 mb-1">Total</div>
                        <div className="text-2xl font-bold text-blue-400">{data.data.totalRequests}</div>
                    </div>
                    <div className="bg-slate-950/50 rounded-lg p-3">
                        <div className="text-xs text-slate-500 mb-1">Blocked</div>
                        <div className="text-2xl font-bold text-red-400">{data.data.blockedRequests}</div>
                    </div>
                    <div className="bg-slate-950/50 rounded-lg p-3">
                        <div className="text-xs text-slate-500 mb-1">Bots</div>
                        <div className="text-2xl font-bold text-yellow-400">{data.data.botRequests}</div>
                    </div>
                </div>
            )}

            {/* Recent Events */}
            <div className="space-y-2">
                <div className="text-sm text-slate-400 mb-3">Recent Events</div>
                {data?.data?.recentEvents?.map((event: any) => (
                    <div
                        key={event.id}
                        className={`border-l-4 ${getEventColor(event)} rounded-r-lg p-3 transition-all animate-in slide-in-from-left duration-300`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{getEventIcon(event)}</span>
                                <div>
                                    <div className="text-white font-mono text-sm">{event.ip}</div>
                                    <div className="text-xs text-slate-400">
                                        {event.method} {event.path}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-slate-400">Bot Score</div>
                                <div className={`text-lg font-bold ${event.botScore > 70 ? 'text-red-400' :
                                        event.botScore > 40 ? 'text-yellow-400' : 'text-green-400'
                                    }`}>
                                    {event.botScore}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {(!data || !data.data?.recentEvents?.length) && (
                    <div className="text-center py-8 text-slate-500">
                        {isConnected ? 'Waiting for traffic...' : 'Connect to see live traffic'}
                    </div>
                )}
            </div>
        </div>
    )
}
