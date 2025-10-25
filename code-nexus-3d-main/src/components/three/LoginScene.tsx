import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { FloatingOrb } from './FloatingOrb';

export function LoginScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#06b6d4" intensity={0.5} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <FloatingOrb position={[-2, 0, 0]} color="#8b5cf6" emissive="#8b5cf6" scale={0.8} speed={0.8} />
      <FloatingOrb position={[2, 0, 0]} color="#3b82f6" emissive="#3b82f6" scale={1} speed={1.2} />
      <FloatingOrb position={[0, 2, -2]} color="#06b6d4" emissive="#06b6d4" scale={0.6} speed={1} />
      
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}
