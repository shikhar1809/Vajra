/**
 * Shield Bot Detection Dashboard
 * Real-time bot analytics and threat monitoring
 */

'use client';

import { useEffect, useState } from 'react';
import { Shield, Activity, AlertTriangle, TrendingUp, Bot } from 'lucide-react';

interface BotStats {
    totalRequests: number;
    botsBlocked: number;
    averageBotScore: number;
    crowdsecBlocks: number;
    recentDetections: Array<{
        ip: string;
        score: number;
        classification: string;
        action: string;
        timestamp: Date;
    }>;
}

export default function BotDetectionPage() {
    const [stats, setStats] = useState<BotStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data for now
        setStats({
            totalRequests: 15234,
            botsBlocked: 1823,
            averageBotScore: 67,
            crowdsecBlocks: 142,
            recentDetections: [
                { ip: '192.168.1.1', score: 15, classification: 'likely-bot', action: 'block', timestamp: new Date() },
                { ip: '10.0.0.5', score: 85, classification: 'verified-human', action: 'allow', timestamp: new Date() },
            ],
        });
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Shield className="w-8 h-8 text-red-500" />
                    <h1 className="text-4xl font-bold">Bot Detection</h1>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-red-500/10 to-black border border-red-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Total Requests</span>
                            <Activity className="w-5 h-5 text-red-400" />
                        </div>
                        <p className="text-4xl font-bold">{stats?.totalRequests.toLocaleString()}</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-black border border-orange-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Bots Blocked</span>
                            <Bot className="w-5 h-5 text-orange-400" />
                        </div>
                        <p className="text-4xl font-bold text-orange-400">{stats?.botsBlocked.toLocaleString()}</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/10 to-black border border-blue-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Avg Bot Score</span>
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-4xl font-bold text-blue-400">{stats?.averageBotScore}/99</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-black border border-purple-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">CrowdSec Blocks</span>
                            <AlertTriangle className="w-5 h-5 text-purple-400" />
                        </div>
                        <p className="text-4xl font-bold text-purple-400">{stats?.crowdsecBlocks}</p>
                    </div>
                </div>

                {/* Recent Detections */}
                <div className="bg-gradient-to-br from-red-500/10 to-black border border-red-500/30 rounded-xl p-6">
                    <h2 className="text-2xl font-bold mb-4">Recent Detections</h2>
                    <div className="space-y-3">
                        {stats?.recentDetections.map((detection, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-gray-800">
                                <div>
                                    <p className="font-mono text-sm text-gray-400">{detection.ip}</p>
                                    <p className="text-sm capitalize">{detection.classification.replace('-', ' ')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">{detection.score}/99</p>
                                    <p className={`text-sm ${detection.action === 'block' ? 'text-red-400' : 'text-green-400'}`}>
                                        {detection.action.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
