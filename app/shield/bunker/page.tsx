"use client";

import { Shield, Lock, Smartphone, Pen, Bot, Fingerprint, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { BunkerChallenge } from "@/components/shield/BunkerChallenge";

export default function BunkerModePage() {
    const [bunkerModeActive, setBunkerModeActive] = useState(false);
    const [selectedChallenges, setSelectedChallenges] = useState<string[]>(['otp', 'captcha']);

    const challenges = [
        {
            id: 'otp',
            name: 'OTP Verification',
            description: 'Send one-time password via email or SMS',
            icon: Smartphone,
            color: 'text-cyber-blue',
            bgColor: 'bg-cyber-blue/20',
        },
        {
            id: 'pen_tool',
            name: 'Pen Tool Drawing',
            description: 'User draws a specific pattern on canvas',
            icon: Pen,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/20',
        },
        {
            id: 'captcha',
            name: 'CAPTCHA Challenge',
            description: 'Image-based human verification',
            icon: Bot,
            color: 'text-green-400',
            bgColor: 'bg-green-500/20',
        },
        {
            id: 'behavioral',
            name: 'Behavioral Analysis',
            description: 'Mouse movement and typing patterns',
            icon: Settings,
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/20',
        },
        {
            id: 'device_fingerprint',
            name: 'Device Fingerprinting',
            description: 'Verify device characteristics',
            icon: Fingerprint,
            color: 'text-red-400',
            bgColor: 'bg-red-500/20',
        },
    ];

    const toggleChallenge = (id: string) => {
        setSelectedChallenges(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-cyber-darker to-slate-900 p-6">
            <div className="container mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-orange-500/20 rounded-lg">
                                <Shield className="w-8 h-8 text-orange-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Bunker Mode</h1>
                                <p className="text-gray-400">Advanced Challenge System Configuration</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Badge variant={bunkerModeActive ? "default" : "secondary"} className="text-sm px-4 py-2">
                            {bunkerModeActive ? "Active" : "Inactive"}
                        </Badge>
                        <button
                            onClick={() => setBunkerModeActive(!bunkerModeActive)}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all ${bunkerModeActive
                                    ? "bg-red-500 hover:bg-red-600 text-white"
                                    : "bg-cyber-blue hover:bg-cyber-blue/90 text-white"
                                }`}
                        >
                            {bunkerModeActive ? "Deactivate" : "Activate"} Bunker Mode
                        </button>
                    </div>
                </div>

                {/* Status Card */}
                <Card className="cyber-card border-2 border-orange-500/50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-orange-500/20 rounded-lg">
                                <Lock className="w-8 h-8 text-orange-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2">Bunker Mode Status</h3>
                                <p className="text-gray-400 mb-4">
                                    {bunkerModeActive
                                        ? "Bunker mode is currently active. All users must pass selected challenges to access your application."
                                        : "Bunker mode is inactive. It will automatically activate when anomalies are detected, or you can manually activate it."}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <div className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                                        Auto-activation: Enabled
                                    </div>
                                    <div className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                                        Threshold: 3x normal traffic
                                    </div>
                                    <div className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                                        Active Challenges: {selectedChallenges.length}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Challenge Selection */}
                <Card className="cyber-card">
                    <CardHeader>
                        <CardTitle className="text-white">Challenge Types</CardTitle>
                        <p className="text-gray-400 text-sm">Select which challenges users must complete when bunker mode is active</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {challenges.map((challenge) => {
                                const Icon = challenge.icon;
                                const isSelected = selectedChallenges.includes(challenge.id);

                                return (
                                    <div
                                        key={challenge.id}
                                        onClick={() => toggleChallenge(challenge.id)}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                                                ? "border-cyber-blue bg-cyber-blue/10"
                                                : "border-white/10 bg-white/5 hover:border-white/30"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${challenge.bgColor}`}>
                                                <Icon className={`w-5 h-5 ${challenge.color}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-semibold text-white">{challenge.name}</h4>
                                                    {isSelected && (
                                                        <div className="w-5 h-5 bg-cyber-blue rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-400">{challenge.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Challenge Preview */}
                {bunkerModeActive && selectedChallenges.length > 0 && (
                    <Card className="cyber-card">
                        <CardHeader>
                            <CardTitle className="text-white">Challenge Preview</CardTitle>
                            <p className="text-gray-400 text-sm">This is what users will see when bunker mode is active</p>
                        </CardHeader>
                        <CardContent>
                            <BunkerChallenge challengeTypes={selectedChallenges} />
                        </CardContent>
                    </Card>
                )}

                {/* Configuration */}
                <Card className="cyber-card">
                    <CardHeader>
                        <CardTitle className="text-white">Advanced Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div>
                                    <h4 className="text-white font-semibold">Auto-Activation</h4>
                                    <p className="text-sm text-gray-400">Automatically activate bunker mode when anomalies are detected</p>
                                </div>
                                <button className="px-4 py-2 bg-cyber-blue rounded-lg text-white">Enabled</button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div>
                                    <h4 className="text-white font-semibold">Traffic Threshold</h4>
                                    <p className="text-sm text-gray-400">Activate when traffic exceeds this multiplier of normal levels</p>
                                </div>
                                <select className="px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white">
                                    <option>2x Normal</option>
                                    <option selected>3x Normal</option>
                                    <option>5x Normal</option>
                                    <option>10x Normal</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div>
                                    <h4 className="text-white font-semibold">Challenge Difficulty</h4>
                                    <p className="text-sm text-gray-400">Progressive difficulty based on threat level</p>
                                </div>
                                <select className="px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white">
                                    <option>Easy</option>
                                    <option selected>Medium</option>
                                    <option>Hard</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
