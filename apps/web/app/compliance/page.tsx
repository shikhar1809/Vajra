"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, FileText, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";  // Need to ensure this component exists or use standard
import clsx from "clsx";

interface ReadinessSummary {
    framework: string;
    readiness_score: number;
    total_controls: number;
    passing_controls: number;
}

interface ComplianceControl {
    control_id: string;
    framework: string;
    description: string;
    status: string;
    automated_evidence_source?: string;
}

export default function CompliancePage() {
    const [readiness, setReadiness] = useState<ReadinessSummary[]>([]);
    const [gaps, setGaps] = useState<ComplianceControl[]>([]);
    const [aiReport, setAiReport] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const fetchData = async () => {
        try {
            const readyRes = await fetch("http://localhost:8000/api/v1/compliance/readiness");
            const gapsRes = await fetch("http://localhost:8000/api/v1/compliance/gap-analysis");
            if (readyRes.ok) setReadiness(await readyRes.json());
            if (gapsRes.ok) setGaps(await gapsRes.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchData(); }, []);

    const runAutomatedCheck = async () => {
        setIsChecking(true);
        try {
            const res = await fetch("http://localhost:8000/api/v1/compliance/run-automated-check", { method: "POST" });
            const data = await res.json();
            alert(`Automated Evidence Verified:\n${data.updates.join("\n")}`);
            fetchData(); // Refresh data
        } catch (e) { alert("Check failed"); }
        finally { setIsChecking(false); }
    };

    const generateAiReport = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch("http://localhost:8000/api/v1/compliance/generate-report", { method: "POST" });
            const data = await res.json();
            setAiReport(data.report_text);
        } catch (e) { alert("AI Generation failed"); }
        finally { setIsGenerating(false); }
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Audit Readiness Center</h1>
                    <p className="text-slate-400 text-sm mt-1">Automated evidence collection for SOC 2, GDPR, and ISO 27001.</p>
                </div>
                <Button
                    onClick={runAutomatedCheck}
                    disabled={isChecking}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                    {isChecking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Run Automated Verification
                </Button>
            </header>

            {/* Framework Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {readiness.map((fw) => (
                    <Card key={fw.framework} className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex justify-between items-center text-slate-200">
                                {fw.framework} Readiness
                                <span className={clsx(
                                    "text-2xl font-bold",
                                    fw.readiness_score > 90 ? "text-green-500" : fw.readiness_score > 70 ? "text-yellow-500" : "text-red-500"
                                )}>{fw.readiness_score}%</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                                <div
                                    className={clsx("h-full transition-all duration-1000", fw.readiness_score > 90 ? "bg-green-600" : "bg-yellow-600")}
                                    style={{ width: `${fw.readiness_score}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-slate-500">{fw.total_controls - fw.passing_controls} controls failing out of {fw.total_controls}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* AI Report */}
            <Card className="bg-slate-900 border-slate-800 mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-slate-200 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-500" /> AI Auditor Summary
                        </CardTitle>
                        <CardDescription className="text-slate-500">Generate an executive board summary using Gemini 3 Pro</CardDescription>
                    </div>
                    <Button onClick={generateAiReport} disabled={isGenerating} variant="outline" className="border-purple-900/50 text-purple-400 hover:bg-purple-900/20">
                        {isGenerating ? "Synthesizing..." : "Generate Board Summary"}
                    </Button>
                </CardHeader>
                <CardContent>
                    <textarea
                        className="w-full h-64 bg-slate-950 border-slate-800 rounded-lg p-4 text-slate-300 font-mono text-sm resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
                        readOnly
                        value={aiReport || "Click 'Generate Board Summary' to analyze compliance gaps..."}
                    />
                </CardContent>
            </Card>

            {/* Gap Analysis */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-slate-200 text-red-400 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Immediate Compliance Gaps (Action Required)</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800 hover:bg-slate-900">
                                <TableHead className="text-slate-400">Framework</TableHead>
                                <TableHead className="text-slate-400">Control ID</TableHead>
                                <TableHead className="text-slate-400">Description</TableHead>
                                <TableHead className="text-slate-400">Status</TableHead>
                                <TableHead className="text-slate-400">Automated Source</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gaps.map((gap) => (
                                <TableRow key={gap.control_id} className="border-slate-800 hover:bg-slate-800/50">
                                    <TableCell className="text-slate-300 font-medium">{gap.framework}</TableCell>
                                    <TableCell className="text-slate-400 font-mono text-xs">{gap.control_id}</TableCell>
                                    <TableCell className="text-slate-400">{gap.description}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={clsx(
                                            gap.status === "Failing" ? "border-red-900 bg-red-950 text-red-500" : "border-yellow-900 bg-yellow-950 text-yellow-500"
                                        )}>
                                            {gap.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-xs flex items-center gap-1">
                                        {gap.automated_evidence_source && <RefreshCw className="w-3 h-3 text-blue-500" />}
                                        {gap.automated_evidence_source || "Manual"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
