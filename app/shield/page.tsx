"use client";

import { useState, useEffect } from "react";
import { Shield, Activity, AlertTriangle, Users, TrendingUp, RefreshCw, Loader2 } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { AlertBanner } from "@/components/common/AlertBanner";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrafficMonitor } from "@/components/shield/TrafficMonitor";

export default function ShieldPage() {
    const [loading, setLoading] = useState(false);
    const [trafficData, setTrafficData] = useState<any>(null);
    const [anomalies, setAnomalies] = useState<any[]>([]);

    // Load real traffic data from API
    const loadTrafficData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/shield/traffic');
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-cyber-darker to-slate-900 p-6">
            <div className="container mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-cyber-blue/20 rounded-lg">
                                <Shield className="w-8 h-8 text-cyber-blue" />
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
                            className="px-4 py-2 bg-cyber-blue hover:bg-cyber-blue/90 text-white rounded-lg transition-colors"
                        >
                            Bunker Mode Settings
                        </Link>
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
                        iconColor="text-cyber-blue"
                    />
                    <StatCard
                        title="Active Threats"
                        value={stats.activeThreats}
                        icon={AlertTriangle}
                        iconColor="text-red-500"
                    />
                    <StatCard
                        title="Unique Visitors"
                        value="45.2K"
                        icon={Users}
                        trend={{ value: 8.3, isPositive: true }}
                        iconColor="text-green-500"
                    />
                    <StatCard
                        title="Blocked Requests"
                        value={stats.blockedRequests}
                        icon={Shield}
                        trend={{ value: -5.2, isPositive: true }}
                        iconColor="text-orange-500"
                    />
                </div>

                {/* Real-time Traffic Monitor */}
                <TrafficMonitor />

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
                                    className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-cyber-blue/50 transition-colors"
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
                                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-cyber-blue/20 text-cyber-blue text-xs rounded-full">
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
                                <div className="w-12 h-12 bg-cyber-blue/20 rounded-full flex items-center justify-center mx-auto">
                                    <Activity className="w-6 h-6 text-cyber-blue" />
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
    );
}
