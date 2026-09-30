import { useEffect, useState } from 'react'
import { Pencil, Plus, RotateCcw, Search, Tags, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { archiveCategoriesService } from '@/services/archives.service'
import { ApiError } from '@/lib/http'
import { useDebounce } from '@/lib/useDebounce'
import { useAuthStore } from '@/stores/auth.store'
import type { ArchiveCategory } from '@/types'

export function ArchiveCategoriesPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const canCreate = hasPermission('courriers.create')
  const canUpdate = hasPermission('courriers.update')
  const canDelete = hasPermission('courriers.delete')

  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)
  const [items, setItems] = useState<ArchiveCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ArchiveCategory | null>(null)
  const [form, setForm] = useState({ libelle: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [deleteTarget, setDeleteTarget] = useState<ArchiveCategory | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    archiveCategoriesService
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
    setForm({ libelle: '', description: '' })
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const openEdit = (item: ArchiveCategory) => {
    setEditing(item)
    setForm({ libelle: item.libelle, description: item.description ?? '' })
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    setFormError(null)
    setFieldErrors({})
    setSaving(true)
    try {
      if (editing) {
        await archiveCategoriesService.update(editing.id, {
          libelle: form.libelle,
          description: form.description || null,
        })
      } else {
        await archiveCategoriesService.create({
          libelle: form.libelle,
          description: form.description || null,
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
      await archiveCategoriesService.remove(deleteTarget.id)
      setDeleteTarget(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Catégories d'archives"
        subtitle="Classement thématique des dossiers archivés."
        actions={
          canCreate ? (
            <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Nouvelle catégorie
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
            placeholder="Rechercher une catégorie..."
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
                <th>Libellé</th>
                <th>Description</th>
                <th>Archives</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={6} cols={4} />}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      icon={<Tags className="h-6 w-6" />}
                      title="Aucune catégorie"
                      description="Créez une catégorie pour classer vos archives."
                    />
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="font-semibold text-ink">{item.libelle}</td>
                    <td className="max-w-[420px] text-slate-500">{item.description ?? '—'}</td>
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
        title={editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
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
          <Field label="Libellé" required error={fieldErrors.libelle?.[0]}>
            <Input
              value={form.libelle}
              onChange={(event) => setForm({ ...form, libelle: event.target.value })}
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
        title="Supprimer la catégorie"
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
          <span className="font-semibold text-ink">{deleteTarget?.libelle}</span> » ?
        </p>
      </Modal>
    </div>
  )
}
