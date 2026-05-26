"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Text } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

/**
 * Premium 3D Score Orb — a glowing, distorted sphere that represents the health score.
 * Color shifts based on score. Floats and pulses organically.
 */

function ScoreSphere({ score, grade }: { score: number; grade: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const color = useMemo(() => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#eab308";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  }, [score]);

  const emissiveIntensity = useMemo(() => score / 100, [score]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity * 0.3}
          roughness={0.2}
          metalness={0.8}
          distort={0.2}
          speed={2}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Score text floating in front */}
      <Text
        position={[0, 0.2, 1.8]}
        fontSize={0.8}
        color="white"
        font="/fonts/inter-bold.woff"
        anchorX="center"
        anchorY="middle"
      >
        {score.toString()}
      </Text>
      <Text
        position={[0, -0.5, 1.8]}
        fontSize={0.25}
        color="rgba(255,255,255,0.6)"
        anchorX="center"
        anchorY="middle"
      >
        {`Grade: ${grade}`}
      </Text>
    </Float>
  );
}

function GlowRing({ score }: { score: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : score >= 40 ? "#f97316" : "#ef4444";

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    ringRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[2, 0.02, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </mesh>
  );
}

export default function ScoreOrb({ score, grade }: { score: number; grade: string }) {
  return (
    <div className="h-[280px] w-[280px]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.3} color="#8b5cf6" />
        <ScoreSphere score={score} grade={grade} />
        <GlowRing score={score} />
      </Canvas>
    </div>
  );
}
