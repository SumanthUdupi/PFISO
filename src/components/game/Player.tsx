import React, { useRef, useEffect, useState, useMemo, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html, useTexture } from '@react-three/drei'
import TeleportSparkle from './TeleportSparkle'
import { useSpriteSheet } from '../../hooks/useSpriteSheet'
import atlasData from '../../assets/atlas/sprites.json'

// Constants for physics and animation
const SPEED = 5
const ACCELERATION = 20
const FRICTION = 10
const ROTATION_SPEED = 15
const HEAD_TRACKING_LIMIT = Math.PI / 4
const BORED_TIMEOUT = 10000
const JUMP_FORCE = 8
const GRAVITY = 20

const DustParticles = ({ position, isMoving }: { position: THREE.Vector3, isMoving: boolean }) => {
    const particles = useRef<{ mesh: THREE.Mesh, life: number, velocity: THREE.Vector3 }[]>([])
    const group = useRef<THREE.Group>(null)
    const geometry = useMemo(() => new THREE.CircleGeometry(0.05, 8), [])
    const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 'white', transparent: true, opacity: 0.6 }), [])

    useFrame((state, delta) => {
        if (!group.current) return
        if (isMoving && Math.random() < 0.2) {
            const mesh = new THREE.Mesh(geometry, material.clone())
            mesh.rotation.x = -Math.PI / 2
            mesh.position.set(position.x + (Math.random() - 0.5) * 0.4, 0.05, position.z + (Math.random() - 0.5) * 0.4)
            group.current.add(mesh)
            particles.current.push({
                mesh,
                life: 1.0,
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.5, Math.random() * 0.5, (Math.random() - 0.5) * 0.5)
            })
        }
        for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i]
            p.life -= delta * 2
            p.mesh.position.addScaledVector(p.velocity, delta)
            p.mesh.scale.setScalar(p.life)
            // @ts-ignore
            p.mesh.material.opacity = p.life * 0.6
            if (p.life <= 0) {
                group.current.remove(p.mesh)
                p.mesh.geometry.dispose()
                // @ts-ignore
                p.mesh.material.dispose()
                particles.current.splice(i, 1)
            }
        }
    })
    return <group ref={group} />
}


export interface PlayerHandle {
    triggerInteraction: (label: string) => void
}

interface PlayerProps {
    onPositionChange?: (pos: THREE.Vector3) => void
    initialPosition?: [number, number, number]
    bounds?: { width: number, depth: number }
}

const Player = React.forwardRef<PlayerHandle, PlayerProps>(({ onPositionChange, initialPosition = [0, 0.5, 0], bounds }, ref) => {
    const mesh = useRef<THREE.Group>(null)
    const shadowMesh = useRef<THREE.Mesh>(null)

    // Load Texture Atlas
    const atlasTexture = useTexture('assets/atlas/sprites.webp')

    // Prepare textures for animation
    const idleData = (atlasData as any)['player-idle.webp']
    const walkData = (atlasData as any)['player-walk.webp']

    // We must clone the texture because useSpriteSheet modifies offset/repeat
    // and we need different offsets for idle vs walk
    const idleTex = useMemo(() => atlasTexture.clone(), [atlasTexture])
    const walkTex = useMemo(() => atlasTexture.clone(), [atlasTexture])

    // Map atlas data to our hook's expected format (uv coordinates)
    // atlasData has { uv: [x, y, w, h] }
    const idleRegion = useMemo(() => {
        if (!idleData) return undefined
        const [x, y, w, h] = idleData.uv
        return { x, y, w, h }
    }, [idleData])

    const walkRegion = useMemo(() => {
        if (!walkData) return undefined
        const [x, y, w, h] = walkData.uv
        return { x, y, w, h }
    }, [walkData])

    const idleTexture = useSpriteSheet(idleTex, 4, 1, 0.2, idleRegion)
    const walkTexture = useSpriteSheet(walkTex, 4, 1, 0.1, walkRegion)

    // Physics state
    const velocity = useRef(new THREE.Vector3(0, 0, 0))
    const verticalVelocity = useRef(0)
    const currentPosition = useRef(new THREE.Vector3(...initialPosition))
    const targetRotation = useRef(0)

    // Input state
    const keys = useRef<{ [key: string]: boolean }>({})
    const lastInputTime = useRef(Date.now())
    const [isBored, setIsBored] = useState(false)
    const isMoving = useRef(false)
    const isJumping = useRef(false)

    // Interaction State
    const [interactionLabel, setInteractionLabel] = useState<string | null>(null)
    const interactionTimer = useRef<number>(0)

    // AN-02: Speed Trails
    const trailsGroup = useRef<THREE.Group>(null)
    const trailsRef = useRef<{ mesh: THREE.Mesh, life: number, material: THREE.Material }[]>([])

    const [sparkleTrigger, setSparkleTrigger] = useState(false)

    useImperativeHandle(ref, () => ({
        triggerInteraction: (label: string) => {
            setInteractionLabel(label)
            interactionTimer.current = 1.5
            velocity.current.set(0, 0, 0)
            isMoving.current = false
            setSparkleTrigger(true)
        }
    }))

    // Setup Input Listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keys.current[e.key] = true
            // Space for Jump
            if (e.code === 'Space' && !isJumping.current && interactionTimer.current <= 0) {
                verticalVelocity.current = JUMP_FORCE
                isJumping.current = true
            }
            lastInputTime.current = Date.now()
            setIsBored(false)
        }
        const handleKeyUp = (e: KeyboardEvent) => {
            keys.current[e.key] = false
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    useFrame((state, delta) => {
        if (!mesh.current) return

        // Handle Interaction Timer
        if (interactionTimer.current > 0) {
            interactionTimer.current -= delta
            if (interactionTimer.current <= 0) {
                setInteractionLabel(null)
            }
            // "Got Item" visual feedback
            // Spin and hover
            mesh.current.rotation.y += 10 * delta
            mesh.current.position.y = 1.0 + Math.sin(state.clock.elapsedTime * 10) * 0.1
            return
        }

        // --- Boredom Check ---
        if (!isMoving.current && !isJumping.current && Date.now() - lastInputTime.current > BORED_TIMEOUT) {
            if (!isBored) setIsBored(true)
        }

        // --- Movement Logic ---
        const inputVector = new THREE.Vector3(0, 0, 0)
        if (keys.current['w'] || keys.current['ArrowUp']) inputVector.z -= 1
        if (keys.current['s'] || keys.current['ArrowDown']) inputVector.z += 1
        if (keys.current['a'] || keys.current['ArrowLeft']) inputVector.x -= 1
        if (keys.current['d'] || keys.current['ArrowRight']) inputVector.x += 1

        if (inputVector.length() > 0) {
            inputVector.normalize()
            isMoving.current = true
            lastInputTime.current = Date.now()
            setIsBored(false)
        } else {
            isMoving.current = false
        }

        if (isMoving.current) {
            velocity.current.addScaledVector(inputVector, ACCELERATION * delta)
        }

        if (velocity.current.length() > SPEED) {
            velocity.current.setLength(SPEED)
        }

        const frictionForce = velocity.current.clone().multiplyScalar(-1).normalize().multiplyScalar(FRICTION * delta)
        if (velocity.current.length() < frictionForce.length()) {
            velocity.current.set(0, 0, 0)
        } else {
            velocity.current.add(frictionForce)
        }

        currentPosition.current.addScaledVector(velocity.current, delta)

        if (bounds) {
            const halfW = bounds.width / 2 - 0.5
            const halfD = bounds.depth / 2 - 0.5
            currentPosition.current.x = Math.max(-halfW, Math.min(halfW, currentPosition.current.x))
            currentPosition.current.z = Math.max(-halfD, Math.min(halfD, currentPosition.current.z))
        }

        verticalVelocity.current -= GRAVITY * delta
        let currentY = mesh.current.position.y + verticalVelocity.current * delta

        if (currentY <= 0.5) {
            currentY = 0.5
            verticalVelocity.current = 0
            isJumping.current = false
        } else {
            isJumping.current = true
        }

        mesh.current.position.set(currentPosition.current.x, currentY, currentPosition.current.z)

        // Update Trails (AN-02)
        if (trailsGroup.current) {
            if (isMoving.current && state.clock.getElapsedTime() % 0.1 < delta) {
                // Clone texture to freeze the frame for the trail
                const trailTex = walkTexture.clone()
                trailTex.offset.copy(walkTexture.offset)
                trailTex.repeat.copy(walkTexture.repeat)

                const trailMat = new THREE.MeshStandardMaterial({
                    map: trailTex,
                    transparent: true,
                    opacity: 0.5,
                    side: THREE.DoubleSide
                })

                const trailMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.8, 0.8),
                    trailMat
                )
                trailMesh.position.copy(mesh.current.position)
                trailMesh.rotation.copy(mesh.current.rotation) // Copy billboard rotation at spawn time

                trailsGroup.current.add(trailMesh)
                trailsRef.current.push({ mesh: trailMesh, life: 1.0, material: trailMat })
            }

            for (let i = trailsRef.current.length - 1; i >= 0; i--) {
                const trail = trailsRef.current[i]
                trail.life -= delta * 3
                // @ts-ignore
                trail.mesh.material.opacity = trail.life * 0.5

                if (trail.life <= 0) {
                    trailsGroup.current.remove(trail.mesh)
                    trail.mesh.geometry.dispose()
                    trail.material.dispose()
                    // Dispose texture clone
                    // @ts-ignore
                    if (trail.material.map) trail.material.map.dispose()
                    trailsRef.current.splice(i, 1)
                }
            }
        }

        if (onPositionChange) onPositionChange(currentPosition.current)

        mesh.current.lookAt(state.camera.position)

        if (shadowMesh.current) {
             const height = mesh.current.position.y - 0.5
             const shadowScale = 1 - height * 0.5
             shadowMesh.current.scale.setScalar(Math.max(0.1, shadowScale))
             // @ts-ignore
             shadowMesh.current.material.opacity = Math.max(0, 0.3 - height * 0.5)
             shadowMesh.current.rotation.set(-Math.PI/2, 0, 0)
        }

    })

    const activeTexture = isMoving.current ? walkTexture : idleTexture

    return (
        <>
            <TeleportSparkle
                position={mesh.current ? mesh.current.position : new THREE.Vector3(...initialPosition)}
                trigger={sparkleTrigger}
                onComplete={() => setSparkleTrigger(false)}
            />

            <group ref={trailsGroup} />

            <group ref={mesh} position={initialPosition}>
                {interactionLabel && (
                     <Html position={[0, 1, 0]} center>
                         <div style={{
                             fontFamily: '"Press Start 2P", cursive',
                             color: 'white',
                             background: 'rgba(0,0,0,0.7)',
                             padding: '5px',
                             borderRadius: '5px',
                             textAlign: 'center',
                             border: '2px solid white'
                         }}>
                             <div style={{fontSize: '24px', marginBottom: '5px'}}>★</div>
                             <div style={{fontSize: '10px'}}>{interactionLabel}</div>
                         </div>
                     </Html>
                )}

                <mesh position={[0, 0.4, 0]} castShadow>
                    <planeGeometry args={[1, 1]} />
                    <meshStandardMaterial
                        map={activeTexture}
                        transparent
                        alphaTest={0.5}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </group>

            <mesh
                ref={shadowMesh}
                position={[currentPosition.current.x, 0.05, currentPosition.current.z]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <circleGeometry args={[0.3, 16]} />
                <meshBasicMaterial color="black" transparent opacity={0.3} />
            </mesh>

            <DustParticles position={currentPosition.current} isMoving={isMoving.current && !isJumping.current} />
        </>
    )
})

export default Player
