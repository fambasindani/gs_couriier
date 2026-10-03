import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, CircleDot, Route, Workflow } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { TimelineSkeleton } from '@/components/ui/Skeletons'
import { CourrierPicker } from '@/components/courriers/CourrierPicker'
import { circuitService } from '@/services/traitement.service'
import { eventMeta } from '@/lib/events'
import { formatDate } from '@/lib/utils'
import type { CircuitData, Courrier, EtapeActuelle } from '@/types'

export function CircuitPage() {
  const [courrier, setCourrier] = useState<Courrier | null>(null)
  const [circuit, setCircuit] = useState<CircuitData | null>(null)
  const [etape, setEtape] = useState<EtapeActuelle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courrier) {
      setCircuit(null)
      setEtape(null)
      return
    }
    let active = true
    setLoading(true)
    setError(null)

    Promise.all([
      circuitService.get(courrier.id),
      circuitService.etapeActuelle(courrier.id).catch(() => null),
    ])
      .then(([circuitRes, etapeRes]) => {
        if (!active) return
        setCircuit(circuitRes.data)
        setEtape(etapeRes?.data ?? null)
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Erreur de chargement du circuit.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [courrier])

  return (
    <div>
      <PageHeader
        title="Circuit de traitement"
        subtitle="Reconstituez le parcours complet d'un courrier, étape par étape."
      />

      <Card className="p-4">
        <div className="md:max-w-xl">
          <CourrierPicker
            value={courrier}
            onChange={setCourrier}
            placeholder="Sélectionner un courrier pour voir son circuit..."
          />
        </div>
      </Card>

      {error && (
        <div className="mt-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          {error}
        </div>
      )}

      {!courrier && (
        <Card className="mt-5 p-5">
          <EmptyState
            icon={<Route className="h-6 w-6" />}
            title="Aucun courrier sélectionné"
            description="Recherchez un courrier ci-dessus pour afficher son circuit de traitement."
          />
        </Card>
      )}

      {courrier && loading && (
        <Card className="mt-5 p-5">
          <TimelineSkeleton rows={5} />
        </Card>
      )}

      {courrier && !loading && circuit && (
        <>
          {/* En-tête courrier */}
          <Card className="mt-5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link
                  to={`/courriers/${circuit.courrier.id}`}
                  className="text-[1.05rem] font-bold text-primary hover:underline"
                >
                  {circuit.courrier.numero}
                </Link>
                <p className="mt-0.5 text-[0.88rem] text-slate-600">{circuit.courrier.objet}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {circuit.courrier.statut_actuel && (
                  <Badge tone="primary">{circuit.courrier.statut_actuel}</Badge>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[0.75rem] font-semibold text-slate-600">
                  <Workflow className="h-3.5 w-3.5" /> {circuit.total_etapes} étape(s)
                </span>
              </div>
            </div>
          </Card>

          {/* Étape actuelle */}
          <Card className="mt-5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h6 className="section-title mb-0">Étape actuelle</h6>
            </div>
            {etape ? (
              <div className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
                <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CircleDot className="h-4 w-4" />
                </span>
                <div>
                  <span className="block text-[0.9rem] font-semibold text-ink">
                    {etape.etape ?? etape.action}
                  </span>
                  {etape.description && (
                    <p className="mt-0.5 text-[0.83rem] text-slate-600">{etape.description}</p>
                  )}
                  <span className="mt-1 block text-[0.75rem] text-slate-400">
                    {etape.user ?? 'Système'}
                    {etape.direction ? ` — ${etape.direction}` : ''} • {formatDate(etape.date, true)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[0.83rem] text-slate-400">Aucune étape enregistrée.</p>
            )}
          </Card>

          {/* Timeline complète */}
          <Card className="mt-5 p-5">
            <h6 className="section-title">Parcours complet</h6>
            {(circuit.etapes ?? []).length === 0 ? (
              <p className="text-[0.83rem] text-slate-400">Aucune étape enregistrée.</p>
            ) : (
              <ol className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-line">
                {(circuit.etapes ?? []).map((item) => {
                  const meta = eventMeta(item.action)
                  const ItemIcon = meta.icon
                  return (
                    <li key={item.id} className="relative flex gap-4">
                      <span
                        className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-line bg-white"
                        style={{ color: meta.color }}
                      >
                        <ItemIcon className="h-4 w-4" />
                      </span>
                      <div className="flex-1 rounded-xl border border-line bg-white px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <span className="text-[0.85rem] font-semibold text-ink">
                              {item.etape ?? meta.label}
                            </span>
                            <span className="rounded-md bg-surface px-2 py-0.5 font-mono text-[0.68rem] text-slate-500">
                              {item.action}
                            </span>
                          </span>
                          <span className="text-[0.75rem] text-slate-400">
                            {formatDate(item.date, true)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="mt-1 text-[0.8rem] text-slate-600">{item.description}</p>
                        )}
                        <span className="mt-1 block text-[0.75rem] text-slate-400">
                          {item.user?.name ?? 'Système'}
                          {item.direction ? ` — ${item.direction}` : ''}
                          {item.adresse_ip ? ` • ${item.adresse_ip}` : ''}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
