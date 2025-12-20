"use client"

import { Html } from "@react-three/drei"
import { CastleStructure } from "./castle/CastleStructure"
import { BattleEnemies } from "./castle/BattleEnemies"
import { CastleGuards } from "./castle/CastleGuards"
import { DefenseArrows } from "./castle/DefenseArrows"
import { useDevicePerformance } from "@/hooks/useDevicePerformance"

export function Castle() {
    const { isMobile, isTablet, isDesktop } = useDevicePerformance();
    const isLowPerformance = isMobile || isTablet;

    return (
        <group position={[0, 0, 0]}>
            {/* Optimized Lighting Setup - Reduced for mobile/tablet */}
            {isLowPerformance ? (
                <>
                    {/* Mobile/Tablet: Minimal lighting (4 lights total) */}
                    <ambientLight intensity={1.5} />

                    {/* Main directional light (no shadows on mobile) */}
                    <directionalLight
                        position={[15, 25, 15]}
                        intensity={2.8}
                    />

                    {/* Accent lights for depth */}
                    <pointLight position={[0, 15, 0]} intensity={2.2} color="#ffcc88" distance={30} decay={1.5} />
                    <pointLight position={[-10, 10, -10]} intensity={1.5} color="#ffaa66" distance={25} decay={2} />
                </>
            ) : (
                <>
                    {/* Desktop: Enhanced Lighting Setup */}
                    <ambientLight intensity={1.2} />

                    {/* Main directional light (sun) with shadows */}
                    <directionalLight
                        position={[15, 25, 15]}
                        intensity={2.5}
                        castShadow
                        shadow-mapSize-width={1024}
                        shadow-mapSize-height={1024}
                        shadow-camera-left={-20}
                        shadow-camera-right={20}
                        shadow-camera-top={20}
                        shadow-camera-bottom={-20}
                    />

                    {/* Secondary directional lights */}
                    <directionalLight position={[-15, 20, -10]} intensity={1.8} />
                    <directionalLight position={[-10, 15, -10]} intensity={1.2} />

                    {/* Top light for better visibility */}
                    <pointLight position={[0, 30, 0]} intensity={2.5} distance={60} decay={1.5} />

                    {/* Spotlights on castle corners */}
                    <spotLight position={[10, 20, 10]} intensity={1.5} angle={0.6} penumbra={0.5} />
                    <spotLight position={[-10, 20, 10]} intensity={1.5} angle={0.6} penumbra={0.5} />
                    <spotLight position={[10, 20, -10]} intensity={1.5} angle={0.6} penumbra={0.5} />
                    <spotLight position={[-10, 20, -10]} intensity={1.5} angle={0.6} penumbra={0.5} />

                    {/* Warm accent lights on corners */}
                    <pointLight position={[-6, 8, -6]} intensity={1.5} color="#ffaa66" distance={20} decay={2} />
                    <pointLight position={[6, 8, -6]} intensity={1.5} color="#ffaa66" distance={20} decay={2} />
                    <pointLight position={[-6, 8, 6]} intensity={1.5} color="#ffaa66" distance={20} decay={2} />
                    <pointLight position={[6, 8, 6]} intensity={1.5} color="#ffaa66" distance={20} decay={2} />

                    {/* Central castle glow */}
                    <pointLight position={[0, 10, 0]} intensity={2} color="#ffcc88" distance={25} decay={1.8} />

                    {/* Fill lights around the scene */}
                    <pointLight position={[15, 10, 0]} intensity={1.2} distance={40} decay={2} />
                    <pointLight position={[-15, 10, 0]} intensity={1.2} distance={40} decay={2} />
                    <pointLight position={[0, 10, 15]} intensity={1.2} distance={40} decay={2} />
                    <pointLight position={[0, 10, -15]} intensity={1.2} distance={40} decay={2} />
                </>
            )}

            {/* Interactive HTML Labels - Simplified on mobile */}
            <Html position={[8, 12, 0]} center>
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <div
                        className="text-4xl font-bold text-white tracking-wider"
                        style={{
                            textShadow: isLowPerformance
                                ? "0 2px 10px rgba(0,0,0,0.9)"
                                : "0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)"
                        }}
                    >
                        YOUR DIGITAL CASTLE
                    </div>
                    {!isLowPerformance && (
                        <svg width="100" height="80" viewBox="0 0 100 80" className="drop-shadow-2xl">
                            <defs>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <path
                                d="M 10 10 L 60 40 L 10 70"
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#glow)"
                            />
                            <circle cx="60" cy="40" r="8" fill="#ffffff" filter="url(#glow)" />
                        </svg>
                    )}
                </div>
            </Html>

            <Html position={[-8, 3, -12]} center>
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                    {!isLowPerformance && (
                        <svg width="80" height="60" viewBox="0 0 80 60" className="drop-shadow-2xl">
                            <defs>
                                <filter id="glowRed">
                                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <path
                                d="M 70 10 L 20 30 L 70 50"
                                fill="none"
                                stroke="#ff4444"
                                strokeWidth="5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#glowRed)"
                            />
                            <circle cx="20" cy="30" r="6" fill="#ff4444" filter="url(#glowRed)" />
                        </svg>
                    )}
                    <div
                        className="text-3xl font-bold text-red-500 tracking-wide"
                        style={{
                            textShadow: isLowPerformance
                                ? "0 2px 10px rgba(0,0,0,0.9)"
                                : "0 0 15px rgba(0,0,0,0.9), 0 0 30px rgba(255,0,0,0.5)"
                        }}
                    >
                        CYBERATTACKS
                    </div>
                </div>
            </Html>

            {/* Castle Structure */}
            <CastleStructure />

            {/* Battle Scene Components */}
            <BattleEnemies />
            <CastleGuards />
            <DefenseArrows />
        </group>
    )
}
