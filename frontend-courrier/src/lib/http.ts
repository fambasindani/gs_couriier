import { tokenStorage } from './auth-token'

/** URL de l'API (vide = même origine, via le proxy Vite en dev). */
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')
export const BASE_URL = API_URL ? `${API_URL}/api` : '/api'

export class ApiError extends Error {
  status: number
  errors?: unknown

  constructor(message: string, status: number, errors?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export type QueryValue = string | number | boolean | undefined | null

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  query?: Record<string, QueryValue>
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`
  if (!query) return url

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    params.append(key, String(value))
  }

  const qs = params.toString()
  if (!qs) return url
  return `${url}${url.includes('?') ? '&' : '?'}${qs}`
}

/**
 * Client HTTP basé sur fetch (pas d'axios), avec token Sanctum,
 * gestion JSON/FormData et normalisation des erreurs.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, headers, ...rest } = options
  const isFormData = body instanceof FormData

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(headers as Record<string, string>),
  }

  const token = tokenStorage.get()
  if (token) finalHeaders.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      ...rest,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Impossible de contacter le serveur. Vérifiez votre connexion.', 0)
  }

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text()

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    // Suppression refusée : message explicite et uniforme côté utilisateur.
    const isDelete = ((rest.method ?? 'GET') as string).toUpperCase() === 'DELETE'

    const message =
      isDelete && response.status === 403
        ? "Vous n'avez pas la permission de supprimer cet enregistrement."
        : payload && typeof payload === 'object' && 'message' in payload
          ? String((payload as { message: unknown }).message)
          : 'Une erreur est survenue.'

    const errors =
      payload && typeof payload === 'object' && 'errors' in payload
        ? (payload as { errors: unknown }).errors
        : undefined

    throw new ApiError(message, response.status, errors)
  }

  return payload as T
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
