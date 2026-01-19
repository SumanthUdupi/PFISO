import React from 'react'
import { Plane } from '@react-three/drei'

export const Water = (props: any) => {
    // CL-037: Water Plane Clip - Use polygonOffset to prevent Z-fighting with floor
    return (
        <group {...props}>
            <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                <meshStandardMaterial
                    color="#4fc3f7"
                    transparent
                    opacity={0.6}
                    polygonOffset
                    polygonOffsetFactor={1} // Push back
                />
            </Plane>
        </group>
    )
}
