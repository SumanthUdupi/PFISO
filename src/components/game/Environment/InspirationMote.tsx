import React, { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Float } from '@react-three/drei'
import * as THREE from 'three'
import useGameStore from '../../../store'
import useAudioStore from '../../../audioStore'

interface InspirationMoteProps {
    position: [number, number, number]
    id: number
    quote: string
}

const InspirationMote: React.FC<InspirationMoteProps> = ({ position, id, quote }) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const { collectedMoteIds, collectMote } = useGameStore()
    const [localCollected, setLocalCollected] = useState(false)
    const [showQuote, setShowQuote] = useState(false)
    const { playSound } = useAudioStore()

    // Sync with store
    const isCollected = useMemo(() => {
        return localCollected || (collectedMoteIds && collectedMoteIds.includes(id));
    }, [localCollected, collectedMoteIds, id]);

    useFrame((state) => {
        if (meshRef.current && !isCollected) {
            meshRef.current.rotation.y += 0.02
            meshRef.current.rotation.z += 0.01
        }
    })

    const handleCollect = () => {
        if (isCollected) return
        setLocalCollected(true)
        collectMote(id)
        playSound('unlock')
        setShowQuote(true)

        // Hide quote after 5 seconds
        setTimeout(() => setShowQuote(false), 5000)
    }

    if (isCollected && !showQuote) return null

    return (
        <group position={position}>
            {!isCollected && (
                <Float speed={5} rotationIntensity={1} floatIntensity={1}>
                    <mesh
                        ref={meshRef}
                        onClick={handleCollect}
                        onPointerOver={() => document.body.style.cursor = 'pointer'}
                        onPointerOut={() => document.body.style.cursor = 'auto'}
                    >
                        <octahedronGeometry args={[0.3, 0]} />
                        <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={1} wireframe />
                    </mesh>
                    {/* Glow */}
                    <pointLight color="#00FFFF" intensity={0.5} distance={3} />
                </Float>
            )}

            {showQuote && (
                <Html center position={[0, 1, 0]} style={{ pointerEvents: 'none', width: '300px', textAlign: 'center' }}>
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.8)',
                        border: '2px solid #00FFFF',
                        color: '#fff',
                        padding: '10px',
                        borderRadius: '8px',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)',
                        animation: 'fadeIn 0.5s ease'
                    }}>
                        <div style={{ color: '#00FFFF', fontWeight: 'bold', marginBottom: '5px' }}>INSPIRATION FOUND</div>
                        "{quote}"
                    </div>
                </Html>
            )}
        </group>
    )
}

export default InspirationMote
