import { create } from 'zustand'
import { authService } from '@/services/auth.service'
import { ApiError } from '@/lib/http'
import { tokenStorage } from '@/lib/auth-token'
import type { User } from '@/types'

const USER_KEY = 'sgec_user'
const ADMIN_ROLE = 'Administrateur'

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function persistUser(user: User | null): void {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  } catch {
    /* stockage indisponible */
  }
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  fetchMe: () => Promise<void>
  setUser: (user: User) => void
  hasPermission: (slug: string) => boolean
  isAuthenticated: () => boolean
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: readStoredUser(),
  token: tokenStorage.get(),
  loading: false,
  error: null,

  async login(email, password) {
    set({ loading: true, error: null })
    try {
      const { user, token } = await authService.login(email, password)
      tokenStorage.set(token)
      persistUser(user)
      set({ user, token, loading: false })
      return true
    } catch (err) {
      let message = err instanceof Error ? err.message : 'Connexion impossible.'
      if (err instanceof ApiError && err.errors && typeof err.errors === 'object') {
        const first = Object.values(err.errors as Record<string, string[]>)
          .flat()
          .find(Boolean)
        if (first) message = first
      }
      set({ loading: false, error: message })
      return false
    }
  },

  logout() {
    authService.logout().catch(() => undefined)
    tokenStorage.clear()
    persistUser(null)
    set({ user: null, token: null, error: null })
  },

  async fetchMe() {
    if (!tokenStorage.get()) return
    try {
      const user = await authService.me()
      persistUser(user)
      set({ user })
    } catch {
      get().logout()
    }
  },

  setUser(user) {
    persistUser(user)
    set({ user })
  },

  hasPermission(slug) {
    const user = get().user
    if (!user) return false
    if (user.roles?.some((role) => role.nom === ADMIN_ROLE)) return true
    return user.roles?.some((role) => role.permissions?.some((p) => p.slug === slug)) ?? false
  },

  isAuthenticated() {
    return Boolean(get().token)
  },

  clearError() {
    set({ error: null })
  },
}))
