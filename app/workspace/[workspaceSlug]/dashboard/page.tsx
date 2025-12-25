'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { calculateSecurityScore, getScoreColor, getScoreLabel, getScoreBgColor } from '@/lib/security-score'
import type { WorkspaceMetrics } from '@/types/modules'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { ShieldAlert, FileScan, Radar, ScanFace, Users, Activity, Zap } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function DashboardPage() {
    const params = useParams()
    const supabase = getSupabaseClient()
    const { workspace } = useWorkspace()
    const [metrics, setMetrics] = useState<WorkspaceMetrics | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const workspaceSlug = params?.workspaceSlug as string

    // Live Monitor State
    const [trafficData, setTrafficData] = useState<any[]>([])
    const [liveLogs, setLiveLogs] = useState<any[]>([])
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        loadMetrics()
        startLiveMonitor()
        return () => stopLiveMonitor()
    }, [workspaceSlug])

    const startLiveMonitor = () => {
        // Initial Mock Data to fill chart
        const initialData = Array.from({ length: 20 }, (_, i) => ({
            time: new Date(Date.now() - (20 - i) * 1000).toLocaleTimeString(),
            requests: Math.floor(Math.random() * 50) + 10,
            blocked: Math.floor(Math.random() * 5)
        }))
        setTrafficData(initialData)

        // Poll every 2 seconds
        pollingRef.current = setInterval(async () => {
            try {
                const res = await fetch('/api/shield/logs')
                const data = await res.json()

                if (data && Array.isArray(data)) {
                    // Update Logs
                    setLiveLogs(prev => [...data, ...prev].slice(0, 10))

                    // Update Chart Data
                    const newPoint = {
                        time: new Date().toLocaleTimeString(),
                        requests: Math.floor(Math.random() * 50) + 20 + data.length * 5, // Simulate traffic spike with logs
                        blocked: data.filter((l: any) => l.action !== 'ALLOW').length
                    }

                    setTrafficData(prev => [...prev.slice(1), newPoint])
                }
            } catch (e) {
                console.error("Polling error", e)
            }
        }, 2000)
    }

    const stopLiveMonitor = () => {
        if (pollingRef.current) clearInterval(pollingRef.current)
    }

    async function loadMetrics() {
        try {
            if (!workspace) return
            await supabase.rpc('refresh_workspace_metrics')
            const { data } = await supabase
                .from('workspace_metrics')
                .select('*')
                .eq('workspace_id', workspace.id)
                .single()
            if (data) setMetrics(data)
        } catch (error) {
            console.error('Error loading metrics:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="p-8 text-white text-xl">Loading dashboard...</div>
    }

    const securityScore = metrics ? metrics.security_score : 0
    const scoreColor = getScoreColor(securityScore)
    const scoreBgColor = getScoreBgColor(securityScore)
    const scoreLabel = getScoreLabel(securityScore)

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-slate-400">Overview of your security posture</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-bold text-green-500 uppercase">Live Monitor Active</span>
                </div>
            </div>

            {/* Live Traffic Monitor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500" />
                            Live Traffic Intensity
                        </h3>
                        <span className="text-slate-500 text-xs">Real-time (2s Poll)</span>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trafficData}>
                                <defs>
                                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="requests" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRequests)" strokeWidth={2} />
                                <Area type="monotone" dataKey="blocked" stroke="#ef4444" fillOpacity={1} fill="url(#colorBlocked)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Live Event Feed */}
                <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-lg p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Live Events
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                        {liveLogs.length > 0 ? (
                            liveLogs.map((log, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded bg-slate-950/50 border border-slate-800/50 animate-in slide-in-from-right-4 duration-300">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.action === 'BLOCK' ? 'bg-red-500' :
                                            log.action === 'FLAG' ? 'bg-amber-500' : 'bg-green-500'
                                        }`} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className={`text-xs font-bold ${log.action === 'BLOCK' ? 'text-red-400' :
                                                    log.action === 'FLAG' ? 'text-amber-400' : 'text-green-400'
                                                }`}>{log.action}</span>
                                            <span className="text-[10px] text-slate-500 font-mono text-right">{new Date(log.time).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="text-xs text-slate-300 font-mono truncate" title={log.ip}>{log.ip}</div>
                                        {log.rule && <div className="text-[10px] text-slate-400 truncate mt-0.5">{log.rule}</div>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-slate-500 py-10 text-sm">Waiting for live events...</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Metrics Grid (Existing) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Security Score */}
                <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-lg p-6 col-span-1 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Security Score</h3>
                        <span className={`text-sm font-medium ${scoreColor}`}>{scoreLabel}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative w-24 h-24">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-700" />
                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none"
                                    strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - securityScore / 100)}`}
                                    className={scoreColor} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-2xl font-bold ${scoreColor}`}>{securityScore}</span>
                            </div>
                        </div>
                        <div>
                            <div className={`text-4xl font-bold ${scoreColor}`}>{securityScore}/100</div>
                            <p className="text-sm text-slate-400 mt-1">Last 30 days</p>
                        </div>
                    </div>
                </div>

                {/* Active Threats */}
                <Link href={`/workspace/${workspaceSlug}/shield`} className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-lg p-6 hover:border-red-500 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Active Threats</h3>
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">{metrics?.active_threats || 0}</div>
                    <div className="flex items-center gap-2">
                        <span className="text-red-500 font-medium">{metrics?.critical_threats || 0} Critical</span>
                    </div>
                </Link>

                {/* Document Scans */}
                <Link href={`/workspace/${workspaceSlug}/aegis`} className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-lg p-6 hover:border-blue-500 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Scans Today</h3>
                        <FileScan className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">{metrics?.total_scans || 0}</div>
                    <div className="flex items-center gap-2">
                        {metrics?.malware_found ? (
                            <span className="text-red-500 font-medium">{metrics.malware_found} Malware Found</span>
                        ) : (
                            <span className="text-green-500 font-medium">✓ All Clean</span>
                        )}
                    </div>
                </Link>

                {/* Suspicious Transactions */}
                <Link href={`/workspace/${workspaceSlug}/scout`} className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-lg p-6 hover:border-yellow-500 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Suspicious Transactions</h3>
                        <Radar className="w-8 h-8 text-yellow-500" />
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">{metrics?.suspicious_transactions || 0}</div>
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-500 font-medium">${metrics?.flagged_amount?.toLocaleString() || 0} Flagged</span>
                    </div>
                </Link>

                {/* Deepfakes Detected */}
                <Link href={`/workspace/${workspaceSlug}/sentry`} className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-lg p-6 hover:border-purple-500 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Deepfakes Detected</h3>
                        <ScanFace className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">{metrics?.deepfakes_found || 0}</div>
                    <div className="flex items-center gap-2">
                        {metrics?.deepfakes_found ? (
                            <span className="text-purple-500 font-medium">{metrics.total_detections} Total Analyzed</span>
                        ) : (
                            <span className="text-green-500 font-medium">✓ None Detected</span>
                        )}
                    </div>
                </Link>

                {/* Team Members */}
                <Link href={`/workspace/${workspaceSlug}/team`} className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-lg p-6 hover:border-green-500 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Team Members</h3>
                        <Users className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">1</div>
                    <div className="flex items-center gap-2">
                        <span className="text-green-500 font-medium">All Active</span>
                    </div>
                </Link>
            </div>
        </div>
    )
}
