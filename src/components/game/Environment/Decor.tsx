import React, { useMemo } from 'react'
import * as THREE from 'three'
import { WobbleMaterial } from './WobbleMaterial'

interface DecorProps {
    width: number
    depth: number
}

// COZY: Procedural Plant
const Plant = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        {/* Pot */}
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.15, 0.4, 16]} />
            <meshStandardMaterial color="#FFAB91" roughness={0.8} />
        </mesh>
        {/* Foliage (Wobbling) */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <dodecahedronGeometry args={[0.35, 0]} />
            <WobbleMaterial color="#A5D6A7" strength={0.2} speed={1.5} frequency={4} />
        </mesh>
    </group>
)

// COZY: Coffee Mug
const CoffeeMug = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
            <meshStandardMaterial color="#90CAF9" />
        </mesh>
        {/* Steam */}
        <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshBasicMaterial color="#FFF" transparent opacity={0.4} />
        </mesh>
    </group>
)

// COZY: Stack of Books
const BookStack = ({ position }: { position: [number, number, number] }) => (
    <group position={position} rotation={[0, Math.random() * Math.PI, 0]}>
        <mesh position={[0, 0.05, 0]} castShadow>
            <boxGeometry args={[0.4, 0.1, 0.3]} />
            <meshStandardMaterial color="#FFCC80" />
        </mesh>
        <mesh position={[0.05, 0.15, 0]} rotation={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.35, 0.1, 0.25]} />
            <meshStandardMaterial color="#CE93D8" />
        </mesh>
    </group>
)

// COZY: Fluffy Rug
const CozyRug = ({ position, size, color }: { position: [number, number, number], size: [number, number], color: string }) => (
    <group position={[position[0], 0.02, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Main Rug Surface */}
        <mesh receiveShadow>
            <planeGeometry args={size} />
            <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        {/* Rug Border/Thickness trick - slightly larger plane underneath in darker color? 
            Or just a simple box to give it thickness. 
            Let's use a Box instead of Plane for volume.
        */}
        <mesh position={[0, 0, -0.01]} receiveShadow castShadow>
            <boxGeometry args={[size[0], size[1], 0.05]} />
            <meshStandardMaterial color={color} roughness={1.0} />
        </mesh>
    </group>
)

const Decor: React.FC<DecorProps> = ({ width, depth }) => {

    // Scatter is now "Creative Clutter" - Sketches and Books
    const scatterItems = useMemo(() => {
        const items = []
        // Add random books
        for (let i = 0; i < 5; i++) {
            const x = (Math.random() - 0.5) * (width - 4)
            const z = (Math.random() - 0.5) * (depth - 4)
            if (Math.abs(x) < 2 && Math.abs(z) < 2) continue; // clear center
            items.push(<BookStack key={`book-${i}`} position={[x, -0.5, z]} />)
        }
        return items
    }, [width, depth])

    return (
        <group>
            {/* Center RUG: Sage Green (Solid) */}
            <CozyRug position={[0, 0, 0]} size={[5, 4]} color="#A5D6A7" />

            {/* Entrance RUG: Warm Beige */}
            <CozyRug position={[0, 0, 6]} size={[3, 2]} color="#FFECB3" />

            {/* PLANTS */}
            <Plant position={[-6, -0.5, -6]} />
            <Plant position={[6, -0.5, 6]} />
            <Plant position={[-5, -0.5, 5]} />

            {/* MUG on Reception Desk (Approx pos from Lobby.tsx: [0, 0, -2]) */}
            <CoffeeMug position={[0.5, 0.6, -2]} />

            {/* SCATTER */}
            {scatterItems}
        </group>
    )
}

export default Decor
