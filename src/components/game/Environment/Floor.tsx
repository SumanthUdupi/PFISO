import React, { useMemo, useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'

interface FloorProps {
  width: number
  depth: number
  theme?: 'lobby' | 'project' | 'about' | 'contact'
  onFloorClick: (point: THREE.Vector3) => void // Kept for raycasting logic in parent
}

const THEME_COLORS = {
  lobby: { primary: '#8d6e63', secondary: '#a1887f' }, // Warm Wood
  project: { primary: '#2e7d32', secondary: '#388e3c' }, // Deep Green (Office plant vibe)
  about: { primary: '#d84315', secondary: '#e64a19' }, // Burnt Orange
  contact: { primary: '#c62828', secondary: '#d32f2f' } // Deep Red
}

const FloorLayer: React.FC<{
  tiles: { position: [number, number, number], key: string }[]
  material: THREE.Material
  geometry: THREE.BufferGeometry
  onFloorClick: (e: any) => void
}> = ({ tiles, material, geometry, onFloorClick }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    if (!meshRef.current) return
    const tempObject = new THREE.Object3D()

    tiles.forEach((tile, i) => {
      tempObject.position.set(...tile.position)
      tempObject.rotation.set(-Math.PI / 2, 0, 0)
      tempObject.updateMatrix()
      meshRef.current!.setMatrixAt(i, tempObject.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [tiles, material])

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, tiles.length]}
      receiveShadow
      onClick={onFloorClick}
    />
  )
}

const Floor: React.FC<FloorProps> = ({ width, depth, theme = 'lobby', onFloorClick }) => {
  const geometry = useMemo(() => new THREE.PlaneGeometry(0.95, 0.95), [])

  const materials = useMemo(() => {
    const colors = THEME_COLORS[theme] || THEME_COLORS.lobby
    const primary = new THREE.Color(colors.primary)
    const secondary = new THREE.Color(colors.secondary)

    const createMat = (baseColor: THREE.Color, roughness: number) => {
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness
      })
    }

    const pVar = primary.clone().offsetHSL(0, 0, -0.02)
    const sVar = secondary.clone().offsetHSL(0, 0, -0.02)

    return [
      createMat(primary, 0.8),         // 0: P Base
      createMat(pVar, 0.9),            // 1: P Var
      createMat(secondary, 0.8),       // 2: S Base
      createMat(sVar, 0.9),            // 3: S Var
      createMat(primary.clone().offsetHSL(0, 0, 0.05), 0.7), // 4: P Light
    ]
  }, [theme])

  const groupedTiles = useMemo(() => {
    const groups: { [key: number]: { position: [number, number, number], key: string }[] } = {
      0: [], 1: [], 2: [], 3: [], 4: []
    }
    const wStart = -Math.floor(width / 2)
    const dStart = -Math.floor(depth / 2)

    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        const wx = wStart + x
        const wz = dStart + z
        const seed = Math.sin(wx * 12.9898 + wz * 78.233) * 43758.5453
        const rand = seed - Math.floor(seed)
        const isSecondary = (x + z) % 2 !== 0
        let matIndex = isSecondary ? 2 : 0

        if (rand > 0.8) {
          matIndex = isSecondary ? 3 : 1
        }
        if (!isSecondary && rand > 0.95) {
          matIndex = 4
        }

        groups[matIndex].push({
          key: `${wx}-${wz}`,
          position: [wx, 0, wz] as [number, number, number]
        })
      }
    }
    return groups
  }, [width, depth])

  // Handle floor click for navigation
  const handleClick = (e: any) => {
    e.stopPropagation()
    // Pass the intersection point up to the Lobby for navigation
    onFloorClick(e.point)
  }

  return (
    <group position={[0, 0, 0]}>
      {/* Floor Collider */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[width / 2, 0.5, depth / 2]} position={[0, -0.5, 0]} />
      </RigidBody>

      {Object.entries(groupedTiles).map(([index, tiles]) => {
        if (tiles.length === 0) return null
        return (
          <FloorLayer
            key={index}
            tiles={tiles}
            material={materials[parseInt(index)]}
            geometry={geometry}
            onFloorClick={handleClick}
          />
        )
      })}
      {/* Decorative border */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width + 1, depth + 1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  )
}

export default Floor
