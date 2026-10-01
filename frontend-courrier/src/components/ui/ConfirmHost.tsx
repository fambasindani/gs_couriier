import { ConfirmDialog } from './ConfirmDialog'
import { useConfirmStore } from '@/stores/confirm.store'

/** Hôte unique des confirmations globales (monté dans le layout). */
export function ConfirmHost() {
  const options = useConfirmStore((state) => state.options)
  const resolve = useConfirmStore((state) => state.resolve)

  return (
    <ConfirmDialog
      open={Boolean(options)}
      title={options?.title ?? 'Confirmation'}
      message={options?.message ?? ''}
      confirmLabel={options?.confirmLabel}
      tone={options?.tone}
      onConfirm={() => resolve(true)}
      onClose={() => resolve(false)}
    />
  )
}
