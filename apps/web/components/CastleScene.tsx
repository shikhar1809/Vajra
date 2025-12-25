"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Castle } from "./Castle"
import { Suspense } from "react"
import { useDevicePerformance } from "@/hooks/useDevicePerformance"

export default function CastleScene() {
    const { isMobile, isTablet } = useDevicePerformance();
    const isLowPerformance = isMobile || isTablet;

    return (
        <div className="w-full h-[500px] relative" style={{ willChange: 'transform' }}>
            <Canvas
                shadows={!isLowPerformance}
                camera={{ position: [20, 15, 20], fov: 50 }}
                gl={{
                    antialias: !isLowPerformance,
                    alpha: true,
                    powerPreference: isLowPerformance ? "low-power" : "high-performance"
                }}
                dpr={isLowPerformance ? [1, 1.5] : [1, 2]}
                frameloop="demand"
                style={{ background: 'transparent' }}
            >
                {/* Lighting - Simplified on mobile/tablet */}
                {isLowPerformance ? (
                    <>
                        <ambientLight intensity={0.6} />
                        <directionalLight position={[10, 20, 10]} intensity={1.5} />
                    </>
                ) : (
                    <>
                        <ambientLight intensity={0.4} />
                        <directionalLight
                            position={[10, 20, 10]}
                            intensity={1.2}
                            castShadow
                            shadow-mapSize-width={1024}
                            shadow-mapSize-height={1024}
                            shadow-camera-far={50}
                            shadow-camera-left={-20}
                            shadow-camera-right={20}
                            shadow-camera-top={20}
                            shadow-camera-bottom={-20}
                        />
                        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#ff8800" />
                        <pointLight position={[10, 5, 10]} intensity={0.3} color="#4488ff" />
                    </>
                )}

                {/* Castle */}
                <Suspense fallback={null}>
                    <Castle />
                </Suspense>

                {/* Interactive camera controls - Optimized for mobile */}
                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={15}
                    maxDistance={40}
                    maxPolarAngle={Math.PI / 2.2}
                    autoRotate
                    autoRotateSpeed={isLowPerformance ? 0.3 : 0.5}
                    enableDamping={!isLowPerformance}
                    dampingFactor={0.05}
                    zoomSpeed={isLowPerformance ? 0.5 : 1}
                />
            </Canvas>

            {/* Instructions overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-sm text-center">
                <p>Drag to rotate • Scroll to zoom</p>
            </div>
        </div>
    )
}
