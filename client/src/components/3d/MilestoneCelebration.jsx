import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';

const Badge = ({ label }) => {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 1.5;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * -0.8;
    }
  });

  return (
    <Float speed={3} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={meshRef}>
        {/* Medal disc */}
        <mesh>
          <cylinderGeometry args={[1, 1, 0.15, 32]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Star emboss */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.4, 0.5, 0.05, 5]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.6}
            metalness={1}
            roughness={0.05}
          />
        </mesh>
      </group>
      
      {/* Outer ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.06, 16, 64]} />
        <meshStandardMaterial
          color="#f94118"
          emissive="#f94118"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <Text
        position={[0, -2, 0]}
        fontSize={0.3}
        color="#f3f4f6"
        anchorX="center"
        anchorY="top"
        font={undefined}
      >
        {label}
      </Text>
    </Float>
  );
};

const Particles = ({ count = 50 }) => {
  const meshRef = useRef();
  const positions = useRef(new Float32Array(count * 3));
  const velocities = useRef(new Float32Array(count * 3));

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions.current[i3] = (Math.random() - 0.5) * 0.2;
      positions.current[i3 + 1] = (Math.random() - 0.5) * 0.2;
      positions.current[i3 + 2] = (Math.random() - 0.5) * 0.2;

      velocities.current[i3] = (Math.random() - 0.5) * 0.08;
      velocities.current[i3 + 1] = Math.random() * 0.06 + 0.02;
      velocities.current[i3 + 2] = (Math.random() - 0.5) * 0.08;
    }
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] += velocities.current[i3];
      pos[i3 + 1] += velocities.current[i3 + 1];
      pos[i3 + 2] += velocities.current[i3 + 2];
      velocities.current[i3 + 1] -= 0.001; // gravity
    }

    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#f94118"
        size={0.05}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

const MilestoneCelebration = ({ label = 'Milestone!', onDismiss }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div
      onClick={() => { setVisible(false); onDismiss?.(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '320px', height: '320px' }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          style={{ background: 'transparent' }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[3, 3, 3]} intensity={1.5} color="#f59e0b" />
          <pointLight position={[-3, -2, 2]} intensity={0.5} color="#f94118" />
          <Badge label={label} />
          <Particles />
        </Canvas>
      </div>
    </div>
  );
};

export default MilestoneCelebration;
