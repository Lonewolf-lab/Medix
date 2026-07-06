import { lazy, Suspense, useRef } from "react";

// Code-split: three.js + R3F live in their own chunk, loaded on demand.
const LogoModel = lazy(() => import("./LogoModel.jsx"));

/**
 * Logo3D — the 3D brand mark (public/logo.glb, meshopt-compressed).
 * Used in the landing hero and the fullscreen-menu stage.
 *
 * `interactive` enables cursor tilt: the mark leans away from the pointer
 * (left/right/top/bottom and diagonals) and springs back on leave.
 * Pages render instantly with the PNG logo as fallback; the 3D model swaps
 * in as soon as its chunk + model finish loading.
 */
export default function Logo3D({ className = "w-10 h-10", spin = true, interactive = false }) {
  // Ref (not state) so pointer enter/leave never re-renders the canvas.
  const hoveredRef = useRef(false);

  return (
    <div
      className={`relative ${className}`}
      onPointerEnter={() => (hoveredRef.current = true)}
      onPointerLeave={() => (hoveredRef.current = false)}
    >
      <Suspense
        fallback={
          <img
            src="/medix_logo.png"
            alt=""
            className="w-full h-full object-contain"
            draggable="false"
          />
        }
      >
        <LogoModel spin={spin} interactive={interactive} hoveredRef={hoveredRef} />
      </Suspense>
    </div>
  );
}
