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
  direction_id?: number | null
  departement_id?: number | null
  service_id?: number | null
  roles: Role[]
  direction?: UniteStructure | null
  departement?: UniteStructure | null
  service?: UniteStructure | null
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
  direction?: UniteStructure | null
  departement?: UniteStructure | null
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
  date_accuse_reception?: string | null
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
  projets?: ProjetLettre[]
  projets_sortants?: ProjetLettre[]
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

export interface LettreModele {
  id: number
  nom: string
  objet?: string | null
  corps: string
  type_courrier_id?: number | null
  actif: boolean
  created_by?: number | null
  type_courrier?: Referentiel | null
  createur?: User | null
}

export interface LettreGeneree {
  modele: { id: number; nom: string }
  objet: string | null
  corps: string
  courrier: { id: number; numero: string }
}

export interface VersionProjetLettre {
  id: number
  projet_lettre_id: number
  numero_version: number
  chemin_fichier: string
  nom_fichier_original: string
  commentaire?: string | null
  utilisateur_id?: number | null
  date_creation?: string | null
  est_version_finale: boolean
  utilisateur?: User | null
  created_at?: string
}

export interface ValidationProjetLettre {
  id: number
  projet_lettre_id: number
  version_projet_id?: number | null
  valideur_id?: number | null
  decision: 'APPROUVE' | 'CORRECTION' | 'REJETE'
  observation?: string | null
  date_decision?: string | null
  niveau_validation: number
  valideur?: User | null
  version?: VersionProjetLettre | null
  created_at?: string
}

export interface HistoriqueProjetLettre {
  id: number
  projet_lettre_id: number
  utilisateur_id?: number | null
  action: string
  ancien_statut?: string | null
  nouveau_statut?: string | null
  commentaire?: string | null
  date_action?: string | null
  utilisateur?: User | null
  created_at?: string
}

export interface ProjetLettre {
  id: number
  reference_projet: string
  courrier_entrant_id?: number | null
  dossier_id?: number | null
  objet: string
  destinataire?: string | null
  service_redacteur_id?: number | null
  createur_id: number
  signataire_id?: number | null
  statut: string
  date_creation?: string | null
  date_soumission?: string | null
  date_validation?: string | null
  date_signature?: string | null
  courrier_sortant_id?: number | null
  date_expedition?: string | null
  mode_expedition?: string | null
  courrier_entrant?: Courrier | null
  courrier_sortant?: Courrier | null
  service_redacteur?: UniteStructure | null
  createur?: User | null
  signataire?: User | null
  versions?: VersionProjetLettre[]
  validations?: ValidationProjetLettre[]
  historique?: HistoriqueProjetLettre[]
  created_at?: string
  updated_at?: string
}

export interface NotificationItem {
  id: string
  type: 'retard' | 'affectation' | 'courrier' | string
  title: string
  description: string
  date: string | null
  date_humaine: string
  url: string
}

export interface NotificationsResponse {
  total: number
  items: NotificationItem[]
}

export interface AuditLog {
  id: number
  user_id?: number | null
  event: string
  url?: string | null
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
  user?: User | null
}

export interface ParametreGeneral {
  id: number
  cle: string
  valeur: string | number | boolean | null
  type: 'string' | 'int' | 'bool' | 'json'
  groupe: string
  description?: string | null
}

export interface RapportPeriode {
  debut: string
  fin: string
}

export interface RapportTraitement {
  periode: RapportPeriode
  compteurs: {
    total_recus: number
    traites: number
    en_cours: number
    en_retard: number
    courriers_affectes: number
  }
  taux_traitement_pourcentage: number
  delai_moyen_traitement_jours: number
  delai_moyen_affectation_heures: number
}

export interface RapportDelais {
  periode: RapportPeriode
  total_avec_limite: number
  dans_les_temps: number
  en_retard: number
  taux_respect_delais_pourcentage: number
  retards: { '1_a_3_jours': number; plus_de_3_jours: number }
  delais_moyens_par_priorite: {
    libelle: string
    code: string
    niveau: number | string
    delai_moyen_jours: number | string | null
    total: number | string
  }[]
}

export interface PerfUnite {
  id: number
  code: string
  libelle: string
  total_courriers: number | string
  traites: number | string
  en_cours?: number | string
  delai_moyen_jours: number | string | null
}

export interface PerfAgent {
  id: number
  name: string
  email: string
  total_courriers: number | string
  traites: number | string
  en_cours: number | string
  delai_moyen_jours: number | string | null
}

export interface RapportPerformanceServices {
  periode: RapportPeriode
  par_direction: PerfUnite[]
  par_departement: PerfUnite[]
  par_service: PerfUnite[]
  top_5_services: PerfUnite[]
  services_en_difficulte: PerfUnite[]
}

export interface RapportPerformanceAgents {
  periode: RapportPeriode
  agents: PerfAgent[]
  top_3_agents: PerfAgent[]
  total_agents_actifs: number
}

export interface RapportVolumes {
  annee: number | string
  par_mois: { mois: number | string; annee: number | string; total: number | string }[]
  par_type: { libelle: string; total: number | string }[]
  par_categorie: { libelle: string | null; total: number | string }[]
}

export interface RapportConfidentialite {
  periode: RapportPeriode
  par_confidentialite: { confidentialite: string; total: number | string }[]
  tres_confidentiels_par_direction: { libelle: string; total: number | string }[]
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
