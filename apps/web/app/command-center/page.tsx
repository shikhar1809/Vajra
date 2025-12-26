"use client";

import { useEffect, useState } from "react";
import { AreaChart } from "@tremor/react";
import { Shield, Activity, AlertTriangle, FileCode, CheckCircle, Smartphone } from "lucide-react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock } from "lucide-react";

// --- Components ---

const PortfolioRiskChart = ({ data }: { data: any[] }) => {
    return (
        <Card className="h-full bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                    Portfolio Risk Analysis
                    <Badge variant="outline" className="ml-auto border-red-900 bg-red-950 text-red-400 animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" /> Live
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <AreaChart
                    className="h-64"
                    data={data}
                    index="day"
                    categories={["risk_score"]}
                    colors={["red"]}
                    valueFormatter={(number) => `${number}%`}
                    yAxisWidth={40}
                    showAnimation={true}
                    showGradient={true}
                    curveType="monotone"
                />
            </CardContent>
        </Card>
    );
};

export default function CommandCenterPage() {
    const [threats, setThreats] = useState<any[]>([]);
    const [isFortressMode, setFortressMode] = useState(false);

    // Mock Data for Charts
    const riskData = [
        { day: 'Day 1', risk_score: 45 },
        { day: 'Day 2', risk_score: 30 },
        { day: 'Day 3', risk_score: 28 },
        { day: 'Day 4', risk_score: 15 },
    ];

    // --- SSE Connection ---
    useEffect(() => {
        // Safe check for browser environment
        if (typeof window === 'undefined') return;

        const eventSource = new EventSource("http://localhost:8000/api/v1/threats/stream");
        eventSource.addEventListener("threat", (e: any) => {
            try {
                const data = JSON.parse(e.data);
                console.log("Threat Received:", data);
                setThreats((prev) => [data, ...prev].slice(0, 50));
            } catch (err) {
                console.error("Failed to parse threat event:", err, e.data);
            }
        });
        return () => eventSource.close();
    }, []);

    // --- Toggle Fortress ---
    const toggleFortress = async () => {
        try {
            const newState = !isFortressMode;
            await fetch(`http://localhost:8000/api/v1/fortress-mode?enable=${newState}`, { method: "POST" });
            setFortressMode(newState);
        } catch (e) {
            console.error("Failed to toggle fortress", e);
        }
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>

                <Button
                    variant={isFortressMode ? "destructive" : "secondary"}
                    onClick={toggleFortress}
                    className={clsx(
                        "h-10 px-6 font-bold tracking-wide transition-all border",
                        isFortressMode
                            ? "bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                    )}
                >
                    {isFortressMode ? (
                        <><Lock className="w-4 h-4 mr-2" /> FORTRESS MODE: ON</>
                    ) : (
                        <><Unlock className="w-4 h-4 mr-2" /> FORTRESS MODE: OFF</>
                    )}
                </Button>
            </header>

            {/* Row 1: Charts & Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <PortfolioRiskChart data={riskData} />

                {/* Live Threat Stream */}
                <Card className="h-full bg-slate-900 border-slate-800 flex flex-col">
                    <CardHeader className="pb-3 border-b border-slate-800/50">
                        <CardTitle className="text-slate-100 flex items-center justify-between text-lg">
                            <span className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> Live Threat Stream</span>
                            {/* Heartbeat Animation */}
                            <div className="flex items-center gap-1">
                                <div className="w-12 h-6 bg-slate-950 rounded-md border border-slate-800 relative overflow-hidden">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-green-900/50"></div>
                                    <div className="absolute top-0 left-0 w-2 h-full bg-green-500/20 animate-[scan_2s_linear_infinite]"></div>
                                    <svg className="absolute inset-0 w-full h-full text-green-500 animate-pulse" viewBox="0 0 50 10">
                                        <polyline points="0,5 20,5 22,2 25,8 28,5 50,5" fill="none" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 max-h-[250px] min-h-[250px]">
                        <AnimatePresence initial={false}>
                            {threats.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <p className="text-sm font-mono">No active threats detected</p>
                                    <p className="text-xs text-slate-700">System monitoring active</p>
                                </div>
                            )}
                            {threats.map((t, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 rounded border border-red-900/30 bg-red-950/10 flex items-center gap-3"
                                >
                                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                    <div>
                                        <div className="text-red-400 font-bold text-xs uppercase">{t.type}</div>
                                        <div className="text-slate-400 text-xs">{t.message}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>

            {/* Row 2: Summary Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader><CardTitle className="text-slate-200 text-base">Vendor Risk Summary</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center py-6">
                            <span className="text-4xl font-black text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">3 Critical Risks</span>
                            <p className="text-slate-500 text-sm mt-2">out of 12 tracked vendors</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader><CardTitle className="text-slate-200 text-base">Compliance Readiness</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4 py-4">
                            <div className="flex justify-between items-end mb-2">
                                <span className="font-bold text-white text-lg">SOC 2: 87% Ready</span>
                                <span className="text-slate-400 text-xs">Target: 100%</span>
                            </div>
                            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 w-[87%] shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                            </div>
                            <Button
                                onClick={async () => {
                                    try {
                                        await fetch("http://localhost:8000/api/v1/audit/report");
                                        alert("SOC2 Compliance Report Generated Successfully! Sent to Audit Log.");
                                    } catch (e) {
                                        console.error(e);
                                        // Still show success for demo if offline, or alert failure
                                        alert("Failed to generate report (Check console). For Demo: Success!");
                                    }
                                }}
                                className="w-full bg-blue-900/20 text-blue-400 hover:bg-blue-900/40 border border-blue-900/50 mt-4"
                            >
                                <FileCode className="w-4 h-4 mr-2" /> Generate SOC2 Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>


        </div>
    );
}
