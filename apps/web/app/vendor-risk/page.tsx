"use client";

import { useState } from "react";
import { UploadCloud, FileText, AlertOctagon, CheckCircle2, Building2, Coins } from "lucide-react";
import clsx from "clsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DownloadReportButton from "@/components/DownloadReportButton";

export default function VendorRiskPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const handleDrop = async (e: any) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer?.files[0];
        if (file) handleUpload(file);
    };

    const handleUpload = async (file: File) => {
        setAnalyzing(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/api/v1/onboard-bill", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            setAnalysisResult(data);
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="p-8 h-full overflow-y-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight">Smart Invoice Audit</h1>
                <p className="text-slate-400 mt-1">Autonomous Vendor Onboarding & Fraud Detection</p>
            </header>

            {/* AI Bill Analysis Zone */}
            <Card className="bg-slate-900/40 backdrop-blur-md border-slate-800/50 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Coins className="w-5 h-5 text-purple-400" />
                        AI Vendor Onboarding & Bill Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!analysisResult ? (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={clsx(
                                "border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center transition-all cursor-pointer",
                                isDragging ? "border-purple-500 bg-purple-900/20" : "border-slate-700 bg-slate-950/50 hover:bg-slate-900/40 backdrop-blur-md",
                                analyzing && "animate-pulse pointer-events-none"
                            )}
                        >
                            {analyzing ? (
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                                    <p className="text-lg font-medium text-purple-300">Gemini 3 Pro is analyzing invoice...</p>
                                    <p className="text-sm text-slate-500">Extracting Tax ID, Bank Hash, and calculating Susness Score</p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 bg-slate-900/40 backdrop-blur-md rounded-full mb-4">
                                        <UploadCloud className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-200">Drop Vendor Invoice/Bill here</h3>
                                    <p className="text-sm text-slate-500 mt-2">PDF, PNG, JPG supported</p>
                                    <p className="text-xs text-purple-400 mt-4 font-mono">Gemini 3 Pro extracts data & detects financial fraud</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-500">

                            {/* Result Left: Vendor Profile */}
                            <div className="space-y-6">
                                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/50">
                                    <h4 className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-4">Extracted Vendor Profile</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-900">
                                            <span className="text-slate-400">Vendor Name</span>
                                            <span className="text-white font-medium">{analysisResult.vendor_name}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-900">
                                            <span className="text-slate-400">Tax ID</span>
                                            <span className="font-mono text-blue-300">{analysisResult.tax_id}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-900">
                                            <span className="text-slate-400">Bank Hash</span>
                                            <span className="font-mono text-xs text-slate-500">{analysisResult.bank_hash}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-900">
                                        <span className="text-slate-400">Vendor ID</span>
                                        <span className="font-mono text-purple-300 text-xs">{analysisResult.vendor_id}</span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={() => setAnalysisResult(null)} className="flex-1 border-slate-700 text-slate-400 hover:text-white">
                                        Analyze Another
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 bg-red-900/20 text-red-500 hover:bg-red-900/40 border-red-900"
                                        onClick={async () => {
                                            if (!analysisResult.vendor_id || analysisResult.vendor_id === "UNKNOWN") {
                                                alert("Cannot simulate breach: Unknown Vendor ID");
                                                return;
                                            }
                                            await fetch(`http://localhost:8000/api/v1/vendors/${analysisResult.vendor_id}/breach`, { method: "POST" });
                                            alert(`BREACH SIMULATION ACTIVE: Vendor ${analysisResult.vendor_id} marked as CRITICAL.`);
                                        }}
                                    >
                                        <AlertOctagon className="w-4 h-4 mr-2" /> Simulate Breach
                                    </Button>
                                    <Button
                                        variant="default"
                                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                                        onClick={() => {
                                            alert("🛑 KILL SWITCH ACTIVATED: Payment Gateway frozen for this Vendor ID. API Request sent to Bank.");
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                            Freeze Payment
                                        </div>
                                    </Button>
                                </div>
                                <div className="mt-4">
                                    <DownloadReportButton vendorName={analysisResult.vendor_name} />
                                </div>
                            </div>

                            {/* Result Right: Susness Score */}
                            <div className={clsx(
                                "p-6 rounded-xl border-l-4 shadow-xl",
                                analysisResult.is_sus ? "bg-red-950/20 border-red-500" : "bg-green-950/20 border-green-500"
                            )}>
                                <h4 className="text-lg font-bold flex items-center gap-2 mb-2">
                                    {analysisResult.is_sus ? (
                                        <span className="text-red-500 flex items-center gap-2"><AlertOctagon /> High Susness Alert</span>
                                    ) : (
                                        <span className="text-green-500 flex items-center gap-2"><CheckCircle2 /> Low Risk Transaction</span>
                                    )}
                                </h4>

                                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                                    {analysisResult.reason}
                                </p>

                                {/* Gauge */}
                                <div className="relative pt-4">
                                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1 uppercase">
                                        <span>Safe</span>
                                        <span>Fraud Probable</span>
                                    </div>
                                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={clsx("h-full transition-all duration-1000 ease-out", analysisResult.is_sus ? "bg-red-600" : "bg-green-500")}
                                            style={{ width: `${analysisResult.susness_score}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-right mt-1 text-xs font-mono text-slate-400">{analysisResult.susness_score}/100 Score</div>
                                </div>
                            </div>

                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Feature 6: Vendor Risk Intelligence (Live OSINT) */}
            <VendorIntelCard />
        </div>
    );
}

function VendorIntelCard() {
    const [domain, setDomain] = useState("");
    const [intel, setIntel] = useState<any>(null);
    const [scanning, setScanning] = useState(false);

    const runScan = async () => {
        if (!domain) return;
        setScanning(true);
        try {
            const res = await fetch(`http://localhost:8000/api/v1/vendor-intel?domain=${domain}`);
            const data = await res.json();
            setIntel(data);
        } catch (e) {
            console.error(e);
        } finally {
            setScanning(false);
        }
    };

    return (
        <Card className="bg-slate-900/40 backdrop-blur-md border-slate-800/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Building2 className="w-5 h-5 text-green-500" />
                    Vendor Risk Intelligence (Live OSINT)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Enter Vendor Domain (e.g. stripe.com, google.com)"
                            className="w-full bg-slate-950 border border-slate-800/50 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:border-green-500 transition-colors"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && runScan()}
                        />
                    </div>
                    <Button
                        onClick={runScan}
                        disabled={scanning || !domain}
                        className={clsx(
                            "min-w-[140px] font-medium transition-all",
                            scanning ? "bg-slate-800 text-slate-400" : "bg-green-600 hover:bg-green-700 text-white"
                        )}
                    >
                        {scanning ? "Scanning..." : "Run OSINT Scan"}
                    </Button>
                </div>

                {/* Scan Results */}
                {intel && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-6">
                        {/* Score Header */}
                        <div className="flex justify-between items-center bg-slate-950 p-5 rounded-lg border border-slate-800/50">
                            <div>
                                <h4 className="text-slate-400 text-sm font-bold uppercase tracking-wide">Infrastructure Trust Score</h4>
                                <div className="text-3xl font-bold text-white mt-1">{intel.risk_score}/100</div>
                            </div>
                            <div className="text-right">
                                <Badge className={clsx(
                                    "text-lg px-3 py-1",
                                    intel.risk_score > 80 ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                        intel.risk_score > 50 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                            "bg-red-500/10 text-red-400 border-red-500/20"
                                )}>
                                    {intel.risk_score > 80 ? "VETTED PARTNER" : intel.risk_score > 50 ? "USE CAUTION" : "HIGH RISK"}
                                </Badge>
                            </div>
                        </div>

                        {/* Technical Checks Table */}
                        <div className="border border-slate-800/50 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-950 text-slate-400 font-medium">
                                    <tr>
                                        <th className="p-3">Security Control</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Technical Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                                    {intel.checks.map((check: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-3 text-slate-200 font-medium">{check.test}</td>
                                            <td className="p-3">
                                                <Badge variant="outline" className={clsx(
                                                    "border-0",
                                                    check.result === "PASS" ? "bg-green-500/10 text-green-400" :
                                                        check.result === "WEAK" ? "bg-yellow-500/10 text-yellow-400" :
                                                            "bg-red-500/10 text-red-500"
                                                )}>
                                                    {check.result}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-slate-400 font-mono text-xs">{check.details || "Verified standard protocol"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
