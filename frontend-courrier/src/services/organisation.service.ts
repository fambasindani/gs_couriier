import { fetchAll } from './referentiels.service'
import type { UniteStructure, User } from '@/types'

/** Structure organisationnelle + utilisateurs, pour les formulaires d'affectation. */
export const organisationService = {
  directions: (search?: string) =>
    fetchAll<UniteStructure>('/directions', search ? { search } : {}),

  departements: (directionId?: number | string) =>
    fetchAll<UniteStructure>(
      '/departements',
      directionId ? { direction_id: directionId } : {},
    ),

  services: (departementId?: number | string) =>
    fetchAll<UniteStructure>('/services', departementId ? { departement_id: departementId } : {}),

  users: (search?: string) => fetchAll<User>('/users', search ? { search } : {}),
}
