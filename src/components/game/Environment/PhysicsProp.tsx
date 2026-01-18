import React, { useRef, useState, useEffect } from 'react'
import { RigidBody, RapierRigidBody, useRapier } from '@react-three/rapier'
import { Sphere, Box, Outlines } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import eventBus from '../../../systems/EventBus'
import useGameStore from '../../../store'
import inputs from '../../../systems/InputManager'

interface PhysicsPropProps {
    id: string
    position: [number, number, number]
    type?: 'box' | 'ball' | 'custom'
    children?: React.ReactNode
    colliderType?: 'cuboid' | 'ball' | 'hull'
    colliderArgs?: any[]
}

export const PhysicsProp: React.FC<PhysicsPropProps> = ({
    id,
    position,
    type = 'box',
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

    // ... (keep state)
    const savedState = useGameStore(state => state.worldObjectStates[id])
    const updateWorldObject = useGameStore(state => state.updateWorldObject)
    const isEditMode = useGameStore(state => state.isEditMode)

    const isFocused = focusedObject?.id === mesh.current?.uuid


    const userData = {
        interactable: true,
        type: 'pickup',
        label: type === 'custom' ? 'Item' : (type === 'box' ? 'Box' : 'Ball'),
        weight: type === 'box' ? 2 : 1
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
                    api.current.setBodyType(2, true)
                    api.current.wakeUp()
                }
            }
        }

        const onDrop = (payload: any) => {
            if (mesh.current && payload.id === mesh.current.uuid) {
                setIsCarried(false)
                if (api.current) {
                    api.current.setBodyType(0, true)
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
            // simplified for brevity in replacement, but I must provide FULL logic or use MultiReplace carefully.
            // Since I'm replacing the whole component body basically, I need to include the sway logic body.
            // Better to use MultiReplace if I only want to change Interface and Return.
            // But I'll paste the sway logic back in to be safe.

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
            swayPos.current.x = THREE.MathUtils.lerp(swayPos.current.x, 0, delta * 5)
            swayPos.current.y = THREE.MathUtils.lerp(swayPos.current.y, 0, delta * 5)
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

    const finalColliderType = colliderType || (type === 'box' ? 'cuboid' : 'ball')

    return (
        <RigidBody
            ref={api}
            position={position}
            colliders={finalColliderType}
            args={colliderArgs}
            restitution={0.5}
            friction={0.7}
        >
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
