"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Search, Eye, Code, Play, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function BackendTestPage() {
    const [results, setResults] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    const runTest = async (module: string, endpoint: string, method: string = 'GET', body?: any) => {
        setLoading(prev => ({ ...prev, [module]: true }));
        try {
            const response = await fetch(endpoint, {
                method,
                headers: method !== 'GET' ? { 'Content-Type': 'application/json' } : {},
                body: body ? JSON.stringify(body) : undefined,
            });
            const data = await response.json();
            setResults(prev => ({ ...prev, [module]: data }));
        } catch (error) {
            setResults(prev => ({ ...prev, [module]: { success: false, error: String(error) } }));
        } finally {
            setLoading(prev => ({ ...prev, [module]: false }));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-cyber-darker to-slate-900 p-6">
            <div className="container mx-auto max-w-7xl space-y-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">🧪 Vajra Backend Test Suite</h1>
                    <p className="text-gray-400">Test all enterprise cybersecurity modules with real algorithms</p>
                </div>

                {/* Shield Module Test */}
                <Card className="cyber-card">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Shield className="w-6 h-6 text-cyber-blue" />
                            Vajra Shield - Anomaly Detection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <button
                            onClick={() => runTest('shield', '/api/shield/traffic')}
                            disabled={loading.shield}
                            className="px-6 py-3 bg-cyber-blue hover:bg-cyber-blue/90 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <Play className="w-4 h-4" />
                            {loading.shield ? 'Running...' : 'Test Traffic Analysis & Anomaly Detection'}
                        </button>

                        {results.shield && (
                            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                                <div className="flex items-center gap-2 mb-3">
                                    {results.shield.success ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                    <span className="text-white font-semibold">
                                        {results.shield.success ? 'Test Passed' : 'Test Failed'}
                                    </span>
                                </div>
                                {results.shield.data && (
                                    <div className="space-y-2 text-sm">
                                        <div className="text-gray-300">
                                            <strong>Total Requests:</strong> {results.shield.data.summary.totalRequests}
                                        </div>
                                        <div className="text-gray-300">
                                            <strong>Peak Requests/min:</strong> {results.shield.data.summary.peakRequests}
                                        </div>
                                        <div className="text-gray-300">
                                            <strong>Anomalies Detected:</strong> {results.shield.data.summary.anomaliesDetected}
                                        </div>
                                        {results.shield.data.anomalies.length > 0 && (
                                            <div className="mt-3 p-3 bg-orange-500/20 border border-orange-500/30 rounded">
                                                <div className="flex items-center gap-2 text-orange-400 font-semibold mb-2">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    Anomalies Found
                                                </div>
                                                {results.shield.data.anomalies.map((anomaly: any, i: number) => (
                                                    <div key={i} className="text-gray-300 text-xs mt-1">
                                                        • {anomaly.description} (Confidence: {(anomaly.confidence * 100).toFixed(0)}%)
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <pre className="mt-3 text-xs text-gray-400 overflow-auto max-h-40">
                                    {JSON.stringify(results.shield, null, 2)}
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Scout Module Test */}
                <Card className="cyber-card">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Search className="w-6 h-6 text-green-500" />
                            Vajra Scout - Vendor Security Scanning
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <button
                            onClick={() => runTest('scout', '/api/scout/vendors', 'POST', {
                                domain: 'example-vendor.com',
                                vendorId: 'test-123'
                            })}
                            disabled={loading.scout}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <Play className="w-4 h-4" />
                            {loading.scout ? 'Scanning...' : 'Test Vendor Security Scan'}
                        </button>

                        {results.scout && (
                            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                                <div className="flex items-center gap-2 mb-3">
                                    {results.scout.success ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                    <span className="text-white font-semibold">
                                        {results.scout.success ? 'Scan Complete' : 'Scan Failed'}
                                    </span>
                                </div>
                                {results.scout.data && (
                                    <div className="space-y-2 text-sm">
                                        <div className="text-gray-300">
                                            <strong>Domain:</strong> {results.scout.data.scan.domain}
                                        </div>
                                        <div className="text-gray-300">
                                            <strong>Overall Score:</strong> {results.scout.data.scan.scores.overall}/100
                                        </div>
                                        <div className="text-gray-300">
                                            <strong>Risk Level:</strong> <span className="capitalize">{results.scout.data.risk.riskLevel}</span>
                                        </div>
                                        {results.scout.data.recommendations.length > 0 && (
                                            <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded">
                                                <div className="text-blue-400 font-semibold mb-2">Recommendations:</div>
                                                {results.scout.data.recommendations.slice(0, 3).map((rec: string, i: number) => (
                                                    <div key={i} className="text-gray-300 text-xs mt-1">• {rec}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <pre className="mt-3 text-xs text-gray-400 overflow-auto max-h-40">
                                    {JSON.stringify(results.scout, null, 2)}
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sentry Module Test */}
                <Card className="cyber-card">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Eye className="w-6 h-6 text-purple-500" />
                            Vajra Sentry - Phishing Detection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <button
                            onClick={() => runTest('sentry', '/api/sentry/phishing', 'POST', {
                                url: 'https://g00gle-verify-account.com/urgent-action-required',
                                content: 'URGENT: Your account has been suspended. Click here to verify immediately!'
                            })}
                            disabled={loading.sentry}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <Play className="w-4 h-4" />
                            {loading.sentry ? 'Analyzing...' : 'Test Phishing Detection (Malicious URL)'}
                        </button>

                        {results.sentry && (
                            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                                <div className="flex items-center gap-2 mb-3">
                                    {results.sentry.success ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                    <span className="text-white font-semibold">
                                        {results.sentry.success ? 'Analysis Complete' : 'Analysis Failed'}
                                    </span>
                                </div>
                                {results.sentry.data && (
                                    <div className="space-y-2 text-sm">
                                        <div className="text-gray-300">
                                            <strong>URL:</strong> {results.sentry.data.url}
                                        </div>
                                        <div className="text-gray-300">
                                            <strong>Threat Level:</strong> <span className="capitalize font-bold text-red-400">{results.sentry.data.threatLevel}</span>
                                        </div>
                                        <div className="text-gray-300">
                                            <strong>Safe:</strong> {results.sentry.data.isSafe ? 'Yes ✅' : 'No ❌'}
                                        </div>
                                        {results.sentry.data.threats.length > 0 && (
                                            <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded">
                                                <div className="text-red-400 font-semibold mb-2">Threats Detected:</div>
                                                {results.sentry.data.threats.map((threat: string, i: number) => (
                                                    <div key={i} className="text-gray-300 text-xs mt-1">• {threat}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <pre className="mt-3 text-xs text-gray-400 overflow-auto max-h-40">
                                    {JSON.stringify(results.sentry, null, 2)}
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Agenios Module Test */}
                <Card className="cyber-card">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Code className="w-6 h-6 text-orange-500" />
                            Vajra Agenios - Vulnerability Scanning
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <button
                            onClick={() => runTest('agenios', '/api/agenios/scans', 'POST', {
                                targetURL: 'https://vulnerable-test-site.com',
                                scanType: 'comprehensive'
                            })}
                            disabled={loading.agenios}
                            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <Play className="w-4 h-4" />
                            {loading.agenios ? 'Scanning...' : 'Test Vulnerability Scan'}
                        </button>

                        {results.agenios && (
                            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                                <div className="flex items-center gap-2 mb-3">
                                    {results.agenios.success ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                    <span className="text-white font-semibold">
                                        {results.agenios.success ? 'Scan Complete' : 'Scan Failed'}
                                    </span>
                                </div>
                                {results.agenios.data && (
                                    <div className="space-y-2 text-sm">
                                        <div className="text-gray-300">
                                            <strong>Target:</strong> {results.agenios.data.scan.targetURL}
                                        </div>
                                        <div className="text-gray-300">
                                            <strong>Security Score:</strong> {results.agenios.data.scan.summary.securityScore}/100
                                        </div>
                                        <div className="text-gray-300">
                                            <strong>Vulnerabilities:</strong> {results.agenios.data.scan.summary.totalVulnerabilities}
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 mt-3">
                                            <div className="p-2 bg-red-500/20 rounded text-center">
                                                <div className="text-red-400 font-bold">{results.agenios.data.scan.summary.criticalCount}</div>
                                                <div className="text-xs text-gray-400">Critical</div>
                                            </div>
                                            <div className="p-2 bg-orange-500/20 rounded text-center">
                                                <div className="text-orange-400 font-bold">{results.agenios.data.scan.summary.highCount}</div>
                                                <div className="text-xs text-gray-400">High</div>
                                            </div>
                                            <div className="p-2 bg-yellow-500/20 rounded text-center">
                                                <div className="text-yellow-400 font-bold">{results.agenios.data.scan.summary.mediumCount}</div>
                                                <div className="text-xs text-gray-400">Medium</div>
                                            </div>
                                            <div className="p-2 bg-blue-500/20 rounded text-center">
                                                <div className="text-blue-400 font-bold">{results.agenios.data.scan.summary.lowCount}</div>
                                                <div className="text-xs text-gray-400">Low</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <pre className="mt-3 text-xs text-gray-400 overflow-auto max-h-40">
                                    {JSON.stringify(results.agenios, null, 2)}
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="text-center mt-8 p-6 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-2">✅ All Backend Modules Ready</h3>
                    <p className="text-gray-400">
                        Click the test buttons above to see real algorithms in action!
                    </p>
                </div>
            </div>
        </div>
    );
}
