export interface CheckboxOption {
  value: number | string
  label: string
  hint?: string
}

interface CheckboxListProps {
  options: CheckboxOption[]
  selected: (number | string)[]
  onToggle: (value: number | string) => void
  onSelectAll?: () => void
  onClearAll?: () => void
  emptyLabel?: string
}

export function CheckboxList({
  options,
  selected,
  onToggle,
  onSelectAll,
  onClearAll,
  emptyLabel,
}: CheckboxListProps) {
  if (options.length === 0) {
    return <p className="text-[0.82rem] text-slate-400">{emptyLabel ?? 'Aucun élément.'}</p>
  }
  const showActions = Boolean(onSelectAll || onClearAll)
  return (
    <div className="rounded-lg border border-line p-2">
      {showActions && (
        <div className="mb-1 flex items-center justify-between border-b border-line px-1 pb-2">
          <span className="text-[0.72rem] text-slate-400">
            {selected.length} / {options.length} sélectionné(s)
          </span>
          <div className="flex gap-3">
            {onSelectAll && (
              <button
                type="button"
                onClick={onSelectAll}
                className="text-[0.72rem] font-semibold text-primary hover:underline"
              >
                Tout cocher
              </button>
            )}
            {onClearAll && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-[0.72rem] font-semibold text-slate-500 hover:underline"
              >
                Tout décocher
              </button>
            )}
          </div>
        </div>
      )}
      <div className="max-h-56 space-y-1 overflow-y-auto">
      {options.map((option) => {
        const checked = selected.includes(option.value)
        return (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(option.value)}
              className="h-4 w-4 rounded border-line text-primary focus:ring-primary/20"
            />
            <span className="text-[0.83rem] text-ink">{option.label}</span>
            {option.hint && <span className="text-[0.72rem] text-slate-400">{option.hint}</span>}
          </label>
        )
      })}
      </div>
    </div>
  )
}
