"use client"

import * as THREE from "three"

export function CastleGuards() {
    const guardPositions: [number, number, number, number][] = [
        [-6, 4, -4, -Math.PI / 2],
        [-6, 4, 0, -Math.PI / 2],
        [-6, 4, 4, -Math.PI / 2],
        [6, 4, -4, Math.PI / 2],
        [6, 4, 0, Math.PI / 2],
        [6, 4, 4, Math.PI / 2],
        [-4, 4, -6, 0],
        [0, 4, -6, 0],
        [4, 4, -6, 0],
        [-4, 4, 6, Math.PI],
        [0, 4, 6, Math.PI],
        [4, 4, 6, Math.PI],
    ]

    return (
        <>
            {guardPositions.map(([x, y, z, rotation], i) => (
                <Guard key={`guard-${i}`} position={[x, y, z]} rotation={rotation} />
            ))}
        </>
    )
}

function Guard({ position, rotation }: { position: [number, number, number]; rotation: number }) {
    return (
        <group position={position} rotation={[0, rotation, 0]}>
            <mesh position={[0, 0, 0]} castShadow>
                <capsuleGeometry args={[0.12, 0.35, 8, 16]} />
                <meshStandardMaterial color="#1565c0" roughness={0.4} metalness={0.6} />
            </mesh>

            <mesh position={[0, 0.32, 0]} castShadow>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
            </mesh>

            <mesh position={[0, 0.38, 0]} castShadow>
                <sphereGeometry args={[0.11, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
            </mesh>

            <mesh position={[0, 0.5, 0]} castShadow>
                <coneGeometry args={[0.05, 0.15, 8]} />
                <meshStandardMaterial color="#ff0000" roughness={0.8} />
            </mesh>

            <mesh position={[0.15, 0.1, 0]} rotation={[0, 0, -0.6]} castShadow>
                <capsuleGeometry args={[0.04, 0.25, 8, 16]} />
                <meshStandardMaterial color="#1565c0" roughness={0.4} metalness={0.5} />
            </mesh>
            <mesh position={[-0.15, 0.1, 0]} rotation={[0, 0, 0.6]} castShadow>
                <capsuleGeometry args={[0.04, 0.25, 8, 16]} />
                <meshStandardMaterial color="#1565c0" roughness={0.4} metalness={0.5} />
            </mesh>

            <mesh position={[0, 0.15, 0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.15, 0.015, 8, 16, Math.PI]} />
                <meshStandardMaterial color="#4a2c1f" roughness={0.8} />
            </mesh>

            <mesh position={[0.06, -0.28, 0]} castShadow>
                <capsuleGeometry args={[0.05, 0.25, 8, 16]} />
                <meshStandardMaterial color="#0d47a1" roughness={0.5} />
            </mesh>
            <mesh position={[-0.06, -0.28, 0]} castShadow>
                <capsuleGeometry args={[0.05, 0.25, 8, 16]} />
                <meshStandardMaterial color="#0d47a1" roughness={0.5} />
            </mesh>
        </group>
    )
}
