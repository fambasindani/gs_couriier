import { API_URL, http, type QueryValue } from '@/lib/http'
import { tokenStorage } from '@/lib/auth-token'
import type {
  ApiEnvelope,
  RapportConfidentialite,
  RapportDelais,
  RapportPerformanceAgents,
  RapportPerformanceServices,
  RapportTraitement,
  RapportVolumes,
} from '@/types'

export type Query = Record<string, QueryValue>

export interface ExportParams {
  type?: string
  date_debut?: string
  date_fin?: string
}

export const rapportsService = {
  traitement: (params: Query = {}) =>
    http.get<ApiEnvelope<RapportTraitement>>('/rapports/traitement', { query: params }),

  delais: (params: Query = {}) =>
    http.get<ApiEnvelope<RapportDelais>>('/rapports/delais', { query: params }),

  performanceServices: (params: Query = {}) =>
    http.get<ApiEnvelope<RapportPerformanceServices>>('/rapports/performance-services', {
      query: params,
    }),

  performanceAgents: (params: Query = {}) =>
    http.get<ApiEnvelope<RapportPerformanceAgents>>('/rapports/performance-agents', {
      query: params,
    }),

  volumes: (params: Query = {}) =>
    http.get<ApiEnvelope<RapportVolumes>>('/rapports/volumes', { query: params }),

  confidentialite: (params: Query = {}) =>
    http.get<ApiEnvelope<RapportConfidentialite>>('/rapports/confidentialite', { query: params }),

  /** Télécharge l'export CSV (stream) via fetch authentifié. */
  async exportCsv(params: ExportParams = {}): Promise<void> {
    const token = tokenStorage.get()
    const query = new URLSearchParams()
    if (params.type) query.append('type', params.type)
    if (params.date_debut) query.append('date_debut', params.date_debut)
    if (params.date_fin) query.append('date_fin', params.date_fin)

    const response = await fetch(`${API_URL}/api/rapports/export?${query.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) throw new Error("Export impossible. Vérifiez vos droits et la période.")

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rapport_${params.type ?? 'courriers'}_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },
}
