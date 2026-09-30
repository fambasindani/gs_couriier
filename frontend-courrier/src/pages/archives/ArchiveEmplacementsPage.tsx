import { useEffect, useState } from 'react'
import { MapPin, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { archiveEmplacementsService } from '@/services/archives.service'
import { ApiError } from '@/lib/http'
import { useDebounce } from '@/lib/useDebounce'
import { useAuthStore } from '@/stores/auth.store'
import type { ArchiveEmplacement } from '@/types'

export function ArchiveEmplacementsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const canCreate = hasPermission('courriers.create')
  const canUpdate = hasPermission('courriers.update')
  const canDelete = hasPermission('courriers.delete')

  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)
  const [items, setItems] = useState<ArchiveEmplacement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ArchiveEmplacement | null>(null)
  const [form, setForm] = useState({ intitule: '', salle: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [deleteTarget, setDeleteTarget] = useState<ArchiveEmplacement | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    archiveEmplacementsService
      .list({ search: debounced || undefined, per_page: 50 })
      .then((res) => {
        if (active) {
          setItems(res.data.data)
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
  }, [debounced, reloadKey])

  const refresh = () => setReloadKey((value) => value + 1)

  const openCreate = () => {
    setEditing(null)
    setForm({ intitule: '', salle: '', description: '' })
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const openEdit = (item: ArchiveEmplacement) => {
    setEditing(item)
    setForm({ intitule: item.intitule, salle: item.salle ?? '', description: item.description ?? '' })
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    setFormError(null)
    setFieldErrors({})
    setSaving(true)
    try {
      const payload = {
        intitule: form.intitule,
        salle: form.salle || null,
        description: form.description || null,
      }
      if (editing) {
        await archiveEmplacementsService.update(editing.id, payload)
      } else {
        await archiveEmplacementsService.create(payload)
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
      await archiveEmplacementsService.remove(deleteTarget.id)
      setDeleteTarget(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Emplacements d'archives"
        subtitle="Salles et lieux de conservation physique des archives."
        actions={
          canCreate ? (
            <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Nouvel emplacement
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
            placeholder="Rechercher un emplacement..."
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
                <th>Intitulé</th>
                <th>Salle</th>
                <th>Description</th>
                <th>Archives</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={6} cols={5} />}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={<MapPin className="h-6 w-6" />}
                      title="Aucun emplacement"
                      description="Ajoutez les lieux de conservation des archives."
                    />
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="font-semibold text-ink">{item.intitule}</td>
                    <td>{item.salle ?? '—'}</td>
                    <td className="max-w-[380px] text-slate-500">{item.description ?? '—'}</td>
                    <td>
                      <span className="inline-flex rounded-md bg-primary/10 px-2 py-1 text-[0.72rem] font-semibold text-primary">
                        {item.archives?.length ?? 0}
                      </span>
                    </td>
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
      </Card>

      <Modal
        open={formOpen}
        title={editing ? 'Modifier l’emplacement' : 'Nouvel emplacement'}
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
          <Field label="Intitulé" required error={fieldErrors.intitule?.[0]}>
            <Input
              value={form.intitule}
              onChange={(event) => setForm({ ...form, intitule: event.target.value })}
            />
          </Field>
          <Field label="Salle" error={fieldErrors.salle?.[0]}>
            <Input
              value={form.salle}
              onChange={(event) => setForm({ ...form, salle: event.target.value })}
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Supprimer l’emplacement"
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
          Confirmez-vous la suppression de «{' '}
          <span className="font-semibold text-ink">{deleteTarget?.intitule}</span> » ?
        </p>
      </Modal>
    </div>
  )
}
