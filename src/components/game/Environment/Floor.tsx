import React, { useMemo } from 'react'
import * as THREE from 'three'

interface FloorProps {
  width: number
  depth: number
  theme?: 'lobby' | 'project' | 'about' | 'contact'
  onFloorClick: (point: THREE.Vector3) => void
}

const THEME_COLORS = {
  lobby: { primary: '#2C3E50', secondary: '#34495E' },
  project: { primary: '#27AE60', secondary: '#2ECC71' },
  about: { primary: '#D35400', secondary: '#E67E22' },
  contact: { primary: '#C0392B', secondary: '#E74C3C' }
}

const Floor: React.FC<FloorProps> = ({ width, depth, theme = 'lobby', onFloorClick }) => {
  const geometry = useMemo(() => new THREE.PlaneGeometry(0.95, 0.95), [])

  // Create variants
  // We will generate materials based on theme
  const materials = useMemo(() => {
    const colors = THEME_COLORS[theme] || THEME_COLORS.lobby
    const primary = new THREE.Color(colors.primary)
    const secondary = new THREE.Color(colors.secondary)

    // Helper to create variant
    const createMat = (baseColor: THREE.Color, roughness: number) => {
        return new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness
        })
    }

    // 4 variants: Primary A, Primary B, Secondary A, Secondary B
    // Primary A: Base
    // Primary B: Slightly perturbed
    // Secondary A: Base
    // Secondary B: Slightly perturbed

    // Perturb color slightly
    const pVar = primary.clone().offsetHSL(0, 0, -0.02)
    const sVar = secondary.clone().offsetHSL(0, 0, -0.02)

    // Also variants like "cracked" or "scuffed" could just be color shifts for now
    // Or roughness changes.

    return [
        createMat(primary, 0.8),         // 0: P Base
        createMat(pVar, 0.9),            // 1: P Var
        createMat(secondary, 0.8),       // 2: S Base
        createMat(sVar, 0.9),            // 3: S Var
        createMat(primary.clone().offsetHSL(0,0,0.05), 0.7), // 4: P Light (Rare)
    ]
  }, [theme])

  // Generate grid with randomized tiles
  // Use stable random based on x, z
  const grid = useMemo(() => {
    const tiles = []
    const wStart = -Math.floor(width / 2)
    const dStart = -Math.floor(depth / 2)

    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        const wx = wStart + x
        const wz = dStart + z

        // Pseudo-random seed
        const seed = Math.sin(wx * 12.9898 + wz * 78.233) * 43758.5453
        const rand = seed - Math.floor(seed)

        // Checkerboard base logic
        const isSecondary = (x + z) % 2 !== 0

        // Determine material index
        let matIndex = isSecondary ? 2 : 0

        // 20% chance to be a variant
        if (rand > 0.8) {
            matIndex = isSecondary ? 3 : 1
        }
        // 5% chance for rare variant (only on primary tiles for now)
        if (!isSecondary && rand > 0.95) {
            matIndex = 4
        }

        tiles.push({
            key: `${wx}-${wz}`,
            position: [wx, 0, wz] as [number, number, number],
            matIndex
        })
      }
    }
    return tiles
  }, [width, depth])

  return (
    <group position={[0, -0.5, 0]}>
      {grid.map(tile => (
          <mesh
            key={tile.key}
            position={tile.position}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            geometry={geometry}
            material={materials[tile.matIndex]}
            onClick={(e) => {
                e.stopPropagation()
                onFloorClick(e.point)
            }}
          />
      ))}
       {/* Decorative border */}
       <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[width + 1, depth + 1]} />
          <meshStandardMaterial color="#1a1a1a" />
       </mesh>
    </group>
  )
}

export default Floor
