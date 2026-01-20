import React from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// We need access to the camera rotation. 
// Since HUD is likely outside the Canvas (HTML overlay), we can't use useThree directly if HUD is not inside <Canvas>.
// However, in this project, HUD seems to be an HTML overlay.
// We need a way to get camera rotation to the UI.
// 1. We can use a store that updates every frame (expensive for React)
// 2. We can use a ref and update it via a transient store or direct subscription
// 3. We can make Compass a component INSIDE Canvas that renders HTML via <Html>?
// Let's assume HUD is outside.
// The best performance way: useGameStore or a specialized transient subscription.
// But for simplicity in this prototype, let's create a Compass component that sits inside the Canvas (maybe in Level_01 or App) and renders HTML?
// OR, we can just use useFrame inside a Canvas component to update an HTML element directly via ref.

// Let's create a "CompassLogic" component that goes inside Canvas, and a "CompassUI" that is the visual.
// Actually, `HUD` is likely outside Canvas.
// Let's check where HUD is rendered. It's in App.tsx usually.

// If HUD is outside, we need a bridge.
// Let's use `useGameStore` transiently? No, too slow.
// Let's make an implementation that uses a ref stored in a global singleton or just use a small component inside Canvas that updates a DOM element.

export const Compass: React.FC = () => {
    const compassRef = React.useRef<HTMLDivElement>(null)

    // We need to listen to camera rotation.
    // Since we are in an HTML overlay, we don't have access to the r3f loop directly.
    // Solution: Create a small R3F component that updates this UI.

    // For now, let's assume we can't easily put logic in Canvas just for this without refactoring HUD.
    // Let's use a dirty trick: bind to `useGameStore` if we store rotation there? No.
    // Let's use `requestAnimationFrame` and `THREE.Camera` if exposed?
    // Let's try to find where the camera is.
    // `useGameStore` doesn't hold camera.

    // ALTERNATIVE: Make Compass purely visual based on a custom event 'CAMERA_UPDATE' emitted from CameraSystem?
    // That's also heavy.

    // SIMPLEST: Render Compass INSIDE the Canvas using <Html> from drei.
    // But the requirements say "Compass bar in HUD".

    // Let's create a component that we export, but it must be placed inside <Canvas> to work, 
    // and use <Html fullscreen> or similar to overlay.
    // Wait, HUD is likely outside.

    // Let's look at `CameraSystem.tsx`. It has `useFrame`.
    // We can add a subscriber there.

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-8 bg-black/40 border border-white/20 rounded overflow-hidden backdrop-blur-sm pointer-events-none">
            <div id="compass-strip" className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-bold text-white/80 transition-transform will-change-transform">
                {/* We will translate this strip */}
                <span>NW</span>
                <span className="mx-8">N</span>
                <span className="mx-8">NE</span>
                <span className="mx-8">E</span>
                <span className="mx-8">SE</span>
                <span className="mx-8">S</span>
                <span className="mx-8">SW</span>
                <span className="mx-8">W</span>
                <span className="mx-8">NW</span>
                <span className="mx-8">N</span>
                <span className="mx-8">NE</span>
            </div>
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-cozy-accent -translate-x-1/2 z-10"></div>
        </div>
    )
}

// We need a separate updater component inside Canvas
export const CompassUpdater: React.FC = () => {
    const { camera } = useThree()

    useFrame(() => {
        const compassStrip = document.getElementById('compass-strip')
        if (compassStrip) {
            // Get Y rotation
            const vec = new THREE.Vector3()
            camera.getWorldDirection(vec)
            const theta = Math.atan2(vec.x, vec.z) // Returns -PI to PI
            // Convert to degrees 0-360
            let deg = THREE.MathUtils.radToDeg(theta)

            // Map to pixel offset
            // Assuming the strip covers 360 degrees plus overlap
            // This is a bit tricky to get perfect without a looping texture, but let's approximate.
            // If N is center (0), and neighbors are spaced.

            const offset = deg * 2 // 2 pixels per degree
            compassStrip.style.transform = `translateX(${-offset}px)`
        }
    })

    return null
}
