import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { MENU } from '@/config/menu'

// Chargement paresseux de chaque page : le bundle initial reste léger.
const ProfilPage = lazy(() => import('@/pages/ProfilPage').then((m) => ({ default: m.ProfilPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const DashboardStatistiquesPage = lazy(() => import('@/pages/DashboardStatistiquesPage').then((m) => ({ default: m.DashboardStatistiquesPage })))
const DashboardActivitePage = lazy(() => import('@/pages/DashboardActivitePage').then((m) => ({ default: m.DashboardActivitePage })))
const CourriersListePage = lazy(() => import('@/pages/courriers/CourriersListePage').then((m) => ({ default: m.CourriersListePage })))
const CourriersRetardPage = lazy(() => import('@/pages/courriers/CourriersRetardPage').then((m) => ({ default: m.CourriersRetardPage })))
const CourriersLiesPage = lazy(() => import('@/pages/courriers/CourriersLiesPage').then((m) => ({ default: m.CourriersLiesPage })))
const RechercheAvanceePage = lazy(() => import('@/pages/courriers/RechercheAvanceePage').then((m) => ({ default: m.RechercheAvanceePage })))
const CourrierFormPage = lazy(() => import('@/pages/courriers/CourrierFormPage').then((m) => ({ default: m.CourrierFormPage })))
const CourrierDetailPage = lazy(() => import('@/pages/courriers/CourrierDetailPage').then((m) => ({ default: m.CourrierDetailPage })))
const AffectationsPage = lazy(() => import('@/pages/traitement/AffectationsPage').then((m) => ({ default: m.AffectationsPage })))
const AnnotationsPage = lazy(() => import('@/pages/traitement/AnnotationsPage').then((m) => ({ default: m.AnnotationsPage })))
const ValidationsPage = lazy(() => import('@/pages/traitement/ValidationsPage').then((m) => ({ default: m.ValidationsPage })))
const CircuitPage = lazy(() => import('@/pages/traitement/CircuitPage').then((m) => ({ default: m.CircuitPage })))
const ArchivesListePage = lazy(() => import('@/pages/archives/ArchivesListePage').then((m) => ({ default: m.ArchivesListePage })))
const ArchiveCategoriesPage = lazy(() => import('@/pages/archives/ArchiveCategoriesPage').then((m) => ({ default: m.ArchiveCategoriesPage })))
const ArchiveEmplacementsPage = lazy(() => import('@/pages/archives/ArchiveEmplacementsPage').then((m) => ({ default: m.ArchiveEmplacementsPage })))
const NumerisationOcrPage = lazy(() => import('@/pages/archives/NumerisationOcrPage').then((m) => ({ default: m.NumerisationOcrPage })))
const ReferentielsCrudPage = lazy(() => import('@/components/referentiels/ReferentielsCrudPage').then((m) => ({ default: m.ReferentielsCrudPage })))
const LettreModelesPage = lazy(() => import('@/pages/referentiels/LettreModelesPage').then((m) => ({ default: m.LettreModelesPage })))
const ProjetsLettresPage = lazy(() => import('@/pages/projets/ProjetsLettresPage').then((m) => ({ default: m.ProjetsLettresPage })))
const ProjetLettreDetailPage = lazy(() => import('@/pages/projets/ProjetLettreDetailPage').then((m) => ({ default: m.ProjetLettreDetailPage })))
const PointEncodagePage = lazy(() => import('@/pages/encodage/PointEncodagePage').then((m) => ({ default: m.PointEncodagePage })))
const RapportStatistiquesPage = lazy(() => import('@/pages/rapports/RapportStatistiquesPage').then((m) => ({ default: m.RapportStatistiquesPage })))
const RapportDelaisPage = lazy(() => import('@/pages/rapports/RapportDelaisPage').then((m) => ({ default: m.RapportDelaisPage })))
const RapportServicesPage = lazy(() => import('@/pages/rapports/RapportServicesPage').then((m) => ({ default: m.RapportServicesPage })))
const RapportExportPage = lazy(() => import('@/pages/rapports/RapportExportPage').then((m) => ({ default: m.RapportExportPage })))
const UtilisateursPage = lazy(() => import('@/pages/admin/UtilisateursPage').then((m) => ({ default: m.UtilisateursPage })))
const RolesPermissionsPage = lazy(() => import('@/pages/admin/RolesPermissionsPage').then((m) => ({ default: m.RolesPermissionsPage })))
const StructurePage = lazy(() => import('@/pages/admin/StructurePage').then((m) => ({ default: m.StructurePage })))
const JournalAuditPage = lazy(() => import('@/pages/admin/JournalAuditPage').then((m) => ({ default: m.JournalAuditPage })))
const ParametresPage = lazy(() => import('@/pages/admin/ParametresPage').then((m) => ({ default: m.ParametresPage })))

import {
  categoriesConfig,
  destinatairesConfig,
  expediteursConfig,
  prioritesConfig,
  statutsConfig,
  typesConfig,
} from '@/config/referentiels-crud'

/** Pages déjà implémentées : exclues de la génération automatique des placeholders. */
const IMPLEMENTED_ROUTES = new Set([
  '/dashboard/statistiques',
  '/dashboard/activite-recente',
  '/courriers',
  '/encodage',
  '/courriers/en-retard',
  '/courriers/lies',
  '/courriers/recherche',
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

function PageLoader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-64 rounded bg-slate-200" />
      <div className="h-40 w-full rounded bg-slate-100" />
      <div className="h-40 w-full rounded bg-slate-100" />
    </div>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/dashboard/statistiques" element={<DashboardStatistiquesPage />} />
            <Route path="/dashboard/activite-recente" element={<DashboardActivitePage />} />
            <Route path="/courriers" element={<CourriersListePage />} />
            <Route path="/encodage" element={<PointEncodagePage />} />
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
            <Route path="/referentiels/categories" element={<ReferentielsCrudPage config={categoriesConfig} />} />
            <Route path="/referentiels/priorites" element={<ReferentielsCrudPage config={prioritesConfig} />} />
            <Route path="/referentiels/statuts" element={<ReferentielsCrudPage config={statutsConfig} />} />
            <Route path="/referentiels/expediteurs" element={<ReferentielsCrudPage config={expediteursConfig} />} />
            <Route path="/referentiels/destinataires" element={<ReferentielsCrudPage config={destinatairesConfig} />} />
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
    </Suspense>
  )
}