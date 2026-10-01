import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, FileText, Plus, RotateCcw, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Field, Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { CourrierPicker } from '@/components/courriers/CourrierPicker'
import { projetsLettresService } from '@/services/projetsLettres.service'
import { organisationService } from '@/services/organisation.service'
import { courriersService } from '@/services/courriers.service'
import { ApiError } from '@/lib/http'
import { useDebounce } from '@/lib/useDebounce'
import { formatDate } from '@/lib/utils'
import { PROJET_STATUTS, projetStatutLabel, projetStatutTone } from '@/lib/projetStatuts'
import { useAuthStore } from '@/stores/auth.store'
import { useConfirm } from '@/stores/confirm.store'
import type { Courrier, Paginated, ProjetLettre, UniteStructure, User } from '@/types'

const PER_PAGE = 15

interface FormState {
  courrier: Courrier | null
  objet: string
  destinataire: string
  service_redacteur_id: string
  signataire_id: string
}

const EMPTY_FORM: FormState = {
  courrier: null,
  objet: '',
  destinataire: '',
  service_redacteur_id: '',
  signataire_id: '',
}

export function ProjetsLettresPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const confirm = useConfirm()

  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)
  const [statutFilter, setStatutFilter] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<ProjetLettre> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [services, setServices] = useState<UniteStructure[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    organisationService.services().then(setServices).catch(() => undefined)
    organisationService.users().then(setUsers).catch(() => undefined)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [debounced, statutFilter])

  const params = useMemo(
    () => ({ search: debounced || undefined, statut: statutFilter || undefined, page, per_page: PER_PAGE }),
    [debounced, statutFilter, page],
  )

  useEffect(() => {
    let active = true
    setLoading(true)
    projetsLettresService
      .list(params)
      .then((res) => {
        if (active) {
          setData(res.data)
          setError(null)
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Erreur de chargement.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [params])

  const openCreate = (courrier: Courrier | null = null) => {
    setForm({ ...EMPTY_FORM, courrier, destinataire: courrier?.expediteur?.nom ?? '' })
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  // Pré-remplissage depuis /projets-lettres?courrier_id=X
  useEffect(() => {
    const id = searchParams.get('courrier_id')
    if (!id) return
    courriersService
      .show(id)
      .then((res) => {
        openCreate(res.data)
        setSearchParams({}, { replace: true })
      })
      .catch(() => undefined)
  }, [searchParams, setSearchParams])

  const handleSubmit = async () => {
    const ok = await confirm({
      title: 'Créer le projet de lettre',
      message: 'Confirmez-vous la création de ce projet de lettre ?',
      confirmLabel: 'Créer',
    })
    if (!ok) return

    setFormError(null)
    setFieldErrors({})
    setSaving(true)
    try {
      const res = await projetsLettresService.create({
        courrier_entrant_id: form.courrier?.id ?? null,
        objet: form.objet,
        destinataire: form.destinataire || null,
        service_redacteur_id: form.service_redacteur_id ? Number(form.service_redacteur_id) : null,
        signataire_id: form.signataire_id ? Number(form.signataire_id) : null,
      })
      setFormOpen(false)
      navigate(`/projets-lettres/${res.data.id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)
        if (err.errors && typeof err.errors === 'object') setFieldErrors(err.errors as Record<string, string[]>)
      } else setFormError('Erreur lors de la création.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Projets de lettres"
        subtitle="Rédaction Word, versions, validation, signature puis courrier sortant officiel."
        actions={
          hasPermission('projets.create') ? (
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => openCreate()}>
              Nouveau projet
            </Button>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          {error}
        </div>
      )}

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher (référence, objet, destinataire)..."
                className="w-full border-none bg-transparent py-2 text-[0.85rem] outline-none"
              />
            </div>
          </div>
          <Select value={statutFilter} onChange={(event) => setStatutFilter(event.target.value)}>
            <option value="">Tous les statuts</option>
            {PROJET_STATUTS.map((value) => (
              <option key={value} value={value}>
                {projetStatutLabel(value)}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={() => {
              setSearch('')
              setStatutFilter('')
            }}
          >
            Réinitialiser
          </Button>
        </div>
      </Card>

      <Card className="mt-5 p-4">
        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Objet</th>
                <th>Destinataire</th>
                <th>Statut</th>
                <th>Créé par</th>
                <th>Créé le</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={8} cols={7} />}
              {!loading && (data?.data.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={<FileText className="h-6 w-6" />}
                      title="Aucun projet de lettre"
                      description="Créez un projet depuis un courrier ou manuellement."
                    />
                  </td>
                </tr>
              )}
              {!loading &&
                data?.data.map((projet) => (
                  <tr key={projet.id}>
                    <td className="font-semibold text-primary">
                      <Link to={`/projets-lettres/${projet.id}`} className="hover:underline">
                        {projet.reference_projet}
                      </Link>
                    </td>
                    <td className="max-w-[260px]">{projet.objet}</td>
                    <td className="text-slate-600">{projet.destinataire ?? '—'}</td>
                    <td>
                      <Badge tone={projetStatutTone(projet.statut)}>
                        {projetStatutLabel(projet.statut)}
                      </Badge>
                    </td>
                    <td className="text-slate-600">{projet.createur?.name ?? '—'}</td>
                    <td>{formatDate(projet.date_creation ?? projet.created_at)}</td>
                    <td className="text-right">
                      <Link
                        to={`/projets-lettres/${projet.id}`}
                        className="inline-flex rounded-md border border-line bg-white p-1.5 text-primary hover:bg-primary/5"
                        title="Ouvrir"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {data && (
          <Pagination
            page={data.current_page}
            lastPage={data.last_page}
            total={data.total}
            from={data.from}
            to={data.to}
            onChange={setPage}
          />
        )}
      </Card>

      <Modal
        open={formOpen}
        title="Nouveau projet de lettre"
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Création…' : 'Créer le projet'}
            </Button>
          </>
        }
      >
        {formError && (
          <div className="mb-3 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-[0.82rem] text-danger">
            {formError}
          </div>
        )}
        <div className="space-y-4">
          <Field label="Courrier entrant / dossier lié (optionnel)" hint="Liez le projet à un courrier reçu si applicable.">
            <CourrierPicker value={form.courrier} onChange={(c) => setForm({ ...form, courrier: c })} />
          </Field>
          <Field label="Objet de la lettre" required error={fieldErrors.objet?.[0]}>
            <Input value={form.objet} onChange={(e) => setForm({ ...form, objet: e.target.value })} />
          </Field>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Destinataire" error={fieldErrors.destinataire?.[0]}>
              <Input
                value={form.destinataire}
                onChange={(e) => setForm({ ...form, destinataire: e.target.value })}
              />
            </Field>
            <Field label="Service rédacteur">
              <Select
                value={form.service_redacteur_id}
                onChange={(e) => setForm({ ...form, service_redacteur_id: e.target.value })}
              >
                <option value="">— Aucun —</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.libelle}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Signataire prévu">
            <Select
              value={form.signataire_id}
              onChange={(e) => setForm({ ...form, signataire_id: e.target.value })}
            >
              <option value="">— Aucun —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  )
}
