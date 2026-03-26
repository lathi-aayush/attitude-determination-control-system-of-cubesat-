import { Canvas, useFrame } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import { memo, Suspense, useEffect, useMemo, useRef } from "react";
import type { Group } from "three";

type Rotation = [number, number, number];
const MODEL_OFFSET: [number, number, number] = [0.14, -0.6, 0];
const ORBIT_TARGET: [number, number, number] = [0.14, 0, 0];

function angleDelta(target: number, current: number) {
  const twoPi = Math.PI * 2;
  // shortest angular distance in (-pi, pi]
  let d = (target - current) % twoPi;
  if (d > Math.PI) d -= twoPi;
  if (d <= -Math.PI) d += twoPi;
  return d;
}

function CubesatModel({
  rotationTarget,
  paused,
}: {
  rotationTarget: Rotation;
  paused: boolean;
}) {
  const { scene } = useGLTF("/models/aarambhsat.gltf");
  const modelRef = useRef<Group | null>(null);

  // Smoothly animate the model rotation toward the latest target.
  const rotationCurrentRef = useRef<Rotation>([rotationTarget[0], rotationTarget[1], rotationTarget[2]]);
  const rotationTargetRef = useRef<Rotation>(rotationTarget);

  useEffect(() => {
    rotationTargetRef.current = rotationTarget;
  }, [rotationTarget]);

  const smoothingSpeed = useMemo(() => 2.5, []);
  const driftTimeRef = useRef(0);

  useFrame((_, delta) => {
    const model = modelRef.current;
    if (!model) return;
    driftTimeRef.current += delta;
    const driftTime = driftTimeRef.current;

    const current = rotationCurrentRef.current;
    const target = rotationTargetRef.current;

    // Exponential smoothing: higher speed => faster convergence.
    const t = paused ? 0 : 1 - Math.exp(-smoothingSpeed * delta);

    const next: Rotation = [current[0], current[1], current[2]];
    for (let i = 0; i < 3; i += 1) {
      const d = angleDelta(target[i], current[i]);
      next[i] = current[i] + d * t;
    }

    rotationCurrentRef.current = next;
    // Keep the model centered and only apply tiny rotational sway.
    const swayZ = Math.sin(driftTime * 0.4) * 0.025;

    model.position.set(MODEL_OFFSET[0], MODEL_OFFSET[1], MODEL_OFFSET[2]);
    model.rotation.set(next[0], next[1], next[2] + swayZ);
  });

  return (
    <Center>
      <primitive object={scene as Group} ref={modelRef} scale={12.0} />
    </Center>
  );
}

type SatelliteModelViewportProps = {
  rotation: Rotation;
  autoRotateEnabled: boolean;
  onReset: () => void;
};

function SatelliteModelViewportComponent({
  rotation,
  autoRotateEnabled,
  onReset,
}: SatelliteModelViewportProps) {

  return (
    <div
      className="relative h-full min-h-[12rem] w-full"
      role="img"
      aria-label="Interactive 3D AarambhSat model"
    >
        <Canvas
          camera={{ position: [0, 0, 6.2], fov: 30, near: 0.01, far: 300 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.0} />
        <hemisphereLight color="#f1f9ff" groundColor="#0b1424" intensity={0.45} />
        <directionalLight position={[6, 8, 4]} intensity={1.25} color="#f7fbff" />
        <directionalLight position={[-4, -2, -3]} intensity={0.62} color="#d9ecff" />
        <pointLight position={[0, 0.4, 1.2]} intensity={0.35} color="#ffffff" />
        <Suspense fallback={null}>
          <CubesatModel rotationTarget={rotation} paused={!autoRotateEnabled} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            target={ORBIT_TARGET}
            minDistance={0.1}
            maxDistance={100}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            autoRotate={autoRotateEnabled}
            autoRotateSpeed={0.75}
          />
        </Suspense>
      </Canvas>
      <div className="absolute left-2 top-2 z-20 flex gap-1.5 sm:left-3 sm:top-3">
        <button
          type="button"
          className="font-mono rounded-full border border-white/15 bg-black/50 px-2 py-1 text-[9px] uppercase tracking-widest text-on-surface-variant transition-colors hover:bg-white/10"
          onClick={onReset}
        >
          Reset
        </button>
      </div>
      <p className="font-label pointer-events-none absolute inset-x-0 bottom-1 text-center text-[8px] uppercase tracking-widest text-on-surface-variant/50">
        AarambhSat 3D model
      </p>
    </div>
  );
}

function areViewportPropsEqual(
  prev: SatelliteModelViewportProps,
  next: SatelliteModelViewportProps
) {
  return (
    prev.autoRotateEnabled === next.autoRotateEnabled &&
    prev.onReset === next.onReset &&
    prev.rotation[0] === next.rotation[0] &&
    prev.rotation[1] === next.rotation[1] &&
    prev.rotation[2] === next.rotation[2]
  );
}

export const SatelliteModelViewport = memo(
  SatelliteModelViewportComponent,
  areViewportPropsEqual
);

useGLTF.preload("/models/aarambhsat.gltf");
