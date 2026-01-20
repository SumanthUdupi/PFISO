import React from 'react'
import { ExecutiveDesk, OfficeChair, Bookshelf, OfficePlant, OfficeWall, OfficeCable } from './OptimizedOfficeAssets'
import { RigidBody } from '@react-three/rapier'
import { Box } from '@react-three/drei'

export const PrivateOffice = (props: any) => {
    const { position = [0, 0, 0], rotation = [0, 0, 0] } = props

    return (
        <group position={position} rotation={rotation}>
            {/* Floor - Wood or specialized carpet */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[5, 0.1, 6]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#e0e0e0" roughness={0.3} />
                </Box>
            </RigidBody>

            {/* Walls */}
            <OfficeWall width={5} height={3} position={[0, 1.5, -3]} />
            <OfficeWall width={6} height={3} position={[-2.5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} />
            <OfficeWall width={6} height={3} position={[2.5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} />

            {/* Front Glass Wall/Door Frame (Conceptual) */}

            {/* Furniture */}
            <ExecutiveDesk position={[0, 0, -1]} rotation={[0, Math.PI, 0]} />

            {/* Executive Chair */}
            <OfficeChair position={[0, 0, -2]} rotation={[0, 0, 0]} />

            {/* Visitor Chairs */}
            <OfficeChair position={[-1, 0, 0.5]} rotation={[0, -2.5, 0]} />
            <OfficeChair position={[1, 0, 0.5]} rotation={[0, 2.5, 0]} />

            {/* Storage */}
            <Bookshelf position={[2, 0, -2.5]} rotation={[0, -0.5, 0]} />

            {/* Decor */}
            <OfficePlant position={[-2, 0, -2.5]} />

            {/* Cables */}
            <OfficeCable position={[0, 0.76, -1]} rotation={[0, 0, 0]} />

        </group>
    )
}
