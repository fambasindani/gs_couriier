import type { BadgeTone } from '@/components/ui/Badge'

export const PROJET_STATUTS = [
  'BROUILLON',
  'EN_REDACTION',
  'SOUMIS_A_VALIDATION',
  'A_CORRIGER',
  'VALIDE',
  'A_SIGNER',
  'SIGNE',
  'A_EXPEDIER',
  'EXPEDIE',
  'ARCHIVE',
  'ANNULE',
]

const TONES: Record<string, BadgeTone> = {
  BROUILLON: 'secondary',
  EN_REDACTION: 'info',
  SOUMIS_A_VALIDATION: 'warning',
  A_CORRIGER: 'warning',
  VALIDE: 'primary',
  A_SIGNER: 'primary',
  SIGNE: 'success',
  A_EXPEDIER: 'info',
  EXPEDIE: 'success',
  ARCHIVE: 'secondary',
  ANNULE: 'danger',
}

export function projetStatutTone(statut: string): BadgeTone {
  return TONES[statut] ?? 'secondary'
}

export function projetStatutLabel(statut: string): string {
  return statut.replace(/_/g, ' ')
}
