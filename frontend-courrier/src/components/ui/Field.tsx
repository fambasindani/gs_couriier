import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/utils'

const CONTROL =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-[0.85rem] text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-50'

const INVALID =
  'border-danger focus:border-danger focus:ring-danger/10'

interface FieldProps {
  label: string
  required?: boolean
  /** Message d'aide affiché sous le champ (masqué si `error` est fourni). */
  hint?: string
  /** Message d'erreur : bordure rouge + texte sous le champ. */
  error?: string
  children: ReactNode
  className?: string
}

export function Field({ label, required, hint, error, children, className }: FieldProps) {
  return (
    <label className={cn('block', error && 'field-invalid', className)}>
      <span className="mb-1.5 block text-[0.8rem] font-semibold text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-[0.72rem] font-medium text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[0.72rem] text-slate-400">{hint}</span>
      ) : null}
    </label>
  )
}

interface InvalidProp {
  invalid?: boolean
}

export function Input({
  className,
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & InvalidProp) {
  return <input {...props} className={cn(CONTROL, invalid && INVALID, className)} />
}

export function Select({
  className,
  invalid,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & InvalidProp) {
  return (
    <select {...props} className={cn(CONTROL, invalid && INVALID, className)}>
      {children}
    </select>
  )
}

export function Textarea({
  className,
  invalid,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & InvalidProp) {
  return (
    <textarea {...props} className={cn(CONTROL, 'min-h-[96px] resize-y', invalid && INVALID, className)} />
  )
}
