import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { ConfirmHost } from '@/components/ui/ConfirmHost'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { useUiStore } from '@/stores/ui.store'

export function AdminLayout() {
  const location = useLocation()
  const closeMobileSidebar = useUiStore((state) => state.closeMobileSidebar)

  useEffect(() => {
    closeMobileSidebar()
  }, [location.pathname, closeMobileSidebar])

  return (
    <>
      <Sidebar />
      <div className="app-content">
        <Topbar />
        <main className="content-pad flex-1 p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <ConfirmHost />
    </>
  )
}
