"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Castle } from "./Castle"
import { Suspense } from "react"

export default function CastleScene() {
    return (
        <div className="w-full h-[500px] relative">
            <Canvas
                shadows
                camera={{ position: [20, 15, 20], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-camera-far={50}
                    shadow-camera-left={-20}
                    shadow-camera-right={20}
                    shadow-camera-top={20}
                    shadow-camera-bottom={-20}
                />
                <pointLight position={[-10, 10, -10]} intensity={0.5} color="#ff8800" />
                <pointLight position={[10, 5, 10]} intensity={0.3} color="#4488ff" />

                {/* Castle */}
                <Suspense fallback={null}>
                    <Castle />
                </Suspense>

                {/* Interactive camera controls */}
                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={15}
                    maxDistance={40}
                    maxPolarAngle={Math.PI / 2.2}
                    autoRotate
                    autoRotateSpeed={0.5}
                />
            </Canvas>

            {/* Instructions overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-sm text-center">
                <p>Drag to rotate • Scroll to zoom</p>
            </div>
        </div>
    )
}
