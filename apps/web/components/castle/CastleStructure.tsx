"use client"

import { useRef } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import { TextureLoader } from "three"
import * as THREE from "three"

export function CastleStructure() {
    return (
        <group>
            <SquareWalls />
            <CornerTower position={[-6, 0, -6]} />
            <CornerTower position={[6, 0, -6]} />
            <CornerTower position={[-6, 0, 6]} />
            <CornerTower position={[6, 0, 6]} />
            <CentralCastle />
            <Flag />
        </group>
    )
}

function SquareWalls() {
    const wallHeight = 3
    const wallThickness = 0.6
    const wallLength = 12

    return (
        <group>
            {/* Front wall */}
            <mesh position={[0, wallHeight / 2, -6]} castShadow receiveShadow>
                <boxGeometry args={[wallLength, wallHeight, wallThickness]} />
                <meshStandardMaterial color="#7d7d7d" roughness={0.95} metalness={0.1} normalScale={new THREE.Vector2(1, 1)} />
            </mesh>

            {/* Back wall */}
            <mesh position={[0, wallHeight / 2, 6]} castShadow receiveShadow>
                <boxGeometry args={[wallLength, wallHeight, wallThickness]} />
                <meshStandardMaterial color="#7d7d7d" roughness={0.95} metalness={0.1} normalScale={new THREE.Vector2(1, 1)} />
            </mesh>

            {/* Left wall */}
            <mesh position={[-6, wallHeight / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[wallThickness, wallHeight, wallLength]} />
                <meshStandardMaterial color="#7d7d7d" roughness={0.95} metalness={0.1} normalScale={new THREE.Vector2(1, 1)} />
            </mesh>

            {/* Right wall */}
            <mesh position={[6, wallHeight / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[wallThickness, wallHeight, wallLength]} />
                <meshStandardMaterial color="#7d7d7d" roughness={0.95} metalness={0.1} normalScale={new THREE.Vector2(1, 1)} />
            </mesh>

            <Battlements />
            <WallDetails />
        </group>
    )
}

function WallDetails() {
    const details: JSX.Element[] = []
    const heights = [0.8, 1.6, 2.4]

    heights.forEach((height, idx) => {
        details.push(
            <mesh key={`front-detail-${idx}`} position={[0, height, -6.05]} castShadow>
                <boxGeometry args={[12, 0.08, 0.5]} />
                <meshStandardMaterial color="#6a6a6a" roughness={1} />
            </mesh>,
        )
        details.push(
            <mesh key={`back-detail-${idx}`} position={[0, height, 6.05]} castShadow>
                <boxGeometry args={[12, 0.08, 0.5]} />
                <meshStandardMaterial color="#6a6a6a" roughness={1} />
            </mesh>,
        )
        details.push(
            <mesh key={`left-detail-${idx}`} position={[-6.05, height, 0]} castShadow>
                <boxGeometry args={[0.5, 0.08, 12]} />
                <meshStandardMaterial color="#6a6a6a" roughness={1} />
            </mesh>,
        )
        details.push(
            <mesh key={`right-detail-${idx}`} position={[6.05, height, 0]} castShadow>
                <boxGeometry args={[0.5, 0.08, 12]} />
                <meshStandardMaterial color="#6a6a6a" roughness={1} />
            </mesh>,
        )
    })

    return <>{details}</>
}

function Battlements() {
    const battlement: JSX.Element[] = []
    const spacing = 1.2

    for (let i = -4; i <= 4; i++) {
        if (i % 2 === 0) {
            battlement.push(
                <mesh key={`front-${i}`} position={[i * spacing, 3.5, -6]} castShadow>
                    <boxGeometry args={[0.8, 0.8, 0.6]} />
                    <meshStandardMaterial color="#6a6a6a" roughness={0.95} />
                </mesh>,
            )
            battlement.push(
                <mesh key={`back-${i}`} position={[i * spacing, 3.5, 6]} castShadow>
                    <boxGeometry args={[0.8, 0.8, 0.6]} />
                    <meshStandardMaterial color="#6a6a6a" roughness={0.95} />
                </mesh>,
            )
        }
    }

    for (let i = -4; i <= 4; i++) {
        if (i % 2 === 0) {
            battlement.push(
                <mesh key={`left-${i}`} position={[-6, 3.5, i * spacing]} castShadow>
                    <boxGeometry args={[0.6, 0.8, 0.8]} />
                    <meshStandardMaterial color="#6a6a6a" roughness={0.95} />
                </mesh>,
            )
            battlement.push(
                <mesh key={`right-${i}`} position={[6, 3.5, i * spacing]} castShadow>
                    <boxGeometry args={[0.6, 0.8, 0.8]} />
                    <meshStandardMaterial color="#6a6a6a" roughness={0.95} />
                </mesh>,
            )
        }
    }

    return <>{battlement}</>
}

function CornerTower({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, 2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1.2, 1.5, 4, 32]} />
                <meshStandardMaterial
                    color="#5d5d5d"
                    roughness={0.95}
                    metalness={0.05}
                    normalScale={new THREE.Vector2(1.5, 1.5)}
                />
            </mesh>

            {[0.8, 1.6, 2.4, 3.2].map((height, idx) => (
                <mesh key={`band-${idx}`} position={[0, height, 0]} castShadow>
                    <cylinderGeometry args={[1.45 - height * 0.06, 1.45 - height * 0.06, 0.12, 32]} />
                    <meshStandardMaterial color="#4a4a4a" roughness={1} />
                </mesh>
            ))}

            <mesh position={[0, 4.1, 0]} castShadow>
                <sphereGeometry args={[1.38, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial
                    color="#b71c1c"
                    roughness={0.3}
                    metalness={0.5}
                    emissive="#4a0000"
                    emissiveIntensity={0.15}
                />
            </mesh>

            <mesh position={[0, 4.0, 0]} castShadow>
                <torusGeometry args={[1.38, 0.1, 16, 32]} />
                <meshStandardMaterial color="#6d1a1a" metalness={0.7} roughness={0.2} />
            </mesh>

            <mesh position={[0, 5.2, 0]} castShadow>
                <coneGeometry args={[0.32, 1.3, 8]} />
                <meshStandardMaterial
                    color="#d4af37"
                    metalness={0.95}
                    roughness={0.05}
                    emissive="#ffaa00"
                    emissiveIntensity={0.2}
                />
            </mesh>

            <mesh position={[0, 5.9, 0]} castShadow>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshStandardMaterial
                    color="#ffd700"
                    metalness={0.95}
                    roughness={0.05}
                    emissive="#ffaa00"
                    emissiveIntensity={0.3}
                />
            </mesh>

            <mesh position={[0, 1.8, 1.35]} castShadow>
                <boxGeometry args={[0.4, 0.6, 0.15]} />
                <meshStandardMaterial color="#1a1100" emissive="#ff8800" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0, 2.8, 1.25]} castShadow>
                <boxGeometry args={[0.4, 0.6, 0.15]} />
                <meshStandardMaterial color="#1a1100" emissive="#ff8800" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[1.35, 1.8, 0]} castShadow>
                <boxGeometry args={[0.15, 0.6, 0.4]} />
                <meshStandardMaterial color="#1a1100" emissive="#ff8800" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[-1.35, 1.8, 0]} castShadow>
                <boxGeometry args={[0.15, 0.6, 0.4]} />
                <meshStandardMaterial color="#1a1100" emissive="#ff8800" emissiveIntensity={0.2} />
            </mesh>

            {[
                [0, 1.8, 1.38],
                [0, 2.8, 1.28],
            ].map(([x, y, z], i) => (
                <mesh key={`frame-${i}`} position={[x, y, z]} castShadow>
                    <boxGeometry args={[0.45, 0.65, 0.1]} />
                    <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
                </mesh>
            ))}
        </group>
    )
}

function CentralCastle() {
    return (
        <group position={[0, 0, 0]}>
            <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[4, 5, 4]} />
                <meshStandardMaterial
                    color="#5a5a5a"
                    roughness={0.95}
                    metalness={0.05}
                    normalScale={new THREE.Vector2(1.5, 1.5)}
                />
            </mesh>

            {[1, 2, 3, 4].map((level) => (
                <mesh key={`layer-${level}`} position={[0, level * 1.2, 0]} castShadow>
                    <boxGeometry args={[4.1, 0.15, 4.1]} />
                    <meshStandardMaterial color="#3d3d3d" roughness={1} />
                </mesh>
            ))}

            {[-1.5, -0.5, 0.5, 1.5].map((xPos) =>
                [2.05, -2.05].map((zPos, idx) => (
                    <mesh key={`joint-x-${xPos}-${idx}`} position={[xPos, 2.5, zPos]} castShadow>
                        <boxGeometry args={[0.08, 5, 0.08]} />
                        <meshStandardMaterial color="#454545" roughness={1} />
                    </mesh>
                )),
            )}

            <mesh position={[0, 5.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.5, 2, 3.5]} />
                <meshStandardMaterial
                    color="#636363"
                    roughness={0.95}
                    metalness={0.05}
                    normalScale={new THREE.Vector2(1.5, 1.5)}
                />
            </mesh>

            <mesh position={[0, 7.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[3, 3, 3]} />
                <meshStandardMaterial color="#4a4a4a" roughness={0.95} />
            </mesh>

            {[-1.2, 1.2].map((x) =>
                [-1.2, 1.2].map((z) => (
                    <mesh key={`battlement-${x}-${z}`} position={[x, 6.8, z]} castShadow>
                        <boxGeometry args={[0.6, 0.7, 0.6]} />
                        <meshStandardMaterial color="#555555" roughness={0.9} />
                    </mesh>
                )),
            )}

            {[
                [-1.75, 6.8, -1.75],
                [1.75, 6.8, -1.75],
                [-1.75, 6.8, 1.75],
                [1.75, 6.8, 1.75],
            ].map(([x, y, z], i) => (
                <mesh key={`corner-${i}`} position={[x, y, z]} castShadow>
                    <boxGeometry args={[0.5, 0.7, 0.5]} />
                    <meshStandardMaterial color="#555555" roughness={0.9} />
                </mesh>
            ))}

            <mesh position={[0, 1, 2.05]} castShadow>
                <boxGeometry args={[1.2, 2.3, 0.12]} />
                <meshStandardMaterial color="#2d1810" roughness={0.9} />
            </mesh>

            <mesh position={[0, 1.95, 2.06]} castShadow>
                <boxGeometry args={[1.25, 0.35, 0.14]} />
                <meshStandardMaterial color="#3e2723" roughness={0.9} />
            </mesh>

            {[0.6, 1.2, 1.8].map((y) => (
                <mesh key={`band-${y}`} position={[0, y, 2.08]} castShadow>
                    <boxGeometry args={[1.2, 0.1, 0.06]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.3} />
                </mesh>
            ))}

            {[0.6, 1.2, 1.8].map((y) =>
                [-0.5, -0.2, 0.2, 0.5].map((x, idx) => (
                    <mesh key={`rivet-${y}-${idx}`} position={[x, y, 2.09]} castShadow>
                        <sphereGeometry args={[0.03, 8, 8]} />
                        <meshStandardMaterial color="#0d0d0d" metalness={0.9} roughness={0.2} />
                    </mesh>
                )),
            )}

            {[
                [1.2, 3, 2.05],
                [-1.2, 3, 2.05],
                [1.2, 4.8, 2.05],
                [-1.2, 4.8, 2.05],
            ].map(([x, y, z], i) => (
                <group key={`window-${i}`}>
                    <mesh position={[x, y, z]} castShadow>
                        <boxGeometry args={[0.6, 0.8, 0.12]} />
                        <meshStandardMaterial color="#0a0500" emissive="#ff9800" emissiveIntensity={0.4} />
                    </mesh>
                    <mesh position={[x, y, z + 0.06]} castShadow>
                        <boxGeometry args={[0.65, 0.85, 0.1]} />
                        <meshStandardMaterial color="#3a3a3a" roughness={0.95} />
                    </mesh>
                    <mesh position={[x, y, z + 0.08]} castShadow>
                        <boxGeometry args={[0.05, 0.85, 0.05]} />
                        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
                    </mesh>
                    <mesh position={[x, y, z + 0.08]} castShadow>
                        <boxGeometry args={[0.65, 0.05, 0.05]} />
                        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
                    </mesh>
                </group>
            ))}

            {[
                [2.05, 3, 0],
                [-2.05, 3, 0],
                [0, 3, -2.05],
            ].map(([x, y, z], i) => (
                <mesh key={`side-window-${i}`} position={[x, y, z]} castShadow>
                    <boxGeometry args={x === 0 ? [0.5, 0.7, 0.12] : [0.12, 0.7, 0.5]} />
                    <meshStandardMaterial color="#0a0500" emissive="#ff8800" emissiveIntensity={0.25} />
                </mesh>
            ))}
        </group>
    )
}

function Flag() {
    const flagRef = useRef<THREE.Mesh>(null)

    useFrame(({ clock }) => {
        if (flagRef.current) {
            const time = clock.getElapsedTime()
            const geometry = flagRef.current.geometry
            const positions = geometry.attributes.position

            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i)
                const wave = Math.sin(x * 3 + time * 3) * 0.1 * x
                positions.setZ(i, wave)
            }

            positions.needsUpdate = true
        }
    })

    return (
        <group position={[0, 7.2, 0]}>
            <mesh position={[0, 1.9, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.09, 3.8, 16]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.15} />
            </mesh>

            {[0.5, 1.5, 2.5, 3.5].map((height, idx) => (
                <mesh key={`pole-band-${idx}`} position={[0, height, 0]} castShadow>
                    <torusGeometry args={[0.11, 0.025, 8, 16]} />
                    <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
                </mesh>
            ))}

            <mesh position={[0, 3.9, 0]} castShadow>
                <sphereGeometry args={[0.17, 16, 16]} />
                <meshStandardMaterial
                    color="#d4af37"
                    metalness={0.95}
                    roughness={0.05}
                    emissive="#ffaa00"
                    emissiveIntensity={0.2}
                />
            </mesh>
            <mesh position={[0, 4.15, 0]} castShadow>
                <coneGeometry args={[0.14, 0.35, 8]} />
                <meshStandardMaterial
                    color="#ffd700"
                    metalness={0.95}
                    roughness={0.05}
                    emissive="#ffaa00"
                    emissiveIntensity={0.3}
                />
            </mesh>

            <mesh ref={flagRef} position={[0.95, 3.3, 0]} castShadow>
                <planeGeometry args={[1.7, 1.3, 14, 14]} />
                <meshStandardMaterial
                    color="#b71c1c"
                    side={THREE.DoubleSide}
                    transparent={false}
                    roughness={0.65}
                    metalness={0.1}
                    emissive="#4a0000"
                    emissiveIntensity={0.2}
                />
            </mesh>

            <mesh position={[0.08, 3.9, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.045, 0.045, 0.35, 8]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.08, 2.7, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.045, 0.045, 0.35, 8]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    )
}
