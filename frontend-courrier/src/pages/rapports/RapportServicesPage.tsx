import { useEffect, useState } from 'react'
import { AlertTriangle, Users, Building2, Award } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { PeriodFilter, firstDayOfMonth, today } from '@/components/rapports/PeriodFilter'
import { rapportsService } from '@/services/rapports.service'
import { cn, nf, toFixed1 } from '@/lib/utils'
import type { PerfAgent, PerfUnite, RapportPerformanceAgents, RapportPerformanceServices } from '@/types'

type Tab = 'services' | 'agents'

function UniteTable({ title, rows }: { title: string; rows: PerfUnite[] }) {
  return (
    <div className="mb-5">
      <h6 className="mb-2 text-[0.82rem] font-semibold text-slate-500">{title}</h6>
      <div className="overflow-x-auto">
        <table className="table-custom w-full">
          <thead>
            <tr>
              <th>Unité</th>
              <th>Total</th>
              <th>Traités</th>
              <th>En cours</th>
              <th>Délai moyen</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-slate-400">
                  Aucune donnée.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="font-medium text-ink">{row.libelle}</td>
                <td>{nf(row.total_courriers)}</td>
                <td className="text-success">{nf(row.traites)}</td>
                <td>{row.en_cours === undefined ? '—' : nf(row.en_cours)}</td>
                <td>{row.delai_moyen_jours === null ? '—' : `${toFixed1(row.delai_moyen_jours)} j`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function RapportServicesPage() {
  const [debut, setDebut] = useState(firstDayOfMonth())
  const [fin, setFin] = useState(today())
  const [applied, setApplied] = useState({ debut: firstDayOfMonth(), fin: today() })
  const [tab, setTab] = useState<Tab>('services')

  const [services, setServices] = useState<RapportPerformanceServices | null>(null)
  const [agents, setAgents] = useState<RapportPerformanceAgents | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    Promise.all([
      rapportsService.performanceServices({ date_debut: applied.debut, date_fin: applied.fin }),
      rapportsService.performanceAgents({ date_debut: applied.debut, date_fin: applied.fin }),
    ])
      .then(([s, a]) => {
        if (!active) return
        setServices(s.data)
        setAgents(a.data)
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
  }, [applied])

  return (
    <div>
      <PageHeader
        title="Performance des services"
        subtitle="Activité et délais par direction, département, service et agent."
      />

      <Card className="p-4">
        <PeriodFilter
          debut={debut}
          fin={fin}
          onChange={(d, f) => {
            setDebut(d)
            setFin(f)
          }}
          onApply={() => setApplied({ debut, fin })}
        />
      </Card>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="mt-5 flex gap-1 border-b border-line">
        {(
          [
            { key: 'services', label: 'Services', icon: Building2 },
            { key: 'agents', label: 'Agents', icon: Users },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={cn(
              '-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-[0.85rem] font-medium transition-colors',
              tab === item.key
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-ink',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'services' && (
        <>
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <h6 className="section-title mb-0">Top 5 services</h6>
              </div>
              {loading ? (
                <TableBodySkeleton rows={5} cols={3} />
              ) : (services?.top_5_services.length ?? 0) === 0 ? (
                <p className="text-[0.83rem] text-slate-400">Aucune donnée.</p>
              ) : (
                <ul className="space-y-2">
                  {services?.top_5_services.map((item, index) => (
                    <li key={item.id} className="flex items-center justify-between rounded-lg border border-line p-3">
                      <span className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[0.75rem] font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="text-[0.85rem] font-medium text-ink">{item.libelle}</span>
                      </span>
                      <span className="text-[0.82rem] font-semibold text-slate-600">
                        {nf(item.total_courriers)} courriers
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-danger" />
                <h6 className="section-title mb-0">Services en difficulté (&gt; 7 j)</h6>
              </div>
              {loading ? (
                <TableBodySkeleton rows={3} cols={2} />
              ) : (services?.services_en_difficulte.length ?? 0) === 0 ? (
                <p className="text-[0.83rem] text-slate-400">Aucun service en difficulté.</p>
              ) : (
                <ul className="space-y-2">
                  {services?.services_en_difficulte.map((item) => (
                    <li key={item.id} className="flex items-center justify-between rounded-lg border border-danger/20 bg-danger/5 p-3">
                      <span className="text-[0.85rem] font-medium text-ink">{item.libelle}</span>
                      <span className="text-[0.82rem] font-semibold text-danger">
                        {toFixed1(item.delai_moyen_jours)} j
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card className="mt-5 p-5">
            {loading ? (
              <TableBodySkeleton rows={8} cols={5} />
            ) : (
              <>
                <UniteTable title="Par direction" rows={services?.par_direction ?? []} />
                <UniteTable title="Par département" rows={services?.par_departement ?? []} />
                <UniteTable title="Par service" rows={services?.par_service ?? []} />
              </>
            )}
          </Card>
        </>
      )}

      {tab === 'agents' && (
        <>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="p-5">
                    <TableBodySkeleton rows={2} cols={1} />
                  </Card>
                ))
              : (agents?.top_3_agents ?? []).map((agent: PerfAgent, index: number) => (
                  <Card key={agent.id} className="p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[0.85rem] font-bold text-primary">
                        {index + 1}
                      </span>
                      <div>
                        <span className="block text-[0.88rem] font-semibold text-ink">{agent.name}</span>
                        <span className="text-[0.75rem] text-slate-400">{agent.email}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[0.82rem]">
                      <span className="text-slate-500">Traités</span>
                      <span className="font-semibold text-success">{nf(agent.traites)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[0.82rem]">
                      <span className="text-slate-500">Total</span>
                      <span className="font-semibold text-ink">{nf(agent.total_courriers)}</span>
                    </div>
                  </Card>
                ))}
          </div>

          <Card className="mt-5 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h6 className="section-title mb-0">Détail par agent</h6>
              <span className="text-[0.78rem] text-slate-400">
                {agents?.total_agents_actifs ?? 0} agent(s) actif(s)
              </span>
            </div>
            {loading ? (
              <TableBodySkeleton rows={8} cols={5} />
            ) : (agents?.agents.length ?? 0) === 0 ? (
              <EmptyState icon={<Users className="h-6 w-6" />} title="Aucune donnée agent" />
            ) : (
              <div className="overflow-x-auto">
                <table className="table-custom w-full">
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Email</th>
                      <th>Total</th>
                      <th>Traités</th>
                      <th>En cours</th>
                      <th>Délai moyen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents?.agents.map((agent) => (
                      <tr key={agent.id}>
                        <td className="font-medium text-ink">{agent.name}</td>
                        <td className="text-slate-500">{agent.email}</td>
                        <td>{nf(agent.total_courriers)}</td>
                        <td className="text-success">{nf(agent.traites)}</td>
                        <td>{nf(agent.en_cours)}</td>
                        <td>{agent.delai_moyen_jours === null ? '—' : `${toFixed1(agent.delai_moyen_jours)} j`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
