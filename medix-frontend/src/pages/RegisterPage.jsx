import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Calendar, Droplet } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants/routes'
import { BLOOD_GROUPS } from '@/constants/bloodGroups'

export default function RegisterPage() {
  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    dob: '',
    bloodGroup: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Only send optional fields when provided.
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        ...(form.dob ? { dob: form.dob } : {}),
        ...(form.bloodGroup ? { bloodGroup: form.bloodGroup } : {}),
      }
      const user = await register(payload)
      toast.success(`Welcome to Medix, ${user.name.split(' ')[0]}!`)
      navigate(ROUTES.dashboard, { replace: true })
    } catch (err) {
      setError(err.message || 'Could not create your account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing your health the calm way."
      footer={
        <>
          Already have an account?{' '}
          <Link to={ROUTES.login} className="font-semibold text-navy-600 hover:text-navy-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          icon={User}
          placeholder="Jane Doe"
          autoComplete="name"
          required
          value={form.name}
          onChange={update('name')}
        />
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={form.email}
          onChange={update('email')}
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={8}
          required
          value={form.password}
          onChange={update('password')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date of birth"
            type="date"
            icon={Calendar}
            value={form.dob}
            onChange={update('dob')}
          />
          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Blood group</label>
            <div className="relative">
              <Droplet className="pointer-events-none absolute left-3.5 top-1/2 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-slate-400" />
              <select
                value={form.bloodGroup}
                onChange={update('bloodGroup')}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-slate-900 transition focus:border-navy-400 focus:outline-none focus:ring-4 focus:ring-navy-100"
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-status-high">{error}</p>
        )}
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Create account
        </Button>
        <p className="text-center text-xs text-slate-400">
          By continuing you agree this is not a substitute for professional medical advice.
        </p>
      </form>
    </AuthLayout>
  )
}
