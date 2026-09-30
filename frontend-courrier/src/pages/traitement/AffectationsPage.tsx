import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Ban, CheckCheck, Pencil, Plus, Share2, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Field, Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { CourrierPicker } from '@/components/courriers/CourrierPicker'
import { affectationsService } from '@/services/traitement.service'
import { organisationService } from '@/services/organisation.service'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import type { Courrier, CourrierAffectation, Paginated, UniteStructure, User } from '@/types'

const PER_PAGE = 15
const STATUTS = ['AFFECTE', 'PRIS_EN_CHARGE', 'EN_TRAITEMENT', 'TRAITE', 'REJETE']

const TONES: Record<string, BadgeTone> = {
  AFFECTE: 'info',
  PRIS_EN_CHARGE: 'primary',
  EN_TRAITEMENT: 'primary',
  TRAITE: 'success',
  REJETE: 'danger',
}

interface FormState {
  courrier: Courrier | null
  direction_id: string
  departement_id: string
  service_id: string
  user_id: string
  date_limite: string
  statut: string
}

const EMPTY_FORM: FormState = {
  courrier: null,
  direction_id: '',
  departement_id: '',
  service_id: '',
  user_id: '',
  date_limite: '',
  statut: 'AFFECTE',
}

function cibleLabel(item: CourrierAffectation): string {
  const parts = [
    item.direction?.libelle,
    item.departement?.libelle,
    item.service?.libelle,
    item.user?.name,
  ].filter(Boolean)
  return parts.length ? parts.join(' › ') : '—'
}

export function AffectationsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const canManage = hasPermission('courriers.affecter')

  const [statutFilter, setStatutFilter] = useState('')
  const [courrierFilter, setCourrierFilter] = useState<Courrier | null>(null)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<CourrierAffectation> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [org, setOrg] = useState<{
    directions: UniteStructure[]
    departements: UniteStructure[]
    services: UniteStructure[]
    users: User[]
  }>({ directions: [], departements: [], services: [], users: [] })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CourrierAffectation | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CourrierAffectation | null>(null)

  useEffect(() => {
    Promise.all([
      organisationService.directions(),
      organisationService.departements(),
      organisationService.services(),
      organisationService.users().catch(() => [] as User[]),
    ])
      .then(([directions, departements, services, users]) =>
        setOrg({ directions, departements, services, users }),
      )
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [statutFilter, courrierFilter])

  const params = useMemo(
    () => ({
      statut: statutFilter || undefined,
      courrier_id: courrierFilter?.id,
      page,
      per_page: PER_PAGE,
    }),
    [statutFilter, courrierFilter, page],
  )

  useEffect(() => {
    let active = true
    setLoading(true)
    affectationsService
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
  }, [params, reloadKey])

  const refresh = () => setReloadKey((value) => value + 1)

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (item: CourrierAffectation) => {
    setEditing(item)
    setForm({
      courrier: (item.courrier as Courrier) ?? null,
      direction_id: String(item.direction?.id ?? ''),
      departement_id: String(item.departement?.id ?? ''),
      service_id: String(item.service?.id ?? ''),
      user_id: String(item.user?.id ?? ''),
      date_limite: item.date_limite ? item.date_limite.slice(0, 16) : '',
      statut: item.statut,
    })
    setFormError(null)
    setFormOpen(true)
  }

  const set = (key: keyof FormState, value: string | Courrier | null) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    setFormError(null)
    if (!editing && !form.courrier) {
      setFormError('Sélectionnez un courrier.')
      return
    }
    if (!form.direction_id && !form.departement_id && !form.service_id && !form.user_id) {
      setFormError('Au moins une cible est requise.')
      return
    }

    const payload = {
      direction_id: form.direction_id ? Number(form.direction_id) : null,
      departement_id: form.departement_id ? Number(form.departement_id) : null,
      service_id: form.service_id ? Number(form.service_id) : null,
      user_id: form.user_id ? Number(form.user_id) : null,
      date_limite: form.date_limite || null,
    }

    setSaving(true)
    try {
      if (editing) {
        await affectationsService.update(editing.id, { ...payload, statut: form.statut })
      } else {
        await affectationsService.create({ courrier_id: form.courrier!.id, ...payload })
      }
      setFormOpen(false)
      refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de l’enregistrement.')
    } finally {
      setSaving(false)
    }
  }

  const quickStatut = async (item: CourrierAffectation, statut: string) => {
    try {
      await affectationsService.update(item.id, { statut })
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await affectationsService.remove(deleteTarget.id)
      setDeleteTarget(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  const departements = org.departements.filter(
    (item) => !form.direction_id || String(item.direction_id) === form.direction_id,
  )
  const services = org.services.filter(
    (item) => !form.departement_id || String(item.departement_id) === form.departement_id,
  )

  return (
    <div>
      <PageHeader
        title="Affectations"
        subtitle="Transmettre les courriers aux directions, services et agents."
        actions={
          canManage ? (
            <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Nouvelle affectation
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
            <CourrierPicker
              value={courrierFilter}
              onChange={setCourrierFilter}
              placeholder="Filtrer par courrier..."
            />
          </div>
          <Select value={statutFilter} onChange={(event) => setStatutFilter(event.target.value)}>
            <option value="">Tous les statuts</option>
            {STATUTS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="mt-5 p-4">
        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
              <tr>
                <th>Courrier</th>
                <th>Cible</th>
                <th>Affecté par</th>
                <th>Affectation</th>
                <th>Limite</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={8} cols={7} />}
              {!loading && (data?.data.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={<Share2 className="h-6 w-6" />}
                      title="Aucune affectation"
                      description="Les affectations de courriers apparaîtront ici."
                    />
                  </td>
                </tr>
              )}
              {!loading &&
                data?.data.map((item) => (
                  <tr key={item.id}>
                    <td className="font-semibold text-primary">
                      {item.courrier ? (
                        <Link to={`/courriers/${item.courrier.id}`} className="hover:underline">
                          {item.courrier.numero}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{cibleLabel(item)}</td>
                    <td>{item.affecte_par?.name ?? '—'}</td>
                    <td>{formatDate(item.date_affectation, true)}</td>
                    <td>{formatDate(item.date_limite, true)}</td>
                    <td>
                      <Badge tone={TONES[item.statut] ?? 'secondary'}>{item.statut}</Badge>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex gap-1.5">
                        {canManage && item.statut === 'AFFECTE' && (
                          <button
                            onClick={() => void quickStatut(item, 'PRIS_EN_CHARGE')}
                            className="rounded-md border border-line bg-white p-1.5 text-info hover:bg-info/5"
                            title="Prendre en charge"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                        {canManage && item.statut !== 'TRAITE' && item.statut !== 'REJETE' && (
                          <button
                            onClick={() => void quickStatut(item, 'TRAITE')}
                            className="rounded-md border border-line bg-white p-1.5 text-success hover:bg-success/5"
                            title="Marquer traité"
                          >
                            <CheckCheck className="h-4 w-4" />
                          </button>
                        )}
                        {canManage && item.statut !== 'REJETE' && item.statut !== 'TRAITE' && (
                          <button
                            onClick={() => void quickStatut(item, 'REJETE')}
                            className="rounded-md border border-line bg-white p-1.5 text-danger hover:bg-danger/5"
                            title="Rejeter"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                        {canManage && (
                          <>
                            <button
                              onClick={() => openEdit(item)}
                              className="rounded-md border border-line bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                              title="Modifier"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="rounded-md border border-line bg-white p-1.5 text-danger hover:bg-danger/5"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
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
        title={editing ? 'Modifier l’affectation' : 'Nouvelle affectation'}
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        {formError && (
          <div className="mb-3 flex items-center gap-2 text-[0.82rem] text-danger">
            <AlertTriangle className="h-4 w-4" /> {formError}
          </div>
        )}
        <div className="space-y-4">
          <Field label="Courrier" required>
            {editing ? (
              <div className="rounded-lg border border-line bg-surface px-3 py-2 text-[0.82rem]">
                <span className="font-semibold text-primary">{form.courrier?.numero}</span> —{' '}
                {form.courrier?.objet}
              </div>
            ) : (
              <CourrierPicker value={form.courrier} onChange={(c) => set('courrier', c)} />
            )}
          </Field>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Direction">
              <Select value={form.direction_id} onChange={(e) => set('direction_id', e.target.value)}>
                <option value="">— Aucune —</option>
                {org.directions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.libelle}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Département">
              <Select
                value={form.departement_id}
                onChange={(e) => set('departement_id', e.target.value)}
              >
                <option value="">— Aucun —</option>
                {departements.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.libelle}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Service">
              <Select value={form.service_id} onChange={(e) => set('service_id', e.target.value)}>
                <option value="">— Aucun —</option>
                {services.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.libelle}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Agent">
              <Select value={form.user_id} onChange={(e) => set('user_id', e.target.value)}>
                <option value="">— Aucun —</option>
                {org.users.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Date limite">
              <Input
                type="datetime-local"
                value={form.date_limite}
                onChange={(e) => set('date_limite', e.target.value)}
              />
            </Field>
            {editing && (
              <Field label="Statut">
                <Select value={form.statut} onChange={(e) => set('statut', e.target.value)}>
                  {STATUTS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Supprimer l’affectation"
        size="sm"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Supprimer
            </Button>
          </>
        }
      >
        <p className="text-[0.85rem] text-slate-600">
          Confirmez-vous la suppression de cette affectation ?
        </p>
      </Modal>
    </div>
  )
}
