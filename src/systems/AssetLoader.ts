import { useGLTF } from '@react-three/drei'

// Define critical assets here
const ASSETS = [
    // '/models/player.glb', // Example if we had a specific player file
    // '/models/env_core.glb', 
    '/models/prop_box.glb',
    '/models/prop_ball.glb',
    '/models/office_chair.glb',
    '/models/office_plant.glb'
]

export const preloadAssets = () => {
    // ASSETS.forEach(asset => useGLTF.preload(asset))

    // Hardcoded known paths from codebase analysis if any
    // Currently Player uses primitives? checking Player.tsx...
    // If Player.tsx uses nodes from a GLTF, we preload it.
    // If it uses useGLTF('...'), we preload that.
}

// Function to clear cache if needed
export const clearAssetCache = () => {
    ASSETS.forEach(asset => useGLTF.clear(asset))
}
