import * as THREE from 'three'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export function createMergedGeometry(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    if (geometries.length === 0) return new THREE.BufferGeometry();
    const merged = BufferGeometryUtils.mergeGeometries(geometries, true); // true = useGroups
    return merged;
}

export function createBoxGeometry(args: any, position: number[], rotation?: number[]): THREE.BoxGeometry {
    const geometry = new THREE.BoxGeometry(...args);
    if (rotation) geometry.rotateX(rotation[0]).rotateY(rotation[1]).rotateZ(rotation[2]);
    geometry.translate(position[0], position[1], position[2]);
    return geometry;
}

export function createCylinderGeometry(args: any, position: number[], rotation?: number[]): THREE.CylinderGeometry {
    const geometry = new THREE.CylinderGeometry(...args);
    if (rotation) geometry.rotateX(rotation[0]).rotateY(rotation[1]).rotateZ(rotation[2]);
    geometry.translate(position[0], position[1], position[2]);
    return geometry;
}
