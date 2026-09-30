import { http } from '@/lib/http'
import type {
  ActiviteLog,
  ApiEnvelope,
  Courrier,
  DashboardOverview,
  DashboardStatistiques,
  VolumeMensuel,
} from '@/types'

export const dashboardService = {
  async overview(): Promise<DashboardOverview> {
    const res = await http.get<ApiEnvelope<DashboardOverview>>('/dashboard/overview')
    return res.data
  },

  async volumeMensuel(): Promise<VolumeMensuel> {
    const res = await http.get<ApiEnvelope<VolumeMensuel>>('/dashboard/volume-mensuel')
    return res.data
  },

  async courriersRecents(limit = 5): Promise<Courrier[]> {
    const res = await http.get<ApiEnvelope<Courrier[]>>('/dashboard/courriers-recents', {
      query: { limit },
    })
    return res.data
  },

  async statistiques(): Promise<DashboardStatistiques> {
    const res = await http.get<ApiEnvelope<DashboardStatistiques>>('/dashboard/statistiques')
    return res.data
  },

  async activiteRecente(limit = 6): Promise<ActiviteLog[]> {
    const res = await http.get<ApiEnvelope<ActiviteLog[]>>('/dashboard/activite-recente', {
      query: { limit },
    })
    return res.data
  },
}
