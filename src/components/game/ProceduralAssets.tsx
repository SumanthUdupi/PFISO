import React from 'react'
import { Box, Cylinder, Sphere } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

interface AssetProps {
    position?: [number, number, number]
    rotation?: [number, number, number]
    scale?: number
}

// ARTREQ_001
// Dimensions:** 4m x 4m (tiling)
export const ARTREQ_001: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#d4a373' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_002
// Dimensions:** 4m (width) x 3m (height) x 0.2m (depth)
export const ARTREQ_002: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#fffcf5' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_003
// Dimensions:** 2.5m (width) x 2m (height)
export const ARTREQ_003: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#ffffff' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_004
// Dimensions:** 1.8m x 0.8m x 0.75m
export const ARTREQ_004: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#4a403a' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_005
// Dimensions:** Standard office chair size.
export const ARTREQ_005: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#ccd5ae' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_006
// Dimensions:** 1.0m (width) x 2.2m (height) x 0.4m (depth)
export const ARTREQ_006: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#4a403a' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_007
// Dimensions:** 2.5m x 3.5m
export const ARTREQ_007: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#fffcf5' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_008
// Dimensions:** 0.4m diameter.
export const ARTREQ_008: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#ccd5ae' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_009
// Dimensions:** 1.0m tall.
export const ARTREQ_009: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#3a5a40' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_010
// Dimensions:** Various lengths (0.6m, 0.8m, 1.0m).
export const ARTREQ_010: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#d4a373' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_011
// Dimensions:** 0.9m x 2.1m.
export const ARTREQ_011: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#fefae0' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_012
// Dimensions:** Fits Window (ARTREQ_003).
export const ARTREQ_012: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#d4a373' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_013
// Dimensions:** 0.6m height (adjustable).
export const ARTREQ_013: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#da4b4b' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_014
// Dimensions:** 1.2m diameter.
export const ARTREQ_014: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#8c6a4a' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_015
// Dimensions:** 0.4m height.
export const ARTREQ_015: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#d4a373' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_016
// Dimensions:** 0.6m x 0.9m (Portrait).
export const ARTREQ_016: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#d4a373' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_017
// Dimensions:** 0.5m x 0.4m (Landscape).
export const ARTREQ_017: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#cccccc' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_018
// Dimensions:** 1.2m x 0.5m x 0.6m.
export const ARTREQ_018: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#ffffff' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_019
// Dimensions:** 0.3m diameter.
export const ARTREQ_019: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#d4a373' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_020
// Dimensions:** 0.4m diameter, 0.5m height.
export const ARTREQ_020: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#ccd5ae' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_021
// Dimensions:** Standard mug size.
export const ARTREQ_021: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#fefae0' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_022
// Dimensions:** 15-inch form factor.
export const ARTREQ_022: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#cfcfcf' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_023
// Dimensions:** A5 size.
export const ARTREQ_023: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#3a5a40' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_024
// Dimensions:** 65% layout size.
export const ARTREQ_024: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#fffcf5' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_025
// Dimensions:** Standard mouse.
export const ARTREQ_025: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#fffcf5' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_026
// Dimensions:** 10cm cube.
export const ARTREQ_026: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#ccd5ae' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_027
// Dimensions:** 4x6 photo size.
export const ARTREQ_027: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#d4a373' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_028
// Dimensions:** Small desk footprint.
export const ARTREQ_028: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#2d2424' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_029
// Dimensions:** Standard bin size.
export const ARTREQ_029: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#4a403a' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_030
// Dimensions:** Head size.
export const ARTREQ_030: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#eaddcf' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_031
// Dimensions:** 0.8m x 0.4m.
export const ARTREQ_031: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#4a403a' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_032
// Dimensions:** Small cylinder.
export const ARTREQ_032: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#fffcf5' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_033
// Dimensions:** Cone shape matching window frame.
export const ARTREQ_033: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#fffcf5' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_034
// 1m x 1m x 1m
export const ARTREQ_034: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#ffcc99' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_035
// 1m x 1m x 1m
export const ARTREQ_035: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#e0f7fa' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_036
// Dimensions:** 2m string.
export const ARTREQ_036: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#fefae0' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_037
// 1m x 1m x 1m
export const ARTREQ_037: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#d4a373' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_038
// 1m x 1m x 1m
export const ARTREQ_038: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#cccccc' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_039
// 1m x 1m x 1m
export const ARTREQ_039: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#fffcf5' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_040
// 1m x 1m x 1m
export const ARTREQ_040: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#cccccc' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_041
// 1m x 1m x 1m
export const ARTREQ_041: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#4a403a' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_042
// 1m x 1m x 1m
export const ARTREQ_042: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#cccccc' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_043
// 1m x 1m x 1m
export const ARTREQ_043: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#cccccc' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_044
// 1m x 1m x 1m
export const ARTREQ_044: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#cccccc' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_045
// 1m x 1m x 1m
export const ARTREQ_045: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#d4a373' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_046
// 1m x 1m x 1m
export const ARTREQ_046: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#ffffff' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_047
// 1m x 1m x 1m
export const ARTREQ_047: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#fffcf5' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_048
// 1m x 1m x 1m
export const ARTREQ_048: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#cccccc' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_049
// 1m x 1m x 1m
export const ARTREQ_049: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#d4a373' />
                </Box>
            </group>
        </RigidBody>
    )
}

// ARTREQ_050
// 1m x 1m x 1m
export const ARTREQ_050: React.FC<AssetProps> = ({ position=[0,0,0], rotation=[0,0,0], scale=1 }) => {
    return (
        <RigidBody position={position} rotation={rotation} type='fixed' colliders='hull'>
            <group scale={scale}>
                <Box args={[1, 1, 1]}>
                    <meshStandardMaterial color='#2d2424' />
                </Box>
            </group>
        </RigidBody>
    )
}
