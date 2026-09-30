import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Eye,
  FileDown,
  Inbox,
  Pencil,
  PieChart as PieChartIcon,
  Plus,
  Send,
  Shuffle,
} from 'lucide-react'
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
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
import { StatCard, TrendHint } from '@/components/ui/StatCard'
import { ConfidentialiteBadge, StatutBadge } from '@/components/ui/Badge'
import { dashboardService } from '@/services/dashboard.service'
import { useAuthStore } from '@/stores/auth.store'
import { formatDate } from '@/lib/utils'
import { eventMeta } from '@/lib/events'
import {
  ChartSkeleton,
  StatCardSkeleton,
  TableBodySkeleton,
  TimelineSkeleton,
} from '@/components/ui/Skeletons'
import { mockActivite, mockCourriers, mockOverview, mockVolume } from '@/data/mock'
import type { ActiviteLog, Courrier, DashboardOverview, VolumeMensuel } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

function nf(value?: number | null): string {
  return (value ?? 0).toLocaleString('fr-FR')
}

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid #e5e5e5',
  boxShadow: '0 12px 30px -12px rgba(0,0,0,0.25)',
  fontSize: 12,
  padding: '8px 12px',
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [volume, setVolume] = useState<VolumeMensuel | null>(null)
  const [recents, setRecents] = useState<Courrier[]>([])
  const [activite, setActivite] = useState<ActiviteLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        if (USE_MOCK) {
          await new Promise((resolve) => setTimeout(resolve, 300))
          if (!active) return
          setOverview(mockOverview)
          setVolume(mockVolume)
          setRecents(mockCourriers)
          setActivite(mockActivite)
        } else {
          const [o, v, c, a] = await Promise.all([
            dashboardService.overview(),
            dashboardService.volumeMensuel(),
            dashboardService.courriersRecents(5),
            dashboardService.activiteRecente(6),
          ])
          if (!active) return
          setOverview(o)
          setVolume(v)
          setRecents(c)
          setActivite(a)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Erreur de chargement du tableau de bord.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const chartData = useMemo(
    () =>
      (volume?.labels ?? []).map((label, index) => ({
        mois: label,
        Entrants: volume?.datasets.entrants[index] ?? 0,
        Sortants: volume?.datasets.sortants[index] ?? 0,
      })),
    [volume],
  )

  const repartition = useMemo(
    () =>
      [
        { name: 'En cours', value: overview?.en_cours ?? 0, color: '#000091' },
        { name: 'Traités', value: overview?.traites ?? 0, color: '#18753c' },
        { name: 'Validés', value: overview?.valides ?? 0, color: '#0063cb' },
        { name: 'Clôturés', value: overview?.clotures ?? 0, color: '#6a6af4' },
        { name: 'En retard', value: overview?.en_retard ?? 0, color: '#ce0500' },
      ].filter((item) => item.value > 0),
    [overview],
  )

  const totalRepartition = useMemo(
    () => repartition.reduce((sum, item) => sum + item.value, 0),
    [repartition],
  )

  const welcomeName = user?.name?.split(' ')[0] ?? 'utilisateur'
  const today = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        subtitle={`Bonjour ${welcomeName}, nous sommes le ${today}. Voici l'activité du courrier.`}
        actions={
          <>
            <Button variant="outline" icon={<FileDown className="h-4 w-4" />}>
              Exporter
            </Button>
            <Button icon={<Plus className="h-4 w-4" />}>Enregistrer un courrier</Button>
          </>
        }
      />

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>
            {error} — Vérifiez que l'API tourne sur{' '}
            <code className="font-mono">{import.meta.env.VITE_API_URL}</code>.
          </span>
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            <StatCard
              title="Courriers Entrants"
              value={nf(overview?.entrants)}
              tone="primary"
              icon={<Inbox className="h-6 w-6" />}
              hint={<TrendHint value={overview?.tendance_pourcentage ?? 0} />}
            />
            <StatCard
              title="Courriers Sortants"
              value={nf(overview?.sortants)}
              tone="success"
              icon={<Send className="h-6 w-6" />}
              hint={<span className="text-success">+8% ce mois</span>}
            />
            <StatCard
              title="Courriers Internes"
              value={nf(overview?.internes)}
              tone="info"
              icon={<Shuffle className="h-6 w-6" />}
              hint={<span className="text-slate-500">Inter-services actifs</span>}
            />
            <StatCard
              title="Dossiers en Retard"
              value={nf(overview?.en_retard)}
              tone="danger"
              valueClassName="text-danger"
              icon={<Clock className="h-6 w-6" />}
              hint={
                <span className="inline-flex items-center gap-1 text-danger">
                  <AlertTriangle className="h-3.5 w-3.5" /> Action requise
                </span>
              }
            />
          </>
        )}
      </div>

      {/* Graphique + répartition */}
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h6 className="section-title mb-0">Volume Mensuel des Correspondances</h6>
              <p className="mt-1 text-[0.78rem] text-slate-400">
                Comparaison entrants / sortants sur les 12 derniers mois
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-[0.72rem] font-semibold text-success">
              <ArrowUpRight className="h-3.5 w-3.5" /> Tendance positive
            </span>
          </div>
          {loading ? (
            <ChartSkeleton height={300} />
          ) : (
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 16, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradEntrants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000091" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#000091" stopOpacity={0.08} />
                  </linearGradient>
                  <linearGradient id="gradSortants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#18753c" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#18753c" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eef0f5" />
                <XAxis
                  dataKey="mois"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tickMargin={10}
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
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={30}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: '#64748b' }}
                />
                <Area
                  type="monotone"
                  dataKey="Entrants"
                  stroke="#000091"
                  strokeWidth={2.5}
                  fill="url(#gradEntrants)"
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                />
                <Bar
                  dataKey="Sortants"
                  fill="url(#gradSortants)"
                  radius={[6, 6, 0, 0]}
                  barSize={14}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-1 flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" />
            <h6 className="section-title mb-0">Répartition par Statut</h6>
          </div>
          <p className="mb-2 text-[0.78rem] text-slate-400">Vue synthétique du portefeuille</p>

          {loading ? (
            <ChartSkeleton height={300} />
          ) : repartition.length === 0 ? (
            <p className="py-16 text-center text-[0.85rem] text-slate-400">Aucune donnée.</p>
          ) : (
            <>
              <div className="relative" style={{ height: 210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={repartition}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {repartition.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-ink">{nf(totalRepartition)}</span>
                  <span className="text-[0.72rem] uppercase tracking-wide text-slate-400">
                    Courriers
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {repartition.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[0.8rem]">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: item.color }}
                      />
                      {item.name}
                    </span>
                    <span className="font-semibold text-ink">{nf(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Courriers récents + activité */}
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <h6 className="section-title mb-0">Derniers Courriers Enregistrés</h6>
            <div className="flex overflow-hidden rounded-lg border border-line">
              <input
                type="text"
                placeholder="Recherche rapide..."
                className="w-48 border-none px-3 py-1.5 text-[0.8rem] outline-none"
              />
              <button className="border-l border-line px-3 text-slate-500 hover:bg-slate-50">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table-custom w-full">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Expéditeur</th>
                  <th>Objet</th>
                  <th>Réception</th>
                  <th>Confidentialité</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <TableBodySkeleton rows={5} cols={7} />}
                {!loading && recents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-slate-400">
                      Aucun courrier.
                    </td>
                  </tr>
                )}
                {recents.map((courrier) => (
                  <tr key={courrier.id}>
                    <td className="font-semibold text-primary">{courrier.numero}</td>
                    <td>
                      <span className="block">{courrier.expediteur?.nom ?? '—'}</span>
                      <span className="text-[0.75rem] text-slate-400">
                        {courrier.reference_externe ?? ''}
                      </span>
                    </td>
                    <td className="max-w-[240px]">{courrier.objet}</td>
                    <td>{formatDate(courrier.date_reception)}</td>
                    <td>
                      <ConfidentialiteBadge value={courrier.confidentialite} />
                    </td>
                    <td>
                      <StatutBadge
                        code={courrier.statut?.code}
                        libelle={courrier.statut?.libelle}
                      />
                    </td>
                    <td className="text-right">
                      <div className="inline-flex gap-2">
                        <button
                          className="rounded-md border border-line bg-white p-1.5 text-primary hover:bg-primary/5"
                          title="Consulter"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-md border border-line bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h6 className="section-title">Flux & Activité Récente</h6>
          <div className="text-[0.85rem]">
            {loading && <TimelineSkeleton rows={4} />}
            {!loading && activite.length === 0 && (
              <p className="text-slate-400">Aucune activité récente.</p>
            )}
            {!loading &&
              activite.map((item) => {
                const meta = eventMeta(item.event)
                const ItemIcon = meta.icon
                return (
                  <div key={item.id} className={`timeline-item ${meta.variant}`}>
                    <span className="flex items-center gap-2 font-semibold text-ink">
                      <ItemIcon className="h-4 w-4" />
                      {meta.label}
                    </span>
                    <span className="text-[0.78rem] text-slate-500">
                      {item.event} • {item.user?.name ?? 'Système'} • {item.date_humaine}
                    </span>
                  </div>
                )
              })}
          </div>
        </Card>
      </div>
    </div>
  )
}
