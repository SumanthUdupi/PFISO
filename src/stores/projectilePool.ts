import { create } from 'zustand'
import * as THREE from 'three'

export const MAX_PROJECTILES = 100

interface ProjectileData {
    active: boolean
    position: THREE.Vector3
    velocity: THREE.Vector3
    lifetime: number
    id: number
}

interface ProjectileStore {
    projectiles: ProjectileData[]
    spawnProjectile: (position: THREE.Vector3, direction: THREE.Vector3, speed: number) => void
    updateProjectiles: (delta: number, scene: THREE.Scene, raycaster: THREE.Raycaster) => void
}

// We don't necessarily need a reactive store for the *loop*, 
// but we need a way to call "spawn". 
// Using a module-level variable for the tight loop data might be faster than Zustand state for *updates*,
// but Zustand is fine for the "spawn" API.
// Actually, for 60fps updates, accessing Zustand state might be slow if we replace the whole array.
// Let's use a "Ref" style store or just a class instance that we export.

class ProjectilePoolManager {
    count = 0
    max = MAX_PROJECTILES
    positions = new Float32Array(this.max * 3)
    velocities = new Float32Array(this.max * 3)
    lifetimes = new Float32Array(this.max)
    actives = new Uint8Array(this.max) // 0 or 1

    // Temp vector for math to avoid GC
    private _tempPos = new THREE.Vector3()
    private _tempNextPos = new THREE.Vector3()
    private _tempDir = new THREE.Vector3()

    spawn(position: THREE.Vector3, direction: THREE.Vector3, speed: number) {
        // Find first inactive
        let idx = -1
        for (let i = 0; i < this.max; i++) {
            if (this.actives[i] === 0) {
                idx = i
                break
            }
        }

        // If pool full, overwrite oldest? Or just random? 
        // For now, if full, ignore (or overwrite 0 which is essentially random if we strictly cycled, but we scan).
        // Let's overwrite running index to be faster?
        if (idx === -1) {
            // Pool full, skip or stealing logic. Let's steal slot 0 for now or just return.
            // Return to avoid glitching visual of existing bullet.
            return
        }

        this.actives[idx] = 1
        this.positions[idx * 3] = position.x
        this.positions[idx * 3 + 1] = position.y
        this.positions[idx * 3 + 2] = position.z

        this.velocities[idx * 3] = direction.x * speed
        this.velocities[idx * 3 + 1] = direction.y * speed
        this.velocities[idx * 3 + 2] = direction.z * speed

        this.lifetimes[idx] = 2.0 // 2 seconds life
    }
}

export const projectilePool = new ProjectilePoolManager()
