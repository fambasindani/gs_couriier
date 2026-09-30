import { http } from '@/lib/http'
import type { ApiEnvelope, AuthPayload, User } from '@/types'

export const authService = {
  async login(email: string, password: string): Promise<AuthPayload> {
    const res = await http.post<ApiEnvelope<AuthPayload>>('/login', { email, password })
    return res.data
  },

  async me(): Promise<User> {
    const res = await http.get<ApiEnvelope<User>>('/me')
    return res.data
  },

  async logout(): Promise<void> {
    await http.post<ApiEnvelope<null>>('/logout')
  },

  async updateProfile(payload: { name?: string; email?: string }): Promise<User> {
    const res = await http.put<ApiEnvelope<User>>('/me', payload)
    return res.data
  },

  async updatePassword(payload: {
    current_password: string
    password: string
    password_confirmation: string
  }): Promise<void> {
    await http.put<ApiEnvelope<null>>('/me/password', payload)
  },
}
