import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingOrbProps {
  position: [number, number, number];
  color: string;
  emissive: string;
  scale?: number;
  speed?: number;
}

export function FloatingOrb({ position, color, emissive, scale = 1, speed = 1 }: FloatingOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const floatOffset = Math.random() * Math.PI * 2;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + floatOffset) * 0.3;
      meshRef.current.rotation.x += 0.001 * speed;
      meshRef.current.rotation.y += 0.002 * speed;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1 * scale, 64, 64]} position={position}>
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
        wireframe
      />
    </Sphere>
  );
}
