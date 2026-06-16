import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Logo from '@/components/common/Logo'
import Button from '@/components/common/Button'
import { ROUTES } from '@/constants/routes'

/**
 * Placeholder landing page. The full 3D/animated showpiece is intentionally
 * deferred — to be built once the 3D concept is finalized.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Link to={ROUTES.login}>
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to={ROUTES.register}>
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-navy-100 bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-600">
          AI-powered personal health management
        </span>
        <h1 className="text-balance text-4xl font-bold leading-tight text-navy-900 sm:text-5xl">
          Stop panic-Googling your symptoms.
        </h1>
        <p className="mt-5 max-w-xl text-balance text-lg text-slate-500">
          Medix gives you AI symptom triage, organized health records, smart medication
          tracking, and lab-report insights — all in one calm place.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to={ROUTES.register}>
            <Button size="lg" className="w-full sm:w-auto">
              Start free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={ROUTES.login}>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              I have an account
            </Button>
          </Link>
        </div>
        <p className="mt-10 text-xs text-slate-400">
          ✨ The full animated 3D landing experience is on its way.
        </p>
      </main>
    </div>
  )
}
