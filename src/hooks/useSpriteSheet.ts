import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface AtlasRegion {
    x: number
    y: number // Bottom-left based UV y
    w: number
    h: number
}

// Helper hook for sprite sheet animation
export function useSpriteSheet(
  texture: THREE.Texture,
  hFrames: number,
  vFrames: number,
  speed: number = 0.1, // Seconds per frame
  atlasRegion?: AtlasRegion
) {
  const currentFrame = useRef(0)
  const elapsed = useRef(0)

  // Configure texture once (if not atlas, or if we want to set filters)
  // If sharing atlas texture, we should probably NOT set repeat globally if others use it.
  // But here we likely passed a clone or the main atlas.
  // If we modify texture.repeat, it affects all users of this texture instance.
  // So we must assume `texture` is a CLONE or dedicated instance if we modify it.

  // Note: texture.clone() shares the image data but has own offset/repeat.

  if (!atlasRegion) {
      texture.repeat.set(1 / hFrames, 1 / vFrames)
  } else {
      // If atlas, repeat is the size of ONE FRAME relative to the full atlas?
      // No, usually we want to show one frame.
      // Frame width in UV = atlasRegion.w / hFrames
      // Frame height in UV = atlasRegion.h / vFrames
      texture.repeat.set(atlasRegion.w / hFrames, atlasRegion.h / vFrames)
  }

  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter

  useFrame((state, delta) => {
    elapsed.current += delta
    if (elapsed.current > speed) {
      elapsed.current = 0
      currentFrame.current = (currentFrame.current + 1) % (hFrames * vFrames)

      const col = currentFrame.current % hFrames
      const row = Math.floor(currentFrame.current / hFrames)

      if (atlasRegion) {
          // Atlas logic
          // Atlas region X, Y is usually bottom-left or top-left depending on convention.
          // My packer used top-left for Y calculation: uv_y = 1 - (y + h)/SIZE.
          // So uv_y is the bottom of the region.
          // uv_h is the height.

          // Frame offset X = atlasRegion.x + col * (atlasRegion.w / hFrames)
          // Frame offset Y = atlasRegion.y + (vFrames - 1 - row) * (atlasRegion.h / vFrames)
          // Wait, if Y is bottom, and row 0 is top row...
          // If sprite sheet is standard (row 0 top), and UV (0 bottom).
          // We need to map row 0 to the top slice of the region.

          // Region Top = atlasRegion.y + atlasRegion.h
          // Frame Height = atlasRegion.h / vFrames
          // Row 0 Y (bottom of frame) = Region Top - 1 * Frame Height
          // = atlasRegion.y + atlasRegion.h - (row + 1) * FrameHeight

          const frameW = atlasRegion.w / hFrames
          const frameH = atlasRegion.h / vFrames

          texture.offset.x = atlasRegion.x + col * frameW
          // For Y:
          texture.offset.y = atlasRegion.y + atlasRegion.h - (row + 1) * frameH

      } else {
          // Standard logic
          texture.offset.x = col / hFrames
          texture.offset.y = 1 - (row + 1) / vFrames
      }
    }
  })

  return texture
}
