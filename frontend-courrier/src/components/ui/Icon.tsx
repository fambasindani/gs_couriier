import {
  Archive,
  BarChart3,
  Circle,
  Database,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Network,
  Settings,
  Share2,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Mail,
  FileText,
  Share2,
  Archive,
  Database,
  BarChart3,
  Settings,
  Network,
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
