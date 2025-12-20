import React, { useRef, useEffect, useState, useMemo, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import TeleportSparkle from './TeleportSparkle'
import { findPath } from '../../utils/pathfinding'

// --- CONFIGURATION ---
const SPEED = 6
const ACCELERATION = 40
const FRICTION = 12
const JUMP_FORCE = 9
const GRAVITY = 25
const ROTATION_SMOOTHING = 15

// --- 1. THE ART: Procedural Lego Avatar ---
const LegoMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.2,
    metalness: 0.05, // Plastic feel
})

const LegoAvatar = ({ isMoving, isJumping, velocity }: { isMoving: boolean, isJumping: boolean, velocity: THREE.Vector3 }) => {
    const group = useRef<THREE.Group>(null)
    const leftArm = useRef<THREE.Group>(null)
    const rightArm = useRef<THREE.Group>(null)
    const leftLeg = useRef<THREE.Group>(null)
    const rightLeg = useRef<THREE.Group>(null)
    const head = useRef<THREE.Group>(null)

    useFrame((state, delta) => {
        if (!group.current) return

        const t = state.clock.getElapsedTime() * 10 // Animation speed

        // 1. Walking Animation (Limb Swing)
        if (isMoving && !isJumping) {
            // Legs (Contra-lateral movement)
            if(leftLeg.current) leftLeg.current.rotation.x = Math.sin(t) * 0.8
            if(rightLeg.current) rightLeg.current.rotation.x = Math.cos(t) * 0.8

            // Arms (Opposite to legs)
            if(leftArm.current) leftArm.current.rotation.x = Math.cos(t) * 0.6
            if(rightArm.current) rightArm.current.rotation.x = Math.sin(t) * 0.6
            
            // Bobbing effect
            group.current.position.y = Math.abs(Math.sin(t)) * 0.05
        } else if (isJumping) {
            // Jump Pose: Arms up, legs split slightly
            if(leftArm.current) leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, -2.5, 0.1)
            if(rightArm.current) rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, -2.5, 0.1)
            if(leftLeg.current) leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, 0.5, 0.1)
            if(rightLeg.current) rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, -0.2, 0.1)
        } else {
            // Idle: Breathing
            if(leftArm.current) leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, 0, 0.1)
            if(rightArm.current) rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, 0, 0.1)
            if(leftLeg.current) leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, 0, 0.1)
            if(rightLeg.current) rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, 0, 0.1)
            group.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02
        }

        // 2. Lean into turns (Artistic Polish)
        // Calculate lean based on horizontal velocity interaction
        const leanAmount = -velocity.x * 0.05
        group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, leanAmount, 0.1)
    })

    return (
        <group ref={group}>
            {/* HEAD */}
            <group position={[0, 0.75, 0]} ref={head}>
                <mesh material={LegoMaterial} castShadow receiveShadow>
                    <cylinderGeometry args={[0.18, 0.18, 0.25, 16]} />
                    <meshStandardMaterial color="#FFD700" roughness={0.2} /> {/* Classic Yellow */}
                </mesh>
                {/* Knob on head */}
                <mesh position={[0, 0.15, 0]} castShadow>
                    <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
                    <meshStandardMaterial color="#FFD700" roughness={0.2} />
                </mesh>
            </group>

            {/* TORSO */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                {/* Trapezoid approximation via simple box for now */}
                <boxGeometry args={[0.3, 0.45, 0.2]} />
                <meshStandardMaterial color="#0055BF" roughness={0.2} /> {/* Blue Shirt */}
            </mesh>

            {/* HIPS */}
            <mesh position={[0, 0.15, 0]} castShadow>
                <boxGeometry args={[0.32, 0.1, 0.2]} />
                <meshStandardMaterial color="#808080" roughness={0.2} /> 
            </mesh>

            {/* ARMS - Pivoted at top */}
            <group position={[-0.22, 0.55, 0]} ref={leftArm}>
                <mesh position={[0, -0.2, 0]} castShadow>
                    <boxGeometry args={[0.1, 0.35, 0.1]} />
                    <meshStandardMaterial color="#0055BF" />
                </mesh>
                <mesh position={[0, -0.4, 0]}> {/* Hand */}
                     <boxGeometry args={[0.08, 0.08, 0.08]} />
                     <meshStandardMaterial color="#FFD700" />
                </mesh>
            </group>

            {/* LEGS - Pivoted at hip */}
            <group position={[0.22, 0.55, 0]} ref={rightArm}>
                 <mesh position={[0, -0.2, 0]} castShadow>
                    <boxGeometry args={[0.1, 0.35, 0.1]} />
                    <meshStandardMaterial color="#0055BF" />
                </mesh>
                <mesh position={[0, -0.4, 0]}> {/* Hand */}
                     <boxGeometry args={[0.08, 0.08, 0.08]} />
                     <meshStandardMaterial color="#FFD700" />
                </mesh>
            </group>

            {/* LEGS - Pivoted at hip */}
            <group position={[-0.08, 0.1, 0]} ref={leftLeg}>
                <mesh position={[0, -0.2, 0]} castShadow>
                    <boxGeometry args={[0.13, 0.4, 0.18]} />
                    <meshStandardMaterial color="#808080" /> {/* Grey Pants */}
                </mesh>
            </group>

            <group position={[0.08, 0.1, 0]} ref={rightLeg}>
                <mesh position={[0, -0.2, 0]} castShadow>
                     <boxGeometry args={[0.13, 0.4, 0.18]} />
                     <meshStandardMaterial color="#808080" />
                </mesh>
            </group>
        </group>
    )
}

// --- 2. Voxel Particles (Cubes instead of circles) ---
const VoxelDust = ({ position, isMoving }: { position: THREE.Vector3, isMoving: boolean }) => {
    const particles = useRef<{ mesh: THREE.Mesh, life: number, velocity: THREE.Vector3, rotSpeed: THREE.Vector3 }[]>([])
    const group = useRef<THREE.Group>(null)
    const geometry = useMemo(() => new THREE.BoxGeometry(0.08, 0.08, 0.08), [])
    const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#cccccc', transparent: true, opacity: 0.6 }), [])

    useFrame((state, delta) => {
        if (!group.current) return
        if (isMoving && Math.random() < 0.3) { // Higher spawn rate
            const mesh = new THREE.Mesh(geometry, material.clone())
            // Spawn at feet
            mesh.position.set(
                position.x + (Math.random() - 0.5) * 0.4, 
                0.1, 
                position.z + (Math.random() - 0.5) * 0.4
            )
            group.current.add(mesh)
            particles.current.push({
                mesh,
                life: 1.0,
                velocity: new THREE.Vector3((Math.random() - 0.5) * 1, Math.random() * 2, (Math.random() - 0.5) * 1),
                rotSpeed: new THREE.Vector3(Math.random(), Math.random(), Math.random())
            })
        }
        for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i]
            p.life -= delta * 2.5
            p.velocity.y -= delta * 5 // Heavy gravity on cubes
            p.mesh.position.addScaledVector(p.velocity, delta)
            p.mesh.rotation.x += p.rotSpeed.x * delta * 5
            p.mesh.rotation.y += p.rotSpeed.y * delta * 5
            
            p.mesh.scale.setScalar(p.life)
            // @ts-ignore
            p.mesh.material.opacity = p.life
            
            if (p.life <= 0 || p.mesh.position.y < 0) {
                group.current.remove(p.mesh)
                p.mesh.geometry.dispose()
                // @ts-ignore
                p.mesh.material.dispose()
                particles.current.splice(i, 1)
            }
        }
    })
    return <group ref={group} />
}

export interface PlayerHandle {
    triggerInteraction: (label: string) => void
    moveTo: (target: THREE.Vector3, onComplete?: () => void) => void
}

interface PlayerProps {
    onPositionChange?: (pos: THREE.Vector3) => void
    initialPosition?: [number, number, number]
    bounds?: { width: number, depth: number }
}

const Player = React.forwardRef<PlayerHandle, PlayerProps>(({ onPositionChange, initialPosition = [0, 0.5, 0], bounds }, ref) => {
    const group = useRef<THREE.Group>(null)
    
    // Physics Logic
    const velocity = useRef(new THREE.Vector3(0, 0, 0))
    const verticalVelocity = useRef(0)
    const currentPosition = useRef(new THREE.Vector3(...initialPosition))
    const isMoving = useRef(false)
    const isJumping = useRef(false)
    const facingAngle = useRef(0)

    // Pathfinding
    const path = useRef<THREE.Vector3[]>([])
    const currentPathTargetIndex = useRef(0)
    const onMoveComplete = useRef<(() => void) | undefined>(undefined)

    // React State for passing to visual components
    const [visualState, setVisualState] = useState({ moving: false, jumping: false })

    // Input state
    const keys = useRef<{ [key: string]: boolean }>({})
    const [interactionLabel, setInteractionLabel] = useState<string | null>(null)
    const interactionTimer = useRef<number>(0)
    const [sparkleTrigger, setSparkleTrigger] = useState(false)

    useImperativeHandle(ref, () => ({
        triggerInteraction: (label: string) => {
            setInteractionLabel(label)
            interactionTimer.current = 1.5
            velocity.current.set(0, 0, 0)
            isMoving.current = false
            setSparkleTrigger(true)
            path.current = [] // Clear path
            onMoveComplete.current = undefined
        },
        moveTo: (target: THREE.Vector3, onComplete?: () => void) => {
            // Use A* to find path
            const calculatedPath = findPath(currentPosition.current, target)
            if (calculatedPath.length > 0) {
                path.current = calculatedPath
                currentPathTargetIndex.current = 0
                onMoveComplete.current = onComplete
            }
        }
    }))

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keys.current[e.key] = true
            if (e.code === 'Space' && !isJumping.current && interactionTimer.current <= 0) {
                verticalVelocity.current = JUMP_FORCE
                isJumping.current = true
            }
            // Cancel path movement on manual input
            if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                path.current = []
                onMoveComplete.current = undefined
            }
        }
        const handleKeyUp = (e: KeyboardEvent) => keys.current[e.key] = false
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    useFrame((state, delta) => {
        if (!group.current) return

        // Interaction freeze
        if (interactionTimer.current > 0) {
            interactionTimer.current -= delta
            if (interactionTimer.current <= 0) setInteractionLabel(null)
            // Celebration Spin
            group.current.rotation.y += 15 * delta
            return
        }

        // --- Movement Physics ---
        const inputVector = new THREE.Vector3(0, 0, 0)

        // Manual Input
        if (keys.current['w'] || keys.current['ArrowUp']) inputVector.z -= 1
        if (keys.current['s'] || keys.current['ArrowDown']) inputVector.z += 1
        if (keys.current['a'] || keys.current['ArrowLeft']) inputVector.x -= 1
        if (keys.current['d'] || keys.current['ArrowRight']) inputVector.x += 1

        // Path Following (if no manual input)
        if (inputVector.length() === 0 && path.current.length > 0) {
            const target = path.current[currentPathTargetIndex.current]
            const toTarget = target.clone().sub(currentPosition.current)
            toTarget.y = 0

            if (toTarget.length() < 0.2) {
                // Reached node
                currentPathTargetIndex.current++
                if (currentPathTargetIndex.current >= path.current.length) {
                    path.current = [] // Reached end
                    if (onMoveComplete.current) {
                        onMoveComplete.current()
                        onMoveComplete.current = undefined
                    }
                }
            } else {
                inputVector.copy(toTarget.normalize())
            }
        }

        if (inputVector.length() > 0) {
            if (inputVector.length() > 1) inputVector.normalize() // Already normalized mostly, but just in case
            isMoving.current = true
            // Calculate target rotation based on movement direction
            facingAngle.current = Math.atan2(inputVector.x, inputVector.z)
        } else {
            isMoving.current = false
        }

        // Apply Velocity
        if (isMoving.current) {
            velocity.current.addScaledVector(inputVector, ACCELERATION * delta)
        }
        
        // Cap Speed
        if (velocity.current.length() > SPEED) velocity.current.setLength(SPEED)

        // Friction
        const frictionForce = velocity.current.clone().multiplyScalar(-1).normalize().multiplyScalar(FRICTION * delta)
        if (velocity.current.length() < frictionForce.length()) velocity.current.set(0, 0, 0)
        else velocity.current.add(frictionForce)

        // Apply Movement
        currentPosition.current.addScaledVector(velocity.current, delta)

        // Bounds
        if (bounds) {
            const halfW = bounds.width / 2 - 0.5
            const halfD = bounds.depth / 2 - 0.5
            currentPosition.current.x = THREE.MathUtils.clamp(currentPosition.current.x, -halfW, halfW)
            currentPosition.current.z = THREE.MathUtils.clamp(currentPosition.current.z, -halfD, halfD)
        }

        // Gravity & Jump
        verticalVelocity.current -= GRAVITY * delta
        let currentY = group.current.position.y + verticalVelocity.current * delta

        if (currentY <= 0) { // Ground level is 0
            currentY = 0
            verticalVelocity.current = 0
            isJumping.current = false
        } else {
            isJumping.current = true
        }

        // Sync State to Ref (for React re-renders only when state changes significantly could optimize, but this is fine)
        if (visualState.moving !== isMoving.current || visualState.jumping !== isJumping.current) {
            setVisualState({ moving: isMoving.current, jumping: isJumping.current })
        }

        // Update Group Transforms
        group.current.position.set(currentPosition.current.x, currentY, currentPosition.current.z)
        
        // Smooth Rotation Logic (The Artist's touch: smooth turns, not snapping)
        if (isMoving.current) {
            const q = new THREE.Quaternion()
            q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), facingAngle.current)
            group.current.quaternion.slerp(q, ROTATION_SMOOTHING * delta)
        }

        if (onPositionChange) onPositionChange(currentPosition.current)
    })

    return (
        <>
            <TeleportSparkle
                position={group.current ? group.current.position : new THREE.Vector3(...initialPosition)}
                trigger={sparkleTrigger}
                onComplete={() => setSparkleTrigger(false)}
            />

            {/* Interaction UI */}
            {interactionLabel && (
                <Html position={[currentPosition.current.x, currentPosition.current.y + 2, currentPosition.current.z]} center>
                    <div style={{
                        fontFamily: '"Press Start 2P", monospace',
                        color: '#FFF',
                        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '3px solid white',
                        boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                        transform: 'scale(1.0)',
                        animation: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        <div style={{ fontSize: '24px', marginBottom: '2px', textShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>★</div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', textShadow: '1px 1px 0 rgba(0,0,0,0.2)' }}>{interactionLabel}</div>
                    </div>
                </Html>
            )}

            <group ref={group} position={initialPosition}>
                <LegoAvatar 
                    isMoving={visualState.moving} 
                    isJumping={visualState.jumping} 
                    velocity={velocity.current} // Pass velocity for the lean effect
                />
            </group>

            {/* Blob Shadow - Simple but effective for Lego */}
            <mesh 
                position={[currentPosition.current.x, 0.02, currentPosition.current.z]} 
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <circleGeometry args={[0.35, 32]} />
                <meshBasicMaterial color="black" transparent opacity={0.25} />
            </mesh>

            <VoxelDust position={currentPosition.current} isMoving={visualState.moving && !visualState.jumping} />
        </>
    )
})

export default Player
