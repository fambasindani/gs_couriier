import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, GitBranch, Link2, Search, Undo2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatutBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { TableBodySkeleton, TimelineSkeleton } from '@/components/ui/Skeletons'
import { courriersService, type RechercheParams } from '@/services/courriers.service'
import { useDebounce } from '@/lib/useDebounce'
import { formatDate } from '@/lib/utils'
import type { Courrier, CourrierLies, Paginated } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const PER_PAGE = 15

export function CourriersLiesPage() {
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<Courrier> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selected, setSelected] = useState<Courrier | null>(null)
  const [lies, setLies] = useState<CourrierLies | null>(null)
  const [liesLoading, setLiesLoading] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [debounced])

  const params = useMemo<RechercheParams>(
    () => ({ q: debounced || undefined, avec_reponses: true, page, per_page: PER_PAGE }),
    [debounced, page],
  )

  useEffect(() => {
    let active = true
    setLoading(true)

    if (USE_MOCK) {
      setData({ current_page: 1, data: [], last_page: 1, per_page: PER_PAGE, total: 0, from: 0, to: 0 })
      setLoading(false)
      return
    }

    courriersService
      .rechercheAvancee(params)
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
  }, [params])

  const openLinks = async (courrier: Courrier) => {
    setSelected(courrier)
    setLies(null)
    setLiesLoading(true)
    try {
      const res = await courriersService.lies(courrier.id)
      setLies(res.data)
    } catch {
      setLies(null)
    } finally {
      setLiesLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Réponses liées"
        subtitle="Courriers faisant l'objet de réponses ou rattachés à un courrier parent."
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
            placeholder="Rechercher un courrier lié..."
            className="w-full border-none bg-transparent py-2 text-[0.85rem] outline-none"
          />
        </div>
      </Card>

      <Card className="mt-5 p-4">
        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Objet</th>
                <th>Expéditeur</th>
                <th>Réception</th>
                <th>Statut</th>
                <th className="text-right">Liens</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={8} cols={6} />}
              {!loading && (data?.data.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<GitBranch className="h-6 w-6" />}
                      title="Aucun courrier lié"
                      description="Aucun courrier ne possède de réponse pour le moment."
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
                    <td className="max-w-[300px]">{courrier.objet}</td>
                    <td>{courrier.expediteur?.nom ?? '—'}</td>
                    <td>{formatDate(courrier.date_reception)}</td>
                    <td>
                      <StatutBadge code={courrier.statut?.code} libelle={courrier.statut?.libelle} />
                    </td>
                    <td className="text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => void openLinks(courrier)}
                          className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1.5 text-[0.78rem] font-medium text-primary hover:bg-primary/5"
                        >
                          <Link2 className="h-3.5 w-3.5" /> Voir les liens
                        </button>
                        <Link
                          to={`/courriers/${courrier.id}`}
                          className="rounded-md border border-line bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                          title="Consulter"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
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
        open={Boolean(selected)}
        title={`Courriers liés — ${selected?.numero ?? ''}`}
        onClose={() => {
          setSelected(null)
          setLies(null)
        }}
        footer={
          <button
            onClick={() => {
              setSelected(null)
              setLies(null)
            }}
            className="rounded-lg border border-line bg-white px-4 py-2 text-[0.82rem] font-medium hover:bg-slate-50"
          >
            Fermer
          </button>
        }
      >
        {liesLoading ? (
          <TimelineSkeleton rows={4} />
        ) : !lies ? (
          <p className="text-[0.85rem] text-slate-400">Aucune information de liaison.</p>
        ) : (
          <div className="space-y-5">
            <div>
              <span className="mb-2 block text-[0.75rem] font-semibold uppercase tracking-wide text-slate-400">
                Courrier parent
              </span>
              {lies.parent ? (
                <Link
                  to={`/courriers/${lies.parent.id}`}
                  className="flex items-center gap-2 rounded-lg border border-line p-3 hover:bg-slate-50"
                >
                  <Undo2 className="h-4 w-4 text-primary" />
                  <span>
                    <span className="block text-[0.83rem] font-semibold text-primary">
                      {lies.parent.numero}
                    </span>
                    <span className="block text-[0.78rem] text-slate-500">{lies.parent.objet}</span>
                  </span>
                </Link>
              ) : (
                <p className="text-[0.83rem] text-slate-400">Aucun parent (courrier racine).</p>
              )}
            </div>

            <div>
              <span className="mb-2 block text-[0.75rem] font-semibold uppercase tracking-wide text-slate-400">
                Réponses ({lies.total_reponses})
              </span>
              {lies.reponses.length === 0 ? (
                <p className="text-[0.83rem] text-slate-400">Aucune réponse.</p>
              ) : (
                <ul className="space-y-2">
                  {lies.reponses.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={`/courriers/${item.id}`}
                        className="flex items-center justify-between gap-2 rounded-lg border border-line p-3 hover:bg-slate-50"
                      >
                        <span>
                          <span className="block text-[0.83rem] font-semibold text-primary">
                            {item.numero}
                          </span>
                          <span className="block text-[0.78rem] text-slate-500">{item.objet}</span>
                        </span>
                        <StatutBadge code={item.statut?.code} libelle={item.statut?.libelle} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
