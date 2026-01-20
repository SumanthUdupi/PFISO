import React from 'react'
import { useSmartTexture } from '../../../utils/useSmartTexture'


interface ProjectEaselProps {
    position: [number, number, number]
    image?: string
}

const ProjectEasel: React.FC<ProjectEaselProps> = ({ position, image }) => {
    return (
        <group position={position}>
            {/* Easel Frame */}
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[3, 2, 0.1]} />
                <meshStandardMaterial color="#5D4037" /> {/* Dark Wood */}
            </mesh>

            {/* Canvas/Board */}
            <mesh position={[0, 1.5, 0.06]} receiveShadow>
                <boxGeometry args={[2.8, 1.8, 0.05]} />
                <meshStandardMaterial color="#F5F5DC" /> {/* Canvas Color */}
            </mesh>

            {/* Project Image */}
            {image && (
                <React.Suspense fallback={null}>
                    <EaselImage url={image} />
                </React.Suspense>
            )}

            {/* Easel Legs (Tripod style) */}
            {/* Back Leg */}
            <mesh position={[0, 1, -0.5]} rotation={[0.2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 3]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Front Left */}
            <mesh position={[-1.2, 1, 0.3]} rotation={[-0.1, 0, -0.1]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 3]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Front Right */}
            <mesh position={[1.2, 1, 0.3]} rotation={[-0.1, 0, 0.1]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 3]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>

            {/* Ledge */}
            <mesh position={[0, 0.5, 0.2]} castShadow>
                <boxGeometry args={[3.2, 0.1, 0.2]} />
                <meshStandardMaterial color="#5D4037" />
            </mesh>
        </group>
    )
}




const EaselImage = ({ url }: { url: string }) => {
    const texture = useSmartTexture(url) as THREE.Texture
    return (
        <mesh position={[0, 1.5, 0.1]}>
            <planeGeometry args={[2.6, 1.6]} />
            <meshBasicMaterial map={texture} transparent opacity={0.9} />
        </mesh>
    )
}

export default ProjectEasel
