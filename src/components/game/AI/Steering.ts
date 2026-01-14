import * as THREE from 'three'

export const Steering = {
    seek: (position: THREE.Vector3, target: THREE.Vector3, currentVelocity: THREE.Vector3, maxSpeed: number, maxForce: number = 0.5): THREE.Vector3 => {
        const desired = target.clone().sub(position).normalize().multiplyScalar(maxSpeed)
        const steer = desired.sub(currentVelocity)

        // Clamp steer force
        if (steer.lengthSq() > maxForce * maxForce) {
            steer.normalize().multiplyScalar(maxForce)
        }
        return steer
    },

    arrive: (position: THREE.Vector3, target: THREE.Vector3, currentVelocity: THREE.Vector3, maxSpeed: number, slowingRadius: number = 2.0, maxForce: number = 0.5): THREE.Vector3 => {
        const desired = target.clone().sub(position)
        const distance = desired.length()

        if (distance < slowingRadius) {
            // Slow down
            const m = THREE.MathUtils.mapLinear(distance, 0, slowingRadius, 0, maxSpeed)
            desired.normalize().multiplyScalar(m)
        } else {
            desired.normalize().multiplyScalar(maxSpeed)
        }

        const steer = desired.sub(currentVelocity)

        // Clamp steer force
        if (steer.lengthSq() > maxForce * maxForce) {
            steer.normalize().multiplyScalar(maxForce)
        }
        return steer
    }
}
