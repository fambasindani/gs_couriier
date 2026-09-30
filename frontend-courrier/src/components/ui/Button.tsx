import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'outline' | 'light' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary: 'btn-primary shadow-sm',
  outline: 'btn-outline',
  light: 'bg-[#f5f5fe] border border-line text-ink hover:bg-[#ededfa]',
  danger: 'bg-danger text-white border border-danger hover:opacity-90',
  ghost: 'bg-transparent border border-transparent text-ink hover:bg-[#f5f5fe]',
}

const SIZES: Record<Size, string> = {
  sm: 'text-[0.8rem] px-3 py-1.5',
  md: 'text-[0.85rem] px-4 py-2',
}

export function Button({
  variant = 'primary',
  size = 'sm',
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}
