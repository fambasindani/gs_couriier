import { http } from '@/lib/http'
import type { ApiEnvelope, NotificationsResponse } from '@/types'

export const notificationsService = {
  async list(): Promise<NotificationsResponse> {
    const res = await http.get<ApiEnvelope<NotificationsResponse>>('/notifications')
    return res.data
  },
}
