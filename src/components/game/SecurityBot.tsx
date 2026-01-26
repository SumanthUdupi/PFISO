import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import useGameStore from '../../store'
import gameSystemInstance from '../../systems/GameSystem'

interface SecurityBotProps {
    position: [number, number, number]
    patrolRadius?: number
}

const SecurityBot: React.FC<SecurityBotProps> = ({ position, patrolRadius = 5 }) => {
    const rigidBodyRef = useRef<any>(null)
    const [alertLevel, setAlertLevel] = useState(0) // 0: Idle, 1: Suspicious, 2: Alert
    const timeRef = useRef(0)
    const startPos = useRef(new THREE.Vector3(...position))

    useFrame((_state, delta) => {
        if (!rigidBodyRef.current) return
        timeRef.current += delta

        // AI Logic
        const currentPos = rigidBodyRef.current.translation()
        const pPos = gameSystemInstance.playerPosition
        const distToPlayer = Math.sqrt(
            Math.pow(currentPos.x - pPos.x, 2) +
            Math.pow(currentPos.z - pPos.z, 2)
        )

        let targetVelocity = { x: 0, y: 0, z: 0 }

        // State Machine
        if (distToPlayer < 8) {
            // Level 2: ALERT - Chase / Face Player
            if (alertLevel !== 2) setAlertLevel(2)

            // Simple Chase (move towards player)
            const dx = pPos.x - currentPos.x
            const dz = pPos.z - currentPos.z
            const angle = Math.atan2(dx, dz)
            const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle)
            rigidBodyRef.current.setRotation(q, true)

            // Move
            const speed = 4.0
            // Only move if not right on top
            if (distToPlayer > 1.5) {
                targetVelocity = {
                    x: Math.sin(angle) * speed,
                    y: rigidBodyRef.current.linvel().y,
                    z: Math.cos(angle) * speed
                }
            } else {
                targetVelocity = { x: 0, y: rigidBodyRef.current.linvel().y, z: 0 }
            }

        } else if (distToPlayer < 14) {
            // Level 1: SUSPICIOUS - Stop & Look at Player
            if (alertLevel !== 1) setAlertLevel(1)

            // Face Player but don't move
            const dx = pPos.x - currentPos.x
            const dz = pPos.z - currentPos.z
            const angle = Math.atan2(dx, dz)
            const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle)
            rigidBodyRef.current.setRotation(q, true)

            targetVelocity = { x: 0, y: rigidBodyRef.current.linvel().y, z: 0 }

        } else {
            // Level 0: PATROL
            if (alertLevel !== 0) setAlertLevel(0)

            // Simple Patrol Logic
            const patrolX = Math.sin(timeRef.current * 0.5) * patrolRadius
            const targetX = startPos.current.x + patrolX
            const moveDir = targetX - currentPos.x > 0 ? 1 : -1

            // Move
            targetVelocity = { x: moveDir * 2, y: rigidBodyRef.current.linvel().y, z: 0 }

            // Face Patrol Dir
            const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), moveDir > 0 ? Math.PI : 0) // Face side?
            rigidBodyRef.current.setRotation(rotation, true)
        }

        // Apply Velocity
        rigidBodyRef.current.setLinvel(targetVelocity, true)
    })

    // Visuals based on Alert Level
    const eyeColor = alertLevel === 2 ? '#ff0000' : (alertLevel === 1 ? '#ffff00' : '#00ff00')
    const labelText = alertLevel === 2 ? 'ALERT' : (alertLevel === 1 ? 'SCANNING' : 'PATROL')
    const baseColor = alertLevel === 2 ? '#880000' : '#444'

    return (
        <RigidBody ref={rigidBodyRef} position={position} lockRotations enabledRotations={[false, true, false]} friction={0} linearDamping={1.0}>
            <CuboidCollider args={[0.5, 1, 0.5]} />

            {/* Visuals */}
            <group position={[0, 0, 0]}>
                {/* Body */}
                <mesh castShadow receiveShadow position={[0, 0, 0]}>
                    <boxGeometry args={[0.8, 1, 0.8]} />
                    <meshStandardMaterial color={baseColor} metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Eye / Scanner */}
                <mesh position={[0, 0.2, 0.41]}>
                    <boxGeometry args={[0.6, 0.2, 0.1]} />
                    <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={2} />
                </mesh>
                {/* Hover Thruster */}
                <mesh position={[0, -0.6, 0]}>
                    <coneGeometry args={[0.3, 0.4, 16]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            </group>

            {/* UI Label */}
            <Html position={[0, 1.5, 0]} center>
                <div className={`text-xs px-2 py-1 rounded font-mono border ${alertLevel === 2 ? 'bg-red-900/80 border-red-500 text-white' : (alertLevel === 1 ? 'bg-yellow-900/80 border-yellow-500 text-yellow-100' : 'bg-green-900/80 border-green-500 text-green-100')}`}>
                    {labelText}
                </div>
            </Html>
        </RigidBody>
    )
}

export default SecurityBot
