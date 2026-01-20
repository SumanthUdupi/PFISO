import React, { useRef } from 'react'
import { RigidBody, RigidBodyProps, CollisionEnterPayload } from '@react-three/rapier'
import useAudioStore from '../../audioStore'

interface PhysicsPropProps extends RigidBodyProps {
    children?: React.ReactNode
    soundType?: 'land' | 'click' | 'footstep'
}

export const PhysicsProp: React.FC<PhysicsPropProps> = ({ children, soundType = 'land', ...props }) => {
    const playSound = useAudioStore(state => state.playSound)
    const lastCollisionTime = useRef(0)

    const handleCollision = (payload: CollisionEnterPayload) => {
        // Debounce to prevent rapid-fire impacts
        const now = Date.now()
        if (now - lastCollisionTime.current < 200) return

        // Todo: Check collision magnitude/velocity from payload if possible
        // Rapier v7+ might expose payload.target and payload.other
        // For now, simple trigger

        playSound(soundType as any)
        lastCollisionTime.current = now
    }

    return (
        <RigidBody
            colliders="hull"
            onCollisionEnter={handleCollision}
            {...props}
        >
            {children}
        </RigidBody>
    )
}
