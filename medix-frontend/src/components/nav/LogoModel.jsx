import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Center, Environment, Lightformer } from "@react-three/drei";

const GLB_URL = "/logo.glb"; // meshopt-compressed; drei decodes it out of the box
const MAX_TILT = 0.45; // ~26° — how far the mark leans away from the cursor

function Model({ spin, interactive, hoveredRef, dragStateRef }) {
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
    const ds = dragStateRef.current;

    if (ds.isDragging) {
      if (spinGroup.current) {
        spinGroup.current.rotation.y = ds.dragRotationY;
        spinGroup.current.rotation.x = ds.dragRotationX;
      }
    } else {
      const speedSq = ds.spinVelocityX * ds.spinVelocityX + ds.spinVelocityY * ds.spinVelocityY;
      
      if (speedSq > 0.0001) {
        if (spinGroup.current) {
          // Spin with physics speed (flick speed scaled by delta)
          // 20 is an interactive scaling factor for millisecond velocity in R3F
          spinGroup.current.rotation.y += ds.spinVelocityX * delta * 20;
          spinGroup.current.rotation.x += ds.spinVelocityY * delta * 20;

          // Decelerate over time
          const decay = Math.exp(-delta * 2.8);
          ds.spinVelocityX *= decay;
          ds.spinVelocityY *= decay;

          // Save current rotation so if the user clicks again, dragging resumes smoothly
          ds.dragRotationY = spinGroup.current.rotation.y;
          ds.dragRotationX = spinGroup.current.rotation.x;

          // Decay X rotation back to 0 (neutral orientation)
          spinGroup.current.rotation.x += (0 - spinGroup.current.rotation.x) * Math.min(1, delta * 3.2);
        }
      } else {
        ds.spinVelocityX = 0;
        ds.spinVelocityY = 0;

        if (spinGroup.current) {
          // Resume standard idle spin on Y axis
          if (spin) {
            spinGroup.current.rotation.y += delta * 0.6;
            ds.dragRotationY = spinGroup.current.rotation.y;
          }
          // Decay X rotation back to 0
          spinGroup.current.rotation.x += (0 - spinGroup.current.rotation.x) * Math.min(1, delta * 3.2);
          ds.dragRotationX = spinGroup.current.rotation.x;
        }
      }
    }

    // Cursor tilt (outer group): leans away from the cursor
    // Disabled while dragging to avoid physics collision
    if (interactive && tiltGroup.current) {
      const active = hoveredRef?.current && !ds.isDragging;
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
export default function LogoModel({ spin = true, interactive = false, hoveredRef, dragStateRef }) {
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
      <directionalLight position={[0, -3, 2]} intensity={0.7} color="#80d8ff" />
      <Model
        spin={spin}
        interactive={interactive}
        hoveredRef={hoveredRef}
        dragStateRef={dragStateRef}
      />
      {/* Procedural studio environment (rendered locally — no network fetch). */}
      <Environment resolution={256}>
        <Lightformer intensity={2.5} position={[2, 2, 3]} scale={[5, 5, 1]} />
        <Lightformer intensity={1.8} position={[-3, 1, -2]} scale={[4, 4, 1]} color="#f5f3ec" />
        <Lightformer intensity={1.2} position={[0, -2, 2]} scale={[5, 2, 1]} color="#e0f7fa" />
        <Lightformer intensity={1.0} position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[6, 6, 1]} />
      </Environment>
    </Canvas>
  );
}

useGLTF.preload(GLB_URL);
