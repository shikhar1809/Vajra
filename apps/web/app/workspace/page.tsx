"use client";

import { useEffect, useState } from "react";
import { AreaChart } from "@tremor/react";
import { Shield, Lock, Unlock, Activity, AlertTriangle, FileCode } from "lucide-react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// --- Components ---

const PortfolioRiskChart = ({ data }: { data: any[] }) => {
    return (
        <Card className="h-full bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                    Portfolio Risk Analysis
                </CardTitle>
            </CardHeader>
            <CardContent>
                <AreaChart
                    className="h-72"
                    data={data}
                    index="vendor_name"
                    categories={["risk_score"]}
                    colors={["red"]}
                    valueFormatter={(number) => `${number}%`}
                    yAxisWidth={48}
                    showAnimation={true}
                    showGradient={true}
                    curveType="monotone"
                />
            </CardContent>
        </Card>
    );
};

export default function WorkspacePage() {
    const [threats, setThreats] = useState<any[]>([]);
    const [isFortressMode, setFortressMode] = useState(false);
    const [highAlert, setHighAlert] = useState(false);
    const [vendors, setVendors] = useState<any[]>([]);

    // --- SSE Connection ---
    useEffect(() => {
        const eventSource = new EventSource("http://localhost:8000/api/v1/threats/stream");

        eventSource.addEventListener("threat", (e: any) => {
            const data = JSON.parse(e.data);

            // Check for Critical Threats
            if (data.type === "TRAFFIC_SPIKE" && data.threat_score > 50) {
                setHighAlert(true);
                setTimeout(() => setHighAlert(false), 5000);
            }
            if (data.severity === "CRITICAL") {
                setHighAlert(true);
                setTimeout(() => setHighAlert(false), 8000);
            }

            setThreats((prev) => [data, ...prev].slice(0, 50));
        });

        return () => eventSource.close();
    }, []);

    // --- Fetch Risk Data ---
    useEffect(() => {
        fetch("http://localhost:8000/api/v1/risks/scores")
            .then((res) => res.json())
            .then((data) => setVendors(data.vendors || []))
            .catch((err) => console.error("Failed to fetch risks", err));
    }, []);

    // --- Toggle Fortress ---
    const toggleFortress = async () => {
        try {
            const newState = !isFortressMode;
            await fetch(`http://localhost:8000/api/v1/fortress/toggle?enable=${newState}`, { method: "POST" });
            setFortressMode(newState);
        } catch (e) {
            console.error("Failed to toggle fortress", e);
        }
    };

    return (
        <div className={clsx(
            "min-h-screen bg-slate-950 p-6 font-sans transition-all duration-500 relative overflow-hidden text-slate-200",
            highAlert ? "border-[8px] border-red-600 shadow-[inset_0_0_100px_#7f1d1d]" : ""
        )}>
            {/* Critical Alert Overlay - Shielding System Progress */}
            <AnimatePresence>
                {highAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-0 left-0 w-full z-50 pointer-events-none"
                    >
                        <div className="bg-red-950/95 text-red-100 text-center py-3 font-mono font-bold border-b border-red-500 flex flex-col items-center shadow-2xl">
                            <span className="flex items-center gap-3 animate-pulse text-lg tracking-widest">
                                <AlertTriangle className="w-6 h-6 text-red-500 fill-current" />
                                CRITICAL THREAT DETECTED - SHIELDING SYSTEMS ENGAGED
                            </span>
                            <div className="w-full h-1.5 bg-red-900 mt-3 relative overflow-hidden">
                                <div className="absolute top-0 left-0 h-full bg-red-500 animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Section */}
            <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-950/30 rounded-lg border border-red-900/50">
                        <Shield className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">VAJRA Command Center</h1>
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Security Operations Console</p>
                    </div>
                </div>

                <Button
                    variant={isFortressMode ? "destructive" : "secondary"}
                    onClick={toggleFortress}
                    className={clsx(
                        "h-12 px-6 text-sm font-bold tracking-wide transition-all shadow-lg border",
                        isFortressMode
                            ? "bg-red-600 hover:bg-red-700 border-red-500 text-white shadow-red-900/50 animate-pulse"
                            : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400"
                    )}
                >
                    {isFortressMode ? (
                        <>
                            <Lock className="w-4 h-4 mr-2" /> FORTRESS MODE: ON
                        </>
                    ) : (
                        <>
                            <Unlock className="w-4 h-4 mr-2" /> FORTRESS MODE: OFF
                        </>
                    )}
                </Button>
            </header>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* Portfolio Risk Analysis Analysis (Top Left) */}
                <PortfolioRiskChart data={vendors} />

                {/* Live Threat Stream (Top Right) */}
                <Card className="h-full bg-slate-900 border-slate-800 flex flex-col">
                    <CardHeader className="pb-3 border-b border-slate-800/50">
                        <CardTitle className="text-slate-100 flex items-center gap-2 text-lg">
                            <Activity className="w-5 h-5 text-red-500" />
                            Live Threat Stream
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-4 space-y-3 max-h-[300px] min-h-[300px]">
                        <AnimatePresence initial={false}>
                            {threats.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-50">
                                    <Shield className="w-12 h-12" />
                                    <p>No active threats detected</p>
                                </div>
                            )}
                            {threats.map((t, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-3 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 transition-colors group flex items-start gap-3"
                                >
                                    <div className="mt-0.5">
                                        {t.severity === 'CRITICAL' || t.threat_score > 50 ? (
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                        ) : (
                                            <Shield className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-red-400 font-bold text-xs uppercase tracking-wider">{t.type}</span>
                                            <span className="text-slate-600 text-[10px] font-mono">{new Date(t.timestamp * 1000).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-slate-300 text-sm truncate">{t.message}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>

            {/* AI Vulnerability Analysis (Bottom Full-Width) */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-slate-100 flex items-center gap-2">
                        AI Vulnerability Analysis (Semgrep + Gemini)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-slate-700 rounded-xl bg-slate-950/50 h-64 flex flex-col items-center justify-center cursor-pointer hover:border-red-500/50 hover:bg-slate-950 transition-all group">
                        <div className="p-4 rounded-full bg-slate-900 group-hover:bg-red-950/20 transition-colors mb-4">
                            <FileCode className="w-10 h-10 text-slate-500 group-hover:text-red-500 transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-300 group-hover:text-white transition-colors">Drag & Drop code file to analyze</h3>
                        <p className="text-sm text-slate-500 mt-2 font-mono">Supports .py, .js, .ts, .go</p>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
