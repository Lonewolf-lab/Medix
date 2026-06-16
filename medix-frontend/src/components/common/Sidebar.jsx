import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/cn'
import { NAV_ITEMS } from '@/components/layout/navItems'
import { useAuthStore } from '@/store/authStore'
import Logo from '@/components/common/Logo'

function NavItem({ to, label, icon: Icon, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
          isActive
            ? 'bg-navy-600 text-white shadow-soft'
            : 'text-slate-600 hover:bg-navy-50 hover:text-navy-700',
        )
      }
    >
      <Icon className="h-[1.15rem] w-[1.15rem]" />
      {label}
    </NavLink>
  )
}

export default function Sidebar({ onNavigate }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out')
  }

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="px-2 py-3">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-600 text-sm font-semibold text-white">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-navy-900">{user?.name ?? 'User'}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-status-high"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-[1.1rem] w-[1.1rem]" />
          </button>
        </div>
      </div>
    </div>
  )
}
