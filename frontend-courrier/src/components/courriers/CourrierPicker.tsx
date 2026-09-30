import { useEffect, useState } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { courriersService } from '@/services/courriers.service'
import { useDebounce } from '@/lib/useDebounce'
import type { Courrier } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

interface CourrierPickerProps {
  value: Courrier | null
  onChange: (courrier: Courrier | null) => void
  placeholder?: string
}

export function CourrierPicker({ value, onChange, placeholder }: CourrierPickerProps) {
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query)
  const [results, setResults] = useState<Courrier[]>([])

  useEffect(() => {
    const term = debounced.trim()
    if (term.length < 2 || USE_MOCK) {
      setResults([])
      return
    }
    let active = true
    courriersService
      .list({ search: term, per_page: 6 })
      .then((res) => {
        if (active) setResults(res.data.data)
      })
      .catch(() => {
        if (active) setResults([])
      })
    return () => {
      active = false
    }
  }, [debounced])

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2">
        <span className="min-w-0">
          <span className="block text-[0.82rem] font-semibold text-primary">{value.numero}</span>
          <span className="block truncate text-[0.75rem] text-slate-500">{value.objet}</span>
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex flex-shrink-0 items-center gap-1 text-[0.75rem] font-medium text-slate-500 hover:text-primary"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Changer
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder ?? 'Rechercher un courrier (numéro, objet)...'}
          className="w-full border-none bg-transparent py-2 text-[0.85rem] outline-none"
        />
      </div>
      {results.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-line bg-white shadow-lg">
          {results.map((courrier) => (
            <li key={courrier.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(courrier)
                  setQuery('')
                  setResults([])
                }}
                className="flex w-full flex-col gap-0.5 border-b border-line px-3 py-2 text-left last:border-0 hover:bg-slate-50"
              >
                <span className="text-[0.8rem] font-semibold text-primary">{courrier.numero}</span>
                <span className="truncate text-[0.76rem] text-slate-500">{courrier.objet}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
