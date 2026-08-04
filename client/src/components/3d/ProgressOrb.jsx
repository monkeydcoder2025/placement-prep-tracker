import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const Orb = ({ percentage = 0, color = '#f94118' }) => {
  const meshRef = useRef();
  const materialRef = useRef();

  // Interpolate color from the base color to green based on completion
  const currentColor = useMemo(() => {
    const startColor = new THREE.Color(color);
    const endColor = new THREE.Color('#22c55e');
    const mixed = new THREE.Color().copy(startColor).lerp(endColor, percentage / 100);
    return mixed;
  }, [percentage, color]);

  const emissiveIntensity = 0.3 + (percentage / 100) * 0.7;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.25;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1.2, 0.35, 32, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          color={currentColor}
          emissive={currentColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Inner glow sphere */}
      <mesh scale={0.6}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={currentColor}
          emissive={currentColor}
          emissiveIntensity={0.15}
          transparent
          opacity={0.15}
          roughness={1}
        />
      </mesh>
    </Float>
  );
};

const ProgressOrb = ({ percentage = 0, color = '#f94118' }) => {
  return (
    <div style={{ width: '160px', height: '160px' }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={1.2} />
        <pointLight position={[-3, -2, 2]} intensity={0.5} color="#6366f1" />
        <Orb percentage={percentage} color={color} />
      </Canvas>
    </div>
  );
};

export default ProgressOrb;
