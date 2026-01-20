import React from 'react'
import { ReceptionDesk, Sofa, CoffeeTable, OfficePlant, OfficeWall, Logo } from './OptimizedOfficeAssets'
import { RigidBody } from '@react-three/rapier'
import { Text } from '@react-three/drei'

// Additional Logo Component if not exists
const BrandingLogo = (props: any) => {
    return (
        <group {...props}>
            <Text
                position={[0, 0, 0]}
                fontSize={1}
                color="#263238"
                anchorX="center"
                anchorY="middle"
            >
                CORP INC.
            </Text>
        </group>
    )
}

export const ReceptionArea = (props: any) => {
    const { position = [0, 0, 0], rotation = [0, 0, 0] } = props

    return (
        <group position={position} rotation={rotation}>
            {/* Desk */}
            <ReceptionDesk position={[0, 0, 2]} rotation={[0, Math.PI, 0]} />

            {/* Waiting Area */}
            <Sofa position={[-3, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
            <Sofa position={[3, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
            <CoffeeTable position={[0, 0, -1]} />

            {/* Branding */}
            <BrandingLogo position={[0, 3, 4.8]} rotation={[0, Math.PI, 0]} />

            {/* Wall behind desk */}
            <OfficeWall width={8} height={4} position={[0, 2, 5]} />

            {/* Plants */}
            <OfficePlant position={[-3.5, 0, 4]} />
            <OfficePlant position={[3.5, 0, 4]} />
        </group>
    )
}
