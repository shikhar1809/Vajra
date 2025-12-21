'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { calculateSecurityScore, getScoreColor, getScoreLabel, getScoreBgColor } from '@/lib/security-score'
import type { WorkspaceMetrics } from '@/types/modules'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { ShieldAlert, FileScan, Radar, ScanFace, Users, Activity } from 'lucide-react'

export default function DashboardPage() {
    const params = useParams()
    const supabase = getSupabaseClient()
    const { workspace } = useWorkspace()
    const [metrics, setMetrics] = useState<WorkspaceMetrics | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const workspaceSlug = params?.workspaceSlug as string

    useEffect(() => {
        loadMetrics()
    }, [workspaceSlug])

    async function loadMetrics() {
        try {
            // Get workspace ID from context
            if (!workspace) return

            // Refresh materialized view
            await supabase.rpc('refresh_workspace_metrics')

            // Get metrics
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
        return (
            <div className="p-8">
                <div className="text-white text-xl">Loading dashboard...</div>
            </div>
        )
    }

    const securityScore = metrics ? metrics.security_score : 0
    const scoreColor = getScoreColor(securityScore)
    const scoreBgColor = getScoreBgColor(securityScore)
    const scoreLabel = getScoreLabel(securityScore)

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-slate-400">Overview of your security posture</p>
            </div>

            {/* Metrics Grid */}
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
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-slate-700"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - securityScore / 100)}`}
                                    className={scoreColor}
                                    strokeLinecap="round"
                                />
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
                        <span className="text-yellow-500 font-medium">
                            ${metrics?.flagged_amount?.toLocaleString() || 0} Flagged
                        </span>
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
