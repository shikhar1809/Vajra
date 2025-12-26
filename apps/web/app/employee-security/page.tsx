"use client";

import { useState } from "react";
import { Users, UserX, Shield, AlertTriangle, CheckCircle, Search, Mail, Lock, History, FileText, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import EvidenceLog from "@/components/evidence-log";
import { privilegeData } from "@/data/mock_iam";

export default function EmployeeSecurityPage() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-200">
            <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-500" />
                        VAJRA Guardian
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Employee Identity & Access Governance</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                        <History className="w-4 h-4 mr-2" /> Audit Logs
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Shield className="w-4 h-4 mr-2" /> Run Full Scan
                    </Button>
                </div>
            </header>

            <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
                <TabsList className="bg-slate-900 border border-slate-800 p-1">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="phishing">Phishing Sim</TabsTrigger>
                    <TabsTrigger value="credentials">Credential Sentinel</TabsTrigger>
                    <TabsTrigger value="privilege" className="data-[state=active]:bg-yellow-950/30 data-[state=active]:text-yellow-400">
                        <Lock className="w-3 h-3 mr-2" /> Privilege Audit
                    </TabsTrigger>
                    <TabsTrigger value="activity">Activity Log</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Identity Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-400">94/100</div>
                                <p className="text-xs text-slate-500 mt-1">Top 10% of Organization</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Active Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-400">1,248</div>
                                <p className="text-xs text-slate-500 mt-1">+12 this week</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">At-Risk Accounts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-yellow-400">3</div>
                                <p className="text-xs text-slate-500 mt-1">Requires Attention</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Phishing Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-400">1.2%</div>
                                <p className="text-xs text-slate-500 mt-1">-0.5% vs last month</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="w-5 h-5 text-blue-500" />
                                    Identity Pulse Map
                                </CardTitle>
                                <CardDescription>Real-time login activity and anomaly detection</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg bg-slate-950/50">
                                <p className="text-slate-500 flex items-center gap-2">
                                    <Search className="w-4 h-4" /> Live Map Visualization Placeholder
                                </p>
                            </CardContent>
                        </Card>

                        <EvidenceLog />
                    </div>
                </TabsContent>

                {/* Mock Phishing Tab */}
                <TabsContent value="phishing">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Phishing Simulation Campaigns</CardTitle>
                            <CardDescription>Train employees to recognize social engineering attacks.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border border-slate-800 rounded-lg bg-slate-950 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-purple-900/20 rounded-lg text-purple-400">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-200">Q4 CEO Fraud Simulation</h4>
                                        <p className="text-sm text-slate-500">Target: Finance Dept | Status: Active</p>
                                    </div>
                                </div>
                                <Button variant="secondary">View Results</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Mock Credentials Tab */}
                <TabsContent value="credentials">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Credential Sentinel</CardTitle>
                            <CardDescription>Monitor the dark web for leaked employee credentials.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-950/10 border border-green-900/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-green-400 font-medium">No active leaks detected today</span>
                                </div>
                                <Button size="sm" variant="outline" className="border-green-800 text-green-400 hover:bg-green-950">Scan Now</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* NEW FEATURE: Privilege Audit */}
                <TabsContent value="privilege">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-yellow-400">
                                <AlertTriangle className="w-5 h-5" /> Internal Privilege Audit (Least Privilege)
                            </CardTitle>
                            <CardDescription>
                                Automated analysis of employee access rights vs. role requirements.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-slate-800 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-xs">
                                        <tr>
                                            <th className="p-4">Employee</th>
                                            <th className="p-4">Role / Dept</th>
                                            <th className="p-4">Access Scopes</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                                        {privilegeData.map((emp, i) => (
                                            <tr key={i} className={`group hover:bg-slate-800/50 transition-colors ${emp.status === 'OVER-PRIVILEGED' ? 'bg-yellow-950/10' : ''}`}>
                                                <td className="p-4 font-medium text-slate-200">
                                                    {emp.user}
                                                </td>
                                                <td className="p-4 text-slate-400">
                                                    <div className="text-slate-200">{emp.role}</div>
                                                    <div className="text-xs opacity-70">{emp.department}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {emp.access.map((acc, j) => (
                                                            <Badge key={j} variant="secondary" className="bg-slate-950 border-slate-700 text-xs">
                                                                {acc}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {emp.status === "OVER-PRIVILEGED" ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold border border-yellow-500/20 animate-pulse">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            OVER-PRIVILEGED
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                                                            <CheckCircle className="w-3 h-3" />
                                                            OK
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {emp.status === "OVER-PRIVILEGED" && (
                                                        <Button size="sm" variant="destructive" className="h-8 bg-yellow-600 hover:bg-yellow-700 text-white font-bold">
                                                            <Ban className="w-3 h-3 mr-1" /> Revoke Excess
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
