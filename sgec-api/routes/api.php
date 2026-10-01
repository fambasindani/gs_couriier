<?php

use App\Http\Controllers\Api\ArchiveCategoryController;
use App\Http\Controllers\Api\ArchiveController;
use App\Http\Controllers\Api\ArchiveEmplacementController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategorieCourrierController;
use App\Http\Controllers\Api\CircuitController;
use App\Http\Controllers\Api\CourrierAffectationController;
use App\Http\Controllers\Api\CourrierAnnotationController;
use App\Http\Controllers\Api\CourrierController;
use App\Http\Controllers\Api\CourrierPieceController;
use App\Http\Controllers\Api\CourrierValidationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepartementController;
use App\Http\Controllers\Api\DestinataireController;
use App\Http\Controllers\Api\DirectionController;
use App\Http\Controllers\Api\ExpediteurController;
use App\Http\Controllers\Api\ParametreGeneralController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\PrioriteController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\StatutCourrierController;
use App\Http\Controllers\Api\TypeCourrierController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RapportController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\LettreModeleController;
use App\Http\Controllers\Api\ProjetLettreController;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| API Routes — SGEC
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Route publique
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Routes protégées (Sanctum + Permissions)
| Note : LogAudit est déjà appliqué globalement via le groupe 'api' (app/Http/Kernel.php).
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum'])->group(function () {

    // =====================================================================
    // Authentification
    // =====================================================================
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::put('/me/password', [AuthController::class, 'updatePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // =====================================================================
    // Utilisateurs
    // =====================================================================
    Route::get('/users', [UserController::class, 'index'])
        ->middleware('permission:users.view');
    Route::post('/users', [UserController::class, 'store'])
        ->middleware('permission:users.create');
    Route::get('/users/{user}', [UserController::class, 'show'])
        ->middleware('permission:users.view');
    Route::put('/users/{user}', [UserController::class, 'update'])
        ->middleware('permission:users.update');
    Route::patch('/users/{user}', [UserController::class, 'update'])
        ->middleware('permission:users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])
        ->middleware('permission:users.delete');

    // =====================================================================
    // Rôles
    // =====================================================================
    Route::get('/roles', [RoleController::class, 'index'])
        ->middleware('permission:roles.view');
    Route::post('/roles', [RoleController::class, 'store'])
        ->middleware('permission:roles.create');
    Route::get('/roles/{role}', [RoleController::class, 'show'])
        ->middleware('permission:roles.view');
    Route::put('/roles/{role}', [RoleController::class, 'update'])
        ->middleware('permission:roles.update');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])
        ->middleware('permission:roles.delete');

    // =====================================================================
    // Permissions
    // =====================================================================
    Route::get('/permissions', [PermissionController::class, 'index'])
        ->middleware('permission:permissions.view');
    Route::post('/permissions', [PermissionController::class, 'store'])
        ->middleware('permission:permissions.create');
    Route::get('/permissions/{permission}', [PermissionController::class, 'show'])
        ->middleware('permission:permissions.view');
    Route::put('/permissions/{permission}', [PermissionController::class, 'update'])
        ->middleware('permission:permissions.update');
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])
        ->middleware('permission:permissions.delete');

    // =====================================================================
    // Structure organisationnelle — Directions
    // =====================================================================
    Route::get('/directions', [DirectionController::class, 'index'])
        ->middleware('permission:structure.view');
    Route::post('/directions', [DirectionController::class, 'store'])
        ->middleware('permission:structure.manage');
    Route::get('/directions/{direction}', [DirectionController::class, 'show'])
        ->middleware('permission:structure.view');
    Route::put('/directions/{direction}', [DirectionController::class, 'update'])
        ->middleware('permission:structure.manage');
    Route::delete('/directions/{direction}', [DirectionController::class, 'destroy'])
        ->middleware('permission:structure.manage');

    // =====================================================================
    // Structure organisationnelle — Départements
    // =====================================================================
    Route::get('/departements', [DepartementController::class, 'index'])
        ->middleware('permission:structure.view');
    Route::post('/departements', [DepartementController::class, 'store'])
        ->middleware('permission:structure.manage');
    Route::get('/departements/{departement}', [DepartementController::class, 'show'])
        ->middleware('permission:structure.view');
    Route::put('/departements/{departement}', [DepartementController::class, 'update'])
        ->middleware('permission:structure.manage');
    Route::delete('/departements/{departement}', [DepartementController::class, 'destroy'])
        ->middleware('permission:structure.manage');

    // =====================================================================
    // Structure organisationnelle — Services
    // =====================================================================
    Route::get('/services', [ServiceController::class, 'index'])
        ->middleware('permission:structure.view');
    Route::post('/services', [ServiceController::class, 'store'])
        ->middleware('permission:structure.manage');
    Route::get('/services/{service}', [ServiceController::class, 'show'])
        ->middleware('permission:structure.view');
    Route::put('/services/{service}', [ServiceController::class, 'update'])
        ->middleware('permission:structure.manage');
    Route::delete('/services/{service}', [ServiceController::class, 'destroy'])
        ->middleware('permission:structure.manage');

    // =====================================================================
    // Journal d'audit
    // =====================================================================
    Route::get('/audit-logs', [AuditLogController::class, 'index'])
        ->middleware('permission:audit.view');
    Route::get('/audit-logs/{auditLog}', [AuditLogController::class, 'show'])
        ->middleware('permission:audit.view');
    Route::delete('/audit-logs/{auditLog}', [AuditLogController::class, 'destroy'])
        ->middleware('permission:audit.delete');

    // =====================================================================
    // Paramètres généraux
    // =====================================================================
    Route::get('/parametres', [ParametreGeneralController::class, 'index'])
        ->middleware('permission:parametres.view');
    Route::post('/parametres', [ParametreGeneralController::class, 'store'])
        ->middleware('permission:parametres.update');
    Route::get('/parametres/{parametreGeneral}', [ParametreGeneralController::class, 'show'])
        ->middleware('permission:parametres.view');
    Route::put('/parametres/{parametreGeneral}', [ParametreGeneralController::class, 'update'])
        ->middleware('permission:parametres.update');
    Route::delete('/parametres/{parametreGeneral}', [ParametreGeneralController::class, 'destroy'])
        ->middleware('permission:parametres.update');

    // =====================================================================
    // Module Courrier — Référentiels (partie 1)
    // =====================================================================
    // Types de courrier
    Route::get('/type-courriers', [TypeCourrierController::class, 'index'])
        ->middleware('permission:courriers.view');
    Route::post('/type-courriers', [TypeCourrierController::class, 'store'])
        ->middleware('permission:courriers.create');
    Route::get('/type-courriers/{typeCourrier}', [TypeCourrierController::class, 'show'])
        ->middleware('permission:courriers.view');
    Route::put('/type-courriers/{typeCourrier}', [TypeCourrierController::class, 'update'])
        ->middleware('permission:courriers.update');
    Route::delete('/type-courriers/{typeCourrier}', [TypeCourrierController::class, 'destroy'])
        ->middleware('permission:courriers.delete');

    // Catégories de courrier
    Route::get('/categorie-courriers', [CategorieCourrierController::class, 'index'])
        ->middleware('permission:courriers.view');
    Route::post('/categorie-courriers', [CategorieCourrierController::class, 'store'])
        ->middleware('permission:courriers.create');
    Route::get('/categorie-courriers/{categorieCourrier}', [CategorieCourrierController::class, 'show'])
        ->middleware('permission:courriers.view');
    Route::put('/categorie-courriers/{categorieCourrier}', [CategorieCourrierController::class, 'update'])
        ->middleware('permission:courriers.update');
    Route::delete('/categorie-courriers/{categorieCourrier}', [CategorieCourrierController::class, 'destroy'])
        ->middleware('permission:courriers.delete');

    // Priorités
    Route::get('/priorites', [PrioriteController::class, 'index'])
        ->middleware('permission:courriers.view');
    Route::post('/priorites', [PrioriteController::class, 'store'])
        ->middleware('permission:courriers.create');
    Route::get('/priorites/{priorite}', [PrioriteController::class, 'show'])
        ->middleware('permission:courriers.view');
    Route::put('/priorites/{priorite}', [PrioriteController::class, 'update'])
        ->middleware('permission:courriers.update');
    Route::delete('/priorites/{priorite}', [PrioriteController::class, 'destroy'])
        ->middleware('permission:courriers.delete');

    // =====================================================================
    // Module Courrier — Référentiels (partie 2)
    // =====================================================================
    // Statuts de courrier
    Route::get('/statut-courriers', [StatutCourrierController::class, 'index'])
        ->middleware('permission:courriers.view');
    Route::post('/statut-courriers', [StatutCourrierController::class, 'store'])
        ->middleware('permission:courriers.create');
    Route::get('/statut-courriers/{statutCourrier}', [StatutCourrierController::class, 'show'])
        ->middleware('permission:courriers.view');
    Route::put('/statut-courriers/{statutCourrier}', [StatutCourrierController::class, 'update'])
        ->middleware('permission:courriers.update');
    Route::delete('/statut-courriers/{statutCourrier}', [StatutCourrierController::class, 'destroy'])
        ->middleware('permission:courriers.delete');

    // Expéditeurs
    Route::get('/expediteurs', [ExpediteurController::class, 'index'])
        ->middleware('permission:courriers.view');
    Route::post('/expediteurs', [ExpediteurController::class, 'store'])
        ->middleware('permission:courriers.create');
    Route::get('/expediteurs/{expediteur}', [ExpediteurController::class, 'show'])
        ->middleware('permission:courriers.view');
    Route::put('/expediteurs/{expediteur}', [ExpediteurController::class, 'update'])
        ->middleware('permission:courriers.update');
    Route::delete('/expediteurs/{expediteur}', [ExpediteurController::class, 'destroy'])
        ->middleware('permission:courriers.delete');

    // Destinataires
    Route::get('/destinataires', [DestinataireController::class, 'index'])
        ->middleware('permission:courriers.view');
    Route::post('/destinataires', [DestinataireController::class, 'store'])
        ->middleware('permission:courriers.create');
    Route::get('/destinataires/{destinataire}', [DestinataireController::class, 'show'])
        ->middleware('permission:courriers.view');
    Route::put('/destinataires/{destinataire}', [DestinataireController::class, 'update'])
        ->middleware('permission:courriers.update');
    Route::delete('/destinataires/{destinataire}', [DestinataireController::class, 'destroy'])
        ->middleware('permission:courriers.delete');

    // Modèles de lettres
    Route::get('/lettre-modeles', [LettreModeleController::class, 'index'])
        ->middleware('permission:courriers.view');
    Route::post('/lettre-modeles', [LettreModeleController::class, 'store'])
        ->middleware('permission:courriers.create');
    Route::get('/lettre-modeles/{lettreModele}', [LettreModeleController::class, 'show'])
        ->middleware('permission:courriers.view');
    Route::put('/lettre-modeles/{lettreModele}', [LettreModeleController::class, 'update'])
        ->middleware('permission:courriers.update');
    Route::delete('/lettre-modeles/{lettreModele}', [LettreModeleController::class, 'destroy'])
        ->middleware('permission:courriers.delete');

    // =====================================================================
    // Module Courrier — Table principale + fonctionnalités avancées
    // ⚠️ ORDRE CRITIQUE : du plus spécifique au plus générique
    // =====================================================================

    // ---- 1️⃣ Routes statiques (aucun paramètre) ----
    Route::get('/courriers', [CourrierController::class, 'index'])
        ->middleware('permission:courriers.view');
    Route::post('/courriers', [CourrierController::class, 'store'])
        ->middleware('permission:courriers.create');
    Route::get('/courriers/stats', [CourrierController::class, 'stats'])
        ->middleware('permission:courriers.view');
    Route::get('/courriers/en-retard', [CourrierController::class, 'enRetard'])
        ->middleware('permission:courriers.view');
    Route::get('/courriers/recherche-avancee', [CourrierController::class, 'rechercheAvancee'])
        ->middleware('permission:courriers.view');

    // ---- 2️⃣ Routes avec /{courrier}/action ----
    // Circuit de traitement
    Route::get('/courriers/{courrier}/circuit', [CircuitController::class, 'circuit'])
        ->middleware('permission:courriers.view');
    Route::get('/courriers/{courrier}/etape-actuelle', [CircuitController::class, 'etapeActuelle'])
        ->middleware('permission:courriers.view');
    Route::get('/courriers/{courrier}/timeline', [CircuitController::class, 'timeline'])
        ->middleware('permission:courriers.view');

    // Courriers liés
    Route::get('/courriers/{courrier}/lies', [CourrierController::class, 'lies'])
        ->middleware('permission:courriers.view');
    Route::post('/courriers/{courrier}/lier', [CourrierController::class, 'lier'])
        ->middleware('permission:courriers.update');
    Route::delete('/courriers/{courrier}/delier', [CourrierController::class, 'delier'])
        ->middleware('permission:courriers.update');

    // Archivage rapide d'un courrier
    Route::post('/courriers/{courrier}/archiver', [ArchiveController::class, 'archiverCourrier'])
        ->middleware('permission:courriers.update');

    // Clôture d'un courrier
    Route::post('/courriers/{courrier}/cloturer', [CourrierController::class, 'cloturer'])
        ->middleware('permission:courriers.update');

    // Génération d'un projet de lettre depuis un modèle
    Route::post('/courriers/{courrier}/lettre', [CourrierController::class, 'genererLettre'])
        ->middleware('permission:courriers.view');
    // (PDF/DOCX générés côté frontend avec @react-pdf/renderer et docx)

    // ---- 3️⃣ CRUD génériques (EN DERNIER) ----
    Route::get('/courriers/{courrier}', [CourrierController::class, 'show'])
        ->middleware('permission:courriers.view');
    Route::put('/courriers/{courrier}', [CourrierController::class, 'update'])
        ->middleware('permission:courriers.update');
    Route::patch('/courriers/{courrier}', [CourrierController::class, 'update'])
        ->middleware('permission:courriers.update');
    Route::delete('/courriers/{courrier}', [CourrierController::class, 'destroy'])
        ->middleware('permission:courriers.delete');

    // =====================================================================
    // Module Courrier — Workflow
    // =====================================================================
    // Affectations
    Route::get('/courrier-affectations', [CourrierAffectationController::class, 'index'])
        ->middleware('permission:courriers.view');
    Route::post('/courrier-affectations', [CourrierAffectationController::class, 'store'])
        ->middleware('permission:courriers.affecter');
    Route::get('/courrier-affectations/{affectation}', [CourrierAffectationController::class, 'show'])
        ->middleware('permission:courriers.view');
    Route::put('/courrier-affectations/{affectation}', [CourrierAffectationController::class, 'update'])
        ->middleware('permission:courriers.affecter');
    Route::delete('/courrier-affectations/{affectation}', [CourrierAffectationController::class, 'destroy'])
        ->middleware('permission:courriers.affecter');

    // Annotations
    Route::get('/courrier-annotations', [CourrierAnnotationController::class, 'index'])
        ->middleware('permission:courriers.view');
    Route::post('/courrier-annotations', [CourrierAnnotationController::class, 'store'])
        ->middleware('permission:courriers.annoter');
    Route::get('/courrier-annotations/{annotation}', [CourrierAnnotationController::class, 'show'])
        ->middleware('permission:courriers.view');
    Route::put('/courrier-annotations/{annotation}', [CourrierAnnotationController::class, 'update'])
        ->middleware('permission:courriers.annoter');
    Route::delete('/courrier-annotations/{annotation}', [CourrierAnnotationController::class, 'destroy'])
        ->middleware('permission:courriers.annoter');

    // Validations
    Route::get('/courrier-validations', [CourrierValidationController::class, 'index'])
        ->middleware('permission:courriers.view');
    Route::post('/courrier-validations', [CourrierValidationController::class, 'store'])
        ->middleware('permission:courriers.valider');
    Route::get('/courrier-validations/{validation}', [CourrierValidationController::class, 'show'])
        ->middleware('permission:courriers.view');
    Route::put('/courrier-validations/{validation}', [CourrierValidationController::class, 'update'])
        ->middleware('permission:courriers.valider');
    Route::delete('/courrier-validations/{validation}', [CourrierValidationController::class, 'destroy'])
        ->middleware('permission:courriers.valider');

    // =====================================================================
    // Module Courrier — Pièces jointes
    // =====================================================================
    Route::get('/courrier-pieces', [CourrierPieceController::class, 'index'])
        ->middleware('permission:courriers.view');
    Route::post('/courrier-pieces', [CourrierPieceController::class, 'store'])
        ->middleware('permission:courriers.create');
    Route::get('/courrier-pieces/{piece}', [CourrierPieceController::class, 'show'])
        ->middleware('permission:courriers.view');
    Route::get('/courrier-pieces/{piece}/download', [CourrierPieceController::class, 'download'])
        ->middleware('permission:courriers.view');
    Route::put('/courrier-pieces/{piece}', [CourrierPieceController::class, 'update'])
        ->middleware('permission:courriers.update');
    Route::delete('/courrier-pieces/{piece}', [CourrierPieceController::class, 'destroy'])
        ->middleware('permission:courriers.delete');

    // =====================================================================
    // Projets de lettres (Word)
    // =====================================================================
    Route::get('/projets-lettres', [ProjetLettreController::class, 'index'])
        ->middleware('permission:projets.view');
    Route::post('/projets-lettres', [ProjetLettreController::class, 'store'])
        ->middleware('permission:projets.create');
    Route::get('/projets-lettres/{projetLettre}', [ProjetLettreController::class, 'show'])
        ->middleware('permission:projets.view');
    Route::put('/projets-lettres/{projetLettre}', [ProjetLettreController::class, 'update'])
        ->middleware('permission:projets.update');
    Route::post('/projets-lettres/{projetLettre}/generer-word', [ProjetLettreController::class, 'genererWord'])
        ->middleware('permission:projets.update');
    Route::post('/projets-lettres/{projetLettre}/importer', [ProjetLettreController::class, 'importerVersion'])
        ->middleware('permission:projets.update');
    Route::get('/projets-lettres/{projetLettre}/versions/{version}/download', [ProjetLettreController::class, 'telechargerVersion'])
        ->middleware('permission:projets.view');
    Route::post('/projets-lettres/{projetLettre}/soumettre', [ProjetLettreController::class, 'soumettre'])
        ->middleware('permission:projets.update');
    Route::post('/projets-lettres/{projetLettre}/decision', [ProjetLettreController::class, 'decision'])
        ->middleware('permission:projets.valider');
    Route::post('/projets-lettres/{projetLettre}/signer', [ProjetLettreController::class, 'signer'])
        ->middleware('permission:projets.signer');
    Route::post('/projets-lettres/{projetLettre}/courrier-sortant', [ProjetLettreController::class, 'creerCourrierSortant'])
        ->middleware('permission:projets.update');
    Route::post('/projets-lettres/{projetLettre}/expedier', [ProjetLettreController::class, 'expedier'])
        ->middleware('permission:projets.update');
    Route::post('/projets-lettres/{projetLettre}/archiver', [ProjetLettreController::class, 'archiver'])
        ->middleware('permission:projets.update');
    Route::post('/projets-lettres/{projetLettre}/annuler', [ProjetLettreController::class, 'annuler'])
        ->middleware('permission:projets.update');

    // =====================================================================
    // Notifications (personnalisées par périmètre)
    // =====================================================================
    Route::get('/notifications', [NotificationController::class, 'index'])
        ->middleware('permission:courriers.view');

    // =====================================================================
    // Module Dashboard — Statistiques
    // =====================================================================
    Route::prefix('dashboard')->group(function () {
        Route::get('/overview', [DashboardController::class, 'overview'])
            ->middleware('permission:courriers.view');
        Route::get('/statistiques', [DashboardController::class, 'statistiques'])
            ->middleware('permission:courriers.view');
        Route::get('/activite-recente', [DashboardController::class, 'activiteRecente'])
            ->middleware('permission:courriers.view');
        Route::get('/volume-mensuel', [DashboardController::class, 'volumeMensuel'])
            ->middleware('permission:courriers.view');
        Route::get('/repartition', [DashboardController::class, 'repartition'])
            ->middleware('permission:courriers.view');
        Route::get('/courriers-recents', [DashboardController::class, 'courriersRecents'])
            ->middleware('permission:courriers.view');
        Route::get('/courriers-retard', [DashboardController::class, 'courriersRetard'])
            ->middleware('permission:courriers.view');
        Route::get('/mes-affectations', [DashboardController::class, 'mesAffectations'])
            ->middleware('permission:courriers.view');
    });

    // =====================================================================
    // Module Archivage
    // =====================================================================
    // Catégories d'archives
    Route::get('/archive-categories', [ArchiveCategoryController::class, 'index'])
        ->middleware('permission:courriers.view');
    Route::post('/archive-categories', [ArchiveCategoryController::class, 'store'])
        ->middleware('permission:courriers.create');
    Route::get('/archive-categories/{archiveCategory}', [ArchiveCategoryController::class, 'show'])
        ->middleware('permission:courriers.view');
    Route::put('/archive-categories/{archiveCategory}', [ArchiveCategoryController::class, 'update'])
        ->middleware('permission:courriers.update');
    Route::delete('/archive-categories/{archiveCategory}', [ArchiveCategoryController::class, 'destroy'])
        ->middleware('permission:courriers.delete');

    // Emplacements
    Route::get('/archive-emplacements', [ArchiveEmplacementController::class, 'index'])
        ->middleware('permission:courriers.view');
    Route::post('/archive-emplacements', [ArchiveEmplacementController::class, 'store'])
        ->middleware('permission:courriers.create');
    Route::get('/archive-emplacements/{archiveEmplacement}', [ArchiveEmplacementController::class, 'show'])
        ->middleware('permission:courriers.view');
    Route::put('/archive-emplacements/{archiveEmplacement}', [ArchiveEmplacementController::class, 'update'])
        ->middleware('permission:courriers.update');
    Route::delete('/archive-emplacements/{archiveEmplacement}', [ArchiveEmplacementController::class, 'destroy'])
        ->middleware('permission:courriers.delete');

    // Archives
    Route::get('/archives', [ArchiveController::class, 'index'])
        ->middleware('permission:courriers.view');
    Route::post('/archives', [ArchiveController::class, 'store'])
        ->middleware('permission:courriers.create');
    Route::get('/archives/{archive}', [ArchiveController::class, 'show'])
        ->middleware('permission:courriers.view');
    Route::put('/archives/{archive}', [ArchiveController::class, 'update'])
        ->middleware('permission:courriers.update');
    Route::delete('/archives/{archive}', [ArchiveController::class, 'destroy'])
        ->middleware('permission:courriers.delete');



            // =====================================================================
    // Module Rapports
    // =====================================================================
    Route::prefix('rapports')->group(function () {
        Route::get('/traitement', [RapportController::class, 'traitement'])
            ->middleware('permission:courriers.view');
        Route::get('/performance-services', [RapportController::class, 'performanceServices'])
            ->middleware('permission:courriers.view');
        Route::get('/performance-agents', [RapportController::class, 'performanceAgents'])
            ->middleware('permission:courriers.view');
        Route::get('/delais', [RapportController::class, 'delais'])
            ->middleware('permission:courriers.view');
        Route::get('/volumes', [RapportController::class, 'volumes'])
            ->middleware('permission:courriers.view');
        Route::get('/confidentialite', [RapportController::class, 'confidentialite'])
            ->middleware('permission:courriers.view');
        Route::get('/export', [RapportController::class, 'export'])
            ->middleware('permission:courriers.view');
    });

});