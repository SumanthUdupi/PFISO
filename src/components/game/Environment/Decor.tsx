import React, { useMemo } from 'react'
import * as THREE from 'three'

interface DecorProps {
  width: number
  depth: number
}

// 2.2 Environmental Scatter (Props)
// 2.3 Dynamic Desk Clutter (Actually handled inside DeskGroup logic ideally, but we can do it here if we don't have separate Desk component)
// 2.4 Perspective-Correct Rugs

const ScatterItem = ({ position, color, scale }: { position: [number, number, number], color: string, scale: [number, number, number] }) => (
    <mesh position={position} rotation={[0, Math.random() * Math.PI, 0]} castShadow receiveShadow>
        <boxGeometry args={scale} />
        <meshStandardMaterial color={color} />
    </mesh>
)

const Rug = ({ position, size, color }: { position: [number, number, number], size: [number, number], color: string }) => (
    <mesh position={[position[0], 0.01, position[2]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial color={color} />
    </mesh>
)

const Decor: React.FC<DecorProps> = ({ width, depth }) => {

    // Generate random scatter
    const scatterItems = useMemo(() => {
        const items = []
        const count = 15 // Number of scatter items
        for (let i = 0; i < count; i++) {
            // Random pos within bounds, but avoid center
            const x = (Math.random() - 0.5) * (width - 2)
            const z = (Math.random() - 0.5) * (depth - 2)

            // Avoid center area (roughly -2 to 2)
            if (Math.abs(x) < 3 && Math.abs(z) < 3) continue;

            const type = Math.random()
            if (type < 0.5) {
                // Paper
                items.push({
                    key: `paper-${i}`,
                    position: [x, -0.48, z] as [number, number, number],
                    scale: [0.3, 0.01, 0.4] as [number, number, number],
                    color: '#ecf0f1'
                })
            } else if (type < 0.8) {
                // Box
                 items.push({
                    key: `box-${i}`,
                    position: [x, -0.25, z] as [number, number, number],
                    scale: [0.4, 0.5, 0.4] as [number, number, number],
                    color: '#d35400'
                })
            } else {
                 // Can
                 items.push({
                    key: `can-${i}`,
                    position: [x, -0.35, z] as [number, number, number],
                    scale: [0.15, 0.3, 0.15] as [number, number, number],
                    color: '#e74c3c'
                })
            }
        }
        return items
    }, [width, depth])

    return (
        <group>
            {/* Rugs */}
            {/* Center Rug */}
            <Rug position={[0, 0, 0]} size={[4, 4]} color="#8e44ad" />

            {/* Entrance Rug (South) */}
            <Rug position={[0, 0, 6]} size={[3, 2]} color="#c0392b" />

            {/* Scatter */}
            {scatterItems.map(item => (
                <ScatterItem key={item.key} {...item} />
            ))}
        </group>
    )
}

export default Decor
