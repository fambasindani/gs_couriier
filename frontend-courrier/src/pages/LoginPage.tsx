import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle, Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const token = useAuthStore((state) => state.token)
  const loading = useAuthStore((state) => state.loading)
  const error = useAuthStore((state) => state.error)
  const login = useAuthStore((state) => state.login)
  const clearError = useAuthStore((state) => state.clearError)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (token) return <Navigate to="/" replace />

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()
    const ok = await login(email.trim(), password)
    if (ok) navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Panneau de marque */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0b0b0f] p-12 text-white lg:flex">
        <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_15%_18%,#2c2c3c,transparent_45%),radial-gradient(circle_at_85%_78%,#1a1a26,transparent_42%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight">SGEC</div>
            <div className="text-[0.72rem] text-white/70">République Démocratique du Congo</div>
          </div>
        </div>

        <div className="relative">
          <h1 className="text-3xl font-extrabold leading-tight">
            Système de Gestion
            <br />
            Électronique du Courrier
          </h1>
          <p className="mt-4 max-w-md text-[0.9rem] text-white/75">
            Plateforme sécurisée de gestion centralisée et traçable du cycle de vie du courrier :
            enregistrement, affectation, visas, archivage et rapports.
          </p>
        </div>

        <div className="relative text-[0.75rem] text-white/60">
          © {new Date().getFullYear()} SGEC — Tous droits réservés
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b0b0f] text-white">
              <Mail className="h-6 w-6" />
            </div>
            <div className="text-lg font-bold text-ink">SGEC</div>
            <div className="text-[0.75rem] text-slate-500">Gestion Électronique du Courrier</div>
          </div>

          <div className="card-custom p-8">
            <h2 className="text-xl font-bold text-ink">Connexion</h2>
            <p className="mb-6 mt-1 text-[0.85rem] text-slate-500">
              Accédez à votre espace de gestion du courrier.
            </p>

            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2.5 text-[0.82rem] text-danger">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[0.8rem] font-semibold text-ink">
                  Adresse e-mail
                </label>
                <div
                  className={`flex items-center rounded-lg border bg-white px-3 ${
                    error
                      ? 'border-danger focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/10'
                      : 'border-line focus-within:border-[#0b0b0f] focus-within:ring-2 focus-within:ring-black/10'
                  }`}
                >
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="vous@sgec.cd"
                    className="w-full border-none bg-transparent px-3 py-2.5 text-[0.88rem] outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-[0.8rem] font-semibold text-ink">
                  Mot de passe
                </label>
                <div
                  className={`flex items-center rounded-lg border bg-white px-3 ${
                    error
                      ? 'border-danger focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/10'
                      : 'border-line focus-within:border-[#0b0b0f] focus-within:ring-2 focus-within:ring-black/10'
                  }`}
                >
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full border-none bg-transparent px-3 py-2.5 text-[0.88rem] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-slate-400 hover:text-ink"
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b0b0f] py-2.5 text-[0.9rem] font-semibold text-white shadow-sm transition-colors hover:bg-[#1c1c24] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  'Connexion en cours…'
                ) : (
                  <>
                    <LogIn className="h-4 w-4" /> Se connecter
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-lg bg-surface p-3 text-[0.75rem] text-slate-500">
              <span className="font-semibold text-slate-600">Compte de démonstration :</span>
              <br />
              pierrepapy@gmail.com / 12345678
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
