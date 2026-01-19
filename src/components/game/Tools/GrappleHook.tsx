import React, { useRef, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRapier } from '@react-three/rapier'

export const GrappleHook = ({ start, end, active = false }: { start: THREE.Vector3, end: THREE.Vector3, active?: boolean }) => {
    // CL-046: Grapple Clip (Segment raycast)
    // Ensures the rope checks for collisions between start and end points to avoid clipping through walls.

    const lineRef = useRef<any>(null)
    const { rapier, world } = useRapier()

    useFrame(() => {
        if (!active || !lineRef.current) return;

        // geometry update
        const points = [start, end]
        lineRef.current.setPoints(points)

        // Raycast check for occlusion
        const dir = new THREE.Vector3().subVectors(end, start)
        const len = dir.length()
        dir.normalize()

        const ray = new rapier.Ray(start, dir)
        const hit = world.castRay(ray, len, true) // solid=true

        if (hit && hit.toi < len) {
            // Collision detected! The rope is clipping through something.
            // visual feedback: turn red or bend (visual only for now)
            lineRef.current.material.color.set('red')
        } else {
            lineRef.current.material.color.set('lime')
        }
    })

    return (
        <line ref={lineRef}>
            <bufferGeometry />
            <lineBasicMaterial color="lime" linewidth={2} />
        </line>
    )
}
