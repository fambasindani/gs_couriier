import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeTone = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'secondary'

const TONES: Record<BadgeTone, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
  secondary: 'bg-slate-500/10 text-slate-500',
}

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'secondary', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-md px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

const CONFIDENTIALITE_TONES: Record<string, BadgeTone> = {
  PUBLIC: 'secondary',
  INTERNE: 'warning',
  CONFIDENTIEL: 'danger',
  TRES_CONFIDENTIEL: 'danger',
}

export function ConfidentialiteBadge({ value }: { value?: string | null }) {
  if (!value) return <span className="text-slate-400">—</span>
  return <Badge tone={CONFIDENTIALITE_TONES[value] ?? 'secondary'}>{value}</Badge>
}

const STATUT_TONES: Record<string, BadgeTone> = {
  ENREGISTRE: 'secondary',
  AFFECTE: 'info',
  EN_COURS: 'primary',
  TRAITE: 'success',
  VALIDE: 'success',
  CLOTURE: 'success',
  REJETE: 'danger',
  ARCHIVE: 'secondary',
}

export function StatutBadge({ code, libelle }: { code?: string | null; libelle?: string | null }) {
  if (!code && !libelle) return <span className="text-slate-400">—</span>
  return <Badge tone={STATUT_TONES[code ?? ''] ?? 'secondary'}>{code ?? libelle}</Badge>
}
