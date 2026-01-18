import React, { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import useAudioStore from "../../audioStore";

interface CompanionPetProps {
    playerPosition: THREE.Vector3;
}

export const CompanionPet: React.FC<CompanionPetProps> = ({ playerPosition }) => {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Mesh>(null);
    const headRef = useRef<THREE.Mesh>(null);

    // Logic States (Infrequent updates)
    const [isSleeping, setIsSleeping] = useState(false);
    const [isPurring, setIsPurring] = useState(false);
    // isFollowing is logic state
    const [isFollowing, setIsFollowing] = useState(true);

    // Physics/Animation Refs (High frequency updates - NO RE-RENDERS)
    const targetPosition = useRef(new THREE.Vector3());
    const currentPosition = useRef(new THREE.Vector3(0, 0, 0));
    const lookDirection = useRef(new THREE.Vector3(0, 0, 1));

    // Refs for useFrame access to avoid dependency arrays causing re-renders
    const isSleepingRef = useRef(isSleeping);
    useEffect(() => { isSleepingRef.current = isSleeping }, [isSleeping]);

    const isFollowingRef = useRef(isFollowing);
    useEffect(() => { isFollowingRef.current = isFollowing }, [isFollowing]);

    const { camera } = useThree();
    const { playSound } = useAudioStore();

    // Constant geometry refs to avoid re-creation
    // (Actually simpler to just render them, React will reconcile if props don't change)
    // The issue was `setState` in useFrame causing re-render of the whole component every frame.

    // Update target position based on player logic
    useFrame(() => {
        if (isFollowingRef.current && !isSleepingRef.current) {
            const offset = new THREE.Vector3(-1, 0, -1);
            offset.applyQuaternion(camera.quaternion);
            offset.y = 0;
            targetPosition.current.copy(playerPosition).add(offset);
        }
    });

    // Random sleep behavior
    useEffect(() => {
        const sleepInterval = setInterval(() => {
            if (Math.random() < 0.3) {
                setIsSleeping(true);
                setTimeout(() => setIsSleeping(false), 10000);
            }
        }, 30000);
        return () => clearInterval(sleepInterval);
    }, []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Smooth movement towards target
        if (isFollowingRef.current && !isSleepingRef.current) {
            const direction = targetPosition.current.clone().sub(currentPosition.current);
            const distance = direction.length();

            if (distance > 0.1) {
                direction.normalize();
                const moveSpeed = 2 * delta;
                const moveVector = direction.multiplyScalar(Math.min(moveSpeed, distance));
                currentPosition.current.add(moveVector);

                // Update look direction
                lookDirection.current.copy(direction);
            }
        }

        // Look at cursor occasionally
        if (Math.random() < 0.01) {
            const cursorPos = new THREE.Vector3(0, 0, 0);
            const lookAtCursor = cursorPos.clone().sub(currentPosition.current).normalize();
            lookDirection.current.copy(lookAtCursor);
        }

        // Apply position and rotation to mesh
        groupRef.current.position.copy(currentPosition.current);

        if (bodyRef.current) {
            // Calculate rotation from lookDirection
            const targetPos = currentPosition.current.clone().add(lookDirection.current);
            bodyRef.current.lookAt(targetPos);
        }

        // Sleep animation
        if (isSleepingRef.current && bodyRef.current) {
            bodyRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        } else if (bodyRef.current) {
            // Reset rotation Z if needed, but be careful with lookAt
            // bodyRef.current.rotation.z = 0;
        }
    });

    const pet = () => {
        setIsPurring(true);
        playSound('success');
        setTimeout(() => setIsPurring(false), 3000);
    };

    const feed = () => {
        playSound('click');
    };

    return (
        <group ref={groupRef}>
            {/* Body */}
            <mesh ref={bodyRef} position={[0, 0.3, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.4, 0.3, 0.6]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>

            {/* Head */}
            <mesh
                ref={headRef}
                position={[0, 0.5, 0.2]}
                onClick={pet}
                onPointerOver={() => playSound('hover')}
                castShadow
            >
                <sphereGeometry args={[0.15, 8, 6]} />
                <meshStandardMaterial color="#D2691E" />
            </mesh>

            {/* Eyes */}
            <mesh position={[-0.05, 0.52, 0.32]}>
                <sphereGeometry args={[0.02, 6, 6]} />
                <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh position={[0.05, 0.52, 0.32]}>
                <sphereGeometry args={[0.02, 6, 6]} />
                <meshStandardMaterial color="#000000" />
            </mesh>

            {/* Ears */}
            <mesh position={[-0.08, 0.6, 0.15]}>
                <coneGeometry args={[0.03, 0.08, 4]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0.08, 0.6, 0.15]}>
                <coneGeometry args={[0.03, 0.08, 4]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>

            {/* Legs - Static Array to avoid re-render issues */}
            <mesh position={[-0.12, 0.1, 0.15]}>
                <cylinderGeometry args={[0.03, 0.03, 0.2, 6]} />
                <meshStandardMaterial color="#654321" />
            </mesh>
            <mesh position={[0.12, 0.1, 0.15]}>
                <cylinderGeometry args={[0.03, 0.03, 0.2, 6]} />
                <meshStandardMaterial color="#654321" />
            </mesh>
            <mesh position={[-0.12, 0.1, -0.15]}>
                <cylinderGeometry args={[0.03, 0.03, 0.2, 6]} />
                <meshStandardMaterial color="#654321" />
            </mesh>
            <mesh position={[0.12, 0.1, -0.15]}>
                <cylinderGeometry args={[0.03, 0.03, 0.2, 6]} />
                <meshStandardMaterial color="#654321" />
            </mesh>

            {/* Tail */}
            <mesh position={[0, 0.4, -0.35]}>
                <cylinderGeometry args={[0.02, 0.04, 0.3, 6]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>

            {/* Sleep Z's */}
            {isSleeping && (
                <group position={[0.2, 0.7, 0]}>
                    <mesh position={[0, 0, 0]}>
                        <planeGeometry args={[0.05, 0.05]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
                    </mesh>
                    <mesh position={[0.1, 0.1, 0]}>
                        <planeGeometry args={[0.05, 0.05]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
                    </mesh>
                </group>
            )}

            {/* Purring effect */}
            {isPurring && (
                <group position={[0, 0.6, 0.4]}>
                    <mesh position={[0, 0, 0]}>
                        <sphereGeometry args={[0.005]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
                    </mesh>
                </group>
            )}

            {/* Invisible interaction area */}
            <mesh
                position={[0, 0.3, 0]}
                visible={false}
                onClick={feed}
            >
                <boxGeometry args={[0.8, 0.6, 0.8]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
        </group>
    );
};