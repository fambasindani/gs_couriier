import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Field, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { CourrierPicker } from '@/components/courriers/CourrierPicker'
import { validationsService } from '@/services/traitement.service'
import { ApiError } from '@/lib/http'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useConfirm } from '@/stores/confirm.store'
import type { Courrier, CourrierValidation, Paginated } from '@/types'

const PER_PAGE = 15
const DECISIONS = ['VISE', 'VALIDE', 'REJETE']

const TONES: Record<string, BadgeTone> = {
  VISE: 'info',
  VALIDE: 'success',
  REJETE: 'danger',
}

interface FormState {
  courrier: Courrier | null
  decision: 'VISE' | 'VALIDE' | 'REJETE'
  commentaire: string
}

const EMPTY_FORM: FormState = { courrier: null, decision: 'VALIDE', commentaire: '' }

export function ValidationsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const confirm = useConfirm()
  const canManage = hasPermission('courriers.valider')

  const [decisionFilter, setDecisionFilter] = useState('')
  const [courrierFilter, setCourrierFilter] = useState<Courrier | null>(null)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<CourrierValidation> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CourrierValidation | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [deleteTarget, setDeleteTarget] = useState<CourrierValidation | null>(null)

  useEffect(() => {
    setPage(1)
  }, [decisionFilter, courrierFilter])

  const params = useMemo(
    () => ({
      decision: decisionFilter || undefined,
      courrier_id: courrierFilter?.id,
      page,
      per_page: PER_PAGE,
    }),
    [decisionFilter, courrierFilter, page],
  )

  useEffect(() => {
    let active = true
    setLoading(true)
    validationsService
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
    setFieldErrors({})
    setFormOpen(true)
  }

  const openEdit = (item: CourrierValidation) => {
    setEditing(item)
    setForm({
      courrier: (item.courrier as Courrier) ?? null,
      decision: item.decision,
      commentaire: item.commentaire ?? '',
    })
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    const ok = await confirm({
      title: editing ? 'Mettre à jour la validation' : 'Nouvelle validation',
      message: 'Confirmez-vous l’enregistrement de cette validation ?',
      confirmLabel: editing ? 'Mettre à jour' : 'Enregistrer',
    })
    if (!ok) return

    setFormError(null)
    setFieldErrors({})
    if (!editing && !form.courrier) {
      setFormError('Sélectionnez un courrier.')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await validationsService.update(editing.id, {
          decision: form.decision,
          commentaire: form.commentaire || null,
        })
      } else {
        await validationsService.create({
          courrier_id: form.courrier!.id,
          decision: form.decision,
          commentaire: form.commentaire || null,
        })
      }
      setFormOpen(false)
      refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)
        if (err.errors && typeof err.errors === 'object') {
          setFieldErrors(err.errors as Record<string, string[]>)
        }
      } else {
        setFormError('Erreur lors de l’enregistrement.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await validationsService.remove(deleteTarget.id)
      setDeleteTarget(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Validations & Visas"
        subtitle="Viser, valider ou rejeter les courriers."
        actions={
          canManage ? (
            <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Nouvelle validation
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
          <Select
            value={decisionFilter}
            onChange={(event) => setDecisionFilter(event.target.value)}
          >
            <option value="">Toutes les décisions</option>
            {DECISIONS.map((value) => (
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
                <th>Décideur</th>
                <th>Décision</th>
                <th>Commentaire</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={8} cols={6} />}
              {!loading && (data?.data.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<ShieldCheck className="h-6 w-6" />}
                      title="Aucune validation"
                      description="Les visas et validations apparaîtront ici."
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
                    <td>{item.user?.name ?? '—'}</td>
                    <td>
                      <Badge tone={TONES[item.decision] ?? 'secondary'}>{item.decision}</Badge>
                    </td>
                    <td className="max-w-[280px] text-slate-500">{item.commentaire ?? '—'}</td>
                    <td>{formatDate(item.date_validation ?? item.created_at, true)}</td>
                    <td className="text-right">
                      {canManage && (
                        <div className="inline-flex gap-1.5">
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
                        </div>
                      )}
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
        title={editing ? 'Modifier la validation' : 'Nouvelle validation'}
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
          <div className="mb-3 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-[0.82rem] text-danger">
            {formError}
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
              <CourrierPicker value={form.courrier} onChange={(c) => setForm({ ...form, courrier: c })} />
            )}
          </Field>
          <Field label="Décision" required error={fieldErrors.decision?.[0]}>
            <Select
              value={form.decision}
              onChange={(event) =>
                setForm({ ...form, decision: event.target.value as FormState['decision'] })
              }
            >
              {DECISIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Commentaire" error={fieldErrors.commentaire?.[0]}>
            <Textarea
              value={form.commentaire}
              onChange={(event) => setForm({ ...form, commentaire: event.target.value })}
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer la validation"
        tone="danger"
        confirmLabel="Supprimer"
        message={<p>Confirmez-vous la suppression de cette validation ?</p>}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
