const TOKEN_KEY = 'sgec_token'

/** Accès centralisé au token Sanctum (partagé entre le client HTTP et le store). */
export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* stockage indisponible */
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* stockage indisponible */
    }
  },
}
