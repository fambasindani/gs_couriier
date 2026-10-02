import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive, Eye, FileSpreadsheet, Plus, Send, Share2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { courriersService, type CourrierListParams } from '@/services/courriers.service'
import { useReferentiels } from '@/hooks/useReferentiels'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import type { Courrier, Paginated } from '@/types'

const PER_PAGE = 20

export function PointEncodagePage() {
  const referentiels = useReferentiels()
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const canCreate = hasPermission('courriers.create')
  const canDispatch = hasPermission('courriers.affecter')

  const [data, setData] = useState<Paginated<Courrier> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Statut ENREGISTRE (nouveaux courriers à encadrer/dispatcher)
  const statutEnregistreId = useMemo(
    () => referentiels.statuts.find((s) => s.code === 'ENREGISTRE')?.id,
    [referentiels.statuts],
  )

  const params = useMemo<CourrierListParams>(
    () => (statutEnregistreId ? { statut_id: statutEnregistreId, per_page: PER_PAGE } : { per_page: PER_PAGE }),
    [statutEnregistreId],
  )

  useEffect(() => {
    if (!statutEnregistreId) return
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
  }, [params, statutEnregistreId])

  return (
    <div>
      <PageHeader
        title="Point d'encodage"
        subtitle="Enregistrer, dispatcher et archiver le courrier depuis un point central."
        actions={
          canCreate ? (
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

      <Card className="p-4">
        <div className="mb-1 flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          <h6 className="section-title mb-0">Courriers à encoder / dispatcher (Enregistré)</h6>
        </div>
        <p className="text-[0.75rem] text-slate-400">
          Nouveaux courriers entrés dans le système, en attente d'affectation.
        </p>
      </Card>

      <Card className="mt-5 p-4">
        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Type</th>
                <th>Objet</th>
                <th>Expéditeur</th>
                <th>Réception</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={8} cols={6} />}
              {!loading && (data?.data.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<FileSpreadsheet className="h-6 w-6" />}
                      title="Rien à encoder"
                      description="Aucun courrier en attente d'affectation."
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
                    <td className="max-w-[260px]">{courrier.objet}</td>
                    <td className="text-slate-600">{courrier.expediteur?.nom ?? '—'}</td>
                    <td>{formatDate(courrier.date_reception)}</td>
                    <td className="text-right">
                      <div className="inline-flex gap-1.5">
                        <Link
                          to={`/courriers/${courrier.id}`}
                          className="rounded-md border border-line bg-white p-1.5 text-primary hover:bg-primary/5"
                          title="Consulter"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {canDispatch && (
                          <Link
                            to={`/traitement/affectations?courrier_id=${courrier.id}`}
                            className="rounded-md border border-line bg-white p-1.5 text-info hover:bg-info/5"
                            title="Dispatcher (affecter)"
                          >
                            <Send className="h-4 w-4" />
                          </Link>
                        )}
                        {['TRAITE', 'VALIDE', 'CLOTURE'].includes(courrier.statut?.code ?? '') && (
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
      </Card>

      <div className="mt-4 flex items-center gap-2 text-[0.75rem] text-slate-400">
        <Share2 className="h-3.5 w-3.5" />
        Circuit : encodage → dispatching (affectation) → traitement → validation → archivage.
      </div>
    </div>
  )
}