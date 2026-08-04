import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const Cube = ({ position, height, intensity, index }) => {
  const meshRef = useRef();
  const color = useMemo(() => {
    if (intensity === 0) return '#202020';
    const base = new THREE.Color('#f94118');
    const dark = new THREE.Color('#3a1008');
    return `#${new THREE.Color().copy(dark).lerp(base, intensity).getHexString()}`;
  }, [intensity]);

  const emissiveIntensity = intensity * 0.3;

  useFrame((state) => {
    if (meshRef.current && intensity > 0) {
      meshRef.current.position.y = height / 2 + Math.sin(state.clock.elapsedTime * 0.3 + index * 0.1) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[position[0], height / 2, position[1]]}>
      <boxGeometry args={[0.14, height, 0.14]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        roughness={0.4}
        metalness={0.5}
      />
    </mesh>
  );
};

const ContributionGrid3D = ({ history = [] }) => {
  const cubes = useMemo(() => {
    // Build date counts
    const dateCounts = {};
    history.forEach(({ completed_at }) => {
      if (!completed_at) return;
      const date = new Date(completed_at).toISOString().split('T')[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    // Generate last 12 weeks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 83);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const days = [];
    const current = new Date(startDate);
    let maxCount = 0;

    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0];
      const count = dateCounts[dateStr] || 0;
      if (count > maxCount) maxCount = count;
      days.push({ date: dateStr, count });
      current.setDate(current.getDate() + 1);
    }

    // Layout: 7 rows (days of week), N columns (weeks)
    const result = [];
    const spacing = 0.18;
    
    days.forEach((day, i) => {
      const col = Math.floor(i / 7);
      const row = i % 7;
      const intensity = maxCount > 0 ? day.count / maxCount : 0;
      const height = 0.04 + intensity * 0.5;
      
      result.push({
        position: [(col - days.length / 14) * spacing, row * -spacing],
        height,
        intensity,
        index: i,
      });
    });

    return result;
  }, [history]);

  return (
    <div style={{ width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 2, 3], fov: 35 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 5, 3]} intensity={0.8} />
        <pointLight position={[-2, 3, 2]} intensity={0.3} color="#f94118" />

        {cubes.map((cube, i) => (
          <Cube
            key={i}
            position={cube.position}
            height={cube.height}
            intensity={cube.intensity}
            index={cube.index}
          />
        ))}

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
};

export default ContributionGrid3D;
