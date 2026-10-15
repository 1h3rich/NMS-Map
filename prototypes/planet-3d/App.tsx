import { Suspense, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Canvas } from '@react-three/fiber/native';

import { Biome, makePlanetTexture } from './src/proceduralTexture';
import { DragState, FpsMeter, ImagePlanet, ProceduralPlanet, Stars } from './src/Scene';

type Source = 'image' | Biome;
const SOURCES: Source[] = ['image', 'lush', 'toxic', 'frozen'];
const DETAIL = [32, 64, 128];

export default function App() {
  const [source, setSource] = useState<Source>('image');
  const [segments, setSegments] = useState(64);
  const [seed, setSeed] = useState(1);
  const [fps, setFps] = useState(0);
  const drag = useRef<DragState>({ yaw: 0, pitch: 0, dragging: false });

  // Generated synchronously so the cost shows up as a number on screen.
  const procedural = useMemo(() => {
    if (source === 'image') return null;
    const start = performance.now();
    const texture = makePlanetTexture(seed, source);
    return { texture, ms: performance.now() - start };
  }, [source, seed]);

  const pan = useMemo(() => {
    let start = { yaw: 0, pitch: 0 };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        drag.current.dragging = true;
        start = { yaw: drag.current.yaw, pitch: drag.current.pitch };
      },
      onPanResponderMove: (_, g) => {
        drag.current.yaw = start.yaw + g.dx * 0.01;
        drag.current.pitch = Math.max(-1.2, Math.min(1.2, start.pitch + g.dy * 0.01));
      },
      onPanResponderRelease: () => (drag.current.dragging = false),
      onPanResponderTerminate: () => (drag.current.dragging = false),
    });
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Canvas style={StyleSheet.absoluteFill} camera={{ position: [0, 0, 3], fov: 50 }}>
        <color attach="background" args={['#05060a']} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 2, 4]} intensity={2.2} />
        <Stars />
        <Suspense fallback={null}>
          {procedural ? (
            <ProceduralPlanet key={`${source}-${seed}`} texture={procedural.texture} segments={segments} drag={drag} />
          ) : (
            <ImagePlanet segments={segments} drag={drag} />
          )}
        </Suspense>
        <FpsMeter onSample={setFps} />
      </Canvas>

      <View style={StyleSheet.absoluteFill} {...pan.panHandlers} />

      <View style={styles.hud} pointerEvents="none">
        <Text style={styles.fps}>{fps.toFixed(0)} FPS</Text>
        <Text style={styles.info}>
          {segments}×{segments / 2} sphere · {source === 'image' ? 'PNG texture 1024×512' : `procedural 256×128 in ${procedural?.ms.toFixed(0)} ms`}
        </Text>
      </View>

      <View style={styles.controls}>
        <Row>
          {SOURCES.map((s) => (
            <Chip key={s} label={s} active={s === source} onPress={() => setSource(s)} />
          ))}
        </Row>
        <Row>
          {DETAIL.map((d) => (
            <Chip key={d} label={`${d} seg`} active={d === segments} onPress={() => setSegments(d)} />
          ))}
          {source !== 'image' && <Chip label="new seed" onPress={() => setSeed((n) => n + 1)} />}
        </Row>
      </View>
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05060a' },
  hud: { position: 'absolute', top: 56, left: 16, right: 16 },
  fps: { color: '#7CFFB2', fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'] },
  info: { color: '#c8d0e0', fontSize: 13, marginTop: 4 },
  controls: { position: 'absolute', bottom: 40, left: 16, right: 16, gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: '#1b2030' },
  chipActive: { backgroundColor: '#e8ecf5' },
  chipText: { color: '#e8ecf5', fontSize: 14 },
  chipTextActive: { color: '#05060a', fontWeight: '600' },
});
