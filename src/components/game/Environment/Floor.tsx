import React, { useMemo, useRef, useLayoutEffect } from 'react'
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

const FloorLayer: React.FC<{
  tiles: { position: [number, number, number], key: string }[]
  material: THREE.Material
  geometry: THREE.BufferGeometry
  onFloorClick: (point: THREE.Vector3) => void
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
  }, [tiles])

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, tiles.length]}
      receiveShadow
      onClick={(e) => {
        e.stopPropagation()
        onFloorClick(e.point)
      }}
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
        createMat(primary.clone().offsetHSL(0,0,0.05), 0.7), // 4: P Light
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

  return (
    <group position={[0, -0.5, 0]}>
      {Object.entries(groupedTiles).map(([index, tiles]) => {
          if (tiles.length === 0) return null
          return (
            <FloorLayer
                key={index}
                tiles={tiles}
                material={materials[parseInt(index)]}
                geometry={geometry}
                onFloorClick={onFloorClick}
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
