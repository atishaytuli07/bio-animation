import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instance, Instances } from "@react-three/drei";
import * as THREE from "three";

import { PALETTE, sceneState } from "./state";

const PAIRS = 56;
const RADIUS = 2.6;
const SPAN = 40;
/** The base pair carrying c.1905+1G>A. Everything in the story points here. */
const VARIANT_PAIR = 30;
/** Neighbours that stay saturated so the variant reads as *in* a gene, not alone. */
const VARIANT_REGION = [28, 29, 30, 31, 32];
/**
 * Group y-rotation that puts the variant pair on the camera side (+z).
 * Derivation: the pair sits at helix angle a = (30/56)·2π·4.5 ≈ 15.147 rad;
 * a node faces the camera when a − rotY ≡ π/2, so rotY ≈ 1.01 (mod 2π).
 */
const VARIANT_FACING_ANGLE = 1.01;

// Red/white brand core with blush between — the mockup's helix, in 3D.
const BASE_COLORS = [PALETTE.signal, PALETTE.coral, PALETTE.pale, PALETTE.signal];

/** 3-step gradient → toon shading: flat fills with one soft shade break,
 *  which is exactly the mockup's illustration look. */
function useToonGradient() {
  return useMemo(() => {
    const tex = new THREE.DataTexture(new Uint8Array([120, 200, 255]), 3, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

type NodeData = {
  position: THREE.Vector3;
  pairIndex: number;
  strand: 0 | 1;
  baseColor: THREE.Color;
  desatColor: THREE.Color;
};

type RungData = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  length: number;
};

/** Pull saturation out but lift lightness, so desaturated bases stay visible on white. */
function desaturate(hex: string) {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  // Cap below the cream canvas (~0.95 sRGB) or desaturated bases vanish.
  return new THREE.Color().setHSL(hsl.h, hsl.s * 0.22, Math.min(0.76, hsl.l + 0.1));
}

function useHelixData() {
  return useMemo(() => {
    const nodes: NodeData[] = [];
    const rungs: RungData[] = [];
    const strandA: THREE.Vector3[] = [];
    const strandB: THREE.Vector3[] = [];
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < PAIRS; i++) {
      const t = i / PAIRS;
      const angle = t * Math.PI * 2 * 4.5;
      const y = (t - 0.5) * SPAN;

      const a = new THREE.Vector3(Math.cos(angle) * RADIUS, y, Math.sin(angle) * RADIUS);
      const b = new THREE.Vector3(
        Math.cos(angle + Math.PI) * RADIUS,
        y,
        Math.sin(angle + Math.PI) * RADIUS,
      );
      strandA.push(a);
      strandB.push(b);

      const hexA = BASE_COLORS[i % BASE_COLORS.length]!;
      const hexB = BASE_COLORS[(i + 2) % BASE_COLORS.length]!;

      nodes.push({
        position: a,
        pairIndex: i,
        strand: 0,
        baseColor: new THREE.Color(hexA),
        desatColor: desaturate(hexA),
      });
      nodes.push({
        position: b,
        pairIndex: i,
        strand: 1,
        baseColor: new THREE.Color(hexB),
        desatColor: desaturate(hexB),
      });

      const mid = a.clone().add(b).multiplyScalar(0.5);
      const dir = b.clone().sub(a).normalize();
      rungs.push({
        position: mid,
        quaternion: new THREE.Quaternion().setFromUnitVectors(up, dir),
        length: a.distanceTo(b),
      });
    }

    return {
      nodes,
      rungs,
      curveA: new THREE.CatmullRomCurve3(strandA),
      curveB: new THREE.CatmullRomCurve3(strandB),
    };
  }, []);
}

/** Motes drifting upward around the helix — keeps the frame alive when scroll is still. */
function Particles({ animate }: { animate: boolean }) {
  const refs = useRef<(THREE.Object3D | null)[]>([]);
  const tick = useRef(0);

  const seeds = useMemo(
    () =>
      Array.from({ length: 44 }, (_, i) => ({
        angle: (i / 44) * Math.PI * 2 + (i % 7) * 0.31,
        radius: 3.4 + ((i * 13) % 9) * 0.5,
        y: ((i * 17) % 42) - 21,
        speed: 0.012 + ((i * 7) % 5) * 0.007,
      })),
    [],
  );

  useFrame(() => {
    if (!animate) return;
    tick.current += 1;
    if (tick.current % 2 !== 0) return; // half-rate: invisible at this scale, halves the cost

    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]!;
      s.y += s.speed * 2;
      if (s.y > 21) s.y = -21;
      refs.current[i]?.position.set(
        Math.cos(s.angle) * s.radius,
        s.y,
        Math.sin(s.angle) * s.radius,
      );
    }
  });

  return (
    <Instances limit={seeds.length} range={seeds.length} frustumCulled={false}>
      {/* Motes are a few pixels across — 6×4 is beyond enough. */}
      <sphereGeometry args={[0.06, 6, 4]} />
      <meshBasicMaterial color={PALETTE.violet} transparent opacity={0.45} />
      {seeds.map((s, i) => (
        <Instance
          key={i}
          ref={(el: THREE.Object3D | null) => {
            refs.current[i] = el;
          }}
          position={[Math.cos(s.angle) * s.radius, s.y, Math.sin(s.angle) * s.radius]}
        />
      ))}
    </Instances>
  );
}

export default function HelixGL({ animate = true }: { animate?: boolean }) {
  const { nodes, rungs, curveA, curveB } = useHelixData();
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Object3D | null)[]>([]);

  const toonGrad = useToonGradient();
  const scratch = useMemo(() => new THREE.Color(), []);
  const signal = useMemo(() => new THREE.Color(PALETTE.signal), []);
  // Colours chase their target by lerp, so they keep changing for a few frames
  // after the scroll stops. Track the last-seen targets and let the loop idle
  // out once they've converged — scrolled-away or parked, it costs nothing.
  const lastTargets = useRef({ desat: -1, variant: -1, variantScale: -1 });
  const settleFrames = useRef(0);
  // Interactive spin: horizontal pointer motion throws the helix, inertia
  // carries it, and the effect stands down during the Discovery dive so the
  // variant-facing choreography still wins.
  const spinVel = useRef(0);
  const prevPX = useRef(0);

  useFrame((state, delta) => {
    const g = group.current;
    if (g) {
      // Ambient spin fades out as the dive begins…
      if (animate) g.rotation.y += delta * 0.075 * (1 - sceneState.dive);
      const dx = state.pointer.x - prevPX.current;
      prevPX.current = state.pointer.x;
      if (Math.abs(dx) < 0.4) spinVel.current += dx * 0.05 * (1 - sceneState.dive);
      spinVel.current *= 0.93;
      g.rotation.y += spinVel.current;
      // …and the strand eases toward the angle that presents the variant pair
      // to the camera, so the red base is guaranteed to be on the near side
      // when the callout fires — never hidden behind the strand.
      if (sceneState.dive > 0.01) {
        const d = VARIANT_FACING_ANGLE - g.rotation.y;
        g.rotation.y +=
          Math.atan2(Math.sin(d), Math.cos(d)) * Math.min(0.09, sceneState.dive * 0.09);
      }
      // Pointer parallax, eased toward the target so the helix has weight.
      const targetX = state.pointer.y * 0.22;
      const targetZ = 0.42 + state.pointer.x * 0.06;
      g.rotation.x += (targetX - g.rotation.x) * 0.05;
      g.rotation.z += (targetZ - g.rotation.z) * 0.05;
      // Unwind: the helix stretches vertically as the camera dives into it —
      // gently, so the variant pair stays near its resting height.
      const stretch = 1 + sceneState.dive * 0.25;
      g.scale.set(1, stretch, 1);
    }

    const prev = lastTargets.current;
    if (
      prev.desat !== sceneState.desat ||
      prev.variant !== sceneState.variant ||
      prev.variantScale !== sceneState.variantScale
    ) {
      prev.desat = sceneState.desat;
      prev.variant = sceneState.variant;
      prev.variantScale = sceneState.variantScale;
      settleFrames.current = 0;
    } else if (settleFrames.current > 40) {
      // Targets unchanged long enough that every lerp has converged.
      return;
    }
    settleFrames.current++;

    for (let i = 0; i < nodes.length; i++) {
      const obj = nodeRefs.current[i] as (THREE.Object3D & { color?: THREE.Color }) | null;
      if (!obj?.color) continue;
      const n = nodes[i]!;
      const isVariant = n.pairIndex === VARIANT_PAIR && n.strand === 0;

      scratch.copy(n.baseColor);
      if (!VARIANT_REGION.includes(n.pairIndex) && sceneState.desat > 0) {
        scratch.lerp(n.desatColor, sceneState.desat);
      }
      if (isVariant && sceneState.variant > 0) {
        scratch.lerp(signal, sceneState.variant);
      }
      obj.color.lerp(scratch, 0.25);
      obj.scale.setScalar(isVariant ? 1 + sceneState.variantScale : 1);
    }
  });

  return (
    <group ref={group} rotation={[0, 0, 0.42]}>
      {/* 16×12 segments, not 20×20: at this radius the silhouette is identical
          but the 112 instances cost 352 triangles each instead of 760. */}
      <Instances limit={nodes.length} range={nodes.length} frustumCulled={false}>
        {/* small caps where rungs meet strands — bumps, not marbles */}
        <sphereGeometry args={[0.21, 14, 10]} />
        <meshToonMaterial gradientMap={toonGrad} />
        {nodes.map((n, i) => (
          <Instance
            key={i}
            ref={(el: THREE.Object3D | null) => {
              nodeRefs.current[i] = el;
            }}
            position={[n.position.x, n.position.y, n.position.z]}
            color={n.baseColor.getStyle()}
          />
        ))}
      </Instances>

      <Instances limit={rungs.length} range={rungs.length} frustumCulled={false}>
        <cylinderGeometry args={[0.055, 0.055, 1, 8]} />
        {/* thin WHITE rungs between RED strands — the mockup's construction */}
        <meshToonMaterial color={PALETTE.pale} gradientMap={toonGrad} />
        {rungs.map((r, i) => (
          <Instance
            key={i}
            position={[r.position.x, r.position.y, r.position.z]}
            quaternion={r.quaternion}
            scale={[1, r.length, 1]}
          />
        ))}
      </Instances>

      {/* The strands are 0.13 units thick and never fill much of the frame —
          160×6 reads as smooth as the original 380×10 for a quarter the cost. */}
      {[curveA, curveB].map((curve, i) => (
        <mesh key={i} frustumCulled={false}>
          <tubeGeometry args={[curve, 160, 0.16, 8, false]} />
          <meshToonMaterial color={PALETTE.strand} gradientMap={toonGrad} />
        </mesh>
      ))}

      <Particles animate={animate} />
    </group>
  );
}
