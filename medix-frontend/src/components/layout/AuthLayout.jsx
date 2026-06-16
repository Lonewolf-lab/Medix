import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Sparkles, Activity } from 'lucide-react'
import Logo from '@/components/common/Logo'
import { ROUTES } from '@/constants/routes'

const HIGHLIGHTS = [
  { icon: Activity, text: 'AI symptom triage — a calm first opinion, not a panic-Google spiral' },
  { icon: Sparkles, text: 'Lab reports decoded into plain-English biomarker insights' },
  { icon: ShieldCheck, text: 'Your records, medications & history — organized and private' },
]

/** Split-screen auth layout: brand panel + form. */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-navy-600 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(110,231,183,0.4), transparent 40%), radial-gradient(circle at 80% 60%, rgba(123,163,207,0.4), transparent 45%)',
          }}
        />
        <Link to={ROUTES.landing} className="relative">
          <Logo textClassName="text-white" />
        </Link>

        <div className="relative">
          <motion.h2
            className="max-w-md font-display text-3xl font-bold leading-tight text-white"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your health, finally in one calm place.
          </motion.h2>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((h, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-3 text-navy-50"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-mint-300">
                  <h.icon className="h-4 w-4" />
                </span>
                <span className="text-sm leading-relaxed text-navy-100">{h.text}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-navy-200">
          Medix is not a substitute for professional medical advice.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
