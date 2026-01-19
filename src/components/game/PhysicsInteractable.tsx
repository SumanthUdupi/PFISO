import React, { useRef, useEffect } from 'react'
import { RigidBody, RapierRigidBody, RigidBodyProps } from '@react-three/rapier'
import * as THREE from 'three'
import { ThreeEvent } from '@react-three/fiber'
import useInteractionStore from '../../stores/interactionStore'

interface PhysicsInteractableProps extends RigidBodyProps {
    id: string
    label?: string
    children: React.ReactNode
}

const PhysicsInteractable: React.FC<PhysicsInteractableProps> = ({ id, label = "Interactable", children, ...props }) => {
    const rbRef = useRef<RapierRigidBody>(null)
    const meshRef = useRef<THREE.Group>(null)
    const { registerObject, unregisterObject, grabObject, dropObject } = useInteractionStore()

    useEffect(() => {
        registerObject(id, {
            id,
            position: new THREE.Vector3(0, 0, 0),
            label,
            type: 'physics',
            onInteract: () => {
                if (useInteractionStore.getState().heldObjectId === id) {
                    dropObject()
                } else {
                    grabObject(id)
                }
            },
            ref: meshRef,
            rbRef: rbRef
        })

        return () => unregisterObject(id)
    }, [id, label, registerObject, unregisterObject, grabObject, dropObject])

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        if (e.distance > 4) return // Too far

        if (useInteractionStore.getState().heldObjectId === id) {
            dropObject()
        } else {
            grabObject(id)
        }
        e.stopPropagation()
    }

    // ... (Import defaults)

    return (
        <RigidBody
            ref={rbRef}
            colliders="hull"
            friction={0.5} // PH-003: Default Higher Friction
            restitution={0.1} // PH-004: Default Lower Restitution
            canSleep={true} // PH-005: Stacking Stability
            linearDamping={0.1}
            {...props}
            userData={{ interactableId: id }}
        >
            <group ref={meshRef} onClick={handleClick}>
                {children}
            </group>
        </RigidBody>
    )
}

export default PhysicsInteractable
