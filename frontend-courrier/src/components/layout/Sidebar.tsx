import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Mail } from 'lucide-react'
import { MENU, type MenuGroup } from '@/config/menu'
import { Icon } from '@/components/ui/Icon'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { cn } from '@/lib/utils'

interface SidebarGroupProps {
  group: MenuGroup
  isActive: (path: string) => boolean
  onNavigate: () => void
}

function SidebarGroup({ group, isActive, onNavigate }: SidebarGroupProps) {
  const groupHasActive = group.children.some((child) => isActive(child.path))
  const [open, setOpen] = useState(groupHasActive)

  useEffect(() => {
    if (groupHasActive) setOpen(true)
  }, [groupHasActive])

  return (
    <div className={cn('menu-group', open && 'open')}>
      <a className="menu-group-toggle" role="button" onClick={() => setOpen((value) => !value)}>
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
  const mobileSidebarOpen = useUiStore((state) => state.mobileSidebarOpen)
  const closeMobileSidebar = useUiStore((state) => state.closeMobileSidebar)
  const hasPermission = useAuthStore((state) => state.hasPermission)

  const current = `${location.pathname}${location.search}`

  const isActive = (path: string): boolean => {
    if (path === '/') return location.pathname === '/'
    const [base, query] = path.split('?')
    if (query) return current === path
    return location.pathname === base || location.pathname.startsWith(`${base}/`)
  }

  const sections = MENU.map((section) => ({
    ...section,
    groups: section.groups
      .map((group) => ({
        ...group,
        children: group.children.filter(
          (child) => !child.permission || hasPermission(child.permission),
        ),
      }))
      .filter((group) => group.children.length > 0),
  })).filter((section) => section.groups.length > 0)

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
                isActive={isActive}
                onNavigate={closeMobileSidebar}
              />
            ))}
          </div>
        ))}
      </div>
    </nav>
  )
}
