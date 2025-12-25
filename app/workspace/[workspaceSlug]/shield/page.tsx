'use client'

import { useEffect, useState } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { getSupabaseClient } from '@/lib/supabase/client'
import { ShieldAlert, Copy, Check, ExternalLink, Code, Clock, Zap, RotateCcw, Terminal } from 'lucide-react'
import StatsOverview from '@/components/shield/StatsOverview'
import TrafficChart from '@/components/shield/TrafficChart'
import BotDetectionCard from '@/components/shield/BotDetectionCard'
import IPReputationList from '@/components/shield/IPReputationList'
import GeographicMap from '@/components/shield/GeographicMap'
import LiveTrafficFeed from '@/components/shield/LiveTrafficFeed'
import ExportButton from '@/components/shared/ExportButton'
import { useDemoLock } from '@/lib/demo-lock-manager'
import DemoLockTooltip from '@/components/DemoLockTooltip'
import IntegrationGuide from '@/components/shared/IntegrationGuide'

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

    // New States
    const [bunkerMode, setBunkerMode] = useState(false)
    const [realLogs, setRealLogs] = useState<any[]>([])
    const [showIntegration, setShowIntegration] = useState(false)

    useEffect(() => {
        if (workspace) {
            loadApiKey()
            loadAnalytics()
            // Poll for real logs if not in demo mode
            const pollInterval = setInterval(() => {
                if (!isDemoMode) loadRealLogs()
            }, 2000)
            return () => clearInterval(pollInterval)
        }
    }, [workspace, timeRange, isDemoMode])

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

    async function loadRealLogs() {
        try {
            const res = await fetch('/api/shield/logs')
            const data = await res.json()
            if (data.success && Array.isArray(data.data)) {
                setRealLogs(data.data)
                if (data.data.length > 0) {
                    setAnalytics((prev: any) => ({
                        ...prev,
                        totalRequests: (prev?.totalRequests || 0) + data.data.length,
                        requestsHistory: [...(prev?.requestsHistory || []), {
                            time: new Date().toLocaleTimeString(),
                            allowed: data.data.filter((l: any) => l.action === 'ALLOW').length,
                            blocked: data.data.filter((l: any) => l.action === 'BLOCK').length
                        }].slice(-24)
                    }))
                }
            }
        } catch (e) {
            console.error("Failed to fetch real logs", e)
        }
    }

    async function toggleBunkerMode() {
        const newState = !bunkerMode
        setBunkerMode(newState)
        try {
            await fetch('/api/shield/bunker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: newState })
            })
        } catch (e) {
            console.error("Failed to toggle bunker mode", e)
            setBunkerMode(!newState) // Revert on error
        }
    }

    // Original loadAnalytics (keep for historical data if needed, but we rely on polling above now)
    async function loadAnalytics() {
        if (!workspace || isDemoMode) return
        // In a real implementation this would fetch from an API
        // For now preventing errors with empty implementation or mock data if needed
    }

    const toggleDemoMode = () => {
        setIsDemoMode(!isDemoMode)
        // Mock toggle logic would go here
    }

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
                    <div className="flex items-center gap-3">
                        {workspace && <ExportButton module="shield" workspaceId={workspace.id} />}

                        {/* Connect Project Button */}
                        <button
                            onClick={() => setShowIntegration(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-blue-500/20"
                        >
                            <Terminal className="w-4 h-4" />
                            Connect Project
                        </button>

                        {/* Bunker Mode Toggle */}
                        <button
                            onClick={toggleBunkerMode}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors border ${bunkerMode
                                ? 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30'
                                : 'bg-slate-900/20 text-slate-400 border-slate-700 hover:text-white'
                                }`}
                        >
                            <ShieldAlert className="w-4 h-4" />
                            {bunkerMode ? 'Bunker Mode ACTIVE' : 'Bunker Mode'}
                        </button>
                    </div>
                </div>

                {/* Integration Modal */}
                {workspace && (
                    <IntegrationGuide
                        isOpen={showIntegration}
                        onClose={() => setShowIntegration(false)}
                        module="shield"
                        workspaceId={workspace.id}
                    />
                )}

                {/* Time Range Selector */}
                <div className="flex items-center gap-2 bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-lg p-1 w-fit">
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
                    <DemoLockTooltip
                        isLocked={demoLock.isLocked}
                        reason={demoLock.reason}
                        modulesWithData={demoLock.modulesWithData}
                    >
                        <button
                            onClick={toggleDemoMode}
                            disabled={demoLock.isLocked}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ml-2 transition-colors ${demoLock.isLocked
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

                {/* Quick Integration Card (Footer) */}
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
                    </div>
                </div>
            </div>
        </div >
    )
}
