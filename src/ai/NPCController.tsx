import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import RobloxCharacter from '../components/game/RobloxCharacter'
import { StateMachine, State } from './StateMachine'

const NPCController: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const rigidBodyRef = useRef<RapierRigidBody>(null)
    const fsm = useRef<StateMachine | null>(null)
    const moveTarget = useRef<THREE.Vector3 | null>(null)

    // Define States
    useEffect(() => {
        const entity = {
            rb: rigidBodyRef.current,
            setTarget: (t: THREE.Vector3) => moveTarget.current = t,
            getTarget: () => moveTarget.current,
            position: new THREE.Vector3(...position) // Initial, update in loop
        }

        const idleState: State = {
            name: 'IDLE',
            enter: () => {
                // console.log("NPC: Idle")
                moveTarget.current = null
            },
            update: (ent, dt) => {
                // Randomly switch to patrol
                if (Math.random() < 0.01) {
                    fsm.current?.changeState('PATROL')
                }
            },
            exit: () => { }
        }

        const patrolState: State = {
            name: 'PATROL',
            enter: (ent) => {
                // Pick random point nearby
                const r = 5
                const x = ent.position.x + (Math.random() - 0.5) * r
                const z = ent.position.z + (Math.random() - 0.5) * r
                moveTarget.current = new THREE.Vector3(x, ent.position.y, z)
                // console.log("NPC: Patrolling to", x, z)
            },
            update: (ent, dt) => {
                const target = moveTarget.current
                if (!target || !ent.rb) return

                const curPos = ent.rb.translation()
                const dist = Math.sqrt(Math.pow(target.x - curPos.x, 2) + Math.pow(target.z - curPos.z, 2))

                if (dist < 0.5) {
                    fsm.current?.changeState('IDLE')
                    ent.rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
                    return
                }

                // Move
                const speed = 2.0
                const dir = new THREE.Vector3(target.x - curPos.x, 0, target.z - curPos.z).normalize()
                ent.rb.setLinvel({ x: dir.x * speed, y: ent.rb.linvel().y, z: dir.z * speed }, true)

                // Rotation (simple lookAt)
                // Note: Rotation logic needs to update visual mesh, but RB is locked.
                // We'll handle visual rotation in the render loop if we had a ref to mesh group.
            },
            exit: () => { }
        }

        fsm.current = new StateMachine(entity)
        fsm.current.addState(idleState)
        fsm.current.addState(patrolState)
        fsm.current.changeState('IDLE')

    }, [])

    useFrame((state, delta) => {
        if (fsm.current && rigidBodyRef.current) {
            // Sync entity position wrapper
            const t = rigidBodyRef.current.translation()
            fsm.current.entity.position.set(t.x, t.y, t.z)
            // Update FSM
            fsm.current.update(delta)
        }
    })

    return (
        <RigidBody ref={rigidBodyRef} position={position} colliders={false} enabledRotations={[false, false, false]} friction={0}>
            <CapsuleCollider args={[0.25, 0.6]} position={[0, 0.9, 0]} />
            <RobloxCharacter isMoving={!!moveTarget.current} speed={moveTarget.current ? 2 : 0} />
        </RigidBody>
    )
}

export default NPCController
