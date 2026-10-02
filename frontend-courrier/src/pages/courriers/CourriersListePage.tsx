import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Archive, Eye, FileText, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { ConfidentialiteBadge, StatutBadge } from '@/components/ui/Badge'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { courriersService, type CourrierListParams } from '@/services/courriers.service'
import { useReferentiels } from '@/hooks/useReferentiels'
import { useDebounce } from '@/lib/useDebounce'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { mockCourrierPage } from '@/data/mock'
import type { Courrier, Paginated } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const PER_PAGE = 15

const TITLES: Record<string, string> = {
  ENTRANT: 'Courriers externes entrants',
  SORTANT: 'Courriers externes sortants',
  INT_ENTRANT: 'Courriers internes entrants',
  INT_SORTANT: 'Courriers internes sortants',
}

export function CourriersListePage() {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') ?? undefined
  const referentiels = useReferentiels()
  const hasPermission = useAuthStore((state) => state.hasPermission)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [statutId, setStatutId] = useState('')
  const [prioriteId, setPrioriteId] = useState('')
  const [categorieId, setCategorieId] = useState('')
  const [confidentialite, setConfidentialite] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [page, setPage] = useState(1)

  const [data, setData] = useState<Paginated<Courrier> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [archiveTarget, setArchiveTarget] = useState<Courrier | null>(null)
  const [archiveForm, setArchiveForm] = useState({ duree: '5', observation: '' })
  const [deleteTarget, setDeleteTarget] = useState<Courrier | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const typeId = useMemo(() => {
    if (!type) return undefined
    return referentiels.types.find((item) => item.code === type)?.id
  }, [type, referentiels.types])

  // Retour à la page 1 dès qu'un filtre change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statutId, prioriteId, categorieId, confidentialite, dateDebut, dateFin, type])

  const params = useMemo<CourrierListParams>(
    () => ({
      search: debouncedSearch || undefined,
      statut_id: statutId || undefined,
      priorite_id: prioriteId || undefined,
      categorie_id: categorieId || undefined,
      confidentialite: confidentialite || undefined,
      date_debut: dateDebut || undefined,
      date_fin: dateFin || undefined,
      type_courrier_id: typeId,
      page,
      per_page: PER_PAGE,
    }),
    [debouncedSearch, statutId, prioriteId, categorieId, confidentialite, dateDebut, dateFin, typeId, page],
  )

  useEffect(() => {
    if (type && referentiels.loading) return

    let active = true
    setLoading(true)

    if (USE_MOCK) {
      setData(mockCourrierPage)
      setError(null)
      setLoading(false)
      return
    }

    courriersService
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
  }, [params, type, referentiels.loading, reloadKey])

  const resetFilters = () => {
    setSearch('')
    setStatutId('')
    setPrioriteId('')
    setCategorieId('')
    setConfidentialite('')
    setDateDebut('')
    setDateFin('')
  }

  const handleArchive = async () => {
    if (!archiveTarget) return
    setActionError(null)
    try {
      await courriersService.archiver(archiveTarget.id, {
        duree_conservation_ans: archiveForm.duree ? Number(archiveForm.duree) : null,
        observation: archiveForm.observation || null,
      })
      setArchiveTarget(null)
      setArchiveForm({ duree: '5', observation: '' })
      setReloadKey((value) => value + 1)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erreur lors de l'archivage.")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionError(null)
    try {
      await courriersService.remove(deleteTarget.id)
      setDeleteTarget(null)
      setReloadKey((value) => value + 1)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  const title = type ? (TITLES[type] ?? 'Courriers') : 'Tous les courriers'

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={`${data?.total ?? 0} courrier(s) — suivi et gestion du cycle de vie.`}
        actions={
          hasPermission('courriers.create') ? (
            <Link to="/courriers/nouveau">
              <Button icon={<Plus className="h-4 w-4" />}>Enregistrer un courrier</Button>
            </Link>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          {error}
        </div>
      )}

      {/* Filtres */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher (numéro, référence, objet, contenu)..."
                className="w-full border-none bg-transparent py-2 text-[0.85rem] outline-none"
              />
            </div>
          </div>
          <Select value={statutId} onChange={(event) => setStatutId(event.target.value)}>
            <option value="">Tous les statuts</option>
            {referentiels.statuts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.libelle}
              </option>
            ))}
          </Select>
          <Select value={prioriteId} onChange={(event) => setPrioriteId(event.target.value)}>
            <option value="">Toutes les priorités</option>
            {referentiels.priorites.map((item) => (
              <option key={item.id} value={item.id}>
                {item.libelle}
              </option>
            ))}
          </Select>
          <Select value={categorieId} onChange={(event) => setCategorieId(event.target.value)}>
            <option value="">Toutes les catégories</option>
            {referentiels.categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.libelle}
              </option>
            ))}
          </Select>
          <Select
            value={confidentialite}
            onChange={(event) => setConfidentialite(event.target.value)}
          >
            <option value="">Toutes confidentialités</option>
            <option value="PUBLIC">Public</option>
            <option value="INTERNE">Interne</option>
            <option value="CONFIDENTIEL">Confidentiel</option>
            <option value="TRES_CONFIDENTIEL">Très confidentiel</option>
          </Select>
          <Input
            type="date"
            value={dateDebut}
            onChange={(event) => setDateDebut(event.target.value)}
            title="Reçu à partir du"
          />
          <Input
            type="date"
            value={dateFin}
            onChange={(event) => setDateFin(event.target.value)}
            title="Reçu jusqu'au"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" icon={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            Réinitialiser
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card className="mt-5 p-4">
        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Type</th>
                <th>Expéditeur</th>
                <th>Objet</th>
                <th>Réception</th>
                <th>Limite</th>
                <th>Confidentialité</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={8} cols={9} />}

              {!loading && (data?.data.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      icon={<FileText className="h-6 w-6" />}
                      title="Aucun courrier trouvé"
                      description="Ajustez vos filtres ou enregistrez un nouveau courrier."
                    />
                  </td>
                </tr>
              )}

              {!loading &&
                data?.data.map((courrier) => (
                  <tr key={courrier.id}>
                    <td className="font-semibold text-primary">
                      <Link to={`/courriers/${courrier.id}`} className="hover:underline">
                        {courrier.numero}
                      </Link>
                    </td>
                    <td className="text-slate-500">{courrier.type_courrier?.libelle ?? '—'}</td>
                    <td>
                      <span className="block">{courrier.expediteur?.nom ?? '—'}</span>
                      <span className="text-[0.72rem] text-slate-400">
                        {courrier.reference_externe ?? ''}
                      </span>
                    </td>
                    <td className="max-w-[240px]">{courrier.objet}</td>
                    <td>{formatDate(courrier.date_reception)}</td>
                    <td>{formatDate(courrier.date_limite)}</td>
                    <td>
                      <ConfidentialiteBadge value={courrier.confidentialite} />
                    </td>
                    <td>
                      <StatutBadge code={courrier.statut?.code} libelle={courrier.statut?.libelle} />
                    </td>
                    <td className="text-right">
                      <div className="inline-flex gap-1.5">
                        <Link
                          to={`/courriers/${courrier.id}`}
                          className="rounded-md border border-line bg-white p-1.5 text-primary hover:bg-primary/5"
                          title="Consulter"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {hasPermission('courriers.update') && courrier.statut?.code !== 'ARCHIVE' && (
                          <>
                            <Link
                              to={`/courriers/${courrier.id}/modifier`}
                              className="rounded-md border border-line bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                              title="Modifier"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => setArchiveTarget(courrier)}
                              className="rounded-md border border-line bg-white p-1.5 text-warning hover:bg-warning/5"
                              title="Archiver"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {hasPermission('courriers.delete') && (
                          <button
                            onClick={() => setDeleteTarget(courrier)}
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

      {/* Modal archivage */}
      <Modal
        open={Boolean(archiveTarget)}
        title={`Archiver ${archiveTarget?.numero ?? ''}`}
        onClose={() => setArchiveTarget(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setArchiveTarget(null)}>
              Annuler
            </Button>
            <Button onClick={handleArchive}>Archiver</Button>
          </>
        }
      >
        {actionError && <p className="mb-3 text-[0.82rem] text-danger">{actionError}</p>}
        <div className="space-y-3">
          <Field label="Durée de conservation (années)">
            <Input
              type="number"
              min={1}
              max={100}
              value={archiveForm.duree}
              onChange={(event) => setArchiveForm({ ...archiveForm, duree: event.target.value })}
            />
          </Field>
          <Field label="Observation">
            <Textarea
              value={archiveForm.observation}
              onChange={(event) =>
                setArchiveForm({ ...archiveForm, observation: event.target.value })
              }
            />
          </Field>
        </div>
      </Modal>

      {/* Modal suppression */}
      <Modal
        open={Boolean(deleteTarget)}
        title="Supprimer le courrier"
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
        {actionError && <p className="mb-3 text-[0.82rem] text-danger">{actionError}</p>}
        <p className="text-[0.85rem] text-slate-600">
          Confirmez-vous la suppression définitive du courrier{' '}
          <span className="font-semibold text-ink">{deleteTarget?.numero}</span> ? Cette action est
          irréversible.
        </p>
      </Modal>
    </div>
  )
}
