import type { CSSProperties, ReactNode } from 'react'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatTone = 'primary' | 'success' | 'info' | 'danger' | 'warning'

const ICON_TONES: Record<StatTone, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  info: 'bg-info/10 text-info',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
}

const BAR_COLORS: Record<StatTone, string> = {
  primary: '#000091',
  success: '#18753c',
  info: '#0063cb',
  danger: '#ce0500',
  warning: '#b34000',
}

interface StatCardProps {
  title: string
  value: ReactNode
  icon: ReactNode
  tone?: StatTone
  hint?: ReactNode
  valueClassName?: string
}

export function StatCard({
  title,
  value,
  icon,
  tone = 'primary',
  hint,
  valueClassName,
}: StatCardProps) {
  return (
    <div
      className={cn('card-custom stat-card')}
      style={{ '--primary-color': BAR_COLORS[tone] } as CSSProperties}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="block text-[0.8rem] font-semibold text-slate-500">{title}</span>
          <h3 className={cn('mb-0 mt-1 text-2xl font-bold', valueClassName)}>{value}</h3>
          {hint && (
            <span className="mt-2 inline-flex items-center gap-1 text-[0.8rem] font-medium text-slate-500">
              {hint}
            </span>
          )}
        </div>
        <div className={cn('stat-icon', ICON_TONES[tone])}>{icon}</div>
      </div>
    </div>
  )
}

export function TrendHint({ value }: { value: number }) {
  const positive = value >= 0
  return (
    <span className={cn('inline-flex items-center gap-1', positive ? 'text-success' : 'text-danger')}>
      <TrendingUp className={cn('h-3.5 w-3.5', !positive && 'rotate-180')} />
      {positive ? '+' : ''}
      {value}% ce mois
    </span>
  )
}
