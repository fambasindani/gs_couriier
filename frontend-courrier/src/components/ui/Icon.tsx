import {
  Archive,
  BarChart3,
  Circle,
  Database,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Settings,
  Share2,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Mail,
  Share2,
  Archive,
  Database,
  BarChart3,
  Settings,
  LifeBuoy,
}

interface IconProps {
  name: string
  className?: string
  strokeWidth?: number
}

export function Icon({ name, className, strokeWidth = 2 }: IconProps) {
  const Component = ICONS[name] ?? Circle
  return <Component className={className} strokeWidth={strokeWidth} />
}
