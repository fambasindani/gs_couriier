import { http, type QueryValue } from '@/lib/http'
import { tokenStorage } from '@/lib/auth-token'
import type { ApiEnvelope, Paginated, ProjetLettre, VersionProjetLettre } from '@/types'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/+$/, '')

export const projetsLettresService = {
  list: (params: Record<string, QueryValue> = {}) =>
    http.get<ApiEnvelope<Paginated<ProjetLettre>>>('/projets-lettres', { query: params }),
  show: (id: number | string) =>
    http.get<ApiEnvelope<ProjetLettre>>(`/projets-lettres/${id}`),
  create: (payload: Record<string, unknown>) =>
    http.post<ApiEnvelope<ProjetLettre>>('/projets-lettres', payload),
  update: (id: number | string, payload: Record<string, unknown>) =>
    http.put<ApiEnvelope<ProjetLettre>>(`/projets-lettres/${id}`, payload),
  remove: (id: number | string) => http.delete<ApiEnvelope<null>>(`/projets-lettres/${id}`),

  genererWord: (id: number | string) =>
    http.post<ApiEnvelope<VersionProjetLettre>>(`/projets-lettres/${id}/generer-word`),

  importerVersion: (id: number | string, fichier: File, commentaire?: string) => {
    const form = new FormData()
    form.append('fichier', fichier)
    if (commentaire) form.append('commentaire', commentaire)
    return http.post<ApiEnvelope<VersionProjetLettre>>(`/projets-lettres/${id}/importer`, form)
  },

  async downloadVersion(id: number | string, versionId: number, nomFichier: string): Promise<void> {
    const token = tokenStorage.get()
    const response = await fetch(`${API_URL}/api/projets-lettres/${id}/versions/${versionId}/download`, {
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

  soumettre: (id: number | string, commentaire?: string) =>
    http.post<ApiEnvelope<ProjetLettre>>(`/projets-lettres/${id}/soumettre`, { commentaire }),

  decision: (id: number | string, decision: string, observation?: string) =>
    http.post<ApiEnvelope<ProjetLettre>>(`/projets-lettres/${id}/decision`, { decision, observation }),

  signer: (id: number | string, commentaire?: string) =>
    http.post<ApiEnvelope<ProjetLettre>>(`/projets-lettres/${id}/signer`, { commentaire }),

  creerCourrierSortant: (id: number | string) =>
    http.post<ApiEnvelope<ProjetLettre>>(`/projets-lettres/${id}/courrier-sortant`),

  expedier: (id: number | string, modeExpedition?: string, commentaire?: string) =>
    http.post<ApiEnvelope<ProjetLettre>>(`/projets-lettres/${id}/expedier`, {
      mode_expedition: modeExpedition,
      commentaire,
    }),

  archiver: (id: number | string, commentaire?: string) =>
    http.post<ApiEnvelope<ProjetLettre>>(`/projets-lettres/${id}/archiver`, { commentaire }),

  annuler: (id: number | string, commentaire?: string) =>
    http.post<ApiEnvelope<ProjetLettre>>(`/projets-lettres/${id}/annuler`, { commentaire }),
}
