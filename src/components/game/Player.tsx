import { useRef, useState, forwardRef, useImperativeHandle, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RigidBody, CapsuleCollider, useRapier, RapierRigidBody } from '@react-three/rapier'
import inputs from '../../systems/InputManager'
import gameSystemInstance from '../../systems/GameSystem'
import RobloxCharacter from './RobloxCharacter'

// --- TUNING CONSTANTS ---
const MOVE_SPEED = 10.0
const SPRINT_SPEED = 16.0
const ACCEL = 80.0 // Super snappy
const DECEL = 60.0 // Super snappy stopping
const AIR_ACCEL = 20.0 // Less control in air
const JUMP_FORCE = 18.0
const GRAVITY_SCALE = 4.0 // Heavy gravity for less floaty feel

export interface PlayerHandle {
    moveTo: (pos: THREE.Vector3) => void
    triggerInteraction: (label: string) => void
    sit: (position: THREE.Vector3, quaternion: THREE.Quaternion) => void
    unsit: () => void
}

interface PlayerProps {
    initialPosition?: [number, number, number]
}

const Player = forwardRef<PlayerHandle, PlayerProps>(({ initialPosition = [0, 5, 0] }, ref) => {
    const rigidBodyRef = useRef<RapierRigidBody>(null)
    const { world, rapier } = useRapier()
    const { camera } = useThree()

    // State
    const isGrounded = useRef(false)
    const [isSprinting, setIsSprinting] = useState(false)
    const [isMoving, setIsMoving] = useState(false)

    // Jump State
    const jumpRequested = useRef(false)
    const jumpTimer = useRef(0)
    const coyoteTimer = useRef(0)



    // Commands (Stubbed for compatibility)
    useImperativeHandle(ref, () => ({
        moveTo: (_pos) => console.log("Auto-move not yet re-implemented"),
        triggerInteraction: (label) => console.log("Interact:", label),
        sit: () => console.log("Sit not implemented"),
        unsit: () => console.log("Unsit not implemented")
    }))

    // Input Handling in useFrame for consistency
    useFrame((_state, delta) => {
        if (!rigidBodyRef.current) return

        // 1. Input Gathering
        const moveX = inputs.getAxis('MOVE_X')
        const moveY = inputs.getAxis('MOVE_Y')
        // Note: InputManager returns Y as forward/back (mapped from W/S), usually -1 is forward? 
        // Let's check InputManager: W -> ky -= 1. S -> ky += 1. So Y is -1 for Forward (Up on screen/map).

        const sprintDown = inputs.isPressed('DASH')

        // 2. Camera Basis
        // We want movement relative to camera look direction
        const camEuler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
        camEuler.x = 0
        camEuler.z = 0
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(camEuler)
        const right = new THREE.Vector3(1, 0, 0).applyEuler(camEuler)

        // 3. Desired Velocity Calculation
        const desiredDir = new THREE.Vector3()
            .addScaledVector(right, moveX)
            .addScaledVector(forward, -moveY) // Input Y is inverted typically for 2D, but let's see. 
        // If InputManager: W = -1. We want Forward. So (-(-1)) * forward = +1 forward. Correct.

        if (desiredDir.lengthSq() > 1) desiredDir.normalize()

        const targetSpeed = sprintDown ? SPRINT_SPEED : MOVE_SPEED
        const finalDesiredVel = desiredDir.multiplyScalar(targetSpeed)

        const moving = desiredDir.lengthSq() > 0.1
        if (moving !== isMoving) setIsMoving(moving)
        if (sprintDown !== isSprinting) setIsSprinting(sprintDown)

        // 4. Ground Check (Raycast)
        const currentPos = rigidBodyRef.current.translation()
        // Origin slightly up, cast down
        const rayOrigin = { x: currentPos.x, y: currentPos.y + 0.5, z: currentPos.z }
        const rayDir = { x: 0, y: -1, z: 0 }
        const hit = world.castRay(new rapier.Ray(rayOrigin, rayDir), 1.0, true) // 0.5 offset + 0.5 length

        isGrounded.current = !!(hit && hit.toi < 0.6) // 0.5 + 0.1 tolerance

        if (isGrounded.current) {
            coyoteTimer.current = 0.1 // 100ms grace
        } else {
            coyoteTimer.current -= delta
        }

        // 5. Physics Integration
        const currentVel = rigidBodyRef.current.linvel()

        // Horizontal Velocity Control
        // We manually accelerate X/Z towards desired. We leave Y alone (mostly).
        const currentHoriz = new THREE.Vector3(currentVel.x, 0, currentVel.z)
        const desiredHoriz = new THREE.Vector3(finalDesiredVel.x, 0, finalDesiredVel.z)

        const accelRate = isGrounded.current
            ? (desiredHoriz.lengthSq() > 0.1 ? ACCEL : DECEL)
            : AIR_ACCEL

        currentHoriz.lerp(desiredHoriz, Math.min(accelRate * delta, 1.0))

        // Jump Logic
        if (inputs.justPressed('JUMP')) {
            jumpRequested.current = true
            jumpTimer.current = 0.1 // Buffer
        }
        jumpTimer.current -= delta

        let newY = currentVel.y
        if (jumpRequested.current && coyoteTimer.current > 0) {
            newY = JUMP_FORCE
            jumpRequested.current = false
            coyoteTimer.current = 0 // Consume coyote
            isGrounded.current = false // Detach

            // Audio/FX could go here
        }

        // Apply
        rigidBodyRef.current.setLinvel({ x: currentHoriz.x, y: newY, z: currentHoriz.z }, true)

        // 6. Visual Rotation
        if (desiredDir.lengthSq() > 0.1) {
            // Smooth rotate character mesh if we had one separate. 
            // For now, we rotate the physics body? No, usually lock rotation.
            // We usually rotate a visual child.
            // Let's assume there's a visual child or we set rotation if using `lockRotations`.
        }

        // Note: For now, we lock rotations on the RigidBody component props.

        // 7. Data Sync
        gameSystemInstance.playerPosition = { x: currentPos.x, y: currentPos.y, z: currentPos.z }
    })

    return (
        <group>
            <RigidBody
                ref={rigidBodyRef}
                colliders={false}
                position={initialPosition}
                enabledRotations={[false, false, false]} // Lock rotation
                friction={0} // We handle friction manually via velocity set
                gravityScale={GRAVITY_SCALE}
            >
                <CapsuleCollider args={[0.8, 0.4]} position={[0, 0.8, 0]} /> {/* Height 1.6 total approx */}

                {/* Placeholder Visuals */}
                <group position={[0, -0.85, 0]}>
                    <Suspense fallback={null}>
                        <RobloxCharacter
                            isMoving={isMoving}
                            speed={isSprinting ? SPRINT_SPEED : MOVE_SPEED}
                        />
                    </Suspense>
                </group>
            </RigidBody>
            <pointLight position={[0, 2, 0]} intensity={0.5} distance={5} />
        </group>
    )
})

export default Player
