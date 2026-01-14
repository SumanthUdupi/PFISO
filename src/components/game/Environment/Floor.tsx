import React, { useMemo, useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'

interface FloorProps {
  width: number
  depth: number
  theme?: 'lobby' | 'project' | 'about' | 'contact'
  onFloorClick: (point: THREE.Vector3) => void
}

const FloorLayer: React.FC<{
  tiles: { position: [number, number, number], scale: [number, number, number] }[]
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
      tempObject.scale.set(tile.scale[0], tile.scale[1], 1) // Plane uses X/Y for W/H
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
  // Use a default plane geometry
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), [])

  const materials = useMemo(() => {
    // REDUCED NOISE PALETTE
    // Using subtle variations of warm brown to prevent moiré patterns
    const woodMedium = new THREE.MeshStandardMaterial({ color: '#5D4037', roughness: 0.8 }) // Brown 700
    const woodDark = new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.85 })   // Brown 800
    const woodLight = new THREE.MeshStandardMaterial({ color: '#6D4C41', roughness: 0.8 })  // Brown 600

    return [woodMedium, woodDark, woodLight]
  }, [theme])

  // Generate Planks instead of a Grid
  const groupedTiles = useMemo(() => {
    const groups: { [key: number]: { position: [number, number, number], scale: [number, number, number] }[] } = {
      0: [], 1: [], 2: []
    }

    // Larger planks to reduce visual frequency/noise
    const plankW = 0.6

    const rows = Math.ceil(depth / plankW)
    const startZ = -depth / 2 + (plankW / 2) // Center alignment
    const startX = -width / 2

    for (let r = 0; r < rows; r++) {
      const z = startZ + r * plankW
      // Stagger each row
      const stagger = (r % 2) * 1.5
      let currentX = startX - stagger

      while (currentX < width / 2) {
        const l = 3.0 + (Math.random() * 1.0) // Longer planks (3.0 - 4.0)
        const x = currentX + l / 2

        if (x > width / 2) break; // Clip edge

        const rand = Math.random()
        let matIndex = 0 // Medium
        if (rand > 0.7) matIndex = 2 // Light (Subtle highlight)
        if (rand < 0.3) matIndex = 1 // Dark (Subtle shadow)

        // Only add if within bounds (approx)
        if (currentX + l > -width/2 - 2) {
             groups[matIndex].push({
              position: [x, 0, z] as [number, number, number],
              scale: [l * 0.98, plankW * 0.98, 1] // Minimal Gap
            })
        }

        currentX += l
      }
    }

    return groups
  }, [width, depth])

  // Handle floor click for navigation
  const handleClick = (e: any) => {
    e.stopPropagation()
    onFloorClick(e.point)
  }

  return (
    <group position={[0, 0, 0]}>
      {/* Floor Collider */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[width / 2, 0.5, depth / 2]} position={[0, -0.5, 0]} />
      </RigidBody>

      {/* Base Plane to catch raycasts in gaps */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} onClick={handleClick}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#3E2723" /> {/* Dark foundation */}
      </mesh>

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
    </group>
  )
}

export default Floor
