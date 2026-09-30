import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Formate une date ISO en jj/mm/aaaa (ou jj/mm/aaaa hh:mm). */
export function formatDate(value?: string | null, withTime = false): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()

  if (!withTime) return `${d}/${m}/${y}`

  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${d}/${m}/${y} ${h}:${min}`
}

/** Formate un nombre à la française. */
export function nf(value?: number | string | null): string {
  return (Number(value) || 0).toLocaleString('fr-FR')
}

/** Convertit une valeur (souvent string depuis la BDD) en nombre sûr. */
export function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/** Affiche un nombre avec 1 décimale (ex: délais moyens). */
export function toFixed1(value: unknown): number {
  return Math.round(toNumber(value) * 10) / 10
}

/** Initiales à partir d'un nom complet. */
export function initials(name?: string | null): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}
