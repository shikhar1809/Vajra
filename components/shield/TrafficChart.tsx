'use client'

import { useEffect, useState } from 'react'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TrafficChartProps {
    workspaceId: string
    timeRange?: '1h' | '24h' | '7d' | '30d'
    demoData?: any[]
}

export default function TrafficChart({ workspaceId, timeRange = '24h', demoData }: TrafficChartProps) {
    const [data, setData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (demoData) {
            // Use demo data if provided
            const chartData = demoData.map((item: any) => ({
                time: item.time,
                Total: item.allowed + item.blocked,
                Blocked: item.blocked,
                Bots: Math.floor((item.allowed + item.blocked) * 0.15), // Simulate 15% bot traffic
            }))
            setData(chartData)
            setIsLoading(false)
        } else {
            loadData()
        }
    }, [workspaceId, timeRange, demoData])

    async function loadData() {
        try {
            setIsLoading(true)
            const response = await fetch(
                `/api/shield/analytics?workspaceId=${workspaceId}&timeRange=${timeRange}`
            )
            const result = await response.json()

            if (result.success) {
                // Format data for chart
                const chartData = result.data.trafficOverTime.map((item: any) => ({
                    time: new Date(item.timestamp).toLocaleTimeString(),
                    Total: item.total,
                    Blocked: item.blocked,
                    Bots: item.bots,
                }))
                setData(chartData)
            }
        } catch (error) {
            console.error('Error loading traffic data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6 h-80 flex items-center justify-center">
                <div className="text-slate-400">Loading traffic data...</div>
            </div>
        )
    }

    return (
        <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Traffic Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                        }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Blocked" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="Bots" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
