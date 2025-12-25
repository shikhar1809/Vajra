'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendChartProps {
    label: string
    current: number
    previous: number
    format?: 'number' | 'percent'
}

export default function TrendChart({ label, current, previous, format = 'number' }: TrendChartProps) {
    const change = current - previous
    const changePercent = previous > 0 ? (change / previous) * 100 : 0
    const trend = Math.abs(changePercent) > 5 ? (change > 0 ? 'up' : 'down') : 'stable'

    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-400'
        if (trend === 'down') return 'text-red-400'
        return 'text-slate-400'
    }

    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp className="w-4 h-4" />
        if (trend === 'down') return <TrendingDown className="w-4 h-4" />
        return <Minus className="w-4 h-4" />
    }

    const formatValue = (value: number) => {
        if (format === 'percent') return `${value}%`
        return value.toLocaleString()
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">{label}</div>
            <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-white">{formatValue(current)}</div>
                <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                    {getTrendIcon()}
                    <span className="text-sm font-semibold">
                        {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                    </span>
                </div>
            </div>
            <div className="text-xs text-slate-500 mt-1">
                vs previous period: {formatValue(previous)}
            </div>
        </div>
    )
}
