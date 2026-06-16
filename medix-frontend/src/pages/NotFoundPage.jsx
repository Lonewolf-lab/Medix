import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'
import Logo from '@/components/common/Logo'
import { ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo className="mb-8" />
      <p className="font-display text-6xl font-bold text-navy-900">404</p>
      <p className="mt-3 text-slate-500">We couldn’t find that page.</p>
      <Link to={ROUTES.dashboard} className="mt-6">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  )
}
