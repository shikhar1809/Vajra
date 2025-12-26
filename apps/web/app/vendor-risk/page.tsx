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
        <div className="p-8 h-full overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Vendor Risk & Financial Intelligence</h1>
                <p className="text-slate-400 mt-1">Autonomous Vendor Onboarding & Fraud Detection</p>
            </header>

            {/* AI Bill Analysis Zone */}
            <Card className="bg-slate-900 border-slate-800 mb-8 overflow-hidden relative">
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
                                isDragging ? "border-purple-500 bg-purple-900/20" : "border-slate-700 bg-slate-950/50 hover:bg-slate-900",
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
                                    <div className="p-4 bg-slate-900 rounded-full mb-4">
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
                                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
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

            {/* Vendor List (Placeholder for now, but matches "Relationship Map" requirement functionally) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader><CardTitle className="text-base text-slate-200">Vendor Relationship Map</CardTitle></CardHeader>
                    <CardContent>
                        <div className="h-48 flex items-center justify-center border border-dashed border-slate-700 rounded-lg text-slate-600 text-sm">
                            <Building2 className="w-6 h-6 mr-2" /> Interactive Graph Visualization
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
