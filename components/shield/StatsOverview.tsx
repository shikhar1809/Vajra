'use client'

import { Shield, Ban, Activity, Users } from 'lucide-react'

interface StatsOverviewProps {
    totalRequests: number
    blockedRequests: number
    botRequests: number
    uniqueIPs: number
}

export default function StatsOverview({
    totalRequests,
    blockedRequests,
    botRequests,
    uniqueIPs,
}: StatsOverviewProps) {
    const blockRate = totalRequests > 0 ? Math.round((blockedRequests / totalRequests) * 100) : 0
    const botRate = totalRequests > 0 ? Math.round((botRequests / totalRequests) * 100) : 0

    const stats = [
        {
            label: 'Total Requests',
            value: totalRequests.toLocaleString(),
            icon: Activity,
            color: 'text-blue-400',
            bg: 'bg-blue-500/20',
        },
        {
            label: 'Blocked',
            value: blockedRequests.toLocaleString(),
            subtext: `${blockRate}% of total`,
            icon: Ban,
            color: 'text-red-400',
            bg: 'bg-red-500/20',
        },
        {
            label: 'Bot Traffic',
            value: botRequests.toLocaleString(),
            subtext: `${botRate}% of total`,
            icon: Shield,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/20',
        },
        {
            label: 'Unique IPs',
            value: uniqueIPs.toLocaleString(),
            icon: Users,
            color: 'text-green-400',
            bg: 'bg-green-500/20',
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
                const Icon = stat.icon
                return (
                    <div
                        key={stat.label}
                        className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </div>
                        <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                        <div className="text-sm text-slate-400">{stat.label}</div>
                        {stat.subtext && <div className="text-xs text-slate-500 mt-1">{stat.subtext}</div>}
                    </div>
                )
            })}
        </div>
    )
}
