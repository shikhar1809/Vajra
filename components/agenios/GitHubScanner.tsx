"use client";

import { useState } from "react";
import { Github, Search, AlertTriangle, Shield, Code, FileCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Vulnerability {
    id: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    file: string;
    line: number;
    description: string;
    recommendation: string;
    cwe: string;
}

interface ScanResult {
    repository: { owner: string; repo: string };
    securityScore: number;
    vulnerabilities: Vulnerability[];
    summary: {
        total: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}

export default function GitHubScanner() {
    const [repoUrl, setRepoUrl] = useState("");
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);

    const scanRepository = async () => {
        if (!repoUrl) return;

        setLoading(true);
        try {
            const response = await fetch('/api/agenios/github', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl, token }),
            });

            const data = await response.json();
            if (data.success) {
                setResult(data.data);
            }
        } catch (error) {
            console.error('GitHub scan failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        }
    };

    return (
        <Card className="cyber-card border-purple-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Github className="w-6 h-6 text-purple-500" />
                    GitHub Repository Scanner
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Input */}
                <div className="space-y-3">
                    <input
                        type="text"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && scanRepository()}
                        placeholder="https://github.com/owner/repository"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />

                    <input
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="GitHub Personal Access Token (optional for private repos)"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />

                    <button
                        onClick={scanRepository}
                        disabled={loading || !repoUrl}
                        className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Search className="w-5 h-5" />
                        {loading ? 'Scanning Repository...' : 'Scan Repository'}
                    </button>
                </div>

                {/* Results */}
                {result && (
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-white font-semibold">
                                        {result.repository.owner}/{result.repository.repo}
                                    </p>
                                    <p className="text-gray-400 text-sm">Security Analysis Complete</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-3xl font-bold ${result.securityScore >= 80 ? 'text-green-400' :
                                            result.securityScore >= 60 ? 'text-yellow-400' :
                                                'text-red-400'
                                        }`}>
                                        {result.securityScore}
                                    </p>
                                    <p className="text-gray-400 text-sm">Security Score</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-center">
                                    <p className="text-2xl font-bold text-red-400">{result.summary.critical}</p>
                                    <p className="text-xs text-gray-400">Critical</p>
                                </div>
                                <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded text-center">
                                    <p className="text-2xl font-bold text-orange-400">{result.summary.high}</p>
                                    <p className="text-xs text-gray-400">High</p>
                                </div>
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-center">
                                    <p className="text-2xl font-bold text-yellow-400">{result.summary.medium}</p>
                                    <p className="text-xs text-gray-400">Medium</p>
                                </div>
                                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-center">
                                    <p className="text-2xl font-bold text-blue-400">{result.summary.low}</p>
                                    <p className="text-xs text-gray-400">Low</p>
                                </div>
                            </div>
                        </div>

                        {/* Vulnerabilities */}
                        {result.vulnerabilities.length > 0 ? (
                            <div className="space-y-3">
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    Vulnerabilities Found ({result.vulnerabilities.length})
                                </h4>
                                {result.vulnerabilities.map((vuln) => (
                                    <div
                                        key={vuln.id}
                                        className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge className={getSeverityColor(vuln.severity)}>
                                                        {vuln.severity.toUpperCase()}
                                                    </Badge>
                                                    <span className="text-white font-semibold">{vuln.type}</span>
                                                </div>
                                                <p className="text-gray-400 text-sm">{vuln.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <FileCode className="w-4 h-4" />
                                                {vuln.file}:{vuln.line}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Code className="w-4 h-4" />
                                                {vuln.cwe}
                                            </span>
                                        </div>

                                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                                            <p className="text-blue-400 text-sm">
                                                <strong>Recommendation:</strong> {vuln.recommendation}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                                <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <p className="text-green-400 font-semibold">No Vulnerabilities Found</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Repository passed security scan
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Info */}
                {!result && (
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <p className="text-purple-400 text-sm">
                            <strong>GitHub Scanner</strong> analyzes repository code for security vulnerabilities,
                            exposed secrets, and common coding mistakes. Supports both public and private repositories.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
