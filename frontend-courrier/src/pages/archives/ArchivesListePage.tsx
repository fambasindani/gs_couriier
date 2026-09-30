import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive as ArchiveIcon, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
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
import { archivesService, archiveCategoriesService, archiveEmplacementsService } from '@/services/archives.service'
import { ApiError } from '@/lib/http'
import { useDebounce } from '@/lib/useDebounce'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import type { Archive, ArchiveCategory, ArchiveEmplacement, Courrier, Paginated } from '@/types'

const PER_PAGE = 15
const STATUTS = ['ACTIF', 'VERSE', 'ELIMINE']

const TONES: Record<string, BadgeTone> = {
  ACTIF: 'success',
  VERSE: 'info',
  ELIMINE: 'secondary',
}

interface FormState {
  courrier: Courrier | null
  archive_category_id: string
  archive_emplacement_id: string
  titre_dossier: string
  producteur_service: string
  date_periode: string
  duree_conservation_ans: string
  date_versement: string
  statut_archive: string
  observation: string
}

const EMPTY_FORM: FormState = {
  courrier: null,
  archive_category_id: '',
  archive_emplacement_id: '',
  titre_dossier: '',
  producteur_service: '',
  date_periode: '',
  duree_conservation_ans: '5',
  date_versement: '',
  statut_archive: 'ACTIF',
  observation: '',
}

export function ArchivesListePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const canCreate = hasPermission('courriers.create')
  const canUpdate = hasPermission('courriers.update')
  const canDelete = hasPermission('courriers.delete')

  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [emplacementFilter, setEmplacementFilter] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<Archive> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [categories, setCategories] = useState<ArchiveCategory[]>([])
  const [emplacements, setEmplacements] = useState<ArchiveEmplacement[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Archive | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [deleteTarget, setDeleteTarget] = useState<Archive | null>(null)

  useEffect(() => {
    Promise.all([archiveCategoriesService.all(), archiveEmplacementsService.all()])
      .then(([cats, emps]) => {
        setCategories(cats)
        setEmplacements(emps)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [debounced, categoryFilter, emplacementFilter, statutFilter])

  const params = useMemo(
    () => ({
      search: debounced || undefined,
      archive_category_id: categoryFilter || undefined,
      archive_emplacement_id: emplacementFilter || undefined,
      statut_archive: statutFilter || undefined,
      page,
      per_page: PER_PAGE,
    }),
    [debounced, categoryFilter, emplacementFilter, statutFilter, page],
  )

  useEffect(() => {
    let active = true
    setLoading(true)
    archivesService
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

  const openEdit = (item: Archive) => {
    setEditing(item)
    setForm({
      courrier: item.courrier ?? null,
      archive_category_id: String(item.category?.id ?? ''),
      archive_emplacement_id: String(item.emplacement?.id ?? ''),
      titre_dossier: item.titre_dossier,
      producteur_service: item.producteur_service ?? '',
      date_periode: item.date_periode ?? '',
      duree_conservation_ans: String(item.duree_conservation_ans ?? ''),
      date_versement: item.date_versement ? item.date_versement.slice(0, 10) : '',
      statut_archive: item.statut_archive,
      observation: item.observation ?? '',
    })
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    setFormError(null)
    setFieldErrors({})
    if (!form.titre_dossier.trim()) {
      setFormError('Le titre du dossier est requis.')
      return
    }
    const payload = {
      archive_category_id: form.archive_category_id ? Number(form.archive_category_id) : null,
      archive_emplacement_id: form.archive_emplacement_id
        ? Number(form.archive_emplacement_id)
        : null,
      titre_dossier: form.titre_dossier,
      producteur_service: form.producteur_service || null,
      date_periode: form.date_periode || null,
      duree_conservation_ans: form.duree_conservation_ans
        ? Number(form.duree_conservation_ans)
        : null,
      observation: form.observation || null,
    }

    setSaving(true)
    try {
      if (editing) {
        await archivesService.update(editing.id, { ...payload, statut_archive: form.statut_archive })
      } else {
        await archivesService.create({
          ...payload,
          courrier_id: form.courrier?.id ?? null,
          date_versement: form.date_versement || null,
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
      await archivesService.remove(deleteTarget.id)
      setDeleteTarget(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Archives"
        subtitle="Dossiers archivés, cotes et durées de conservation."
        actions={
          canCreate ? (
            <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Nouvelle archive
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher (cote, titre, producteur)..."
                className="w-full border-none bg-transparent py-2 text-[0.85rem] outline-none"
              />
            </div>
          </div>
          <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="">Toutes les catégories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.libelle}
              </option>
            ))}
          </Select>
          <Select
            value={emplacementFilter}
            onChange={(event) => setEmplacementFilter(event.target.value)}
          >
            <option value="">Tous les emplacements</option>
            {emplacements.map((item) => (
              <option key={item.id} value={item.id}>
                {item.intitule}
              </option>
            ))}
          </Select>
          <Select value={statutFilter} onChange={(event) => setStatutFilter(event.target.value)}>
            <option value="">Tous les statuts</option>
            {STATUTS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
          <div className="flex items-end">
            <Button
              variant="ghost"
              icon={<RotateCcw className="h-4 w-4" />}
              onClick={() => {
                setSearch('')
                setCategoryFilter('')
                setEmplacementFilter('')
                setStatutFilter('')
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mt-5 p-4">
        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
              <tr>
                <th>Cote</th>
                <th>Titre du dossier</th>
                <th>Catégorie</th>
                <th>Emplacement</th>
                <th>Versement</th>
                <th>Fin conservation</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={8} cols={8} />}
              {!loading && (data?.data.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={<ArchiveIcon className="h-6 w-6" />}
                      title="Aucune archive"
                      description="Les dossiers archivés apparaîtront ici."
                    />
                  </td>
                </tr>
              )}
              {!loading &&
                data?.data.map((item) => (
                  <tr key={item.id}>
                    <td className="font-semibold text-primary">
                      {item.courrier_id ? (
                        <Link to={`/courriers/${item.courrier_id}`} className="hover:underline">
                          {item.cote_archive}
                        </Link>
                      ) : (
                        item.cote_archive
                      )}
                    </td>
                    <td className="max-w-[240px]">{item.titre_dossier}</td>
                    <td>{item.category?.libelle ?? '—'}</td>
                    <td>{item.emplacement?.intitule ?? '—'}</td>
                    <td>{formatDate(item.date_versement)}</td>
                    <td>{formatDate(item.date_fin_conservation)}</td>
                    <td>
                      <Badge tone={TONES[item.statut_archive] ?? 'secondary'}>
                        {item.statut_archive}
                      </Badge>
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
        title={editing ? 'Modifier l’archive' : 'Nouvelle archive'}
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
          {!editing && (
            <Field label="Courrier lié (optionnel)">
              <CourrierPicker value={form.courrier} onChange={(c) => setForm({ ...form, courrier: c })} />
            </Field>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Catégorie d'archive">
              <Select
                value={form.archive_category_id}
                onChange={(event) => setForm({ ...form, archive_category_id: event.target.value })}
              >
                <option value="">— Aucune —</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.libelle}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Emplacement">
              <Select
                value={form.archive_emplacement_id}
                onChange={(event) =>
                  setForm({ ...form, archive_emplacement_id: event.target.value })
                }
              >
                <option value="">— Aucun —</option>
                {emplacements.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.intitule}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Titre du dossier" required error={fieldErrors.titre_dossier?.[0]}>
            <Input
              value={form.titre_dossier}
              onChange={(event) => setForm({ ...form, titre_dossier: event.target.value })}
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Producteur / service" error={fieldErrors.producteur_service?.[0]}>
              <Input
                value={form.producteur_service}
                onChange={(event) => setForm({ ...form, producteur_service: event.target.value })}
              />
            </Field>
            <Field label="Période (ex: 2020-2024)" error={fieldErrors.date_periode?.[0]}>
              <Input
                value={form.date_periode}
                onChange={(event) => setForm({ ...form, date_periode: event.target.value })}
              />
            </Field>
            <Field label="Durée de conservation (ans)" error={fieldErrors.duree_conservation_ans?.[0]}>
              <Input
                type="number"
                min={1}
                max={100}
                value={form.duree_conservation_ans}
                onChange={(event) =>
                  setForm({ ...form, duree_conservation_ans: event.target.value })
                }
              />
            </Field>
            {!editing && (
              <Field label="Date de versement">
                <Input
                  type="date"
                  value={form.date_versement}
                  onChange={(event) => setForm({ ...form, date_versement: event.target.value })}
                />
              </Field>
            )}
            {editing && (
              <Field label="Statut">
                <Select
                  value={form.statut_archive}
                  onChange={(event) => setForm({ ...form, statut_archive: event.target.value })}
                >
                  {STATUTS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
          <Field label="Observation">
            <Textarea
              value={form.observation}
              onChange={(event) => setForm({ ...form, observation: event.target.value })}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Supprimer l’archive"
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
          Confirmez-vous la suppression de l’archive{' '}
          <span className="font-semibold text-ink">{deleteTarget?.cote_archive}</span> ? Le courrier
          lié sera désarchivé.
        </p>
      </Modal>
    </div>
  )
}
