import * as THREE from 'three'

// --- Types ---
export type ColliderType = 'box' | 'capsule' | 'sphere'

export interface Collider {
    id: string
    type: ColliderType
    object: THREE.Object3D
    // For Box
    box?: THREE.Box3
    // For Capsule
    radius?: number
    height?: number // Cylinder height (not including caps)
    start?: THREE.Vector3
    end?: THREE.Vector3
    
    isStatic: boolean
    isTrigger: boolean
    onCollision?: (other: Collider) => void
}

export interface RigidBody {
    id: string
    position: THREE.Vector3
    velocity: THREE.Vector3
    mass: number
    restitution: number // Bounciness (0-1)
    friction: number // (0-1)
    linearDamping: number
    collider: Collider
    isGrounded: boolean
}

// --- Physics Engine ---
class PhysicsSystem {
    bodies: RigidBody[] = []
    staticColliders: Collider[] = []
    gravity = new THREE.Vector3(0, -30, 0) // Gamey gravity
    
    // Config
    fixedStep = 1 / 60
    maxSubSteps = 5

    constructor() {}

    addBody(body: RigidBody) {
        this.bodies.push(body)
    }

    removeBody(id: string) {
        this.bodies = this.bodies.filter(b => b.id !== id)
    }

    addStaticCollider(collider: Collider) {
        // Precompute box bounds if needed
        if (collider.type === 'box' && !collider.box) {
            collider.box = new THREE.Box3().setFromObject(collider.object)
        }
        this.staticColliders.push(collider)
    }

    // Main Update Step
    step(deltaTime: number) {
        // Apply Gravity & Forces
        for (const body of this.bodies) {
            // Integrate Velocity: v2 = v1 + a * dt
            // f = ma => a = f/m (here just gravity for now)
            body.velocity.addScaledVector(this.gravity, deltaTime)
            
            // Apply Damping
            body.velocity.multiplyScalar(Math.max(0, 1 - body.linearDamping * deltaTime))
        }

        // Collision Detection & Resolution
        for (const body of this.bodies) {
            body.isGrounded = false
            
            // Predict Position
            const potentialPos = body.position.clone().addScaledVector(body.velocity, deltaTime)

            // Check against Statics
            for (const staticCol of this.staticColliders) {
                if (staticCol.type === 'box') {
                   this.resolveSphereBox(body, potentialPos, staticCol, deltaTime)
                }
            }
            
            // Retrieve resolved position (simple integration for now)
            // Ideally we modify velocity during resolution
             body.position.addScaledVector(body.velocity, deltaTime)
             
             // Ground clamp safety
             if (body.position.y < 0) {
                 body.position.y = 0
                 body.velocity.y = 0
                 body.isGrounded = true
             }
        }
    }
    
    // --- Solvers ---

    // Simple Capsule/Sphere vs Box Solver
    // Treating Player as a Sphere at their feet for terrain collision simplicity for now
    // TODO: Full Capsule support
    resolveSphereBox(body: RigidBody, nextPos: THREE.Vector3, boxCol: Collider, dt: number) {
        if (!boxCol.box) return

        const radius = body.collider.radius || 0.5
        
        // Find closest point on box to sphere center
        const closest = new THREE.Vector3()
        closest.copy(nextPos).clamp(boxCol.box.min, boxCol.box.max)
        
        const diff = nextPos.clone().sub(closest)
        const distSq = diff.lengthSq()
        
        // Check collision
        if (distSq < radius * radius && distSq > 0.00001) {
            const dist = Math.sqrt(distSq)
            const overlap = radius - dist
            const normal = diff.divideScalar(dist)
            
            // Resolution: Project Velocity onto Normal
            const vDotN = body.velocity.dot(normal)
            
            // Only resolve if moving INTO the wall
            if (vDotN < 0) {
                 // Remove velocity component separate to normal
                 // V_new = V - (1 + restitution) * (V . N) * N
                 const j = -(1 + body.restitution) * vDotN
                 const impulse = normal.multiplyScalar(j)
                 body.velocity.add(impulse)
                 
                 // Friction
                 const tangent = body.velocity.clone().sub(normal.clone().multiplyScalar(body.velocity.dot(normal))).normalize()
                 const vDotT = body.velocity.dot(tangent)
                 body.velocity.sub(tangent.multiplyScalar(vDotT * body.friction))
                 
                 // Ground Check
                 if (normal.y > 0.7) {
                     body.isGrounded = true
                 }
            }
        }
    }
}

export const physicsInstance = new PhysicsSystem()
export default physicsInstance
