"use client";

import { Canvas } from '@react-three/fiber';
import { useState, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';

function SimpleCard() {
    return (
        <mesh position={[0, 0, 0]} rotation={[0, 0.5, 0]}>
            <boxGeometry args={[2, 1.2, 0.05]} />
            <meshStandardMaterial color="#ef4444" />
        </mesh>
    );
}

export default function IDCard() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        console.log('IDCard component mounted');
    }, []);

    if (!mounted) {
        console.log('IDCard waiting for mount');
        return null;
    }

    console.log('IDCard rendering canvas');

    return (
        <div
            className="fixed top-20 right-20 w-96 h-96 border-4 border-red-500 bg-black/50 z-50"
            style={{ pointerEvents: 'auto' }}
        >
            <div className="text-white p-4">ID Card Debug</div>
            <Canvas
                camera={{ position: [0, 0, 4], fov: 50 }}
                style={{ width: '100%', height: '100%' }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <SimpleCard />
                <OrbitControls />
            </Canvas>
        </div>
    );
}
