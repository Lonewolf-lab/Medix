import { create } from 'zustand'
import { authApi } from '@/api/authApi'
import { userApi } from '@/api/userApi'
import { setUnauthorizedHandler } from '@/api/axiosInstance'

/**
 * Auth is driven by an HttpOnly cookie the frontend cannot read. So we never
 * store a token here — instead we ask the backend "who am I?" via /user/profile
 * to decide whether a session exists.
 *
 * status: 'loading'  → still bootstrapping (don't render protected routes yet)
 *         'authed'   → user is set
 *         'guest'    → no session
 */
export const useAuthStore = create((set) => ({
  user: null,
  status: 'loading',

  /** Called once on app start to detect an existing cookie session. */
  bootstrap: async () => {
    try {
      const user = await userApi.getProfile()
      set({ user, status: 'authed' })
    } catch {
      set({ user: null, status: 'guest' })
    }
  },

  login: async (credentials) => {
    await authApi.login(credentials)
    const user = await userApi.getProfile()
    set({ user, status: 'authed' })
    return user
  },

  register: async (payload) => {
    await authApi.register(payload)
    const user = await userApi.getProfile()
    set({ user, status: 'authed' })
    return user
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // even if the network call fails, drop local session
    }
    set({ user: null, status: 'guest' })
  },

  /** Used by the axios 401 handler — wipe session without an API round-trip. */
  forceLogout: () => set({ user: null, status: 'guest' }),
}))

// Wire the global 401 handler so an expired session logs the user out.
setUnauthorizedHandler(() => {
  const { status, forceLogout } = useAuthStore.getState()
  if (status === 'authed') forceLogout()
})
