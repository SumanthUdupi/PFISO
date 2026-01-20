import React, { useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useGameStore from '../../store'

export const WaypointOverlay: React.FC = () => {
    const { camera } = useThree()
    const markerRef = useRef<HTMLDivElement>(null)
    const { activeWaypoint } = useGameStore() // Assuming we add this state, or hardcode for now

    // Temp: Use correct store hook if missing
    // For verification without store update yet:
    // const targetPos = new THREE.Vector3(0, 1, 0) // Center of world
    const targetPos = activeWaypoint ? new THREE.Vector3(activeWaypoint.x, activeWaypoint.y, activeWaypoint.z) : null

    useFrame(() => {
        if (!markerRef.current || !targetPos) return

        // Project world position to screen
        const pos = targetPos.clone()
        pos.project(camera)

        const isBehind = pos.z > 1
        const x = (pos.x * 0.5 + 0.5) * window.innerWidth
        const y = -(pos.y * 0.5 - 0.5) * window.innerHeight

        // Edge Clamping (UX-025)
        // If behind or off-screen, clamp to edges
        const padding = 40
        let clampX = x
        let clampY = y
        let rotation = 0

        const w = window.innerWidth
        const h = window.innerHeight

        const isOffScreen = x < padding || x > w - padding || y < padding || y > h - padding || isBehind

        if (isOffScreen) {
            // Calculate direction from center
            const cx = w / 2
            const cy = h / 2
            let dx = x - cx
            let dy = y - cy

            // If strictly behind, invert direction to point "back"
            if (isBehind) {
                dx = -dx
                dy = -dy
            }

            const angle = Math.atan2(dy, dx)
            rotation = angle * (180 / Math.PI) + 90 // Arrow point output

            // Intersect with screen bounds
            // Simple approach: Clamp to box
            // Better approach: Ray intersect box
            // Let's just clamp for simplicity
            if (!isBehind) {
                clampX = Math.max(padding, Math.min(w - padding, x))
                clampY = Math.max(padding, Math.min(h - padding, y))
            } else {
                // Push to edge based on angle
                // This is complex, let's just force bottom if behind?
                // Or just hide if behind for MVP?
                // Let's just invert positions if behind
                clampY = h - padding
            }
        }

        markerRef.current.style.transform = `translate(${clampX}px, ${clampY}px) rotate(${isOffScreen ? rotation : 0}deg)`
        markerRef.current.style.opacity = isBehind || isOffScreen ? '0.5' : '1'
        markerRef.current.style.display = targetPos ? 'flex' : 'none'
    })

    if (!targetPos) return null

    return (
        <div ref={markerRef} className="fixed top-0 left-0 -ml-3 -mt-3 pointer-events-none z-40 flex flex-col items-center">
            <div className="w-6 h-6 bg-cozy-accent rotate-45 border-2 border-white shadow-md animate-pulse" />
            <span className="mt-1 bg-black/50 px-1 rounded text-white text-xs font-bold drop-shadow-md whitespace-nowrap">OBJECTIVE</span>
        </div>
    )
}
