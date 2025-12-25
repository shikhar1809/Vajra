'use client'

import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

interface ProjectScoreCardProps {
    project: {
        name: string
        repository_url?: string
        security_score: number
        vulnerabilities_critical?: number
        vulnerabilities_high?: number
        vulnerabilities_medium?: number
        vulnerabilities_low?: number
        last_scan_at?: string
    }
}

export default function ProjectScoreCard({ project }: ProjectScoreCardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400'
        if (score >= 60) return 'text-yellow-400'
        if (score >= 40) return 'text-orange-400'
        return 'text-red-400'
    }

    const getRiskLevel = (score: number) => {
        if (score >= 80) return { label: 'SECURE', color: 'bg-green-500/20 text-green-400' }
        if (score >= 60) return { label: 'MODERATE', color: 'bg-yellow-500/20 text-yellow-400' }
        if (score >= 40) return { label: 'AT RISK', color: 'bg-orange-500/20 text-orange-400' }
        return { label: 'CRITICAL', color: 'bg-red-500/20 text-red-400' }
    }

    const risk = getRiskLevel(project.security_score)
    const totalVulns = (project.vulnerabilities_critical || 0) +
        (project.vulnerabilities_high || 0) +
        (project.vulnerabilities_medium || 0) +
        (project.vulnerabilities_low || 0)

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
                    {project.repository_url && (
                        <p className="text-sm text-slate-400 truncate">{project.repository_url}</p>
                    )}
                    {project.last_scan_at && (
                        <p className="text-xs text-slate-500 mt-1">
                            Last scan: {new Date(project.last_scan_at).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <div className={`px-3 py-1 rounded-lg ${risk.color}`}>
                    <span className="text-sm font-semibold">{risk.label}</span>
                </div>
            </div>

            {/* Overall Score */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Security Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(project.security_score)}`}>
                        {project.security_score}/100
                    </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${project.security_score >= 80 ? 'bg-green-500' :
                                project.security_score >= 60 ? 'bg-yellow-500' :
                                    project.security_score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${project.security_score}%` }}
                    />
                </div>
            </div>

            {/* Vulnerabilities Grid */}
            <div className="grid grid-cols-4 gap-2">
                <div className="bg-slate-950/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Critical</div>
                    <div className={`text-lg font-bold ${(project.vulnerabilities_critical || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {project.vulnerabilities_critical || 0}
                    </div>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">High</div>
                    <div className={`text-lg font-bold ${(project.vulnerabilities_high || 0) > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                        {project.vulnerabilities_high || 0}
                    </div>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Medium</div>
                    <div className={`text-lg font-bold ${(project.vulnerabilities_medium || 0) > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {project.vulnerabilities_medium || 0}
                    </div>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Low</div>
                    <div className={`text-lg font-bold ${(project.vulnerabilities_low || 0) > 0 ? 'text-blue-400' : 'text-green-400'}`}>
                        {project.vulnerabilities_low || 0}
                    </div>
                </div>
            </div>

            {/* Total Vulnerabilities */}
            {totalVulns === 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>No vulnerabilities detected</span>
                </div>
            )}
        </div>
    )
}
