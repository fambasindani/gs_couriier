export type IconName =
  | 'LayoutDashboard'
  | 'Mail'
  | 'FileText'
  | 'Share2'
  | 'Archive'
  | 'Database'
  | 'BarChart3'
  | 'Settings'
  | 'Network'
  | 'LifeBuoy'

export interface MenuChild {
  title: string
  path: string
  /** Slug de permission requis pour afficher l'entrée. */
  permission?: string
}

export interface MenuGroup {
  title: string
  icon: IconName
  children: MenuChild[]
}

export interface MenuSection {
  category: string
  groups: MenuGroup[]
}

/**
 * Menu latéral du SGEC — structure calquée sur le thème ndex.html
 * et sur l'architecture de frontend-bejamin (menu config + gating par permission).
 */
export const MENU: MenuSection[] = [
  {
    category: 'Principal',
    groups: [
      {
        title: 'Tableau de bord',
        icon: 'LayoutDashboard',
        children: [
          { title: "Vue d'ensemble", path: '/' },
          { title: 'Statistiques', path: '/dashboard/statistiques' },
          { title: 'Activité récente', path: '/dashboard/activite-recente' },
        ],
      },
    ],
  },
  {
    category: 'Gestion du Courrier',
    groups: [
      {
        title: 'Courriers',
        icon: 'Mail',
        children: [
          { title: 'Courriers entrants', path: '/courriers?type=ENTRANT', permission: 'courriers.view' },
          { title: 'Courriers sortants', path: '/courriers?type=SORTANT', permission: 'courriers.view' },
          { title: 'Courriers internes', path: '/courriers?type=INTERNE', permission: 'courriers.view' },
          { title: 'Courriers en retard', path: '/courriers/en-retard', permission: 'courriers.view' },
          { title: 'Réponses liées', path: '/courriers/lies', permission: 'courriers.view' },
          { title: 'Recherche avancée', path: '/courriers/recherche', permission: 'courriers.view' },
          { title: 'Projets de lettres', path: '/projets-lettres', permission: 'projets.view' },
        ],
      },
    ],
  },
  {
    category: 'Traitement & Visas',
    groups: [
      {
        title: 'Traitement',
        icon: 'Share2',
        children: [
          { title: 'Affectations', path: '/traitement/affectations', permission: 'courriers.view' },
          { title: 'Annotations', path: '/traitement/annotations', permission: 'courriers.view' },
          { title: 'Validations & Visas', path: '/traitement/validations', permission: 'courriers.view' },
          { title: 'Circuit de traitement', path: '/traitement/circuit', permission: 'courriers.view' },
        ],
      },
    ],
  },
  {
    category: 'Archives & OCR',
    groups: [
      {
        title: 'Archivage',
        icon: 'Archive',
        children: [
          { title: 'Numérisation & OCR', path: '/archives/ocr', permission: 'courriers.view' },
          { title: 'Archives', path: '/archives', permission: 'courriers.view' },
          { title: "Catégories d'archives", path: '/archives/categories', permission: 'courriers.view' },
          { title: 'Emplacements', path: '/archives/emplacements', permission: 'courriers.view' },
        ],
      },
    ],
  },
  {
    category: 'Référentiels',
    groups: [
      {
        title: 'Données de base',
        icon: 'Database',
        children: [
          { title: 'Types de courrier', path: '/referentiels/types', permission: 'courriers.view' },
          { title: 'Catégories', path: '/referentiels/categories', permission: 'courriers.view' },
          { title: 'Priorités', path: '/referentiels/priorites', permission: 'courriers.view' },
          { title: 'Statuts', path: '/referentiels/statuts', permission: 'courriers.view' },
          { title: 'Expéditeurs', path: '/referentiels/expediteurs', permission: 'courriers.view' },
          { title: 'Destinataires', path: '/referentiels/destinataires', permission: 'courriers.view' },
          { title: 'Modèles de lettres', path: '/referentiels/lettres', permission: 'courriers.view' },
        ],
      },
    ],
  },
  {
    category: 'Rapports & Analyses',
    groups: [
      {
        title: 'Rapports',
        icon: 'BarChart3',
        children: [
          { title: 'Rapports statistiques', path: '/rapports', permission: 'courriers.view' },
          { title: 'Délais de traitement', path: '/rapports/delais', permission: 'courriers.view' },
          { title: 'Performance des services', path: '/rapports/services', permission: 'courriers.view' },
          { title: 'Export de données', path: '/rapports/export', permission: 'courriers.view' },
        ],
      },
    ],
  },
  {
    category: 'Administration',
    groups: [
      {
        title: 'Système',
        icon: 'Settings',
        children: [
          { title: 'Utilisateurs', path: '/admin/utilisateurs', permission: 'users.view' },
          { title: 'Rôles & Permissions', path: '/admin/roles', permission: 'roles.view' },
          { title: "Journal d'audit", path: '/admin/audit', permission: 'audit.view' },
          { title: 'Paramètres généraux', path: '/admin/parametres', permission: 'parametres.view' },
        ],
      },
      {
        title: 'Structure',
        icon: 'Network',
        children: [
          { title: 'Directions', path: '/admin/structure?tab=directions', permission: 'structure.view' },
          { title: 'Départements', path: '/admin/structure?tab=departements', permission: 'structure.view' },
          { title: 'Services', path: '/admin/structure?tab=services', permission: 'structure.view' },
        ],
      },
    ],
  },
  {
    category: 'Assistance',
    groups: [
      {
        title: 'Aide & Support',
        icon: 'LifeBuoy',
        children: [
          { title: "Centre d'aide", path: '/aide' },
          { title: 'Documentation', path: '/aide/documentation' },
          { title: 'Contacter le support', path: '/aide/support' },
          { title: 'À propos du SGEC', path: '/aide/apropos' },
        ],
      },
    ],
  },
]
