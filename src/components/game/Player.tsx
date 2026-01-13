import React, { useRef, useEffect, useState, useMemo, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html, CameraShake } from '@react-three/drei'
import TeleportSparkle from './TeleportSparkle'
import RobloxCharacter from './RobloxCharacter'
import { findPath } from '../../utils/pathfinding'
import useAudioStore from '../../audioStore'
import useControlsStore from '../../stores/controlsStore'
import physicsInstance, { RigidBody } from '../../systems/PhysicsSystem'
import gameSystemInstance from '../../systems/GameSystem'

// --- TUNING CONSTANTS ---
const MOVE_SPEED = 6
const ACCELERATION_GROUND = 60
const ACCELERATION_AIR = 15
const FRICTION_GROUND = 15
const FRICTION_AIR = 2
const JUMP_FORCE = 12 // Slightly higher for custom physics
const ROTATION_SPEED = 12

// Game Feel
const COYOTE_TIME = 0.15
const JUMP_BUFFER = 0.15
const JUMP_CUT_HEIGHT = 0.5
const TILT_AMOUNT = 0.15
const BANK_AMOUNT = 0.15

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
        this.vel *= Math.max(0, 1 - this.damping * dt)
        this.val += this.vel * dt
    }

    impulse(force: number) {
        this.vel += force
    }
}

// --- PARTICLES: Directional Dust ---
// (Kept identical for visual flair)
const VoxelDust = ({ position, velocity, isGrounded }: { position: THREE.Vector3, velocity: THREE.Vector3, isGrounded: boolean }) => {
    const particles = useRef<{ mesh: THREE.Mesh, life: number, velocity: THREE.Vector3, rotSpeed: THREE.Vector3 }[]>([])
    const group = useRef<THREE.Group>(null)
    const geometry = useMemo(() => new THREE.BoxGeometry(0.06, 0.06, 0.06), [])
    const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#dddddd', transparent: true }), [])

    useFrame((state, delta) => {
        if (!group.current) return
        const speed = new THREE.Vector3(velocity.x, 0, velocity.z).length()
        if (isGrounded && speed > 2 && Math.random() < 0.4) {
            const mesh = new THREE.Mesh(geometry, material.clone())
            const kickDir = velocity.clone().normalize().negate().multiplyScalar(0.2)
            const spread = new THREE.Vector3((Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.3)
            mesh.position.copy(position).add(new THREE.Vector3(0, 0.05, 0)).add(kickDir).add(spread)
            group.current.add(mesh)
            particles.current.push({
                mesh, life: 1.0,
                velocity: kickDir.add(new THREE.Vector3(0, Math.random() * 1.5, 0)),
                rotSpeed: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10)
            })
        }
        for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i]
            p.life -= delta * 3.0
            p.velocity.y -= delta * 3
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
    const group = useRef<THREE.Group>(null)
    const visualGroup = useRef<THREE.Group>(null)
    const rotateGroup = useRef<THREE.Group>(null)

    // --- PHYSICS SYSTEM INTEGRATION ---
    const bodyRef = useRef<RigidBody | null>(null)

    useEffect(() => {
        // Create Physics Body
        const initialPos = new THREE.Vector3(...initialPosition)
        const body: RigidBody = {
            id: 'player',
            position: initialPos.clone(),
            velocity: new THREE.Vector3(),
            mass: 70,
            restitution: 0,
            friction: 0.1,
            linearDamping: 0.5,
            isGrounded: false,
            collider: {
                id: 'player_col',
                type: 'capsule',
                radius: 0.3,
                height: 1.2,
                object: group.current!, // Placeholder
                isStatic: false,
                isTrigger: false
            }
        }
        physicsInstance.addBody(body)
        bodyRef.current = body

        return () => {
            physicsInstance.removeBody('player')
        }
    }, []) // Run once

    // Game Feel State
    const coyoteTimer = useRef(0)
    const jumpBufferTimer = useRef(0)
    const jumpHeld = useRef(false)

    // Procedural Animation State
    const squashSpring = useRef(new Spring(150, 15))
    const tilt = useRef(0)
    const bank = useRef(0)
    const currentRotation = useRef(0)

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
            if (bodyRef.current) bodyRef.current.velocity.set(0, 0, 0)
            setSparkleTrigger(true)
            path.current = []
        },
        moveTo: (target: THREE.Vector3, onComplete?: () => void) => {
            if (!bodyRef.current) return
            const calculatedPath = findPath(bodyRef.current.position, target)
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
            if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                path.current = []
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

    // --- MAIN LOOP ---
    useFrame((state, delta) => {
        // Tick the Game System Update logic
        // In a real ECS refactor this would be outside components, but for now we bridge here
        gameSystemInstance.update(state.clock.elapsedTime, delta)

        if (!group.current || !visualGroup.current || !rotateGroup.current || !bodyRef.current) return
        const body = bodyRef.current

        // 1. Interaction Freeze
        if (interactionTimer > 0) {
            setInteractionTimer(t => t - delta)
            if (interactionTimer < 0) setInteractionLabel(null)
            visualGroup.current.rotation.y += 10 * delta
            return
        }

        // 2. Input Calculation
        const input = new THREE.Vector3(0, 0, 0)
        if (keys.current['w'] || keys.current['ArrowUp']) input.z -= 1
        if (keys.current['s'] || keys.current['ArrowDown']) input.z += 1
        if (keys.current['a'] || keys.current['ArrowLeft']) input.x -= 1
        if (keys.current['d'] || keys.current['ArrowRight']) input.x += 1

        if (Math.abs(joystick.x) > 0.1) input.x += joystick.x
        if (Math.abs(joystick.y) > 0.1) input.z += joystick.y

        // Pathfinding override
        if (input.lengthSq() === 0 && path.current.length > 0) {
            const target = path.current[currentPathIndex.current]
            const dir = target.clone().sub(body.position)
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

        if (input.length() > 1) input.normalize()

        // 3. Movement Physics Application (Force-based now)
        const accel = body.isGrounded ? ACCELERATION_GROUND : ACCELERATION_AIR
        const friction = body.isGrounded ? FRICTION_GROUND : FRICTION_AIR

        // Apply Input Acceleration
        // Note: In custom physics this modifies velocity directly instead of force for tighter control
        body.velocity.addScaledVector(input, accel * delta)

        // Apply Friction
        const speed = body.velocity.length()
        const horizontalVel = new THREE.Vector3(body.velocity.x, 0, body.velocity.z)
        const horizontalSpeed = horizontalVel.length()

        if (horizontalSpeed > 0) {
            const drop = horizontalSpeed * friction * delta
            const newSpeed = Math.max(0, horizontalSpeed - drop)

            // Reconstruct velocity preserving Y
            if (horizontalSpeed > MOVE_SPEED) {
                // Soft cap
                const ratio = MOVE_SPEED / horizontalSpeed
                body.velocity.x *= ratio
                body.velocity.z *= ratio
            } else {
                const ratio = newSpeed / horizontalSpeed
                body.velocity.x *= ratio
                body.velocity.z *= ratio
            }
        }

        // Bounds Check (Legacy, but good safety)
        if (bounds) {
            body.position.x = THREE.MathUtils.clamp(body.position.x, -bounds.width / 2 + 0.5, bounds.width / 2 - 0.5)
            body.position.z = THREE.MathUtils.clamp(body.position.z, -bounds.depth / 2 + 0.5, bounds.depth / 2 - 0.5)
        }

        // 4. Rotation & Banking
        const moving = horizontalSpeed > 0.1
        if (moving) {
            const targetRot = Math.atan2(body.velocity.x, body.velocity.z)
            let angleDiff = targetRot - currentRotation.current
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2

            const rotChange = angleDiff * ROTATION_SPEED * delta
            currentRotation.current += rotChange

            const turnRate = rotChange / delta
            const targetBank = -turnRate * 0.05 * (horizontalSpeed / MOVE_SPEED)
            bank.current = THREE.MathUtils.lerp(bank.current, THREE.MathUtils.clamp(targetBank, -BANK_AMOUNT, BANK_AMOUNT), 10 * delta)
        } else {
            bank.current = THREE.MathUtils.lerp(bank.current, 0, 5 * delta)
        }

        const dotProd = input.dot(horizontalVel.clone().normalize())
        const targetTilt = (horizontalSpeed / MOVE_SPEED) * TILT_AMOUNT * dotProd
        tilt.current = THREE.MathUtils.lerp(tilt.current, targetTilt, 5 * delta)

        // Apply Rotations
        rotateGroup.current.rotation.y = currentRotation.current
        rotateGroup.current.rotation.z = bank.current
        rotateGroup.current.rotation.x = tilt.current

        // 5. Jump Physics
        if (jumpBufferTimer.current > 0) jumpBufferTimer.current -= delta
        if (!body.isGrounded) coyoteTimer.current += delta
        else coyoteTimer.current = 0

        if (isActionPressed && !prevAction.current) {
            jumpBufferTimer.current = JUMP_BUFFER
            jumpHeld.current = true
        }
        if (!isActionPressed && prevAction.current) {
            jumpHeld.current = false
        }
        prevAction.current = isActionPressed

        // Execute Jump using Physics Velocity
        if (jumpBufferTimer.current > 0 && (body.isGrounded || coyoteTimer.current < COYOTE_TIME)) {
            body.velocity.y = JUMP_FORCE
            body.isGrounded = false
            coyoteTimer.current = 100
            jumpBufferTimer.current = 0

            squashSpring.current.impulse(3.0)
            playSound('jump')
        }

        // Variable Jump Height
        if (!jumpHeld.current && body.velocity.y > 0) {
            body.velocity.y *= JUMP_CUT_HEIGHT
        }

        // 6. Sync Visuals to Physics Body
        group.current.position.copy(body.position)

        // Callback for camera/others
        if (onPositionChange) onPositionChange(body.position)

        // Squash & Stretch
        squashSpring.current.update(delta)
        const scaleY = squashSpring.current.val
        const scaleXZ = 1 / Math.sqrt(scaleY)
        visualGroup.current.scale.set(scaleXZ, scaleY, scaleXZ)

        if (moving !== isMovingVisual) setIsMovingVisual(moving)

        // Ground impact logic could be improved by checking velocity delta in physics step
        // But for "landing juice", checking isGrounded transition is fine.
    })

    const shadowScale = useRef(1)
    useFrame(() => {
        if (!bodyRef.current) return
        const height = Math.max(0, bodyRef.current.position.y)
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
                position={bodyRef.current?.position || new THREE.Vector3()}
                trigger={sparkleTrigger}
                onComplete={() => setSparkleTrigger(false)}
            />
            {interactionLabel && bodyRef.current && (
                <Html position={[bodyRef.current.position.x, bodyRef.current.position.y + 2, bodyRef.current.position.z]} center>
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
                    <group ref={visualGroup}>
                        <RobloxCharacter isMoving={isMovingVisual && (bodyRef.current?.isGrounded ?? true)} />
                    </group>
                </group>
            </group>

            {bodyRef.current && (
                <mesh
                    position={[bodyRef.current.position.x, 0.01, bodyRef.current.position.z]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    scale={[shadowScale.current, shadowScale.current, 1]}
                >
                    <circleGeometry args={[0.35, 32]} />
                    <meshBasicMaterial color="#000000" transparent opacity={0.25 * shadowScale.current} />
                </mesh>
            )}
            {bodyRef.current && (
                <VoxelDust
                    position={bodyRef.current.position}
                    velocity={bodyRef.current.velocity}
                    isGrounded={bodyRef.current.isGrounded}
                />
            )}
        </>
    )
})

export default Player
