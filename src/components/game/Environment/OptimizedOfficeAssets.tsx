import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Box, Text, Cylinder, Detailed } from '@react-three/drei'
import { RigidBody, CuboidCollider, CylinderCollider, RigidBodyProps } from '@react-three/rapier'
import { createMergedGeometry, createBoxGeometry, createCylinderGeometry } from '../../utils/geometryUtils'

// --- Type Definitions ---
interface OfficeAssetProps extends RigidBodyProps {
    [key: string]: any
}

// --- Materials ---
const matDeskTop = new THREE.MeshStandardMaterial({ color: "#8d6e63", metalness: 0.1, roughness: 0.8 });
const matDeskLeg = new THREE.MeshStandardMaterial({ color: "#4e342e" });
const matMonitorScreen = new THREE.MeshStandardMaterial({ color: "#050505", roughness: 0.2, metalness: 0.5 }); // PERF-016: Standard > Physical
const matMonitorStand = new THREE.MeshStandardMaterial({ color: "#424242" });
const matKeyboard = new THREE.MeshStandardMaterial({ color: "#212121" });
const matKeyboardDetail = new THREE.MeshStandardMaterial({ color: "#424242", roughness: 0.8 });

const matChairMain = new THREE.MeshStandardMaterial({ color: "#455a64", roughness: 1.0 });
const matChairLeg = new THREE.MeshStandardMaterial({ color: "#ffffff", metalness: 1.0, roughness: 0.1 });

// --- Office Desk Optimization ---
// --- Office Desk Optimization ---
const deskAssets = (() => {
    // High Detail: All parts (7 geometries)
    const geosHigh: THREE.BufferGeometry[] = [];
    geosHigh.push(createBoxGeometry([2, 0.1, 1], [0, 0.75, 0]));
    geosHigh.push(createBoxGeometry([0.1, 0.7, 0.9], [-0.9, 0.35, 0]));
    geosHigh.push(createBoxGeometry([0.1, 0.7, 0.9], [0.9, 0.35, 0]));
    geosHigh.push(createBoxGeometry([0.8, 0.5, 0.05], [0, 1.05, -0.3]));
    geosHigh.push(createBoxGeometry([0.1, 0.2, 0.05], [0, 0.85, -0.3]));
    geosHigh.push(createBoxGeometry([0.5, 0.02, 0.2], [0, 0.81, 0.2]));
    geosHigh.push(createBoxGeometry([0.45, 0.01, 0.15], [0, 0.825, 0.2]));
    const mergedHigh = createMergedGeometry(geosHigh);
    const matsHigh = [matDeskTop, matDeskLeg, matDeskLeg, matMonitorScreen, matMonitorStand, matKeyboard, matKeyboardDetail];

    // Med Detail: Remove keyboard/mouse details (first 5 geometries)
    const geosMed: THREE.BufferGeometry[] = [];
    geosMed.push(createBoxGeometry([2, 0.1, 1], [0, 0.75, 0]));
    geosMed.push(createBoxGeometry([0.1, 0.7, 0.9], [-0.9, 0.35, 0]));
    geosMed.push(createBoxGeometry([0.1, 0.7, 0.9], [0.9, 0.35, 0]));
    geosMed.push(createBoxGeometry([0.8, 0.5, 0.05], [0, 1.05, -0.3]));
    geosMed.push(createBoxGeometry([0.1, 0.2, 0.05], [0, 0.85, -0.3]));
    const mergedMed = createMergedGeometry(geosMed);
    const matsMed = [matDeskTop, matDeskLeg, matDeskLeg, matMonitorScreen, matMonitorStand];

    // Low Detail: Just desk structure (first 3 geometries)
    const geosLow: THREE.BufferGeometry[] = [];
    geosLow.push(createBoxGeometry([2, 0.1, 1], [0, 0.75, 0]));
    geosLow.push(createBoxGeometry([0.1, 0.7, 0.9], [-0.9, 0.35, 0]));
    geosLow.push(createBoxGeometry([0.1, 0.7, 0.9], [0.9, 0.35, 0]));
    const mergedLow = createMergedGeometry(geosLow);
    const matsLow = [matDeskTop, matDeskLeg, matDeskLeg];

    return {
        high: { geometry: mergedHigh, materials: matsHigh },
        med: { geometry: mergedMed, materials: matsMed },
        low: { geometry: mergedLow, materials: matsLow }
    }
})();

export const OfficeDesk = (props: OfficeAssetProps) => {

    return (
        <RigidBody type="fixed" colliders={false} {...props}>
            <CuboidCollider args={[1, 0.05, 0.5]} position={[0, 0.75, 0]} />
            <CuboidCollider args={[0.05, 0.35, 0.45]} position={[-0.9, 0.35, 0]} />
            <CuboidCollider args={[0.05, 0.35, 0.45]} position={[0.9, 0.35, 0]} />
            <Detailed distances={[0, 15, 30]}>
                <mesh geometry={deskAssets.high.geometry} material={deskAssets.high.materials} castShadow receiveShadow />
                <mesh geometry={deskAssets.med.geometry} material={deskAssets.med.materials} castShadow receiveShadow />
                <mesh geometry={deskAssets.low.geometry} material={deskAssets.low.materials} castShadow receiveShadow />
            </Detailed>
        </RigidBody>
    )
}



// --- Office Plant ---
const matPot = new THREE.MeshStandardMaterial({ color: "#d84315" });
const matStem = new THREE.MeshStandardMaterial({ color: "#2e7d32" });
const matLeaves = new THREE.MeshStandardMaterial({ color: "#4caf50", roughness: 0.3, transparent: false, opacity: 1.0 }); // PERF-047: Opaque to reduce overdraw
const plantAssets = (() => {
    // High: 32 segments
    const geosHigh: THREE.BufferGeometry[] = [];
    geosHigh.push(createCylinderGeometry([0.3, 0.2, 0.4, 32], [0, 0.2, 0])); // Pot
    geosHigh.push(createCylinderGeometry([0.05, 0.05, 0.6], [0, 0.5, 0])); // Stem
    geosHigh.push(new THREE.SphereGeometry(0.4).translate(0, 0.9, 0)); // Leaves
    const mergedHigh = createMergedGeometry(geosHigh);
    const matsHigh = [matPot, matStem, matLeaves];

    // Med: 12 segments pot, Sphere leaves
    const geosMed: THREE.BufferGeometry[] = [];
    geosMed.push(createCylinderGeometry([0.3, 0.2, 0.4, 12], [0, 0.2, 0])); // Pot
    geosMed.push(createCylinderGeometry([0.05, 0.05, 0.6], [0, 0.5, 0])); // Stem
    geosMed.push(new THREE.SphereGeometry(0.4, 8, 6).translate(0, 0.9, 0)); // Leaves (Lower poly sphere)
    const mergedMed = createMergedGeometry(geosMed);
    const matsMed = [matPot, matStem, matLeaves];

    // Low: Box approximation
    const geosLow: THREE.BufferGeometry[] = [];
    geosLow.push(createBoxGeometry([0.5, 0.4, 0.5], [0, 0.2, 0])); // Pot Box
    geosLow.push(createBoxGeometry([0.1, 0.6, 0.1], [0, 0.5, 0])); // Stem Box
    geosLow.push(createBoxGeometry([0.7, 0.7, 0.7], [0, 0.9, 0])); // Leaves Box
    const mergedLow = createMergedGeometry(geosLow);
    const matsLow = [matPot, matStem, matLeaves];

    return {
        high: { geometry: mergedHigh, materials: matsHigh },
        med: { geometry: mergedMed, materials: matsMed },
        low: { geometry: mergedLow, materials: matsLow }
    }
})();

export const OfficePlant = (props: OfficeAssetProps) => {

    return (
        <RigidBody type="dynamic" colliders={false} {...props} density={0.5}>
            <CylinderCollider args={[0.5, 0.3]} position={[0, 0.5, 0]} />
            <Detailed distances={[0, 15, 30]}>
                <mesh geometry={plantAssets.high.geometry} material={plantAssets.high.materials} castShadow receiveShadow />
                <mesh geometry={plantAssets.med.geometry} material={plantAssets.med.materials} castShadow receiveShadow />
                <mesh geometry={plantAssets.low.geometry} material={plantAssets.low.materials} castShadow receiveShadow />
            </Detailed>
        </RigidBody>
    )
}

// --- Office Chair Optimization ---
// Create geometries once globally
const createChairGeometries = () => {
    // High Detail
    const geosHigh: THREE.BufferGeometry[] = [];
    geosHigh.push(createBoxGeometry([0.6, 0.1, 0.6], [0, 0.5, 0]));
    geosHigh.push(createBoxGeometry([0.6, 0.6, 0.1], [0, 0.8, -0.25]));
    geosHigh.push(createCylinderGeometry([0.3, 0.3, 0.1, 32], [0, 0.1, 0]));
    geosHigh.push(createCylinderGeometry([0.05, 0.4, 0.05, 16], [0, 0.3, 0]));
    const mergedHigh = createMergedGeometry(geosHigh);

    // Medium Detail: Lower segments
    const geosMed: THREE.BufferGeometry[] = [];
    geosMed.push(createBoxGeometry([0.6, 0.1, 0.6], [0, 0.5, 0]));
    geosMed.push(createBoxGeometry([0.6, 0.6, 0.1], [0, 0.8, -0.25]));
    geosMed.push(createCylinderGeometry([0.3, 0.3, 0.1, 8], [0, 0.1, 0]));
    geosMed.push(createCylinderGeometry([0.05, 0.4, 0.05, 6], [0, 0.3, 0]));
    const mergedMed = createMergedGeometry(geosMed);

    // Low Detail: Box approximation
    const geosLow: THREE.BufferGeometry[] = [];
    geosLow.push(createBoxGeometry([0.6, 0.1, 0.6], [0, 0.5, 0])); // Seat
    geosLow.push(createBoxGeometry([0.6, 0.6, 0.1], [0, 0.8, -0.25])); // Back
    geosLow.push(createBoxGeometry([0.3, 0.4, 0.3], [0, 0.2, 0])); // Base
    const mergedLow = createMergedGeometry(geosLow);

    return { high: mergedHigh, med: mergedMed, low: mergedLow }
}

const chairGeos = createChairGeometries()
const chairMatsHigh = [matChairMain, matChairMain, matChairLeg, matChairLeg]
const chairMatsMed = [matChairMain, matChairMain, matChairLeg, matChairLeg]
const chairMatsLow = [matChairMain, matChairMain, matChairLeg]

export const OfficeChair = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders={false} {...props} linearDamping={2} angularDamping={2}>
            <CuboidCollider args={[0.3, 0.5, 0.3]} position={[0, 0.5, 0]} />
            <Detailed distances={[0, 15, 30]}>
                <mesh geometry={chairGeos.high} material={chairMatsHigh} castShadow receiveShadow />
                <mesh geometry={chairGeos.med} material={chairMatsMed} castShadow receiveShadow />
                <mesh geometry={chairGeos.low} material={chairMatsLow} castShadow receiveShadow />
            </Detailed>
        </RigidBody>
    )
}

// --- Cubicle Partition Optimization ---
const matPartitionFrame = new THREE.MeshStandardMaterial({ color: "#b0bec5", metalness: 0.5 });
const matPartitionPanel = new THREE.MeshStandardMaterial({ color: "#cfd8dc", roughness: 0.9 });
export const CubiclePartition = (props: any) => {
    const { width = 2, height = 1.5 } = props
    const { geometry, materials } = useMemo(() => {
        const geos: THREE.BufferGeometry[] = [];
        geos.push(createBoxGeometry([width, height, 0.05], [0, height / 2, 0]));
        geos.push(createBoxGeometry([width - 0.1, height - 0.1, 0.06], [0, height / 2, 0]));
        const merged = createMergedGeometry(geos);
        const mats = [matPartitionFrame, matPartitionPanel];
        return { geometry: merged, materials: mats };
    }, [width, height]);
    return (
        <RigidBody type="fixed" colliders="cuboid" {...props}>
            <mesh geometry={geometry} material={materials} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Filing Cabinet ---
const matCabinet = new THREE.MeshStandardMaterial({ color: "#455a64", metalness: 0.6, roughness: 0.4 });
export const FilingCabinet = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders="cuboid" {...props}>
            <Box args={[0.5, 1.2, 0.6]} position={[0, 0.6, 0]} material={matCabinet} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Desktop Computer ---
const matComputer = new THREE.MeshStandardMaterial({ color: "#212121", metalness: 0.5 });
export const DesktopComputer = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders="cuboid" {...props}>
            <Box args={[0.2, 0.5, 0.5]} position={[0.3, 0.25, 0]} material={matComputer} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Trash Can ---
const matTrashBody = new THREE.MeshStandardMaterial({ color: "#546e7a", metalness: 0.5 });
const matTrashRim = new THREE.MeshStandardMaterial({ color: "#eceff1" });
const matTrashIn = new THREE.MeshStandardMaterial({ color: "#cfd8dc" });
export const TrashCan = (props: any) => {
    const { geometry, materials } = useMemo(() => {
        const geos: THREE.BufferGeometry[] = [];
        geos.push(createCylinderGeometry([0.2, 0.15, 0.4, 16], [0, 0.2, 0]));
        geos.push(new THREE.SphereGeometry(0.08).translate(0, 0.3, 0));
        geos.push(new THREE.SphereGeometry(0.07).translate(0.05, 0.25, -0.05));
        const merged = createMergedGeometry(geos);
        const mats = [matTrashBody, matTrashRim, matTrashIn];
        return { geometry: merged, materials: mats };
    }, []);
    return (
        <RigidBody type="dynamic" colliders={false} {...props}>
            <CylinderCollider args={[0.2, 0.2]} position={[0, 0.2, 0]} />
            <mesh geometry={geometry} material={materials} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Paper Stack ---
const matPaper = new THREE.MeshStandardMaterial({ color: "#fafafa", roughness: 0.9, metalness: 0 });
export const PaperStack = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders="cuboid" {...props}>
            <Box args={[0.2, 0.05, 0.3]} material={matPaper} castShadow receiveShadow />
        </RigidBody>
    )
}



// --- Glass Partition ---
const matGlass = new THREE.MeshPhysicalMaterial({ color: "#e0f7fa", transmission: 0.95, roughness: 0.05, thickness: 0.1, ior: 1.5, transparent: true });
export const GlassPartition = (props: any) => {
    return (
        <RigidBody type="fixed" colliders="cuboid" {...props}>
            <Box args={[4, 2.5, 0.1]} material={matGlass} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Conference Table ---
const matConfTableTop = new THREE.MeshStandardMaterial({ color: "#5d4037", roughness: 0.3, metalness: 0.1 });
const matConfTableLeg = new THREE.MeshStandardMaterial({ color: "#424242", metalness: 0.8 });
const confTableAssets = (() => {
    const geos: THREE.BufferGeometry[] = [];
    geos.push(createBoxGeometry([4, 0.1, 1.5], [0, 0.75, 0]));
    geos.push(createCylinderGeometry([0.1, 0.1, 0.7], [-1.5, 0.35, 0]));
    geos.push(createCylinderGeometry([0.1, 0.1, 0.7], [1.5, 0.35, 0]));
    const merged = createMergedGeometry(geos);
    const mats = [matConfTableTop, matConfTableLeg, matConfTableLeg];
    return { geometry: merged, materials: mats };
})();

export const ConferenceTable = (props: OfficeAssetProps) => {
    return (
        <RigidBody type="fixed" colliders={false} {...props}>
            <CuboidCollider args={[2, 0.05, 0.75]} position={[0, 0.75, 0]} />
            <CylinderCollider args={[0.35, 0.1]} position={[-1.5, 0.35, 0]} />
            <CylinderCollider args={[0.35, 0.1]} position={[1.5, 0.35, 0]} />
            <mesh geometry={confTableAssets.geometry} material={confTableAssets.materials} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Whiteboard ---
const matWhiteboardFrame = new THREE.MeshStandardMaterial({ color: "#cfd8dc", metalness: 0.5 });
const matWhiteboardSurface = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.1, metalness: 0.05 });
const matWhiteboardTray = new THREE.MeshStandardMaterial({ color: "#cfd8dc" });
export const Whiteboard = (props: any) => {
    const { geometry, materials } = useMemo(() => {
        const geos: THREE.BufferGeometry[] = [];
        geos.push(createBoxGeometry([3, 1.5, 0.05], [0, 0, 0]));
        geos.push(createBoxGeometry([2.9, 1.4, 0.02], [0, 0, 0.02]));
        geos.push(createBoxGeometry([2, 0.05, 0.1], [0, -0.75, 0.05]));
        const merged = createMergedGeometry(geos);
        const mats = [matWhiteboardFrame, matWhiteboardSurface, matWhiteboardTray];
        return { geometry: merged, materials: mats };
    }, []);
    return (
        <RigidBody type="fixed" colliders="cuboid" {...props}>
            <mesh geometry={geometry} material={materials} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Projector Screen ---
const matProjectorHousing = new THREE.MeshStandardMaterial({ color: "#eceff1" });
const matProjectorScreen = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.9, emissive: "#eeeeee", emissiveIntensity: 0.1 });
export const ProjectorScreen = (props: any) => {
    const { geometry, materials } = useMemo(() => {
        const geos: THREE.BufferGeometry[] = [];
        geos.push(createBoxGeometry([3.2, 0.15, 0.15], [0, 1.5, 0]));
        geos.push(createBoxGeometry([3, 2.5, 0.02], [0, 0.25, 0]));
        const merged = createMergedGeometry(geos);
        const mats = [matProjectorHousing, matProjectorScreen];
        return { geometry: merged, materials: mats };
    }, []);
    return (
        <RigidBody type="fixed" colliders="cuboid" {...props}>
            <mesh geometry={geometry} material={materials} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Reception Desk ---
const matReceptionBody = new THREE.MeshStandardMaterial({ color: "#455a64" });
const matReceptionTop = new THREE.MeshStandardMaterial({ color: "#cfd8dc" });
const receptionAssets = (() => {
    const geos: THREE.BufferGeometry[] = [];
    geos.push(createBoxGeometry([3, 1.1, 1], [0, 0.55, 0]));
    geos.push(createBoxGeometry([2.8, 0.05, 0.8], [0, 0.8, -0.2]));
    const merged = createMergedGeometry(geos);
    const mats = [matReceptionBody, matReceptionTop];
    return { geometry: merged, materials: mats };
})();

export const ReceptionDesk = (props: OfficeAssetProps) => {
    return (
        <RigidBody type="fixed" colliders={false} {...props}>
            <CuboidCollider args={[1.5, 0.55, 0.5]} position={[0, 0.55, 0]} />
            <mesh geometry={receptionAssets.geometry} material={receptionAssets.materials} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Sofa ---
const matSofa = new THREE.MeshStandardMaterial({ color: "#546e7a" });
const sofaAssets = (() => {
    const geos: THREE.BufferGeometry[] = [];
    geos.push(createBoxGeometry([2, 0.5, 0.8], [0, 0.25, 0]));
    geos.push(createBoxGeometry([2, 0.6, 0.2], [0, 0.5, -0.4]));
    const merged = createMergedGeometry(geos);
    const mats = [matSofa, matSofa];
    return { geometry: merged, materials: mats };
})();

export const Sofa = (props: OfficeAssetProps) => {
    return (
        <RigidBody type="fixed" colliders={false} {...props}>
            <CuboidCollider args={[1, 0.25, 0.4]} position={[0, 0.25, 0]} />
            <CuboidCollider args={[1, 0.3, 0.1]} position={[0, 0.5, -0.4]} />
            <mesh geometry={sofaAssets.geometry} material={sofaAssets.materials} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- CoffeeTable ---
const matCoffeeTable = new THREE.MeshStandardMaterial({ color: "#3e2723" });
export const CoffeeTable = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders="cuboid" {...props}>
            <Box args={[1.2, 0.4, 0.8]} position={[0, 0.2, 0]} material={matCoffeeTable} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Office Wall ---
const matWall = new THREE.MeshStandardMaterial({ color: "#eceff1" });
export const OfficeWall = (props: any) => {
    const w = props.width || 1
    const h = props.height || 3
    return (
        <RigidBody type="fixed" colliders={false} {...props}>
            <CuboidCollider args={[w / 2, h / 2, 0.1]} />
            <Box args={[w, h, 0.2]} material={matWall} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Executive Desk ---
const matExecDeskTop = new THREE.MeshStandardMaterial({ color: "#3e2723", roughness: 0.2, metalness: 0.1 });
const matExecDeskLeg = new THREE.MeshStandardMaterial({ color: "#4e342e" });
const execDeskAssets = (() => {
    // High
    const geosHigh: THREE.BufferGeometry[] = [];
    geosHigh.push(createBoxGeometry([2.5, 0.1, 1.2], [0, 0.75, 0]));
    geosHigh.push(createBoxGeometry([0.6, 0.7, 1.1], [-0.8, 0.35, 0]));
    geosHigh.push(createBoxGeometry([0.6, 0.7, 1.1], [0.8, 0.35, 0]));
    geosHigh.push(createBoxGeometry([1.2, 0.6, 0.05], [0, 0.4, -0.4]));
    const mergedHigh = createMergedGeometry(geosHigh);
    const matsHigh = [matExecDeskTop, matExecDeskLeg, matExecDeskLeg, matExecDeskLeg];

    // Med (Remove back panel)
    const geosMed: THREE.BufferGeometry[] = [];
    geosMed.push(createBoxGeometry([2.5, 0.1, 1.2], [0, 0.75, 0]));
    geosMed.push(createBoxGeometry([0.6, 0.7, 1.1], [-0.8, 0.35, 0]));
    geosMed.push(createBoxGeometry([0.6, 0.7, 1.1], [0.8, 0.35, 0]));
    const mergedMed = createMergedGeometry(geosMed);
    const matsMed = [matExecDeskTop, matExecDeskLeg, matExecDeskLeg];

    // Low (Blockout)
    const geosLow: THREE.BufferGeometry[] = [];
    geosLow.push(createBoxGeometry([2.5, 0.8, 1.2], [0, 0.4, 0]));
    const mergedLow = createMergedGeometry(geosLow);
    const matsLow = [matExecDeskLeg];

    return {
        high: { geometry: mergedHigh, materials: matsHigh },
        med: { geometry: mergedMed, materials: matsMed },
        low: { geometry: mergedLow, materials: matsLow }
    }
})();

export const ExecutiveDesk = (props: OfficeAssetProps) => {

    return (
        <RigidBody type="fixed" colliders={false} {...props}>
            <CuboidCollider args={[0.3, 0.35, 0.55]} position={[-0.8, 0.35, 0]} />
            <CuboidCollider args={[0.3, 0.35, 0.55]} position={[0.8, 0.35, 0]} />
            <CuboidCollider args={[1.25, 0.05, 0.6]} position={[0, 0.75, 0]} />
            <Detailed distances={[0, 20, 40]}>
                <mesh geometry={execDeskAssets.high.geometry} material={execDeskAssets.high.materials} castShadow receiveShadow />
                <mesh geometry={execDeskAssets.med.geometry} material={execDeskAssets.med.materials} castShadow receiveShadow />
                <mesh geometry={execDeskAssets.low.geometry} material={execDeskAssets.low.materials} castShadow receiveShadow />
            </Detailed>
        </RigidBody>
    )
}

// --- Bookshelf ---
const matBookshelf = new THREE.MeshStandardMaterial({ color: "#5d4037" });
const matShelf = new THREE.MeshStandardMaterial({ color: "#3e2723" });
const matBook = new THREE.MeshStandardMaterial({ color: "#1a237e" });
const bookshelfAssets = (() => {
    const geos: THREE.BufferGeometry[] = [];
    geos.push(createBoxGeometry([1.2, 2.2, 0.4], [0, 1.1, 0]));
    geos.push(createBoxGeometry([1.1, 0.02, 0.38], [0, 0.5, 0.01]));
    geos.push(createBoxGeometry([1.1, 0.02, 0.38], [0, 1.0, 0.01]));
    geos.push(createBoxGeometry([1.1, 0.02, 0.38], [0, 1.5, 0.01]));
    geos.push(createBoxGeometry([0.8, 0.3, 0.3], [0, 1.66, 0]));
    const merged = createMergedGeometry(geos);
    const mats = [matBookshelf, matShelf, matShelf, matShelf, matBook];
    return { geometry: merged, materials: mats };
})();

export const Bookshelf = (props: OfficeAssetProps) => {
    return (
        <RigidBody type="fixed" colliders="cuboid" {...props}>
            <mesh geometry={bookshelfAssets.geometry} material={bookshelfAssets.materials} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Office Cable ---
const matCable = new THREE.MeshStandardMaterial({ color: "#212121" });
export const OfficeCable = (props: any) => {
    const { geometry, materials } = useMemo(() => {
        const geos: THREE.BufferGeometry[] = [];
        geos.push(createCylinderGeometry([0.02, 0.02, 2], [0, 0, 0], [0, 0, Math.PI / 2]));
        const merged = createMergedGeometry(geos);
        const mats = [matCable];
        return { geometry: merged, materials: mats };
    }, []);
    return (
        <RigidBody type="fixed" colliders="hull" {...props}>
            <mesh geometry={geometry} material={materials} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Logo Component ---
export const Logo = (props: any) => {
    return (
        <group {...props}>
            <Text fontSize={1} color="#263238" anchorX="center" anchorY="middle">CORP INC.</Text>
        </group>
    )
}

// --- Kitchen Assets ---
const matCabinetMain = new THREE.MeshStandardMaterial({ color: "#f5f5f5" });
const matCabinetTop = new THREE.MeshStandardMaterial({ color: "#212121", roughness: 0.6 });
const matSink = new THREE.MeshStandardMaterial({ color: "#bdbdbd", metalness: 0.8 });
const kitchenCabinetAssets = (() => {
    const geos: THREE.BufferGeometry[] = [];
    geos.push(createBoxGeometry([3, 0.9, 0.6], [0, 0.45, 0]));
    geos.push(createBoxGeometry([3.1, 0.05, 0.65], [0, 0.925, 0]));
    geos.push(createBoxGeometry([0.8, 0.2, 0.5], [0.5, 0.85, 0]));
    const merged = createMergedGeometry(geos);
    const mats = [matCabinetMain, matCabinetTop, matSink];
    return { geometry: merged, materials: mats };
})();
export const KitchenCabinet = (props: OfficeAssetProps) => {
    return (
        <RigidBody type="fixed" colliders="cuboid" {...props}>
            <mesh geometry={kitchenCabinetAssets.geometry} material={kitchenCabinetAssets.materials} castShadow receiveShadow />
        </RigidBody>
    )
}

const matFridge = new THREE.MeshStandardMaterial({ color: "#b0bec5", metalness: 0.3 });
const fridgeGeo = new THREE.BoxGeometry(0.9, 1.8, 0.8);
export const Refrigerator = (props: OfficeAssetProps) => {
    return <RigidBody type="fixed" {...props}><mesh geometry={fridgeGeo} material={matFridge} position={[0, 0.9, 0]} castShadow receiveShadow /></RigidBody>
}

const matMicrowave = new THREE.MeshStandardMaterial({ color: "#212121" });
const microwaveGeo = new THREE.BoxGeometry(0.6, 0.4, 0.4);
export const Microwave = (props: OfficeAssetProps) => {
    return <RigidBody type="dynamic" {...props}><mesh geometry={microwaveGeo} material={matMicrowave} position={[0, 0.2, 0]} castShadow receiveShadow /></RigidBody>
}

const matCoffeeMaker = new THREE.MeshStandardMaterial({ color: "#3e2723" });
const coffeeMakerGeo = new THREE.BoxGeometry(0.3, 0.4, 0.3);
export const CoffeeMaker = (props: OfficeAssetProps) => {
    return <RigidBody type="dynamic" {...props}><mesh geometry={coffeeMakerGeo} material={matCoffeeMaker} position={[0, 0.2, 0]} castShadow receiveShadow /></RigidBody>
}

const matVending = new THREE.MeshStandardMaterial({ color: "#c62828" });
const vendingGeo = new THREE.BoxGeometry(1, 2, 0.8);
export const VendingMachine = (props: OfficeAssetProps) => {
    return <RigidBody type="fixed" {...props}><mesh geometry={vendingGeo} material={matVending} position={[0, 1, 0]} castShadow receiveShadow /></RigidBody>
}

const matWaterCooler = new THREE.MeshStandardMaterial({ color: "#eceff1" });
const waterCoolerGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
export const WaterCooler = (props: OfficeAssetProps) => {
    return <RigidBody type="fixed" {...props}><mesh geometry={waterCoolerGeo} material={matWaterCooler} position={[0, 0.6, 0]} castShadow receiveShadow /></RigidBody>
}

// --- Copy Machine ---
const matOfficeMachine = new THREE.MeshStandardMaterial({ color: "#eeeeee" });
const copyMachineGeo = new THREE.BoxGeometry(1.2, 1.1, 1);
export const CopyMachine = (props: OfficeAssetProps) => {
    return (
        <RigidBody type="fixed" {...props}>
            <mesh geometry={copyMachineGeo} material={matOfficeMachine} position={[0, 0.55, 0]} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Server Rack ---
const matServerRack = new THREE.MeshStandardMaterial({ color: "#212121", metalness: 0.8 });
const serverRackGeo = new THREE.BoxGeometry(0.8, 2.2, 1);
export const ServerRack = (props: OfficeAssetProps) => {
    return (
        <RigidBody type="fixed" {...props}>
            <mesh geometry={serverRackGeo} material={matServerRack} position={[0, 1.1, 0]} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Ceiling Light ---
const matLightFitting = new THREE.MeshStandardMaterial({ color: "#eeeeee" });
const matLightEmissive = new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 1, toneMapped: false });
const ceilingLightAssets = (() => {
    const geos: THREE.BufferGeometry[] = [];
    geos.push(createBoxGeometry([1.2, 0.1, 0.6], [0, 0.05, 0]));
    geos.push(new THREE.PlaneGeometry(1.15, 0.55).rotateX(Math.PI / 2));
    const merged = createMergedGeometry(geos);
    const mats = [matLightFitting, matLightEmissive];
    return { geometry: merged, materials: mats };
})();

export const CeilingLight = (props: OfficeAssetProps) => {
    return (
        <group {...props}>
            <mesh geometry={ceilingLightAssets.geometry} material={ceilingLightAssets.materials} />
            {/* PERF-017: Removed expensive per-instance light. Use baked lighting or global lights. */}
            {/* <pointLight intensity={0.5} distance={5} decay={2} position={[0, -0.5, 0]} /> */}
        </group>
    )
}

// --- Fire Extinguisher ---
const matFireExt = new THREE.MeshStandardMaterial({ color: "#d32f2f", metalness: 0.6, roughness: 0.3 });
const fireExtAssets = (() => {
    const geos: THREE.BufferGeometry[] = [];
    geos.push(createCylinderGeometry([0.1, 0.1, 0.6], [0, 0.3, 0]));
    const merged = createMergedGeometry(geos);
    const mats = [matFireExt];
    return { geometry: merged, materials: mats };
})();

export const FireExtinguisher = (props: OfficeAssetProps) => {
    return (
        <RigidBody type="fixed" colliders="hull" {...props}>
            <mesh geometry={fireExtAssets.geometry} material={fireExtAssets.materials} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Exit Sign ---
const matSignBody = new THREE.MeshStandardMaterial({ color: "#eeeeee" });
const matSignFace = new THREE.MeshStandardMaterial({ color: "#ff0000", emissive: "#ff0000", emissiveIntensity: 0.5 });
const exitSignAssets = (() => {
    const geos: THREE.BufferGeometry[] = [];
    geos.push(createBoxGeometry([0.4, 0.2, 0.05], [0, 0, 0]));
    geos.push(createBoxGeometry([0.35, 0.15, 0.01], [0, 0, 0.03]));
    const merged = createMergedGeometry(geos);
    const mats = [matSignBody, matSignFace];
    return { geometry: merged, materials: mats };
})();

export const ExitSign = (props: OfficeAssetProps) => {
    return (
        <group {...props}>
            <mesh geometry={exitSignAssets.geometry} material={exitSignAssets.materials} />
        </group>
    )
}

// --- Smoke Detector ---
const matDetector = new THREE.MeshStandardMaterial({ color: "#ffffff" });
const smokeDetectorAssets = (() => {
    const geos: THREE.BufferGeometry[] = [];
    geos.push(createCylinderGeometry([0.1, 0.1, 0.05], [0, 0, 0], [Math.PI / 2, 0, 0]));
    const merged = createMergedGeometry(geos);
    const mats = [matDetector];
    return { geometry: merged, materials: mats };
})();

export const SmokeDetector = (props: OfficeAssetProps) => {
    return (
        <group {...props}>
            <mesh geometry={smokeDetectorAssets.geometry} material={smokeDetectorAssets.materials} />
        </group>
    )
}

// --- Sprinkler ---
const matSprinkler = new THREE.MeshStandardMaterial({ color: "#b0bec5" });
const sprinklerAssets = (() => {
    const geos: THREE.BufferGeometry[] = [];
    geos.push(createCylinderGeometry([0.02, 0.02, 0.05], [0, 0, 0], [Math.PI / 2, 0, 0]));
    const merged = createMergedGeometry(geos);
    const mats = [matSprinkler];
    return { geometry: merged, materials: mats };
})();
export const Sprinkler = (props: OfficeAssetProps) => {
    return (
        <group {...props}>
            <mesh geometry={sprinklerAssets.geometry} material={sprinklerAssets.materials} />
        </group>
    )
}

// --- Air Vent ---
const matVent = new THREE.MeshStandardMaterial({ color: "#eeeeee" });
const airVentAssets = (() => {
    const geos: THREE.BufferGeometry[] = [];
    geos.push(createBoxGeometry([0.4, 0.4, 0.02], [0, 0, 0]));
    const merged = createMergedGeometry(geos);
    const mats = [matVent];
    return { geometry: merged, materials: mats };
})();

export const AirVent = (props: OfficeAssetProps) => {
    return (
        <group {...props}>
            <mesh geometry={airVentAssets.geometry} material={airVentAssets.materials} />
        </group>
    )
}

// --- Soap Dispenser ---
const matDispenser = new THREE.MeshStandardMaterial({ color: "#cfd8dc" });
const soapDispenserGeo = new THREE.BoxGeometry(0.08, 0.15, 0.08);
export const SoapDispenser = (props: OfficeAssetProps) => {
    return (
        <RigidBody type="fixed" {...props}>
            <mesh geometry={soapDispenserGeo} material={matDispenser} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Paper Towel Dispenser ---
const matTowelDispenser = new THREE.MeshStandardMaterial({ color: "#eeeeee" });
const towelDispenserGeo = new THREE.BoxGeometry(0.3, 0.3, 0.15);
export const PaperTowelDispenser = (props: OfficeAssetProps) => {
    return (
        <RigidBody type="fixed" {...props}>
            <mesh geometry={towelDispenserGeo} material={matTowelDispenser} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Door Frame ---
const matDoorFrame = new THREE.MeshStandardMaterial({ color: "#5d4037" });
const doorFrameAssets = (() => {
    const geos: THREE.BufferGeometry[] = [];
    geos.push(createBoxGeometry([0.1, 2.1, 0.1], [-0.5, 1.05, 0]));
    geos.push(createBoxGeometry([0.1, 2.1, 0.1], [0.5, 1.05, 0]));
    geos.push(createBoxGeometry([1.1, 0.1, 0.1], [0, 2.15, 0]));
    const merged = createMergedGeometry(geos);
    const mats = [matDoorFrame, matDoorFrame, matDoorFrame];
    return { geometry: merged, materials: mats };
})();
export const DoorFrame = (props: OfficeAssetProps) => {
    return (
        <RigidBody type="fixed" colliders="trimesh" {...props}>
            <mesh geometry={doorFrameAssets.geometry} material={doorFrameAssets.materials} castShadow receiveShadow />
        </RigidBody>
    )
}

// --- Toilet Stall ---
const matStallWall = new THREE.MeshStandardMaterial({ color: "#b0bec5" });
const matStallDoor = new THREE.MeshStandardMaterial({ color: "#cfd8dc" });
const matPorcelain = new THREE.MeshStandardMaterial({ color: "#ffffff" });

const toiletStallAssets = (() => {
    const geos: THREE.BufferGeometry[] = [];
    // Walls
    geos.push(createBoxGeometry([0.1, 2, 1.5], [-0.5, 1, 0]));
    geos.push(createBoxGeometry([0.1, 2, 1.5], [0.5, 1, 0]));
    const merged = createMergedGeometry(geos);
    const mats = [matStallWall, matStallWall];
    return { geometry: merged, materials: mats };
})();

export const ToiletStall = (props: OfficeAssetProps) => {
    return (
        <group {...props}>
            <RigidBody type="fixed" colliders="cuboid">
                <mesh geometry={toiletStallAssets.geometry} material={toiletStallAssets.materials} castShadow receiveShadow />
            </RigidBody>
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[0.9, 1.8, 0.05]} position={[0, 1, 0.75]} material={matStallDoor} castShadow receiveShadow />
            </RigidBody>
            <RigidBody type="fixed" colliders="hull" position={[0, 0, -0.4]}>
                <Box args={[0.4, 0.4, 0.5]} position={[0, 0.2, 0]} material={matPorcelain} castShadow receiveShadow />
                <Cylinder args={[0.2, 0.2, 0.1]} position={[0, 0.45, 0]} material={matPorcelain} castShadow receiveShadow />
                <Box args={[0.5, 0.6, 0.2]} position={[0, 0.5, -0.3]} material={matPorcelain} castShadow receiveShadow />
            </RigidBody>
        </group>
    )
}
