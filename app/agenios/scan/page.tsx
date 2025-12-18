"use client";

import { useState } from "react";
import { Code, Shield, AlertTriangle, Loader2, Target, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScanResult {
    id: string;
    targetURL: string;
    scanType: string;
    status: string;
    summary: {
        totalVulnerabilities: number;
        criticalCount: number;
        highCount: number;
        mediumCount: number;
        lowCount: number;
        securityScore: number;
    };
    vulnerabilities: Array<{
        type: string;
        severity: string;
        title: string;
        description: string;
    }>;
}

export default function AgeniosPage() {
    const [targetURL, setTargetURL] = useState("");
    const [scanType, setScanType] = useState<'quick' | 'standard' | 'comprehensive'>('standard');
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

    const handleStartScan = async () => {
        if (!targetURL) {
            alert('Please enter a target URL');
            return;
        }

        setScanning(true);
        setResult(null);

        try {
            const response = await fetch('/api/agenios/scans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetURL, scanType }),
            });

            const data = await response.json();

            if (data.success) {
                setResult(data.data.scan);
                setScanHistory(prev => [data.data.scan, ...prev.slice(0, 4)]);
            }
        } catch (error) {
            console.error('Failed to start scan:', error);
            alert('Failed to start scan. Please try again.');
        } finally {
            setScanning(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-cyber-darker to-slate-900 p-6">
            <div className="container mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-orange-500/20 rounded-lg">
                        <Code className="w-8 h-8 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Vajra Agenios</h1>
                        <p className="text-gray-400">Automated Penetration Testing & Vulnerability Scanning</p>
                    </div>
                </div>

                {/* Scan Configuration */}
                <Card className="cyber-card border-orange-500/30">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-orange-400" />
                            Start Security Scan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Target URL
                            </label>
                            <input
                                type="text"
                                value={targetURL}
                                onChange={(e) => setTargetURL(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleStartScan()}
                                placeholder="https://example.com"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Scan Type
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['quick', 'standard', 'comprehensive'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setScanType(type)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${scanType === type
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleStartScan}
                            disabled={scanning}
                            className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {scanning ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Scanning... ({scanType})
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    Start {scanType.charAt(0).toUpperCase() + scanType.slice(1)} Scan
                                </>
                            )}
                        </button>

                        <div className="text-xs text-gray-400">
                            💡 Try: <button onClick={() => setTargetURL('https://vulnerable-test-site.com')} className="text-orange-400 hover:underline">vulnerable-test-site.com</button>
                        </div>
                    </CardContent>
                </Card>

                {/* Scan Results */}
                {result && (
                    <Card className="cyber-card border-orange-500/50">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-orange-400" />
                                    Scan Results
                                </span>
                                <Badge className={`${result.summary.securityScore >= 80 ? 'bg-green-500' : result.summary.securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                    Score: {result.summary.securityScore}/100
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-lg">
                                <div className="text-sm text-gray-400 mb-1">Target</div>
                                <div className="text-white font-mono text-sm">{result.targetURL}</div>
                            </div>

                            {/* Vulnerability Summary */}
                            <div className="grid grid-cols-4 gap-3">
                                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-red-400">{result.summary.criticalCount}</div>
                                    <div className="text-xs text-gray-400 mt-1">Critical</div>
                                </div>
                                <div className="p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-orange-400">{result.summary.highCount}</div>
                                    <div className="text-xs text-gray-400 mt-1">High</div>
                                </div>
                                <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-yellow-400">{result.summary.mediumCount}</div>
                                    <div className="text-xs text-gray-400 mt-1">Medium</div>
                                </div>
                                <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-blue-400">{result.summary.lowCount}</div>
                                    <div className="text-xs text-gray-400 mt-1">Low</div>
                                </div>
                            </div>

                            {/* Vulnerabilities List */}
                            {result.vulnerabilities.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-white font-semibold flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                                        Vulnerabilities Found ({result.summary.totalVulnerabilities})
                                    </h3>
                                    {result.vulnerabilities.slice(0, 5).map((vuln, i) => (
                                        <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="text-white font-semibold">{vuln.title}</h4>
                                                <Badge className={getSeverityColor(vuln.severity)}>
                                                    {vuln.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-2">{vuln.description}</p>
                                            <div className="text-xs text-gray-500">Type: {vuln.type}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {result.summary.totalVulnerabilities === 0 && (
                                <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                    <h3 className="text-white font-semibold mb-1">No Vulnerabilities Found</h3>
                                    <p className="text-sm text-gray-400">Target appears to be secure</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Scan History */}
                {scanHistory.length > 0 && (
                    <Card className="cyber-card">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                Recent Scans
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {scanHistory.map((scan, i) => (
                                    <div key={i} className="p-3 bg-white/5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors">
                                        <div className="flex-1">
                                            <div className="text-sm text-white font-mono">{scan.targetURL}</div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {scan.summary.totalVulnerabilities} vulnerabilities found
                                            </div>
                                        </div>
                                        <Badge className={scan.summary.securityScore >= 80 ? 'bg-green-500' : scan.summary.securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}>
                                            {scan.summary.securityScore}/100
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
