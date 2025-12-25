"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function DefenseArrows() {
    const arrowPaths: [number, number, number, number, number, number][] = [
        [-6, 4.5, -4, -10, 1, -10],
        [-6, 4.5, 0, -11, 1.5, -5],
        [6, 4.5, 4, 12, 1.2, 9],
        [6, 4.5, 0, 10, 1, -8],
        [0, 4.5, -6, -8, 1.8, -12],
        [4, 4.5, -6, 9, 1.5, -11],
        [-4, 4.5, 6, -7, 1.3, 10],
        [0, 4.5, 6, 5, 1.6, 11],
    ]

    return (
        <>
            {arrowPaths.map(([x1, y1, z1, x2, y2, z2], i) => (
                <Arrow key={`arrow-${i}`} start={[x1, y1, z1]} end={[x2, y2, z2]} delay={i * 0.3} />
            ))}
        </>
    )
}

function Arrow({
    start,
    end,
    delay,
}: { start: [number, number, number]; end: [number, number, number]; delay: number }) {
    const arrowRef = useRef<THREE.Group>(null)

    useFrame(({ clock }) => {
        if (arrowRef.current) {
            const time = (clock.getElapsedTime() + delay) % 2
            const t = time / 2

            arrowRef.current.position.x = start[0] + (end[0] - start[0]) * t
            arrowRef.current.position.y = start[1] + (end[1] - start[1]) * t + Math.sin(t * Math.PI) * 2
            arrowRef.current.position.z = start[2] + (end[2] - start[2]) * t

            const dx = end[0] - start[0]
            const dy = end[1] - start[1]
            const dz = end[2] - start[2]
            const angleY = Math.atan2(dx, dz)
            const angleX = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) - Math.PI / 6

            arrowRef.current.rotation.set(angleX, angleY, 0)

            if (t > 0.95) {
                arrowRef.current.visible = false
            } else {
                arrowRef.current.visible = true
            }
        }
    })

    return (
        <group ref={arrowRef}>
            <mesh position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.015, 0.015, 0.6, 8]} />
                <meshStandardMaterial color="#6d4c41" roughness={0.8} />
            </mesh>

            <mesh position={[0, 0.32, 0]} castShadow>
                <coneGeometry args={[0.03, 0.1, 8]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
            </mesh>

            <mesh position={[0, -0.28, 0]} castShadow>
                <coneGeometry args={[0.04, 0.08, 3]} />
                <meshStandardMaterial color="#ff5252" roughness={0.9} />
            </mesh>

            <pointLight position={[0, 0, 0]} intensity={0.5} color="#ffaa00" distance={1.5} decay={2} />
        </group>
    )
}
