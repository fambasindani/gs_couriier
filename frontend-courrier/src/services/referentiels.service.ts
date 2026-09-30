import { http, type QueryValue } from '@/lib/http'
import type { ApiEnvelope, Paginated, Partenaire, Referentiel } from '@/types'

export type Query = Record<string, QueryValue>

export async function fetchAll<T>(
  path: string,
  params: Record<string, QueryValue> = {},
): Promise<T[]> {
  const res = await http.get<ApiEnvelope<Paginated<T>>>(path, {
    query: { per_page: 100, ...params },
  })
  return res.data.data
}

export interface CrudService<T> {
  list: (params?: Query) => Promise<ApiEnvelope<Paginated<T>>>
  create: (payload: Record<string, unknown>) => Promise<ApiEnvelope<T>>
  update: (id: number | string, payload: Record<string, unknown>) => Promise<ApiEnvelope<T>>
  remove: (id: number | string) => Promise<ApiEnvelope<null>>
}

/** Fabrique un service CRUD standard pour une ressource référentielle. */
function crud<T>(base: string): CrudService<T> {
  return {
    list: (params: Query = {}) =>
      http.get<ApiEnvelope<Paginated<T>>>(base, { query: params }),
    create: (payload) => http.post<ApiEnvelope<T>>(base, payload),
    update: (id, payload) => http.put<ApiEnvelope<T>>(`${base}/${id}`, payload),
    remove: (id) => http.delete<ApiEnvelope<null>>(`${base}/${id}`),
  }
}

/** Référentiels du module Courrier, chargés en entier pour les listes déroulantes. */
export const referentielsService = {
  types: (search?: string) => fetchAll<Referentiel>('/type-courriers', search ? { search } : {}),
  categories: (search?: string) =>
    fetchAll<Referentiel>('/categorie-courriers', search ? { search } : {}),
  priorites: (search?: string) => fetchAll<Referentiel>('/priorites', search ? { search } : {}),
  statuts: (search?: string) => fetchAll<Referentiel>('/statut-courriers', search ? { search } : {}),
  expediteurs: (search?: string) => fetchAll<Partenaire>('/expediteurs', search ? { search } : {}),
  destinataires: (search?: string) =>
    fetchAll<Partenaire>('/destinataires', search ? { search } : {}),
}

export const typeCourriersService = crud<Referentiel>('/type-courriers')
export const categoriesService = crud<Referentiel>('/categorie-courriers')
export const prioritesService = crud<Referentiel>('/priorites')
export const statutsService = crud<Referentiel>('/statut-courriers')
export const expediteursService = crud<Partenaire>('/expediteurs')
export const destinatairesService = crud<Partenaire>('/destinataires')
