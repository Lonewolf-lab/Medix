import { Link } from "react-router-dom";
import { motion } from "motion/react";
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
          <img src="/medix_logo.png" alt="Medix logo" className="w-10 h-10 object-contain" />
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
      <div className="lg:col-span-3 flex flex-col justify-center px-4 py-6 sm:px-14 sm:py-16">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile-only sleek brand banner */}
          <div className="lg:hidden bg-ink text-cream-light rounded-2xl p-4 mb-6 shadow-md border border-stone-line/20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/medix_logo.png" alt="Medix logo" className="w-8 h-8 object-contain" />
              <div>
                <span className="font-display text-lg tracking-tight text-cream-light block leading-none">MEDIX</span>
                <span className="font-mono-accent text-[9px] tracking-widest text-forest-bright">AI HEALTH SYSTEM</span>
              </div>
            </Link>
            <span className="font-mono-accent text-[9px] tracking-widest text-stone bg-cream-light/10 px-2.5 py-1 rounded-full border border-stone-line/30">
              SECURE
            </span>
          </div>

          {/* Form Card Container */}
          <div className="bg-cream-light/80 border border-stone-line/60 rounded-3xl p-6 sm:p-10 shadow-sm lg:bg-transparent lg:border-0 lg:p-0 lg:shadow-none relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <h1 className="font-display uppercase tracking-tight text-2xl sm:text-4xl md:text-5xl text-ink">
                {title}
              </h1>
              {subtitle && <p className="mt-2.5 sm:mt-3 text-ink-soft text-xs sm:text-sm leading-relaxed">{subtitle}</p>}
              <div className="mt-6 sm:mt-8">{children}</div>
              {footer && <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-ink-soft pt-4 border-t border-stone-line/40 lg:border-0 lg:pt-0">{footer}</div>}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthField({ label, number, ...props }) {
  return (
    <div>
      <label className="font-mono-accent text-[10px] sm:text-xs tracking-wider text-forest/80 font-medium block mb-1.5 sm:mb-2">
        {number} — {label}
      </label>
      <input
        className="w-full bg-transparent border-b border-stone-line py-2.5 sm:py-3.5 text-xs sm:text-base text-ink placeholder:text-stone-faded focus:outline-none focus:border-forest transition-colors"
        {...props}
      />
    </div>
  );
}

export function AuthSubmit({ children }) {
  return (
    <motion.button
      type="submit"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full pl-2 pr-6 py-3 bg-forest hover:bg-forest-bright text-cream-light font-mono-accent text-xs tracking-widest uppercase transition-all shadow-md font-semibold"
    >
      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-ink flex items-center justify-center text-[9px] shrink-0">●</span>
      {children}
    </motion.button>
  );
}
