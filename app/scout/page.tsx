"use client";

import { useState, useEffect } from "react";
import { Search, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Shield, Plus, Upload, Loader2, Database, RotateCcw } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FinancialDocumentUpload from "@/components/scout/FinancialDocumentUpload";
import DarkWebMonitor from "@/components/scout/DarkWebMonitor";
import DarkVeil from "@/components/DarkVeil";
import { usePageLoading } from "@/hooks/usePageLoading";

interface Vendor {
    id: string;
    name: string;
    domain: string;
    security_score: number;
    last_assessment: string;
    compliance_certifications: string[];
    status: string;
}

export default function ScoutPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddVendor, setShowAddVendor] = useState(false);
    const [newVendor, setNewVendor] = useState({ name: "", domain: "" });
    const [scanning, setScanning] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);

    const { isPageReady } = usePageLoading({
        pageName: 'Scout',
        loadingMessage: 'Loading Vendor Intelligence...'
    });

    // Load vendors from API
    useEffect(() => {
        loadVendors();
    }, []);

    const loadVendors = async () => {
        if (isDemoMode) return;
        try {
            const response = await fetch('/api/scout/vendors');
            const data = await response.json();
            if (data.success) {
                setVendors(data.data.vendors);
            }
        } catch (error) {
            console.error('Failed to load vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVendor = async () => {
        if (!newVendor.name || !newVendor.domain) {
            alert('Please enter both vendor name and domain');
            return;
        }

        setScanning(true);
        try {
            // Call backend API to scan vendor
            const response = await fetch('/api/scout/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendorId: crypto.randomUUID(),
                    domain: newVendor.domain,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Add new vendor to list
                const newVendorData: Vendor = {
                    id: data.data.scan.vendorId,
                    name: newVendor.name,
                    domain: data.data.scan.domain,
                    security_score: data.data.scan.scores.overall,
                    last_assessment: new Date().toISOString(),
                    compliance_certifications: [],
                    status: data.data.risk.riskLevel,
                };

                setVendors(prev => [...prev, newVendorData]);
                setShowAddVendor(false);
                setNewVendor({ name: "", domain: "" });

                alert(`✅ Vendor scanned successfully!\n\nSecurity Score: ${data.data.scan.scores.overall}/100\nRisk Level: ${data.data.risk.riskLevel}\n\nRecommendations:\n${data.data.recommendations.slice(0, 3).join('\n')}`);
            }
        } catch (error) {
            console.error('Failed to add vendor:', error);
            alert('Failed to scan vendor. Please try again.');
        } finally {
            setScanning(false);
        }
    };

    const toggleDemoMode = () => {
        if (!isDemoMode) {
            setIsDemoMode(true);
            setVendors([
                {
                    id: "demo-v1",
                    name: "SecureCloud Inc.",
                    domain: "securecloud.io",
                    security_score: 92,
                    last_assessment: new Date().toISOString(),
                    compliance_certifications: ["SOC2", "ISO27001"],
                    status: "safe"
                },
                {
                    id: "demo-v2",
                    name: "Legacy Systems Ltd.",
                    domain: "legacysys.net",
                    security_score: 45,
                    last_assessment: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
                    compliance_certifications: [],
                    status: "critical"
                },
                {
                    id: "demo-v3",
                    name: "PaymentProcessor X",
                    domain: "ppx-finance.com",
                    security_score: 78,
                    last_assessment: new Date().toISOString(),
                    compliance_certifications: ["PCI-DSS"],
                    status: "medium"
                },
                {
                    id: "demo-v4",
                    name: "Marketing Analytics Tool",
                    domain: "tracker-analytics.co",
                    security_score: 62,
                    last_assessment: new Date(Date.now() - 86400000 * 2).toISOString(),
                    compliance_certifications: ["GDPR"],
                    status: "medium"
                },
                {
                    id: "demo-v5",
                    name: "DevOps Pipeline Co",
                    domain: "ci-cd-secure.io",
                    security_score: 88,
                    last_assessment: new Date().toISOString(),
                    compliance_certifications: ["SOC2"],
                    status: "low"
                }
            ]);
        } else {
            setIsDemoMode(false);
            loadVendors();
        }
    };

    const stats = {
        totalVendors: vendors.length,
        avgSecurityScore: vendors.length > 0
            ? Math.round(vendors.reduce((sum, v) => sum + v.security_score, 0) / vendors.length)
            : 0,
        criticalVendors: vendors.filter(v => v.security_score < 60).length,
        compliantVendors: vendors.filter(v => v.compliance_certifications?.length > 0).length,
    };
    const highRiskCount = vendors.filter(v => v.security_score < 60).length;
    const mediumRiskCount = vendors.filter(v => v.security_score >= 60 && v.security_score < 80).length;

    if (!isPageReady) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-cyber-darker to-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative">
            {/* DarkVeil Background - Fixed Full Page */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
                <DarkVeil
                    hueShift={0}
                    speed={0.3}
                    noiseIntensity={0.03}
                    warpAmount={0.4}
                />
            </div>

            {/* Content wrapper with higher z-index */}
            <div className="p-6 relative z-10">
                <div className="container mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-red-500/20 rounded-lg">
                                    <Search className="w-8 h-8 text-red-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Vajra Scout</h1>
                                    <p className="text-gray-400">Vendor Security Intelligence & Compliance Tracking</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAddVendor(!showAddVendor)}
                            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Vendor
                        </button>
                        <button
                            onClick={toggleDemoMode}
                            className={`px-4 py-2 rounded-lg transition-colors font-semibold flex items-center gap-2 ${isDemoMode
                                ? 'bg-amber-500 hover:bg-amber-600 text-black'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                        >
                            {isDemoMode ? (
                                <>
                                    <RotateCcw className="w-4 h-4" />
                                    Clear Demo Data
                                </>
                            ) : (
                                <>
                                    <Database className="w-4 h-4 text-blue-400" />
                                    Load Demo Vendors
                                </>
                            )}
                        </button>
                    </div>

                    {/* Add Vendor Form */}
                    {showAddVendor && (
                        <Card className="cyber-card border-red-500/50">
                            <CardHeader>
                                <CardTitle className="text-white">Add New Vendor</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Vendor Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newVendor.name}
                                        onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., CloudStorage Inc."
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Domain
                                    </label>
                                    <input
                                        type="text"
                                        value={newVendor.domain}
                                        onChange={(e) => setNewVendor(prev => ({ ...prev, domain: e.target.value }))}
                                        placeholder="e.g., cloudstorage.com"
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAddVendor}
                                        disabled={scanning}
                                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {scanning ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Scanning...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-4 h-4" />
                                                Scan Vendor
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowAddVendor(false)}
                                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Vendors"
                            value={stats.totalVendors}
                            icon={Search}
                            iconColor="text-red-500"
                        />
                        <StatCard
                            title="Avg Security Score"
                            value={stats.avgSecurityScore}
                            icon={Shield}
                            trend={{ value: 5.2, isPositive: true }}
                            iconColor="text-green-500"
                        />
                        <StatCard
                            title="Critical Risk Vendors"
                            value={stats.criticalVendors}
                            icon={AlertTriangle}
                            iconColor="text-red-600"
                        />
                        <StatCard
                            title="Compliant Vendors"
                            value={stats.compliantVendors}
                            icon={CheckCircle2}
                            iconColor="text-red-400"
                        />
                    </div>

                    {/* Financial Document Upload */}
                    <Card className="cyber-card border-red-500/50">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Upload className="w-5 h-5 text-red-400" />
                                Financial Document Analysis
                            </CardTitle>
                            <p className="text-sm text-gray-400">
                                Upload expense reports, invoices, or bank statements to automatically detect and map vendor relationships
                            </p>
                        </CardHeader>
                        <CardContent>
                            <FinancialDocumentUpload />

                            {/* Dark Web Monitoring */}
                            <DarkWebMonitor />
                        </CardContent>
                    </Card>

                    {/* Vendors List */}
                    <Card className="cyber-card">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Search className="w-5 h-5 text-red-400" />
                                Vendor Security Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {vendors.length === 0 ? (
                                <div className="text-center py-12">
                                    <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">No Vendors Yet</h3>
                                    <p className="text-gray-400 mb-4">Add your first vendor to start security monitoring</p>
                                    <button
                                        onClick={() => setShowAddVendor(true)}
                                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold inline-flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Vendor
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {vendors.map((vendor) => {
                                        // Calculate A-F grade from score
                                        const getGrade = (score: number) => {
                                            if (score >= 90) return 'A';
                                            if (score >= 80) return 'B';
                                            if (score >= 70) return 'C';
                                            if (score >= 60) return 'D';
                                            return 'F';
                                        };

                                        const getGradeColor = (grade: string) => {
                                            const colors = {
                                                A: 'text-green-400 bg-green-500/10 border-green-500/30',
                                                B: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                                                C: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
                                                D: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
                                                F: 'text-red-400 bg-red-500/10 border-red-500/30',
                                            };
                                            return colors[grade as keyof typeof colors];
                                        };

                                        const grade = getGrade(vendor.security_score);

                                        return (
                                            <div key={vendor.id} className="p-6 bg-white/5 rounded-lg border border-white/10 hover:border-red-500/50 transition-all cursor-pointer">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-semibold text-white mb-1">{vendor.name}</h3>
                                                        <p className="text-sm text-gray-400">{vendor.domain}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`inline-block px-6 py-3 rounded-lg border ${getGradeColor(grade)} mb-2`}>
                                                            <span className="text-3xl font-black">Grade {grade}</span>
                                                        </div>
                                                        <p className="text-2xl font-bold text-white">{vendor.security_score}/100</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                                    <div className="text-center p-2 bg-black/30 rounded">
                                                        <p className="text-xs text-gray-400 mb-1">Network</p>
                                                        <p className="text-sm font-bold text-white">{Math.floor(Math.random() * 30 + 70)}</p>
                                                    </div>
                                                    <div className="text-center p-2 bg-black/30 rounded">
                                                        <p className="text-xs text-gray-400 mb-1">DNS</p>
                                                        <p className="text-sm font-bold text-white">{Math.floor(Math.random() * 30 + 70)}</p>
                                                    </div>
                                                    <div className="text-center p-2 bg-black/30 rounded">
                                                        <p className="text-xs text-gray-400 mb-1">Patching</p>
                                                        <p className="text-sm font-bold text-white">{Math.floor(Math.random() * 30 + 70)}</p>
                                                    </div>
                                                    <div className="text-center p-2 bg-black/30 rounded">
                                                        <p className="text-xs text-gray-400 mb-1">App Sec</p>
                                                        <p className="text-sm font-bold text-white">{Math.floor(Math.random() * 30 + 70)}</p>
                                                    </div>
                                                    <div className="text-center p-2 bg-black/30 rounded">
                                                        <p className="text-xs text-gray-400 mb-1">TLS</p>
                                                        <p className="text-sm font-bold text-white">{Math.floor(Math.random() * 30 + 70)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 flex-wrap mb-3">
                                                    <Badge
                                                        variant={
                                                            vendor.security_score >= 80 ? "default" :
                                                                vendor.security_score >= 60 ? "secondary" :
                                                                    "destructive"
                                                        }
                                                        className={
                                                            vendor.security_score >= 80 ? "bg-green-500" :
                                                                vendor.security_score >= 60 ? "bg-yellow-500" :
                                                                    "bg-red-500"
                                                        }
                                                    >
                                                        {vendor.security_score >= 80 ? "Low Risk" :
                                                            vendor.security_score >= 60 ? "Medium Risk" :
                                                                "High Risk"}
                                                    </Badge>

                                                    {vendor.compliance_certifications?.map((cert) => (
                                                        <Badge key={cert} variant="outline" className="border-red-400 text-red-400">
                                                            {cert}
                                                        </Badge>
                                                    ))}

                                                    <span className="text-xs text-gray-400 ml-auto">
                                                        Last assessed: {new Date(vendor.last_assessment).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                <div className="mt-3">
                                                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all ${vendor.security_score >= 80 ? "bg-green-500" :
                                                                vendor.security_score >= 60 ? "bg-yellow-500" :
                                                                    "bg-red-500"
                                                                }`}
                                                            style={{ width: `${vendor.security_score}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
