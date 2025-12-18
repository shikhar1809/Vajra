"use client";

import { useState } from "react";
import { Settings, Zap, Shield, Package, Bug, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export interface ScanConfig {
    scanType: "quick" | "standard" | "comprehensive";
    includeTests: {
        sast: boolean;
        dast: boolean;
        dependencyScan: boolean;
        penetrationTest: boolean;
        malwareSignatures: boolean;
    };
    excludePatterns: string[];
}

interface ScanConfigurationProps {
    config: ScanConfig;
    onChange: (config: ScanConfig) => void;
}

export default function ScanConfiguration({ config, onChange }: ScanConfigurationProps) {
    const scanTypes = [
        {
            id: "quick" as const,
            name: "Quick Scan",
            icon: Zap,
            duration: "~5 minutes",
            description: "Basic security checks and dependency scanning",
            color: "text-green-400",
        },
        {
            id: "standard" as const,
            name: "Standard Scan",
            icon: Shield,
            duration: "~15 minutes",
            description: "Comprehensive SAST, DAST, and vulnerability analysis",
            color: "text-blue-400",
        },
        {
            id: "comprehensive" as const,
            name: "Comprehensive Scan",
            icon: AlertTriangle,
            duration: "~30 minutes",
            description: "Full penetration testing with AI-powered analysis",
            color: "text-purple-400",
        },
    ];

    const testOptions = [
        {
            key: "sast" as const,
            label: "Static Analysis (SAST)",
            description: "Analyze source code for security vulnerabilities",
            icon: Bug,
            recommended: true,
        },
        {
            key: "dast" as const,
            label: "Dynamic Analysis (DAST)",
            description: "Test running application for security issues",
            icon: Zap,
            recommended: true,
        },
        {
            key: "dependencyScan" as const,
            label: "Dependency Scanning",
            description: "Check for known vulnerabilities in dependencies",
            icon: Package,
            recommended: true,
        },
        {
            key: "penetrationTest" as const,
            label: "Penetration Testing",
            description: "Simulate real-world attacks on your codebase",
            icon: AlertTriangle,
            recommended: false,
        },
        {
            key: "malwareSignatures" as const,
            label: "Malware Signature Detection",
            description: "Scan using latest threat intelligence from Sentry",
            icon: Shield,
            recommended: true,
        },
    ];

    const handleScanTypeChange = (scanType: ScanConfig["scanType"]) => {
        // Auto-configure tests based on scan type
        let includeTests = { ...config.includeTests };

        if (scanType === "quick") {
            includeTests = {
                sast: true,
                dast: false,
                dependencyScan: true,
                penetrationTest: false,
                malwareSignatures: true,
            };
        } else if (scanType === "standard") {
            includeTests = {
                sast: true,
                dast: true,
                dependencyScan: true,
                penetrationTest: false,
                malwareSignatures: true,
            };
        } else {
            includeTests = {
                sast: true,
                dast: true,
                dependencyScan: true,
                penetrationTest: true,
                malwareSignatures: true,
            };
        }

        onChange({ ...config, scanType, includeTests });
    };

    const handleTestToggle = (key: keyof ScanConfig["includeTests"]) => {
        onChange({
            ...config,
            includeTests: {
                ...config.includeTests,
                [key]: !config.includeTests[key],
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Scan Type Selection */}
            <Card className="cyber-card border-purple-500/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-purple-400" />
                        Scan Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {scanTypes.map((type) => {
                            const Icon = type.icon;
                            const isSelected = config.scanType === type.id;

                            return (
                                <button
                                    key={type.id}
                                    onClick={() => handleScanTypeChange(type.id)}
                                    className={`p-4 rounded-lg border-2 transition-all text-left ${isSelected
                                            ? "border-purple-500 bg-purple-500/20"
                                            : "border-white/10 bg-white/5 hover:border-white/20"
                                        }`}
                                >
                                    <Icon className={`w-8 h-8 mb-3 ${type.color}`} />
                                    <h3 className="text-lg font-semibold text-white mb-1">{type.name}</h3>
                                    <p className="text-xs text-gray-400 mb-2">{type.duration}</p>
                                    <p className="text-sm text-gray-300">{type.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Test Options */}
            <Card className="cyber-card border-purple-500/50">
                <CardHeader>
                    <CardTitle className="text-white text-lg">Security Tests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {testOptions.map((option) => {
                        const Icon = option.icon;
                        const isEnabled = config.includeTests[option.key];

                        return (
                            <div
                                key={option.key}
                                className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                            >
                                <Icon className="w-5 h-5 text-purple-400 mt-0.5" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Label htmlFor={option.key} className="text-white font-semibold cursor-pointer">
                                            {option.label}
                                        </Label>
                                        {option.recommended && (
                                            <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                                                Recommended
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400">{option.description}</p>
                                </div>
                                <Switch
                                    id={option.key}
                                    checked={isEnabled}
                                    onCheckedChange={() => handleTestToggle(option.key)}
                                />
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Summary */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Scan Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="text-gray-400">Scan Type:</span>
                        <span className="text-white ml-2 font-semibold capitalize">{config.scanType}</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Tests Enabled:</span>
                        <span className="text-white ml-2 font-semibold">
                            {Object.values(config.includeTests).filter(Boolean).length} / 5
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
