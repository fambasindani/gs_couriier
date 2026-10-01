import { http, type QueryValue } from '@/lib/http'
import type { ApiEnvelope, LettreModele, Paginated } from '@/types'

export const lettreModelesService = {
  list: (params: Record<string, QueryValue> = {}) =>
    http.get<ApiEnvelope<Paginated<LettreModele>>>('/lettre-modeles', { query: params }),
  create: (payload: Record<string, unknown>) =>
    http.post<ApiEnvelope<LettreModele>>('/lettre-modeles', payload),
  update: (id: number | string, payload: Record<string, unknown>) =>
    http.put<ApiEnvelope<LettreModele>>(`/lettre-modeles/${id}`, payload),
  remove: (id: number | string) => http.delete<ApiEnvelope<null>>(`/lettre-modeles/${id}`),
}
