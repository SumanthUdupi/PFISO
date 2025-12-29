import React, { useRef, useEffect, useState, useMemo, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html, CameraShake } from '@react-three/drei'
import TeleportSparkle from './TeleportSparkle'
import RobloxCharacter from './RobloxCharacter'
import { findPath } from '../../utils/pathfinding'
import useAudioStore from '../../audioStore'
import useControlsStore from '../../stores/controlsStore'

// --- TUNING CONSTANTS ---
const MOVE_SPEED = 6
const ACCELERATION_GROUND = 60
const ACCELERATION_AIR = 15 // Less control in air
const FRICTION_GROUND = 15
const FRICTION_AIR = 2 // Air drag
const JUMP_FORCE = 10
const GRAVITY = 30
const ROTATION_SPEED = 12

// Game Feel
const COYOTE_TIME = 0.15 
const JUMP_BUFFER = 0.15
const JUMP_CUT_HEIGHT = 0.5 // How much velocity is retained if key released early
const TILT_AMOUNT = 0.15 // How much to lean forward when running
const BANK_AMOUNT = 0.15 // How much to lean into turns

// --- HELPER: Spring Physics for Squash/Stretch ---
class Spring {
    val: number = 1
    target: number = 1
    vel: number = 0
    stiffness: number
    damping: number

    constructor(stiffness = 200, damping = 15) {
        this.stiffness = stiffness
        this.damping = damping
    }

    update(dt: number) {
        const force = (this.target - this.val) * this.stiffness
        this.vel += force * dt
        this.vel *= Math.max(0, 1 - this.damping * dt) // Damping
        this.val += this.vel * dt
    }

    impulse(force: number) {
        this.vel += force
    }
}

// --- PARTICLES: Directional Dust ---
const VoxelDust = ({ position, velocity, isGrounded }: { position: THREE.Vector3, velocity: THREE.Vector3, isGrounded: boolean }) => {
    const particles = useRef<{ mesh: THREE.Mesh, life: number, velocity: THREE.Vector3, rotSpeed: THREE.Vector3 }[]>([])
    const group = useRef<THREE.Group>(null)
    const geometry = useMemo(() => new THREE.BoxGeometry(0.06, 0.06, 0.06), []) // Smaller, finer dust
    const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#dddddd', transparent: true }), [])

    useFrame((state, delta) => {
        if (!group.current) return

        const speed = new THREE.Vector3(velocity.x, 0, velocity.z).length()
        
        // Spawn dust if moving fast on ground
        if (isGrounded && speed > 2 && Math.random() < 0.4) {
            const mesh = new THREE.Mesh(geometry, material.clone())
            
            // Spawn at feet, slightly offset behind movement
            const kickDir = velocity.clone().normalize().negate().multiplyScalar(0.2)
            const spread = new THREE.Vector3((Math.random()-0.5)*0.3, 0, (Math.random()-0.5)*0.3)
            
            mesh.position.copy(position).add(new THREE.Vector3(0, 0.05, 0)).add(kickDir).add(spread)
            
            group.current.add(mesh)
            
            particles.current.push({
                mesh,
                life: 1.0,
                // Kick dust up and back
                velocity: kickDir.add(new THREE.Vector3(0, Math.random() * 1.5, 0)), 
                rotSpeed: new THREE.Vector3(Math.random()*10, Math.random()*10, Math.random()*10)
            })
        }

        // Update Particles
        for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i]
            p.life -= delta * 3.0 // Fast fade
            p.velocity.y -= delta * 3 // Gravity
            p.mesh.position.addScaledVector(p.velocity, delta)
            p.mesh.rotation.x += p.rotSpeed.x * delta
            p.mesh.rotation.y += p.rotSpeed.y * delta
            
            p.mesh.scale.setScalar(p.life)
            // @ts-ignore
            p.mesh.material.opacity = p.life

            if (p.life <= 0) {
                group.current.remove(p.mesh)
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

const Player = React.forwardRef<PlayerHandle, PlayerProps>(({ onPositionChange, initialPosition = [0, 0, 0], bounds }, ref) => {
    // Refs for Scene Objects
    const group = useRef<THREE.Group>(null)       // Holds everything
    const visualGroup = useRef<THREE.Group>(null) // Used for squash/stretch
    const rotateGroup = useRef<THREE.Group>(null) // Used for banking/tilting

    // Physics State
    const position = useRef(new THREE.Vector3(...initialPosition))
    const velocity = useRef(new THREE.Vector3(0, 0, 0))
    const verticalVel = useRef(0)
    const targetRotation = useRef(0)
    const currentRotation = useRef(0)

    // Game Feel State
    const isGrounded = useRef(true)
    const coyoteTimer = useRef(0)
    const jumpBufferTimer = useRef(0)
    const jumpHeld = useRef(false)
    
    // Procedural Animation State
    const squashSpring = useRef(new Spring(150, 15)) // Stiff spring for "Toy" feel
    const tilt = useRef(0)
    const bank = useRef(0)

    // React State
    const [interactionLabel, setInteractionLabel] = useState<string | null>(null)
    const [interactionTimer, setInteractionTimer] = useState(0)
    const [shakeIntensity, setShakeIntensity] = useState(0)
    const [sparkleTrigger, setSparkleTrigger] = useState(false)
    const [isMovingVisual, setIsMovingVisual] = useState(false)

    // Pathfinding & Controls
    const path = useRef<THREE.Vector3[]>([])
    const currentPathIndex = useRef(0)
    const onMoveComplete = useRef<(() => void) | undefined>(undefined)
    const { joystick, isActionPressed } = useControlsStore()
    const prevAction = useRef(false)
    const keys = useRef<{ [key: string]: boolean }>({})

    const { playSound } = useAudioStore()

    // --- API ---
    useImperativeHandle(ref, () => ({
        triggerInteraction: (label: string) => {
            setInteractionLabel(label)
            setInteractionTimer(1.5)
            velocity.current.set(0, 0, 0)
            setSparkleTrigger(true)
            path.current = []
        },
        moveTo: (target: THREE.Vector3, onComplete?: () => void) => {
            const calculatedPath = findPath(position.current, target)
            if (calculatedPath.length > 0) {
                path.current = calculatedPath
                currentPathIndex.current = 0
                onMoveComplete.current = onComplete
            }
        }
    }))

    // --- INPUT HANDLING ---
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            keys.current[e.key] = true
            if (e.code === 'Space') {
                jumpBufferTimer.current = JUMP_BUFFER
                jumpHeld.current = true
            }
            if (['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
                path.current = [] // Cancel auto-pathing
            }
        }
        const onKeyUp = (e: KeyboardEvent) => {
            keys.current[e.key] = false
            if (e.code === 'Space') jumpHeld.current = false
        }
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [])

    useEffect(() => {
        if (Math.abs(joystick.x) > 0.1 || Math.abs(joystick.y) > 0.1) path.current = []
    }, [joystick])

    // --- PHYSICS LOOP ---
    useFrame((state, delta) => {
        if (!group.current || !visualGroup.current || !rotateGroup.current) return

        // 1. Interaction Freeze
        if (interactionTimer > 0) {
            setInteractionTimer(t => t - delta)
            if (interactionTimer < 0) setInteractionLabel(null)
            visualGroup.current.rotation.y += 10 * delta // Celebration spin
            return
        }

        // 2. Input Calculation
        const input = new THREE.Vector3(0, 0, 0)
        if (keys.current['w'] || keys.current['ArrowUp']) input.z -= 1
        if (keys.current['s'] || keys.current['ArrowDown']) input.z += 1
        if (keys.current['a'] || keys.current['ArrowLeft']) input.x -= 1
        if (keys.current['d'] || keys.current['ArrowRight']) input.x += 1
        
        // Joystick override
        if (Math.abs(joystick.x) > 0.1) input.x += joystick.x
        if (Math.abs(joystick.y) > 0.1) input.z += joystick.y // Invert logic handled in input

        // Pathfinding override
        if (input.lengthSq() === 0 && path.current.length > 0) {
            const target = path.current[currentPathIndex.current]
            const dir = target.clone().sub(position.current)
            dir.y = 0
            if (dir.length() < 0.2) {
                currentPathIndex.current++
                if (currentPathIndex.current >= path.current.length) {
                    path.current = []
                    onMoveComplete.current?.()
                }
            } else {
                input.copy(dir.normalize())
            }
        }

        // Normalize input
        if (input.length() > 1) input.normalize()

        // 3. Movement Physics
        const accel = isGrounded.current ? ACCELERATION_GROUND : ACCELERATION_AIR
        const friction = isGrounded.current ? FRICTION_GROUND : FRICTION_AIR

        // Apply Acceleration
        velocity.current.addScaledVector(input, accel * delta)

        // Apply Friction
        const speed = velocity.current.length()
        if (speed > 0) {
            const drop = speed * friction * delta
            const newSpeed = Math.max(0, speed - drop)
            if (speed > MOVE_SPEED) {
                // Soft cap for speed (allow bursts but decay back to max)
                 velocity.current.multiplyScalar(MOVE_SPEED / speed)
            } else {
                 velocity.current.multiplyScalar(newSpeed / speed)
            }
        }

        // Apply Velocity to Position
        position.current.addScaledVector(velocity.current, delta)

        // Bounds
        if (bounds) {
            position.current.x = THREE.MathUtils.clamp(position.current.x, -bounds.width/2 + 0.5, bounds.width/2 - 0.5)
            position.current.z = THREE.MathUtils.clamp(position.current.z, -bounds.depth/2 + 0.5, bounds.depth/2 - 0.5)
        }

        // 4. Rotation & Banking
        const moving = velocity.current.lengthSq() > 0.1
        if (moving) {
            // Calculate target angle
            targetRotation.current = Math.atan2(velocity.current.x, velocity.current.z)
            
            // Shortest path angle interpolation
            let angleDiff = targetRotation.current - currentRotation.current
            // Normalize to -PI to PI
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2

            // Smooth rotation
            const rotChange = angleDiff * ROTATION_SPEED * delta
            currentRotation.current += rotChange

            // Calculate "Centripetal Force" for banking
            // If we are turning sharply at high speed, bank more
            const turnRate = rotChange / delta // rads per second
            const targetBank = -turnRate * 0.05 * (speed / MOVE_SPEED) // Negative because we lean INTO turn
            
            bank.current = THREE.MathUtils.lerp(bank.current, THREE.MathUtils.clamp(targetBank, -BANK_AMOUNT, BANK_AMOUNT), 10 * delta)
        } else {
            bank.current = THREE.MathUtils.lerp(bank.current, 0, 5 * delta)
        }
        
        // Tilt (Forward/Back) based on acceleration/speed
        // Leaning forward when accelerating
        const dotProd = input.dot(velocity.current.clone().normalize())
        const targetTilt = (speed / MOVE_SPEED) * TILT_AMOUNT * dotProd
        tilt.current = THREE.MathUtils.lerp(tilt.current, targetTilt, 5 * delta)

        rotateGroup.current.rotation.y = currentRotation.current
        rotateGroup.current.rotation.z = bank.current
        rotateGroup.current.rotation.x = tilt.current

        // 5. Jump Physics
        // Update Timers
        if (jumpBufferTimer.current > 0) jumpBufferTimer.current -= delta
        if (!isGrounded.current) coyoteTimer.current += delta

        // Jump Input (Action Button)
        if (isActionPressed && !prevAction.current) {
            jumpBufferTimer.current = JUMP_BUFFER
            jumpHeld.current = true
        }
        if (!isActionPressed && prevAction.current) {
            jumpHeld.current = false
        }
        prevAction.current = isActionPressed

        // Gravity
        verticalVel.current -= GRAVITY * delta

        // Execute Jump
        if (jumpBufferTimer.current > 0 && (isGrounded.current || coyoteTimer.current < COYOTE_TIME)) {
            verticalVel.current = JUMP_FORCE
            isGrounded.current = false
            coyoteTimer.current = 100 // invalidate coyote
            jumpBufferTimer.current = 0
            
            // Visuals
            squashSpring.current.impulse(3.0) // Stretch up
            playSound('jump')
        }

        // Variable Jump Height (Jump Cut)
        if (!jumpHeld.current && verticalVel.current > 0) {
            verticalVel.current *= JUMP_CUT_HEIGHT // Cut velocity instantly for shorter hop
        }

        // Vertical Movement
        position.current.y += verticalVel.current * delta

        // Ground Collision
        if (position.current.y <= 0) {
            position.current.y = 0
            if (!isGrounded.current) {
                // Landed this frame
                isGrounded.current = true
                verticalVel.current = 0
                coyoteTimer.current = 0
                
                // Landing Juice
                squashSpring.current.impulse(-4.0) // Hard squash down
                setShakeIntensity(0.15)
                setTimeout(() => setShakeIntensity(0), 100)
                playSound('land')
            }
        } else {
            isGrounded.current = false
        }

        // 6. Squash & Stretch Simulation
        squashSpring.current.update(delta)
        // Map spring value (1 is normal, <1 squash, >1 stretch) to scale
        // Maintain volume: if Y scales down, X/Z should scale up
        const scaleY = squashSpring.current.val
        const scaleXZ = 1 / Math.sqrt(scaleY) 
        
        visualGroup.current.scale.set(scaleXZ, scaleY, scaleXZ)
        
        // Update Transforms
        group.current.position.copy(position.current)
        
        // Update React State for Child Props (only if changed significantly)
        if (moving !== isMovingVisual) setIsMovingVisual(moving)
    })

    // Calculate Shadow Scale
    // Simple mock: Scale goes down as Y goes up
    const shadowScale = useRef(1)
    useFrame(() => {
        const height = Math.max(0, position.current.y)
        // Shadow gets smaller and more transparent as we go up
        shadowScale.current = THREE.MathUtils.lerp(shadowScale.current, Math.max(0, 1 - height * 0.5), 0.1)
    })

    return (
        <>
            <CameraShake 
                maxPitch={0.05} maxRoll={0.05} maxYaw={0.05} 
                intensity={shakeIntensity} 
                decay decayRate={0.65} 
            />

            <TeleportSparkle 
                position={position.current} 
                trigger={sparkleTrigger} 
                onComplete={() => setSparkleTrigger(false)} 
            />

            {interactionLabel && (
                <Html position={[position.current.x, position.current.y + 2, position.current.z]} center>
                    <div style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: '800',
                        color: 'white',
                        textShadow: '0px 2px 0px rgba(0,0,0,0.2)',
                        background: '#222',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '2px solid white',
                        animation: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                       E - {interactionLabel}
                    </div>
                </Html>
            )}

            <group ref={group}>
                <group ref={rotateGroup}>
                    {/* Visual Offset: Pivot point is at feet, so visual group is 0 */}
                    <group ref={visualGroup}>
                        <RobloxCharacter isMoving={isMovingVisual && isGrounded.current} />
                    </group>
                </group>
            </group>

            {/* Dynamic Shadow */}
            <mesh 
                position={[position.current.x, 0.01, position.current.z]} 
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[shadowScale.current, shadowScale.current, 1]}
            >
                <circleGeometry args={[0.35, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.25 * shadowScale.current} />
            </mesh>

            <VoxelDust 
                position={position.current} 
                velocity={velocity.current} 
                isGrounded={isGrounded.current} 
            />
        </>
    )
})

export default Player
