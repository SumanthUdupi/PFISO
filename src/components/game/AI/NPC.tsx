import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
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
    visualRoot: THREE.Group
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
            // Look forward/random
            this.context.setLookTarget(this.context.position.clone().add(new THREE.Vector3(0, 0, 5)));
        }

        // Transition to Patrol
        if (this.timer > this.duration) {
            this.machine.changeState('Patrol');
        }

        // Proximity Trigger for Interaction (Simple logic)
        if (this.context.playerRef.current) {
            const playerPos = new THREE.Vector3();
            // Assuming playerRef has getPosition or we access the mesh world position directly
            // For now, let's assume valid ref. If not available, skip.
            if (this.context.playerRef.current.position) { // Check your Player handle structure!
                // It might be a direct mesh ref or a handle. The handle has position via callback usually.
                // Let's assume passed ref is the Mesh or Group
                // Actually, in Lobby.tsx, playerRef is a PlayerHandle which has no direct position property exposure sync
                // We passed onPositionChange to Lobby. Use that? 
                // Ideally we pass the mutable playerPosition ref from Lobby.
            }
        }
    }
}

class PatrolState extends State<NPCContext> {
    private currentWPIndex: number = 0;
    private speed: number = 2.0;

    enter() {
        this.context.setIsMoving(true);
        // Pick next waypoint
        this.currentWPIndex = (this.currentWPIndex + 1) % this.context.waypoints.length;
    }

    exit() {
        this.context.setIsMoving(false);
    }

    update(delta: number) {
        const target = this.context.waypoints[this.currentWPIndex];
        const current = this.context.position;

        const dir = new THREE.Vector3().subVectors(target, current);
        const dist = dir.length();

        // Look at target
        this.context.setLookTarget(target);

        if (dist < 0.1) {
            // Arrived
            this.machine.changeState('Idle');
            return;
        }

        // Move
        const moveDist = Math.min(dist, this.speed * delta);
        dir.normalize().multiplyScalar(moveDist);
        current.add(dir);

        // Update Visual Root (No physics body, just visual for cosmetic NPC)
        this.context.visualRoot.position.copy(current);

        // Rotate body to face movement
        const angle = Math.atan2(dir.x, dir.z);
        this.context.visualRoot.rotation.y = angle;
    }
}

class InteractState extends State<NPCContext> {
    enter() {
        this.context.setIsMoving(false);
        this.context.showBark("Hello there!");
    }

    exit() { }

    update(delta: number) {
        // Face player
        if (this.context.playerRef.current) {
            // Need player position logic
        }
    }
}


const NPC: React.FC<NPCProps> = ({ position, waypoints = [], name = "NPC", playerRef, dialogue }) => {
    const group = useRef<THREE.Group>(null);
    const [isMoving, setIsMoving] = useState(false);
    const [lookTarget, setLookTarget] = useState(new THREE.Vector3());
    const [barkText, setBarkText] = useState<string | null>(null);

    // Initial position
    useEffect(() => {
        if (group.current) {
            group.current.position.set(...position);
        }
    }, [position]);

    // FSM Setup
    const fsm = useMemo(() => new StateMachine<NPCContext>(), []);

    // Context
    const context = useMemo<NPCContext>(() => ({
        visualRoot: null!, // Set later
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
        if (!group.current) return;
        context.visualRoot = group.current;

        fsm.addState('Idle', new IdleState(fsm, context));
        fsm.addState('Patrol', new PatrolState(fsm, context));
        // fsm.addState('Interact', new InteractState(fsm, context));

        fsm.start('Idle');
    }, [fsm, context]);

    // Update Loop
    useFrame((state, delta) => {
        fsm.update(delta);

        // Update local logic like clearing bark after time
        if (barkText && Math.random() > 0.995) { // Random clear for now or simple timer
            setBarkText(null);
        }

        // Hacky player tracking trigger for "Interact"/Wave
        // We need accurate player position. 
        // Let's rely on lookTarget being updated by FSM
    });

    return (
        <group ref={group}>
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
                    <style>{`
                    @keyframes popIn {
                        from { transform: scale(0) translate(-50%, 50%); opacity: 0; }
                        to { transform: scale(1) translate(0, 0); opacity: 1; }
                    }
                `}</style>
                </Html>
            )}
        </group>
    )
}

export default NPC
