import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut, Mail } from 'lucide-react'
import { MENU, type MenuGroup } from '@/config/menu'
import { Icon } from '@/components/ui/Icon'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { cn, initials } from '@/lib/utils'

interface SidebarGroupProps {
  group: MenuGroup
  open: boolean
  onToggle: () => void
  isActive: (path: string) => boolean
  onNavigate: () => void
}

function SidebarGroup({ group, open, onToggle, isActive, onNavigate }: SidebarGroupProps) {
  const hasActive = group.children.some((child) => isActive(child.path))

  return (
    <div className={cn('menu-group', open && 'open', hasActive && 'has-active')}>
      <a className="menu-group-toggle" role="button" onClick={onToggle}>
        <span className="menu-label">
          <span className="menu-icon">
            <Icon name={group.icon} className="h-[18px] w-[18px]" />
          </span>
          {group.title}
        </span>
        <ChevronRight className="chevron h-3 w-3" />
      </a>
      <ul className="menu-sub">
        {group.children.map((child) => (
          <li key={child.path}>
            <Link
              to={child.path}
              className={cn(isActive(child.path) && 'active')}
              onClick={onNavigate}
            >
              {child.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const mobileSidebarOpen = useUiStore((state) => state.mobileSidebarOpen)
  const closeMobileSidebar = useUiStore((state) => state.closeMobileSidebar)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const current = `${location.pathname}${location.search}`

  // Correspondance exacte : évite de surligner "/rapports" ET "/rapports/delais".
  const isActive = (path: string): boolean => {
    const [base, query] = path.split('?')
    if (query) return current === path
    return location.pathname === base
  }

  const sections = useMemo(
    () =>
      MENU.map((section) => ({
        ...section,
        groups: section.groups
          .map((group) => ({
            ...group,
            children: group.children.filter(
              (child) => !child.permission || hasPermission(child.permission),
            ),
          }))
          .filter((group) => group.children.length > 0),
      })).filter((section) => section.groups.length > 0),
    [hasPermission],
  )

  // Accordéon : un seul groupe ouvert à la fois.
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  useEffect(() => {
    for (const section of sections) {
      for (const group of section.groups) {
        if (group.children.some((child) => isActive(child.path))) {
          setOpenGroup(group.title)
          return
        }
      }
    }
    // aucune route active dans le menu : on ne force rien
  }, [location.pathname, location.search, sections])

  const roleLabel = user?.roles?.[0]?.nom ?? 'Utilisateur'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className={cn('sidebar', mobileSidebarOpen && 'show')}>
      <div className="brand-box">
        <div className="brand-logo">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <div className="brand-title">SGEC</div>
          <div className="brand-subtitle">République Démocratique du Congo</div>
        </div>
      </div>

      <div className="sidebar-menu">
        {sections.map((section) => (
          <div key={section.category}>
            <div className="menu-category">{section.category}</div>
            {section.groups.map((group) => (
              <SidebarGroup
                key={group.title}
                group={group}
                open={openGroup === group.title}
                onToggle={() =>
                  setOpenGroup((previous) => (previous === group.title ? null : group.title))
                }
                isActive={isActive}
                onNavigate={closeMobileSidebar}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="sidebar-avatar">{initials(user?.name)}</span>
          <div className="min-w-0">
            <div className="truncate text-[0.82rem] font-semibold text-white">
              {user?.name ?? 'Utilisateur'}
            </div>
            <div className="truncate text-[0.7rem] text-[#8a8a9e]">{roleLabel}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Déconnexion">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}
