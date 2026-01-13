import React, { useRef, useEffect, useState, useMemo, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html, CameraShake } from '@react-three/drei'
import { RigidBody, CapsuleCollider, useRapier, RigidBodyApi } from '@react-three/rapier'
import TeleportSparkle from './TeleportSparkle'
import RobloxCharacter from './RobloxCharacter'
import { findPath } from '../../utils/pathfinding'
import useAudioStore from '../../audioStore'
import useControlsStore from '../../stores/controlsStore'
import gameSystemInstance from '../../systems/GameSystem'

// --- TUNING CONSTANTS ---
const MOVE_SPEED = 6
const ACCELERATION_GROUND = 60
const ACCELERATION_AIR = 15
const FRICTION_GROUND = 15
const FRICTION_AIR = 2
const JUMP_FORCE = 12
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

    // Rapier API
    const rigidBodyRef = useRef<RigidBodyApi>(null)
    // We need to track velocity manually for game feel logic, though Rapier handles physics
    const currentVelocity = useRef(new THREE.Vector3())
    const currentPosition = useRef(new THREE.Vector3(...initialPosition))
    const isGrounded = useRef(false)

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

    // Raycast for ground check
    const { rapier, world } = useRapier()

    // --- API ---
    useImperativeHandle(ref, () => ({
        triggerInteraction: (label: string) => {
            setInteractionLabel(label)
            setInteractionTimer(1.5)
            if (rigidBodyRef.current) rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
            setSparkleTrigger(true)
            path.current = []
        },
        moveTo: (target: THREE.Vector3, onComplete?: () => void) => {
            if (!rigidBodyRef.current) return
            const calculatedPath = findPath(currentPosition.current, target)
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
        gameSystemInstance.update(state.clock.elapsedTime, delta)

        if (!rigidBodyRef.current || !group.current || !visualGroup.current || !rotateGroup.current) return

        // Sync position from Rapier
        const pos = rigidBodyRef.current.translation()
        const vel = rigidBodyRef.current.linvel()
        currentPosition.current.set(pos.x, pos.y, pos.z)
        currentVelocity.current.set(vel.x, vel.y, vel.z)

        // Ground Check (Raycast)
        // Origin is center of capsule (approx 0.6 up). Raycast down.
        // Capsule height 1.2, radius 0.3. Center is at 0.6. Bottom is 0.
        // We cast from 0.6 down by 0.6 + small epsilon.
        // Using Rapier's world.castRay
        const rayOrigin = { x: pos.x, y: pos.y, z: pos.z }
        const rayDir = { x: 0, y: -1, z: 0 }
        const ray = new rapier.Ray(rayOrigin, rayDir)
        // 0.6 (half height) + 0.3 (radius) is total half height... wait.
        // Capsule total height is height + 2*radius? Or is height the straight part?
        // Rapier Capsule: halfHeight is the half length of the segment. Radius is radius.
        // If args=[0.6, 0.3], total height is 1.2 + 0.6 = 1.8? No.
        // Three.js CapsuleGeometry(radius, length).
        // Rapier CapsuleCollider args=[halfHeight, radius].
        // If we want total height ~1.2m (small avatar)
        // Let's use halfHeight=0.3, radius=0.3. Total height = 0.6*2 + 0.3*2 = 1.2?
        // Actually Rapier Capsule is defined by a segment.
        // We'll use a ray length slightly longer than the distance to bottom.
        // Let's assume the collider setup below: args={[0.3, 0.3]} -> segment length 0.6, total height 1.2.
        // Pivot is at center. Distance to bottom is 0.6.
        const hit = world.castRay(ray, 0.65, true) // 0.65 to allow slight tolerance

        // Filter out self-collision if needed, but 'true' in castRay usually means 'solid'.
        // We need to ensure we don't hit ourselves. Rapier query filters can be complex.
        // Simple hack: if hit distance is very close to 0, it might be us?
        // Actually, internal raycasts ignore the body itself usually if origin is inside?
        // Rapier documentation: "Rays starting inside a shape will return a hit at t=0".
        // We should start ray slightly below center? Or use shapeCast.
        // For now, let's assume if hit.timeOfImpact < 0.65, we are grounded.
        // But we need to exclude our own collider.
        // We can use interaction groups/solver groups.

        // Simplest: Check velocity Y near 0 and position Y near floor level?
        // A better way with Rapier is contact events, but for "isGrounded" raycast is standard.
        // Let's try starting ray from bottom of capsule + offset up.
        // Bottom is pos.y - 0.6. Start at pos.y - 0.5. Cast down 0.2.

        const rayOrigin2 = { x: pos.x, y: pos.y - 0.5, z: pos.z }
        const hit2 = world.castRay(new rapier.Ray(rayOrigin2, rayDir), 0.2, true)

        // We need to filter the player's own collider.
        // RigidBody colliders can be assigned to groups.

        // Fallback ground check if simple ray fails: check rigidBodyRef.current.linvel().y approx 0 and < 0.1 height?
        // But we have slopes.

        // Let's stick to contact sensor in future, for now trust simple logic:
        isGrounded.current = (hit2 !== null && Math.abs(vel.y) < 0.1) // Simple heuristic
        // Or if we hit something very close below
        if (hit2 && hit2.timeOfImpact < 0.15) isGrounded.current = true

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
            const dir = target.clone().sub(currentPosition.current)
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

        // 3. Movement Physics Application
        // We control velocity directly for "arcade" feel, but respecting physics engine collisions
        const desiredVelocity = input.multiplyScalar(MOVE_SPEED)
        const accel = isGrounded.current ? ACCELERATION_GROUND : ACCELERATION_AIR

        // Lerp current horizontal velocity to desired
        const currentHVel = new THREE.Vector3(vel.x, 0, vel.z)
        const newHVel = currentHVel.lerp(desiredVelocity, accel * delta * 0.1) // 0.1 factor to tune stiffness

        // Apply back to body
        // We preserve Y velocity (gravity) unless jumping
        let newY = vel.y

        // 4. Rotation & Banking
        const moving = newHVel.length() > 0.1
        if (moving) {
            const targetRot = Math.atan2(newHVel.x, newHVel.z)
            let angleDiff = targetRot - currentRotation.current
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2

            const rotChange = angleDiff * ROTATION_SPEED * delta
            currentRotation.current += rotChange

            const turnRate = rotChange / delta
            const targetBank = -turnRate * 0.05 * (newHVel.length() / MOVE_SPEED)
            bank.current = THREE.MathUtils.lerp(bank.current, THREE.MathUtils.clamp(targetBank, -BANK_AMOUNT, BANK_AMOUNT), 10 * delta)
        } else {
            bank.current = THREE.MathUtils.lerp(bank.current, 0, 5 * delta)
        }

        const dotProd = input.dot(currentHVel.clone().normalize())
        const targetTilt = (currentHVel.length() / MOVE_SPEED) * TILT_AMOUNT * dotProd
        tilt.current = THREE.MathUtils.lerp(tilt.current, targetTilt, 5 * delta)

        rotateGroup.current.rotation.y = currentRotation.current
        rotateGroup.current.rotation.z = bank.current
        rotateGroup.current.rotation.x = tilt.current

        // 5. Jump Physics
        if (jumpBufferTimer.current > 0) jumpBufferTimer.current -= delta
        if (!isGrounded.current) coyoteTimer.current += delta
        else coyoteTimer.current = 0

        if (isActionPressed && !prevAction.current) {
            jumpBufferTimer.current = JUMP_BUFFER
            jumpHeld.current = true
        }
        if (!isActionPressed && prevAction.current) {
            jumpHeld.current = false
        }
        prevAction.current = isActionPressed

        if (jumpBufferTimer.current > 0 && (isGrounded.current || coyoteTimer.current < COYOTE_TIME)) {
            newY = JUMP_FORCE
            coyoteTimer.current = 100
            jumpBufferTimer.current = 0
            squashSpring.current.impulse(3.0)
            playSound('jump')
        }

        // Variable Jump Height
        if (!jumpHeld.current && newY > 0) {
             // If we release button while moving up, cut velocity
             newY *= JUMP_CUT_HEIGHT
        }

        // Apply final velocity to Rapier Body
        rigidBodyRef.current.setLinvel({ x: newHVel.x, y: newY, z: newHVel.z }, true)

        // 6. Sync Visuals
        // Rapier handles position, we just update rotation group
        if (onPositionChange) onPositionChange(currentPosition.current)

        // Squash & Stretch
        squashSpring.current.update(delta)
        const scaleY = squashSpring.current.val
        const scaleXZ = 1 / Math.sqrt(scaleY)
        visualGroup.current.scale.set(scaleXZ, scaleY, scaleXZ)

        if (moving !== isMovingVisual) setIsMovingVisual(moving)
    })

    const shadowScale = useRef(1)
    useFrame(() => {
        const height = Math.max(0, currentPosition.current.y)
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
                position={currentPosition.current}
                trigger={sparkleTrigger}
                onComplete={() => setSparkleTrigger(false)}
            />
            {interactionLabel && (
                <Html position={[currentPosition.current.x, currentPosition.current.y + 2, currentPosition.current.z]} center>
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

            <RigidBody
                ref={rigidBodyRef}
                position={new THREE.Vector3(...initialPosition)}
                enabledRotations={[false, false, false]}
                colliders={false} // Custom collider
                friction={0} // We handle friction manually
                restitution={0}
            >
                <CapsuleCollider args={[0.3, 0.3]} position={[0, 0.6, 0]} /> {/* HalfHeight 0.3, Radius 0.3. Total Height 1.2? Need to verify Rapier args */}

                <group ref={group}>
                    <group ref={rotateGroup}>
                        <group ref={visualGroup}>
                            <RobloxCharacter isMoving={isMovingVisual && isGrounded.current} />
                        </group>
                    </group>
                </group>
            </RigidBody>

            <mesh
                position={[currentPosition.current.x, 0.01, currentPosition.current.z]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[shadowScale.current, shadowScale.current, 1]}
            >
                <circleGeometry args={[0.35, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.25 * shadowScale.current} />
            </mesh>

            <VoxelDust
                position={currentPosition.current}
                velocity={currentVelocity.current}
                isGrounded={isGrounded.current}
            />
        </>
    )
})

export default Player
