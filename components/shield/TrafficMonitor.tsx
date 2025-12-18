"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TrafficMonitor() {
    const [trafficData, setTrafficData] = useState<Array<{ time: string; requests: number }>>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Set mounted to true on client-side
        setMounted(true);

        // Simulate real-time traffic data
        const generateData = () => {
            const now = new Date();
            const data = [];
            for (let i = 29; i >= 0; i--) {
                const time = new Date(now.getTime() - i * 60000);
                data.push({
                    time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    requests: Math.floor(Math.random() * 500) + 200,
                });
            }
            return data;
        };

        setTrafficData(generateData());

        // Update every 10 seconds
        const interval = setInterval(() => {
            setTrafficData(prev => {
                const newData = [...prev.slice(1)];
                const now = new Date();
                newData.push({
                    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    requests: Math.floor(Math.random() * 500) + 200,
                });
                return newData;
            });
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <Card className="cyber-card">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyber-blue animate-pulse" />
                        Real-Time Traffic Monitor
                        <span className="ml-auto text-sm font-normal text-gray-400">Last 30 minutes</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="text-gray-400">Loading traffic data...</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="cyber-card">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyber-blue animate-pulse" />
                    Real-Time Traffic Monitor
                    <span className="ml-auto text-sm font-normal text-gray-400">Last 30 minutes</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trafficData}>
                            <defs>
                                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="time"
                                stroke="#94A3B8"
                                tick={{ fill: '#94A3B8' }}
                            />
                            <YAxis
                                stroke="#94A3B8"
                                tick={{ fill: '#94A3B8' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1E293B',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#F1F5F9'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="requests"
                                stroke="#0EA5E9"
                                fillOpacity={1}
                                fill="url(#colorRequests)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                            {trafficData[trafficData.length - 1]?.requests || 0}
                        </div>
                        <div className="text-sm text-gray-400">Current Req/min</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                            {Math.floor(trafficData.reduce((sum, d) => sum + d.requests, 0) / trafficData.length)}
                        </div>
                        <div className="text-sm text-gray-400">Avg Req/min</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                            {Math.max(...trafficData.map(d => d.requests))}
                        </div>
                        <div className="text-sm text-gray-400">Peak Req/min</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
