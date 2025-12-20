'use client'

import { Shield, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

interface VendorScoreCardProps {
    vendor: {
        name: string
        domain: string
        security_score: number
        risk_level: string
        ssl_score?: number
        breach_count?: number
        compliance_status?: any
    }
}

export default function VendorScoreCard({ vendor }: VendorScoreCardProps) {
    const getRiskColor = (level: string) => {
        const colors = {
            low: 'text-green-400',
            medium: 'text-yellow-400',
            high: 'text-orange-400',
            critical: 'text-red-400',
        }
        return colors[level as keyof typeof colors] || 'text-slate-400'
    }

    const getRiskBg = (level: string) => {
        const colors = {
            low: 'bg-green-500/20',
            medium: 'bg-yellow-500/20',
            high: 'bg-orange-500/20',
            critical: 'bg-red-500/20',
        }
        return colors[level as keyof typeof colors] || 'bg-slate-500/20'
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400'
        if (score >= 60) return 'text-yellow-400'
        if (score >= 40) return 'text-orange-400'
        return 'text-red-400'
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{vendor.name}</h3>
                    <p className="text-sm text-slate-400">{vendor.domain}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg ${getRiskBg(vendor.risk_level)}`}>
                    <span className={`text-sm font-semibold ${getRiskColor(vendor.risk_level)}`}>
                        {vendor.risk_level.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Overall Score */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Security Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(vendor.security_score)}`}>
                        {vendor.security_score}/100
                    </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${vendor.security_score >= 80 ? 'bg-green-500' :
                                vendor.security_score >= 60 ? 'bg-yellow-500' :
                                    vendor.security_score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${vendor.security_score}%` }}
                    />
                </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">SSL</div>
                    <div className={`text-lg font-bold ${getScoreColor(vendor.ssl_score || 0)}`}>
                        {vendor.ssl_score || 0}
                    </div>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Breaches</div>
                    <div className={`text-lg font-bold ${vendor.breach_count === 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {vendor.breach_count || 0}
                    </div>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Compliance</div>
                    <div className="text-lg font-bold text-blue-400">
                        {Object.keys(vendor.compliance_status || {}).length}
                    </div>
                </div>
            </div>
        </div>
    )
}
