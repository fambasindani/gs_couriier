import { API_URL, http, type QueryValue } from '@/lib/http'
import { tokenStorage } from '@/lib/auth-token'
import type { ApiEnvelope, CourrierPiece, Paginated } from '@/types'

export const piecesService = {
  list(params: Record<string, QueryValue> = {}) {
    return http.get<ApiEnvelope<Paginated<CourrierPiece>>>('/courrier-pieces', {
      query: { per_page: 20, ...params },
    })
  },

  upload(courrierId: number | string, file: File, estPrincipal = false) {
    const form = new FormData()
    form.append('courrier_id', String(courrierId))
    form.append('fichier', file)
    form.append('est_principal', estPrincipal ? '1' : '0')
    return http.post<ApiEnvelope<CourrierPiece>>('/courrier-pieces', form)
  },

  remove(id: number | string) {
    return http.delete<ApiEnvelope<null>>(`/courrier-pieces/${id}`)
  },

  async download(id: number | string, nomFichier: string): Promise<void> {
    const token = tokenStorage.get()
    const response = await fetch(`${API_URL}/api/courrier-pieces/${id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) throw new Error('Téléchargement impossible.')

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = nomFichier
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },
}
