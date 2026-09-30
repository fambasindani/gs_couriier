import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  lastPage: number
  total: number
  from?: number | null
  to?: number | null
  onChange: (page: number) => void
}

function pageWindow(page: number, lastPage: number): number[] {
  const pages: number[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(lastPage, start + 4)
  for (let index = start; index <= end; index += 1) pages.push(index)
  return pages
}

export function Pagination({ page, lastPage, total, from, to, onChange }: PaginationProps) {
  if (total === 0) return null

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 md:flex-row">
      <p className="text-[0.8rem] text-slate-500">
        Affichage de <span className="font-semibold text-ink">{from ?? 0}</span> à{' '}
        <span className="font-semibold text-ink">{to ?? 0}</span> sur{' '}
        <span className="font-semibold text-ink">{total}</span> résultat(s)
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pageWindow(page, lastPage).map((value) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={cn(
              'h-9 min-w-9 rounded-lg border px-2 text-[0.82rem] font-medium transition-colors',
              value === page
                ? 'border-primary bg-primary text-white'
                : 'border-line bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {value}
          </button>
        ))}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= lastPage}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
