"use client";

import { Code, Upload, FileCode, AlertTriangle, Shield, TrendingUp, Play, Loader2 } from "lucide-react";
import { useState } from "react";
import { StatCard } from "@/components/common/StatCard";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GitHubScanner from "@/components/agenios/GitHubScanner";
import Aurora from "@/components/Aurora";
import { usePageLoading } from "@/hooks/usePageLoading";

export default function AgeniosPage() {
    const { isPageReady } = usePageLoading({
        pageName: 'Agenios',
        loadingMessage: 'Preparing Security Scans...'
    });

    if (!isPageReady) {
        return null;
    }
    const [stats, setStats] = useState({
        totalScans: 45,
        vulnerabilitiesFound: 127,
        criticalIssues: 8,
        avgSecurityScore: 78,
    });

    const [recentScans, setRecentScans] = useState([
        {
            id: "1",
            project_name: "E-commerce Platform",
            scan_date: "2025-12-17",
            status: "completed",
            security_score: 82,
            vulnerabilities_found: 12,
            critical: 1,
            high: 3,
            medium: 5,
            low: 3,
        },
        {
            id: "2",
            project_name: "Customer Portal",
            scan_date: "2025-12-16",
            status: "completed",
            security_score: 75,
            vulnerabilities_found: 18,
            critical: 2,
            high: 5,
            medium: 7,
            low: 4,
        },
    ]);

    const [simulating, setSimulating] = useState(false);

    const handleSimulaton = () => {
        setSimulating(true);
        setTimeout(() => {
            const newScan = {
                id: `demo-${Date.now()}`,
                project_name: "Legacy Backend Service (Demo)",
                scan_date: new Date().toISOString().split('T')[0],
                status: "completed",
                security_score: 45,
                vulnerabilities_found: 28,
                critical: 5,
                high: 12,
                medium: 8,
                low: 3,
            };

            setRecentScans(prev => [newScan, ...prev]);
            setStats(prev => ({
                totalScans: prev.totalScans + 1,
                vulnerabilitiesFound: prev.vulnerabilitiesFound + 28,
                criticalIssues: prev.criticalIssues + 5,
                avgSecurityScore: Math.round((prev.avgSecurityScore * prev.totalScans + 45) / (prev.totalScans + 1))
            }));
            setSimulating(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-black relative">
            {/* Aurora Background - Fixed Full Page */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
                <Aurora
                    colorStops={["#450a0a", "#7f1d1d", "#dc2626"]} // Dark Red to Bright Red
                    blend={0.6}
                    amplitude={0.8}
                    speed={0.4}
                />
            </div>

            {/* Content wrapper with higher z-index */}
            <div className="p-6 relative z-10">
                <div className="container mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-red-500/20 rounded-lg">
                                    <Code className="w-8 h-8 text-red-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Vajra Agenios</h1>
                                    <p className="text-gray-400">Automated Security Testing & Code Analysis</p>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/agenios/scan"
                            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            New Scan
                        </Link>
                        <button
                            onClick={handleSimulaton}
                            disabled={simulating}
                            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                        >
                            {simulating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4 text-green-400" />
                            )}
                            Simulate Audit
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Scans"
                            value={stats.totalScans}
                            icon={Code}
                            trend={{ value: 15, isPositive: true }}
                            iconColor="text-red-400"
                        />
                        <StatCard
                            title="Vulnerabilities Found"
                            value={stats.vulnerabilitiesFound}
                            icon={AlertTriangle}
                            iconColor="text-orange-500"
                        />
                        <StatCard
                            title="Critical Issues"
                            value={stats.criticalIssues}
                            icon={Shield}
                            iconColor="text-red-600"
                        />
                        <StatCard
                            title="Avg Security Score"
                            value={stats.avgSecurityScore}
                            icon={TrendingUp}
                            trend={{ value: 3.2, isPositive: true }}
                            iconColor="text-green-500"
                        />
                    </div>

                    {/* Code Scanning Breakdown */}
                    <Card className="cyber-card">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileCode className="w-5 h-5 text-red-500" />
                                Security Scanning Capabilities
                            </CardTitle>
                            <p className="text-sm text-gray-400">
                                Wiz/Snyk-style code security with SAST, SCA, and secret detection
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">SAST Patterns</span>
                                        <Code className="w-4 h-4 text-red-400" />
                                    </div>
                                    <p className="text-3xl font-bold text-red-400">8</p>
                                    <p className="text-xs text-gray-500 mt-1">SQLi, XSS, CSRF, etc.</p>
                                </div>
                                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">Secret Detection</span>
                                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <p className="text-3xl font-bold text-orange-400">10</p>
                                    <p className="text-xs text-gray-500 mt-1">API keys, tokens, passwords</p>
                                </div>
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">SCA (Dependencies)</span>
                                        <Shield className="w-4 h-4 text-yellow-400" />
                                    </div>
                                    <p className="text-3xl font-bold text-yellow-400">npm</p>
                                    <p className="text-xs text-gray-500 mt-1">Audit-style scanning</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-white font-semibold mb-3">Vulnerability Types Detected</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { name: 'SQL Injection', count: 12, severity: 'critical' },
                                        { name: 'XSS', count: 8, severity: 'high' },
                                        { name: 'Secrets', count: 5, severity: 'critical' },
                                        { name: 'Weak Crypto', count: 15, severity: 'medium' },
                                        { name: 'Path Traversal', count: 3, severity: 'high' },
                                        { name: 'CSRF', count: 7, severity: 'medium' },
                                        { name: 'Insecure Deps', count: 23, severity: 'high' },
                                        { name: 'Code Injection', count: 4, severity: 'critical' },
                                    ].map((vuln, i) => (
                                        <div key={i} className="p-3 bg-black/50 rounded-lg border border-gray-800">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-gray-400">{vuln.name}</span>
                                                <Badge className={
                                                    vuln.severity === 'critical' ? 'bg-red-500' :
                                                        vuln.severity === 'high' ? 'bg-orange-500' :
                                                            'bg-yellow-500'
                                                }>
                                                    {vuln.count}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500 capitalize">{vuln.severity}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Scans */}
                    <Card className="cyber-card">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileCode className="w-5 h-5 text-red-400" />
                                Recent Security Scans
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentScans.map((scan) => (
                                    <Link key={scan.id} href={`/agenios/reports/${scan.id}`}>
                                        <div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-red-500/50 transition-all cursor-pointer">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-white mb-1">{scan.project_name}</h3>
                                                    <p className="text-sm text-gray-400" suppressHydrationWarning>
                                                        Scanned on {new Date(scan.scan_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-white mb-1">{scan.security_score}</div>
                                                    <p className="text-xs text-gray-400">Security Score</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 flex-wrap mb-3">
                                                <Badge variant="outline" className="border-red-500 text-red-500">
                                                    {scan.critical} Critical
                                                </Badge>
                                                <Badge variant="outline" className="border-red-500 text-red-500">
                                                    {scan.high} High
                                                </Badge>
                                                <Badge variant="outline" className="border-red-400 text-red-400">
                                                    {scan.medium} Medium
                                                </Badge>
                                                <Badge variant="outline" className="border-red-300 text-red-300">
                                                    {scan.low} Low
                                                </Badge>
                                                <span className="text-xs text-gray-400 ml-auto">
                                                    {scan.vulnerabilities_found} total vulnerabilities
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${scan.security_score >= 80 ? "bg-green-500" :
                                                        scan.security_score >= 60 ? "bg-yellow-500" :
                                                            "bg-red-500"
                                                        }`}
                                                    style={{ width: `${scan.security_score}%` }}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* GitHub Repository Scanner */}
                    <GitHubScanner />

                    {/* Feature Cards */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="cyber-card hover:scale-[1.02] transition-transform cursor-pointer">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                                        <Code className="w-6 h-6 text-red-400" />
                                    </div>
                                    <h3 className="text-white font-semibold">Static Analysis</h3>
                                    <p className="text-gray-400 text-sm">Analyze code for security vulnerabilities and bad practices</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="cyber-card hover:scale-[1.02] transition-transform cursor-pointer">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                                        <Shield className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h3 className="text-white font-semibold">Penetration Testing</h3>
                                    <p className="text-gray-400 text-sm">Simulate real-world attacks on your application</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="cyber-card hover:scale-[1.02] transition-transform cursor-pointer">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                                        <FileCode className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h3 className="text-white font-semibold">Compliance Scanning</h3>
                                    <p className="text-gray-400 text-sm">Check against OWASP Top 10 and industry standards</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
