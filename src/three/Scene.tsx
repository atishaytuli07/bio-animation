import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { DepthOfField, EffectComposer } from "@react-three/postprocessing";

import HelixGL from "./HelixGL";
import { PALETTE, sceneState } from "./state";

/** Camera follows the mutable scene state — no React state in the frame loop. */
function CameraRig() {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.set(sceneState.camX, sceneState.camY, sceneState.camZ);
    camera.lookAt(0, sceneState.lookY, 0);
  });
  return null;
}

type DofEffect = React.ComponentRef<typeof DepthOfField>;

function Dof() {
  const ref = useRef<DofEffect>(null);
  useFrame(() => {
    const focus = ref.current?.circleOfConfusionMaterial?.uniforms["focusDistance"];
    if (focus) focus.value = sceneState.focusDistance;
  });
  return <DepthOfField ref={ref} focusDistance={0.02} focalLength={0.05} bokehScale={3} />;
}

export default function Scene({
  animate = true,
  onReady,
}: {
  animate?: boolean;
  /** Fires once the GL context exists — the cue to cross-fade off the placeholder. */
  onReady?: () => void;
}) {
  // Depth of field is the single most expensive pass here — desktop only.
  const postEnabled = useMemo(() => typeof window !== "undefined" && window.innerWidth >= 1024, []);

  return (
    <Canvas
      aria-hidden="true"
      // 1.5 rather than 2+: this is a soft, out-of-focus subject, so the extra
      // pixels of a retina buffer cost ~1.8× fill rate and buy almost nothing.
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 50, position: [0, 0, 14], near: 0.1, far: 200 }}
      onCreated={({ gl }) => {
        gl.setClearAlpha(0);
        // One frame's grace so the first render lands before we fade the
        // placeholder out — otherwise the cross-fade reveals an empty canvas.
        requestAnimationFrame(() => onReady?.());
      }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 8, 6]} intensity={1.15} />
      <pointLight position={[-6, -3, 4]} intensity={0.5} color={PALETTE.blush} />

      <Suspense fallback={null}>
        <Environment resolution={64}>
          <Lightformer intensity={1.5} position={[0, 6, -6]} scale={[12, 12, 1]} color="#FFFFFF" />
          <Lightformer
            intensity={0.8}
            position={[-6, 1, 3]}
            scale={[9, 9, 1]}
            color={PALETTE.blush}
          />
          <Lightformer intensity={0.6} position={[6, -2, 3]} scale={[9, 9, 1]} color="#FFFFFF" />
        </Environment>
      </Suspense>

      <CameraRig />
      <HelixGL animate={animate} />

      {postEnabled ? (
        <EffectComposer>
          <Dof />
        </EffectComposer>
      ) : null}
    </Canvas>
  );
}
