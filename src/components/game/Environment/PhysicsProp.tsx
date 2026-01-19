import React, { useRef, useState, useEffect, useMemo } from 'react'
import { RigidBody, RapierRigidBody, useRapier, CuboidCollider, BallCollider, InteractionGroups } from '@react-three/rapier'
import { COLLISION_GROUPS } from '../../../systems/PhysicsLayers'
import { Sphere, Box, Outlines } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import eventBus from '../../../systems/EventBus'
import useGameStore from '../../../store'
import inputs from '../../../systems/InputManager'
import useAudioStore from '../../../audioStore'

// PH-002, PH-003, PH-004: Physics Material Definitions
// PH-031: Slope Friction - Increased default friction values to prevent sliding on gentle slopes
export type PhysicsMaterialType = 'wood' | 'metal' | 'cardboard' | 'plastic' | 'rubber' | 'concrete'

const PHYSICS_MATERIALS: Record<PhysicsMaterialType, { density: number, friction: number, restitution: number }> = {
    wood: { density: 0.7, friction: 0.7, restitution: 0.2 },
    metal: { density: 7.8, friction: 0.5, restitution: 0.1 },
    cardboard: { density: 0.2, friction: 0.8, restitution: 0.1 },
    plastic: { density: 0.9, friction: 0.6, restitution: 0.3 },
    rubber: { density: 1.1, friction: 1.0, restitution: 0.7 },
    concrete: { density: 2.4, friction: 0.9, restitution: 0.1 }
}

interface PhysicsPropProps {
    id: string
    position: [number, number, number]
    type?: 'box' | 'ball' | 'custom'
    materialType?: PhysicsMaterialType
    children?: React.ReactNode
    colliderType?: 'cuboid' | 'ball' | 'hull'
    colliderArgs?: any[]
}

export const PhysicsProp: React.FC<PhysicsPropProps> = ({
    id,
    position,
    type = 'box',
    materialType = 'cardboard', // Default to cardboard for boxes
    children,
    colliderType,
    colliderArgs
}) => {
    // ... (keep hooks)
    const api = useRef<RapierRigidBody>(null)
    const mesh = useRef<THREE.Group>(null)
    const [isCarried, setIsCarried] = useState(false)
    const { camera } = useThree()
    const { world, rapier } = useRapier()
    const focusedObject = useGameStore(state => state.focusedObject)
    const playSound = useAudioStore(state => state.playSound)

    // ... (keep state)
    const savedState = useGameStore(state => state.worldObjectStates[id])
    const updateWorldObject = useGameStore(state => state.updateWorldObject)

    // Get physics props
    const matProps = PHYSICS_MATERIALS[materialType] || PHYSICS_MATERIALS.cardboard

    const isFocused = focusedObject?.id === mesh.current?.uuid


    const userData = {
        interactable: true,
        type: 'pickup',
        label: type === 'custom' ? 'Item' : (type === 'box' ? 'Box' : 'Ball'),
        weight: type === 'box' ? 2 : 1
    }

    // PH-032: Sound Trigger
    const lastSoundTime = useRef(0)
    const handleCollision = (e: any) => {
        // Debounce: 100ms
        const now = performance.now()
        if (now - lastSoundTime.current < 100) return

        // Velocity Threshold
        // Need relative velocity. Simplified: check own velocity if dynamic?
        // Or check e.contact.impulse (if available) or totalForce?
        // Rapier implicitly gives us access.
        // let's assume valid impact if other body exists.

        // Better: Check collision impact magnitude if possible.
        // Standard rapier event doesn't give direct velocity difference easily without extra calls.
        // We'll define a minimum logic:

        playSound('collision', 0.5) // Placeholder sound ID
        lastSoundTime.current = now
    }

    // ... (keep interactions)
    useEffect(() => {
        if (savedState && api.current) {
            api.current.setTranslation({ x: savedState.position[0], y: savedState.position[1], z: savedState.position[2] }, true)
            api.current.setRotation({ x: savedState.rotation[0], y: savedState.rotation[1], z: savedState.rotation[2], w: savedState.rotation[3] }, true)
        }
    }, [])

    useEffect(() => {
        const onPickup = (payload: any) => {
            if (mesh.current && payload.id === mesh.current.uuid) {
                setIsCarried(true)
                if (api.current) {
                    api.current.setBodyType(2, true) // KinematicPositionBased
                    // PH-042: Prop Fly Fix - Ignore Player collisions
                    api.current.setCollisionGroups(COLLISION_GROUPS.HELD_PROP)
                    api.current.wakeUp()
                }
            }
        }

        const onDrop = (payload: any) => {
            if (mesh.current && payload.id === mesh.current.uuid) {
                setIsCarried(false)
                if (api.current) {
                    api.current.setBodyType(0, true) // Dynamic
                    // PH-042: Restore default collision groups
                    api.current.setCollisionGroups(type === 'box' ? COLLISION_GROUPS.PROP : COLLISION_GROUPS.PROP)
                    api.current.setTranslation(payload.position, true)
                    api.current.setLinvel(payload.velocity, true)

                    let finalTrans = api.current.translation()
                    let finalRot = api.current.rotation()

                    // GRID SNAPPING
                    const isEditMode = useGameStore.getState().isEditMode
                    if (isEditMode) {
                        const snapSize = 0.5
                        const snappedX = Math.round(finalTrans.x / snapSize) * snapSize
                        const snappedZ = Math.round(finalTrans.z / snapSize) * snapSize

                        // Snap Rotation (Y-axis only)
                        const euler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(finalRot.x, finalRot.y, finalRot.z, finalRot.w))
                        const snapAngle = Math.PI / 2
                        const snappedRotY = Math.round(euler.y / snapAngle) * snapAngle

                        // Apply Snap
                        const newQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, snappedRotY, 0))

                        api.current.setTranslation({ x: snappedX, y: finalTrans.y, z: snappedZ }, true)
                        api.current.setRotation(newQuat, true)
                        api.current.setLinvel({ x: 0, y: 0, z: 0 }, true) // Stop movement

                        finalTrans = { x: snappedX, y: finalTrans.y, z: snappedZ }
                        finalRot = newQuat
                    }

                    // Save Toggle
                    updateWorldObject(id, [finalTrans.x, finalTrans.y, finalTrans.z], [finalRot.x, finalRot.y, finalRot.z, finalRot.w])
                }
            }
        }

        eventBus.on('OBJECT_PICKUP', onPickup)
        eventBus.on('OBJECT_DROP', onDrop)

        return () => {
            eventBus.off('OBJECT_PICKUP', onPickup)
            eventBus.off('OBJECT_DROP', onDrop)
        }
    }, [id, updateWorldObject])

    // Sway State Ref kept same...
    const swayPos = useRef(new THREE.Vector2(0, 0))
    const prevCamQuat = useRef(new THREE.Quaternion())

    useFrame((state, delta) => {
        if (isCarried && api.current) {
            // ... (Keep existing Sway Logic 1:1)
            // 1. Calculate Camera Rotation Delta (Sway)
            const currentQuat = camera.quaternion.clone()
            if (prevCamQuat.current.equals(new THREE.Quaternion())) {
                prevCamQuat.current.copy(currentQuat)
            }
            const diffQuat = currentQuat.clone().multiply(prevCamQuat.current.clone().invert())
            const euler = new THREE.Euler().setFromQuaternion(diffQuat, 'YXZ')
            const swayAmount = 2.0
            const targetSwayX = -euler.y * swayAmount
            const targetSwayY = euler.x * swayAmount
            swayPos.current.x += targetSwayX
            swayPos.current.y += targetSwayY

            // PH-035: Grab Stability - Tighten current sway lerp from 5 to 15
            swayPos.current.x = THREE.MathUtils.lerp(swayPos.current.x, 0, delta * 15)
            swayPos.current.y = THREE.MathUtils.lerp(swayPos.current.y, 0, delta * 15)

            const maxSway = 0.3
            swayPos.current.x = THREE.MathUtils.clamp(swayPos.current.x, -maxSway, maxSway)
            swayPos.current.y = THREE.MathUtils.clamp(swayPos.current.y, -maxSway, maxSway)
            prevCamQuat.current.copy(currentQuat)

            // 2. Base Position & Anti-Clip
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
            let holdDist = 1.5
            const rayOrigin = camera.position.clone()
            const rayDir = forward.clone()
            const ray = new rapier.Ray({ x: rayOrigin.x, y: rayOrigin.y, z: rayOrigin.z }, { x: rayDir.x, y: rayDir.y, z: rayDir.z })
            const hit = world.castRay(ray, holdDist + 0.5, true)
            if (hit && hit.toi < holdDist) {
                let dist = hit.toi - 0.5
                if (dist < 0.5) dist = 0.5
                holdDist = dist
            }
            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
            const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion)
            const finalPos = camera.position.clone()
                .add(forward.multiplyScalar(holdDist))
                .add(right.multiplyScalar(swayPos.current.x))
                .add(up.multiplyScalar(swayPos.current.y - 0.2))

            api.current.setNextKinematicTranslation(finalPos)
            api.current.setNextKinematicRotation(camera.quaternion)
            if (!isCarried) prevCamQuat.current.set(0, 0, 0, 1)
        }
    })

    // Determine collider to use
    // If colliderType is specified via props, use it.
    // Otherwise infer from 'type'.
    // We disable auto-colliders on RigidBody to use manual ones for Density control (PH-002)

    // ...

    // PH-010: Center of Mass
    // To lower COM (increase stability), we keep the RigidBody at 'position', but we shift the Mesh and Collider UP.
    // Effectively the Pivot/COM is below the visual center.
    // Default offset: [0, 0, 0]
    const comOffset = type === 'box' || materialType === 'metal' || materialType === 'concrete' ? [0, -0.2, 0] : [0, 0, 0]
    // If we shift content UP, COM is relatively LOWER.
    // wait, if I shift content UP (y > 0), the RB origin (0,0,0) is BELOW the content.
    // So COM is at bottom of object.
    const visualOffset = new THREE.Vector3(0, 0.2, 0) // Shift Up slightly to make RB origin the base

    // Actually, simpler: just add a prop "bottomHeavy".
    // If bottomHeavy, we add a heavy collider at bottom.
    // Or we stick to the offset method which is cleaner for simple shapes.

    return (
        <RigidBody
            ref={api}
            position={position}

            colliders={false} // Disable auto-colliders
            canSleep={true} // PH-005: Stacking Stability
            ccd={true} // PH-009: Tunneling
            linearDamping={0.1}
            angularDamping={0.5} // PH-024: Rolling Resistance

            // PH-014: Collision Layers
            // Assign group based on type
            collisionGroups={type === 'box' ? COLLISION_GROUPS.PROP : COLLISION_GROUPS.PROP}

            // PH-032: Sound Trigger
            onCollisionEnter={handleCollision}
        >
            {/* Offset logic: If we want COM to be lower, we move the colliders/mesh UP relative to the RB center, 
                 OR we move the RB position down and visual up? 
                 Let's just use a heavy invisible sphere at the bottom for "bottom heavy" objects?
                 No, let's just assume the RB pivot is the COM.
                 By default, GLTF/Mesh origin might be center or bottom.
                 If we want weighted COM, we need to ensure the COM is lower than geometric center.
                 We can do this simply by shifting the collider UP relative to the RB, so the RB pivot (COM) ends up lower on the object.
              */}

            {/* Offset logic matches PH-010: Weighted COM */}
            <group position={[comOffset[0] + visualOffset.x, comOffset[1] + visualOffset.y, comOffset[2] + visualOffset.z]}>

                {/* Manual Colliders for Density (PH-002) and Material Props (PH-003, PH-004) */}
                {colliderType === 'cuboid' || (!colliderType && type === 'box') ? (
                    <CuboidCollider
                        args={colliderArgs || [0.2, 0.2, 0.2]}
                        density={matProps.density}
                        friction={matProps.friction}
                        restitution={matProps.restitution}
                    />
                ) : colliderType === 'ball' || (!colliderType && type === 'ball') ? (
                    <BallCollider
                        args={colliderArgs || [0.25]}
                        density={matProps.density}
                        friction={matProps.friction}
                        restitution={matProps.restitution}
                    />
                ) : (
                    null // Custom collider needs implementation if 'custom' type used without explicit colliderType
                )}

            </group>
            <group ref={mesh} userData={userData}>
                {children ? (
                    <>
                        {children}
                        {isFocused && <Outlines thickness={0.05} color="white" screenspace={false} opacity={1} transparent={false} angle={0} />}
                    </>
                ) : (
                    type === 'box' ? (
                        <Box args={[0.4, 0.4, 0.4]} castShadow receiveShadow>
                            <meshStandardMaterial color="#e57373" />
                            {isFocused && <Outlines thickness={0.05} color="white" screenspace={false} opacity={1} transparent={false} angle={0} />}
                        </Box>
                    ) : (
                        <Sphere args={[0.25]} castShadow receiveShadow>
                            <meshStandardMaterial color="#64b5f6" />
                            {isFocused && <Outlines thickness={0.05} color="white" screenspace={false} opacity={1} transparent={false} angle={0} />}
                        </Sphere>
                    )
                )}
            </group>
        </RigidBody>
    )
}
