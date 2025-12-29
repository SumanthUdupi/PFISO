import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface RobloxCharacterProps {
    isMoving: boolean
}

const RobloxCharacter: React.FC<RobloxCharacterProps> = ({ isMoving }) => {
    const group = useRef<THREE.Group>(null)
    const leftLeg = useRef<THREE.Group>(null)
    const rightLeg = useRef<THREE.Group>(null)
    const leftArm = useRef<THREE.Group>(null)
    const rightArm = useRef<THREE.Group>(null)
    const headGroup = useRef<THREE.Group>(null)

    // Reusable objects to avoid GC
    const targetVec = useRef(new THREE.Vector3())
    const planeNormal = useRef(new THREE.Vector3())
    const planePos = useRef(new THREE.Vector3())
    const dummyPlane = useRef(new THREE.Plane())
    const lookDir = useRef(new THREE.Vector3())
    const worldHeadPos = useRef(new THREE.Vector3())
    const camDir = useRef(new THREE.Vector3())

    // Materials - Professional Office Theme
    const skinMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffe0bd', roughness: 0.5 }), [])
    const suitMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2c3e50', roughness: 0.6 }), []) // Midnight Blue
    const shirtMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 }), [])
    const tieMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e74c3c', roughness: 0.5 }), []) // Red
    const shoeMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.8 }), [])
    const faceMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1a1a' }), []) // Eyes/Mouth

    // Dimensions (Scaled to match World Scale ~1.0m height)
    const dims = {
        head: [0.22, 0.22, 0.22] as [number, number, number],
        torso: [0.4, 0.4, 0.2] as [number, number, number],
        limb: [0.18, 0.4, 0.18] as [number, number, number],
        arm: [0.15, 0.4, 0.15] as [number, number, number],
    }

    useFrame((state, delta) => {
        // Head Tracking
        if (headGroup.current && group.current) {
            // 1. Get Head World Position
            headGroup.current.getWorldPosition(worldHeadPos.current)

            // 2. Define a Plane perpendicular to the Camera
            // We want the plane to be "behind" the character from the camera's perspective
            // so we look "through" the character at the cursor's projection depth.
            state.camera.getWorldDirection(camDir.current)

            // Plane Normal = -CameraDirection (Facing camera)
            planeNormal.current.copy(camDir.current).negate()

            // Plane Position = HeadPos - CamDir * 2 (Pull plane 2 units towards camera relative to head)
            // This ensures the character looks AT the cursor (in front of them) rather than a point on the wall behind them.
            planePos.current.copy(worldHeadPos.current).add(camDir.current.multiplyScalar(-2))

            dummyPlane.current.setFromNormalAndCoplanarPoint(planeNormal.current, planePos.current)

            // 3. Raycast against this plane
            state.raycaster.setFromCamera(state.pointer, state.camera)
            const hit = state.raycaster.ray.intersectPlane(dummyPlane.current, targetVec.current)

            if (hit) {
                // 4. Convert Hit Point to Local Space (Relative to Body Group)
                // We clone hit because worldToLocal mutates it
                const localTarget = targetVec.current.clone()
                group.current.worldToLocal(localTarget)

                // Head is at local position [0, 0.8, 0] inside the group
                // Vector from Head to Target
                lookDir.current.subVectors(localTarget, new THREE.Vector3(0, 0.8, 0)).normalize()

                // 5. Calculate Angles
                // Yaw (Y-axis): atan2(x, z). Character Mesh faces +Z (0 rads).
                let targetYaw = Math.atan2(lookDir.current.x, lookDir.current.z)

                // Pitch (X-axis): Up/Down.
                // Asin(y) gives angle from horizontal plane.
                // Standard: Positive Rotation X tilts Head DOWN?
                // Test: If lookDir.y is Positive (Up), we want Head to tilt Up.
                // Right Hand Rule on X axis (Thumb Right): Positive rotation curls Y up towards Z.
                // This means +X rotation moves the face (which is +Z) UP towards +Y.
                // So +X rotation = Look Up.
                // So targetPitch should be asin(y).
                // Let's verify:
                // If lookDir = (0, 1, 0) (Up). asin(1) = PI/2. Head rotates +90 deg X.
                // Face (+Z) rotates to +Y. YES. Correct.
                // Wait, previously I thought negative. Let's re-verify.
                // Start: Face along +Z. Up is +Y.
                // Rotate +90 deg around X (Thumb +X). Y axis goes to Z axis? No.
                // Matrix rotation X:
                // [1 0 0]
                // [0 c -s]
                // [0 s c]
                // v = (0,0,1). R * v = (0, -sin, cos).
                // If theta = 90 (PI/2). sin=1, cos=0. Result = (0, -1, 0).
                // Face points DOWN.
                // So POSITIVE X Rotation makes character look DOWN.
                // We want to look UP (Positive Y).
                // So we need NEGATIVE X Rotation.
                let targetPitch = -Math.asin(lookDir.current.y)

                // 6. Limits
                // Yaw: +/- 80 deg
                const limitYaw = THREE.MathUtils.degToRad(80)
                targetYaw = THREE.MathUtils.clamp(targetYaw, -limitYaw, limitYaw)

                // Pitch: +/- 60 deg
                const limitPitch = THREE.MathUtils.degToRad(60)
                targetPitch = THREE.MathUtils.clamp(targetPitch, -limitPitch, limitPitch)

                // 7. Smoothing (Frame-rate independent lerp)
                const smoothFactor = 1.0 - Math.exp(-10 * delta) // Adjust '10' for speed

                headGroup.current.rotation.y = THREE.MathUtils.lerp(headGroup.current.rotation.y, targetYaw, smoothFactor)
                headGroup.current.rotation.x = THREE.MathUtils.lerp(headGroup.current.rotation.x, targetPitch, smoothFactor)

                // Optional Roll: Bank slightly into the turn
                // If looking Left (Yaw > 0), tilt head Left (Roll > 0)?
                // Z-Rotation (+Z axis points out of face? No. +Z is forward).
                // Body axes: X Right, Y Up, Z Forward.
                // Rotate Z (Roll). Thumb +Z. X moves to Y.
                // +Z Rotation = Tilt Head to Right Shoulder.
                // If Yaw > 0 (Left), we want Tilt Left (-Z Rotation)?
                // Let's try: roll = -yaw * 0.1
                headGroup.current.rotation.z = THREE.MathUtils.lerp(headGroup.current.rotation.z, -targetYaw * 0.1, smoothFactor)
            }
        }

        if (!leftLeg.current || !rightLeg.current || !leftArm.current || !rightArm.current) return

        const t = state.clock.getElapsedTime()
        const speed = 10

        if (isMoving) {
            // Walk Cycle (Sine Wave)
            const legAmp = 0.6
            const armAmp = 0.6

            leftLeg.current.rotation.x = Math.sin(t * speed) * legAmp
            rightLeg.current.rotation.x = Math.cos(t * speed) * legAmp

            leftArm.current.rotation.x = -Math.sin(t * speed) * armAmp
            rightArm.current.rotation.x = -Math.cos(t * speed) * armAmp
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
            {/* --- LEGS --- */}
            {/* Left Leg */}
            <group ref={leftLeg} position={[-0.11, 0.4, 0]}>
                {/* Pivot at Hip */}
                <group position={[0, -0.2, 0]}>
                    {/* Pant Leg */}
                    <mesh castShadow receiveShadow material={suitMaterial}>
                        <boxGeometry args={[dims.limb[0], dims.limb[1], dims.limb[2]]} />
                    </mesh>
                    {/* Shoe */}
                    <mesh position={[0, -0.2, 0.02]} castShadow receiveShadow material={shoeMaterial}>
                        <boxGeometry args={[dims.limb[0], 0.05, dims.limb[2] + 0.05]} />
                    </mesh>
                </group>
            </group>

            {/* Right Leg */}
            <group ref={rightLeg} position={[0.11, 0.4, 0]}>
                <group position={[0, -0.2, 0]}>
                    <mesh castShadow receiveShadow material={suitMaterial}>
                        <boxGeometry args={[dims.limb[0], dims.limb[1], dims.limb[2]]} />
                    </mesh>
                    <mesh position={[0, -0.2, 0.02]} castShadow receiveShadow material={shoeMaterial}>
                        <boxGeometry args={[dims.limb[0], 0.05, dims.limb[2] + 0.05]} />
                    </mesh>
                </group>
            </group>

            {/* --- TORSO --- */}
            <group position={[0, 0.6, 0]}>
                {/* Main Body */}
                <mesh castShadow receiveShadow material={suitMaterial}>
                    <boxGeometry args={[dims.torso[0], dims.torso[1], dims.torso[2]]} />
                </mesh>

                {/* Shirt Front (Visual Detail) */}
                <mesh position={[0, 0.1, 0.11]} receiveShadow material={shirtMaterial}>
                    <boxGeometry args={[0.15, 0.2, 0.01]} />
                </mesh>

                {/* Tie */}
                <mesh position={[0, 0.05, 0.125]} receiveShadow material={tieMaterial}>
                    <boxGeometry args={[0.06, 0.25, 0.01]} />
                </mesh>
            </group>

            {/* --- ARMS --- */}
            {/* Left Arm */}
            <group ref={leftArm} position={[-0.3, 0.75, 0]}>
                <group position={[0, -0.2, 0]}>
                    {/* Sleeve */}
                    <mesh castShadow receiveShadow material={suitMaterial}>
                        <boxGeometry args={[dims.arm[0], dims.arm[1], dims.arm[2]]} />
                    </mesh>
                    {/* Hand */}
                    <mesh position={[0, -0.25, 0]} castShadow receiveShadow material={skinMaterial}>
                        <boxGeometry args={[dims.arm[0] - 0.02, 0.12, dims.arm[2] - 0.02]} />
                    </mesh>
                </group>
            </group>

            {/* Right Arm */}
            <group ref={rightArm} position={[0.3, 0.75, 0]}>
                <group position={[0, -0.2, 0]}>
                    <mesh castShadow receiveShadow material={suitMaterial}>
                        <boxGeometry args={[dims.arm[0], dims.arm[1], dims.arm[2]]} />
                    </mesh>
                    <mesh position={[0, -0.25, 0]} castShadow receiveShadow material={skinMaterial}>
                        <boxGeometry args={[dims.arm[0] - 0.02, 0.12, dims.arm[2] - 0.02]} />
                    </mesh>
                </group>
            </group>

            {/* --- HEAD --- */}
            {/* Head follows cursor, faces +Z by default */}
            <group ref={headGroup} position={[0, 0.8, 0]}>
                {/* Neck */}
                <mesh position={[0, 0.05, 0]} castShadow receiveShadow material={skinMaterial}>
                    <cylinderGeometry args={[0.08, 0.08, 0.1]} />
                </mesh>

                {/* Head Mesh */}
                <group position={[0, 0.2, 0]}>
                    <mesh castShadow receiveShadow material={skinMaterial}>
                        <boxGeometry args={[dims.head[0], dims.head[1], dims.head[2]]} />
                    </mesh>

                    {/* Face Features (On Local +Z) */}
                    {/* Z-offset increased to 0.12 to prevent Z-fighting (Half depth is 0.11) */}
                    <group position={[0, 0, 0.12]}>
                        {/* Eyes */}
                        <mesh position={[-0.05, 0.02, 0]} material={faceMaterial}>
                            <boxGeometry args={[0.03, 0.03, 0.01]} />
                        </mesh>
                        <mesh position={[0.05, 0.02, 0]} material={faceMaterial}>
                            <boxGeometry args={[0.03, 0.03, 0.01]} />
                        </mesh>
                        {/* Mouth */}
                        <mesh position={[0, -0.04, 0]} material={faceMaterial}>
                            <boxGeometry args={[0.06, 0.015, 0.01]} />
                        </mesh>
                    </group>
                </group>
            </group>
        </group>
    )
}

export default RobloxCharacter
