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
import IncidentAnalyticsDashboard from "@/components/funnel-chart-big";
import { FeatureSteps } from "@/components/feature-section";

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
                            <div className="relative flex justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent rounded-2xl blur-3xl opacity-50" />
                                <div className="relative z-10 w-full max-w-lg">
                                    <IncidentAnalyticsDashboard />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* The 3-Layer Defense */}
                <section className="container mx-auto px-6 py-20 max-w-6xl">
                    <FeatureSteps
                        title="The 3-Layer Defense System"
                        autoPlayInterval={5000}
                        features={[
                            {
                                step: "Layer 1",
                                title: "Invoice Forensic Auditor",
                                content: "Scammers change bank details on PDF invoices. Our AI reads documents, extracts account numbers, and cross-references them with your 'Golden Record' of approved vendors. If a single digit is different, VAJRA flashes RED.",
                                image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000"
                            },
                            {
                                step: "Layer 2",
                                title: "Cloud-Native Code Scanner",
                                content: "Your software might have hidden backdoors. Our AI connects to GitHub, reads your entire project, and finds complex logic flaws that other tools miss. It acts like a super-smart security architect for your code.",
                                image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000"
                            },
                            {
                                step: "Layer 3",
                                title: "Impossible Travel Detector",
                                content: "If an employee logs in from India and then Russia one hour later, it's impossible. VAJRA uses physics to flag this as CRITICAL RISK and blocks access to sensitive data instantly, even if the password is correct.",
                                image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000"
                            }
                        ]}
                    />
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
