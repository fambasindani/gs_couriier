import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { NotebookPen, Pencil, Plus, Trash2, User as UserIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { CourrierPicker } from '@/components/courriers/CourrierPicker'
import { annotationsService } from '@/services/traitement.service'
import { ApiError } from '@/lib/http'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useConfirm } from '@/stores/confirm.store'
import type { Courrier, CourrierAnnotation, Paginated } from '@/types'

const PER_PAGE = 15
const ETATS = ['EN_ATTENTE', 'EN_COURS', 'EXECUTEE', 'ANNULEE']

const TONES: Record<string, BadgeTone> = {
  EN_ATTENTE: 'warning',
  EN_COURS: 'primary',
  EXECUTEE: 'success',
  ANNULEE: 'secondary',
}

interface FormState {
  courrier: Courrier | null
  annotation: string
  date_limite: string
  etat: string
}

const EMPTY_FORM: FormState = { courrier: null, annotation: '', date_limite: '', etat: 'EN_ATTENTE' }

export function AnnotationsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const confirm = useConfirm()
  const canManage = hasPermission('courriers.annoter')

  const [etatFilter, setEtatFilter] = useState('')
  const [courrierFilter, setCourrierFilter] = useState<Courrier | null>(null)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<CourrierAnnotation> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CourrierAnnotation | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [deleteTarget, setDeleteTarget] = useState<CourrierAnnotation | null>(null)

  useEffect(() => {
    setPage(1)
  }, [etatFilter, courrierFilter])

  const params = useMemo(
    () => ({
      etat: etatFilter || undefined,
      courrier_id: courrierFilter?.id,
      page,
      per_page: PER_PAGE,
    }),
    [etatFilter, courrierFilter, page],
  )

  useEffect(() => {
    let active = true
    setLoading(true)
    annotationsService
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

  const openEdit = (item: CourrierAnnotation) => {
    setEditing(item)
    setForm({
      courrier: (item.courrier as Courrier) ?? null,
      annotation: item.annotation,
      date_limite: item.date_limite ? item.date_limite.slice(0, 16) : '',
      etat: item.etat,
    })
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    const ok = await confirm({
      title: editing ? 'Mettre à jour l’annotation' : 'Nouvelle annotation',
      message: 'Confirmez-vous l’enregistrement de cette annotation ?',
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
        await annotationsService.update(editing.id, {
          annotation: form.annotation,
          date_limite: form.date_limite || null,
          etat: form.etat,
        })
      } else {
        await annotationsService.create({
          courrier_id: form.courrier!.id,
          annotation: form.annotation,
          date_limite: form.date_limite || null,
          etat: form.etat,
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
      await annotationsService.remove(deleteTarget.id)
      setDeleteTarget(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Annotations"
        subtitle="Instructions et notes associées aux courriers."
        actions={
          canManage ? (
            <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Nouvelle annotation
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
          <Select value={etatFilter} onChange={(event) => setEtatFilter(event.target.value)}>
            <option value="">Tous les états</option>
            {ETATS.map((value) => (
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
                <th>Annotation</th>
                <th>Auteur</th>
                <th>Échéance</th>
                <th>État</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={8} cols={6} />}
              {!loading && (data?.data.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<NotebookPen className="h-6 w-6" />}
                      title="Aucune annotation"
                      description="Les annotations apparaîtront ici."
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
                    <td className="max-w-[320px]">{item.annotation}</td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                        {item.user?.name ?? 'Système'}
                      </span>
                    </td>
                    <td>{formatDate(item.date_limite, true)}</td>
                    <td>
                      <Badge tone={TONES[item.etat] ?? 'secondary'}>{item.etat}</Badge>
                    </td>
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
        title={editing ? 'Modifier l’annotation' : 'Nouvelle annotation'}
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
          <Field
            label="Annotation"
            required
            error={fieldErrors.annotation?.[0]}
          >
            <Textarea
              value={form.annotation}
              onChange={(event) => setForm({ ...form, annotation: event.target.value })}
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Date limite" error={fieldErrors.date_limite?.[0]}>
              <Input
                type="datetime-local"
                value={form.date_limite}
                onChange={(event) => setForm({ ...form, date_limite: event.target.value })}
              />
            </Field>
            <Field label="État">
              <Select
                value={form.etat}
                onChange={(event) => setForm({ ...form, etat: event.target.value })}
              >
                {ETATS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Supprimer l’annotation"
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
          Confirmez-vous la suppression de cette annotation ?
        </p>
      </Modal>
    </div>
  )
}
