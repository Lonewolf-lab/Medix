import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import AppRoutes from '@/routes/AppRoutes'
import { useAuthStore } from '@/store/authStore'

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap)

  // Detect an existing cookie session once on app load.
  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '0.75rem',
            background: '#0d1e2e',
            color: '#fff',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
    </>
  )
}
