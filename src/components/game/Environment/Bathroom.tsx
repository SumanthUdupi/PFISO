import React from 'react'
import { OfficeWall, KitchenCabinet, SoapDispenser, PaperTowelDispenser, TrashCan, DoorFrame, OfficePlant, ToiletStall } from './OptimizedOfficeAssets'
import { RigidBody } from '@react-three/rapier'
import { Box, Cylinder } from '@react-three/drei'


export const Bathroom = (props: any) => {
    const { position = [0, 0, 0], rotation = [0, 0, 0] } = props

    return (
        <group position={position} rotation={rotation}>
            {/* Floor - Tile */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[4, 0.1, 5]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#eeeeee" roughness={0.2} metalness={0.1} />
                </Box>
            </RigidBody>

            {/* Stalls */}
            <ToiletStall position={[-1, 0, -1]} />
            <ToiletStall position={[1, 0, -1]} />

            {/* Sinks */}
            <KitchenCabinet position={[0, 0, 2]} scale={[0.8, 1, 0.5]} />
            {/* Reusing KitchenCabinet for Sink Counter */}

            <SoapDispenser position={[-0.5, 0.95, 2]} />
            <SoapDispenser position={[0.5, 0.95, 2]} />

            <PaperTowelDispenser position={[1.5, 1.4, 2]} rotation={[0, Math.PI, 0]} />

            <TrashCan position={[1.5, 0, 1]} />

            <DoorFrame position={[0, 0, 2.5]} />

            {/* Mirror */}
            <RigidBody type="fixed" colliders="hull">
                <Box args={[2, 1, 0.05]} position={[0, 1.6, 2.25]}>
                    <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.05} />
                </Box>
            </RigidBody>

        </group>
    )
}
