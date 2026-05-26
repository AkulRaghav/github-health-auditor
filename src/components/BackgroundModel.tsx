"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

/**
 * 3D rotating wireframe geometry — fills empty background areas.
 * Slowly rotates and pulses, reacts to scroll position.
 */

function WireframeKnot() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => new THREE.TorusKnotGeometry(2.5, 0.8, 128, 32), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 15), [geometry]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.08;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.12;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
    if (wireRef.current) {
      wireRef.current.rotation.x = state.clock.elapsedTime * 0.08;
      wireRef.current.rotation.y = state.clock.elapsedTime * 0.12;
      wireRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group>
      {/* Solid mesh — very faint fill */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.02} />
      </mesh>
      {/* Wireframe edges */}
      <lineSegments ref={wireRef} geometry={edges}>
        <lineBasicMaterial color="#06b6d4" transparent opacity={0.15} />
      </lineSegments>
    </group>
  );
}

function FloatingRing() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    ref.current.rotation.z = state.clock.elapsedTime * 0.15;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.5;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[4, 0.015, 16, 100]} />
      <meshBasicMaterial color="#a78bfa" transparent opacity={0.2} />
    </mesh>
  );
}

function FloatingRing2() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.PI / 3 + Math.cos(state.clock.elapsedTime * 0.15) * 0.2;
    ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    ref.current.position.y = Math.cos(state.clock.elapsedTime * 0.25) * 0.3;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[3.2, 0.01, 16, 80]} />
      <meshBasicMaterial color="#06b6d4" transparent opacity={0.12} />
    </mesh>
  );
}

function SmallOrbs() {
  const groupRef = useRef<THREE.Group>(null);

  const orbs = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * Math.PI * 2,
      radius: 3.5 + Math.random() * 1.5,
      speed: 0.1 + Math.random() * 0.15,
      size: 0.04 + Math.random() * 0.03,
      yOffset: (Math.random() - 0.5) * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(orb.angle) * orb.radius,
            orb.yOffset,
            Math.sin(orb.angle) * orb.radius,
          ]}
        >
          <sphereGeometry args={[orb.size, 8, 8]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export default function BackgroundModel({ className }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className || ""}`}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <WireframeKnot />
        <FloatingRing />
        <FloatingRing2 />
        <SmallOrbs />
      </Canvas>
    </div>
  );
}
