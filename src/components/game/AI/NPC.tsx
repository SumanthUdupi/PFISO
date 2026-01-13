import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import RobloxCharacter from '../RobloxCharacter'
import { StateMachine, State } from './FSM'

// --- Types ---
interface NPCProps {
    position: [number, number, number]
    waypoints?: [number, number, number][]
    name?: string
    playerRef: React.MutableRefObject<any> // Reference to player for tracking
    dialogue?: string[]
}

interface NPCContext {
    rigidBody: any // Rapier API
    position: THREE.Vector3
    lookTarget: THREE.Vector3
    isMoving: boolean
    setIsMoving: (m: boolean) => void
    setLookTarget: (t: THREE.Vector3) => void
    waypoints: THREE.Vector3[]
    playerRef: React.MutableRefObject<any>
    showBark: (text: string) => void
}

// --- States ---

class IdleState extends State<NPCContext> {
    private timer: number = 0;
    private duration: number = 2;

    enter() {
        this.context.setIsMoving(false);
        this.timer = 0;
        this.duration = 2 + Math.random() * 2;
    }

    exit() { }

    update(delta: number) {
        this.timer += delta;

        // Look around occasionally
        if (Math.sin(this.timer) > 0.5) {
            this.context.setLookTarget(this.context.position.clone().add(new THREE.Vector3(0, 0, 5)));
        }

        // Transition to Patrol (if waypoints exist)
        if (this.context.waypoints.length > 0 && this.timer > this.duration) {
            this.machine.changeState('Patrol');
        }
    }
}

class PatrolState extends State<NPCContext> {
    private currentWPIndex: number = 0;
    private speed: number = 2.0;

    enter() {
        this.context.setIsMoving(true);
        this.currentWPIndex = (this.currentWPIndex + 1) % this.context.waypoints.length;
    }

    exit() {
        this.context.setIsMoving(false);
    }

    update(delta: number) {
        if (!this.context.rigidBody) return;

        const target = this.context.waypoints[this.currentWPIndex];
        const current = this.context.rigidBody.translation();
        const currentVec = new THREE.Vector3(current.x, current.y, current.z);

        // Update stored position for context
        this.context.position.copy(currentVec);

        const dir = new THREE.Vector3().subVectors(target, currentVec);
        dir.y = 0; // Keep horizontal
        const dist = dir.length();

        // Look at target
        this.context.setLookTarget(target);

        if (dist < 0.5) {
            // Arrived
            this.machine.changeState('Idle');
            this.context.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
            return;
        }

        // Move Kinematically via velocity
        dir.normalize().multiplyScalar(this.speed);
        this.context.rigidBody.setLinvel({ x: dir.x, y: 0, z: dir.z }, true);
    }
}

const NPC: React.FC<NPCProps> = ({ position, waypoints = [], name = "NPC", playerRef, dialogue }) => {
    const rigidBodyRef = useRef<any>(null);
    const [isMoving, setIsMoving] = useState(false);
    const [lookTarget, setLookTarget] = useState(new THREE.Vector3());
    const [barkText, setBarkText] = useState<string | null>(null);

    // FSM Setup
    const fsm = useMemo(() => new StateMachine<NPCContext>(), []);

    // Context
    const context = useMemo<NPCContext>(() => ({
        rigidBody: null!, // Set later
        position: new THREE.Vector3(...position),
        lookTarget: new THREE.Vector3(), // internal tracking
        isMoving: false,
        setIsMoving: (m) => setIsMoving(m),
        setLookTarget: (t) => setLookTarget(t.clone()),
        waypoints: waypoints.map(w => new THREE.Vector3(...w)),
        playerRef: playerRef,
        showBark: (text) => setBarkText(text)
    }), [position, playerRef, waypoints]);

    // Init FSM
    useEffect(() => {
        // Wait for body ref
        if (!rigidBodyRef.current) return;
        context.rigidBody = rigidBodyRef.current;

        fsm.addState('Idle', new IdleState(fsm, context));
        fsm.addState('Patrol', new PatrolState(fsm, context));
        fsm.start('Idle');
    }, [fsm, context]);

    // Update Loop
    useFrame((state, delta) => {
        if (rigidBodyRef.current) {
            context.rigidBody = rigidBodyRef.current; // Ensure fresh ref
            fsm.update(delta);
        }

        if (barkText && Math.random() > 0.995) {
            setBarkText(null);
        }
    });

    return (
        <RigidBody
            ref={rigidBodyRef}
            position={position}
            type="dynamic"
            enabledRotations={[false, false, false]}
            friction={0}
            linearDamping={5} // High damping to stop quickly
        >
            <CapsuleCollider args={[0.3, 0.3]} position={[0, 0.6, 0]} />

            <group>
                <RobloxCharacter isMoving={isMoving} lookTarget={lookTarget} />

                {/* Name Tag */}
                <Html position={[0, 2.2, 0]} center pointerEvents="none">
                    <div style={{
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontFamily: 'monospace'
                    }}>
                        {name}
                    </div>
                </Html>

                {/* Bark Bubble */}
                {barkText && (
                    <Html position={[0, 2.5, 0]} center>
                        <div style={{
                            background: 'white',
                            color: 'black',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            borderBottomLeftRadius: '0',
                            fontFamily: '"Press Start 2P", cursive',
                            fontSize: '10px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            whiteSpace: 'nowrap',
                            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}>
                            {barkText}
                        </div>
                    </Html>
                )}
            </group>
        </RigidBody>
    )
}

export default NPC
