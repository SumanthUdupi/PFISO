import React, { useRef } from 'react'
import { RigidBody } from '@react-three/rapier'
import { Box, Outlines } from '@react-three/drei'
import * as THREE from 'three'
import useGameStore from '../../../store'
import { LODGroup } from '../../utils/LODGroup'

interface ChairProps {
    position: [number, number, number]
    rotation?: [number, number, number]
}

const ChairHigh: React.FC<{ isFocused: boolean }> = ({ isFocused }) => (
    <group>
        <Box args={[0.5, 0.1, 0.5]} position={[0, 0.25, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#8d6e63" />
            {isFocused && <Outlines thickness={0.02} color="white" screenspace={false} opacity={1} transparent={false} angle={0} />}
        </Box>
        <Box args={[0.1, 0.5, 0.1]} position={[-0.2, 0, -0.2]} castShadow receiveShadow>
            <meshStandardMaterial color="#5d4037" />
        </Box>
        <Box args={[0.1, 0.5, 0.1]} position={[0.2, 0, -0.2]} castShadow receiveShadow>
            <meshStandardMaterial color="#5d4037" />
        </Box>
        <Box args={[0.1, 0.5, 0.1]} position={[-0.2, 0, 0.2]} castShadow receiveShadow>
            <meshStandardMaterial color="#5d4037" />
        </Box>
        <Box args={[0.1, 0.5, 0.1]} position={[0.2, 0, 0.2]} castShadow receiveShadow>
            <meshStandardMaterial color="#5d4037" />
        </Box>
        <Box args={[0.5, 0.5, 0.05]} position={[0, 0.55, -0.225]} castShadow receiveShadow>
            <meshStandardMaterial color="#8d6e63" />
            {isFocused && <Outlines thickness={0.02} color="white" screenspace={false} opacity={1} transparent={false} angle={0} />}
        </Box>
    </group>
)

const ChairLow: React.FC<{ isFocused: boolean }> = ({ isFocused }) => (
    <group>
        {/* Simplified geometry - Single block for body, one for back */}
        <Box args={[0.5, 0.4, 0.5]} position={[0, 0.2, 0]}>
            <meshStandardMaterial color="#5d4037" />
            {isFocused && <Outlines thickness={0.02} color="white" screenspace={false} opacity={1} transparent={false} angle={0} />}
        </Box>
        <Box args={[0.5, 0.4, 0.1]} position={[0, 0.6, -0.2]} >
            <meshStandardMaterial color="#8d6e63" />
        </Box>
    </group>
)

export const Chair: React.FC<ChairProps> = ({ position, rotation = [0, 0, 0] }) => {
    // Determine seat position/rotation (absolute world coords essentially)
    // Adjust y +0.5 for sitting height
    const seatPos = new THREE.Vector3(position[0], position[1] + 0.5, position[2])
    const seatRot = new THREE.Euler(rotation[0], rotation[1], rotation[2])
    const seatQuat = new THREE.Quaternion().setFromEuler(seatRot)

    const groupRef = useRef<THREE.Group>(null)
    const focusedObject = useGameStore(state => state.focusedObject)
    const isFocused = focusedObject?.id === groupRef.current?.uuid

    // User Data for interaction
    const checkInteract = {
        interactable: true,
        type: 'seat',
        label: 'Sit',
        seatPosition: seatPos,
        seatRotation: seatQuat
    }

    return (
        <RigidBody type="fixed" position={position} rotation={rotation} colliders="cuboid">
            <group ref={groupRef} userData={checkInteract}>
                <LODGroup
                    position={[0, 0, 0]}
                    distances={[15, 40]} // High detail < 15m, Low detail < 40m, Culled > 40m
                    levels={[
                        <ChairHigh key="high" isFocused={isFocused} />,
                        <ChairLow key="low" isFocused={isFocused} />,
                        null
                    ]}
                />
            </group>
        </RigidBody>
    )
}
