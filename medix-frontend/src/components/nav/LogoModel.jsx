import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Center, Environment, Lightformer } from "@react-three/drei";

const GLB_URL = "/logo.glb"; // meshopt-compressed; drei decodes it out of the box
const MAX_TILT = 0.45; // ~26° — how far the mark leans away from the cursor

function Model({ spin, interactive, hoveredRef }) {
  const tiltGroup = useRef(); // outer: cursor tilt
  const spinGroup = useRef(); // inner: idle rotation
  const { scene } = useGLTF(GLB_URL);

  // Clone so multiple canvases can show the model at once, normalize scale,
  // and re-tune materials for a glossy finish (source export is near-black matte).
  const object = useMemo(() => {
    const clone = scene.clone(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3()).length() || 1;
    clone.scale.setScalar(2.2 / size);

    clone.traverse((o) => {
      if (o.isMesh && o.material) {
        o.material = o.material.clone();
        if (o.material.roughness !== undefined)
          o.material.roughness = Math.min(o.material.roughness, 0.22);
        if (o.material.metalness !== undefined)
          o.material.metalness = Math.max(o.material.metalness, 0.55);
        o.material.envMapIntensity = 1.8;
      }
    });

    return clone;
  }, [scene]);

  useFrame((state, delta) => {
    // Idle spin (inner group).
    if (spin && spinGroup.current) spinGroup.current.rotation.y += delta * 0.6;

    // Cursor tilt (outer group): the mark leans AWAY from wherever the
    // pointer is — right hover pushes the right side back (tilts left),
    // top hover pushes the top back (tilts down), diagonals combine both.
    // Eases back to neutral when the pointer leaves.
    if (interactive && tiltGroup.current) {
      const active = hoveredRef?.current;
      const targetX = active ? -state.pointer.y * MAX_TILT : 0;
      const targetY = active ? state.pointer.x * MAX_TILT : 0;
      const k = Math.min(1, delta * 6); // damped spring feel
      tiltGroup.current.rotation.x += (targetX - tiltGroup.current.rotation.x) * k;
      tiltGroup.current.rotation.y += (targetY - tiltGroup.current.rotation.y) * k;
    }
  });

  return (
    <group ref={tiltGroup}>
      <group ref={spinGroup}>
        <Center>
          <primitive object={object} />
        </Center>
      </group>
    </group>
  );
}

/** The actual WebGL canvas — lazy-loaded so three.js never blocks page load. */
export default function LogoModel({ spin = true, interactive = false, hoveredRef }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 2.6], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      // Don't remeasure the canvas on scroll — its size is fixed by the parent
      // box, and the scroll re-measure double-counts the offset, making the 3D
      // mark jump down/scale up on the first hover after scrolling back up.
      resize={{ scroll: false, offsetSize: true }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <directionalLight position={[-4, 2, -3]} intensity={1.2} color="#f5f3ec" />
      <directionalLight position={[0, -3, 2]} intensity={0.7} color="#a8d5b0" />
      <Model spin={spin} interactive={interactive} hoveredRef={hoveredRef} />
      {/* Procedural studio environment (rendered locally — no network fetch). */}
      <Environment resolution={256}>
        <Lightformer intensity={2.5} position={[2, 2, 3]} scale={[5, 5, 1]} />
        <Lightformer intensity={1.8} position={[-3, 1, -2]} scale={[4, 4, 1]} color="#f5f3ec" />
        <Lightformer intensity={1.2} position={[0, -2, 2]} scale={[5, 2, 1]} color="#dfe8df" />
        <Lightformer intensity={1.0} position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[6, 6, 1]} />
      </Environment>
    </Canvas>
  );
}

useGLTF.preload(GLB_URL);
