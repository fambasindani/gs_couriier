import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, RefreshCw, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { TimelineSkeleton } from '@/components/ui/Skeletons'
import { dashboardService } from '@/services/dashboard.service'
import { formatDate } from '@/lib/utils'
import { eventMeta } from '@/lib/events'
import { mockActivite } from '@/data/mock'
import type { ActiviteLog } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const LIMITS = [10, 25, 50]

export function DashboardActivitePage() {
  const [logs, setLogs] = useState<ActiviteLog[]>([])
  const [limit, setLimit] = useState(25)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        if (USE_MOCK) {
          await new Promise((resolve) => setTimeout(resolve, 250))
          if (active) setLogs(mockActivite)
        } else {
          const result = await dashboardService.activiteRecente(limit)
          if (active) setLogs(result)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Erreur de chargement de l'activité.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [limit, reloadKey])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return logs
    return logs.filter((log) => {
      const haystack = `${log.event} ${log.user?.name ?? ''} ${log.url ?? ''}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [logs, query])

  return (
    <div>
      <PageHeader
        title="Activité récente"
        subtitle="Journal chronologique des actions réalisées sur la plateforme."
        actions={
          <Button
            variant="outline"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={() => setReloadKey((value) => value + 1)}
          >
            Actualiser
          </Button>
        }
      />

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filtres */}
      <Card className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-white px-3 md:max-w-md">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtrer par événement, utilisateur, URL..."
            className="w-full border-none bg-transparent py-2 text-[0.85rem] outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-[0.82rem] text-slate-500">
          <span>Entrées :</span>
          <select
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="rounded-lg border border-line bg-white px-3 py-2 text-[0.82rem] outline-none focus:border-primary"
          >
            {LIMITS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="mt-5 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h6 className="section-title mb-0">Chronologie</h6>
          <span className="text-[0.78rem] text-slate-400">
            {loading ? 'Chargement…' : `${filtered.length} entrée(s)`}
          </span>
        </div>

        {loading ? (
          <TimelineSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-[0.85rem] text-slate-400">
            Aucune activité à afficher.
          </p>
        ) : (
        <ol className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-line">
          {filtered.map((log) => {
            const meta = eventMeta(log.event)
            const ItemIcon = meta.icon
            return (
              <li key={log.id} className="relative flex gap-4">
                <span
                  className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-line bg-white"
                  style={{ color: meta.color }}
                >
                  <ItemIcon className="h-4 w-4" />
                </span>
                <div className="flex-1 rounded-xl border border-line bg-white px-4 py-3 transition-colors hover:bg-slate-50/60">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{meta.label}</span>
                      <span className="rounded-md bg-surface px-2 py-0.5 font-mono text-[0.7rem] text-slate-500">
                        {log.event}
                      </span>
                    </div>
                    <span className="text-[0.75rem] text-slate-400">{log.date_humaine}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.78rem] text-slate-500">
                    <span className="font-medium">{log.user?.name ?? 'Système'}</span>
                    <span>{formatDate(log.date, true)}</span>
                    {log.url && (
                      <span className="max-w-full truncate font-mono text-[0.72rem] text-slate-400">
                        {log.url}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
        )}
      </Card>
    </div>
  )
}
