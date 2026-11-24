import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
import {
  AnimationMixer,
  Box3,
  Vector3,
  type AnimationAction,
  type AnimationClip,
  type Group,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MauricioMascot } from '../../../components';
import { GUIDE_MODEL, GUIDE_POSE_CLIPS, GUIDE_POSE_MOODS, type GuidePose } from './guideConfig';

type Props = { pose: GuidePose; size: number };

// Tamanho que o modelo ocupa na cena depois de normalizado.
const FIT_SIZE = 1.8;
const FADE_SECONDS = 0.35;
// Balanço leve para o modelo não parecer congelado entre uma pose e outra.
const SWAY_SPEED = 0.8;
const SWAY_ANGLE = 0.2;

function pickClip(clips: AnimationClip[], pose: GuidePose): AnimationClip | undefined {
  const byName = clips.find((clip) => clip.name === GUIDE_POSE_CLIPS[pose]);
  if (byName) return byName;
  return clips[pose === 'centered' ? 0 : 1] ?? clips[0];
}

function Model({ source, pose }: { source: number; pose: GuidePose }) {
  // O r3f nativo resolve o require() do .glb via expo-asset.
  const gltf = useLoader(GLTFLoader, source as unknown as string);
  const scene = gltf.scene;
  const mixer = useMemo(() => new AnimationMixer(scene), [scene]);
  const current = useRef<AnimationAction | null>(null);
  const sway = useRef<Group>(null);

  // Centraliza e escala o modelo, seja qual for a unidade usada no Blender.
  const fit = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const scale = FIT_SIZE / (Math.max(size.x, size.y, size.z) || 1);
    return { scale, position: center.multiplyScalar(-scale) };
  }, [scene]);

  useEffect(() => {
    const clip = pickClip(gltf.animations, pose);
    if (!clip) return;
    const next = mixer.clipAction(clip);
    if (current.current === next) return;
    next.reset().fadeIn(FADE_SECONDS).play();
    current.current?.fadeOut(FADE_SECONDS);
    current.current = next;
  }, [gltf, mixer, pose]);

  useEffect(() => () => void mixer.stopAllAction(), [mixer]);

  useFrame((state, delta) => {
    mixer.update(delta);
    if (sway.current) {
      sway.current.rotation.y = Math.sin(state.clock.elapsedTime * SWAY_SPEED) * SWAY_ANGLE;
    }
  });

  return (
    <group ref={sway}>
      <group scale={fit.scale} position={fit.position}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

/** Se o .glb falhar ao carregar, cai para o Maurício 2D em vez de quebrar a câmera. */
class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Fallback2D({ pose, size }: Props) {
  return (
    <View style={[styles.box, { width: size, height: size }]}>
      <MauricioMascot size={size * 0.8} mood={GUIDE_POSE_MOODS[pose]} />
    </View>
  );
}

export function GuideModel({ pose, size }: Props) {
  const fallback = <Fallback2D pose={pose} size={size} />;
  if (GUIDE_MODEL === null || Platform.OS === 'web') return fallback;

  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      <ModelBoundary fallback={fallback}>
        <Canvas
          style={styles.canvas}
          camera={{ position: [0, 0.2, 4], fov: 35 }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <ambientLight intensity={1.1} />
          <directionalLight position={[2, 3, 4]} intensity={1.6} />
          <Suspense fallback={null}>
            <Model source={GUIDE_MODEL} pose={pose} />
          </Suspense>
        </Canvas>
      </ModelBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  canvas: { flex: 1, backgroundColor: 'transparent' },
});
