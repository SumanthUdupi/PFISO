import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Outlines } from '@react-three/drei'
import * as THREE from 'three'
import gameSystemInstance from '../../systems/GameSystem'
import useAudioStore from '../../audioStore'

interface InteractableItemProps {
    position: [number, number, number]
    rotation?: [number, number, number]
    scale?: number
    label: string
    onInteract: () => void
    children: React.ReactNode
    interactionDistance?: number
    showOutline?: boolean
}

export const InteractableItem: React.FC<InteractableItemProps> = ({
    position,
    rotation = [0, 0, 0],
    scale = 1,
    label,
    onInteract,
    children,
    interactionDistance = 3,
    showOutline = true
}) => {
    const group = useRef<THREE.Group>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [isNearby, setIsNearby] = useState(false)
    const { playSound } = useAudioStore()

    useFrame(() => {
        if (!group.current) return

        const playerPos = gameSystemInstance.playerPosition
        const itemPos = group.current.position

        // Simple distance check (ignoring Y for "cozy" flat feel if desired, but 3D is better)
        const dx = playerPos.x - itemPos.x
        const dy = playerPos.y - itemPos.y
        const dz = playerPos.z - itemPos.z
        const distSq = dx * dx + dy * dy + dz * dz

        const wasNearby = isNearby
        const nowNearby = distSq < interactionDistance * interactionDistance

        if (nowNearby !== wasNearby) {
            setIsNearby(nowNearby)
            if (nowNearby) {
                // playSound('hover') // Too spammy if walking by many items?
            }
        }
    })

    const handleClick = (e: any) => {
        e.stopPropagation()
        if (isNearby || isHovered) { // Allow clicking if hovered OR nearby (for mouse users)
            playSound('click')
            onInteract()
        }
    }

    const handlePointerOver = () => {
        setIsHovered(true)
        document.body.style.cursor = 'pointer'
        playSound('hover')
    }

    const handlePointerOut = () => {
        setIsHovered(false)
        document.body.style.cursor = 'auto'
    }

    // Keyboard interaction (E key)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isNearby && (e.key === 'e' || e.key === 'E' || e.key === 'Enter')) {
                playSound('click')
                onInteract()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isNearby, onInteract, playSound])

    return (
        <group
            ref={group}
            position={new THREE.Vector3(...position)}
            rotation={new THREE.Euler(...rotation)}
            scale={scale}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            {/* The actual object mesh(es) */}
            <group>
                {children}
                {/* Outline effect when hovered or nearby */}
                {(isHovered || (isNearby && showOutline)) && (
                    <React.Suspense fallback={null}>
                        <Outlines thickness={0.05} color="#e9c46a" screenspace={false} opacity={0.8} transparent angle={0} />
                    </React.Suspense>
                )}
            </group>

            {/* Floating Label */}
            {(isNearby || isHovered) && (
                <Html position={[0, 1.5, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
                    <div className="pointer-events-none flex flex-col items-center">
                        <div className="bg-black/70 text-[#fcf4e8] px-3 py-1 rounded-full text-xs font-bold border border-[#e9c46a] shadow-[0_0_10px_rgba(233,196,106,0.3)] backdrop-blur-sm whitespace-nowrap animate-in fade-in zoom-in duration-200">
                            <span className="text-[#e9c46a] mr-1">[E]</span> {label}
                        </div>
                        {/* Down arrow decoration */}
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-[#e9c46a] border-r-[6px] border-r-transparent mt-[-1px]"></div>
                    </div>
                </Html>
            )}

            {/* "Spotlight" ground effect when nearby to guide player */}
            {isNearby && (
                <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.5, 0.7, 32]} />
                    <meshBasicMaterial color="#e9c46a" opacity={0.3} transparent />
                </mesh>
            )}
        </group>
    )
}
