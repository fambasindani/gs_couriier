import type { ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { AccesRefusePage } from '@/pages/AccesRefusePage'

export function GuardedRoute({
  permission,
  children,
}: {
  permission?: string | string[]
  children: ReactNode
}) {
  const hasPermission = useAuthStore((state) => state.hasPermission)

  const requirements = Array.isArray(permission) ? permission : permission ? [permission] : []
  const allowed = requirements.every((slug) => hasPermission(slug))

  if (!allowed) {
    return <AccesRefusePage />
  }

  return <>{children}</>
}