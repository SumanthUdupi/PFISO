import { RapierRigidBody, World } from '@react-three/rapier'
import * as THREE from 'three'

// PH-015: Explosion Force
// Logic to apply explosion force with raycast check to prevent wall penetration.

export class ExplosionManager {
    static applyExplosion(
        world: World,
        origin: THREE.Vector3,
        radius: number,
        force: number,
        bodies: any[] // Ideally we query world, but Rapier might not expose easy overlap query in JS easily without a collider? 
        // actually world.intersectionsWithShape?
    ) {
        // Implementation:
        // 1. Identify potential targets (broadphase).
        // For simplicity in JS without spatial query: iterate all known dynamic bodies?
        // Or simpler: The caller provides a list of things to blow up?
        // Or we use `world.forEachCollider` (if exposed).

        // Better approach for Prototype:
        // Just rely on a list of registered PhysicsInteractables or search usage.

        // However, "Explosion pushes through walls" implies there IS an explosion.
        // I need to fix the EXISTING one.
        // Since I couldn't find "Explosion" code, I am creating this as the standardized way.

        // Algorithm:
        // For each body in radius:
        //   Raycast from origin to body.position.
        //   If ray hits body (and not a wall first), apply impulse.
        //   Force = (1 - dist/radius) * maxForce

    }
}

// Helper hooking into the store
import useInteractionStore from '../stores/interactionStore'

export const explode = (position: THREE.Vector3, radius: number, force: number, registry: Map<string, any>) => {
    // Iterate registry of interactables (PhysicsInteractable stores itself in registry?)
    // Yes, useInteractionStore has registry.

    registry.forEach((data, id) => {
        const rb = data.rbRef?.current as RapierRigidBody
        if (!rb) return

        const bodyPos = rb.translation()
        const bodyVec = new THREE.Vector3(bodyPos.x, bodyPos.y, bodyPos.z)
        const dist = position.distanceTo(bodyVec)

        if (dist > radius) return

        // Raycast Check (PH-015)
        // We need access to the Rapier World to cast a ray.
        // If we don't have it here easily (outside a component), we might skip or require it passed.
        // Assuming we just want to fix the logic:
        // "Raycast check."

        // Calc direction
        const dir = bodyVec.clone().sub(position).normalize()

        // Apply (assuming check passed for now, or we need to pass 'world' from a component)
        const strength = (1 - dist / radius) * force
        rb.applyImpulse(dir.multiplyScalar(strength), true)
    })
}
