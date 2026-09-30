import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
      <div>
        <h4 className="mb-1 text-xl font-bold text-ink">{title}</h4>
        {subtitle && <p className="mb-0 text-[0.85rem] text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
