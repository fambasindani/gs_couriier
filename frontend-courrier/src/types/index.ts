export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  errors?: unknown
}

export interface Permission {
  id: number
  nom: string
  slug: string
  description: string | null
}

export interface Role {
  id: number
  nom: string
  description: string | null
  permissions?: Permission[]
}

export interface User {
  id: number
  name: string
  email: string
  actif: boolean
  roles: Role[]
}

export interface AuthPayload {
  user: User
  token: string
}

export interface Referentiel {
  id: number
  code?: string
  libelle: string
  description?: string | null
  niveau?: number
}

export interface Partenaire {
  id: number
  nom: string
  email?: string | null
  telephone?: string | null
  adresse?: string | null
  type_personne?: 'PHYSIQUE' | 'MORALE'
  type_destinataire?: 'INTERNE' | 'EXTERNE'
}

export interface Courrier {
  id: number
  numero: string
  reference_externe?: string | null
  objet: string
  contenu?: string | null
  confidentialite: 'PUBLIC' | 'INTERNE' | 'CONFIDENTIEL' | 'TRES_CONFIDENTIEL'
  date_courrier?: string | null
  date_reception?: string | null
  date_limite?: string | null
  date_cloture?: string | null
  type_courrier?: Referentiel | null
  categorie?: Referentiel | null
  priorite?: Referentiel | null
  statut?: Referentiel | null
  expediteur?: Partenaire | null
  destinataire?: Partenaire | null
  createur?: User | null
  nombre_pages?: number | null
  observation?: string | null
  /** Ajouté par /courriers/en-retard. */
  jours_retard?: number | null
}

export interface DashboardOverview {
  total_courriers: number
  entrants: number
  sortants: number
  internes: number
  en_cours: number
  traites: number
  valides: number
  clotures: number
  en_retard: number
  ce_mois: number
  mois_precedent: number
  tendance_pourcentage: number
  total_pieces_jointes: number
  utilisateurs_actifs: number
}

export interface VolumeMensuel {
  labels: string[]
  datasets: {
    entrants: number[]
    sortants: number[]
    internes: number[]
  }
}

export interface ActiviteLog {
  id: number
  event: string
  url?: string | null
  user: { id: number; name: string } | null
  date: string
  date_humaine: string
}

export interface StatistiqueItem {
  libelle: string | null
  code?: string
  niveau?: number
  total: number
}

export interface ConfidentialiteItem {
  confidentialite: string
  total: number
}

export interface DashboardStatistiques {
  par_type: StatistiqueItem[]
  par_statut: StatistiqueItem[]
  par_priorite: StatistiqueItem[]
  par_categorie: StatistiqueItem[]
  par_confidentialite: ConfidentialiteItem[]
  delai_moyen_traitement_jours: number
}

export interface Paginated<T> {
  current_page: number
  data: T[]
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface UniteStructure {
  id: number
  code?: string
  libelle: string
  direction_id?: number
  departement_id?: number
}

export interface CourrierPiece {
  id: number
  courrier_id: number
  courrier?: Courrier | null
  nom_original: string
  nom_fichier: string
  chemin: string
  extension?: string | null
  mime_type?: string | null
  taille?: number | null
  texte_ocr?: string | null
  est_principal: boolean
  uploaded_by?: number | null
  created_at?: string
  uploade_par?: User | null
}

export interface CourrierAffectation {
  id: number
  courrier_id: number
  courrier?: Courrier | null
  direction?: UniteStructure | null
  departement?: UniteStructure | null
  service?: UniteStructure | null
  user?: User | null
  affecte_par?: User | null
  date_affectation: string
  date_limite?: string | null
  date_prise_en_charge?: string | null
  date_traitement?: string | null
  statut: 'AFFECTE' | 'PRIS_EN_CHARGE' | 'EN_TRAITEMENT' | 'TRAITE' | 'REJETE'
}

export interface CourrierAnnotation {
  id: number
  courrier_id: number
  courrier?: Courrier | null
  user?: User | null
  annotation: string
  date_limite?: string | null
  etat: 'EN_ATTENTE' | 'EN_COURS' | 'EXECUTEE' | 'ANNULEE'
  created_at?: string
}

export interface CourrierValidation {
  id: number
  courrier_id: number
  courrier?: Courrier | null
  user?: User | null
  decision: 'VISE' | 'VALIDE' | 'REJETE'
  commentaire?: string | null
  date_validation?: string | null
  created_at?: string
}

export interface CourrierHistorique {
  id: number
  action: string
  etape?: string | null
  description?: string | null
  user?: { id: number; name: string } | null
  date: string
  adresse_ip?: string | null
}

export interface TimelineItem {
  titre: string
  description?: string | null
  auteur: string
  date: string
  timestamp: string
  icone?: string
}

export interface CourrierDetail extends Courrier {
  updated_by?: number | null
  modificateur?: User | null
  parent?: Pick<Courrier, 'id' | 'numero' | 'objet' | 'date_reception'> | null
  reponses?: Courrier[]
  pieces?: CourrierPiece[]
  affectations?: CourrierAffectation[]
  annotations?: CourrierAnnotation[]
  validations?: CourrierValidation[]
  historiques?: CourrierHistorique[]
}

export interface CourrierStats {
  total: number
  en_retard: number
  avec_parent: number
  avec_reponses: number
  avec_pieces: number
  aujourd_hui: number
  cette_semaine: number
  ce_mois: number
}

export interface CourrierLies {
  courrier: { id: number; numero: string; objet: string }
  parent: Pick<Courrier, 'id' | 'numero' | 'objet' | 'date_reception'> | null
  reponses: Courrier[]
  total_reponses: number
}

export interface CourrierTimeline {
  courrier: { id: number; numero: string }
  timeline: TimelineItem[]
}

export interface CircuitEtape {
  id: number
  action: string
  etape?: string | null
  description?: string | null
  user?: { id: number; name: string } | null
  date: string
  adresse_ip?: string | null
}

export interface CircuitData {
  courrier: {
    id: number
    numero: string
    objet: string
    statut_actuel?: string | null
    date_reception?: string | null
  }
  etapes: CircuitEtape[]
  total_etapes: number
}

export interface EtapeActuelle {
  action: string
  etape?: string | null
  description?: string | null
  user?: string | null
  date: string
}

export interface ArchiveCategory {
  id: number
  libelle: string
  description?: string | null
  archives?: { id: number }[]
}

export interface ArchiveEmplacement {
  id: number
  intitule: string
  salle?: string | null
  description?: string | null
  archives?: { id: number }[]
}

export interface Archive {
  id: number
  courrier_id?: number | null
  archive_category_id?: number | null
  archive_emplacement_id?: number | null
  /** Colonne FK ; devient l'objet User chargé via la relation archive_par. */
  archive_par?: number | User | null
  cote_archive: string
  titre_dossier: string
  producteur_service?: string | null
  date_periode?: string | null
  duree_conservation_ans: number
  date_versement?: string | null
  date_fin_conservation?: string | null
  statut_archive: 'ACTIF' | 'VERSE' | 'ELIMINE'
  observation?: string | null
  created_at?: string
  courrier?: Courrier | null
  category?: ArchiveCategory | null
  emplacement?: ArchiveEmplacement | null
}
