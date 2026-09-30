import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Eye, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { StatutBadge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { courriersService, type CourrierListParams } from '@/services/courriers.service'
import { useReferentiels } from '@/hooks/useReferentiels'
import { formatDate } from '@/lib/utils'
import type { Courrier, Paginated } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const PER_PAGE = 15

export function CourriersRetardPage() {
  const referentiels = useReferentiels()
  const [prioriteId, setPrioriteId] = useState('')
  const [typeId, setTypeId] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<Courrier> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    setPage(1)
  }, [prioriteId, typeId])

  const params = useMemo<CourrierListParams>(
    () => ({
      priorite_id: prioriteId || undefined,
      type_courrier_id: typeId || undefined,
      page,
      per_page: PER_PAGE,
    }),
    [prioriteId, typeId, page],
  )

  useEffect(() => {
    let active = true
    setLoading(true)

    if (USE_MOCK) {
      setData({
        current_page: 1,
        data: [],
        last_page: 1,
        per_page: PER_PAGE,
        total: 0,
        from: 0,
        to: 0,
      })
      setLoading(false)
      return
    }

    courriersService
      .enRetard(params)
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

  return (
    <div>
      <PageHeader
        title="Courriers en retard"
        subtitle="Courriers dont la date limite est dépassée et qui ne sont pas clôturés."
        actions={
          <Button
            variant="outline"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={() => setReloadKey((value) => value + 1)}
          >
            Actualiser
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          {error}
        </div>
      )}

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Select value={typeId} onChange={(event) => setTypeId(event.target.value)}>
            <option value="">Tous les types</option>
            {referentiels.types.map((item) => (
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
        </div>
      </Card>

      <Card className="mt-5 p-4">
        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Expéditeur</th>
                <th>Objet</th>
                <th>Date limite</th>
                <th>Retard</th>
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
                      icon={<CalendarClock className="h-6 w-6" />}
                      title="Aucun courrier en retard"
                      description="Tous les courriers sont dans les délais."
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
                    <td>{courrier.expediteur?.nom ?? '—'}</td>
                    <td className="max-w-[280px]">{courrier.objet}</td>
                    <td>{formatDate(courrier.date_limite, true)}</td>
                    <td>
                      <span className="inline-flex items-center rounded-md bg-danger/10 px-2 py-1 text-[0.72rem] font-semibold text-danger">
                        {courrier.jours_retard ?? 0} j
                      </span>
                    </td>
                    <td>
                      <StatutBadge code={courrier.statut?.code} libelle={courrier.statut?.libelle} />
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/courriers/${courrier.id}`}
                        className="inline-flex rounded-md border border-line bg-white p-1.5 text-primary hover:bg-primary/5"
                        title="Consulter"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
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
    </div>
  )
}
