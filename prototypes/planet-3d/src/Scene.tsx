import { RefObject, useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber/native';
import * as THREE from 'three';

const PLANET_PNG = require('../assets/planet.png') as unknown as string;

export type DragState = { yaw: number; pitch: number; dragging: boolean };

type PlanetProps = {
  texture: THREE.Texture;
  segments: number;
  drag: RefObject<DragState>;
};

function Planet({ texture, segments, drag }: PlanetProps) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    // Spin slowly on its own; the user's drag adds on top.
    if (!drag.current.dragging) drag.current.yaw += delta * 0.15;
    mesh.current.rotation.y = drag.current.yaw;
    mesh.current.rotation.x = drag.current.pitch;
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, segments, segments / 2]} />
      <meshStandardMaterial map={texture} roughness={0.9} metalness={0} />
    </mesh>
  );
}

export function ImagePlanet(props: Omit<PlanetProps, 'texture'>) {
  // R3F's native build resolves a require()'d asset id through expo-asset.
  const texture = useLoader(THREE.TextureLoader, PLANET_PNG);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return <Planet texture={texture} {...props} />;
}

export function ProceduralPlanet({ texture, ...props }: PlanetProps) {
  useEffect(() => () => texture.dispose(), [texture]);
  return <Planet texture={texture} {...props} />;
}

export function Stars({ count = 1500 }: { count?: number }) {
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(40 + Math.random() * 20);
      p.set([v.x, v.y, v.z], i * 3);
    }
    return p;
  }, [count]);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.15} sizeAttenuation />
    </points>
  );
}

// Counts rendered frames and reports the average FPS twice a second.
export function FpsMeter({ onSample }: { onSample: (fps: number) => void }) {
  const acc = useRef({ frames: 0, time: 0 });
  useFrame((_, delta) => {
    acc.current.frames++;
    acc.current.time += delta;
    if (acc.current.time >= 0.5) {
      onSample(acc.current.frames / acc.current.time);
      acc.current = { frames: 0, time: 0 };
    }
  });
  return null;
}
