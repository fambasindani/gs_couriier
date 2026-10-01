import { useState, type FormEvent } from 'react'
import { AlertTriangle, CheckCircle2, KeyRound, Mail, Save, ShieldCheck, User as UserIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Field, Input } from '@/components/ui/Field'
import { authService } from '@/services/auth.service'
import { ApiError } from '@/lib/http'
import { initials } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useConfirm } from '@/stores/confirm.store'

export function ProfilPage() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const confirm = useConfirm()

  // Formulaire informations
  const [info, setInfo] = useState({ name: user?.name ?? '', email: user?.email ?? '' })
  const [infoSaving, setInfoSaving] = useState(false)
  const [infoError, setInfoError] = useState<string | null>(null)
  const [infoSuccess, setInfoSuccess] = useState(false)
  const [infoErrors, setInfoErrors] = useState<Record<string, string[]>>({})

  // Formulaire mot de passe
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const [pwdErrors, setPwdErrors] = useState<Record<string, string[]>>({})

  const handleInfoSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const ok = await confirm({
      title: 'Mettre à jour le profil',
      message: 'Confirmez-vous la modification de vos informations personnelles ?',
      confirmLabel: 'Enregistrer',
    })
    if (!ok) return
    setInfoSaving(true)
    setInfoError(null)
    setInfoSuccess(false)
    setInfoErrors({})
    try {
      const updated = await authService.updateProfile({ name: info.name, email: info.email })
      setUser(updated)
      setInfoSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setInfoError(err.message)
        if (err.errors && typeof err.errors === 'object') {
          setInfoErrors(err.errors as Record<string, string[]>)
        }
      } else {
        setInfoError('Erreur lors de la mise à jour.')
      }
    } finally {
      setInfoSaving(false)
    }
  }

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const ok = await confirm({
      title: 'Modifier le mot de passe',
      message: 'Confirmez-vous la modification de votre mot de passe ?',
      confirmLabel: 'Modifier',
    })
    if (!ok) return
    setPwdSaving(true)
    setPwdError(null)
    setPwdSuccess(false)
    setPwdErrors({})
    try {
      await authService.updatePassword({
        current_password: pwd.current,
        password: pwd.next,
        password_confirmation: pwd.confirm,
      })
      setPwd({ current: '', next: '', confirm: '' })
      setPwdSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setPwdError(err.message)
        if (err.errors && typeof err.errors === 'object') {
          setPwdErrors(err.errors as Record<string, string[]>)
        }
      } else {
        setPwdError('Erreur lors de la modification.')
      }
    } finally {
      setPwdSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Mon profil" subtitle="Gérez vos informations personnelles et votre mot de passe." />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Carte identité */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#6a6af4] text-2xl font-bold text-white shadow-lg">
              {initials(user?.name)}
            </span>
            <h4 className="mt-4 text-lg font-bold text-ink">{user?.name ?? 'Utilisateur'}</h4>
            <p className="text-[0.85rem] text-slate-500">{user?.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {(user?.roles ?? []).map((role) => (
                <Badge key={role.id} tone="primary">
                  {role.nom}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-line pt-5">
            <div className="flex items-center gap-3 text-[0.85rem]">
              <UserIcon className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">{user?.name}</span>
            </div>
            <div className="flex items-center gap-3 text-[0.85rem]">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-[0.85rem]">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">
                {(user?.roles ?? []).map((role) => role.nom).join(', ') || 'Aucun rôle'}
              </span>
            </div>
          </div>
        </Card>

        {/* Formulaires */}
        <div className="space-y-5 xl:col-span-2">
          {/* Informations */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-primary" />
              <h6 className="section-title mb-0">Informations personnelles</h6>
            </div>

            {infoError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-[0.82rem] text-danger">
                <AlertTriangle className="h-4 w-4" /> {infoError}
              </div>
            )}
            {infoSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-3 py-2 text-[0.82rem] text-success">
                <CheckCircle2 className="h-4 w-4" /> Profil mis à jour avec succès.
              </div>
            )}

            <form onSubmit={handleInfoSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nom complet" required error={infoErrors.name?.[0]}>
                <Input
                  value={info.name}
                  onChange={(event) => setInfo({ ...info, name: event.target.value })}
                />
              </Field>
              <Field label="Adresse e-mail" required error={infoErrors.email?.[0]}>
                <Input
                  type="email"
                  value={info.email}
                  onChange={(event) => setInfo({ ...info, email: event.target.value })}
                />
              </Field>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={infoSaving} icon={<Save className="h-4 w-4" />}>
                  {infoSaving ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Mot de passe */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              <h6 className="section-title mb-0">Modification du mot de passe</h6>
            </div>

            {pwdError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-[0.82rem] text-danger">
                <AlertTriangle className="h-4 w-4" /> {pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-3 py-2 text-[0.82rem] text-success">
                <CheckCircle2 className="h-4 w-4" /> Mot de passe modifié avec succès.
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Field label="Mot de passe actuel" required error={pwdErrors.current_password?.[0]}>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={pwd.current}
                  onChange={(event) => setPwd({ ...pwd, current: event.target.value })}
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Nouveau mot de passe"
                  required
                  error={pwdErrors.password?.[0]}
                  hint="Au moins 8 caractères."
                >
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={pwd.next}
                    onChange={(event) => setPwd({ ...pwd, next: event.target.value })}
                  />
                </Field>
                <Field label="Confirmer le mot de passe" required>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={pwd.confirm}
                    onChange={(event) => setPwd({ ...pwd, confirm: event.target.value })}
                  />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={pwdSaving} icon={<KeyRound className="h-4 w-4" />}>
                  {pwdSaving ? 'Modification…' : 'Modifier le mot de passe'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
