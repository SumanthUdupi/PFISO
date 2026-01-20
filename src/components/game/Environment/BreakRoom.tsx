import React from 'react'
import { Refrigerator, Microwave, CoffeeMaker, VendingMachine, WaterCooler, KitchenCabinet, OfficeChair, ConferenceTable, TrashCan, OfficePlant } from './OptimizedOfficeAssets'
import { RigidBody } from '@react-three/rapier'
import { Box } from '@react-three/drei'

export const BreakRoom = (props: any) => {
    const { position = [0, 0, 0], rotation = [0, 0, 0] } = props

    return (
        <group position={position} rotation={rotation}>
            {/* Floor */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[6, 0.1, 8]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#eeeeee" roughness={0.5} />
                </Box>
            </RigidBody>

            {/* Kitchenette Wall Area */}
            <KitchenCabinet position={[-1.5, 0, 3.5]} rotation={[0, Math.PI, 0]} />
            <Refrigerator position={[1, 0, 3.5]} rotation={[0, Math.PI, 0]} />
            <Microwave position={[-2, 0.95, 3.5]} rotation={[0, Math.PI, 0]} />
            <CoffeeMaker position={[-1, 0.95, 3.5]} rotation={[0, Math.PI, 0]} />

            {/* Vending Area */}
            <VendingMachine position={[-2.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
            <WaterCooler position={[-2.5, 0, -1.5]} rotation={[0, Math.PI / 2, 0]} />
            <TrashCan position={[-2.5, 0, -2.5]} />

            {/* Seating */}
            <ConferenceTable position={[1, 0, -1]} rotation={[0, 0, 0]} />
            {/* Using Conference Table as dining table for now, maybe scale down if needed */}

            <OfficeChair position={[0, 0, -1]} rotation={[0, -1.5, 0]} />
            <OfficeChair position={[2, 0, -1]} rotation={[0, 1.5, 0]} />

            {/* Decor */}
            <OfficePlant position={[2.5, 0, 3.5]} />

        </group>
    )
}
