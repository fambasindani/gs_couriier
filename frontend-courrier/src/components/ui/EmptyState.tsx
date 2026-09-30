import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      {icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </span>
      )}
      <h5 className="text-[0.95rem] font-semibold text-ink">{title}</h5>
      {description && <p className="max-w-md text-[0.83rem] text-slate-500">{description}</p>}
      {action}
    </div>
  )
}
