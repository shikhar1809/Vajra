"use client"

import * as THREE from "three"

export function BattleEnemies() {
    const enemyPositions: [number, number, number][] = []

    // Ring of enemies around the castle
    for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2
        const distance = 9 + Math.random() * 2
        const x = Math.cos(angle) * distance
        const z = Math.sin(angle) * distance
        enemyPositions.push([x, 0, z])
    }

    const climbingPositions: [number, number, number, string][] = [
        [-6, 1.5, -3, "left"],
        [-6, 2, 2, "left"],
        [6, 1.8, -2, "right"],
        [6, 1.3, 4, "right"],
        [-3, 1.6, -6, "front"],
        [2, 2.2, -6, "front"],
        [-4, 1.4, 6, "back"],
        [3, 2.1, 6, "back"],
    ]

    return (
        <>
            {enemyPositions.map((pos, i) => (
                <group key={`enemy-${i}`}>
                    <Enemy position={pos} />
                    <pointLight position={[pos[0], pos[1] + 1, pos[2]]} intensity={0.8} color="#ff3333" distance={3} decay={2} />
                </group>
            ))}

            {climbingPositions.map((pos, i) => (
                <group key={`climbing-${i}`}>
                    <ClimbingEnemy position={[pos[0], pos[1], pos[2]]} wall={pos[3]} />
                    <pointLight
                        position={[pos[0], pos[1] + 0.5, pos[2]]}
                        intensity={1}
                        color="#ff3333"
                        distance={2.5}
                        decay={2}
                    />
                </group>
            ))}
        </>
    )
}

function Enemy({ position }: { position: [number, number, number] }) {
    const angle = Math.atan2(position[2], position[0])

    return (
        <group position={position} rotation={[0, angle, 0]}>
            <mesh position={[0, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.2, 0.6, 8]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.3} />
            </mesh>

            <mesh position={[0, 0.75, 0]} castShadow>
                <sphereGeometry args={[0.18, 8, 8]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
            </mesh>

            <mesh position={[0, 0.85, 0]} castShadow>
                <coneGeometry args={[0.2, 0.15, 6]} />
                <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.3} />
            </mesh>

            <mesh position={[0.15, 0.6, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
                <meshStandardMaterial color="#3a2817" roughness={0.9} />
            </mesh>

            <mesh position={[0.3, 1.15, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
                <coneGeometry args={[0.05, 0.15, 4]} />
                <meshStandardMaterial color="#555555" metalness={0.9} roughness={0.2} />
            </mesh>

            <mesh position={[-0.2, 0.5, 0]} rotation={[0, Math.PI / 6, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.15, 0.05, 6]} />
                <meshStandardMaterial color="#8b0000" metalness={0.4} roughness={0.6} />
            </mesh>

            <mesh position={[-0.22, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
            </mesh>

            <mesh position={[0.08, 0.1, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.04, 0.25, 6]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
            </mesh>
            <mesh position={[-0.08, 0.1, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.04, 0.25, 6]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
            </mesh>

            <mesh position={[0.08, 0.78, 0.15]} castShadow>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
            </mesh>
            <mesh position={[-0.08, 0.78, 0.15]} castShadow>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
            </mesh>
        </group>
    )
}

function ClimbingEnemy({ position, wall }: { position: [number, number, number]; wall: string }) {
    let rotation = 0
    if (wall === "front") rotation = 0
    else if (wall === "right") rotation = Math.PI / 2
    else if (wall === "back") rotation = Math.PI
    else if (wall === "left") rotation = -Math.PI / 2

    return (
        <group position={position} rotation={[Math.PI / 6, rotation + Math.PI, 0]}>
            <mesh position={[0, 0, 0]} castShadow>
                <capsuleGeometry args={[0.15, 0.4, 8, 16]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.4} />
            </mesh>

            <mesh position={[0, 0.4, 0]} castShadow>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial color="#0d0d0d" roughness={0.7} />
            </mesh>

            <mesh position={[0, 0.45, 0]} castShadow>
                <sphereGeometry args={[0.13, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.3} />
            </mesh>

            <mesh position={[0.06, 0.42, 0.09]} castShadow>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
            </mesh>
            <mesh position={[-0.06, 0.42, 0.09]} castShadow>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
            </mesh>

            <mesh position={[0.12, 0.5, 0]} rotation={[0, 0, -0.8]} castShadow>
                <capsuleGeometry args={[0.05, 0.35, 8, 16]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
            </mesh>
            <mesh position={[-0.12, 0.5, 0]} rotation={[0, 0, 0.8]} castShadow>
                <capsuleGeometry args={[0.05, 0.35, 8, 16]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
            </mesh>

            <mesh position={[0.08, -0.35, 0]} rotation={[0.3, 0, 0]} castShadow>
                <capsuleGeometry args={[0.06, 0.3, 8, 16]} />
                <meshStandardMaterial color="#0d0d0d" roughness={0.7} />
            </mesh>
            <mesh position={[-0.08, -0.35, 0]} rotation={[-0.3, 0, 0]} castShadow>
                <capsuleGeometry args={[0.06, 0.3, 8, 16]} />
                <meshStandardMaterial color="#0d0d0d" roughness={0.7} />
            </mesh>

            <mesh position={[0, 0, -0.18]} castShadow>
                <cylinderGeometry args={[0.12, 0.12, 0.04, 8]} />
                <meshStandardMaterial color="#1a0000" metalness={0.8} roughness={0.4} />
            </mesh>
        </group>
    )
}
