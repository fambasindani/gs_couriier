import type { CrudService } from '@/services/referentiels.service'
import {
  categoriesService,
  destinatairesService,
  expediteursService,
  prioritesService,
  statutsService,
  typeCourriersService,
} from '@/services/referentiels.service'
import type { Partenaire, Referentiel } from '@/types'

export interface RefField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea'
  required?: boolean
  options?: { value: string; label: string }[]
}

export interface RefColumn {
  key: string
  label: string
}

export interface RefConfig<T> {
  title: string
  subtitle: string
  service: CrudService<T>
  columns: RefColumn[]
  fields: RefField[]
  defaults: Record<string, string>
}

export const typesConfig: RefConfig<Referentiel> = {
  title: 'Types de courrier',
  subtitle: 'Entrant, sortant, interne...',
  service: typeCourriersService,
  columns: [
    { key: 'code', label: 'Code' },
    { key: 'libelle', label: 'Libellé' },
  ],
  fields: [
    { name: 'code', label: 'Code', type: 'text', required: true },
    { name: 'libelle', label: 'Libellé', type: 'text', required: true },
  ],
  defaults: { code: '', libelle: '' },
}

export const categoriesConfig: RefConfig<Referentiel> = {
  title: 'Catégories de courrier',
  subtitle: 'Classement thématique des courriers.',
  service: categoriesService,
  columns: [{ key: 'libelle', label: 'Libellé' }],
  fields: [{ name: 'libelle', label: 'Libellé', type: 'text', required: true }],
  defaults: { libelle: '' },
}

export const prioritesConfig: RefConfig<Referentiel> = {
  title: 'Priorités',
  subtitle: 'Niveaux de priorité de traitement.',
  service: prioritesService,
  columns: [
    { key: 'code', label: 'Code' },
    { key: 'libelle', label: 'Libellé' },
    { key: 'niveau', label: 'Niveau' },
  ],
  fields: [
    { name: 'code', label: 'Code', type: 'text', required: true },
    { name: 'libelle', label: 'Libellé', type: 'text', required: true },
    { name: 'niveau', label: 'Niveau', type: 'number', required: true },
  ],
  defaults: { code: '', libelle: '', niveau: '1' },
}

export const statutsConfig: RefConfig<Referentiel> = {
  title: 'Statuts de courrier',
  subtitle: 'Étapes du cycle de vie du courrier.',
  service: statutsService,
  columns: [
    { key: 'code', label: 'Code' },
    { key: 'libelle', label: 'Libellé' },
    { key: 'description', label: 'Description' },
  ],
  fields: [
    { name: 'code', label: 'Code', type: 'text', required: true },
    { name: 'libelle', label: 'Libellé', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
  ],
  defaults: { code: '', libelle: '', description: '' },
}

export const expediteursConfig: RefConfig<Partenaire> = {
  title: 'Expéditeurs',
  subtitle: 'Personnes et organismes émetteurs.',
  service: expediteursService,
  columns: [
    { key: 'nom', label: 'Nom' },
    { key: 'type_personne', label: 'Type' },
    { key: 'email', label: 'Email' },
    { key: 'telephone', label: 'Téléphone' },
  ],
  fields: [
    { name: 'nom', label: 'Nom', type: 'text', required: true },
    {
      name: 'type_personne',
      label: 'Type',
      type: 'select',
      required: true,
      options: [
        { value: 'MORALE', label: 'Personne morale' },
        { value: 'PHYSIQUE', label: 'Personne physique' },
      ],
    },
    { name: 'adresse', label: 'Adresse', type: 'textarea' },
    { name: 'telephone', label: 'Téléphone', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
  ],
  defaults: { nom: '', type_personne: 'MORALE', adresse: '', telephone: '', email: '' },
}

export const destinatairesConfig: RefConfig<Partenaire> = {
  title: 'Destinataires',
  subtitle: 'Personnes et services destinataires.',
  service: destinatairesService,
  columns: [
    { key: 'nom', label: 'Nom' },
    { key: 'type_destinataire', label: 'Type' },
    { key: 'email', label: 'Email' },
    { key: 'telephone', label: 'Téléphone' },
  ],
  fields: [
    { name: 'nom', label: 'Nom', type: 'text', required: true },
    {
      name: 'type_destinataire',
      label: 'Type',
      type: 'select',
      required: true,
      options: [
        { value: 'INTERNE', label: 'Interne' },
        { value: 'EXTERNE', label: 'Externe' },
      ],
    },
    { name: 'adresse', label: 'Adresse', type: 'textarea' },
    { name: 'telephone', label: 'Téléphone', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
  ],
  defaults: { nom: '', type_destinataire: 'EXTERNE', adresse: '', telephone: '', email: '' },
}
