import { Pathfinding } from 'three-pathfinding';
import * as THREE from 'three';

class NavigationSystem {
    pathfinding: Pathfinding;
    ZONE: string = 'level1';
    isReady: boolean = false;

    constructor() {
        this.pathfinding = new Pathfinding();
    }

    /**
     * Initializes the navigation mesh from a Three.js Mesh
     */
    init(mesh: THREE.Mesh) {
        if (this.isReady) {
            console.warn("NavigationSystem already initialized. Skipping runtime rebake."); // PERF-024
            return;
        }

        console.log("Adding navigation mesh...");
        if (!mesh.geometry) {
            console.warn("NavMesh initialization failed: Mesh has no geometry.");
            return;
        }

        // Ideally, we clones the geometry and simplify it, but for a flat floor, it's fine.
        // three-pathfinding expects a buffer geometry.
        const zone = Pathfinding.createZone(mesh.geometry);
        this.pathfinding.setZoneData(this.ZONE, zone);
        this.isReady = true;
        console.log("Navigation mesh initialized (Runtime Baked).");
    }

    // PERF-024: Support for pre-baked NavMesh
    // Call this with JSON data from offline baking
    loadBakedZone(zoneData: any) {
        if (this.isReady) return;
        this.pathfinding.setZoneData(this.ZONE, zoneData);
        this.isReady = true;
        console.log("Navigation mesh initialized (Pre-baked).");
    }

    /**
     * Finds a path between two points
     */
    findPath(start: THREE.Vector3, end: THREE.Vector3): THREE.Vector3[] | null {
        if (!this.isReady) return null;

        // Find closest node to start and end
        const groupID = this.pathfinding.getGroup(this.ZONE, start);

        // Calculate path
        const path = this.pathfinding.findPath(start, end, this.ZONE, groupID);

        return path || null;
    }

    /**
     * Clamps a position to the navmesh (finds closest point)
     */
    clampPosition(position: THREE.Vector3): THREE.Vector3 | null {
        if (!this.isReady) return null;
        const groupID = this.pathfinding.getGroup(this.ZONE, position);
        const node = this.pathfinding.getClosestNode(position, this.ZONE, groupID);
        return node ? node.centroid : null; // Centroid is approx, normally we verify point in poly
    }

    /**
     * Returns a random valid point on the navigation mesh
     */
    getRandomPoint(): THREE.Vector3 | null {
        if (!this.isReady) return null;

        // Helper to pick random node from zone
        // three-pathfinding stores zone data internally.
        // Accessing internal data might be tricky without types, but typically:
        // this.pathfinding.zones[this.ZONE].groups[id] -> nodes

        // Because accessing internals is unsafe without casting, 
        // we will use a workaround: Pick a random point in bounds and clamp it.
        // Bounds (-20 to 20)

        let attempts = 10
        while (attempts > 0) {
            const x = (Math.random() - 0.5) * 40
            const z = (Math.random() - 0.5) * 40
            const pos = new THREE.Vector3(x, 0, z)

            const clamped = this.clampPosition(pos)
            // Check distance to verify it's valid (not snapped from too far)
            if (clamped && clamped.distanceTo(pos) < 5.0) {
                return clamped
            }
            attempts--
        }

        return new THREE.Vector3(0, 0, 0) // Fallback
    }
}

const navigationSystem = new NavigationSystem();
export default navigationSystem;
