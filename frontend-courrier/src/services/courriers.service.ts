import { http, type QueryValue } from '@/lib/http'
import type {
  ApiEnvelope,
  Courrier,
  CourrierDetail,
  CourrierLies,
  CourrierStats,
  CourrierTimeline,
  LettreGeneree,
  Paginated,
} from '@/types'

export type Query = Record<string, QueryValue>

export interface CourrierListParams extends Query {
  search?: string
  type_courrier_id?: number | string
  categorie_id?: number | string
  priorite_id?: number | string
  statut_id?: number | string
  confidentialite?: string
  date_debut?: string
  date_fin?: string
  per_page?: number
  page?: number
}

export interface RechercheParams extends Query {
  q?: string
  type_courrier_id?: number | string
  categorie_id?: number | string
  priorite_id?: number | string
  statut_id?: number | string
  expediteur_id?: number | string
  destinataire_id?: number | string
  created_by?: number | string
  confidentialite?: string
  date_debut?: string
  date_fin?: string
  date_limite_debut?: string
  date_limite_fin?: string
  min_pieces?: number | string
  max_pieces?: number | string
  en_retard?: boolean | string
  avec_pieces?: boolean | string
  avec_reponses?: boolean | string
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

export interface CourrierPayload {
  type_courrier_id: number
  categorie_id?: number | null
  priorite_id: number
  statut_id: number
  expediteur_id?: number | null
  destinataire_id?: number | null
  courrier_parent_id?: number | null
  reference_externe?: string | null
  objet: string
  contenu?: string | null
  date_courrier?: string | null
  date_reception?: string | null
  date_limite?: string | null
  date_cloture?: string | null
  confidentialite?: string
  nombre_pages?: number | null
  observation?: string | null
}

export interface ArchivePayload {
  archive_category_id?: number | null
  archive_emplacement_id?: number | null
  titre_dossier?: string
  duree_conservation_ans?: number | null
  observation?: string | null
}

export const courriersService = {
  list(params: CourrierListParams = {}) {
    return http.get<ApiEnvelope<Paginated<Courrier>>>('/courriers', { query: params })
  },

  show(id: number | string) {
    return http.get<ApiEnvelope<CourrierDetail>>(`/courriers/${id}`)
  },

  create(payload: CourrierPayload) {
    return http.post<ApiEnvelope<Courrier>>('/courriers', payload)
  },

  update(id: number | string, payload: Partial<CourrierPayload>) {
    return http.put<ApiEnvelope<Courrier>>(`/courriers/${id}`, payload)
  },

  remove(id: number | string) {
    return http.delete<ApiEnvelope<null>>(`/courriers/${id}`)
  },

  stats() {
    return http.get<ApiEnvelope<CourrierStats>>('/courriers/stats')
  },

  enRetard(params: CourrierListParams = {}) {
    return http.get<ApiEnvelope<Paginated<Courrier>>>('/courriers/en-retard', { query: params })
  },

  rechercheAvancee(params: RechercheParams = {}) {
    return http.get<ApiEnvelope<Paginated<Courrier>>>('/courriers/recherche-avancee', { query: params })
  },

  lies(id: number | string) {
    return http.get<ApiEnvelope<CourrierLies>>(`/courriers/${id}/lies`)
  },

  lier(id: number | string, parentId: number | string) {
    return http.post<ApiEnvelope<CourrierDetail>>(`/courriers/${id}/lier`, {
      courrier_parent_id: parentId,
    })
  },

  delier(id: number | string) {
    return http.delete<ApiEnvelope<Courrier>>(`/courriers/${id}/delier`)
  },

  archiver(id: number | string, payload: ArchivePayload = {}) {
    return http.post<ApiEnvelope<unknown>>(`/courriers/${id}/archiver`, payload)
  },

  cloturer(id: number | string) {
    return http.post<ApiEnvelope<Courrier>>(`/courriers/${id}/cloturer`)
  },

  annuler(id: number | string) {
    return http.post<ApiEnvelope<Courrier>>(`/courriers/${id}/annuler`)
  },

  genererLettre(id: number | string, lettreModeleId: number) {
    return http.post<ApiEnvelope<LettreGeneree>>(`/courriers/${id}/lettre`, {
      lettre_modele_id: lettreModeleId,
    })
  },

  timeline(id: number | string) {
    return http.get<ApiEnvelope<CourrierTimeline>>(`/courriers/${id}/timeline`)
  },
}
