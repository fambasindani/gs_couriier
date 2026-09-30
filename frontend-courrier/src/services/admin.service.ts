import { http, type QueryValue } from '@/lib/http'
import { fetchAll } from './referentiels.service'
import type {
  ApiEnvelope,
  AuditLog,
  Paginated,
  ParametreGeneral,
  Permission,
  Role,
  UniteStructure,
  User,
} from '@/types'

export type Query = Record<string, QueryValue>

export const utilisateursService = {
  list: (params: Query = {}) =>
    http.get<ApiEnvelope<Paginated<User>>>('/users', { query: params }),
  all: () => fetchAll<User>('/users'),
  create: (payload: Record<string, unknown>) => http.post<ApiEnvelope<User>>('/users', payload),
  update: (id: number | string, payload: Record<string, unknown>) =>
    http.put<ApiEnvelope<User>>(`/users/${id}`, payload),
  remove: (id: number | string) => http.delete<ApiEnvelope<null>>(`/users/${id}`),
}

export const rolesService = {
  list: (params: Query = {}) =>
    http.get<ApiEnvelope<Paginated<Role>>>('/roles', { query: params }),
  all: () => fetchAll<Role>('/roles'),
  create: (payload: Record<string, unknown>) => http.post<ApiEnvelope<Role>>('/roles', payload),
  update: (id: number | string, payload: Record<string, unknown>) =>
    http.put<ApiEnvelope<Role>>(`/roles/${id}`, payload),
  remove: (id: number | string) => http.delete<ApiEnvelope<null>>(`/roles/${id}`),
}

export const permissionsService = {
  list: (params: Query = {}) =>
    http.get<ApiEnvelope<Paginated<Permission>>>('/permissions', { query: params }),
  all: () => fetchAll<Permission>('/permissions'),
  create: (payload: Record<string, unknown>) =>
    http.post<ApiEnvelope<Permission>>('/permissions', payload),
  update: (id: number | string, payload: Record<string, unknown>) =>
    http.put<ApiEnvelope<Permission>>(`/permissions/${id}`, payload),
  remove: (id: number | string) => http.delete<ApiEnvelope<null>>(`/permissions/${id}`),
}

export const structureService = {
  directions: (params: Query = {}) =>
    http.get<ApiEnvelope<Paginated<UniteStructure>>>('/directions', { query: params }),
  directionsAll: () => fetchAll<UniteStructure>('/directions'),
  createDirection: (payload: Record<string, unknown>) =>
    http.post<ApiEnvelope<UniteStructure>>('/directions', payload),
  updateDirection: (id: number | string, payload: Record<string, unknown>) =>
    http.put<ApiEnvelope<UniteStructure>>(`/directions/${id}`, payload),
  removeDirection: (id: number | string) => http.delete<ApiEnvelope<null>>(`/directions/${id}`),

  departements: (params: Query = {}) =>
    http.get<ApiEnvelope<Paginated<UniteStructure>>>('/departements', { query: params }),
  departementsAll: () => fetchAll<UniteStructure>('/departements'),
  createDepartement: (payload: Record<string, unknown>) =>
    http.post<ApiEnvelope<UniteStructure>>('/departements', payload),
  updateDepartement: (id: number | string, payload: Record<string, unknown>) =>
    http.put<ApiEnvelope<UniteStructure>>(`/departements/${id}`, payload),
  removeDepartement: (id: number | string) => http.delete<ApiEnvelope<null>>(`/departements/${id}`),

  services: (params: Query = {}) =>
    http.get<ApiEnvelope<Paginated<UniteStructure>>>('/services', { query: params }),
  createService: (payload: Record<string, unknown>) =>
    http.post<ApiEnvelope<UniteStructure>>('/services', payload),
  updateService: (id: number | string, payload: Record<string, unknown>) =>
    http.put<ApiEnvelope<UniteStructure>>(`/services/${id}`, payload),
  removeService: (id: number | string) => http.delete<ApiEnvelope<null>>(`/services/${id}`),
}

export const auditService = {
  list: (params: Query = {}) =>
    http.get<ApiEnvelope<Paginated<AuditLog>>>('/audit-logs', { query: params }),
  show: (id: number | string) => http.get<ApiEnvelope<AuditLog>>(`/audit-logs/${id}`),
  remove: (id: number | string) => http.delete<ApiEnvelope<null>>(`/audit-logs/${id}`),
}

export const parametresService = {
  list: (params: Query = {}) =>
    http.get<ApiEnvelope<Paginated<ParametreGeneral>>>('/parametres', { query: params }),
  create: (payload: Record<string, unknown>) =>
    http.post<ApiEnvelope<ParametreGeneral>>('/parametres', payload),
  update: (id: number | string, payload: Record<string, unknown>) =>
    http.put<ApiEnvelope<ParametreGeneral>>(`/parametres/${id}`, payload),
  remove: (id: number | string) => http.delete<ApiEnvelope<null>>(`/parametres/${id}`),
}
