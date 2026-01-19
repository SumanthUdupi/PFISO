import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Vector3 } from 'three'
import * as THREE from 'three'

// PH-044: Interactive Foliage
// Uses InstancedMesh and custom shader material to bend away from player.

const GrassMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;
      uniform float time;
      uniform vec3 playerPos;
      
      void main() {
        vUv = uv;
        vec3 pos = position;
        
        // World position of instance
        vec4 worldPos = instanceMatrix * vec4(pos, 1.0);
        
        // Distance to player
        float dist = distance(worldPos.xz, playerPos.xz);
        
        // Bending logic: if close to player, push away
        float interactionRadius = 2.0;
        if (dist < interactionRadius) {
           vec3 dir = normalize(worldPos.xyz - playerPos);
           float strength = (1.0 - dist / interactionRadius);
           
           // Simple bend on X/Z based on direction, only applying to top of blade (uv.y > 0.5) if uv mapped correctly
           // Or just check vertex height. Assuming y=0 is bottom.
           if (pos.y > 0.0) {
              pos.x += dir.x * strength * 1.5 * pos.y; // Bend more at top
              pos.z += dir.z * strength * 1.5 * pos.y;
              pos.y -= strength * 0.5 * pos.y; // Squish down slightly
           }
        }

        // Wind (basic)
        pos.x += sin(time * 2.0 + worldPos.x) * 0.1 * pos.y;

        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(0.2, 0.6, 0.1, 1.0); // Green
      }
    `,
    uniforms: {
        time: { value: 0 },
        playerPos: { value: new Vector3(0, 0, 0) }
    }
})

export const InteractiveGrass = ({ count = 1000, playerRef }: any) => {
    const meshRef = useRef<InstancedMesh>(null)
    const dummy = useMemo(() => new Object3D(), [])

    // Initialize positions
    useMemo(() => {
        // In a real app we'd set this once in useEffect, but for simplicity/demo:
        // We can't set matrices here effectively without accessing ref, but we can return data if we map it.
        // Let's do it in useEffect or checking on first frame.
    }, [])

    React.useLayoutEffect(() => {
        if (!meshRef.current) return
        for (let i = 0; i < count; i++) {
            dummy.position.set(
                (Math.random() - 0.5) * 20,
                0,
                (Math.random() - 0.5) * 20
            )
            dummy.scale.set(1, 1 + Math.random(), 1)
            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        }
        meshRef.current.instanceMatrix.needsUpdate = true
    }, [count, dummy])

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.time.value = state.clock.elapsedTime
            if (playerRef && playerRef.current) {
                // Get player world position. 
                // Note: playerRef might be a RigidBody, group, or object.
                // We'll perform a safe check.
                const pPos = new Vector3()
                if (playerRef.current.getWorldPosition) {
                    playerRef.current.getWorldPosition(pPos)
                } else if (playerRef.current.translation) {
                    // Rapier RB
                    const t = playerRef.current.translation()
                    pPos.set(t.x, t.y, t.z)
                }

                meshRef.current.material.uniforms.playerPos.value.copy(pPos)
            }
        }
    })

    return (
        <instancedMesh ref={meshRef} args={[null, null, count]} material={GrassMaterial}>
            <planeGeometry args={[0.1, 1, 1, 4]} /> {/* Segmented for bending */}
        </instancedMesh>
    )
}
