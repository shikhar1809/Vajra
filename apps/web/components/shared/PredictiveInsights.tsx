'use client'

import { Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react'

interface PredictiveInsightsProps {
    insights: string[]
}

export default function PredictiveInsights({ insights }: PredictiveInsightsProps) {
    const getInsightIcon = (insight: string) => {
        if (insight.includes('🚀')) return <TrendingUp className="w-5 h-5 text-blue-400" />
        if (insight.includes('⚠️')) return <AlertTriangle className="w-5 h-5 text-yellow-400" />
        if (insight.includes('✅')) return <TrendingUp className="w-5 h-5 text-green-400" />
        return <Lightbulb className="w-5 h-5 text-purple-400" />
    }

    const getInsightColor = (insight: string) => {
        if (insight.includes('🚀')) return 'border-blue-500/30 bg-blue-500/10'
        if (insight.includes('⚠️')) return 'border-yellow-500/30 bg-yellow-500/10'
        if (insight.includes('✅')) return 'border-green-500/30 bg-green-500/10'
        return 'border-purple-500/30 bg-purple-500/10'
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                    <p className="text-sm text-slate-400">Predictive analysis</p>
                </div>
            </div>

            <div className="space-y-3">
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className={`border rounded-lg p-4 ${getInsightColor(insight)}`}
                    >
                        <div className="flex items-start gap-3">
                            {getInsightIcon(insight)}
                            <p className="text-sm text-white flex-1">
                                {insight.replace(/[🚀⚠️✅📊🤖]/g, '').trim()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
