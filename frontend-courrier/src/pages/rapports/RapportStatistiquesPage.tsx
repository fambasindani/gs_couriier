import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, CheckCircle2, Clock, Inbox, TrendingUp } from 'lucide-react'
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
import { StatCard } from '@/components/ui/StatCard'
import { ChartSkeleton, StatCardSkeleton } from '@/components/ui/Skeletons'
import { PeriodFilter, firstDayOfMonth, today } from '@/components/rapports/PeriodFilter'
import { Field, Input } from '@/components/ui/Field'
import { rapportsService } from '@/services/rapports.service'
import { nf, toFixed1 } from '@/lib/utils'
import type { RapportConfidentialite, RapportTraitement, RapportVolumes } from '@/types'

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid #e5e5e5',
  boxShadow: '0 12px 30px -12px rgba(0,0,0,0.25)',
  fontSize: 12,
  padding: '8px 12px',
}

const TYPE_COLORS = ['#000091', '#18753c', '#0063cb', '#6a6af4', '#b34000']
const CONF_COLORS: Record<string, string> = {
  PUBLIC: '#94a3b8',
  INTERNE: '#b34000',
  CONFIDENTIEL: '#ce0500',
  TRES_CONFIDENTIEL: '#7f1d1d',
}
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

export function RapportStatistiquesPage() {
  const [debut, setDebut] = useState(firstDayOfMonth())
  const [fin, setFin] = useState(today())
  const [annee, setAnnee] = useState(String(new Date().getFullYear()))
  const [applied, setApplied] = useState({ debut: firstDayOfMonth(), fin: today() })

  const [traitement, setTraitement] = useState<RapportTraitement | null>(null)
  const [volumes, setVolumes] = useState<RapportVolumes | null>(null)
  const [confident, setConfident] = useState<RapportConfidentialite | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    Promise.all([
      rapportsService.traitement({ date_debut: applied.debut, date_fin: applied.fin }),
      rapportsService.volumes({ annee }),
      rapportsService.confidentialite({ date_debut: applied.debut, date_fin: applied.fin }),
    ])
      .then(([t, v, c]) => {
        if (!active) return
        setTraitement(t.data)
        setVolumes(v.data)
        setConfident(c.data)
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Erreur de chargement des rapports.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [applied, annee])

  const volumeData = useMemo(
    () =>
      (volumes?.par_mois ?? []).map((item) => ({
        mois: MONTHS[Number(item.mois) - 1] ?? String(item.mois),
        Total: Number(item.total),
      })),
    [volumes],
  )

  const typeData = useMemo(
    () => (volumes?.par_type ?? []).map((item) => ({ name: item.libelle, value: Number(item.total) })),
    [volumes],
  )

  const confData = useMemo(
    () =>
      (confident?.par_confidentialite ?? []).map((item) => ({
        name: item.confidentialite,
        value: Number(item.total),
      })),
    [confident],
  )

  return (
    <div>
      <PageHeader
        title="Rapports statistiques"
        subtitle="Synthèse du traitement, volumes et confidentialité des courriers."
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
          extra={
            <Field label="Année volumes" className="w-32">
              <Input
                type="number"
                value={annee}
                onChange={(event) => setAnnee(event.target.value)}
              />
            </Field>
          }
        />
      </Card>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* KPI */}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            <StatCard
              title="Courriers reçus"
              value={nf(traitement?.compteurs.total_recus)}
              tone="primary"
              icon={<Inbox className="h-6 w-6" />}
              hint={<span className="text-slate-500">Sur la période</span>}
            />
            <StatCard
              title="Traités"
              value={nf(traitement?.compteurs.traites)}
              tone="success"
              icon={<CheckCircle2 className="h-6 w-6" />}
              hint={
                <span className="text-success">
                  {toFixed1(traitement?.taux_traitement_pourcentage)}% du total
                </span>
              }
            />
            <StatCard
              title="En cours"
              value={nf(traitement?.compteurs.en_cours)}
              tone="info"
              icon={<TrendingUp className="h-6 w-6" />}
              hint={<span className="text-slate-500">Affectés / en traitement</span>}
            />
            <StatCard
              title="En retard"
              value={nf(traitement?.compteurs.en_retard)}
              tone="danger"
              valueClassName="text-danger"
              icon={<Clock className="h-6 w-6" />}
              hint={<span className="text-danger">Action requise</span>}
            />
            <StatCard
              title="Délai moyen de traitement"
              value={`${Math.round(traitement?.delai_moyen_traitement_jours ?? 0)} j`}
              tone="warning"
              icon={<Clock className="h-6 w-6" />}
              hint={<span className="text-slate-500">Réception → clôture</span>}
            />
            <StatCard
              title="Délai moyen d'affectation"
              value={`${Math.round(traitement?.delai_moyen_affectation_heures ?? 0)} h`}
              tone="primary"
              icon={<Clock className="h-6 w-6" />}
              hint={<span className="text-slate-500">Réception → affectation</span>}
            />
          </>
        )}
      </div>

      {/* Volume mensuel */}
      <Card className="mt-5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h6 className="section-title mb-0">Volume mensuel {volumes?.annee ?? annee}</h6>
        </div>
        {loading ? (
          <ChartSkeleton height={280} />
        ) : (
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000091" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#000091" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eef0f5" />
                <XAxis dataKey="mois" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} width={40} allowDecimals={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,145,0.04)' }} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="Total" fill="url(#gradVol)" radius={[6, 6, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Type + Confidentialité */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h6 className="section-title">Répartition par type</h6>
          {loading ? (
            <ChartSkeleton height={240} />
          ) : typeData.length === 0 ? (
            <p className="py-12 text-center text-[0.85rem] text-slate-400">Aucune donnée.</p>
          ) : (
            <div className="relative" style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={3} stroke="none">
                    {typeData.map((item, index) => (
                      <Cell key={item.name} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-ink">
                  {nf(typeData.reduce((sum, item) => sum + item.value, 0))}
                </span>
                <span className="text-[0.72rem] uppercase tracking-wide text-slate-400">Courriers</span>
              </div>
            </div>
          )}
          <div className="mt-3 space-y-2">
            {typeData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-[0.8rem]">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: TYPE_COLORS[index % TYPE_COLORS.length] }} />
                  {item.name}
                </span>
                <span className="font-semibold text-ink">{nf(item.value)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h6 className="section-title">Confidentialité</h6>
          {loading ? (
            <ChartSkeleton height={240} />
          ) : confData.length === 0 ? (
            <p className="py-12 text-center text-[0.85rem] text-slate-400">Aucune donnée.</p>
          ) : (
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#eef0f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} width={40} allowDecimals={false} tick={{ fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,145,0.04)' }} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={44}>
                    {confData.map((item) => (
                      <Cell key={item.name} fill={CONF_COLORS[item.name] ?? '#000091'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {(confident?.tres_confidentiels_par_direction.length ?? 0) > 0 && (
            <div className="mt-4 border-t border-line pt-4">
              <span className="mb-2 block text-[0.75rem] font-semibold uppercase tracking-wide text-slate-400">
                Très confidentiels par direction
              </span>
              <ul className="space-y-1.5">
                {confident?.tres_confidentiels_par_direction.map((item) => (
                  <li key={item.libelle} className="flex items-center justify-between text-[0.8rem]">
                    <span className="text-slate-600">{item.libelle}</span>
                    <span className="font-semibold text-ink">{nf(item.total)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
