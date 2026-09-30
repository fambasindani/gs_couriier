import {
  Archive,
  CheckCircle2,
  Inbox,
  Paperclip,
  Pencil,
  Share2,
  StickyNote,
  Trash2,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

export type EventVariant = '' | 'success' | 'info' | 'warning'

export interface EventMeta {
  label: string
  variant: EventVariant
  icon: LucideIcon
  /** Couleur d'accent (icône / pastille). */
  color: string
}

interface EventRule {
  test: (event: string) => boolean
  label: string
  variant: EventVariant
  icon: LucideIcon
  color: string
}

const RULES: EventRule[] = [
  { test: (e) => e.includes('rejete'), label: 'Rejet', variant: 'warning', icon: XCircle, color: '#ce0500' },
  { test: (e) => e.includes('valide') || e.includes('vise'), label: 'Validation / Visa', variant: 'success', icon: CheckCircle2, color: '#18753c' },
  { test: (e) => e.includes('affecte'), label: 'Affectation', variant: 'info', icon: Share2, color: '#0063cb' },
  { test: (e) => e.includes('annote'), label: 'Annotation', variant: 'info', icon: StickyNote, color: '#0063cb' },
  { test: (e) => e.includes('archive'), label: 'Archivage', variant: 'warning', icon: Archive, color: '#b34000' },
  { test: (e) => e.includes('piece') || e.includes('ocr'), label: 'Pièce jointe / OCR', variant: 'warning', icon: Paperclip, color: '#b34000' },
  { test: (e) => e.includes('supprime') || e.includes('deleted'), label: 'Suppression', variant: 'warning', icon: Trash2, color: '#ce0500' },
  { test: (e) => e.includes('modifie') || e.includes('updated'), label: 'Modification', variant: 'info', icon: Pencil, color: '#0063cb' },
  { test: (e) => e.includes('cree') || e.includes('created'), label: 'Enregistrement', variant: '', icon: Inbox, color: '#000091' },
]

const DEFAULT_META: EventMeta = {
  label: 'Activité',
  variant: '',
  icon: Inbox,
  color: '#000091',
}

/** Déduit un libellé, un style et une icône à partir du code d'événement d'audit. */
export function eventMeta(event: string): EventMeta {
  const rule = RULES.find((item) => item.test(event))
  if (!rule) return DEFAULT_META
  return { label: rule.label, variant: rule.variant, icon: rule.icon, color: rule.color }
}
