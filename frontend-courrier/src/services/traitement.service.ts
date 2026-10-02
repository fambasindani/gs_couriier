import { http, type QueryValue } from '@/lib/http'
import type {
  ApiEnvelope,
  CircuitData,
  CourrierAffectation,
  CourrierAnnotation,
  CourrierValidation,
  EtapeActuelle,
  Paginated,
} from '@/types'

export type Query = Record<string, QueryValue>

export interface AffectationPayload {
  courrier_id: number
  direction_id?: number | null
  departement_id?: number | null
  service_id?: number | null
  user_id?: number | null
  date_limite?: string | null
  statut?: string
}

export interface AnnotationPayload {
  courrier_id: number
  annotation: string
  date_limite?: string | null
  etat?: string
}

export interface ValidationPayload {
  courrier_id: number
  decision: 'VISE' | 'VALIDE' | 'REJETE'
  commentaire?: string | null
}

export const affectationsService = {
  list: (params: Query = {}) =>
    http.get<ApiEnvelope<Paginated<CourrierAffectation>>>('/courrier-affectations', { query: params }),
  create: (payload: AffectationPayload) =>
    http.post<ApiEnvelope<CourrierAffectation>>('/courrier-affectations', payload),
  update: (id: number | string, payload: Partial<AffectationPayload>) =>
    http.put<ApiEnvelope<CourrierAffectation>>(`/courrier-affectations/${id}`, payload),
  remove: (id: number | string) => http.delete<ApiEnvelope<null>>(`/courrier-affectations/${id}`),
  accuserReception: (id: number | string) =>
    http.post<ApiEnvelope<CourrierAffectation>>(`/courrier-affectations/${id}/accuser-reception`),
}

export const annotationsService = {
  list: (params: Query = {}) =>
    http.get<ApiEnvelope<Paginated<CourrierAnnotation>>>('/courrier-annotations', { query: params }),
  create: (payload: AnnotationPayload) =>
    http.post<ApiEnvelope<CourrierAnnotation>>('/courrier-annotations', payload),
  update: (id: number | string, payload: Partial<AnnotationPayload>) =>
    http.put<ApiEnvelope<CourrierAnnotation>>(`/courrier-annotations/${id}`, payload),
  remove: (id: number | string) => http.delete<ApiEnvelope<null>>(`/courrier-annotations/${id}`),
}

export const validationsService = {
  list: (params: Query = {}) =>
    http.get<ApiEnvelope<Paginated<CourrierValidation>>>('/courrier-validations', { query: params }),
  create: (payload: ValidationPayload) =>
    http.post<ApiEnvelope<CourrierValidation>>('/courrier-validations', payload),
  update: (id: number | string, payload: Partial<ValidationPayload>) =>
    http.put<ApiEnvelope<CourrierValidation>>(`/courrier-validations/${id}`, payload),
  remove: (id: number | string) => http.delete<ApiEnvelope<null>>(`/courrier-validations/${id}`),
}

export const circuitService = {
  get: (courrierId: number | string) =>
    http.get<ApiEnvelope<CircuitData>>(`/courriers/${courrierId}/circuit`),
  etapeActuelle: (courrierId: number | string) =>
    http.get<ApiEnvelope<EtapeActuelle | null>>(`/courriers/${courrierId}/etape-actuelle`),
  timeline: (courrierId: number | string) =>
    http.get<ApiEnvelope<{ courrier: { id: number; numero: string }; timeline: unknown[] }>>(
      `/courriers/${courrierId}/timeline`,
    ),
}
