// Tiny tracked mono label that opens every section (the reference's "ABOUT US").
export default function SectionLabel({ children, light = false, className = "" }) {
  return (
    <span
      className={`font-mono-accent text-xs tracking-[0.3em] uppercase ${
        light ? "text-cream-light/60" : "text-forest"
      } ${className}`}
    >
      {children}
    </span>
  );
}
