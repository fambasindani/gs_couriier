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

/** Charge tous les référentiels du module Courrier (pour filtres et formulaires). */
export function useReferentiels(): Referentiels {
  const [state, setState] = useState<Referentiels>(EMPTY)

  useEffect(() => {
    let active = true

    if (USE_MOCK) {
      setState({
        types: mockTypes,
        categories: mockCategories,
        priorites: mockPriorites,
        statuts: mockStatuts,
        expediteurs: mockExpediteurs,
        destinataires: mockDestinataires,
        loading: false,
      })
      return
    }

    Promise.all([
      referentielsService.types(),
      referentielsService.categories(),
      referentielsService.priorites(),
      referentielsService.statuts(),
      referentielsService.expediteurs(),
      referentielsService.destinataires(),
    ])
      .then(([types, categories, priorites, statuts, expediteurs, destinataires]) => {
        if (active) {
          setState({
            types,
            categories,
            priorites,
            statuts,
            expediteurs,
            destinataires,
            loading: false,
          })
        }
      })
      .catch(() => {
        if (active) setState((prev) => ({ ...prev, loading: false }))
      })

    return () => {
      active = false
    }
  }, [])

  return state
}
