"use client";

import dynamic from "next/dynamic";
import { Shield } from "lucide-react";
import BlurText from "@/components/BlurText";

// Dynamic imports with loading states for 3D components (no SSR)
const LightPillar = dynamic(() => import("@/components/LightPillar"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-black" />
});

const Lanyard = dynamic(() => import("@/components/Lanyard"), {
    ssr: false,
    loading: () => <div className="w-full h-screen flex items-center justify-center" />
});

const Ribbons = dynamic(() => import("@/components/Ribbons"), {
    ssr: false,
    loading: () => null
});

const Footer = dynamic(() => import("@/components/Footer"), {
    loading: () => null
});

export default function HomePage() {
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

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full mb-6">
                        <Shield className="w-4 h-4 text-red-400" />
                        <span className="text-red-300 text-sm font-medium">Portfolio Showcase</span>
                    </div>

                    {/* Main Message */}
                    <div className="mb-6">
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            SHIKHAR SHARMA<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-red-100 to-white">
                                FULL STACK DEVELOPER
                            </span>
                        </h1>
                    </div>

                    <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
                        Building innovative solutions with cutting-edge technology
                    </p>
                </div>
            </section>

            {/* Footer - Creator Credit */}
            <Footer />
        </div>
    );
}
