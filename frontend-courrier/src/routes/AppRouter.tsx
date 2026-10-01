import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { ProfilPage } from '@/pages/ProfilPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DashboardStatistiquesPage } from '@/pages/DashboardStatistiquesPage'
import { DashboardActivitePage } from '@/pages/DashboardActivitePage'
import { CourriersListePage } from '@/pages/courriers/CourriersListePage'
import { CourriersRetardPage } from '@/pages/courriers/CourriersRetardPage'
import { CourriersLiesPage } from '@/pages/courriers/CourriersLiesPage'
import { RechercheAvanceePage } from '@/pages/courriers/RechercheAvanceePage'
import { CourrierDetailPage } from '@/pages/courriers/CourrierDetailPage'
import { CourrierFormPage } from '@/pages/courriers/CourrierFormPage'
import { AffectationsPage } from '@/pages/traitement/AffectationsPage'
import { AnnotationsPage } from '@/pages/traitement/AnnotationsPage'
import { ValidationsPage } from '@/pages/traitement/ValidationsPage'
import { CircuitPage } from '@/pages/traitement/CircuitPage'
import { ArchivesListePage } from '@/pages/archives/ArchivesListePage'
import { ArchiveCategoriesPage } from '@/pages/archives/ArchiveCategoriesPage'
import { ArchiveEmplacementsPage } from '@/pages/archives/ArchiveEmplacementsPage'
import { NumerisationOcrPage } from '@/pages/archives/NumerisationOcrPage'
import { RapportStatistiquesPage } from '@/pages/rapports/RapportStatistiquesPage'
import { RapportDelaisPage } from '@/pages/rapports/RapportDelaisPage'
import { RapportServicesPage } from '@/pages/rapports/RapportServicesPage'
import { RapportExportPage } from '@/pages/rapports/RapportExportPage'
import { UtilisateursPage } from '@/pages/admin/UtilisateursPage'
import { RolesPermissionsPage } from '@/pages/admin/RolesPermissionsPage'
import { StructurePage } from '@/pages/admin/StructurePage'
import { JournalAuditPage } from '@/pages/admin/JournalAuditPage'
import { ParametresPage } from '@/pages/admin/ParametresPage'
import { ReferentielsCrudPage } from '@/components/referentiels/ReferentielsCrudPage'
import { LettreModelesPage } from '@/pages/referentiels/LettreModelesPage'
import { ProjetsLettresPage } from '@/pages/projets/ProjetsLettresPage'
import { ProjetLettreDetailPage } from '@/pages/projets/ProjetLettreDetailPage'
import {
  categoriesConfig,
  destinatairesConfig,
  expediteursConfig,
  prioritesConfig,
  statutsConfig,
  typesConfig,
} from '@/config/referentiels-crud'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { MENU } from '@/config/menu'

/** Pages déjà implémentées : exclues de la génération automatique des placeholders. */
const IMPLEMENTED_ROUTES = new Set([
  '/dashboard/statistiques',
  '/dashboard/activite-recente',
  '/courriers',
  '/courriers/en-retard',
  '/courriers/lies',
  '/courriers/recherche',
  '/traitement/affectations',
  '/traitement/annotations',
  '/traitement/validations',
  '/traitement/circuit',
  '/projets-lettres',
  '/archives',
  '/archives/ocr',
  '/archives/categories',
  '/archives/emplacements',
  '/referentiels/types',
  '/referentiels/categories',
  '/referentiels/priorites',
  '/referentiels/statuts',
  '/referentiels/expediteurs',
  '/referentiels/destinataires',
  '/referentiels/lettres',
  '/rapports',
  '/rapports/delais',
  '/rapports/services',
  '/rapports/export',
  '/admin/utilisateurs',
  '/admin/roles',
  '/admin/structure',
  '/admin/audit',
  '/admin/parametres',
])

/** Génère une route par entrée de menu (hors tableau de bord), sans les query strings. */
const placeholderRoutes = Array.from(
  new Map(
    MENU.flatMap((section) => section.groups.flatMap((group) => group.children))
      .filter((child) => {
        const base = child.path.split('?')[0]
        return child.path !== '/' && !IMPLEMENTED_ROUTES.has(base)
      })
      .map((child) => [child.path.split('?')[0], child.title] as const),
  ).entries(),
)

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/dashboard/statistiques" element={<DashboardStatistiquesPage />} />
          <Route path="/dashboard/activite-recente" element={<DashboardActivitePage />} />
          <Route path="/courriers" element={<CourriersListePage />} />
          <Route path="/courriers/en-retard" element={<CourriersRetardPage />} />
          <Route path="/courriers/lies" element={<CourriersLiesPage />} />
          <Route path="/courriers/recherche" element={<RechercheAvanceePage />} />
          <Route path="/courriers/nouveau" element={<CourrierFormPage />} />
          <Route path="/courriers/:id/modifier" element={<CourrierFormPage />} />
          <Route path="/courriers/:id" element={<CourrierDetailPage />} />
          <Route path="/traitement/affectations" element={<AffectationsPage />} />
          <Route path="/traitement/annotations" element={<AnnotationsPage />} />
          <Route path="/traitement/validations" element={<ValidationsPage />} />
          <Route path="/traitement/circuit" element={<CircuitPage />} />
          <Route path="/projets-lettres" element={<ProjetsLettresPage />} />
          <Route path="/projets-lettres/:id" element={<ProjetLettreDetailPage />} />
          <Route path="/archives" element={<ArchivesListePage />} />
          <Route path="/archives/categories" element={<ArchiveCategoriesPage />} />
          <Route path="/archives/emplacements" element={<ArchiveEmplacementsPage />} />
          <Route path="/archives/ocr" element={<NumerisationOcrPage />} />
          <Route path="/referentiels/types" element={<ReferentielsCrudPage config={typesConfig} />} />
          <Route
            path="/referentiels/categories"
            element={<ReferentielsCrudPage config={categoriesConfig} />}
          />
          <Route
            path="/referentiels/priorites"
            element={<ReferentielsCrudPage config={prioritesConfig} />}
          />
          <Route
            path="/referentiels/statuts"
            element={<ReferentielsCrudPage config={statutsConfig} />}
          />
          <Route
            path="/referentiels/expediteurs"
            element={<ReferentielsCrudPage config={expediteursConfig} />}
          />
          <Route
            path="/referentiels/destinataires"
            element={<ReferentielsCrudPage config={destinatairesConfig} />}
          />
          <Route path="/referentiels/lettres" element={<LettreModelesPage />} />
          <Route path="/rapports" element={<RapportStatistiquesPage />} />
          <Route path="/rapports/delais" element={<RapportDelaisPage />} />
          <Route path="/rapports/services" element={<RapportServicesPage />} />
          <Route path="/rapports/export" element={<RapportExportPage />} />
          <Route path="/admin/utilisateurs" element={<UtilisateursPage />} />
          <Route path="/admin/roles" element={<RolesPermissionsPage />} />
          <Route path="/admin/structure" element={<StructurePage />} />
          <Route path="/admin/audit" element={<JournalAuditPage />} />
          <Route path="/admin/parametres" element={<ParametresPage />} />
          <Route path="/profil" element={<ProfilPage />} />
          {placeholderRoutes.map(([path, title]) => (
            <Route key={path} path={path} element={<PlaceholderPage title={title} />} />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
