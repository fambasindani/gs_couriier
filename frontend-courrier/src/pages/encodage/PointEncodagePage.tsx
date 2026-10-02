import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive, Eye, FileSpreadsheet, Plus, RefreshCw, Search, Send, Share2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge, StatutBadge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { courriersService, type CourrierListParams } from '@/services/courriers.service'
import { useReferentiels } from '@/hooks/useReferentiels'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import type { Courrier, Paginated } from '@/types'

const PER_PAGE = 20

const VUES = [
  { value: 'ENREGISTRE', label: 'À encoder / dispatcher (Enregistré)' },
  { value: 'AFFECTE', label: 'Affectés (en attente de traitement)' },
  { value: 'EN_COURS', label: 'En cours de traitement' },
  { value: 'TRAITE', label: 'Prêts à archiver (Traité)' },
  { value: 'VALIDE', label: 'Prêts à archiver (Validé)' },
  { value: 'CLOTURE', label: 'Prêts à archiver (Clôturé)' },
  { value: '', label: 'Tous les statuts' },
]

export function PointEncodagePage() {
  const referentiels = useReferentiels()
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const canCreate = hasPermission('courriers.create')
  const canDispatch = hasPermission('courriers.affecter')

  const [vue, setVue] = useState('ENREGISTRE')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<Courrier> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const statutId = useMemo(() => {
    if (!vue) return undefined
    return referentiels.statuts.find((s) => s.code === vue)?.id
  }, [vue, referentiels.statuts])

  const params = useMemo<CourrierListParams>(
    () => ({
      statut_id: statutId,
      search: search || undefined,
      page,
      per_page: PER_PAGE,
    }),
    [statutId, search, page],
  )

  useEffect(() => {
    setPage(1)
  }, [vue, search])

  useEffect(() => {
    if (vue && !statutId) return
    let active = true
    setLoading(true)
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
  }, [params, statutId, vue, reloadKey])

  // Rafraîchissement automatique (temps réel)
  useEffect(() => {
    const timer = setInterval(() => { if (document.visibilityState === 'visible') setReloadKey((value) => value + 1) }, 30000)
    return () => clearInterval(timer)
  }, [])

  const archivable = (code?: string | null) =>
    code === 'TRAITE' || code === 'VALIDE' || code === 'CLOTURE'

  return (
    <div>
      <PageHeader
        title="Point d'encodage"
        subtitle="Enregistrer, dispatcher et archiver le courrier depuis un point central."
        actions={
          <>
            <Button
              variant="outline"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => setReloadKey((v) => v + 1)}
            >
              Actualiser
            </Button>
            {canCreate && (
              <Link to="/courriers/nouveau">
                <Button icon={<Plus className="h-4 w-4" />}>Enregistrer un courrier</Button>
              </Link>
            )}
          </>
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
                placeholder="Rechercher (matricule, objet, expéditeur)..."
                className="w-full border-none bg-transparent py-2 text-[0.85rem] outline-none"
              />
            </div>
          </div>
          <Select value={vue} onChange={(event) => setVue(event.target.value)}>
            {VUES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="mt-5 p-4">
        <div className="mb-3 flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          <h6 className="section-title mb-0">File de travail du bureau du courrier</h6>
        </div>

        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Type</th>
                <th>Objet</th>
                <th>Expéditeur</th>
                <th>Réception</th>
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
                      icon={<FileSpreadsheet className="h-6 w-6" />}
                      title="Rien à traiter ici"
                      description="Aucun courrier pour cette vue. Créez-en un avec « Enregistrer un courrier »."
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
                    <td className="max-w-[240px]">{courrier.objet}</td>
                    <td className="text-slate-600">{courrier.expediteur?.nom ?? '—'}</td>
                    <td>{formatDate(courrier.date_reception)}</td>
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
                        {canDispatch && courrier.statut?.code === 'ENREGISTRE' && (
                          <Link
                            to={`/traitement/affectations?courrier_id=${courrier.id}`}
                            className="rounded-md border border-line bg-white p-1.5 text-info hover:bg-info/5"
                            title="Dispatcher (affecter)"
                          >
                            <Send className="h-4 w-4" />
                          </Link>
                        )}
                        {archivable(courrier.statut?.code) && (
                          <Link
                            to={`/courriers/${courrier.id}`}
                            className="rounded-md border border-line bg-white p-1.5 text-warning hover:bg-warning/5"
                            title="Archiver (depuis le détail)"
                          >
                            <Archive className="h-4 w-4" />
                          </Link>
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

      <div className="mt-4 flex items-center gap-2 text-[0.75rem] text-slate-400">
        <Share2 className="h-3.5 w-3.5" />
        Circuit : encodage → dispatching (affectation) → traitement → validation → archivage.
        <Badge tone="info">Temps réel : rafraîchissement 10 s</Badge>
      </div>
    </div>
  )
}