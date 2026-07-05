import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { EASE } from "../common/Reveal.jsx";

const SITEMAP = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Sign in", to: "/login" },
  { label: "Get started", to: "/register" },
];

export default function PublicFooter() {
  return (
    <footer className="bg-ink text-cream-light px-6 md:px-16 pt-24 pb-10">
      {/* Giant wordmark */}
      <motion.p
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="font-display uppercase leading-[0.85] tracking-tight text-[22vw] md:text-[16vw] text-cream-light/95 select-none"
        aria-hidden="true"
      >
        Medix
      </motion.p>

      <div className="mt-16 grid gap-12 md:grid-cols-3 border-t border-ink-line pt-10">
        <div>
          <p className="font-display uppercase text-xl tracking-tight">
            Your health, finally in one place.
          </p>
          <p className="text-stone text-sm mt-3 max-w-xs leading-relaxed">
            AI symptom triage, organized records, medication tracking and lab
            insights — built to end the panic-Googling era.
          </p>
        </div>

        <div>
          <p className="font-mono-accent text-xs tracking-widest text-stone mb-4">SITEMAP</p>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
            {SITEMAP.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="text-sm text-cream-light/80 hover:text-forest-bright transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono-accent text-xs tracking-widest text-stone mb-4">IMPORTANT</p>
          <p className="text-stone text-sm max-w-xs leading-relaxed">
            Medix offers AI-generated informational guidance — it is not a medical
            device and never a substitute for professional diagnosis or care. In an
            emergency, contact local emergency services immediately.
          </p>
        </div>
      </div>

      <div className="mt-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-t border-ink-line pt-6">
        <span className="font-mono-accent text-[10px] tracking-[0.25em] text-stone">
          ©2026 MEDIX — BUILT BY SIDDHANT SINHA
        </span>
        <a
          href="https://github.com/Lonewolf-lab/Medix"
          target="_blank"
          rel="noreferrer"
          className="font-mono-accent text-[10px] tracking-[0.25em] text-stone hover:text-forest-bright transition-colors"
        >
          GITHUB ↗
        </a>
      </div>
    </footer>
  );
}
