import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useToastStore } from '@/stores/toast.store'
import { cn } from '@/lib/utils'

const STYLES = {
  success: 'border-success/20 text-success',
  error: 'border-danger/20 text-danger',
  info: 'border-primary/20 text-primary',
}

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
}

export function ToastHost() {
  const toasts = useToastStore((state) => state.toasts)
  const remove = useToastStore((state) => state.remove)

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[2000] flex w-80 max-w-[90vw] flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type]
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-2 rounded-xl border bg-white px-4 py-3 shadow-lg',
              STYLES[toast.type],
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span className="flex-1 text-[0.83rem] font-medium text-ink">{toast.message}</span>
            <button
              onClick={() => remove(toast.id)}
              className="text-slate-400 hover:text-ink"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
