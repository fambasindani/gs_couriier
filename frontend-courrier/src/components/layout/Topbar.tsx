import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Clock,
  Inbox,
  LogOut,
  Menu,
  Search,
  Settings,
  Share2,
  User as UserIcon,
  type LucideIcon,
} from 'lucide-react'
import { MENU } from '@/config/menu'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { useConfirm } from '@/stores/confirm.store'
import { notificationsService } from '@/services/notifications.service'
import { initials } from '@/lib/utils'
import type { NotificationItem } from '@/types'

const NOTIF_TONES: Record<string, string> = {
  retard: 'bg-danger/10 text-danger',
  affectation: 'bg-primary/10 text-primary',
  courrier: 'bg-info/10 text-info',
}

const NOTIF_ICONS: Record<string, LucideIcon> = {
  retard: Clock,
  affectation: Share2,
  courrier: Inbox,
}

export function Topbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const toggleMobileSidebar = useUiStore((state) => state.toggleMobileSidebar)
  const [openMenu, setOpenMenu] = useState<'notif' | 'user' | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [query, setQuery] = useState('')
  const confirm = useConfirm()

  const roleLabel = user?.roles?.[0]?.nom ?? 'Utilisateur'
  const unreadCount = notifications.length

  const loadNotifications = () => {
    notificationsService
      .list()
      .then((res) => setNotifications(res.items ?? []))
      .catch(() => setNotifications([]))
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const currentTitle = useMemo(() => {
    const current = `${location.pathname}${location.search}`
    const all = MENU.flatMap((section) => section.groups.flatMap((group) => group.children))

    const exact = all.find((child) => child.path === current)
    if (exact) return exact.title

    const base = all.find((child) => !child.path.includes('?') && child.path === location.pathname)
    if (base) return base.title

    return location.pathname === '/' ? "Vue d'ensemble" : 'SGEC'
  }, [location.pathname, location.search])

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Déconnexion',
      message: 'Voulez-vous vraiment vous déconnecter ?',
      confirmLabel: 'Se déconnecter',
      tone: 'danger',
    })
    if (!ok) return
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
        <form
          className="search-bar-top hidden lg:block"
          onSubmit={(event) => {
            event.preventDefault()
            const term = query.trim()
            if (term) navigate(`/courriers/recherche?q=${encodeURIComponent(term)}`)
            setQuery('')
          }}
        >
          <div className="flex items-center">
            <Search className="mr-2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un courrier, réf..."
            />
          </div>
        </form>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative inline-flex h-[42px] w-[42px] items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"
            onClick={() => {
              const next = openMenu === 'notif' ? null : 'notif'
              setOpenMenu(next)
              if (next === 'notif') loadNotifications()
            }}
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
                  <span className="text-[0.72rem] font-normal text-slate-400">
                    {unreadCount} élément(s)
                  </span>
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 && (
                    <p className="px-5 py-8 text-center text-[0.82rem] text-slate-400">
                      Aucune notification.
                    </p>
                  )}
                  {notifications.map((item) => {
                    const ItemIcon = NOTIF_ICONS[item.type] ?? Bell
                    const tone = NOTIF_TONES[item.type] ?? 'bg-slate-500/10 text-slate-500'
                    return (
                      <Link
                        key={item.id}
                        to={item.url}
                        onClick={() => setOpenMenu(null)}
                        className="flex w-full items-start border-b border-[#f5f5f5] px-5 py-3.5 text-left transition-colors hover:bg-[#f9f9fc]"
                      >
                        <span
                          className={`mr-3 flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px] ${tone}`}
                        >
                          <ItemIcon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-grow">
                          <span className="flex justify-between gap-2">
                            <span className="text-[0.8rem] font-semibold text-ink">
                              {item.title}
                            </span>
                            <span className="flex-shrink-0 text-[0.7rem] text-slate-400">
                              {item.date_humaine}
                            </span>
                          </span>
                          <span className="mt-0.5 block truncate text-[0.78rem] text-slate-500">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    )
                  })}
                </div>
                <div className="border-t border-line bg-slate-50 p-2 text-center">
                  <Link
                    to="/dashboard/activite-recente"
                    onClick={() => setOpenMenu(null)}
                    className="text-[0.78rem] font-semibold text-primary"
                  >
                    Voir toute l'activité
                  </Link>
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
