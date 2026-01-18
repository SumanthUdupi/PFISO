import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import inputs from '../systems/InputManager'
import gameSystemInstance from './GameSystem'

const CameraSystem = () => {
    const { camera, gl } = useThree()
    
    // State
    const currentRotation = useRef({ x: 0, y: 0 })
    const currentDistance = 8
    const pivotOffset = new THREE.Vector3(0, 1.5, 0) // Look above feet

    useEffect(() => {
        // Initialize rotation from current camera transform
        const e = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
        currentRotation.current.x = e.y // Yaw
        currentRotation.current.y = e.x // Pitch
    }, [camera])

    useFrame((_state, delta) => {
        const dt = Math.min(delta, 0.1)

        // 1. Input (Mouse Look)
        const lookX = inputs.getAxis('LOOK_X') 
        const lookY = inputs.getAxis('LOOK_Y') 
        
        // 2. Update Rotation
        // Sensitivity hardcoded for now, can perform tuning later
        const sensitivity = 1.0 
        currentRotation.current.x -= lookX * 2.0 * sensitivity * dt
        currentRotation.current.y -= lookY * 2.0 * sensitivity * dt

        // Clamp Pitch
        const minPitch = -Math.PI / 3
        const maxPitch = Math.PI / 3
        currentRotation.current.y = Math.max(minPitch, Math.min(maxPitch, currentRotation.current.y))

        // 3. Follow Player
        const pPos = gameSystemInstance.playerPosition
        if (pPos) {
            // Target Pivot (Player Head area)
            const targetPivot = new THREE.Vector3(pPos.x, pPos.y, pPos.z).add(pivotOffset)

            // Calculate Position based on Rotation and Distance
            const quat = new THREE.Quaternion().setFromEuler(
                new THREE.Euler(currentRotation.current.y, currentRotation.current.x, 0, 'YXZ')
            )
            const offset = new THREE.Vector3(0, 0, currentDistance).applyQuaternion(quat)
            const targetCamPos = targetPivot.clone().add(offset)

            // Smoothly move camera
            camera.position.lerp(targetCamPos, dt * 10)
            
            // Look at pivot
            camera.lookAt(targetPivot)
        }
    })

    return <PointerLockHandler />
}

const PointerLockHandler = () => {
    const { gl } = useThree()
    useEffect(() => {
        const canvas = gl.domElement
        const handleClick = () => canvas.requestPointerLock()
        canvas.addEventListener('click', handleClick)
        return () => canvas.removeEventListener('click', handleClick)
    }, [gl])
    return null
}

export default CameraSystem
