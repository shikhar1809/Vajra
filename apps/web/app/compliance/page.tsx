"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, FileText, Loader2, Sparkles, RefreshCw, Shield, DollarSign, Globe, Lock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EvidenceLog from "@/components/evidence-log";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface TrustCenterStatus {
    trust_score: number;
    badges: string[];
    last_scan: string;
    uptime_90d: number;
    threats_blocked_24h: number;
}

interface InsuranceAudit {
    policy_type: string;
    current_premium_est: number;
    potential_savings: number;
    compliance_score: number;
    qualification_status: string;
}

interface AiGap {
    regulation: string;
    gap: string;
    impact: string;
    fix_action: string;
}

export default function CompliancePage() {
    // Existing State
    const [readiness, setReadiness] = useState<ReadinessSummary[]>([]);
    const [gaps, setGaps] = useState<ComplianceControl[]>([]);
    const [aiReport, setAiReport] = useState("");

    // New Features State
    const [trustData, setTrustData] = useState<TrustCenterStatus | null>(null);
    const [insuranceData, setInsuranceData] = useState<InsuranceAudit | null>(null);

    // AI Gap Analysis State
    const [profile, setProfile] = useState({ industry: "", company_size: "", region: "" });
    const [aiGaps, setAiGaps] = useState<AiGap[]>([]);
    const [auditScore, setAuditScore] = useState<number | null>(null);
    const [auditNarrative, setAuditNarrative] = useState<string>("");

    const [isGenerating, setIsGenerating] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isGapAnalyzing, setIsGapAnalyzing] = useState(false);

    const fetchData = async () => {
        try {
            const readyRes = await fetch("http://localhost:8000/api/v1/compliance/readiness");
            const trustRes = await fetch("http://localhost:8000/api/v1/trust-center/status");
            const insRes = await fetch("http://localhost:8000/api/v1/compliance/insurance-audit");

            if (readyRes.ok) setReadiness(await readyRes.json());
            else {
                // Fallback Mock Readiness
                setReadiness([
                    { framework: "SOC 2 Type II", readiness_score: 87, total_controls: 42, passing_controls: 38 },
                    { framework: "GDPR", readiness_score: 72, total_controls: 30, passing_controls: 22 }
                ]);
            }

            if (trustRes.ok) setTrustData(await trustRes.json());
            else {
                // Fallback Mock Trust Data
                setTrustData({
                    trust_score: 94,
                    badges: ["SOC2", "ISO27001"],
                    last_scan: new Date().toLocaleDateString(),
                    uptime_90d: 99.99,
                    threats_blocked_24h: 1248
                });
            }

            if (insRes.ok) setInsuranceData(await insRes.json());
            else {
                // Fallback Mock Insurance Data
                setInsuranceData({
                    policy_type: "Cyber Liability",
                    current_premium_est: 12500,
                    potential_savings: 3200,
                    compliance_score: 87,
                    qualification_status: "Qualified"
                });
            }

        } catch (e) {
            console.error("Backend offline, using fallback mock data:", e);
            // Complete Fallback for all states
            setReadiness([
                { framework: "SOC 2 Type II", readiness_score: 87, total_controls: 42, passing_controls: 38 },
                { framework: "GDPR", readiness_score: 72, total_controls: 30, passing_controls: 22 }
            ]);
            setTrustData({
                trust_score: 94,
                badges: ["SOC2", "ISO27001"],
                last_scan: new Date().toLocaleDateString(),
                uptime_90d: 99.99,
                threats_blocked_24h: 1248
            });
            setInsuranceData({
                policy_type: "Cyber Liability",
                current_premium_est: 12500,
                potential_savings: 3200,
                compliance_score: 87,
                qualification_status: "Qualified"
            });
        }
    };

    useEffect(() => { fetchData(); }, []);

    const runAutomatedCheck = async () => {
        setIsChecking(true);
        try {
            const res = await fetch("http://localhost:8000/api/v1/compliance/run-automated-check", { method: "POST" });
            const data = await res.json();
            alert(`Automated Evidence Verified:\n${data.updates.join("\n")}`);
            fetchData();
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

    const runAiGapAnalysis = async () => {
        if (!profile.industry || !profile.company_size) return alert("Please select a profile first.");
        setIsGapAnalyzing(true);
        try {
            const res = await fetch("http://localhost:8000/api/v1/compliance/ai-gap-analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile)
            });
            const data = await res.json();
            setAiGaps(data.gaps || []);
            setAuditScore(data.health_score);
            setAuditNarrative(data.narrative);
        } catch (e) { console.error(e); }
        finally { setIsGapAnalyzing(false); }
    };

    return (
        <div className="p-8 h-full overflow-y-auto space-y-8 pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Insurance Readiness & Compliance</h1>
                    <p className="text-slate-400 text-sm mt-1">Automated evidence collection & liability protection.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => window.open(`http://localhost:8000/health`, '_blank')}>
                        <Globe className="w-4 h-4 mr-2" />
                        View Public Trust Center
                    </Button>
                    <Button
                        onClick={runAutomatedCheck}
                        disabled={isChecking}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                        {isChecking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Run Verification
                    </Button>
                </div>
            </header>

            {/* Top Row: Trust Center & Insurance Shield */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Trust Center */}
                <Card className="bg-slate-900/40 backdrop-blur-md border-slate-800/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-green-500/20 transition-all"></div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Lock className="w-5 h-5 text-green-500" /> Live Trust Center
                        </CardTitle>
                        <CardDescription>Your public-facing security profile.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-sm text-slate-400">Trust Score</div>
                                <div className="text-3xl font-bold text-white flex items-center gap-3">
                                    {trustData?.trust_score ?? 0}
                                    {trustData?.badges.map(b => (
                                        <Badge key={b} className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/50">
                                            {b}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <div className="text-sm text-slate-400">Uptime (90d)</div>
                                <div className="text-xl font-mono text-green-400">{trustData?.uptime_90d}%</div>
                            </div>
                        </div>
                        <div className="bg-slate-950 rounded-lg p-3 flex justify-between items-center text-sm border border-slate-800/50">
                            <span className="text-slate-400">Last Verified Scan: <span className="text-slate-200">{trustData?.last_scan ?? "Pending..."}</span></span>
                            <span className="flex items-center text-green-400 gap-1"><Shield className="w-3 h-3" /> {trustData?.threats_blocked_24h ?? 0} Threats Blocked</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Liability Shield */}
                <Card className="bg-slate-900/40 backdrop-blur-md border-slate-800/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all"></div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <DollarSign className="w-5 h-5 text-blue-500" /> Financial Liability Shield
                        </CardTitle>
                        <CardDescription>Estimated insurance premium savings based on security score.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-sm text-slate-400">Potential Annual Savings</div>
                                <div className="text-3xl font-bold text-white text-green-400">
                                    ${insuranceData?.potential_savings ?? 0}
                                </div>
                            </div>
                            <Badge variant="outline" className={clsx(
                                "h-8 px-3",
                                insuranceData?.qualification_status === "Qualified" ? "border-green-500 text-green-400 bg-green-950" : "border-slate-600 text-slate-400"
                            )}>
                                {insuranceData?.qualification_status ?? "Analyzing..."}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-slate-950 p-3 rounded border border-slate-800/50">
                                <div className="text-slate-500">Current Est. Premium</div>
                                <div className="text-slate-300 font-mono">${insuranceData?.current_premium_est}</div>
                            </div>
                            <Button variant="ghost" className="h-full border border-dashed border-slate-700 hover:bg-slate-800 text-slate-300">
                                <FileText className="w-4 h-4 mr-2" /> Generate Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* AI Gap Analysis "The Virtual CISO" */}
            <Card className="bg-slate-900/40 backdrop-blur-md border-slate-800/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <Sparkles className="w-5 h-5 text-purple-500" /> Virtual CISO (Gemini 3 Pro)
                    </CardTitle>
                    <CardDescription>Context-aware compliance roadmap tailored to your industry.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Setup Form */}
                    <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-950 p-4 rounded-lg border border-slate-800/50">
                        <div className="grid grid-cols-3 gap-4 flex-1 w-full">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Industry</label>
                                <Select onValueChange={(v) => setProfile({ ...profile, industry: v })}>
                                    <SelectTrigger className="bg-slate-900/40 backdrop-blur-md border-slate-700 text-slate-200">
                                        <SelectValue placeholder="Select Industry" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900/40 backdrop-blur-md border-slate-700 text-slate-200">
                                        <SelectItem value="healthcare">Healthcare / Medical</SelectItem>
                                        <SelectItem value="fintech">Fintech / Banking</SelectItem>
                                        <SelectItem value="ecommerce">E-Commerce</SelectItem>
                                        <SelectItem value="legal">Legal Services</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Company Size</label>
                                <Select onValueChange={(v) => setProfile({ ...profile, company_size: v })}>
                                    <SelectTrigger className="bg-slate-900/40 backdrop-blur-md border-slate-700 text-slate-200">
                                        <SelectValue placeholder="Employees" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900/40 backdrop-blur-md border-slate-700 text-slate-200">
                                        <SelectItem value="1-10">1-10 (Micro)</SelectItem>
                                        <SelectItem value="11-50">11-50 (Small)</SelectItem>
                                        <SelectItem value="51-200">51-200 (Medium)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Region</label>
                                <Select onValueChange={(v) => setProfile({ ...profile, region: v })}>
                                    <SelectTrigger className="bg-slate-900/40 backdrop-blur-md border-slate-700 text-slate-200">
                                        <SelectValue placeholder="Location" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900/40 backdrop-blur-md border-slate-700 text-slate-200">
                                        <SelectItem value="us">United States</SelectItem>
                                        <SelectItem value="eu">Europe (GDPR)</SelectItem>
                                        <SelectItem value="asia">Asia Pacific</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button
                            onClick={runAiGapAnalysis}
                            disabled={isGapAnalyzing}
                            className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px]"
                        >
                            {isGapAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Identify Gaps"}
                        </Button>
                    </div>

                    {/* Results / CISO Narrative */}
                    {auditScore !== null && (
                        <div className="bg-purple-950/20 border border-purple-900/50 p-6 rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm">{auditScore}%</span>
                                    Security Health Score
                                </h3>
                                <Badge variant="outline" className="border-purple-500 text-purple-400">AI Generated</Badge>
                            </div>
                            <div className="text-slate-300 italic">
                                "{auditNarrative}"
                            </div>
                        </div>
                    )}

                    {/* Results Table */}

                    <div className="border border-slate-800/50 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-950 text-slate-200 font-medium">
                                <tr>
                                    <th className="p-3">Regulation</th>
                                    <th className="p-3">Gap Detected</th>
                                    <th className="p-3">Impact</th>
                                    <th className="p-3">Recommended Fix</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {aiGaps.map((gap, i) => (
                                    <tr key={i}>
                                        <td className="p-3"><Badge variant="outline" className="border-slate-700">{gap.regulation}</Badge></td>
                                        <td className="p-3 text-slate-200">{gap.gap}</td>
                                        <td className="p-3"><span className="text-red-400 font-bold">{gap.impact}</span></td>
                                        <td className="p-3 text-blue-400">{gap.fix_action}</td>
                                    </tr>
                                ))}
                                {aiGaps.length === 0 && !isGapAnalyzing && (
                                    <tr><td colSpan={4} className="p-4 text-center text-slate-600">No specific gaps analyzed yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Evidence Log (The Technical Proof) */}
            <EvidenceLog />

            {/* Framework Status (Existing) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {readiness.map((fw) => (
                    <Card key={fw.framework} className="bg-slate-900/40 backdrop-blur-md border-slate-800/50">
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

            {/* AI Report (Existing) */}
            <Card className="bg-slate-900/40 backdrop-blur-md border-slate-800/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-slate-200 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-slate-500" /> Executive Report
                        </CardTitle>
                        <CardDescription className="text-slate-500">Generate a full SOC 2 / GDPR evidence PDF.</CardDescription>
                    </div>
                    <Button onClick={generateAiReport} disabled={isGenerating} variant="outline" className="border-slate-700 text-slate-400 hover:bg-slate-800">
                        {isGenerating ? "Synthesizing..." : "Generate Full Report"}
                    </Button>
                </CardHeader>
                <CardContent>
                    <textarea
                        className="w-full h-48 bg-slate-950 border-slate-800/50 rounded-lg p-4 text-slate-300 font-mono text-sm resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
                        readOnly
                        value={aiReport || "Report preview will appear here..."}
                    />
                </CardContent>
            </Card>
        </div >
    );
}
