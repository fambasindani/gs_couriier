import { useEffect, useState } from 'react'
import { Database, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { ApiError } from '@/lib/http'
import { useDebounce } from '@/lib/useDebounce'
import { useAuthStore } from '@/stores/auth.store'
import { useConfirm } from '@/stores/confirm.store'
import type { RefConfig } from '@/config/referentiels-crud'
import type { Paginated } from '@/types'

const PER_PAGE = 15

interface ReferentielsCrudPageProps<T extends { id: number }> {
  config: RefConfig<T>
}

export function ReferentielsCrudPage<T extends { id: number }>({
  config,
}: ReferentielsCrudPageProps<T>) {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const confirm = useConfirm()
  const canCreate = hasPermission('courriers.create')
  const canUpdate = hasPermission('courriers.update')
  const canDelete = hasPermission('courriers.delete')

  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [form, setForm] = useState<Record<string, string>>(config.defaults)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null)

  useEffect(() => {
    setPage(1)
  }, [debounced])

  useEffect(() => {
    let active = true
    setLoading(true)
    config.service
      .list({ search: debounced || undefined, page, per_page: PER_PAGE })
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
  }, [config, debounced, page, reloadKey])

  const refresh = () => setReloadKey((value) => value + 1)

  const openCreate = () => {
    setEditing(null)
    setForm(config.defaults)
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const openEdit = (item: T) => {
    const next: Record<string, string> = { ...config.defaults }
    for (const field of config.fields) {
      const value = (item as Record<string, unknown>)[field.name]
      next[field.name] = value === null || value === undefined ? '' : String(value)
    }
    setEditing(item)
    setForm(next)
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const buildPayload = (): Record<string, unknown> => {
    const payload: Record<string, unknown> = {}
    for (const field of config.fields) {
      const raw = (form[field.name] ?? '').trim()
      if (raw === '') {
        payload[field.name] = field.required ? raw : null
      } else {
        payload[field.name] = field.type === 'number' ? Number(raw) : raw
      }
    }
    return payload
  }

  const handleSubmit = async () => {
    const ok = await confirm({
      title: editing ? 'Mettre à jour' : 'Enregistrer',
      message: 'Confirmez-vous l’enregistrement de ces informations ?',
      confirmLabel: editing ? 'Mettre à jour' : 'Enregistrer',
    })
    if (!ok) return

    setFormError(null)
    setFieldErrors({})
    setSaving(true)
    try {
      const payload = buildPayload()
      if (editing) {
        await config.service.update(editing.id, payload)
      } else {
        await config.service.create(payload)
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
      await config.service.remove(deleteTarget.id)
      setDeleteTarget(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  return (
    <div>
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        actions={
          canCreate ? (
            <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Ajouter
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
        <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 md:max-w-md">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher..."
            className="w-full border-none bg-transparent py-2 text-[0.85rem] outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-ink">
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </Card>

      <Card className="mt-5 p-4">
        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
              <tr>
                {config.columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={8} cols={config.columns.length + 1} />}
              {!loading && (data?.data.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={config.columns.length + 1}>
                    <EmptyState
                      icon={<Database className="h-6 w-6" />}
                      title={`Aucun élément`}
                      description="Ajoutez un premier élément à ce référentiel."
                    />
                  </td>
                </tr>
              )}
              {!loading &&
                data?.data.map((item) => (
                  <tr key={item.id}>
                    {config.columns.map((column, index) => {
                      const value = (item as Record<string, unknown>)[column.key]
                      const text = value === null || value === undefined ? '—' : String(value)
                      return (
                        <td
                          key={column.key}
                          className={
                            index === 0 ? 'font-semibold text-primary' : 'text-slate-600'
                          }
                        >
                          {text || '—'}
                        </td>
                      )
                    })}
                    <td className="text-right">
                      <div className="inline-flex gap-1.5">
                        {canUpdate && (
                          <button
                            onClick={() => openEdit(item)}
                            className="rounded-md border border-line bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="rounded-md border border-line bg-white p-1.5 text-danger hover:bg-danger/5"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
        title={editing ? `Modifier — ${config.title}` : `Ajouter — ${config.title}`}
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
          {config.fields.map((field) => (
            <Field
              key={field.name}
              label={field.label}
              required={field.required}
              error={fieldErrors[field.name]?.[0]}
            >
              {field.type === 'textarea' ? (
                <Textarea
                  value={form[field.name] ?? ''}
                  onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                />
              ) : field.type === 'select' ? (
                <Select
                  value={form[field.name] ?? ''}
                  onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                >
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={form[field.name] ?? ''}
                  onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                />
              )}
            </Field>
          ))}
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer"
        tone="danger"
        confirmLabel="Supprimer"
        message={<p>Confirmez-vous la suppression de cet élément ? Cette action est irréversible.</p>}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
