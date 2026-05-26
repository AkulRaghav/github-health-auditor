"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Premium 3D Particle Field — floating particles with depth-of-field feel.
 * Reacts subtly to create an ambient premium background.
 */

function Particles({ count = 200 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    return { positions };
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = state.clock.elapsedTime * 0.02;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.03;

    // Subtle mouse influence
    const { x, y } = state.pointer;
    mesh.current.rotation.x += y * 0.01;
    mesh.current.rotation.y += x * 0.01;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#22d3ee"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingOrbs() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  return (
    <group ref={group}>
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 3 + Math.random() * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * 0.5, Math.sin(angle) * radius]}>
            <sphereGeometry args={[0.08 + Math.random() * 0.05, 16, 16]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function ParticleField({ className }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className || ""}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Particles count={150} />
        <FloatingOrbs />
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  );
}
