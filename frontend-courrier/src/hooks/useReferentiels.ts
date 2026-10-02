import { useEffect, useState } from 'react'
import { referentielsService } from '@/services/referentiels.service'
import {
  mockCategories,
  mockDestinataires,
  mockExpediteurs,
  mockPriorites,
  mockStatuts,
  mockTypes,
} from '@/data/mock'
import type { Partenaire, Referentiel } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export interface Referentiels {
  types: Referentiel[]
  categories: Referentiel[]
  priorites: Referentiel[]
  statuts: Referentiel[]
  expediteurs: Partenaire[]
  destinataires: Partenaire[]
  loading: boolean
}

const EMPTY: Referentiels = {
  types: [],
  categories: [],
  priorites: [],
  statuts: [],
  expediteurs: [],
  destinataires: [],
  loading: true,
}

// Cache global : les référentiels ne sont chargés qu'une seule fois.
let cache: Referentiels | null = null
let pending: Promise<Referentiels> | null = null

function load(): Promise<Referentiels> {
  if (cache) return Promise.resolve(cache)
  if (pending) return pending

  if (USE_MOCK) {
    cache = {
      types: mockTypes,
      categories: mockCategories,
      priorites: mockPriorites,
      statuts: mockStatuts,
      expediteurs: mockExpediteurs,
      destinataires: mockDestinataires,
      loading: false,
    }
    return Promise.resolve(cache)
  }

  pending = Promise.all([
    referentielsService.types(),
    referentielsService.categories(),
    referentielsService.priorites(),
    referentielsService.statuts(),
    referentielsService.expediteurs(),
    referentielsService.destinataires(),
  ])
    .then(([types, categories, priorites, statuts, expediteurs, destinataires]) => {
      cache = { types, categories, priorites, statuts, expediteurs, destinataires, loading: false }
      return cache
    })
    .catch(() => {
      cache = { ...EMPTY, loading: false }
      return cache
    })

  return pending
}

/** Charge les référentiels une seule fois, puis les partage entre les pages. */
export function useReferentiels(): Referentiels {
  const [state, setState] = useState<Referentiels>(cache ?? EMPTY)

  useEffect(() => {
    if (cache) {
      setState(cache)
      return
    }
    let active = true
    load().then((value) => {
      if (active) setState(value)
    })
    return () => {
      active = false
    }
  }, [])

  return state
}