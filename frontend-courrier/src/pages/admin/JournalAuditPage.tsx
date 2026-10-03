import { useEffect, useState } from 'react'
import { Eye, RotateCcw, ScrollText, Search, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { auditService } from '@/services/admin.service'
import { useDebounce } from '@/lib/useDebounce'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import type { AuditLog, Paginated } from '@/types'

const PER_PAGE = 15
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export function JournalAuditPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const canDelete = hasPermission('audit.delete')

  const [event, setEvent] = useState('')
  const debouncedEvent = useDebounce(event)
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<AuditLog> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [detail, setDetail] = useState<AuditLog | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AuditLog | null>(null)

  useEffect(() => {
    setPage(1)
  }, [debouncedEvent, dateDebut, dateFin])

  useEffect(() => {
    let active = true
    setLoading(true)

    if (USE_MOCK) {
      setData({ current_page: 1, data: [], last_page: 1, per_page: PER_PAGE, total: 0, from: 0, to: 0 })
      setLoading(false)
      return
    }

    auditService
      .list({
        event: debouncedEvent || undefined,
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
        page,
        per_page: PER_PAGE,
      })
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
  }, [debouncedEvent, dateDebut, dateFin, page, reloadKey])

  const refresh = () => setReloadKey((value) => value + 1)

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await auditService.remove(deleteTarget.id)
      setDeleteTarget(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Journal d'audit"
        subtitle="Traçabilité des actions réalisées sur la plateforme."
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
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                placeholder="Filtrer par événement..."
                className="w-full border-none bg-transparent py-2 text-[0.85rem] outline-none"
              />
            </div>
          </div>
          <Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
          <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={() => {
              setEvent('')
              setDateDebut('')
              setDateFin('')
            }}
          >
            Réinitialiser
          </Button>
        </div>
      </Card>

      <Card className="mt-5 p-4">
        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Utilisateur</th>
                <th>Événement</th>
                <th>URL</th>
                <th>IP</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={10} cols={6} />}
              {!loading && (data?.data.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<ScrollText className="h-6 w-6" />}
                      title="Aucun log"
                      description="Les actions journalisées apparaîtront ici."
                    />
                  </td>
                </tr>
              )}
              {!loading &&
                data?.data.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.created_at, true)}</td>
                    <td>{log.user?.name ?? 'Système'}</td>
                    <td>
                      <code className="rounded bg-surface px-2 py-0.5 font-mono text-[0.72rem] text-slate-600">
                        {log.event}
                      </code>
                    </td>
                    <td className="max-w-[280px] truncate text-slate-500">{log.url ?? '—'}</td>
                    <td className="font-mono text-[0.75rem] text-slate-500">{log.ip_address ?? '—'}</td>
                    <td className="text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => setDetail(log)}
                          className="rounded-md border border-line bg-white p-1.5 text-primary hover:bg-primary/5"
                          title="Détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => setDeleteTarget(log)}
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
        open={Boolean(detail)}
        title="Détail du log"
        onClose={() => setDetail(null)}
        footer={
          <Button variant="outline" onClick={() => setDetail(null)}>
            Fermer
          </Button>
        }
      >
        {detail && (
          <dl className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Événement">
              <code className="text-[0.82rem]">{detail.event}</code>
            </Field>
            <Field label="Utilisateur">
              <span className="text-[0.85rem]">{detail.user?.name ?? 'Système'}</span>
            </Field>
            <Field label="Date">
              <span className="text-[0.85rem]">{formatDate(detail.created_at, true)}</span>
            </Field>
            <Field label="Adresse IP">
              <span className="font-mono text-[0.82rem]">{detail.ip_address ?? '—'}</span>
            </Field>
            <div className="md:col-span-2">
              <Field label="URL">
                <span className="break-all font-mono text-[0.78rem] text-slate-600">
                  {detail.url ?? '—'}
                </span>
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="User agent">
                <span className="break-all text-[0.78rem] text-slate-500">
                  {detail.user_agent ?? '—'}
                </span>
              </Field>
            </div>
          </dl>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer le log"
        tone="danger"
        confirmLabel="Supprimer"
        message={<p>Confirmez-vous la suppression de cette entrée du journal ?</p>}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
