import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Clock, Inbox, LogOut, Menu, Search, Settings, User as UserIcon } from 'lucide-react'
import { MENU } from '@/config/menu'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { initials } from '@/lib/utils'

interface NotificationItem {
  id: number
  icon: 'inbox' | 'check' | 'clock'
  tone: string
  title: string
  description: string
  time: string
  unread?: boolean
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    icon: 'inbox',
    tone: 'bg-primary/10 text-primary',
    title: 'Nouveau courrier',
    description: 'Ministère du Budget a envoyé le rapport T3.',
    time: 'Il y a 5 min',
    unread: true,
  },
  {
    id: 2,
    icon: 'check',
    tone: 'bg-success/10 text-success',
    title: 'Visa accordé',
    description: 'Le DG a validé le courrier sortant DGRK.',
    time: 'Il y a 30 min',
    unread: true,
  },
  {
    id: 3,
    icon: 'clock',
    tone: 'bg-danger/10 text-danger',
    title: 'Dossier en retard',
    description: "Le délai d'instruction est dépassé pour l'affectation #44.",
    time: 'Il y a 2h',
  },
]

const NOTIF_ICONS = {
  inbox: Inbox,
  check: CheckCheck,
  clock: Clock,
}

export function Topbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const toggleMobileSidebar = useUiStore((state) => state.toggleMobileSidebar)
  const [openMenu, setOpenMenu] = useState<'notif' | 'user' | null>(null)

  const roleLabel = user?.roles?.[0]?.nom ?? 'Utilisateur'
  const unreadCount = NOTIFICATIONS.filter((item) => item.unread).length

  const currentTitle = useMemo(() => {
    const current = `${location.pathname}${location.search}`
    for (const section of MENU) {
      for (const group of section.groups) {
        const found = group.children.find(
          (child) => child.path === current || child.path.split('?')[0] === location.pathname,
        )
        if (found) return found.title
      }
    }
    return location.pathname === '/' ? "Vue d'ensemble" : 'SGEC'
  }, [location.pathname, location.search])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="navbar-top">
      <div className="flex items-center gap-3">
        <button className="sidebar-toggle" onClick={toggleMobileSidebar} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
        <span className="hidden text-[0.8rem] font-semibold text-slate-400 md:inline">
          SGEC <span className="mx-1.5 text-slate-300">/</span>
          <span className="text-ink">{currentTitle}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="search-bar-top hidden lg:block">
          <div className="flex items-center">
            <Search className="mr-2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Rechercher un courrier, réf..." />
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative inline-flex h-[42px] w-[42px] items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"
            onClick={() => setOpenMenu((value) => (value === 'notif' ? null : 'notif'))}
            aria-label="Notifications"
          >
            <Bell className="h-[1.15rem] w-[1.15rem]" />
            {unreadCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-danger px-1 text-[0.65rem] font-bold leading-none text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {openMenu === 'notif' && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
              <div className="absolute right-0 z-50 mt-3 w-[380px] max-w-[90vw] overflow-hidden rounded-xl bg-white shadow-[0_10px_30px_-5px_rgba(0,0,0,0.12)]">
                <div className="flex items-center justify-between border-b border-line px-5 py-4 text-[0.9rem] font-semibold">
                  Notifications
                  <button className="text-[0.75rem] font-normal text-primary">Tout marquer comme lu</button>
                </div>
                <div className="max-h-[340px] overflow-y-auto">
                  {NOTIFICATIONS.map((item) => {
                    const ItemIcon = NOTIF_ICONS[item.icon]
                    return (
                      <button
                        key={item.id}
                        className={`flex w-full items-start border-b border-[#f5f5f5] px-5 py-3.5 text-left transition-colors hover:bg-[#f9f9fc] ${
                          item.unread ? 'bg-[#f0f0ff]' : ''
                        }`}
                      >
                        <span className={`mr-3 flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px] ${item.tone}`}>
                          <ItemIcon className="h-4 w-4" />
                        </span>
                        <span className="flex-grow">
                          <span className="flex justify-between">
                            <span className="text-[0.8rem] font-semibold text-ink">{item.title}</span>
                            <span className="text-[0.7rem] text-slate-400">{item.time}</span>
                          </span>
                          <span className="mt-0.5 block max-w-[240px] truncate text-[0.78rem] text-slate-500">
                            {item.description}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div className="border-t border-line bg-slate-50 p-2 text-center">
                  <button className="text-[0.78rem] font-semibold text-primary">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User */}
        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-slate-50"
            onClick={() => setOpenMenu((value) => (value === 'user' ? null : 'user'))}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[0.85rem] font-semibold text-white shadow-sm">
              {initials(user?.name)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-[0.85rem] font-semibold leading-tight text-ink">
                {user?.name ?? 'Utilisateur'}
              </span>
              <span className="block text-[0.72rem] text-slate-500">{roleLabel}</span>
            </span>
          </button>

          {openMenu === 'user' && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-line bg-white p-2 shadow-lg">
                <Link
                  to="/profil"
                  onClick={() => setOpenMenu(null)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[0.85rem] text-ink hover:bg-slate-50"
                >
                  <UserIcon className="h-4 w-4 text-slate-400" /> Mon profil
                </Link>
                {hasPermission('parametres.view') && (
                  <Link
                    to="/admin/parametres"
                    onClick={() => setOpenMenu(null)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[0.85rem] text-ink hover:bg-slate-50"
                  >
                    <Settings className="h-4 w-4 text-slate-400" /> Paramètres
                  </Link>
                )}
                <hr className="my-1 border-line" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[0.85rem] text-danger hover:bg-danger/5"
                >
                  <LogOut className="h-4 w-4" /> Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
