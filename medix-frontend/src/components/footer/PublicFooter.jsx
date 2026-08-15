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
    <footer className="bg-ink text-cream-light px-5 sm:px-6 md:px-16 pt-8 sm:pt-12 md:pt-16 pb-8">
      {/* Integrated Final CTA Block */}
      <div className="pb-6 sm:pb-10 border-b border-ink-line">
        <span className="font-mono-accent text-[10px] sm:text-xs tracking-widest uppercase text-forest-bright font-semibold">
          START NOW
        </span>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 items-end mt-2 sm:mt-4">
          <div>
            <h2 className="font-display uppercase text-2xl sm:text-4xl md:text-6xl leading-[1.0] text-cream-light tracking-tight">
              Health clarity,
              <br />
              powered by AI<span className="text-forest-bright">.</span>
            </h2>
            <p className="max-w-md text-stone text-[11px] sm:text-xs md:text-sm leading-relaxed mt-2 sm:mt-4">
              One account. Your symptoms triaged, your records readable, your
              medications on schedule, your labs decoded. The next time your body
              asks a question, you'll have somewhere calm to take it.
            </p>
          </div>

          <div className="flex lg:justify-end mt-3 lg:mt-0">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-fit">
              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 rounded-full pl-1.5 pr-5 py-2 bg-forest hover:bg-forest-bright text-cream-light font-mono-accent text-[11px] sm:text-xs tracking-widest uppercase transition-colors shadow-md whitespace-nowrap"
              >
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-ink flex items-center justify-center text-[8px] sm:text-[9px] shrink-0">
                  ●
                </span>
                Create your account — free
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Giant wordmark */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="font-display uppercase leading-[0.85] tracking-tight text-[18vw] md:text-[15vw] text-cream-light/95 select-none my-4 sm:my-6 text-center sm:text-left"
        aria-hidden="true"
      >
        Medix
      </motion.p>

      <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 border-t border-ink-line pt-6 sm:pt-8">
        <div>
          <img
            src="/medix_logo.png"
            alt="Medix logo"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain mb-2.5"
            loading="lazy"
          />
          <p className="font-display uppercase text-base sm:text-lg tracking-tight">
            Your health, finally in one place.
          </p>
          <p className="text-stone text-[11px] sm:text-xs mt-2 max-w-xs leading-relaxed">
            AI symptom triage, organized records, medication tracking and lab
            insights — built to end the panic-Googling era.
          </p>
        </div>

        <div>
          <p className="font-mono-accent text-xs tracking-widest text-stone mb-2.5">SITEMAP</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
            {SITEMAP.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="text-xs text-cream-light/80 hover:text-forest-bright transition-colors inline-block py-0.5"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <p className="font-mono-accent text-xs tracking-widest text-stone mb-2.5">IMPORTANT</p>
          <div className="bg-cream-light/5 border border-ink-line/60 rounded-xl p-3 sm:p-0 sm:bg-transparent sm:border-0">
            <p className="text-stone text-[11px] sm:text-xs max-w-xs leading-relaxed">
              Medix offers AI-generated informational guidance — it is not a medical
              device and never a substitute for professional diagnosis or care. In an
              emergency, contact local emergency services immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-ink-line pt-5 text-center sm:text-left">
        <span className="font-mono-accent text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] text-stone">
          ©2026 MEDIX. ALL RIGHTS RESERVED. BUILT BY SIDDHANT SINHA
        </span>
        <a
          href="https://github.com/Lonewolf-lab/Medix"
          target="_blank"
          rel="noreferrer"
          className="font-mono-accent text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] text-stone hover:text-forest-bright transition-colors"
        >
          GITHUB ↗
        </a>
      </div>
    </footer>
  );
}
