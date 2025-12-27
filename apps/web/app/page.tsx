"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Code, MapPin, ArrowRight, CheckCircle2, Sparkles, DollarSign, Lock, Zap, AlertTriangle } from "lucide-react";
import Ribbons from "@/components/Ribbons";
import PillNav from "@/components/PillNav";
import InfiniteGridBackground from "@/components/InfiniteGridBackground";
import { LetsWorkTogether } from "@/components/LetsWorkTogether";
import { ContainerScroll, FeatureSlideshow } from "@/components/ContainerScrollShowcase";

export default function HomePage() {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-black relative">
            {/* Infinite Grid Background - Fixed behind everything */}
            <InfiniteGridBackground />

            {/* Content wrapper with relative positioning */}
            <div className="relative z-10">
                {/* Navigation */}
                <PillNav
                    logo="/vajra-logo.svg"
                    logoAlt="VAJRA Logo"
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'About Us', href: '/about' },
                        { label: 'Command Center', href: '/command-center' }
                    ]}
                    activeHref={pathname}
                    baseColor="#000000"
                    pillColor="#ffffff"
                    hoveredPillTextColor="#ffffff"
                    pillTextColor="#000000"
                />

                {/* Red Ribbons Cursor Effect */}
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 9999, pointerEvents: 'none' }}>
                    <Ribbons
                        baseThickness={30}
                        colors={['#ef4444', '#dc2626', '#b91c1c']}
                        speedMultiplier={0.5}
                        maxAge={500}
                        enableFade={false}
                        enableShaderEffect={true}
                    />
                </div>

                {/* Hero Section */}
                <section className="relative container mx-auto px-6 pt-32 pb-20 max-w-6xl">
                    <div className="text-center mb-16">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full mb-6 animate-pulse">
                            <Shield className="w-4 h-4 text-red-400" />
                            <span className="text-red-300 text-sm font-medium">AI-Powered Digital Bodyguard</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                            ⚡ VAJRA
                            <br />
                            <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-500 bg-clip-text text-transparent">
                                Protects Small Businesses
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto leading-relaxed">
                            Enterprise-grade <span className="text-red-400 font-bold">Zero Trust Security</span> for SMBs.
                            <br />
                            <span className="text-green-400 font-bold">Autonomous, intelligent, and effortless</span> protection.
                        </p>

                        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
                            3-Layer Defense System powered by AI. No expertise required.
                        </p>
                    </div>
                </section>

                {/* What We Offer - Scroll Animation Showcase */}
                <ContainerScroll
                    titleComponent={
                        <div className="space-y-4">
                            <h2 className="text-5xl md:text-7xl font-bold text-white">
                                WHAT WE OFFER
                            </h2>
                            <p className="text-xl text-slate-400">
                                Explore the Command Center's powerful security features
                            </p>
                        </div>
                    }
                >
                    <FeatureSlideshow />
                </ContainerScroll>

                {/* The Problem Section */}
                <section className="bg-slate-900/50 border-y border-slate-800 py-16">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-4">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>The Problem</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                    Cyber Attacks Cost SMBs <span className="text-red-400">$20,000</span> on Average
                                </h2>
                                <div className="space-y-4 text-slate-300">
                                    <p>
                                        <strong className="text-white">The Scam:</strong> Hackers send fake invoices with changed bank account numbers. Emails pretending to be your boss demanding urgent action.
                                    </p>
                                    <p>
                                        <strong className="text-white">The Reality:</strong> Small business owners aren't cybersecurity experts. They can't tell a fake email from a real one.
                                    </p>
                                    <p className="text-red-400 font-semibold">
                                        One wrong click = $20,000 lost or ransomware locking all your files.
                                    </p>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent rounded-2xl blur-3xl" />
                                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8">
                                    <div className="text-center mb-6">
                                        <div className="text-6xl font-black text-red-500 mb-2">95%</div>
                                        <div className="text-slate-400">of cyber attacks target SMBs</div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <CheckCircle2 className="w-5 h-5 text-red-400 flex-shrink-0" />
                                            <span>Fake invoices steal payments</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <CheckCircle2 className="w-5 h-5 text-red-400 flex-shrink-0" />
                                            <span>Phishing emails compromise accounts</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <CheckCircle2 className="w-5 h-5 text-red-400 flex-shrink-0" />
                                            <span>Code vulnerabilities expose data</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* The 3-Layer Defense */}
                <section className="container mx-auto px-6 py-20 max-w-6xl">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-4">
                            <Shield className="w-4 h-4" />
                            <span>The Solution</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                            The 3-Layer Defense System
                        </h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            AI-powered protection that stops threats before they reach you
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Layer 1: Invoice Forensic Auditor */}
                        <div className="group relative bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 border-2 border-yellow-500/30 rounded-2xl p-8 hover:border-yellow-500 transition-all hover:scale-[1.02]">
                            <div className="flex items-start gap-6">
                                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 flex items-center justify-center">
                                    <DollarSign className="w-full h-full text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-2xl font-bold text-white">Layer 1: Invoice Forensic Auditor</h3>
                                        <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-semibold">FINANCIAL DEFENSE</span>
                                    </div>
                                    <p className="text-slate-300 mb-4 text-lg">
                                        <strong className="text-red-400">Problem:</strong> Scammers change bank details on PDF invoices to steal payments.
                                    </p>
                                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mb-4">
                                        <p className="text-slate-300 mb-2"><strong className="text-white">How it works:</strong></p>
                                        <ol className="list-decimal list-inside space-y-2 text-slate-400">
                                            <li>You upload an invoice</li>
                                            <li>Our AI reads the document and extracts the bank account number</li>
                                            <li>Instantly cross-references with your "Golden Record" of approved vendors</li>
                                            <li><span className="text-green-400 font-semibold">Result: If a single digit is different, VAJRA flashes RED</span></li>
                                        </ol>
                                    </div>
                                    <div className="flex items-center gap-2 text-yellow-400 font-semibold">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Prevents fraud before payment is sent</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Layer 2: Cloud-Native Code Scanner */}
                        <div className="group relative bg-gradient-to-r from-blue-900/20 to-blue-800/10 border-2 border-blue-500/30 rounded-2xl p-8 hover:border-blue-500 transition-all hover:scale-[1.02]">
                            <div className="flex items-start gap-6">
                                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 flex items-center justify-center">
                                    <Code className="w-full h-full text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-2xl font-bold text-white">Layer 2: Cloud-Native Code Scanner</h3>
                                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-semibold">CLOUD & CODE DEFENSE</span>
                                    </div>
                                    <p className="text-slate-300 mb-4 text-lg">
                                        <strong className="text-red-400">Problem:</strong> Your company's software (on GitHub) might have hidden backdoors hackers can exploit.
                                    </p>
                                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mb-4">
                                        <p className="text-slate-300 mb-2"><strong className="text-white">How it works:</strong></p>
                                        <ol className="list-decimal list-inside space-y-2 text-slate-400">
                                            <li>Connect your GitHub account securely with one click</li>
                                            <li>Our AI (powered by <span className="text-blue-400 font-semibold">Google Gemini 3 Pro</span>) acts like a super-smart security architect</li>
                                            <li>Reads your entire project at once to understand how it works</li>
                                            <li><span className="text-green-400 font-semibold">Finds complex logic flaws other tools miss and suggests exact fixes</span></li>
                                        </ol>
                                    </div>
                                    <div className="flex items-center gap-2 text-blue-400 font-semibold">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Catches vulnerabilities before hackers do</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Layer 3: Impossible Travel Detector */}
                        <div className="group relative bg-gradient-to-r from-purple-900/20 to-purple-800/10 border-2 border-purple-500/30 rounded-2xl p-8 hover:border-purple-500 transition-all hover:scale-[1.02]">
                            <div className="flex items-start gap-6">
                                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 flex items-center justify-center">
                                    <MapPin className="w-full h-full text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-2xl font-bold text-white">Layer 3: Impossible Travel Detector</h3>
                                        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-xs font-semibold">EMPLOYEE DEFENSE</span>
                                    </div>
                                    <p className="text-slate-300 mb-4 text-lg">
                                        <strong className="text-red-400">Problem:</strong> Employee's password stolen, hacker tries to log in from Russia an hour after employee logged in from India.
                                    </p>
                                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mb-4">
                                        <p className="text-slate-300 mb-2"><strong className="text-white">How it works:</strong></p>
                                        <ol className="list-decimal list-inside space-y-2 text-slate-400">
                                            <li>VAJRA uses <span className="text-purple-400 font-semibold">physics</span> - knows it's impossible to travel that far, that fast</li>
                                            <li>Instantly flags the login as CRITICAL RISK</li>
                                            <li><span className="text-green-400 font-semibold">Zero Trust Action: Even though password is correct, blocks access to sensitive data in real-time</span></li>
                                        </ol>
                                    </div>
                                    <div className="flex items-center gap-2 text-purple-400 font-semibold">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Stops credential theft attacks instantly</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Zero Trust Philosophy */}
                <section className="bg-slate-900/50 border-y border-slate-800 py-20">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-4">
                                <Lock className="w-4 h-4" />
                                <span>Security Philosophy</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                                Zero Trust Architecture
                            </h2>
                            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                                "Never Trust, Always Verify"
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-red-500/10 rounded-lg">
                                        <Shield className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Least Privilege</h3>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                    An accountant only sees financial tools. A developer only sees code tools. No one has "keys to the kingdom."
                                </p>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-red-500/10 rounded-lg">
                                        <Zap className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Risk-Adaptive Access</h3>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                    If you act suspiciously (like the Impossible Travel example), your access is revoked instantly. Context matters more than credentials.
                                </p>
                            </div>
                        </div>

                        <div className="mt-12 text-center">
                            <p className="text-2xl font-bold text-white mb-4">
                                "We don't trust credentials; we verify context."
                            </p>
                            <p className="text-slate-400">
                                Even with valid passwords, VAJRA blocks access if behavior is suspicious.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <Sparkles className="w-12 h-12 text-red-400 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Built for Real Protection
                        </h2>
                        <p className="text-lg text-slate-300 mb-12">
                            Not just alerts—actual defense that stops attacks before they reach you
                        </p>

                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            <div>
                                <div className="text-5xl font-bold text-red-400 mb-2">99.9%</div>
                                <div className="text-slate-400">Threat Detection</div>
                            </div>
                            <div>
                                <div className="text-5xl font-bold text-orange-400 mb-2">&lt;100ms</div>
                                <div className="text-slate-400">Response Time</div>
                            </div>
                            <div>
                                <div className="text-5xl font-bold text-green-400 mb-2">24/7</div>
                                <div className="text-slate-400">Monitoring</div>
                            </div>
                        </div>

                        <Link
                            href="/command-center"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/50 transition-all"
                        >
                            Start Protecting Your Business
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>

                {/* Final CTA - Let's Work Together */}
                <LetsWorkTogether />
            </div> {/* End content wrapper */}
        </div>
    );
}
