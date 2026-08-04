import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const Building = ({ position, height, color, label, index, onClick }) => {
  const meshRef = useRef();
  const targetY = height / 2;

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle idle bob
      meshRef.current.position.y = targetY + Math.sin(state.clock.elapsedTime * 0.5 + index * 0.5) * 0.03;
    }
  });

  return (
    <group position={position} onClick={onClick} style={{ cursor: 'pointer' }}>
      <mesh ref={meshRef} position={[0, targetY, 0]}>
        <boxGeometry args={[0.6, height, 0.6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      {/* Step label below */}
      <Text
        position={[0, -0.3, 0.5]}
        fontSize={0.18}
        color="#9ca3af"
        anchorX="center"
        anchorY="top"
      >
        {label}
      </Text>
    </group>
  );
};

const DSASkyline = ({ steps = [], onStepClick }) => {
  const buildings = useMemo(() => {
    if (!steps.length) return [];
    
    const totalWidth = steps.length * 1.0;
    const startX = -totalWidth / 2 + 0.5;

    return steps.map((step, i) => {
      const percentage = step.total > 0 ? step.completed / step.total : 0;
      const height = 0.2 + percentage * 3; // Min height 0.2, max ~3.2
      
      // Color from orange (0%) → green (100%)
      const startColor = new THREE.Color('#f94118');
      const endColor = new THREE.Color('#22c55e');
      const color = new THREE.Color().copy(startColor).lerp(endColor, percentage);

      return {
        position: [startX + i * 1.0, 0, 0],
        height,
        color: `#${color.getHexString()}`,
        label: `S${step.step}`,
        step: step.step,
        index: i,
      };
    });
  }, [steps]);

  if (!buildings.length) return null;

  return (
    <div style={{ width: '100%', height: '250px', borderRadius: '12px', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 3, 8], fov: 40 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 8, 5]} intensity={1} />
        <pointLight position={[-5, 3, 3]} intensity={0.4} color="#3b82f6" />
        
        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[30, 10]} />
          <meshStandardMaterial color="#1c1c1c" transparent opacity={0.5} />
        </mesh>

        {buildings.map((b, i) => (
          <Building
            key={i}
            position={b.position}
            height={b.height}
            color={b.color}
            label={b.label}
            index={b.index}
            onClick={() => onStepClick?.(b.step)}
          />
        ))}

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
};

export default DSASkyline;
