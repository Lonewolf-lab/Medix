import { Link } from "react-router-dom";
import { motion } from "motion/react";
import Logo3D from "../../components/nav/Logo3D.jsx";
import { EASE } from "../../components/common/Reveal.jsx";

/**
 * Split-screen auth chrome: ink brand panel (left) + cream form panel (right).
 * Forms are UI-only for now — backend wiring happens after design approval.
 */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-5">
      {/* Brand panel */}
      <div className="relative hidden lg:flex lg:col-span-2 flex-col justify-between bg-ink text-cream-light p-12 overflow-hidden">
        <Link to="/" className="flex items-center gap-3 w-fit group">
          <Logo3D />
          <span className="font-display text-2xl tracking-tight text-cream-light group-hover:text-forest-bright transition-colors">
            MEDIX
          </span>
        </Link>

        <div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="font-display uppercase tracking-tight leading-[0.95] text-[3.4vw]"
          >
            Your health,
            <br />
            finally in
            <br />
            one place<span className="text-forest-bright">.</span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 max-w-xs text-stone text-sm leading-relaxed"
          >
            Triage, records, medications, chat and labs — behind one calm login.
          </motion.p>
        </div>

        <span className="font-mono-accent text-[10px] tracking-[0.3em] text-stone">
          NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE
        </span>
      </div>

      {/* Form panel */}
      <div className="lg:col-span-3 flex flex-col justify-center px-6 py-16 sm:px-14">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="mb-12 flex items-center gap-3 lg:hidden w-fit">
            <Logo3D />
            <span className="font-display text-2xl tracking-tight text-ink">MEDIX</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h1 className="font-display uppercase tracking-tight text-4xl md:text-5xl text-ink">
              {title}
            </h1>
            {subtitle && <p className="mt-3 text-ink-soft text-sm leading-relaxed">{subtitle}</p>}
            <div className="mt-10">{children}</div>
            {footer && <div className="mt-8 text-sm text-ink-soft">{footer}</div>}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function AuthField({ label, number, ...props }) {
  return (
    <div>
      <label className="font-mono-accent text-xs tracking-widest text-stone block mb-2">
        {number} — {label}
      </label>
      <input
        className="w-full bg-transparent border-b border-stone-line py-3.5 text-ink placeholder:text-stone-faded focus:outline-none focus:border-forest transition-colors"
        {...props}
      />
    </div>
  );
}

export function AuthSubmit({ children }) {
  return (
    <motion.button
      type="submit"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="w-fit inline-flex items-center gap-3 rounded-full pl-2 pr-8 py-2.5 bg-ink text-cream-light font-mono-accent text-xs tracking-widest uppercase"
    >
      <span className="w-9 h-9 rounded-full bg-forest flex items-center justify-center text-[10px]">●</span>
      {children}
    </motion.button>
  );
}
