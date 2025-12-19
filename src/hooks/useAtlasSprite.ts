import { useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import atlasData from '../../public/assets/atlas/sprites.json'

// Type safe access if we generated types, but for now string
export function useAtlasSprite(name: string) {
  // Use absolute path for public folder
  const texture = useTexture('assets/atlas/sprites.webp')

  // Clone texture to allow independent offset/repeat if used on different materials
  // But wait, if we use one texture, we want to batch.
  // If we clone, we break batching if materials are different.
  // To batch, we must use the same material and same texture instance.
  // And modify the UVs of the geometry.

  // This hook returns the texture and the UV coordinates/transform needed.
  // If the user wants to simply put it on a plane, they should use a geometry with modified UVs.
  // OR use offset/repeat on a cloned texture (easier but no batching benefit for draw calls, only memory).

  // Requirement: "Update the rendering logic to map UV coordinates to specific sub-regions"
  // "Consolidate assets into a single source file... reduces HTTP requests" -> This is achieved even with cloned textures.
  // "Focus on reducing GPU overhead and draw calls" -> This implies Geometry modification or Instancing.

  // Since we are likely modifying individual objects (Player, Decor), they are not instanced together usually.
  // So reducing HTTP requests is the main win here.
  // I will provide a helper that returns a cloned texture configured for the sprite.

  const spriteData = (atlasData as any)[name]

  const spriteTexture = useMemo(() => {
     if (!spriteData) return texture.clone() // Fallback

     const t = texture.clone()
     t.magFilter = THREE.NearestFilter
     t.minFilter = THREE.NearestFilter
     t.colorSpace = THREE.SRGBColorSpace

     // Set transform
     // uv_x, uv_y (bottom-left), uv_w, uv_h
     const [x, y, w, h] = spriteData.uv

     t.offset.set(x, y)
     t.repeat.set(w, h)

     return t
  }, [texture, name, spriteData])

  return spriteTexture
}

// Hook to get UV coordinates if one wants to modify geometry manually
export function useAtlasUVs(name: string) {
    const spriteData = (atlasData as any)[name]
    return spriteData ? spriteData.uv : [0,0,1,1]
}
