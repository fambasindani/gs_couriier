import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Clock, Layers, RefreshCw, ShieldAlert, TrendingUp } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { ChartSkeleton, ListSkeleton, StatCardSkeleton } from '@/components/ui/Skeletons'
import { dashboardService } from '@/services/dashboard.service'
import { mockStatistiques } from '@/data/mock'
import type { DashboardStatistiques } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid #e5e5e5',
  boxShadow: '0 12px 30px -12px rgba(0,0,0,0.25)',
  fontSize: 12,
  padding: '8px 12px',
}

const TYPE_COLORS: Record<string, string> = {
  ENTRANT: '#000091',
  SORTANT: '#18753c',
  INTERNE: '#0063cb',
}

const STATUT_COLORS: Record<string, string> = {
  ENREGISTRE: '#94a3b8',
  AFFECTE: '#0063cb',
  EN_COURS: '#000091',
  TRAITE: '#18753c',
  VALIDE: '#16a34a',
  CLOTURE: '#0d9488',
  REJETE: '#ce0500',
  ARCHIVE: '#6a6af4',
}

const PRIORITE_COLORS: Record<number, string> = {
  1: '#94a3b8',
  2: '#0063cb',
  3: '#b34000',
  4: '#ce0500',
}

const CONFIDENTIALITE_COLORS: Record<string, string> = {
  PUBLIC: '#94a3b8',
  INTERNE: '#b34000',
  CONFIDENTIEL: '#ce0500',
  TRES_CONFIDENTIEL: '#7f1d1d',
}

function nf(value?: number | null): string {
  return (value ?? 0).toLocaleString('fr-FR')
}

export function DashboardStatistiquesPage() {
  const [data, setData] = useState<DashboardStatistiques | null>(null)
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
          await new Promise((resolve) => setTimeout(resolve, 700))
          if (active) setData(mockStatistiques)
        } else {
          const result = await dashboardService.statistiques()
          if (active) setData(result)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Erreur de chargement des statistiques.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [reloadKey])

  const totalCourriers = useMemo(
    () => (data ? data.par_type.reduce((sum, item) => sum + item.total, 0) : 0),
    [data],
  )

  const typeDominant = useMemo(() => {
    if (!data || data.par_type.length === 0) return null
    return [...data.par_type].sort((a, b) => b.total - a.total)[0]
  }, [data])

  const confidentialiteDominante = useMemo(() => {
    if (!data || data.par_confidentialite.length === 0) return null
    return [...data.par_confidentialite].sort((a, b) => b.total - a.total)[0]
  }, [data])

  const totalStatuts = useMemo(
    () => (data ? data.par_statut.reduce((sum, item) => sum + item.total, 0) : 0),
    [data],
  )

  const maxCategorie = useMemo(
    () => (data ? Math.max(...data.par_categorie.map((item) => item.total), 1) : 1),
    [data],
  )

  return (
    <div>
      <PageHeader
        title="Statistiques détaillées"
        subtitle="Analyse du courrier par type, statut, priorité, catégorie et confidentialité."
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

      {/* KPI */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            <StatCard
              title="Total Courriers"
              value={nf(totalCourriers)}
              tone="primary"
              icon={<Layers className="h-6 w-6" />}
              hint={<span className="text-slate-500">Toutes catégories confondues</span>}
            />
            <StatCard
              title="Délai Moyen de Traitement"
              value={`${data?.delai_moyen_traitement_jours ?? 0} j`}
              tone="info"
              icon={<Clock className="h-6 w-6" />}
              hint={
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <TrendingUp className="h-3.5 w-3.5" /> Réception → clôture
                </span>
              }
            />
            <StatCard
              title="Type le Plus Fréquent"
              value={typeDominant?.libelle ?? '—'}
              tone="success"
              icon={<Layers className="h-6 w-6" />}
              hint={<span className="text-slate-500">{nf(typeDominant?.total)} courriers</span>}
            />
            <StatCard
              title="Confidentialité Dominante"
              value={confidentialiteDominante?.confidentialite ?? '—'}
              tone="warning"
              icon={<ShieldAlert className="h-6 w-6" />}
              hint={
                <span className="text-slate-500">
                  {nf(confidentialiteDominante?.total)} courriers
                </span>
              }
            />
          </>
        )}
      </div>

      {/* Type + Statut */}
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <h6 className="section-title">Répartition par Type de Courrier</h6>
          {loading ? (
            <ChartSkeleton height={280} />
          ) : (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.par_type ?? []}
                  margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="#eef0f5" />
                  <XAxis
                    dataKey="libelle"
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    width={40}
                    allowDecimals={false}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <Tooltip cursor={{ fill: 'rgba(0,0,145,0.04)' }} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={54}>
                    {(data?.par_type ?? []).map((item) => (
                      <Cell
                        key={item.code ?? item.libelle ?? ''}
                        fill={TYPE_COLORS[item.code ?? ''] ?? '#000091'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h6 className="section-title">Répartition par Statut</h6>
          {loading ? (
            <ChartSkeleton height={300} />
          ) : (data?.par_statut.length ?? 0) === 0 ? (
            <p className="py-16 text-center text-[0.85rem] text-slate-400">Aucune donnée.</p>
          ) : (
            <>
              <div className="relative" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.par_statut ?? []}
                      dataKey="total"
                      nameKey="libelle"
                      innerRadius={58}
                      outerRadius={90}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {(data?.par_statut ?? []).map((item) => (
                        <Cell
                          key={item.code ?? item.libelle ?? ''}
                          fill={STATUT_COLORS[item.code ?? ''] ?? '#000091'}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-ink">{nf(totalStatuts)}</span>
                  <span className="text-[0.72rem] uppercase tracking-wide text-slate-400">
                    Statuts
                  </span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                {(data?.par_statut ?? []).map((item) => (
                  <div
                    key={item.code ?? item.libelle ?? ''}
                    className="flex items-center justify-between text-[0.78rem]"
                  >
                    <span className="flex items-center gap-2 text-slate-600">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: STATUT_COLORS[item.code ?? ''] ?? '#000091' }}
                      />
                      {item.libelle}
                    </span>
                    <span className="font-semibold text-ink">{nf(item.total)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Priorité + Confidentialité */}
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h6 className="section-title">Répartition par Priorité</h6>
          {loading ? (
            <ChartSkeleton height={260} />
          ) : (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.par_priorite ?? []}
                  layout="vertical"
                  margin={{ top: 4, right: 18, left: 12, bottom: 4 }}
                >
                  <CartesianGrid horizontal={false} stroke="#eef0f5" />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="libelle"
                    width={80}
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    tick={{ fill: '#64748b' }}
                  />
                  <Tooltip cursor={{ fill: 'rgba(0,0,145,0.04)' }} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={18}>
                    {(data?.par_priorite ?? []).map((item) => (
                      <Cell
                        key={item.code ?? item.libelle ?? ''}
                        fill={PRIORITE_COLORS[item.niveau ?? 0] ?? '#000091'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h6 className="section-title">Répartition par Confidentialité</h6>
          {loading ? (
            <ChartSkeleton height={260} />
          ) : (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.par_confidentialite ?? []}
                  margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="#eef0f5" />
                  <XAxis
                    dataKey="confidentialite"
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    width={40}
                    allowDecimals={false}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <Tooltip cursor={{ fill: 'rgba(0,0,145,0.04)' }} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={44}>
                    {(data?.par_confidentialite ?? []).map((item) => (
                      <Cell
                        key={item.confidentialite}
                        fill={CONFIDENTIALITE_COLORS[item.confidentialite] ?? '#000091'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Catégories */}
      <div className="mt-6">
        <Card className="p-5">
          <h6 className="section-title">Courriers par Catégorie</h6>
          {loading ? (
            <ListSkeleton rows={6} />
          ) : (
            <div className="space-y-3">
              {(data?.par_categorie ?? []).map((item) => (
                <div key={item.libelle ?? 'non-classe'}>
                  <div className="mb-1 flex items-center justify-between text-[0.82rem]">
                    <span className="font-medium text-ink">{item.libelle ?? 'Non classé'}</span>
                    <span className="font-semibold text-slate-500">{nf(item.total)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(4, (item.total / maxCategorie) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {(data?.par_categorie.length ?? 0) === 0 && (
                <p className="py-8 text-center text-[0.85rem] text-slate-400">Aucune donnée.</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
