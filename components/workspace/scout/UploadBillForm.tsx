"use client";

import { useState } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisResult {
    vendorName: string;
    amount: string;
    date: string;
    isSuspicious: boolean;
    complianceScore: number;
    riskLevel: "Low" | "Medium" | "High" | "Critical";
    findings: string[];
    fraudIndicators: string[];
}

export default function UploadBillForm() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/scout/analyze-bill', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Analysis failed');
            }

            setResult(data.data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to analyze bill');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="cyber-card border-blue-500/30 w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <FileText className="w-6 h-6 text-blue-500" />
                    Bill & Invoice Authenticity Check
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Upload Section */}
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Upload Vendor Invoice (PDF)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-400
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-blue-500/10 file:text-blue-400
                                  hover:file:bg-blue-500/20
                                "
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center gap-2 mt-6"
                    >
                        {loading ? 'Analyzing...' : <>
                            <Upload className="w-4 h-4" /> Analyze
                        </>}
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Analysis Result */}
                {result && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                <span className="text-gray-400 text-sm">Vendor Name</span>
                                <div className="text-xl font-bold text-white">{result.vendorName}</div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                <span className="text-gray-400 text-sm">Compliance Score</span>
                                <div className={`text-xl font-bold ${result.complianceScore > 80 ? 'text-green-400' :
                                        result.complianceScore > 50 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {result.complianceScore}/100
                                </div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                <span className="text-gray-400 text-sm">Risk Level</span>
                                <div className={`text-xl font-bold uppercase ${result.riskLevel === 'Low' ? 'text-green-400' :
                                        result.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {result.riskLevel}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                <span className="text-gray-400 text-sm">Fraud Check</span>
                                <div className="flex items-center gap-2 mt-1">
                                    {result.isSuspicious ? (
                                        <span className="text-red-400 flex items-center gap-1 font-bold">
                                            <XCircle className="w-5 h-5" /> SUSPICIOUS
                                        </span>
                                    ) : (
                                        <span className="text-green-400 flex items-center gap-1 font-bold">
                                            <CheckCircle className="w-5 h-5" /> PASSED
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Findings */}
                        <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800">
                            <h4 className="font-semibold text-white mb-3">Detailed Findings</h4>
                            <ul className="space-y-2">
                                {result.findings.map((finding, i) => (
                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                        <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-blue-400" />
                                        {finding}
                                    </li>
                                ))}
                                {result.fraudIndicators.map((indicator, i) => (
                                    <li key={`fraud-${i}`} className="text-sm text-red-300 flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        {indicator}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
