import type {
  ActiviteLog,
  Courrier,
  DashboardOverview,
  DashboardStatistiques,
  Paginated,
  Partenaire,
  Referentiel,
  VolumeMensuel,
} from '@/types'

export const mockOverview: DashboardOverview = {
  total_courriers: 830,
  entrants: 450,
  sortants: 220,
  internes: 160,
  en_cours: 312,
  traites: 188,
  valides: 96,
  clotures: 74,
  en_retard: 12,
  ce_mois: 62,
  mois_precedent: 55,
  tendance_pourcentage: 12.7,
  total_pieces_jointes: 1240,
  utilisateurs_actifs: 18,
}

export const mockVolume: VolumeMensuel = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
  datasets: {
    entrants: [45, 52, 38, 65, 59, 80, 81, 56, 75, 60, 48, 62],
    sortants: [28, 32, 22, 40, 35, 50, 48, 34, 45, 38, 30, 40],
    internes: [12, 18, 15, 22, 19, 26, 24, 20, 28, 21, 17, 25],
  },
}

export const mockCourriers: Courrier[] = [
  {
    id: 1,
    numero: 'COUR-2026-045',
    objet: "Transmission du rapport trimestriel d'exécution",
    reference_externe: 'MIN/BUD/2026/045',
    confidentialite: 'INTERNE',
    date_reception: '2026-09-28T08:30:00.000000Z',
    expediteur: { id: 1, nom: 'Ministère du Budget' },
    statut: { id: 3, code: 'EN_COURS', libelle: 'En cours' },
  },
  {
    id: 2,
    numero: 'COUR-2026-044',
    objet: 'Note de service relative à la numérisation',
    reference_externe: 'DGRAD/2026/078',
    confidentialite: 'CONFIDENTIEL',
    date_reception: '2026-09-27T10:15:00.000000Z',
    expediteur: { id: 2, nom: 'Direction Générale DGRAD' },
    statut: { id: 5, code: 'VALIDE', libelle: 'Validé' },
  },
  {
    id: 3,
    numero: 'COUR-2026-043',
    objet: "Demande d'approvisionnement stock central",
    reference_externe: 'FONDEG/2026/012',
    confidentialite: 'PUBLIC',
    date_reception: '2026-09-26T14:45:00.000000Z',
    expediteur: { id: 3, nom: 'Fondeg Catering Congo S.A.' },
    statut: { id: 2, code: 'AFFECTE', libelle: 'Affecté' },
  },
]

export const mockActivite: ActiviteLog[] = [
  {
    id: 1,
    event: 'courrier.cree',
    user: { id: 1, name: 'Bureau Courrier' },
    date: new Date().toISOString(),
    date_humaine: 'Il y a 10 min',
  },
  {
    id: 2,
    event: 'courrier.valide',
    user: { id: 2, name: 'Direction Générale' },
    date: new Date().toISOString(),
    date_humaine: 'Il y a 35 min',
  },
  {
    id: 3,
    event: 'courrier.affecte',
    user: { id: 3, name: 'DANTIC' },
    date: new Date().toISOString(),
    date_humaine: 'Il y a 1 heure',
  },
  {
    id: 4,
    event: 'courrier.piece.ajoutee',
    user: { id: 4, name: 'Service Python/FastAPI' },
    date: new Date().toISOString(),
    date_humaine: 'Il y a 2 heures',
  },
  {
    id: 5,
    event: 'courrier.annote',
    user: { id: 3, name: 'DANTIC' },
    date: new Date().toISOString(),
    date_humaine: 'Il y a 4 heures',
  },
  {
    id: 6,
    event: 'courrier.modifie',
    user: { id: 1, name: 'Bureau Courrier' },
    date: new Date().toISOString(),
    date_humaine: 'Hier',
  },
  {
    id: 7,
    event: 'courrier.archive',
    user: { id: 2, name: 'Archives' },
    date: new Date().toISOString(),
    date_humaine: 'Hier',
  },
  {
    id: 8,
    event: 'courrier.rejete',
    user: { id: 2, name: 'Direction Générale' },
    date: new Date().toISOString(),
    date_humaine: 'Il y a 2 jours',
  },
]

export const mockStatistiques: DashboardStatistiques = {
  par_type: [
    { code: 'ENTRANT', libelle: 'Courrier entrant', total: 450 },
    { code: 'SORTANT', libelle: 'Courrier sortant', total: 220 },
    { code: 'INTERNE', libelle: 'Courrier interne', total: 160 },
  ],
  par_statut: [
    { code: 'ENREGISTRE', libelle: 'Enregistré', total: 40 },
    { code: 'AFFECTE', libelle: 'Affecté', total: 120 },
    { code: 'EN_COURS', libelle: 'En cours', total: 192 },
    { code: 'TRAITE', libelle: 'Traité', total: 188 },
    { code: 'VALIDE', libelle: 'Validé', total: 96 },
    { code: 'CLOTURE', libelle: 'Clôturé', total: 74 },
    { code: 'REJETE', libelle: 'Rejeté', total: 18 },
    { code: 'ARCHIVE', libelle: 'Archivé', total: 102 },
  ],
  par_priorite: [
    { code: 'BASSE', libelle: 'Basse', niveau: 1, total: 120 },
    { code: 'NORMALE', libelle: 'Normale', niveau: 2, total: 410 },
    { code: 'HAUTE', libelle: 'Haute', niveau: 3, total: 210 },
    { code: 'URGENTE', libelle: 'Urgente', niveau: 4, total: 90 },
  ],
  par_categorie: [
    { libelle: 'Administratif', total: 210 },
    { libelle: 'Financier', total: 180 },
    { libelle: 'Technique', total: 150 },
    { libelle: 'Juridique', total: 95 },
    { libelle: 'Ressources humaines', total: 80 },
    { libelle: 'Commercial', total: 65 },
    { libelle: 'Correspondance générale', total: 50 },
  ],
  par_confidentialite: [
    { confidentialite: 'PUBLIC', total: 230 },
    { confidentialite: 'INTERNE', total: 420 },
    { confidentialite: 'CONFIDENTIEL', total: 140 },
    { confidentialite: 'TRES_CONFIDENTIEL', total: 40 },
  ],
  delai_moyen_traitement_jours: 4.6,
}

export const mockTypes: Referentiel[] = [
  { id: 1, code: 'ENTRANT', libelle: 'Courrier entrant' },
  { id: 2, code: 'SORTANT', libelle: 'Courrier sortant' },
  { id: 3, code: 'INTERNE', libelle: 'Courrier interne' },
]

export const mockCategories: Referentiel[] = [
  { id: 1, libelle: 'Administratif' },
  { id: 2, libelle: 'Financier' },
  { id: 3, libelle: 'Juridique' },
  { id: 4, libelle: 'Technique' },
  { id: 5, libelle: 'Ressources humaines' },
  { id: 6, libelle: 'Correspondance générale' },
]

export const mockPriorites: Referentiel[] = [
  { id: 1, code: 'BASSE', libelle: 'Basse', niveau: 1 },
  { id: 2, code: 'NORMALE', libelle: 'Normale', niveau: 2 },
  { id: 3, code: 'HAUTE', libelle: 'Haute', niveau: 3 },
  { id: 4, code: 'URGENTE', libelle: 'Urgente', niveau: 4 },
]

export const mockStatuts: Referentiel[] = [
  { id: 1, code: 'ENREGISTRE', libelle: 'Enregistré' },
  { id: 2, code: 'AFFECTE', libelle: 'Affecté' },
  { id: 3, code: 'EN_COURS', libelle: 'En cours' },
  { id: 4, code: 'TRAITE', libelle: 'Traité' },
  { id: 5, code: 'VALIDE', libelle: 'Validé' },
  { id: 6, code: 'CLOTURE', libelle: 'Clôturé' },
  { id: 7, code: 'REJETE', libelle: 'Rejeté' },
  { id: 8, code: 'ARCHIVE', libelle: 'Archivé' },
]

export const mockExpediteurs: Partenaire[] = [
  { id: 1, nom: 'Ministère du Budget' },
  { id: 2, nom: 'Direction Générale DGRAD' },
  { id: 3, nom: 'Fondeg Catering Congo S.A.' },
]

export const mockDestinataires: Partenaire[] = [
  { id: 1, nom: 'Direction Générale' },
  { id: 2, nom: 'Direction DANTIC' },
  { id: 3, nom: 'Direction Administrative et Financière' },
]

export const mockCourrierPage: Paginated<Courrier> = {
  current_page: 1,
  data: mockCourriers,
  last_page: 1,
  per_page: 15,
  total: mockCourriers.length,
  from: 1,
  to: mockCourriers.length,
}
