'use client'

import { useEffect, useState } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { getSupabaseClient } from '@/lib/supabase/client'
import { ShieldAlert, Copy, Check, ExternalLink, Code, Clock, Zap, RotateCcw } from 'lucide-react'
import StatsOverview from '@/components/shield/StatsOverview'
import TrafficChart from '@/components/shield/TrafficChart'
import BotDetectionCard from '@/components/shield/BotDetectionCard'
import IPReputationList from '@/components/shield/IPReputationList'
import GeographicMap from '@/components/shield/GeographicMap'
import LiveTrafficFeed from '@/components/shield/LiveTrafficFeed'
import ExportButton from '@/components/shared/ExportButton'
import { useDemoLock } from '@/lib/demo-lock-manager'
import DemoLockTooltip from '@/components/DemoLockTooltip'

export default function ShieldPage() {
    const { workspace } = useWorkspace()
    const supabase = getSupabaseClient()
    const [apiKey, setApiKey] = useState<string | null>(null)
    const [analytics, setAnalytics] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
    const [isDemoMode, setIsDemoMode] = useState(false)
    const demoLock = useDemoLock(workspace?.id)

    useEffect(() => {
        if (workspace) {
            loadApiKey()
            loadAnalytics()
        }
    }, [workspace, timeRange])

    async function loadApiKey() {
        if (!workspace) return

        try {
            const { data } = await supabase
                .from('api_keys')
                .select('key')
                .eq('workspace_id', workspace.id)
                .eq('is_active', true)
                .single()

            if (data) setApiKey(data.key)
        } catch (error) {
            console.error('Error loading API key:', error)
        }
    }

    async function loadAnalytics() {
        if (!workspace || isDemoMode) return

        try {
            setIsLoading(true)
            const response = await fetch(
                `/api/shield/analytics?workspaceId=${workspace.id}&timeRange=${timeRange}`
            )
            const result = await response.json()

            if (result.success) {
                setAnalytics(result.data)
            }
        } catch (error) {
            console.error('Error loading analytics:', error)
        } finally {
            setIsLoading(false)
        }
    }

    async function generateApiKey() {
        if (!workspace) return

        try {
            const response = await fetch('/api/workspace/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: workspace.id,
                    name: 'Shield API Key',
                }),
            })

            const result = await response.json()
            if (result.success) {
                setApiKey(result.data.key)
            }
        } catch (error) {
            console.error('Error generating API key:', error)
        }
    }

    const toggleDemoMode = () => {
        if (demoLock.isLocked) return

        if (!isDemoMode) {
            setIsDemoMode(true)
            setAnalytics({
                totalRequests: 124500,
                blockedRequests: 4500,
                botRequests: 8200,
                uniqueIPs: 15400,
                requestsHistory: Array.from({ length: 24 }, (_, i) => ({
                    time: `${i}:00`,
                    allowed: Math.floor(Math.random() * 5000 + 4000),
                    blocked: Math.floor(Math.random() * 1000 + 500)
                })),
                geoData: [
                    { country: 'US', count: 45000, percentage: 36 },
                    { country: 'IN', count: 28000, percentage: 22 },
                    { country: 'GB', count: 18000, percentage: 14 },
                    { country: 'DE', count: 15000, percentage: 12 },
                    { country: 'CN', count: 12000, percentage: 10 },
                    { country: 'FR', count: 6500, percentage: 5 }
                ]
            })
        } else {
            setIsDemoMode(false)
            loadAnalytics()
        }
    }

    // Live demo data updates
    useEffect(() => {
        if (!isDemoMode) return

        const interval = setInterval(() => {
            setAnalytics((prev: any) => {
                if (!prev) return prev

                // Update stats with small random changes
                const newTotalRequests = prev.totalRequests + Math.floor(Math.random() * 100 + 50)
                const newBlockedRequests = prev.blockedRequests + Math.floor(Math.random() * 10 + 5)
                const newBotRequests = prev.botRequests + Math.floor(Math.random() * 15 + 5)

                // Add new traffic data point
                const now = new Date()
                const newTrafficPoint = {
                    time: now.toLocaleTimeString(),
                    allowed: Math.floor(Math.random() * 5000 + 4000),
                    blocked: Math.floor(Math.random() * 1000 + 500)
                }

                // Rotate geographic data (simulate traffic shifts)
                const newGeoData = prev.geoData.map((country: any) => ({
                    ...country,
                    count: country.count + Math.floor(Math.random() * 500 - 200),
                    percentage: Math.max(1, Math.min(50, country.percentage + Math.floor(Math.random() * 3 - 1)))
                }))

                return {
                    totalRequests: newTotalRequests,
                    blockedRequests: newBlockedRequests,
                    botRequests: newBotRequests,
                    uniqueIPs: prev.uniqueIPs + Math.floor(Math.random() * 10),
                    requestsHistory: [...prev.requestsHistory.slice(1), newTrafficPoint],
                    geoData: newGeoData
                }
            })
        }, 3000) // Update every 3 seconds

        return () => clearInterval(interval)
    }, [isDemoMode])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const integrationCode = `npm install @shikhar1809/vajra-shield

// middleware.ts
import { createVajraShield } from '@shikhar1809/vajra-shield'

export default createVajraShield({
  workspaceId: '${workspace?.id || 'your-workspace-id'}',
  apiKey: '${apiKey || 'your-api-key'}',
})`

    const timeRanges = [
        { value: '1h', label: '1 Hour' },
        { value: '24h', label: '24 Hours' },
        { value: '7d', label: '7 Days' },
        { value: '30d', label: '30 Days' },
    ]

    if (!workspace) {
        return <div className="text-white">Loading...</div>
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <ShieldAlert className="w-7 h-7 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-1">Shield</h1>
                            <p className="text-slate-400">Traffic Protection & Bot Detection</p>
                        </div>
                    </div>
                    {workspace && <ExportButton module="shield" workspaceId={workspace.id} />}

                    {/* Time Range Selector */}
                    <div className="flex items-center gap-2 bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-1">
                        {timeRanges.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => setTimeRange(range.value as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === range.value
                                    ? 'bg-red-500 text-white'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                    <DemoLockTooltip
                        isLocked={demoLock.isLocked}
                        reason={demoLock.reason}
                        modulesWithData={demoLock.modulesWithData}
                    >
                        <button
                            onClick={toggleDemoMode}
                            disabled={demoLock.isLocked}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${demoLock.isLocked
                                    ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed opacity-50'
                                    : isDemoMode
                                        ? 'bg-amber-500 hover:bg-amber-600 text-black'
                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                        >
                            {isDemoMode ? (
                                <>
                                    <RotateCcw className="w-4 h-4" />
                                    Reset
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    Simulate Attack
                                </>
                            )}
                        </button>
                    </DemoLockTooltip>
                </div>
                {/* Stats Overview */}
                {analytics && (
                    <StatsOverview
                        totalRequests={analytics.totalRequests}
                        blockedRequests={analytics.blockedRequests}
                        botRequests={analytics.botRequests}
                        uniqueIPs={analytics.uniqueIPs}
                    />
                )}

                {/* Traffic Chart */}
                {workspace && <TrafficChart workspaceId={workspace.id} timeRange={timeRange} demoData={isDemoMode ? analytics?.requestsHistory : undefined} />}

                {/* Live Traffic Feed */}
                {workspace && <LiveTrafficFeed workspaceId={workspace.id} />}

                {/* Bot Detection & Geographic Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {workspace && <BotDetectionCard workspaceId={workspace.id} timeRange={timeRange} />}
                    {workspace && <GeographicMap workspaceId={workspace.id} timeRange={timeRange} demoData={isDemoMode ? analytics?.geoData : undefined} />}
                </div>

                {/* Blocked IPs */}
                {workspace && <IPReputationList workspaceId={workspace.id} timeRange={timeRange} />}

                {/* Integration Guide */}
                <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <Code className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Quick Integration</h3>
                            <p className="text-sm text-slate-400">Protect your app in 3 steps</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Step 1: Generate API Key */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    1
                                </div>
                                <h4 className="text-white font-semibold">Generate API Key</h4>
                            </div>
                            {apiKey ? (
                                <div className="bg-slate-950/50 rounded-lg p-4 flex items-center justify-between">
                                    <code className="text-green-400 font-mono text-sm">{apiKey}</code>
                                    <button
                                        onClick={() => copyToClipboard(apiKey)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={generateApiKey}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                                >
                                    Generate API Key
                                </button>
                            )}
                        </div>

                        {/* Step 2: Install Package */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    2
                                </div>
                                <h4 className="text-white font-semibold">Install Package</h4>
                            </div>
                            <div className="bg-slate-950/50 rounded-lg p-4 flex items-center justify-between">
                                <code className="text-blue-400 font-mono text-sm">
                                    npm install @shikhar1809/vajra-shield
                                </code>
                                <button
                                    onClick={() => copyToClipboard('npm install @shikhar1809/vajra-shield')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy
                                </button>
                            </div>
                        </div>

                        {/* Step 3: Add to Middleware */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    3
                                </div>
                                <h4 className="text-white font-semibold">Add to Your App</h4>
                            </div>
                            <div className="bg-slate-950/50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-500">middleware.ts</span>
                                    <button
                                        onClick={() => copyToClipboard(integrationCode)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </button>
                                </div>
                                <pre className="text-sm text-slate-300 overflow-x-auto">
                                    <code>{integrationCode}</code>
                                </pre>
                            </div>
                        </div>

                        {/* NPM Package Link */}
                        <div className="pt-4 border-t border-slate-800">
                            <a
                                href="https://www.npmjs.com/package/@shikhar1809/vajra-shield"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span className="text-sm">View full documentation on NPM</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
