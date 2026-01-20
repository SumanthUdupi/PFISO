import React from 'react'
import PositionalSound from './PositionalSound'

interface AmbientZoneProps {
    position: [number, number, number]
    type: string // e.g. 'ambient_hvac', 'ambient_computer'
    distance?: number
    volume?: number
}

/**
 * AmbientZone
 * Places a looping 3D sound in the world.
 */
const AmbientZone: React.FC<AmbientZoneProps> = ({ position, type, distance = 15, volume = 0.5 }) => {
    return (
        <group position={position}>
            {/* Visual Debug Marker (Optional, hidden in prod) */}
            {/* <mesh visible={false}>
                <sphereGeometry args={[0.2]} />
                <meshBasicMaterial color="orange" wireframe />
            </mesh> */}

            <PositionalSound
                type={type}
                loop={true}
                trigger={true} // Always on for ambience
                distance={distance}
                volumeMultiplier={volume}
            />
        </group>
    )
}

export default AmbientZone
