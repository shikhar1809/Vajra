'use client'

import { useEffect, useState } from 'react'
import { Shield, Bot, Users, TrendingUp } from 'lucide-react'

interface BotStatsProps {
    workspaceId: string
    timeRange?: '1h' | '24h' | '7d' | '30d'
}

interface Stats {
    totalRequests: number
    botRequests: number
    humanRequests: number
    averageBotScore: number
    botPercentage: number
}

export default function BotDetectionCard({ workspaceId, timeRange = '24h' }: BotStatsProps) {
    const [stats, setStats] = useState<Stats>({
        totalRequests: 0,
        botRequests: 0,
        humanRequests: 0,
        averageBotScore: 0,
        botPercentage: 0,
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [workspaceId, timeRange])

    async function loadStats() {
        try {
            setIsLoading(true)
            const response = await fetch(
                `/api/shield/analytics?workspaceId=${workspaceId}&timeRange=${timeRange}`
            )
            const result = await response.json()

            if (result.success) {
                const data = result.data
                const botPercentage = data.totalRequests > 0
                    ? Math.round((data.botRequests / data.totalRequests) * 100)
                    : 0

                setStats({
                    totalRequests: data.totalRequests,
                    botRequests: data.botRequests,
                    humanRequests: data.humanRequests,
                    averageBotScore: data.averageBotScore,
                    botPercentage,
                })
            }
        } catch (error) {
            console.error('Error loading bot stats:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                <div className="text-slate-400">Loading bot statistics...</div>
            </div>
        )
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-red-500" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Bot Detection</h3>
                    <p className="text-sm text-slate-400">AI-powered threat analysis</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Bot Percentage */}
                <div className="bg-slate-950/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-slate-400">Bot Traffic</span>
                    </div>
                    <div className="text-3xl font-bold text-red-400">{stats.botPercentage}%</div>
                    <div className="text-xs text-slate-500 mt-1">
                        {stats.botRequests.toLocaleString()} of {stats.totalRequests.toLocaleString()} requests
                    </div>
                </div>

                {/* Human Traffic */}
                <div className="bg-slate-950/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-slate-400">Human Traffic</span>
                    </div>
                    <div className="text-3xl font-bold text-green-400">
                        {100 - stats.botPercentage}%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        {stats.humanRequests.toLocaleString()} legitimate users
                    </div>
                </div>

                {/* Average Bot Score */}
                <div className="bg-slate-950/50 rounded-lg p-4 col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-slate-400">Average Bot Score</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="text-3xl font-bold text-blue-400">{stats.averageBotScore}</div>
                        <div className="text-sm text-slate-500 mb-1">/100</div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 mt-3">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${stats.averageBotScore}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Classification Legend */}
            <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-500 mb-2">Score Classification:</div>
                <div className="flex gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-slate-400">0-50 Human</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-slate-400">50-80 Suspicious</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-slate-400">80-100 Bot</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
