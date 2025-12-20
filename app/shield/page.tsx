"use client";

import { useState, useEffect } from "react";
import { Shield, Activity, Users, Ban, Settings, TrendingUp, AlertTriangle, Zap, RotateCcw } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { AlertBanner } from "@/components/common/AlertBanner";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrafficMonitor } from "@/components/shield/TrafficMonitor";
import BunkerModeChallenge from "@/components/shield/BunkerModeChallenge";
import Lightning from "@/components/Lightning";
import { usePageLoading } from "@/hooks/usePageLoading";

export default function ShieldPage() {
    const [loading, setLoading] = useState(false);
    const [trafficData, setTrafficData] = useState<any>(null);
    const [anomalies, setAnomalies] = useState<any[]>([]);
    const [isDemoMode, setIsDemoMode] = useState(false);

    const { isPageReady } = usePageLoading({
        pageName: 'Shield',
        loadingMessage: 'Initializing Shield Protection...'
    });

    // Load real traffic data from API
    const loadTrafficData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/shield/traffic');

            // Check if response is OK and is JSON
            if (isDemoMode) return; // Don't overwrite demo data if active

            if (!response.ok) {
                console.error('API returned error:', response.status, response.statusText);
                return;
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('API did not return JSON:', contentType);
                return;
            }

            const data = await response.json();
            if (data.success) {
                setTrafficData(data.data);
                setAnomalies(data.data.anomalies || []);
            }
        } catch (error) {
            console.error('Failed to load traffic data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDemoMode = () => {
        if (!isDemoMode) {
            // Activate Demo Mode
            setIsDemoMode(true);
            setTrafficData({
                summary: {
                    totalRequests: "1,245,678",
                    bandwidth: "4.5 GB",
                }
            });
            setAnomalies([
                {
                    id: "demo-1",
                    type: "ddos_attack",
                    severity: "critical",
                    description: "Volumetric DDoS attack detected from 12,000+ IPs. Mitigation systems engaged.",
                    timestamp: new Date().toISOString(),
                    bunker_mode_activated: true,
                    recommendBunkerMode: true
                },
                {
                    id: "demo-2",
                    type: "sql_injection",
                    severity: "high",
                    description: "Multiple SQL injection attempts blocked on /api/login endpoints.",
                    timestamp: new Date().toISOString(),
                    bunker_mode_activated: false
                }
            ]);
        } else {
            // Deactivate Demo Mode
            setIsDemoMode(false);
            loadTrafficData();
        }
    };

    useEffect(() => {
        loadTrafficData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadTrafficData, 30000);
        return () => clearInterval(interval);
    }, []);

    const stats = {
        totalRequests: trafficData?.summary?.totalRequests || "0",
        activeThreats: anomalies.length,
        bunkerModeActive: anomalies.some(a => a.recommendBunkerMode),
        blockedRequests: "0",
    };

    if (!isPageReady) {
        return null;
    }

    return (
        <div className="min-h-screen bg-black relative">
            {/* Lightning Background - Fixed Full Page */}
            <Lightning
                hue={0}
                xOffset={0}
                speed={0.8}
                intensity={1.2}
                size={1}
            />

            {/* Content wrapper with higher z-index */}
            <div className="p-6 relative z-10">
                <div className="container mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-red-500/20 rounded-lg">
                                    <Shield className="w-8 h-8 text-red-500" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Vajra Shield</h1>
                                    <p className="text-gray-400">Intelligent Traffic Protection & Anomaly Detection</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href="/shield/analytics"
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                            >
                                View Analytics
                            </Link>
                            <Link
                                href="/shield/bunker"
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                Bunker Mode Settings
                            </Link>
                            <button
                                onClick={toggleDemoMode}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-semibold ${isDemoMode
                                    ? 'bg-amber-500 hover:bg-amber-600 text-black'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                    }`}
                            >
                                {isDemoMode ? (
                                    <>
                                        <RotateCcw className="w-4 h-4" />
                                        Reset Simulation
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 text-yellow-500" />
                                        Run Attack Simulation
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Active Alerts */}
                    {anomalies.length > 0 && (
                        <AlertBanner
                            severity="high"
                            title="Anomaly Detected"
                            message="Traffic spike detected. Bunker mode has been activated automatically."
                        />
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Requests (24h)"
                            value={stats.totalRequests}
                            icon={Activity}
                            trend={{ value: 12.5, isPositive: true }}
                            iconColor="text-red-500"
                        />
                        <StatCard
                            title="Active Threats"
                            value={stats.activeThreats}
                            icon={AlertTriangle}
                            iconColor="text-red-500"
                        />
                        <StatCard
                            title="Bots Blocked"
                            value={stats.blockedRequests}
                            icon={Ban}
                            trend={{ value: 15.3, isPositive: true }}
                            iconColor="text-orange-500"
                        />
                        <StatCard
                            title="Avg Bot Score"
                            value="67/99"
                            icon={Shield}
                            iconColor="text-green-500"
                        />
                    </div>

                    {/* Bot Detection Analytics */}
                    <Card className="cyber-card">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-red-500" />
                                Bot Detection Analytics
                            </CardTitle>
                            <p className="text-sm text-gray-400">
                                Cloudflare-style bot scoring (1-99) with CrowdSec threat intelligence
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">CrowdSec Blocks</span>
                                        <Ban className="w-4 h-4 text-red-400" />
                                    </div>
                                    <p className="text-3xl font-bold text-red-400">142</p>
                                    <p className="text-xs text-gray-500 mt-1">Community-sourced blocks</p>
                                </div>
                                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">Likely Bots</span>
                                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <p className="text-3xl font-bold text-orange-400">1,823</p>
                                    <p className="text-xs text-gray-500 mt-1">Score 1-40</p>
                                </div>
                                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">Verified Humans</span>
                                        <Users className="w-4 h-4 text-green-400" />
                                    </div>
                                    <p className="text-3xl font-bold text-green-400">13,411</p>
                                    <p className="text-xs text-gray-500 mt-1">Score 60-99</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-white font-semibold mb-3">Recent Detections</h4>
                                {[
                                    { ip: '192.168.1.1', score: 15, classification: 'likely-bot', action: 'block' },
                                    { ip: '10.0.0.5', score: 85, classification: 'verified-human', action: 'allow' },
                                    { ip: '172.16.0.3', score: 42, classification: 'likely-human', action: 'challenge' },
                                ].map((detection, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-gray-800">
                                        <div>
                                            <p className="font-mono text-sm text-gray-400">{detection.ip}</p>
                                            <p className="text-xs capitalize text-gray-500">{detection.classification.replace('-', ' ')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-white">{detection.score}/99</p>
                                            <p className={`text-xs ${detection.action === 'block' ? 'text-red-400' : detection.action === 'allow' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {detection.action.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Real-time Traffic Monitor */}
                    <TrafficMonitor />

                    {/* Bunker Mode Challenge System */}
                    <BunkerModeChallenge />

                    {/* Recent Anomalies */}
                    <Card className="cyber-card">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                Recent Anomalies
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {anomalies.map((anomaly: any) => (
                                    <div
                                        key={anomaly.id}
                                        className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-red-500/50 transition-colors"
                                    >
                                        <div className={`p-2 rounded-lg ${anomaly.severity === 'critical' ? 'bg-red-500/20' :
                                            anomaly.severity === 'high' ? 'bg-orange-500/20' :
                                                anomaly.severity === 'medium' ? 'bg-yellow-500/20' :
                                                    'bg-blue-500/20'
                                            }`}>
                                            <AlertTriangle className={`w-5 h-5 ${anomaly.severity === 'critical' ? 'text-red-500' :
                                                anomaly.severity === 'high' ? 'text-orange-500' :
                                                    anomaly.severity === 'medium' ? 'text-yellow-500' :
                                                        'text-blue-500'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-white font-semibold capitalize">{anomaly.type.replace('_', ' ')}</h4>
                                                <span className="text-xs text-gray-400" suppressHydrationWarning>
                                                    {new Date(anomaly.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm">{anomaly.description}</p>
                                            {anomaly.bunker_mode_activated && (
                                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-500 text-xs rounded-full">
                                                    <Shield className="w-3 h-3" />
                                                    Bunker Mode Activated
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="cyber-card hover:scale-[1.02] transition-transform cursor-pointer">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                                        <Activity className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h3 className="text-white font-semibold">Traffic Analytics</h3>
                                    <p className="text-gray-400 text-sm">View detailed traffic patterns and user behavior</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="cyber-card hover:scale-[1.02] transition-transform cursor-pointer">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                                        <Shield className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <h3 className="text-white font-semibold">Configure Bunker Mode</h3>
                                    <p className="text-gray-400 text-sm">Set up challenge types and activation thresholds</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="cyber-card hover:scale-[1.02] transition-transform cursor-pointer">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                        <TrendingUp className="w-6 h-6 text-green-500" />
                                    </div>
                                    <h3 className="text-white font-semibold">Whitelist Management</h3>
                                    <p className="text-gray-400 text-sm">Manage trusted IPs and bypass rules</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
