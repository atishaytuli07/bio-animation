import { Canvas, useFrame, useThree } from "@react-three/fiber";

import HelixGL from "./HelixGL";
import { sceneState } from "./state";

/** Camera follows the mutable scene state — no React state in the frame loop. */
function CameraRig() {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.set(sceneState.camX, sceneState.camY, sceneState.camZ);
    camera.lookAt(0, sceneState.lookY, 0);
  });
  return null;
}

/**
 * Flat-illustration rendering, after the client's mockup: toon-shaded
 * ribbons under one directional light. No Environment, no depth-of-field,
 * no postprocessing — that's what makes the reference feel light, and
 * cutting them here cuts the real bundle too.
 */
export default function Scene({
  animate = true,
  onReady,
}: {
  animate?: boolean;
  /** Fires once the GL context exists — the cue to cross-fade off the placeholder. */
  onReady?: () => void;
}) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 50, position: [0, 0, 14], near: 0.1, far: 200 }}
      onCreated={({ gl }) => {
        gl.setClearAlpha(0);
        requestAnimationFrame(() => onReady?.());
      }}
    >
      <ambientLight intensity={1.05} />
      <directionalLight position={[4, 7, 9]} intensity={0.9} />
      <hemisphereLight args={["#ffffff", "#f3c9bd", 0.35]} />

      <CameraRig />
      <HelixGL animate={animate} />
    </Canvas>
  );
}
