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

  const dragStateRef = useRef({
    isDragging: false,
    spinVelocityX: 0,
    spinVelocityY: 0,
    dragRotationX: 0,
    dragRotationY: 0,
  });

  const previousPointerX = useRef(0);
  const previousPointerY = useRef(0);
  const lastPointerTime = useRef(0);

  const handlePointerDown = (e) => {
    // Only drag on primary click (button 0)
    if (e.button !== 0) return;
    
    dragStateRef.current.isDragging = true;
    dragStateRef.current.spinVelocityX = 0;
    dragStateRef.current.spinVelocityY = 0;
    
    previousPointerX.current = e.clientX;
    previousPointerY.current = e.clientY;
    lastPointerTime.current = performance.now();
    
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragStateRef.current.isDragging) return;
    
    const now = performance.now();
    const dt = now - lastPointerTime.current;
    const dx = e.clientX - previousPointerX.current;
    const dy = e.clientY - previousPointerY.current;

    // Accumulate rotation (factor 0.008 for comfortable sensitivity)
    dragStateRef.current.dragRotationY += dx * 0.008;
    dragStateRef.current.dragRotationX += dy * 0.008;

    if (dt > 0) {
      const vx = dx / dt;
      const vy = dy / dt;
      // Smooth the input velocity
      dragStateRef.current.spinVelocityX = vx * 0.75 + dragStateRef.current.spinVelocityX * 0.25;
      dragStateRef.current.spinVelocityY = vy * 0.75 + dragStateRef.current.spinVelocityY * 0.25;
    }

    previousPointerX.current = e.clientX;
    previousPointerY.current = e.clientY;
    lastPointerTime.current = now;
  };

  const handlePointerUp = (e) => {
    if (!dragStateRef.current.isDragging) return;
    
    dragStateRef.current.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    const now = performance.now();
    // If they hold still before releasing, clear the momentum
    if (now - lastPointerTime.current > 100) {
      dragStateRef.current.spinVelocityX = 0;
      dragStateRef.current.spinVelocityY = 0;
    }
  };

  return (
    <div
      className={`relative select-none touch-none ${className}`}
      onPointerEnter={() => (hoveredRef.current = true)}
      onPointerLeave={() => (hoveredRef.current = false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
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
        <LogoModel
          spin={spin}
          interactive={interactive}
          hoveredRef={hoveredRef}
          dragStateRef={dragStateRef}
        />
      </Suspense>
    </div>
  );
}
