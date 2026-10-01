/** Machine à états des statuts de courrier (doit rester alignée avec le backend). */
export const TRANSITIONS_STATUT: Record<string, string[]> = {
  ENREGISTRE: ['AFFECTE'],
  AFFECTE: ['EN_COURS', 'REJETE'],
  EN_COURS: ['TRAITE', 'VALIDE', 'REJETE'],
  TRAITE: ['CLOTURE', 'VALIDE'],
  VALIDE: ['CLOTURE', 'TRAITE'],
  CLOTURE: [],
  REJETE: [],
  ARCHIVE: [],
}

export function transitionsAutorisees(code?: string | null): string[] {
  return code ? (TRANSITIONS_STATUT[code] ?? []) : []
}

export function statutsDejaTermines(code?: string | null): boolean {
  return code === 'CLOTURE' || code === 'ARCHIVE'
}
