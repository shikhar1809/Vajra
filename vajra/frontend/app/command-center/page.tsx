'use client'

import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Lock, Unlock, AlertTriangle, FileCode, Activity } from 'lucide-react'

export default function CommandCenter() {
    const [threats, setThreats] = useState<any[]>([])
    const [fortressMode, setFortressMode] = useState(false)
    const [threatLevel, setThreatLevel] = useState(0) // 0-100 for heartbeat animation
    const [riskData, setRiskData] = useState<any[]>([
        { name: 'Day 1', value: 45 },
        { name: 'Day 2', value: 30 },
        { name: 'Day 3', value: 25 },
        { name: 'Day 4', value: 15 },
    ])

    // SSE connection with improved parsing
    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const eventSource = new EventSource(`${apiUrl}/api/v1/threats/stream`)

        // Listen for 'threat' events specifically
        eventSource.addEventListener('threat', (event) => {
            try {
                console.log('SSE threat event received:', event.data)
                // Parse the data - backend sends it as a JSON string
                const data = JSON.parse(event.data)

                // Add threat to list
                setThreats(prev => [data, ...prev].slice(0, 10))

                // Spike the threat level for animation
                setThreatLevel(100)
                setTimeout(() => setThreatLevel(0), 2000) // Return to flatline after 2s
            } catch (e) {
                console.error('SSE parse error:', e, 'Raw data:', event.data)
            }
        })

        eventSource.onerror = (error) => {
            console.error('SSE error:', error)
        }

        return () => eventSource.close()
    }, [])

    // Fetch risk data from backend
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/vendors`)
            .then(res => res.json())
            .then(data => {
                if (data.vendors && data.vendors.length > 0) {
                    const chartData = data.vendors.map((v: any, i: number) => ({
                        name: `Day ${i + 1}`,
                        value: v.risk_score
                    }))
                    setRiskData(chartData)
                }
            })
            .catch(() => {
                // Keep default data if fetch fails
            })
    }, [])

    const toggleFortress = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/fortress/toggle?enable=${!fortressMode}`, {
            method: 'POST'
        })
        const data = await res.json()
        setFortressMode(data.fortress_mode)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Command Center</h1>
                <button
                    onClick={toggleFortress}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all border ${fortressMode
                        ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/50'
                        : 'bg-transparent text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                >
                    {fortressMode ? <Lock size={20} /> : <Unlock size={20} />}
                    FORTRESS MODE: {fortressMode ? 'ON' : 'OFF'}
                </button>
            </div>

            {/* Top Grid - Two Columns */}
            <div className="grid grid-cols-2 gap-6">
                {/* Portfolio Risk Analysis */}
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white">Portfolio Risk Analysis</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-slate-400">Risk Score</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={riskData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Live Threat Stream with Heartbeat */}
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <AlertTriangle className="text-red-500" size={24} />
                            Live Threat Stream
                        </h2>
                        {/* Heartbeat Indicator */}
                        <div className="flex items-center gap-2">
                            <Activity
                                className={`transition-all duration-300 ${threatLevel > 0 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}
                                size={20}
                            />
                            <div className="relative w-32 h-8 bg-slate-950 rounded overflow-hidden">
                                {/* Flatline */}
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 32">
                                    <path
                                        d={threatLevel > 0
                                            ? "M0,16 L20,16 L24,4 L28,28 L32,16 L128,16" // Spike
                                            : "M0,16 L128,16" // Flatline
                                        }
                                        stroke={threatLevel > 0 ? "#ef4444" : "#10b981"}
                                        strokeWidth="2"
                                        fill="none"
                                        className="transition-all duration-500"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {threats.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-500 text-sm mb-2">No active threats detected</p>
                                <p className="text-xs text-slate-600">System monitoring active</p>
                            </div>
                        ) : (
                            threats.map((threat, i) => (
                                <div
                                    key={i}
                                    className="bg-slate-800 p-3 rounded border-l-4 border-red-500 animate-pulse"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-red-400">
                                            {threat.type || 'THREAT'}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {new Date(threat.timestamp * 1000).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 mt-1">
                                        {threat.message || JSON.stringify(threat)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Middle Row - Summary Widgets */}
            <div className="grid grid-cols-2 gap-6">
                {/* Vendor Risk Summary */}
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                    <h2 className="text-xl font-semibold text-white mb-4">Vendor Risk Summary</h2>
                    <div className="text-center">
                        <p className="text-5xl font-bold text-red-500 mb-2">3 Critical Risks</p>
                        <p className="text-sm text-slate-400">out of 12 tracked vendors</p>
                    </div>
                </div>

                {/* Compliance Readiness */}
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                    <h2 className="text-xl font-semibold text-white mb-4">Compliance Readiness</h2>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-2xl font-bold text-white">SOC 2: 87% Ready</p>
                            <span className="text-lg text-slate-400">87%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3">
                            <div
                                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: '87%' }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Vulnerability Analysis - Full Width */}
            <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                <h2 className="text-xl font-semibold text-white mb-4">AI Vulnerability Analysis</h2>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-16 text-center hover:border-slate-600 transition-colors">
                    <FileCode size={64} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">
                        Drop code file here
                    </h3>
                    <p className="text-sm text-slate-400">
                        Supports: .py, .js, .ts, .java, .go, .rb
                    </p>
                </div>
            </div>
        </div>
    )
}
