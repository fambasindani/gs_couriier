export interface CheckboxOption {
  value: number | string
  label: string
  hint?: string
}

interface CheckboxListProps {
  options: CheckboxOption[]
  selected: (number | string)[]
  onToggle: (value: number | string) => void
  emptyLabel?: string
}

export function CheckboxList({ options, selected, onToggle, emptyLabel }: CheckboxListProps) {
  if (options.length === 0) {
    return <p className="text-[0.82rem] text-slate-400">{emptyLabel ?? 'Aucun élément.'}</p>
  }
  return (
    <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-line p-2">
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
  )
}
