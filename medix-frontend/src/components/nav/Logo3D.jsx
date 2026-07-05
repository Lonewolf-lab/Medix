/**
 * Logo3D — the brand mark slot, used in the top navbar, the fullscreen
 * menu's reserved logo area, and the auth pages.
 *
 * ⚠ SWAP POINT (one file, updates everywhere):
 *   The developer will supply a 3D logo as a `.glb` file.
 *   When it arrives: `npm i three @react-three/fiber @react-three/drei`,
 *   then replace the placeholder below with a small <Canvas> mounting the
 *   model (drei's <useGLTF> + gentle idle rotation). Until then this
 *   renders a temporary pulse glyph.
 *
 * `className` controls size; `bg` controls the disc color.
 */
export default function Logo3D({ className = "w-10 h-10", bg = "bg-ink" }) {
  return (
    <div
      className={`relative rounded-full ${bg} flex items-center justify-center overflow-hidden ${className}`}
    >
      <svg viewBox="0 0 24 24" className="w-[58%] h-[58%]" fill="none">
        <path
          d="M3 13h4l2-5 4 9 2.5-6 1 2H21"
          stroke="#2f5233"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
