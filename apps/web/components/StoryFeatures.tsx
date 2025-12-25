"use client";

import { useState, useEffect } from "react";
import { Shield, Search, Eye, Code, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ContainerScroll } from "./ui/container-scroll-animation";

const features = [
    {
        id: "shield",
        step: 1,
        title: "Shield",
        subtitle: "The Perimeter Defense",
        description: "Your digital perimeter is under constant siege. Traffic floods in—most is legitimate, but hidden within the noise are threats waiting to strike. Shield stands guard 24/7, analyzing every packet in real-time.",
        icon: Shield,
        href: "/shield",
        stats: "Blocked 1.2M threats today",
        gradient: "from-red-600/80 via-red-700/60 to-black/80"
    },
    {
        id: "scout",
        step: 2,
        title: "Scout",
        subtitle: "The Trojan Horse",
        description: "Your vendors and partners have access to your fortress. Are they secure? Scout scans their digital footprint, revealing risks before they become your breaches.",
        icon: Search,
        href: "/scout",
        stats: "Scanned 500+ vendors",
        gradient: "from-orange-600/80 via-red-600/60 to-black/80"
    },
    {
        id: "sentry",
        step: 3,
        title: "Sentry",
        subtitle: "The Enemy Within",
        description: "One email. One malicious link. One click is all it takes to compromise your entire network. Sentry watches every inbox, detecting phishing attempts that bypass traditional filters.",
        icon: Eye,
        href: "/sentry",
        stats: "Filtered 99.9% of phishing",
        gradient: "from-rose-600/80 via-red-500/60 to-black/80"
    },
    {
        id: "agenios",
        step: 4,
        title: "Agenios",
        subtitle: "The Invisible Flaw",
        description: "Your code is complex. Vulnerabilities hide in the shadows of dependencies and legacy functions. Agenios hunts them down with automated precision before hackers can find them.",
        icon: Code,
        href: "/agenios",
        stats: "Found 0 critical vulnerabilities",
        gradient: "from-pink-600/80 via-red-600/60 to-black/80"
    }
];

export default function StoryFeatures() {
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto-rotate every 7 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % features.length);
        }, 7000);

        return () => clearInterval(interval);
    }, []);

    const handlePrevious = () => {
        setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % features.length);
    };

    const activeFeature = features[activeIndex];

    return (
        <div className="w-full">
            <ContainerScroll
                titleComponent={
                    <div className="space-y-4">
                        <h2 className="text-6xl md:text-8xl font-black text-white tracking-tight">
                            4 STEPS TO
                        </h2>
                        <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-red-500 tracking-tight">
                            DATA PRIVACY
                        </h2>
                    </div>
                }
            >
                <div className={`relative h-full w-full bg-gradient-to-br ${activeFeature.gradient} rounded-xl overflow-hidden transition-all duration-500`}>
                    {/* Background Icon */}
                    <div className="absolute top-8 right-8 opacity-5">
                        <activeFeature.icon className="w-64 h-64 text-white" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-12">
                        {/* Header */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-bold mb-6">
                                <activeFeature.icon className="w-5 h-5" />
                                <span>STEP {activeFeature.step}</span>
                            </div>

                            <h3 className="text-5xl md:text-6xl font-black mb-4 leading-tight text-white">
                                {activeFeature.title}
                            </h3>

                            <h4 className="text-2xl md:text-3xl font-bold text-red-400 mb-6 italic">
                                {activeFeature.subtitle}
                            </h4>

                            <p className="text-lg md:text-xl text-slate-200 leading-relaxed max-w-3xl">
                                {activeFeature.description}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                            <Link
                                href={activeFeature.href}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-red-900/30"
                            >
                                Explore {activeFeature.title}
                                <ChevronRight className="w-5 h-5" />
                            </Link>

                            <div className="text-sm text-slate-400 font-mono">
                                {activeFeature.stats}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                        <button
                            onClick={handlePrevious}
                            className="p-3 bg-black/50 hover:bg-black/70 border border-red-500/30 hover:border-red-500/50 rounded-full transition-all backdrop-blur-sm"
                            aria-label="Previous feature"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="flex gap-2">
                            {features.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${index === activeIndex
                                        ? "bg-red-500 w-8"
                                        : "bg-white/30 hover:bg-white/50"
                                        }`}
                                    aria-label={`Go to step ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="p-3 bg-black/50 hover:bg-black/70 border border-red-500/30 hover:border-red-500/50 rounded-full transition-all backdrop-blur-sm"
                            aria-label="Next feature"
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            </ContainerScroll>
        </div>
    );
}
