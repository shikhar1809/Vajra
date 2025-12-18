"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Search, Eye, Code, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import FuzzyText from "@/components/FuzzyText";
import DecryptedText from "@/components/DecryptedText";
import SimpleCard from "@/components/SimpleCard";
import CountUp from "@/components/CountUp";
import TargetCursor from "@/components/TargetCursor";
import Lanyard from "@/components/Lanyard";
import BlurText from "@/components/BlurText";
import Ribbons from "@/components/Ribbons";

export default function HomePage() {
    const [activeModule, setActiveModule] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveModule((prev) => (prev + 1) % 4);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const modules = [
        {
            icon: Shield,
            name: "Shield",
            title: "Stop Attacks Before They Happen",
            description: "AI watches your traffic 24/7, blocking threats in real-time",
            color: "red",
            href: "/shield",
        },
        {
            icon: Search,
            name: "Scout",
            title: "Know Who You Trust",
            description: "Scan vendors and partners for security risks automatically",
            color: "orange",
            href: "/scout",
        },
        {
            icon: Eye,
            name: "Sentry",
            title: "Protect Your Team",
            description: "Detect phishing emails and malicious links instantly",
            color: "rose",
            href: "/sentry",
        },
        {
            icon: Code,
            name: "Agenios",
            title: "Find Vulnerabilities First",
            description: "Automated security testing finds bugs before hackers do",
            color: "pink",
            href: "/agenios/scan",
        },
    ];

    const getColorClasses = (color: string) => {
        const colors = {
            red: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
            orange: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
            rose: "from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700",
            pink: "from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700",
        };
        return colors[color as keyof typeof colors];
    };

    return (
        <div className="min-h-screen bg-black">
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

            {/* Lanyard ID Card - Disabled due to corrupted GLB file */}
            {/* <div className="fixed top-0 left-0 w-full h-screen z-40" style={{ pointerEvents: 'auto' }}>
                <Lanyard position={[0, 0, 15]} gravity={[0, -30, 0]} fov={30} />
            </div> */}

            {/* Simple Hero */}
            <section className="container mx-auto px-6 pb-20 max-w-6xl">
                <div className="text-center mb-16">
                    {/* Lanyard ID Card - Full viewport on load */}
                    <div className="mb-6 h-screen flex flex-col items-center justify-center">
                        <Lanyard position={[0, 0, 15]} gravity={[0, -30, 0]} fov={30} />

                        {/* Blur Text below ID card */}
                        <div className="-mt-40">
                            <BlurText
                                text="HIRE TODAY"
                                delay={150}
                                animateBy="words"
                                direction="bottom"
                                className="text-4xl md:text-5xl font-bold text-white"
                            />
                        </div>
                    </div>

                    {/* Content appears on scroll */}
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full mb-6">
                        <Shield className="w-4 h-4 text-red-400" />
                        <span className="text-red-300 text-sm font-medium">Enterprise Security Made Simple</span>
                    </div>

                    {/* CountUp Stat */}
                    <div className="mb-8">
                        <div className="text-8xl md:text-9xl font-black text-red-500 mb-2">
                            <CountUp
                                from={0}
                                to={95}
                                duration={2.5}
                                className="inline-block"
                            />
                            <span>%</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-semibold text-white">
                            Cyber-Attack Aversion
                        </p>
                    </div>

                    {/* Main Message */}
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Your Digital Fortress
                    </h1>

                    <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                        Four powerful tools working together to keep your business safe from cyber threats
                    </p>

                    {/* Simple CTA */}
                    <Link
                        href="/shield"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-red-500/50 transition-all hover:from-red-600 hover:to-red-700"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* DecryptedText Section - Center */}
                <div className="text-center mb-20">
                    <div className="inline-block min-w-[800px]">
                        <DecryptedText
                            text="YOUR BUSINESS DATA"
                            hoverText="PROTECTED"
                            animateOn="both"
                            revealDirection="center"
                            speed={80}
                            maxIterations={8}
                            sequential={true}
                            className="text-6xl md:text-7xl font-black text-white encrypted"
                            parentClassName="inline-block cursor-pointer"
                        />
                    </div>
                    <p className="text-slate-400 mt-6 text-lg max-w-2xl mx-auto">
                        With Vajra's AI-powered protection, cyber threats are neutralized before they can harm your business
                    </p>
                </div>

                {/* Fuzzy Text Section */}
                <div className="flex items-center justify-center gap-12 mb-16 flex-wrap">
                    <div className="flex flex-col items-center">
                        <FuzzyText
                            baseIntensity={0.2}
                            hoverIntensity={0.6}
                            enableHover={true}
                            fontSize="clamp(4rem, 12vw, 10rem)"
                            color="#ef4444"
                        >
                            404
                        </FuzzyText>
                    </div>
                    <div className="max-w-md text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white mb-3">
                            Never See This Message Again
                        </h3>
                        <p className="text-slate-300 mb-4">
                            With Vajra protection, threats are blocked before they reach you.
                            Say goodbye to security errors and hello to peace of mind.
                        </p>
                        <div className="flex items-center gap-2 text-red-400">
                            <Shield className="w-5 h-5" />
                            <span className="font-semibold">Protected by Vajra</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Modules Showcase with TargetCursor */}
            <TargetCursor
                spinDuration={2}
                hideDefaultCursor={true}
                parallaxOn={true}
            />

            <section className="container mx-auto px-6 py-20 max-w-6xl">
                <div className="mb-20">
                    <h2 className="text-4xl font-bold text-white text-center mb-12">
                        Core Security Modules
                    </h2>

                    {/* Shield - Full Width */}
                    <Link href="/shield" className="cursor-target block mb-6">
                        <div className="group relative p-8 bg-gradient-to-r from-red-900/20 to-red-800/20 border-2 border-red-500/30 rounded-2xl hover:border-red-500 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/20">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-4 flex items-center justify-center">
                                    <Shield className="w-full h-full text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-3xl font-bold text-white mb-2">SHIELD</h3>
                                    <p className="text-slate-300 text-lg">
                                        Real-time traffic monitoring and threat detection with AI-powered anomaly analysis
                                    </p>
                                </div>
                                <ArrowRight className="w-8 h-8 text-red-400 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Sentry, Scout, Agenios - 3 Equal Boxes */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Sentry */}
                        <Link href="/sentry" className="cursor-target block">
                            <div className="group relative h-full p-6 bg-gradient-to-br from-rose-900/20 to-rose-800/20 border-2 border-rose-500/30 rounded-2xl hover:border-rose-500 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/20">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 p-3 mb-4 flex items-center justify-center">
                                    <Eye className="w-full h-full text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">SENTRY</h3>
                                <p className="text-slate-300 mb-4">
                                    Email security and phishing detection to protect your team
                                </p>
                                <div className="flex items-center gap-2 text-rose-400 font-semibold">
                                    Explore
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>

                        {/* Scout */}
                        <Link href="/scout" className="cursor-target block">
                            <div className="group relative h-full p-6 bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-2 border-orange-500/30 rounded-2xl hover:border-orange-500 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-3 mb-4 flex items-center justify-center">
                                    <Search className="w-full h-full text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">SCOUT</h3>
                                <p className="text-slate-300 mb-4">
                                    Third-party vendor risk assessment and compliance tracking
                                </p>
                                <div className="flex items-center gap-2 text-orange-400 font-semibold">
                                    Explore
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>

                        {/* Agenios */}
                        <Link href="/agenios/scan" className="cursor-target block">
                            <div className="group relative h-full p-6 bg-gradient-to-br from-pink-900/20 to-pink-800/20 border-2 border-pink-500/30 rounded-2xl hover:border-pink-500 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/20">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 p-3 mb-4 flex items-center justify-center">
                                    <Code className="w-full h-full text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">AGENIOS</h3>
                                <p className="text-slate-300 mb-4">
                                    Automated vulnerability scanning and penetration testing
                                </p>
                                <div className="flex items-center gap-2 text-pink-400 font-semibold">
                                    Explore
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* The Story - 4 Simple Cards */}
                <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {modules.map((module, i) => (
                        <Link key={i} href={module.href}>
                            <div className={`group relative p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 ${activeModule === i
                                ? 'border-red-500 shadow-xl shadow-red-500/20 scale-[1.02]'
                                : 'border-slate-700 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10'
                                }`}>
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getColorClasses(module.color)} p-3 mb-4 transition-transform group-hover:scale-110`}>
                                    <module.icon className="w-full h-full text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-white mb-2">{module.title}</h3>
                                <p className="text-slate-300 mb-4">{module.description}</p>

                                {/* Simple Arrow */}
                                <div className="flex items-center gap-2 text-red-400 font-semibold group-hover:gap-3 transition-all">
                                    Try {module.name}
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Simple How It Works */}
            <section className="bg-slate-800/50 py-20 border-y border-slate-700">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            How Vajra Protects You
                        </h2>
                        <p className="text-lg text-slate-300">
                            Three simple steps to complete security
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Step 1 */}
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                <span className="text-red-400 font-bold text-lg">1</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Connect Your Systems</h3>
                                <p className="text-slate-300">Link your website, vendors, and team in minutes. No complex setup required.</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                                <span className="text-orange-400 font-bold text-lg">2</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">AI Monitors Everything</h3>
                                <p className="text-slate-300">Our intelligent systems watch for threats 24/7, learning and adapting constantly.</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                                <span className="text-green-400 font-bold text-lg">3</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Stay Protected</h3>
                                <p className="text-slate-300">Get instant alerts when threats are detected and blocked automatically.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Trust Section */}
            <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800" >
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <Sparkles className="w-12 h-12 text-red-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Built for Real Protection
                    </h2>
                    <p className="text-lg text-slate-300 mb-8">
                        Not just alerts—actual defense that stops attacks before they reach you
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <div>
                            <div className="text-4xl font-bold text-red-400 mb-2">99.9%</div>
                            <div className="text-slate-400">Threat Detection</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-orange-400 mb-2">&lt;100ms</div>
                            <div className="text-slate-400">Response Time</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
                            <div className="text-slate-400">Monitoring</div>
                        </div>
                    </div>

                    <Link
                        href="/shield"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/50 transition-all"
                    >
                        Start Protecting Your Business
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Final CTA */}
            <section className="container mx-auto px-6 py-20 max-w-4xl text-center">
                <h2 className="text-4xl font-bold text-white mb-6">
                    Ready to Secure Your Future?
                </h2>
                <p className="text-xl text-slate-300 mb-10">
                    Join the businesses that trust Vajra to keep them safe from the ever-evolving cyber threat landscape.
                </p>

                <Link
                    href="/shield"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/50 transition-all"
                >
                    Start Protecting Your Business
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </section>
        </div>
    );
}
