/**
 * Vajra Unified Dashboard - Security Index (VSI)
 * Executive overview of security posture
 */

'use client';

import { useEffect, useState } from 'react';
import { Shield, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import Link from 'next/link';

interface VSIData {
    overallScore: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    trend: 'improving' | 'stable' | 'declining';
    moduleScores: {
        shield: { score: number; status: string };
        scout: { score: number; status: string };
        sentry: { score: number; status: string };
        aegis: { score: number; status: string };
    };
    riskSummary: {
        criticalIssues: number;
        highIssues: number;
        activeThreats: number;
        pendingActions: number;
    };
}

export default function SecurityIndexPage() {
    const [vsiData, setVsiData] = useState<VSIData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVSI();
    }, []);

    const fetchVSI = async () => {
        try {
            const response = await fetch('/api/unified/vsi');
            const data = await response.json();
            setVsiData(data);
        } catch (error) {
            console.error('Failed to fetch VSI:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    const getGradeColor = (grade: string) => {
        const colors = {
            A: 'text-green-400 border-green-500/30 bg-green-500/10',
            B: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
            C: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
            D: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
            F: 'text-red-400 border-red-500/30 bg-red-500/10',
        };
        return colors[grade as keyof typeof colors] || colors.F;
    };

    const getStatusColor = (status: string) => {
        if (status === 'healthy') return 'text-green-400';
        if (status === 'warning') return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-8 h-8 text-red-500" />
                        <h1 className="text-4xl font-bold">Vajra Security Index</h1>
                    </div>
                    <p className="text-gray-400">Unified security posture across all modules</p>
                </div>

                {/* Main Score Card */}
                <div className="bg-gradient-to-br from-red-500/10 to-black border border-red-500/30 rounded-2xl p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-gray-400 mb-2">Overall Security Score</p>
                            <div className="flex items-baseline gap-4">
                                <span className="text-7xl font-black text-white">
                                    {vsiData?.overallScore || 0}
                                </span>
                                <span className="text-3xl text-gray-400">/100</span>
                                <div className={`px-4 py-2 rounded-lg border ${getGradeColor(vsiData?.grade || 'F')}`}>
                                    <span className="text-2xl font-bold">Grade {vsiData?.grade}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {vsiData?.trend === 'improving' && <TrendingUp className="w-8 h-8 text-green-400" />}
                            {vsiData?.trend === 'declining' && <TrendingDown className="w-8 h-8 text-red-400" />}
                            {vsiData?.trend === 'stable' && <Activity className="w-8 h-8 text-blue-400" />}
                            <span className="text-gray-400 capitalize">{vsiData?.trend}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-1000"
                            style={{ width: `${vsiData?.overallScore || 0}%` }}
                        />
                    </div>
                </div>

                {/* Risk Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Critical Issues</span>
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <p className="text-3xl font-bold text-red-400">{vsiData?.riskSummary.criticalIssues || 0}</p>
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">High Priority</span>
                            <AlertTriangle className="w-5 h-5 text-orange-400" />
                        </div>
                        <p className="text-3xl font-bold text-orange-400">{vsiData?.riskSummary.highIssues || 0}</p>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Active Threats</span>
                            <Activity className="w-5 h-5 text-yellow-400" />
                        </div>
                        <p className="text-3xl font-bold text-yellow-400">{vsiData?.riskSummary.activeThreats || 0}</p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Pending Actions</span>
                            <CheckCircle2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-3xl font-bold text-blue-400">{vsiData?.riskSummary.pendingActions || 0}</p>
                    </div>
                </div>

                {/* Module Scores */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Shield */}
                    <Link href="/shield" className="group">
                        <div className="bg-gradient-to-br from-red-500/10 to-black border border-red-500/30 rounded-xl p-6 hover:border-red-500/50 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <Shield className="w-8 h-8 text-red-400" />
                                <span className={`text-sm font-semibold ${getStatusColor(vsiData?.moduleScores.shield.status || 'healthy')}`}>
                                    {vsiData?.moduleScores.shield.status}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">SHIELD</h3>
                            <p className="text-gray-400 text-sm mb-4">External Protection</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black">{vsiData?.moduleScores.shield.score || 0}</span>
                                <span className="text-gray-400">/100</span>
                            </div>
                        </div>
                    </Link>

                    {/* Scout */}
                    <Link href="/scout" className="group">
                        <div className="bg-gradient-to-br from-orange-500/10 to-black border border-orange-500/30 rounded-xl p-6 hover:border-orange-500/50 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <Activity className="w-8 h-8 text-orange-400" />
                                <span className={`text-sm font-semibold ${getStatusColor(vsiData?.moduleScores.scout.status || 'healthy')}`}>
                                    {vsiData?.moduleScores.scout.status}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">SCOUT</h3>
                            <p className="text-gray-400 text-sm mb-4">Vendor Management</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black">{vsiData?.moduleScores.scout.score || 0}</span>
                                <span className="text-gray-400">/100</span>
                            </div>
                        </div>
                    </Link>

                    {/* Sentry */}
                    <Link href="/sentry" className="group">
                        <div className="bg-gradient-to-br from-rose-500/10 to-black border border-rose-500/30 rounded-xl p-6 hover:border-rose-500/50 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <AlertTriangle className="w-8 h-8 text-rose-400" />
                                <span className={`text-sm font-semibold ${getStatusColor(vsiData?.moduleScores.sentry.status || 'healthy')}`}>
                                    {vsiData?.moduleScores.sentry.status}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">SENTRY</h3>
                            <p className="text-gray-400 text-sm mb-4">Employee Security</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black">{vsiData?.moduleScores.sentry.score || 0}</span>
                                <span className="text-gray-400">/100</span>
                            </div>
                        </div>
                    </Link>

                    {/* Aegis */}
                    <Link href="/agenios" className="group">
                        <div className="bg-gradient-to-br from-pink-500/10 to-black border border-pink-500/30 rounded-xl p-6 hover:border-pink-500/50 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <CheckCircle2 className="w-8 h-8 text-pink-400" />
                                <span className={`text-sm font-semibold ${getStatusColor(vsiData?.moduleScores.aegis.status || 'healthy')}`}>
                                    {vsiData?.moduleScores.aegis.status}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">AEGIS</h3>
                            <p className="text-gray-400 text-sm mb-4">Code Security</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black">{vsiData?.moduleScores.aegis.score || 0}</span>
                                <span className="text-gray-400">/100</span>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
