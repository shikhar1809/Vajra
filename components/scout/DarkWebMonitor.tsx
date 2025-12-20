"use client";

import { useState } from "react";
import { Search, AlertTriangle, Shield, Database, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Breach {
    name: string;
    date: string;
    records: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    dataTypes: string[];
    description: string;
}

interface BreachResult {
    domain: string;
    breaches: Breach[];
    totalBreaches: number;
    totalRecords: number;
    riskScore: number;
}

export default function DarkWebMonitor() {
    const [domain, setDomain] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<BreachResult | null>(null);

    const checkDarkWeb = async () => {
        if (!domain) return;

        setLoading(true);
        try {
            const response = await fetch('/api/scout/dark-web', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain }),
            });

            const data = await response.json();
            if (data.success) {
                setResult(data.data);
            }
        } catch (error) {
            console.error('Dark web check failed:', error);
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
                    <Database className="w-6 h-6 text-purple-500" />
                    Dark Web Monitoring
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Search Input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && checkDarkWeb()}
                        placeholder="Enter vendor domain (e.g., example.com)"
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                        onClick={checkDarkWeb}
                        disabled={loading || !domain}
                        className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center gap-2"
                    >
                        <Search className="w-5 h-5" />
                        {loading ? 'Scanning...' : 'Scan'}
                    </button>
                </div>

                {/* Results */}
                {result && (
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                <p className="text-gray-400 text-sm mb-1">Total Breaches</p>
                                <p className="text-2xl font-bold text-white">{result.totalBreaches}</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                <p className="text-gray-400 text-sm mb-1">Records Exposed</p>
                                <p className="text-2xl font-bold text-white">
                                    {result.totalRecords.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                <p className="text-gray-400 text-sm mb-1">Risk Score</p>
                                <p className={`text-2xl font-bold ${result.riskScore > 70 ? 'text-red-400' :
                                        result.riskScore > 40 ? 'text-orange-400' :
                                            'text-green-400'
                                    }`}>
                                    {result.riskScore}/100
                                </p>
                            </div>
                        </div>

                        {/* Breach List */}
                        {result.breaches.length > 0 ? (
                            <div className="space-y-3">
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    Known Breaches
                                </h4>
                                {result.breaches.map((breach, index) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h5 className="text-white font-semibold">{breach.name}</h5>
                                                <p className="text-gray-400 text-sm">{breach.description}</p>
                                            </div>
                                            <Badge className={getSeverityColor(breach.severity)}>
                                                {breach.severity.toUpperCase()}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(breach.date).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Database className="w-4 h-4" />
                                                {breach.records.toLocaleString()} records
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {breach.dataTypes.map((type, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-xs text-purple-400"
                                                >
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                                <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <p className="text-green-400 font-semibold">No Breaches Found</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    This domain has no known data breaches
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Info */}
                {!result && (
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <p className="text-purple-400 text-sm">
                            <strong>Dark Web Monitoring</strong> checks if vendor data has been exposed in known breaches.
                            Enter a domain to scan for compromised credentials and leaked information.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
