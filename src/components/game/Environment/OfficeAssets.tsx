import React, { useRef } from 'react'
import { Box, Cylinder, Sphere, Text } from '@react-three/drei'
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier'

export const OfficeDesk = (props: any) => {
    return (
        <RigidBody type="fixed" colliders={false} {...props}>
            <CuboidCollider args={[1, 0.05, 0.5]} position={[0, 0.75, 0]} />
            <CuboidCollider args={[0.05, 0.35, 0.45]} position={[-0.9, 0.35, 0]} />
            <CuboidCollider args={[0.05, 0.35, 0.45]} position={[0.9, 0.35, 0]} />
            <Box args={[2, 0.1, 1]} position={[0, 0.75, 0]}><meshStandardMaterial color="#8d6e63" metalness={0.1} roughness={0.8} /></Box>
            <Box args={[0.1, 0.7, 0.9]} position={[-0.9, 0.35, 0]}><meshStandardMaterial color="#4e342e" /></Box>
            <Box args={[0.1, 0.7, 0.9]} position={[0.9, 0.35, 0]}><meshStandardMaterial color="#4e342e" /></Box>
            <Box args={[0.8, 0.5, 0.05]} position={[0, 1.05, -0.3]}><meshPhysicalMaterial color="#050505" roughness={0.2} metalness={0.5} clearcoat={1} /></Box>
            <Box args={[0.1, 0.2, 0.05]} position={[0, 0.85, -0.3]}><meshStandardMaterial color="#424242" /></Box>
            <Box args={[0.5, 0.02, 0.2]} position={[0, 0.81, 0.2]}><meshStandardMaterial color="#212121" /></Box>
            <Box args={[0.45, 0.01, 0.15]} position={[0, 0.825, 0.2]}><meshStandardMaterial color="#424242" roughness={0.8} /></Box>
        </RigidBody>
    )
}

export const OfficeChair = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders={false} {...props} linearDamping={2} angularDamping={2}>
            <CuboidCollider args={[0.3, 0.5, 0.3]} position={[0, 0.5, 0]} />
            <Box args={[0.6, 0.1, 0.6]} position={[0, 0.5, 0]}><meshStandardMaterial color="#455a64" roughness={1.0} /></Box>
            <Box args={[0.6, 0.6, 0.1]} position={[0, 0.8, -0.25]}><meshStandardMaterial color="#455a64" roughness={1.0} /></Box>
            <Cylinder args={[0.3, 0.3, 0.1]} position={[0, 0.1, 0]}><meshStandardMaterial color="#ffffff" metalness={1.0} roughness={0.1} /></Cylinder>
            <Cylinder args={[0.05, 0.4, 0.05]} position={[0, 0.3, 0]}><meshStandardMaterial color="#ffffff" metalness={1.0} roughness={0.1} /></Cylinder>
        </RigidBody>
    )
}

export const OfficePlant = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders={false} {...props} density={0.5}>
            <CylinderCollider args={[0.5, 0.3]} position={[0, 0.5, 0]} />
            <Cylinder args={[0.3, 0.2, 0.4, 32]} position={[0, 0.2, 0]}><meshStandardMaterial color="#d84315" /></Cylinder>
            <Cylinder args={[0.05, 0.05, 0.6]} position={[0, 0.5, 0]}><meshStandardMaterial color="#2e7d32" /></Cylinder>
            <Sphere args={[0.4]} position={[0, 0.9, 0]}><meshPhysicalMaterial color="#4caf50" roughness={0.3} transmission={0.1} thickness={0.5} /></Sphere>
        </RigidBody>
    )
}

export const GlassPartition = (props: any) => {
    return (
        <RigidBody type="fixed" colliders="hull" {...props}>
            <Box args={[4, 2.5, 0.1]}>
                <meshPhysicalMaterial color="#e0f7fa" transmission={0.95} roughness={0.05} thickness={0.1} ior={1.5} transparent />
            </Box>
        </RigidBody>
    )
}

export const PaperStack = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders="cuboid" {...props}>
            <Box args={[0.2, 0.05, 0.3]}><meshStandardMaterial color="#fafafa" roughness={0.9} metalness={0} /></Box>
        </RigidBody>
    )
}

export const TrashCan = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders="hull" {...props}>
            <Cylinder args={[0.2, 0.15, 0.4, 16]} position={[0, 0.2, 0]}><meshStandardMaterial color="#546e7a" metalness={0.5} /></Cylinder>
            <Sphere args={[0.08]} position={[0, 0.3, 0]}><meshStandardMaterial color="#eceff1" /></Sphere>
            <Sphere args={[0.07]} position={[0.05, 0.25, -0.05]}><meshStandardMaterial color="#cfd8dc" /></Sphere>
        </RigidBody>
    )
}

export const OfficeCable = (props: any) => {
    return (
        <RigidBody type="fixed" colliders="hull" {...props}>
            <Cylinder args={[0.02, 0.02, 2]} rotation={[0, 0, Math.PI / 2]}><meshStandardMaterial color="#212121" /></Cylinder>
        </RigidBody>
    )
}

export const OfficeWall = (props: any) => {
    const w = props.width || 1
    const h = props.height || 3
    return (
        <RigidBody type="fixed" colliders={false} {...props}>
            <CuboidCollider args={[w / 2, h / 2, 0.1]} />
            <Box args={[w, h, 0.2]}><meshStandardMaterial color="#eceff1" /></Box>
        </RigidBody>
    )
}

export const ConferenceTable = (props: any) => {
    return (
        <RigidBody type="fixed" colliders="hull" {...props}>
            <Box args={[4, 0.1, 1.5]} position={[0, 0.75, 0]}><meshStandardMaterial color="#5d4037" roughness={0.3} metalness={0.1} /></Box>
            <Cylinder args={[0.1, 0.1, 0.7]} position={[-1.5, 0.35, 0]}><meshStandardMaterial color="#424242" metalness={0.8} /></Cylinder>
            <Cylinder args={[0.1, 0.1, 0.7]} position={[1.5, 0.35, 0]}><meshStandardMaterial color="#424242" metalness={0.8} /></Cylinder>
        </RigidBody>
    )
}

export const Whiteboard = (props: any) => {
    return (
        <RigidBody type="fixed" colliders="cuboid" {...props}>
            <Box args={[3, 1.5, 0.05]}><meshStandardMaterial color="#cfd8dc" metalness={0.5} /></Box>
            <Box args={[2.9, 1.4, 0.02]} position={[0, 0, 0.02]}><meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.05} /></Box>
            <Box args={[2, 0.05, 0.1]} position={[0, -0.75, 0.05]}><meshStandardMaterial color="#cfd8dc" /></Box>
        </RigidBody>
    )
}

export const ProjectorScreen = (props: any) => {
    return (
        <RigidBody type="fixed" colliders="hull" {...props}>
            <Box args={[3.2, 0.15, 0.15]} position={[0, 1.5, 0]}><meshStandardMaterial color="#eceff1" /></Box>
            <Box args={[3, 2.5, 0.02]} position={[0, 0.25, 0]}><meshStandardMaterial color="#ffffff" roughness={0.9} emissive="#eeeeee" emissiveIntensity={0.1} /></Box>
        </RigidBody>
    )
}

export const KitchenCabinet = (props: any) => {
    return (
        <RigidBody type="fixed" colliders="cuboid" {...props}>
            <Box args={[3, 0.9, 0.6]} position={[0, 0.45, 0]}><meshStandardMaterial color="#f5f5f5" /></Box>
            <Box args={[3.1, 0.05, 0.65]} position={[0, 0.925, 0]}><meshStandardMaterial color="#212121" roughness={0.6} /></Box>
            <Box args={[0.8, 0.2, 0.5]} position={[0.5, 0.85, 0]}><meshStandardMaterial color="#bdbdbd" metalness={0.8} /></Box>
        </RigidBody>
    )
}

export const Refrigerator = (props: any) => { return <RigidBody type="fixed" {...props}><Box args={[0.9, 1.8, 0.8]} position={[0, 0.9, 0]}><meshStandardMaterial color="#b0bec5" metalness={0.3} /></Box></RigidBody> }
export const Microwave = (props: any) => { return <RigidBody type="dynamic" {...props}><Box args={[0.6, 0.4, 0.4]} position={[0, 0.2, 0]}><meshStandardMaterial color="#212121" /></Box></RigidBody> }
export const CoffeeMaker = (props: any) => { return <RigidBody type="dynamic" {...props}><Box args={[0.3, 0.4, 0.3]} position={[0, 0.2, 0]}><meshStandardMaterial color="#3e2723" /></Box></RigidBody> }
export const VendingMachine = (props: any) => { return <RigidBody type="fixed" {...props}><Box args={[1, 2, 0.8]} position={[0, 1, 0]}><meshStandardMaterial color="#c62828" /></Box></RigidBody> }
export const WaterCooler = (props: any) => { return <RigidBody type="fixed" {...props}><Box args={[0.4, 1.2, 0.4]} position={[0, 0.6, 0]}><meshStandardMaterial color="#eceff1" /></Box></RigidBody> }

export const ReceptionDesk = (props: any) => {
    return (
        <RigidBody type="fixed" colliders="hull" {...props}>
            <Box args={[3, 1.1, 1]} position={[0, 0.55, 0]}><meshStandardMaterial color="#455a64" /></Box>
            <Box args={[2.8, 0.05, 0.8]} position={[0, 0.8, -0.2]}><meshStandardMaterial color="#cfd8dc" /></Box>
        </RigidBody>
    )
}

export const Sofa = (props: any) => {
    return (
        <RigidBody type="fixed" colliders="hull" {...props}>
            <Box args={[2, 0.5, 0.8]} position={[0, 0.25, 0]}><meshStandardMaterial color="#546e7a" /></Box>
            <Box args={[2, 0.6, 0.2]} position={[0, 0.5, -0.4]}><meshStandardMaterial color="#546e7a" /></Box>
        </RigidBody>
    )
}

export const CoffeeTable = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders="hull" {...props}>
            <Box args={[1.2, 0.4, 0.8]} position={[0, 0.2, 0]}><meshStandardMaterial color="#3e2723" /></Box>
        </RigidBody>
    )
}

export const Logo = (props: any) => {
    return (
        <group {...props}>
            <Text fontSize={1} color="#263238" anchorX="center" anchorY="middle">CORP INC.</Text>
        </group>
    )
}

export const CubiclePartition = (props: any) => {
    const { width = 2, height = 1.5 } = props
    return (
        <RigidBody type="fixed" colliders="cuboid" {...props}>
            <Box args={[width, height, 0.05]} position={[0, height / 2, 0]}><meshStandardMaterial color="#b0bec5" metalness={0.5} /></Box>
            <Box args={[width - 0.1, height - 0.1, 0.06]} position={[0, height / 2, 0]}><meshStandardMaterial color="#cfd8dc" roughness={0.9} /></Box>
        </RigidBody>
    )
}

export const FilingCabinet = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders="cuboid" {...props}>
            <Box args={[0.5, 1.2, 0.6]} position={[0, 0.6, 0]}><meshStandardMaterial color="#455a64" metalness={0.6} roughness={0.4} /></Box>
        </RigidBody>
    )
}

export const DesktopComputer = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders="cuboid" {...props}>
            <Box args={[0.2, 0.5, 0.5]} position={[0.3, 0.25, 0]}><meshStandardMaterial color="#212121" metalness={0.5} /></Box>
        </RigidBody>
    )
}

export const Toaster = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders="hull" {...props}>
            <Box args={[0.3, 0.2, 0.2]} position={[0, 0.1, 0]}><meshStandardMaterial color="#b0bec5" metalness={0.8} /></Box>
        </RigidBody>
    )
}

export const ExecutiveDesk = (props: any) => {
    return (
        <RigidBody type="fixed" colliders="hull" {...props}>
            <Box args={[2.5, 0.1, 1.2]} position={[0, 0.75, 0]}><meshStandardMaterial color="#3e2723" roughness={0.2} metalness={0.1} /></Box>
            <Box args={[0.6, 0.7, 1.1]} position={[-0.8, 0.35, 0]}><meshStandardMaterial color="#4e342e" /></Box>
            <Box args={[0.6, 0.7, 1.1]} position={[0.8, 0.35, 0]}><meshStandardMaterial color="#4e342e" /></Box>
            <Box args={[1.2, 0.6, 0.05]} position={[0, 0.4, -0.4]}><meshStandardMaterial color="#4e342e" /></Box>
        </RigidBody>
    )
}

export const Bookshelf = (props: any) => {
    return (
        <RigidBody type="fixed" colliders="cuboid" {...props}>
            <Box args={[1.2, 2.2, 0.4]} position={[0, 1.1, 0]}><meshStandardMaterial color="#5d4037" /></Box>
            <Box args={[1.1, 0.02, 0.38]} position={[0, 0.5, 0.01]}><meshStandardMaterial color="#3e2723" /></Box>
            <Box args={[1.1, 0.02, 0.38]} position={[0, 1.0, 0.01]}><meshStandardMaterial color="#3e2723" /></Box>
            <Box args={[1.1, 0.02, 0.38]} position={[0, 1.5, 0.01]}><meshStandardMaterial color="#3e2723" /></Box>
            <Box args={[0.8, 0.3, 0.3]} position={[0, 1.66, 0]}><meshStandardMaterial color="#1a237e" /></Box>
        </RigidBody>
    )
}

export const CeilingLight = (props: any) => { return <group {...props}><mesh position={[0, 0.05, 0]}><boxGeometry args={[1.2, 0.1, 0.6]} /><meshStandardMaterial color="#eeeeee" /></mesh><mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[1.15, 0.55]} /><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} toneMapped={false} /></mesh><pointLight intensity={0.5} distance={5} decay={2} position={[0, -0.5, 0]} /></group> }
export const ExitSign = (props: any) => { return <group {...props}><mesh position={[0, 0, 0]}><boxGeometry args={[0.4, 0.2, 0.05]} /><meshStandardMaterial color="#eeeeee" /></mesh><mesh position={[0, 0, 0.03]}><boxGeometry args={[0.35, 0.15, 0.01]} /><meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} /></mesh></group> }
export const FireExtinguisher = (props: any) => { return <RigidBody type="fixed" colliders="hull" {...props}><Cylinder args={[0.1, 0.1, 0.6]} position={[0, 0.3, 0]}><meshStandardMaterial color="#d32f2f" metalness={0.6} roughness={0.3} /></Cylinder></RigidBody> }
export const CopyMachine = (props: any) => { return <RigidBody type="fixed" {...props}><Box args={[1.2, 1.1, 1]} position={[0, 0.55, 0]}><meshStandardMaterial color="#eeeeee" /></Box></RigidBody> }
export const ServerRack = (props: any) => { return <RigidBody type="fixed" {...props}><Box args={[0.8, 2.2, 1]} position={[0, 1.1, 0]}><meshStandardMaterial color="#212121" metalness={0.8} /></Box></RigidBody> }
export const DeskLamp = (props: any) => { return <RigidBody type="dynamic" {...props}><Cylinder args={[0.1, 0.15, 0.05]} position={[0, 0.025, 0]}><meshStandardMaterial color="#263238" /></Cylinder></RigidBody> }
export const WallClock = (props: any) => { return <group {...props}><Cylinder args={[0.25, 0.25, 0.05]} rotation={[Math.PI / 2, 0, 0]}><meshStandardMaterial color="#eceff1" /></Cylinder></group> }
export const CoatRack = (props: any) => { return <RigidBody type="dynamic" {...props}><Cylinder args={[0.05, 0.05, 1.8]} position={[0, 0.9, 0]}><meshStandardMaterial color="#5d4037" /></Cylinder></RigidBody> }
export const UmbrellaStand = (props: any) => { return <RigidBody type="dynamic" {...props}><Cylinder args={[0.15, 0.15, 0.6]} position={[0, 0.3, 0]}><meshStandardMaterial color="#455a64" /></Cylinder></RigidBody> }
export const WallArt = (props: any) => { return <group {...props}><Box args={[1, 1.5, 0.05]}><meshStandardMaterial color="#212121" /></Box></group> }
export const LightSwitch = (props: any) => { return <group {...props}><Box args={[0.08, 0.12, 0.01]}><meshStandardMaterial color="#ffffff" /></Box></group> }
export const PowerOutlet = (props: any) => { return <group {...props}><Box args={[0.08, 0.12, 0.01]}><meshStandardMaterial color="#ffffff" /></Box></group> }
export const AirVent = (props: any) => { return <group {...props}><Box args={[0.4, 0.4, 0.02]}><meshStandardMaterial color="#eeeeee" /></Box></group> }
export const Thermostat = (props: any) => { return <group {...props}><Box args={[0.12, 0.12, 0.02]}><meshStandardMaterial color="#eceff1" /></Box></group> }
export const SmokeDetector = (props: any) => { return <group {...props}><Cylinder args={[0.1, 0.1, 0.05]} rotation={[Math.PI / 2, 0, 0]}><meshStandardMaterial color="#ffffff" /></Cylinder></group> }
export const Sprinkler = (props: any) => { return <group {...props}><Cylinder args={[0.02, 0.02, 0.05]} rotation={[Math.PI / 2, 0, 0]}><meshStandardMaterial color="#b0bec5" /></Cylinder></group> }
export const WiFiRouter = (props: any) => { return <RigidBody type="fixed" {...props}><Box args={[0.2, 0.05, 0.15]}><meshStandardMaterial color="#212121" /></Box></RigidBody> }
export const PaperTowelDispenser = (props: any) => { return <RigidBody type="fixed" {...props}><Box args={[0.3, 0.3, 0.15]}><meshStandardMaterial color="#eeeeee" /></Box></RigidBody> }
export const SoapDispenser = (props: any) => { return <RigidBody type="fixed" {...props}><Box args={[0.08, 0.15, 0.08]}><meshStandardMaterial color="#cfd8dc" /></Box></RigidBody> }
export const DoorFrame = (props: any) => { return <RigidBody type="fixed" colliders="trimesh" {...props}><Box args={[0.1, 2.1, 0.1]} position={[-0.5, 1.05, 0]}><meshStandardMaterial color="#5d4037" /></Box><Box args={[0.1, 2.1, 0.1]} position={[0.5, 1.05, 0]}><meshStandardMaterial color="#5d4037" /></Box><Box args={[1.1, 0.1, 0.1]} position={[0, 2.15, 0]}><meshStandardMaterial color="#5d4037" /></Box></RigidBody> }
export const WindowBlinds = (props: any) => { return <group {...props}><Box args={[2, 2.5, 0.05]}><meshStandardMaterial color="#f5f5f5" /></Box></group> }
