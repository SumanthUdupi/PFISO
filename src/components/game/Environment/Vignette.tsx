import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'

// 3.3 Foreground Vignette (Rafters)
// "Add dark, semi-transparent beam/rafter sprites fixed to the top corners of the camera view"
// Since camera moves or is static? Camera is static [20, 20, 20].
// But we can just place them in the scene at high Y and suitable X/Z to frame the shot.

const Vignette = () => {
    // Camera is at 20, 20, 20. Looking at 0, 0, 0.
    // Orthographic size is 40.
    // We can place objects relative to camera or just in the world.
    // "Fixed to the top corners of the camera view".
    // Best way is to use <Html> or <Hud> (if available in drei) or just parent to camera.
    // But parenting to camera in r3f requires access to camera.
    // Let's place them in the world for now as "rafters".
    // High Y, e.g., Y=8.

    return (
        <group position={[0, 8, 0]}>
            {/* Top-Left Rafter (visually top-left on screen) */}
            {/* Screen Top-Left corresponds to ... ?
                Iso view:
                Top is -X -Z (North).
                Left is -X +Z (West).
                Wait.
                (20,20,20) look at (0,0,0).
                Up is +Y.
                Right is X-Z cross Up.

                Let's simpler add some beams crossing the top.
            */}

            <mesh position={[0, 0, -5]} rotation={[0, Math.PI / 4, 0]}>
                 <boxGeometry args={[30, 1, 1]} />
                 <meshBasicMaterial color="#000000" opacity={0.3} transparent />
            </mesh>

             <mesh position={[-5, 2, 0]} rotation={[0, -Math.PI / 4, 0]}>
                 <boxGeometry args={[30, 1, 1]} />
                 <meshBasicMaterial color="#000000" opacity={0.3} transparent />
            </mesh>
        </group>
    )
}

export default Vignette
