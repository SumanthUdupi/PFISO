import React, { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useGameStore from '../../store'

export const DamageIndicator: React.FC = () => {
    const { camera } = useThree()
    const lastDamageSource = useGameStore(state => state.lastDamageSource)
    const lastDamageTime = useGameStore(state => state.lastDamageTime)

    const arrowRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!lastDamageSource) return

        // Show indicator briefly
        if (containerRef.current) {
            containerRef.current.style.opacity = '1'
            setTimeout(() => {
                if (containerRef.current) containerRef.current.style.opacity = '0'
            }, 1000)
        }
    }, [lastDamageTime, lastDamageSource])

    useFrame(() => {
        if (!lastDamageSource || !arrowRef.current || !containerRef.current) return
        if (containerRef.current.style.opacity === '0') return

        // Calculate direction
        const playerPos = camera.position.clone()
        const sourcePos = new THREE.Vector3(...lastDamageSource)
        const direction = sourcePos.sub(playerPos).normalize()

        // Project direction relative to camera forward
        // We need the angle around the Y axis relative to the camera look direction

        // Convert direction to 2D relative to camera
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)

        // Flatten vectors to XZ plane if we assume ground-based logic, 
        // but for general 3D, we care about screen space projection or just horizontal angle.
        // Let's us horizontal angle for simplicity (FPS style).

        const forward2D = new THREE.Vector2(forward.x, forward.z).normalize()
        const dir2D = new THREE.Vector2(direction.x, direction.z).normalize()

        // Calculate angle
        // det(a, b) = a.x * b.y - a.y * b.x
        // dot(a, b) = a.x * b.x + a.y * b.y
        // angle = atan2(det, dot)

        // We want the angle of the danger relative to forward
        const angle = Math.atan2(
            forward2D.x * dir2D.y - forward2D.y * dir2D.x,
            forward2D.x * dir2D.x + forward2D.y * dir2D.y
        )

        // Convert to degrees and apply to rotation
        // angle is in radians. 0 is forward. Positive is left? 
        // let's test. atan2(y, x). 
        // If forward is (0, -1) [North]. Danger is (1, 0) [East].
        // This math is tricky without simple atan2 of delta.

        // Simpler approach:
        // Get camera rotation Y
        const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
        const cameraRotation = euler.y

        const destRotation = Math.atan2(
            lastDamageSource[0] - camera.position.x,
            lastDamageSource[2] - camera.position.z
        )

        const relativeRotation = destRotation - cameraRotation

        // Rotate the arrow icon
        // React-style updates or ref updates
        arrowRef.current.style.transform = `rotate(${-relativeRotation}rad)`
    })

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center transition-opacity duration-300 opacity-0"
        >
            <div
                ref={arrowRef}
                className="w-64 h-64 relative"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-32">
                    {/* Red Arrow pointing UP (representing direction of danger relative to center) */}
                    {/* Actually, if we rotate the container, "UP" in the container points to the danger */}
                    <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[40px] border-b-red-600/80 filter drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                </div>
            </div>
        </div>
    )
}
