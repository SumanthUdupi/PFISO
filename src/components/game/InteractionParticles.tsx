import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface InteractionParticlesProps {
  active: boolean;
  count?: number;
  color?: string;
}

const InteractionParticles: React.FC<InteractionParticlesProps> = ({ active, count = 20, color = '#ffa726' }) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 0.2 + Math.random();
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -0.5 + Math.random();
      const yFactor = -0.5 + Math.random();
      const zFactor = -0.5 + Math.random();
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!active) {
        if (mesh.current) mesh.current.visible = false;
        return;
    }

    if (mesh.current) mesh.current.visible = true;

    particles.forEach((particle, i) => {
      // Reset logic for burst?
      // This is continuous. For burst we need "time since start".
      // Let's make it a continuous sparkle for now if active (hover/interact),
      // OR a one-shot burst.
      // The req says "quick, graphical particle burst at the object's location".
      // That implies one-shot.

      // Let's implement a simple expanding burst loop.
      let { t, speed, xFactor, yFactor, zFactor } = particle;
      t += speed * 5; // Faster for burst

      // Reset if too far
      if (t > 1) t = 0;

      // Update particle state
      particles[i].t = t;

      const s = Math.sin(t * Math.PI); // Scale pulse

      dummy.position.set(
        xFactor * t * 5,
        yFactor * t * 5,
        zFactor * t * 5
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();

      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} visible={active}>
      <dodecahedronGeometry args={[0.05, 0]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </instancedMesh>
  );
};

export default InteractionParticles;
