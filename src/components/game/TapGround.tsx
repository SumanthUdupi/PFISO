import React, { useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerHandle } from './Player';

interface TapGroundProps {
    playerRef: React.RefObject<PlayerHandle>;
}

const TapGround: React.FC<TapGroundProps> = ({ playerRef }) => {
    const [clickMarker, setClickMarker] = useState<THREE.Vector3 | null>(null);

    const onPointerDown = (e: any) => {
        // Only trigger on main click/touch
        e.stopPropagation();

        // Check distance to player to decide if it's "Walk To" or "Too far"
        // For now, just walk to anywhere tapped on this ground
        const point = e.point;

        // Spawn marker
        setClickMarker(point.clone());
        setTimeout(() => setClickMarker(null), 5000); // Hide after 5s or arrival

        // Command Player
        if (playerRef.current) {
            playerRef.current.moveTo(point);
        }
    };

    return (
        <group>
            {/* Visual Marker */}
            {clickMarker && (
                <mesh position={clickMarker} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.2, 0.3, 32]} />
                    <meshBasicMaterial color="white" opacity={0.5} transparent />
                </mesh>
            )}

            {/* Invisible Catch-All Plane for Mobile Taps */}
            {/* Positioned slightly above ground to catch rays first if needed, or just rely on existing ground if we attach this listener there. 
                Creating a dedicated invisible plane handles clicks anywhere even if there's no floor mesh.
            */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.05, 0]}
                onPointerDown={onPointerDown}
                visible={false}
            >
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial visible={false} />
            </mesh>
        </group>
    );
};

export default TapGround;
