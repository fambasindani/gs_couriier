import { http, type QueryValue } from '@/lib/http'
import { fetchAll } from './referentiels.service'
import type {
  ApiEnvelope,
  Archive,
  ArchiveCategory,
  ArchiveEmplacement,
  Paginated,
} from '@/types'

export type Query = Record<string, QueryValue>

export interface ArchivePayload {
  courrier_id?: number | null
  archive_category_id?: number | null
  archive_emplacement_id?: number | null
  titre_dossier: string
  producteur_service?: string | null
  date_periode?: string | null
  duree_conservation_ans?: number | null
  date_versement?: string | null
  observation?: string | null
}

/** Seul update accepte statut_archive (le backend force 'ACTIF' à la création). */
export interface ArchiveUpdatePayload extends ArchivePayload {
  statut_archive?: string
}

export const archivesService = {
  list: (params: Query = {}) =>
    http.get<ApiEnvelope<Paginated<Archive>>>('/archives', { query: params }),
  create: (payload: ArchivePayload) =>
    http.post<ApiEnvelope<Archive>>('/archives', payload),
  update: (id: number | string, payload: Partial<ArchiveUpdatePayload>) =>
    http.put<ApiEnvelope<Archive>>(`/archives/${id}`, payload),
  remove: (id: number | string) => http.delete<ApiEnvelope<null>>(`/archives/${id}`),
}

export const archiveCategoriesService = {
  list: (params: Query = {}) =>
    http.get<ApiEnvelope<Paginated<ArchiveCategory>>>('/archive-categories', { query: params }),
  all: () => fetchAll<ArchiveCategory>('/archive-categories'),
  create: (payload: { libelle: string; description?: string | null }) =>
    http.post<ApiEnvelope<ArchiveCategory>>('/archive-categories', payload),
  update: (id: number | string, payload: { libelle?: string; description?: string | null }) =>
    http.put<ApiEnvelope<ArchiveCategory>>(`/archive-categories/${id}`, payload),
  remove: (id: number | string) => http.delete<ApiEnvelope<null>>(`/archive-categories/${id}`),
}

export const archiveEmplacementsService = {
  list: (params: Query = {}) =>
    http.get<ApiEnvelope<Paginated<ArchiveEmplacement>>>('/archive-emplacements', { query: params }),
  all: () => fetchAll<ArchiveEmplacement>('/archive-emplacements'),
  create: (payload: { intitule: string; salle?: string | null; description?: string | null }) =>
    http.post<ApiEnvelope<ArchiveEmplacement>>('/archive-emplacements', payload),
  update: (
    id: number | string,
    payload: { intitule?: string; salle?: string | null; description?: string | null },
  ) => http.put<ApiEnvelope<ArchiveEmplacement>>(`/archive-emplacements/${id}`, payload),
  remove: (id: number | string) => http.delete<ApiEnvelope<null>>(`/archive-emplacements/${id}`),
}
