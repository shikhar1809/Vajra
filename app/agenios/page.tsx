"use client";

import { Code, Upload, FileCode, AlertTriangle, Shield, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AgeniosPage() {
    const stats = {
        totalScans: 45,
        vulnerabilitiesFound: 127,
        criticalIssues: 8,
        avgSecurityScore: 78,
    };

    const recentScans = [
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
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-cyber-darker to-slate-900 p-6">
            <div className="container mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-orange-500/20 rounded-lg">
                                <Code className="w-8 h-8 text-orange-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Vajra Agenios</h1>
                                <p className="text-gray-400">Automated Security Testing & Code Analysis</p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/agenios/scan"
                        className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-semibold flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        New Scan
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Scans"
                        value={stats.totalScans}
                        icon={Code}
                        trend={{ value: 15, isPositive: true }}
                        iconColor="text-orange-400"
                    />
                    <StatCard
                        title="Vulnerabilities Found"
                        value={stats.vulnerabilitiesFound}
                        icon={AlertTriangle}
                        iconColor="text-red-500"
                    />
                    <StatCard
                        title="Critical Issues"
                        value={stats.criticalIssues}
                        icon={Shield}
                        trend={{ value: -20, isPositive: true }}
                        iconColor="text-red-600"
                    />
                    <StatCard
                        title="Avg Security Score"
                        value={stats.avgSecurityScore}
                        icon={TrendingUp}
                        trend={{ value: 8.5, isPositive: true }}
                        iconColor="text-green-500"
                    />
                </div>

                {/* Recent Scans */}
                <Card className="cyber-card">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <FileCode className="w-5 h-5 text-orange-400" />
                            Recent Security Scans
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentScans.map((scan) => (
                                <Link key={scan.id} href={`/agenios/reports/${scan.id}`}>
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-orange-500/50 transition-all cursor-pointer">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-white mb-1">{scan.project_name}</h3>
                                                <p className="text-sm text-gray-400">
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
                                            <Badge variant="outline" className="border-orange-500 text-orange-500">
                                                {scan.high} High
                                            </Badge>
                                            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                                                {scan.medium} Medium
                                            </Badge>
                                            <Badge variant="outline" className="border-blue-500 text-blue-500">
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

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="cyber-card hover:scale-[1.02] transition-transform cursor-pointer">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <Code className="w-6 h-6 text-orange-400" />
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
                                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <FileCode className="w-6 h-6 text-cyan-500" />
                                </div>
                                <h3 className="text-white font-semibold">Compliance Scanning</h3>
                                <p className="text-gray-400 text-sm">Check against OWASP Top 10 and industry standards</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
