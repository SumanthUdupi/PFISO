import React, { useMemo } from 'react'
import { Box, Sphere, Cylinder, Text, Plane, Billboard } from '@react-three/drei'
import { ASSET_REGISTRY } from '../../data/AssetRegistry'

interface AssetPlaceholderProps {
    id: string
    position?: [number, number, number]
    rotation?: [number, number, number]
}

const AssetPlaceholder: React.FC<AssetPlaceholderProps> = ({ id, position = [0, 0, 0], rotation = [0, 0, 0] }) => {
    const asset = ASSET_REGISTRY[id]

    if (!asset) {
        return (
            <group position={position}>
                <Text position={[0, 1, 0]} fontSize={0.2} color="red">
                    Missing Asset: {id}
                </Text>
                <Box args={[0.5, 0.5, 0.5]}>
                    <meshStandardMaterial color="red" wireframe />
                </Box>
            </group>
        )
    }

    // Determine primitive based on type or description
    const { Primitive, args, shapeName } = useMemo(() => {
        const lowerType = asset.type.toLowerCase()
        const lowerTitle = asset.title.toLowerCase()
        const dims = asset.dimensions3D || [1, 1, 1]

        let geometricShape: any = Box
        let shapeName = 'Box'
        let finalArgs: any[] = [...dims] // Default to Box args [w, h, d]

        if (lowerType.includes('floor') || lowerTitle.includes('rug') || lowerTitle.includes('mat')) {
            geometricShape = Plane
            shapeName = 'Plane'
            finalArgs = [dims[0], dims[2]] // Plane args [w, d] - Use depth as height for plane
        }
        else if (lowerType.includes('lighting') || lowerTitle.includes('lamp') || lowerTitle.includes('bulb') || lowerTitle.includes('sphere')) {
            geometricShape = Sphere
            shapeName = 'Sphere'
            // Sphere args [radius] - take average of width/depth
            finalArgs = [Math.max(dims[0], dims[2]) / 2]
        }
        else if (lowerTitle.includes('mug') || lowerTitle.includes('pot') || lowerTitle.includes('can') || lowerTitle.includes('bin')) {
            geometricShape = Cylinder
            shapeName = 'Cylinder'
            // Cylinder args [radiusTop, radiusBottom, height]
            const radius = Math.max(dims[0], dims[2]) / 2
            finalArgs = [radius, radius, dims[1]]
        }

        return { Primitive: geometricShape, args: finalArgs, shapeName }
    }, [asset])

    return (
        <group position={position} rotation={[rotation[0], rotation[1], rotation[2]]}>
            <Billboard>
                <Text
                    position={[0, (asset.dimensions3D?.[1] || 1) / 2 + 0.5, 0]}
                    fontSize={0.2}
                    color="white"
                    anchorX="center"
                    anchorY="bottom"
                    renderOrder={10}
                    outlineWidth={0.02}
                    outlineColor="#000000"
                >
                    {asset.title}
                </Text>

                <Text
                    position={[0, (asset.dimensions3D?.[1] || 1) / 2 + 0.2, 0]}
                    fontSize={0.12}
                    color="#ccc"
                    anchorX="center"
                    anchorY="bottom"
                    renderOrder={10}
                    outlineWidth={0.01}
                    outlineColor="#000000"
                >
                    {asset.id} | {shapeName}
                </Text>
            </Billboard>

            {/* Geometry */}
            <Primitive args={args} castShadow receiveShadow>
                <meshStandardMaterial
                    color={asset.color}
                    transparent={asset.type.includes('Glass') || asset.type.includes('VFX')}
                    opacity={asset.type.includes('VFX') ? 0.3 : 1.0}
                />
            </Primitive>

            {/* Wireframe overlay for technical look */}
            <Primitive args={args}>
                <meshBasicMaterial color="black" wireframe transparent opacity={0.1} />
            </Primitive>
        </group>
    )
}

export default AssetPlaceholder
