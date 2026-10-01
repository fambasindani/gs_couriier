import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CalendarClock, CheckCircle2, Clock, Timer } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { ChartSkeleton, StatCardSkeleton } from '@/components/ui/Skeletons'
import { PeriodFilter, firstDayOfMonth, today } from '@/components/rapports/PeriodFilter'
import { rapportsService } from '@/services/rapports.service'
import { nf, toFixed1 } from '@/lib/utils'
import type { RapportDelais } from '@/types'

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid #e5e5e5',
  boxShadow: '0 12px 30px -12px rgba(0,0,0,0.25)',
  fontSize: 12,
  padding: '8px 12px',
}

const PRIORITE_COLORS: Record<string, string> = {
  BASSE: '#94a3b8',
  NORMALE: '#0063cb',
  HAUTE: '#b34000',
  URGENTE: '#ce0500',
}

export function RapportDelaisPage() {
  const [debut, setDebut] = useState(firstDayOfMonth())
  const [fin, setFin] = useState(today())
  const [applied, setApplied] = useState({ debut: firstDayOfMonth(), fin: today() })
  const [data, setData] = useState<RapportDelais | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    rapportsService
      .delais({ date_debut: applied.debut, date_fin: applied.fin })
      .then((res) => {
        if (active) setData(res.data)
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

  const prioriteData = useMemo(
    () =>
      (data?.delais_moyens_par_priorite ?? []).map((item) => ({
        libelle: item.libelle,
        code: item.code,
        delai: toFixed1(item.delai_moyen_jours),
        total: Number(item.total),
      })),
    [data],
  )

  const totalRetards = (data?.retards['1_a_3_jours'] ?? 0) + (data?.retards.plus_de_3_jours ?? 0)

  return (
    <div>
      <PageHeader
        title="Délais de traitement"
        subtitle="Respect des échéances et délais moyens par priorité."
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

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            <StatCard
              title="Avec échéance"
              value={nf(data?.total_avec_limite)}
              tone="primary"
              icon={<CalendarClock className="h-6 w-6" />}
              hint={<span className="text-slate-500">Courriers avec date limite</span>}
            />
            <StatCard
              title="Dans les temps"
              value={nf(data?.dans_les_temps)}
              tone="success"
              icon={<CheckCircle2 className="h-6 w-6" />}
              hint={
                <span className="text-success">
                  {toFixed1(data?.taux_respect_delais_pourcentage)}% de respect
                </span>
              }
            />
            <StatCard
              title="En retard"
              value={nf(data?.en_retard)}
              tone="danger"
              valueClassName="text-danger"
              icon={<Clock className="h-6 w-6" />}
              hint={<span className="text-danger">Au-delà de l'échéance</span>}
            />
            <StatCard
              title="Retards cumulés"
              value={nf(totalRetards)}
              tone="warning"
              icon={<Timer className="h-6 w-6" />}
              hint={
                <span className="text-slate-500">
                  {nf(data?.retards['1_a_3_jours'])} de 1 à 3 j · {nf(data?.retards.plus_de_3_jours)} supérieur à 3 j
                </span>
              }
            />
          </>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h6 className="section-title">Répartition des retards</h6>
          {loading ? (
            <ChartSkeleton height={240} />
          ) : (
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { tranche: '1 à 3 jours', total: data?.retards['1_a_3_jours'] ?? 0 },
                    { tranche: 'Plus de 3 jours', total: data?.retards.plus_de_3_jours ?? 0 },
                  ]}
                  margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="#eef0f5" />
                  <XAxis dataKey="tranche" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} width={40} allowDecimals={false} tick={{ fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,145,0.04)' }} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={54}>
                    <Cell fill="#b34000" />
                    <Cell fill="#ce0500" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h6 className="section-title">Délai moyen par priorité (jours)</h6>
          {loading ? (
            <ChartSkeleton height={240} />
          ) : prioriteData.length === 0 ? (
            <p className="py-12 text-center text-[0.85rem] text-slate-400">Aucune donnée.</p>
          ) : (
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prioriteData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#eef0f5" />
                  <XAxis dataKey="libelle" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} width={40} tick={{ fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,145,0.04)' }} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="delai" radius={[6, 6, 0, 0]} barSize={44}>
                    {prioriteData.map((item) => (
                      <Cell key={item.code} fill={PRIORITE_COLORS[item.code] ?? '#000091'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
