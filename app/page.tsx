"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Shield, Search, Eye, Code, ArrowRight } from "lucide-react";
import FuzzyText from "@/components/FuzzyText";
import CountUp from "@/components/CountUp";
import TrueFocus from "@/components/TrueFocus";
import BlurText from "@/components/BlurText";
import LazyComponent from "@/components/LazyComponent";

// Dynamic imports with loading states for 3D components (no SSR)
const LightPillar = dynamic(() => import("@/components/LightPillar"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-black" />
});

const CastleScene = dynamic(() => import("@/components/CastleScene"), {
    ssr: false,
    loading: () => <div className="w-full h-64 bg-black/50 rounded-xl animate-pulse" />
});

const Lanyard = dynamic(() => import("@/components/Lanyard"), {
    ssr: false,
    loading: () => <div className="w-full h-screen flex items-center justify-center" />
});

const Ribbons = dynamic(() => import("@/components/Ribbons"), {
    ssr: false,
    loading: () => null
});

// Lazy load heavy below-fold components
const StoryFeatures = dynamic(() => import("@/components/StoryFeatures"), {
    loading: () => <div className="w-full h-screen bg-black/50 animate-pulse" />
});

const LetsWorkTogether = dynamic(() => import("@/components/lets-work-section").then(mod => ({ default: mod.LetsWorkTogether })), {
    loading: () => <div className="w-full h-screen bg-black/50 animate-pulse" />
});

const Footer = dynamic(() => import("@/components/Footer"), {
    loading: () => null
});

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
            {/* Red Light Pillar Background */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 0 }}>
                <LightPillar
                    topColor="#ef4444"
                    bottomColor="#dc2626"
                    intensity={1.0}
                    rotationSpeed={0.3}
                    glowAmount={0.005}
                    pillarWidth={3.0}
                    pillarHeight={0.4}
                    noiseIntensity={0.5}
                    pillarRotation={0}
                    interactive={false}
                    mixBlendMode="normal"
                />
            </div>

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
            <section className="container mx-auto px-6 pb-20 max-w-6xl relative z-10">
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
                        <div className="text-8xl md:text-9xl font-black text-white mb-2">
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
                    <div className="mb-6">
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            MAKE YOUR BUSINESS A<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-red-100 to-white">
                                DIGITAL FORTRESS
                            </span>
                        </h1>
                    </div>

                    {/* Interactive 3D Castle */}
                    <div className="mb-8">
                        <CastleScene />
                    </div>

                    <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
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

                {/* Static Text Section - Center */}
                <div className="text-center mb-20">
                    <div className="flex items-center justify-center gap-6">
                        <TrueFocus
                            sentence="DATA PROTECTION"
                            manualMode={false}
                            blurAmount={5}
                            borderColor="#ef4444"
                            glowColor="rgba(239, 68, 68, 0.6)"
                            animationDuration={1}
                            pauseBetweenAnimations={0.5}
                        />
                    </div>
                    <p className="text-white mt-6 text-lg max-w-2xl mx-auto">
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

            {/* Core Modules Showcase - Lazy loaded */}
            <LazyComponent rootMargin="100px">
                <section className="w-full">
                    <StoryFeatures />
                </section>
            </LazyComponent>

            {/* Call to Action - Let's Work Together - Lazy loaded */}
            <LazyComponent rootMargin="100px">
                <section className="w-full">
                    <LetsWorkTogether />
                </section>
            </LazyComponent>

            {/* Footer - Creator Credit */}
            <Footer />
        </div>
    );
}
