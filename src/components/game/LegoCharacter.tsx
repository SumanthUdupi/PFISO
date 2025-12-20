import React, { useRef, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface LegoCharacterProps {
    isMoving: boolean
}

const LegoCharacter: React.FC<LegoCharacterProps> = ({ isMoving }) => {
    const group = useRef<THREE.Group>(null)
    const leftLeg = useRef<THREE.Group>(null)
    const rightLeg = useRef<THREE.Group>(null)
    const leftArm = useRef<THREE.Group>(null)
    const rightArm = useRef<THREE.Group>(null)
    const head = useRef<THREE.Group>(null)

    // Materials - Classic Lego Colors
    const skinMaterial = new THREE.MeshStandardMaterial({ color: '#FFD700', roughness: 0.3 }) // Yellow
    const torsoMaterial = new THREE.MeshStandardMaterial({ color: '#C91A09', roughness: 0.3 }) // Red
    const pantsMaterial = new THREE.MeshStandardMaterial({ color: '#0055BF', roughness: 0.3 }) // Blue

    useFrame((state) => {
        if (!leftLeg.current || !rightLeg.current || !leftArm.current || !rightArm.current) return

        const t = state.clock.getElapsedTime()
        const speed = 10

        if (isMoving) {
            // Walk Cycle
            // Legs move opposite to each other
            leftLeg.current.rotation.x = Math.sin(t * speed) * 0.5
            rightLeg.current.rotation.x = Math.cos(t * speed) * 0.5

            // Arms move opposite to legs
            leftArm.current.rotation.x = -Math.sin(t * speed) * 0.5
            rightArm.current.rotation.x = -Math.cos(t * speed) * 0.5
        } else {
            // Idle Reset
            const lerpSpeed = 0.1
            leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, 0, lerpSpeed)
            rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, 0, lerpSpeed)
            leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, 0, lerpSpeed)
            rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, 0, lerpSpeed)
        }
    })

    return (
        <group ref={group}>
            {/* Hips/Crotch (Blue) */}
            <mesh position={[0, 0.35, 0]} material={pantsMaterial}>
                <boxGeometry args={[0.26, 0.1, 0.15]} />
            </mesh>
            {/* Studs between legs/torso (hidden mostly) */}

            {/* Left Leg */}
            <group ref={leftLeg} position={[-0.07, 0.3, 0]}>
                {/* Pivot point is at the hip */}
                <mesh position={[0, -0.15, 0]} material={pantsMaterial}>
                    <boxGeometry args={[0.11, 0.3, 0.15]} />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -0.3, 0.03]} material={pantsMaterial}>
                    <boxGeometry args={[0.11, 0.05, 0.21]} />
                </mesh>
            </group>

            {/* Right Leg */}
            <group ref={rightLeg} position={[0.07, 0.3, 0]}>
                <mesh position={[0, -0.15, 0]} material={pantsMaterial}>
                    <boxGeometry args={[0.11, 0.3, 0.15]} />
                </mesh>
                <mesh position={[0, -0.3, 0.03]} material={pantsMaterial}>
                    <boxGeometry args={[0.11, 0.05, 0.21]} />
                </mesh>
            </group>

            {/* Torso (Red) */}
            <mesh position={[0, 0.58, 0]} material={torsoMaterial}>
                {/* Trapezoid shape is hard with Box, just use Box for now */}
                <boxGeometry args={[0.26, 0.35, 0.14]} />
            </mesh>

            {/* Neck */}
            <mesh position={[0, 0.77, 0]} material={skinMaterial}>
                <cylinderGeometry args={[0.06, 0.06, 0.05]} />
            </mesh>

            {/* Head (Yellow) */}
            <group ref={head} position={[0, 0.88, 0]}>
                <mesh material={skinMaterial}>
                    <cylinderGeometry args={[0.1, 0.1, 0.17]} />
                </mesh>
                {/* Top Stud */}
                <mesh position={[0, 0.09, 0]} material={skinMaterial}>
                    <cylinderGeometry args={[0.06, 0.06, 0.04]} />
                </mesh>
            </group>

            {/* Left Arm */}
            <group ref={leftArm} position={[-0.18, 0.7, 0]}>
                <mesh position={[0, -0.15, 0]} rotation={[0, 0, 0.2]} material={torsoMaterial}>
                    <cylinderGeometry args={[0.04, 0.05, 0.3]} />
                </mesh>
                {/* Hand */}
                <mesh position={[-0.04, -0.3, 0]} rotation={[0, 0, 0.2]} material={skinMaterial}>
                    <cylinderGeometry args={[0.05, 0.05, 0.08]} />
                </mesh>
            </group>

            {/* Right Arm */}
            <group ref={rightArm} position={[0.18, 0.7, 0]}>
                <mesh position={[0, -0.15, 0]} rotation={[0, 0, -0.2]} material={torsoMaterial}>
                    <cylinderGeometry args={[0.04, 0.05, 0.3]} />
                </mesh>
                {/* Hand */}
                <mesh position={[0.04, -0.3, 0]} rotation={[0, 0, -0.2]} material={skinMaterial}>
                    <cylinderGeometry args={[0.05, 0.05, 0.08]} />
                </mesh>
            </group>
        </group>
    )
}

export default LegoCharacter
