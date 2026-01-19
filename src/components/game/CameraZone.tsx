import React, { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useCameraStore from '../../stores/cameraStore'
import gameSystemInstance from '../../systems/GameSystem'

interface CameraZoneProps {
    position: [number, number, number]
    size: [number, number, number]
    overrides: { distance?: number, fov?: number, heightOffset?: number }
    debug?: boolean
}

// CS-044: Camera Zones
// Applies overrides when player is inside the zone
const CameraZone: React.FC<CameraZoneProps> = ({ position, size, overrides, debug = false }) => {
    const setOverrides = useCameraStore(state => state.setOverrides)
    const bounds = useRef(new THREE.Box3())
    const center = new THREE.Vector3(...position)

    useEffect(() => {
        const halfSize = new THREE.Vector3(size[0] / 2, size[1] / 2, size[2] / 2)
        bounds.current.set(
            center.clone().sub(halfSize),
            center.clone().add(halfSize)
        )
    }, [position, size])

    useFrame(() => {
        const playerPos = gameSystemInstance.playerPosition
        const pVec = new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z)

        if (bounds.current.containsPoint(pVec)) {
            // Inside
            // Check if we are already applying THIS override? 
            // For simplicity, we just set it. 
            // In a real system, we might need a priority stack.
            // But for now, last zone entered wins or just spam set.
            // Spamming setOverrides might cause rerenders if store uses strict equality check or if overrides object identity changes.
            // But we can check current overrides.
            setOverrides(overrides)
        } else {
            // Outside
            // We shouldn't clear it immediately if we just left, because we might have entered another zone.
            // But if we are the logical "owner" of the override, we should clear it.
            // This logic is tricky without a manager.
            // Ideally, we'd have a ZoneManager.
            // For now, let's assume zones don't overlap much or we accept simple behavior.
            // Actually, we should NOT clear blindly.
            // Correct approach: ZoneManager checks all zones.
            // Simple approach: When entering, set. When leaving... maybe set to null?
            // If we have multiple zones, they fight.
            // Let's implement: "If invalid, verify if we are still in ANY zone?" No that's global scan.
            // We will just set on enter, and clear on exit if matches.
            const current = useCameraStore.getState().overrides
            if (current === overrides) { // Reference equality if possible
                setOverrides(null)
            }
        }
    })

    return (
        debug ? (
            <mesh position={position}>
                <boxGeometry args={size} />
                <meshBasicMaterial color="yellow" wireframe transparent opacity={0.2} />
            </mesh>
        ) : null
    )
}

export default CameraZone
