"use client";

import { useState } from "react";
import { Eye, Shield, AlertTriangle, CheckCircle, Link as LinkIcon, Loader2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PhishingResult {
    url: string;
    isSafe: boolean;
    threatLevel: 'safe' | 'suspicious' | 'dangerous' | 'malicious';
    confidence: number;
    threats: string[];
    recommendations: string[];
}

export default function SentryPage() {
    const [url, setUrl] = useState("");
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<PhishingResult | null>(null);
    const [history, setHistory] = useState<PhishingResult[]>([]);

    const handleCheckURL = async () => {
        if (!url) {
            alert('Please enter a URL to check');
            return;
        }

        setChecking(true);
        setResult(null);

        try {
            const response = await fetch('/api/sentry/phishing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (data.success) {
                setResult(data.data);
                setHistory(prev => [data.data, ...prev.slice(0, 9)]); // Keep last 10
            }
        } catch (error) {
            console.error('Failed to check URL:', error);
            alert('Failed to check URL. Please try again.');
        } finally {
            setChecking(false);
        }
    };

    const getThreatColor = (level: string) => {
        switch (level) {
            case 'safe': return 'text-green-500 bg-green-500/20 border-green-500/30';
            case 'suspicious': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
            case 'dangerous': return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
            case 'malicious': return 'text-red-500 bg-red-500/20 border-red-500/30';
            default: return 'text-gray-500 bg-gray-500/20 border-gray-500/30';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-cyber-darker to-slate-900 p-6">
            <div className="container mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-cyan-500/20 rounded-lg">
                        <Eye className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Vajra Sentry</h1>
                        <p className="text-gray-400">Employee Protection & Phishing Detection</p>
                    </div>
                </div>

                {/* URL Checker */}
                <Card className="cyber-card border-cyan-500/30">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <LinkIcon className="w-5 h-5 text-cyan-400" />
                            Check URL for Phishing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleCheckURL()}
                                placeholder="Enter URL to check (e.g., https://example.com)"
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                            />
                            <button
                                onClick={handleCheckURL}
                                disabled={checking}
                                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center gap-2"
                            >
                                {checking ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4" />
                                        Check URL
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="text-xs text-gray-400">
                            💡 Try these examples:
                            <div className="mt-2 flex flex-wrap gap-2">
                                <button
                                    onClick={() => setUrl('https://g00gle-verify-account.com/urgent')}
                                    className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-gray-300 transition-colors"
                                >
                                    Malicious URL
                                </button>
                                <button
                                    onClick={() => setUrl('https://google.com')}
                                    className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-gray-300 transition-colors"
                                >
                                    Safe URL
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                {result && (
                    <Card className={`cyber-card border-2 ${getThreatColor(result.threatLevel)}`}>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    {result.isSafe ? (
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <AlertTriangle className="w-6 h-6 text-red-500" />
                                    )}
                                    Analysis Results
                                </span>
                                <Badge className={getThreatColor(result.threatLevel)}>
                                    {result.threatLevel.toUpperCase()}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-lg">
                                <div className="text-sm text-gray-400 mb-1">URL Checked:</div>
                                <div className="text-white font-mono text-sm break-all">{result.url}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-lg">
                                    <div className="text-sm text-gray-400 mb-1">Safety Status</div>
                                    <div className={`text-lg font-bold ${result.isSafe ? 'text-green-500' : 'text-red-500'}`}>
                                        {result.isSafe ? '✅ SAFE' : '❌ UNSAFE'}
                                    </div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-lg">
                                    <div className="text-sm text-gray-400 mb-1">Confidence</div>
                                    <div className="text-lg font-bold text-white">
                                        {(result.confidence * 100).toFixed(0)}%
                                    </div>
                                </div>
                            </div>

                            {result.threats.length > 0 && (
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-400 font-semibold mb-3">
                                        <AlertTriangle className="w-4 h-4" />
                                        Threats Detected
                                    </div>
                                    <ul className="space-y-2">
                                        {result.threats.map((threat, i) => (
                                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                <span className="text-red-400 mt-1">•</span>
                                                <span>{threat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {result.recommendations.length > 0 && (
                                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-400 font-semibold mb-3">
                                        <Shield className="w-4 h-4" />
                                        Recommendations
                                    </div>
                                    <ul className="space-y-2">
                                        {result.recommendations.map((rec, i) => (
                                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                <span className="text-blue-400 mt-1">•</span>
                                                <span>{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* History */}
                {history.length > 0 && (
                    <Card className="cyber-card">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                Recent Checks
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {history.map((item, i) => (
                                    <div key={i} className="p-3 bg-white/5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-white font-mono truncate">{item.url}</div>
                                        </div>
                                        <Badge className={getThreatColor(item.threatLevel)}>
                                            {item.threatLevel}
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
