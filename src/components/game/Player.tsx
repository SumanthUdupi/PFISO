import React, { useRef, useEffect, useState, useMemo, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html, CameraShake } from '@react-three/drei'
import TeleportSparkle from './TeleportSparkle'
import LegoCharacter from './LegoCharacter'
import { findPath } from '../../utils/pathfinding'
import useAudioStore from '../../audioStore'

// --- CONFIGURATION ---
const SPEED = 6
const ACCELERATION = 40
const FRICTION = 12
const JUMP_FORCE = 9
const GRAVITY = 25
const ROTATION_SMOOTHING = 15

// Game Feel Config
const COYOTE_TIME = 0.15 // seconds
const JUMP_BUFFER = 0.15 // seconds

// --- 1. THE ART: 3D Lego Character (Replaces 2D Sprite) ---
// See LegoCharacter.tsx for implementation

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

    // Jump Feel Logic
    const airTime = useRef(0) // Time since leaving ground (Coyote Time)
    const jumpBufferTimer = useRef(0) // Time since jump pressed (Jump Buffer)
    const wasGrounded = useRef(true)
    const { playSound } = useAudioStore()
    const [shakeIntensity, setShakeIntensity] = useState(0)

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
            if (e.code === 'Space') {
                jumpBufferTimer.current = JUMP_BUFFER // Buffer the jump
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

        // --- Gravity & Jump Logic (Enhanced) ---
        verticalVelocity.current -= GRAVITY * delta
        let currentY = group.current.position.y + verticalVelocity.current * delta

        const isGrounded = currentY <= 0; // Simple floor check (add more raycasting if needed for platforms)

        if (isGrounded) {
            currentY = 0;
            verticalVelocity.current = 0;
            isJumping.current = false;
            airTime.current = 0; // Reset Coyote Time

            // Landing feedback
            if (!wasGrounded.current) {
                // Landed this frame
                setShakeIntensity(0.2) // Small shake
                setTimeout(() => setShakeIntensity(0), 100)
                playSound('land')
                // Add squash animation via ref if possible? (Simulated in LegoAvatar)
            }
        } else {
            isJumping.current = true;
            airTime.current += delta;
        }

        wasGrounded.current = isGrounded;

        // Handle Jump Buffer Timer
        if (jumpBufferTimer.current > 0) {
            jumpBufferTimer.current -= delta;
        }

        // Trigger Jump
        // Conditions:
        // 1. Jump buffered recently (jumpBufferTimer > 0)
        // 2. Can jump: Either grounded OR within Coyote Time (airTime < COYOTE_TIME) AND not already jumping up (verticalVelocity <= 0)
        //    (Note: "not already jumping" check prevents double jumps from coyote time glitch, but coyote usually implies falling off ledge)
        if (jumpBufferTimer.current > 0 && (isGrounded || airTime.current < COYOTE_TIME) && interactionTimer.current <= 0) {
            verticalVelocity.current = JUMP_FORCE;
            isJumping.current = true;
            jumpBufferTimer.current = 0; // Consume buffer
            playSound('jump');
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
            <CameraShake
                maxPitch={0.05}
                maxRoll={0.05}
                maxYaw={0.05}
                intensity={shakeIntensity}
                decayRate={0.65}
                decay
            />

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
                {/* Avatar Offset: Adjusted to align feet with y=0 ground level */}
                <group position={[0, 0.3, 0]}>
                    <LegoCharacter
                        isMoving={visualState.moving}
                    />
                </group>
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
