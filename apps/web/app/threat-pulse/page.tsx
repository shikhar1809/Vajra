"use client";

import { useState, useEffect } from "react";
import { Shield, AlertTriangle, CheckCircle, Activity, Server, Zap, Terminal, XCircle } from "lucide-react";
import clsx from "clsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function ThreatPulsePage() {
    const [feed, setFeed] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [scanningId, setScanningId] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<any | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/v1/news/feed");
                const data = await res.json();
                setFeed(data.feed);
            } catch (err) {
                console.error("Failed to fetch threat feed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    const handleScan = async (threatId: string) => {
        setScanningId(threatId);
        try {
            // Feature 6 Integration: Call the REAL Semgrep Scanner
            const res = await fetch(`http://localhost:8000/api/v1/run-scan`, { method: "POST" });
            const result = await res.json();

            setScanResult(result);
            setOpen(true);
        } catch (err) {
            alert("Active Scan failed. Is the backend running?");
            console.error(err);
        } finally {
            setScanningId(null);
        }
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Activity className="text-red-500" />
                        Threat-Pulse
                    </h1>
                    <p className="text-slate-400 mt-1">Active Intelligence Engine • Real-Time Global Threat Monitoring</p>
                </div>
                <div className="text-right">
                    <Badge variant="outline" className="text-green-400 border-green-900 bg-green-950/30">
                        <Zap className="w-3 h-3 mr-1" /> Live Feed Active
                    </Badge>
                </div>
            </header>

            {/* Tech Stack Indicator */}
            <div className="mb-8 p-4 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center gap-4">
                <Server className="text-blue-400 w-5 h-5" />
                <span className="text-slate-300 text-sm font-medium">Monitored Assets:</span>
                <div className="flex gap-2">
                    {["Google Workspace", "WordPress", "Stripe", "Slack"].map(stack => (
                        <Badge key={stack} className="bg-slate-800 text-slate-300 hover:bg-slate-700">{stack}</Badge>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500 animate-pulse">
                    Initializing Neural Link to Global Threat Feeds...
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {feed.map((threat) => (
                        <Card key={threat.id} className={clsx(
                            "bg-slate-950 border transition-all hover:shadow-lg",
                            threat.severity === "CRITICAL" ? "border-red-500/50 shadow-red-900/10" : "border-slate-800"
                        )}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {threat.severity === "CRITICAL" && <Badge variant="destructive" className="animate-pulse">CRITICAL</Badge>}
                                            {threat.severity === "High" && <Badge className="bg-orange-600 hover:bg-orange-700">HIGH</Badge>}
                                            {threat.severity === "Medium" && <Badge className="bg-yellow-600 hover:bg-yellow-700">MEDIUM</Badge>}
                                            <span className="text-xs text-slate-500 font-mono uppercase">{threat.source} • {threat.date}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{threat.headline}</h3>
                                        <div className="flex items-center gap-2 mt-2 text-sm text-blue-300">
                                            <Shield className="w-4 h-4" />
                                            <span>Target: {threat.target_software}</span>
                                        </div>
                                    </div>

                                    {threat.matched_tech_stack && (
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge variant="outline" className="border-red-500 text-red-500 bg-red-950/20 px-3 py-1">
                                                <AlertTriangle className="w-3 h-3 mr-2" />
                                                MATCHES YOUR STACK
                                            </Badge>
                                            <Button
                                                size="sm"
                                                onClick={() => handleScan(threat.id)}
                                                disabled={scanningId === threat.id}
                                                className={clsx(
                                                    "font-bold transition-all",
                                                    scanningId === threat.id ? "bg-slate-700" : "bg-red-600 hover:bg-red-700 shadow-md shadow-red-900/20"
                                                )}
                                            >
                                                {scanningId === threat.id ? "Scanning..." : "Scan My Assets"}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-4 rounded-lg border border-slate-900">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">SMB Impact Analysis</h4>
                                        <p className="text-sm text-slate-300 leading-relaxed">{threat.smb_impact}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Recommended Actions</h4>
                                        <ul className="space-y-1">
                                            {threat.actions.map((action: string, idx: number) => (
                                                <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                    {action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl text-white">
                            <Terminal className="text-green-500" /> Active Asset Scan Results
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Semgrep Security Engine Report
                        </DialogDescription>
                    </DialogHeader>

                    {scanResult && (
                        <div className="space-y-4 mt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                                    <div className="text-xs text-slate-500 uppercase mb-1">Status</div>
                                    <div className="text-lg font-bold text-green-400">{scanResult.status}</div>
                                </div>
                                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                                    <div className="text-xs text-slate-500 uppercase mb-1">Vulnerabilities Found</div>
                                    <div className={clsx("text-lg font-bold", scanResult.vulnerabilities_found > 0 ? "text-red-500" : "text-green-500")}>
                                        {scanResult.vulnerabilities_found} Issues
                                    </div>
                                </div>
                            </div>

                            {scanResult.remediation_plan && (
                                <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                                    <h4 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                                        <Zap className="w-4 h-4" /> AI Remediation Plan
                                    </h4>
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <div className="whitespace-pre-wrap text-slate-300 font-mono text-xs leading-relaxed">
                                            {scanResult.remediation_plan}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {scanResult.vulnerabilities_found === 0 && (
                                <div className="flex items-center justify-center p-8 text-green-500 flex-col gap-2">
                                    <CheckCircle className="w-12 h-12" />
                                    <span className="font-bold">System Clean</span>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
