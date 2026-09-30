import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'

export function firstDayOfMonth(): string {
  const date = new Date()
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10)
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

interface PeriodFilterProps {
  debut: string
  fin: string
  onChange: (debut: string, fin: string) => void
  onApply: () => void
  extra?: ReactNode
  hideApply?: boolean
}

export function PeriodFilter({
  debut,
  fin,
  onChange,
  onApply,
  extra,
  hideApply,
}: PeriodFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Du" className="w-40">
        <Input type="date" value={debut} onChange={(event) => onChange(event.target.value, fin)} />
      </Field>
      <Field label="Au" className="w-40">
        <Input type="date" value={fin} onChange={(event) => onChange(debut, event.target.value)} />
      </Field>
      {extra}
      {!hideApply && <Button onClick={onApply}>Appliquer</Button>}
    </div>
  )
}
