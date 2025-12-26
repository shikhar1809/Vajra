"use client";

import { useEffect, useState } from "react";
import {
    Users, Shield, AlertTriangle, Activity, Mail, Lock, Globe, MapPin,
    CheckCircle, XCircle, ArrowRight, Loader2, RefreshCw, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import clsx from "clsx";

interface Employee {
    id: string;
    name: string;
    department: string;
    risk_score: number;
    training_status: string;
    last_phishing_test_result: string;
}

interface PhishSimulation {
    status: string;
    target: string;
    email_preview: {
        subject: string;
        sender: string;
        body_preview: string;
    }
}

interface CredentialLeak {
    email: string;
    source: string;
    data: string;
}

interface TravelAlert {
    employee_id: string;
    name: string;
    details: string;
    action_taken: string;
}

export default function EmployeeSecurityPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [phishSim, setPhishSim] = useState<PhishSimulation | null>(null);
    const [leaks, setLeaks] = useState<CredentialLeak[]>([]);
    const [travelAlerts, setTravelAlerts] = useState<TravelAlert[]>([]);

    const [isSimulating, setIsSimulating] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // Coaching Modal
    const [coachingOpen, setCoachingOpen] = useState(false);
    const [coachingContent, setCoachingContent] = useState<any>(null);

    const fetchData = async () => {
        const empRes = await fetch("http://localhost:8000/api/v1/employees/list");
        if (empRes.ok) setEmployees(await empRes.json());

        const pulseRes = await fetch("http://localhost:8000/api/v1/employees/identity-pulse");
        if (pulseRes.ok) setTravelAlerts(await pulseRes.json());
    };

    useEffect(() => { fetchData(); }, []);

    const runPhishSim = async (industry: string) => {
        setIsSimulating(true);
        try {
            const res = await fetch("http://localhost:8000/api/v1/employees/phish-tank/simulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ industry, target_email: "all-staff@company.com", difficulty: "Hard" })
            });
            setPhishSim(await res.json());
        } catch (e) { alert("Sim failed"); }
        finally { setIsSimulating(false); }
    };

    const simulateClick = async (empId: string) => {
        const res = await fetch(`http://localhost:8000/api/v1/employees/phish-tank/click?employee_id=${empId}`, { method: "POST" });
        const data = await res.json();
        setCoachingContent(data);
        setCoachingOpen(true);
        fetchData(); // Update stats
    };

    const scanDarkWeb = async () => {
        setIsScanning(true);
        try {
            const res = await fetch("http://localhost:8000/api/v1/employees/credential-sentinel");
            const data = await res.json();
            setLeaks(data.details);
        } catch (e) { alert("Scan failed"); }
        finally { setIsScanning(false); }
    };

    const [passwordCheck, setPasswordCheck] = useState("");
    const [passwordResult, setPasswordResult] = useState<{ status: string, count: number } | null>(null);

    const checkPassword = async () => {
        if (!passwordCheck) return;
        const res = await fetch("http://localhost:8000/api/v1/employees/sentinel/check-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: passwordCheck })
        });
        setPasswordResult(await res.json());
    };

    return (
        <div className="p-8 h-full overflow-y-auto space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Shield className="w-8 h-8 text-blue-500" /> VAJRA Guardian
                </h1>
                <p className="text-slate-400 text-sm mt-1">Human-Layer Defense: Phishing, Identity, and Insider Risk.</p>
            </header>

            {/* Feature 1: The Phish-Tank */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <Mail className="w-5 h-5 text-orange-500" /> The Phish-Tank (AI Simulator)
                    </CardTitle>
                    <CardDescription>Train your employees with AI-generated attacks tailored to your industry.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                            <label className="text-xs text-slate-400 mb-2 block">Select Simulation Scenario</label>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => runPhishSim("fintech")} disabled={isSimulating} className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">
                                    Fintech / Wire Fraud
                                </Button>
                                <Button variant="outline" onClick={() => runPhishSim("healthcare")} disabled={isSimulating} className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">
                                    Healthcare / HIPAA
                                </Button>
                            </div>
                        </div>
                        {phishSim && (
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-l-4 border-l-orange-500 border-slate-800">
                                <h4 className="text-sm font-bold text-slate-200 mb-1 flex justify-between">
                                    Simulation Active
                                    <Badge variant="secondary" className="bg-orange-950 text-orange-400 border-orange-900">Live</Badge>
                                </h4>
                                <div className="text-xs text-slate-400 font-mono mb-2">Subject: {phishSim.email_preview.subject}</div>
                                <div className="text-slate-300 text-sm italic">"{phishSim.email_preview.body_preview}"</div>
                                <div className="mt-4 flex justify-end">
                                    <Button size="sm" variant="destructive" onClick={() => simulateClick("e1")}>
                                        <Zap className="w-3 h-3 mr-2" /> Simulate "Employee Click"
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Stats placeholder or illustration */}
                    <div className="flex items-center justify-center bg-slate-950/50 rounded-lg border border-dashed border-slate-800 p-8 text-center">
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-slate-200">85%</div>
                            <div className="text-xs text-slate-500">Resilience Score</div>
                            <p className="text-xs text-slate-400 max-w-[200px] mx-auto">Your team is better than average at spotting fake invoices.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Feature 2: Credential Sentinel (+ Live Check) */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Lock className="w-5 h-5 text-red-500" /> Credential Sentinel
                        </CardTitle>
                        <CardDescription>Dark Web monitoring & Live Password Check.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* 1. Automated Scan */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Organizational Scan</h4>
                            <Button onClick={scanDarkWeb} disabled={isScanning} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
                                {isScanning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
                                Scan Employee Emails
                            </Button>
                            {leaks.length > 0 && (
                                <div className="space-y-2 mt-2">
                                    {leaks.map((leak, i) => (
                                        <div key={i} className="bg-red-950/20 border border-red-900/30 p-3 rounded flex items-start gap-3">
                                            <AlertTriangle className="w-4 h-4 text-red-500 mt-1 shrink-0" />
                                            <div>
                                                <div className="text-sm font-medium text-red-400">{leak.email}</div>
                                                <div className="text-xs text-red-300/70">Source: {leak.source}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 2. Live Password Check */}
                        <div className="space-y-2 pt-4 border-t border-slate-800">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Password Verification</h4>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    placeholder="Check a password..."
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 text-sm text-slate-200"
                                    value={passwordCheck}
                                    onChange={(e) => setPasswordCheck(e.target.value)}
                                />
                                <Button onClick={checkPassword} className="bg-blue-600 hover:bg-blue-700 text-white">Check</Button>
                            </div>
                            {passwordResult && (
                                <div className={clsx("p-3 rounded border text-sm",
                                    passwordResult.status === "LEAKED" ? "bg-red-950/20 border-red-900/30 text-red-300" : "bg-green-950/20 border-green-900/30 text-green-300"
                                )}>
                                    <div className="font-bold flex items-center gap-2">
                                        {passwordResult.status === "LEAKED" ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        {passwordResult.status}
                                    </div>
                                    {passwordResult.status === "LEAKED" && (
                                        <div className="mt-1">
                                            Found in <span className="font-mono font-bold text-red-400">{passwordResult.count.toLocaleString()}</span> real-world breaches.
                                        </div>
                                    )}
                                    {passwordResult.status === "CLEAN" && (
                                        <div className="mt-1">
                                            No leaks found in known database.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </CardContent>
                </Card>

                {/* Feature 3: Identity Pulse */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Activity className="w-5 h-5 text-blue-500" /> Identity Pulse
                        </CardTitle>
                        <CardDescription>Behavioral biometrics & impossible travel.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {travelAlerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                                <CheckCircle className="w-8 h-8 text-green-500/50 mb-2" />
                                <div className="text-sm">No anomalous login locations detected.</div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {travelAlerts.map((alert, i) => (
                                    <div key={i} className="bg-blue-950/20 border border-blue-900/30 p-3 rounded flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                                        <div>
                                            <div className="text-sm font-medium text-blue-400">{alert.name} ({alert.employee_id})</div>
                                            <div className="text-xs text-blue-300/70">{alert.details}</div>
                                            <Badge variant="outline" className="mt-1 border-blue-800 text-blue-500 text-[10px]">{alert.action_taken}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Coaching Modal */}
            <Dialog open={coachingOpen} onOpenChange={setCoachingOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-slate-200">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-orange-400">
                            <Shield className="w-5 h-5" /> {coachingContent?.coach_name} Says...
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Immediate feedback on your recent action.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="text-lg font-medium text-white">
                            "{coachingContent?.message}"
                        </div>
                        <div className="bg-slate-950 p-4 rounded border border-slate-800">
                            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Expert Tip</div>
                            <div className="text-slate-300">{coachingContent?.tip}</div>
                        </div>
                        <div className="bg-blue-900/20 p-4 rounded border border-blue-900/50 flex gap-3 text-sm text-blue-300">
                            <CheckCircle className="w-5 h-5 shrink-0" />
                            <div className="font-semibold">{coachingContent?.rule}</div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setCoachingOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
                            I Understand
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
