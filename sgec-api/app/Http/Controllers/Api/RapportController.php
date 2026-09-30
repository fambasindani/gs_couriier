<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Courrier;
use App\Models\CourrierAffectation;
use App\Models\CourrierHistorique;
use App\Models\Direction;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class RapportController extends Controller
{
    use ApiResponse;

    /**
     * Rapport de traitement : synthèse des courriers traités et en cours.
     */
    public function traitement(Request $request)
    {
        try {
            // Filtres optionnels
            $dateDebut = $request->get('date_debut', now()->startOfMonth()->toDateString());
            $dateFin = $request->get('date_fin', now()->toDateString());

            $base = Courrier::whereBetween('date_reception', [$dateDebut, Carbon::parse($dateFin)->endOfDay()]);

            // Compteurs principaux
            $total = (clone $base)->count();
            $traites = (clone $base)->whereHas('statut', fn ($q) => $q->whereIn('code', ['TRAITE', 'VALIDE', 'CLOTURE']))->count();
            $enCours = (clone $base)->whereHas('statut', fn ($q) => $q->whereIn('code', ['AFFECTE', 'EN_COURS']))->count();
            $enRetard = (clone $base)->whereNotNull('date_limite')
                ->where('date_limite', '<', now())
                ->whereDoesntHave('statut', fn ($q) => $q->whereIn('code', ['TRAITE', 'VALIDE', 'CLOTURE', 'REJETE', 'ARCHIVE']))
                ->count();

            // Taux de traitement
            $tauxTraitement = $total > 0 ? round(($traites / $total) * 100, 1) : 0;

            // Délai moyen de traitement (en jours)
            $delaiMoyen = (clone $base)->whereNotNull('date_cloture')
                ->whereNotNull('date_reception')
                ->selectRaw('AVG(DATEDIFF(date_cloture, date_reception)) as moyenne')
                ->value('moyenne');

            // Nombre d'affectations par courrier
            $courriersAvecAffectations = CourrierAffectation::whereBetween('created_at', [$dateDebut, Carbon::parse($dateFin)->endOfDay()])
                ->distinct('courrier_id')
                ->count('courrier_id');

            // Temps moyen entre réception et première affectation
            $delaiAffectation = DB::table('courrier_affectations')
                ->join('courriers', 'courrier_affectations.courrier_id', '=', 'courriers.id')
                ->whereBetween('courriers.date_reception', [$dateDebut, Carbon::parse($dateFin)->endOfDay()])
                ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, courriers.date_reception, courrier_affectations.date_affectation)) as moyenne')
                ->value('moyenne');

            return $this->success([
                'periode' => [
                    'debut' => $dateDebut,
                    'fin' => $dateFin,
                ],
                'compteurs' => [
                    'total_recus' => $total,
                    'traites' => $traites,
                    'en_cours' => $enCours,
                    'en_retard' => $enRetard,
                    'courriers_affectes' => $courriersAvecAffectations,
                ],
                'taux_traitement_pourcentage' => $tauxTraitement,
                'delai_moyen_traitement_jours' => round($delaiMoyen ?? 0, 1),
                'delai_moyen_affectation_heures' => round($delaiAffectation ?? 0, 1),
            ], 'Rapport de traitement');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors du rapport', $e->getMessage(), 500);
        }
    }

    /**
     * Performance des services : courriers traités par direction/département/service.
     */
    public function performanceServices(Request $request)
    {
        try {
            $dateDebut = $request->get('date_debut', now()->startOfMonth()->toDateString());
            $dateFin = $request->get('date_fin', now()->toDateString());

            // Performance par direction
            $parDirection = DB::table('courrier_affectations')
                ->join('directions', 'courrier_affectations.direction_id', '=', 'directions.id')
                ->join('courriers', 'courrier_affectations.courrier_id', '=', 'courriers.id')
                ->whereBetween('courriers.date_reception', [$dateDebut, Carbon::parse($dateFin)->endOfDay()])
                ->select(
                    'directions.id',
                    'directions.code',
                    'directions.libelle',
                    DB::raw('COUNT(DISTINCT courrier_affectations.courrier_id) as total_courriers'),
                    DB::raw('SUM(CASE WHEN courrier_affectations.statut = \'TRAITE\' THEN 1 ELSE 0 END) as traites'),
                    DB::raw('SUM(CASE WHEN courrier_affectations.statut IN (\'AFFECTE\', \'PRIS_EN_CHARGE\', \'EN_TRAITEMENT\') THEN 1 ELSE 0 END) as en_cours'),
                    DB::raw('AVG(DATEDIFF(courrier_affectations.date_traitement, courrier_affectations.date_affectation)) as delai_moyen_jours')
                )
                ->groupBy('directions.id', 'directions.code', 'directions.libelle')
                ->get();

            // Performance par département
            $parDepartement = DB::table('courrier_affectations')
                ->join('departements', 'courrier_affectations.departement_id', '=', 'departements.id')
                ->join('courriers', 'courrier_affectations.courrier_id', '=', 'courriers.id')
                ->whereBetween('courriers.date_reception', [$dateDebut, Carbon::parse($dateFin)->endOfDay()])
                ->select(
                    'departements.id',
                    'departements.code',
                    'departements.libelle',
                    DB::raw('COUNT(DISTINCT courrier_affectations.courrier_id) as total_courriers'),
                    DB::raw('SUM(CASE WHEN courrier_affectations.statut = \'TRAITE\' THEN 1 ELSE 0 END) as traites'),
                    DB::raw('AVG(DATEDIFF(courrier_affectations.date_traitement, courrier_affectations.date_affectation)) as delai_moyen_jours')
                )
                ->groupBy('departements.id', 'departements.code', 'departements.libelle')
                ->get();

            // Performance par service
            $parService = DB::table('courrier_affectations')
                ->join('services', 'courrier_affectations.service_id', '=', 'services.id')
                ->join('courriers', 'courrier_affectations.courrier_id', '=', 'courriers.id')
                ->whereBetween('courriers.date_reception', [$dateDebut, Carbon::parse($dateFin)->endOfDay()])
                ->select(
                    'services.id',
                    'services.code',
                    'services.libelle',
                    DB::raw('COUNT(DISTINCT courrier_affectations.courrier_id) as total_courriers'),
                    DB::raw('SUM(CASE WHEN courrier_affectations.statut = \'TRAITE\' THEN 1 ELSE 0 END) as traites'),
                    DB::raw('AVG(DATEDIFF(courrier_affectations.date_traitement, courrier_affectations.date_affectation)) as delai_moyen_jours')
                )
                ->groupBy('services.id', 'services.code', 'services.libelle')
                ->get();

            // Top 5 services les plus actifs
            $topServices = $parService->sortByDesc('total_courriers')->take(5)->values();

            // Services en difficulté (délai moyen > 7 jours)
            $servicesEnDifficulte = $parService->filter(fn ($s) => $s->delai_moyen_jours > 7)->values();

            return $this->success([
                'periode' => [
                    'debut' => $dateDebut,
                    'fin' => $dateFin,
                ],
                'par_direction' => $parDirection,
                'par_departement' => $parDepartement,
                'par_service' => $parService,
                'top_5_services' => $topServices,
                'services_en_difficulte' => $servicesEnDifficulte,
            ], 'Performance des services');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors du rapport', $e->getMessage(), 500);
        }
    }

    /**
     * Performance des agents : courriers traités par utilisateur.
     */
    public function performanceAgents(Request $request)
    {
        try {
            $dateDebut = $request->get('date_debut', now()->startOfMonth()->toDateString());
            $dateFin = $request->get('date_fin', now()->toDateString());

            $parAgent = DB::table('courrier_affectations')
                ->join('users', 'courrier_affectations.user_id', '=', 'users.id')
                ->join('courriers', 'courrier_affectations.courrier_id', '=', 'courriers.id')
                ->whereBetween('courriers.date_reception', [$dateDebut, Carbon::parse($dateFin)->endOfDay()])
                ->whereNotNull('courrier_affectations.user_id')
                ->select(
                    'users.id',
                    'users.name',
                    'users.email',
                    DB::raw('COUNT(DISTINCT courrier_affectations.courrier_id) as total_courriers'),
                    DB::raw('SUM(CASE WHEN courrier_affectations.statut = \'TRAITE\' THEN 1 ELSE 0 END) as traites'),
                    DB::raw('SUM(CASE WHEN courrier_affectations.statut IN (\'AFFECTE\', \'PRIS_EN_CHARGE\', \'EN_TRAITEMENT\') THEN 1 ELSE 0 END) as en_cours'),
                    DB::raw('AVG(DATEDIFF(courrier_affectations.date_traitement, courrier_affectations.date_affectation)) as delai_moyen_jours')
                )
                ->groupBy('users.id', 'users.name', 'users.email')
                ->orderByDesc('traites')
                ->get();

            // Top 3 agents
            $top3 = $parAgent->take(3)->values();

            return $this->success([
                'periode' => [
                    'debut' => $dateDebut,
                    'fin' => $dateFin,
                ],
                'agents' => $parAgent,
                'top_3_agents' => $top3,
                'total_agents_actifs' => $parAgent->count(),
            ], 'Performance des agents');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors du rapport', $e->getMessage(), 500);
        }
    }

    /**
     * Rapport des délais : courriers dans les temps vs en retard.
     */
    public function delais(Request $request)
    {
        try {
            $dateDebut = $request->get('date_debut', now()->startOfMonth()->toDateString());
            $dateFin = $request->get('date_fin', now()->toDateString());

            $base = Courrier::whereBetween('date_reception', [$dateDebut, Carbon::parse($dateFin)->endOfDay()])
                ->whereNotNull('date_limite');

            $total = (clone $base)->count();
            $dansLesTemps = (clone $base)->where('date_limite', '>=', now())
                ->whereHas('statut', fn ($q) => $q->whereIn('code', ['TRAITE', 'VALIDE', 'CLOTURE']))
                ->count();
            $enRetard = (clone $base)->where('date_limite', '<', now())
                ->whereDoesntHave('statut', fn ($q) => $q->whereIn('code', ['TRAITE', 'VALIDE', 'CLOTURE', 'REJETE', 'ARCHIVE']))
                ->count();

            // Répartition des retards par tranche
            $retard1a3 = (clone $base)->whereNotNull('date_limite')
                ->where('date_limite', '<', now())
                ->where('date_limite', '>=', now()->subDays(3))
                ->count();
            $retardPlus3 = (clone $base)->whereNotNull('date_limite')
                ->where('date_limite', '<', now()->subDays(3))
                ->count();

            // Délais moyens par priorité
            $parPriorite = DB::table('courriers')
                ->join('priorites', 'courriers.priorite_id', '=', 'priorites.id')
                ->whereBetween('courriers.date_reception', [$dateDebut, Carbon::parse($dateFin)->endOfDay()])
                ->whereNotNull('courriers.date_cloture')
                ->select(
                    'priorites.libelle',
                    'priorites.code',
                    'priorites.niveau',
                    DB::raw('AVG(DATEDIFF(courriers.date_cloture, courriers.date_reception)) as delai_moyen_jours'),
                    DB::raw('COUNT(*) as total')
                )
                ->groupBy('priorites.id', 'priorites.libelle', 'priorites.code', 'priorites.niveau')
                ->orderByDesc('priorites.niveau')
                ->get();

            return $this->success([
                'periode' => [
                    'debut' => $dateDebut,
                    'fin' => $dateFin,
                ],
                'total_avec_limite' => $total,
                'dans_les_temps' => $dansLesTemps,
                'en_retard' => $enRetard,
                'taux_respect_delais_pourcentage' => $total > 0 ? round(($dansLesTemps / $total) * 100, 1) : 0,
                'retards' => [
                    '1_a_3_jours' => $retard1a3,
                    'plus_de_3_jours' => $retardPlus3,
                ],
                'delais_moyens_par_priorite' => $parPriorite,
            ], 'Rapport des délais');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors du rapport', $e->getMessage(), 500);
        }
    }

    /**
     * Rapport des volumes : courriers par période.
     */
    public function volumes(Request $request)
    {
        try {
            $annee = $request->get('annee', now()->year);

            // Volume par mois
            $parMois = DB::table('courriers')
                ->select(
                    DB::raw('MONTH(created_at) as mois'),
                    DB::raw('YEAR(created_at) as annee'),
                    DB::raw('COUNT(*) as total')
                )
                ->whereYear('created_at', $annee)
                ->groupBy('annee', 'mois')
                ->orderBy('mois')
                ->get();

            // Volume par type de courrier
            $parType = DB::table('courriers')
                ->join('type_courriers', 'courriers.type_courrier_id', '=', 'type_courriers.id')
                ->whereYear('courriers.created_at', $annee)
                ->select('type_courriers.libelle', DB::raw('COUNT(*) as total'))
                ->groupBy('type_courriers.id', 'type_courriers.libelle')
                ->get();

            // Volume par catégorie
            $parCategorie = DB::table('courriers')
                ->leftJoin('categorie_courriers', 'courriers.categorie_id', '=', 'categorie_courriers.id')
                ->whereYear('courriers.created_at', $annee)
                ->select('categorie_courriers.libelle', DB::raw('COUNT(*) as total'))
                ->groupBy('categorie_courriers.id', 'categorie_courriers.libelle')
                ->get();

            return $this->success([
                'annee' => $annee,
                'par_mois' => $parMois,
                'par_type' => $parType,
                'par_categorie' => $parCategorie,
            ], 'Rapport des volumes');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors du rapport', $e->getMessage(), 500);
        }
    }

    /**
     * Rapport de confidentialité.
     */
    public function confidentialite(Request $request)
    {
        try {
            $dateDebut = $request->get('date_debut', now()->startOfYear()->toDateString());
            $dateFin = $request->get('date_fin', now()->toDateString());

            $parConfidentialite = DB::table('courriers')
                ->whereBetween('date_reception', [$dateDebut, Carbon::parse($dateFin)->endOfDay()])
                ->select('confidentialite', DB::raw('COUNT(*) as total'))
                ->groupBy('confidentialite')
                ->orderByDesc('total')
                ->get();

            // Courriers très confidentiels par direction
            $tresConfidentielsParDirection = DB::table('courriers')
                ->join('courrier_affectations', 'courriers.id', '=', 'courrier_affectations.courrier_id')
                ->join('directions', 'courrier_affectations.direction_id', '=', 'directions.id')
                ->where('courriers.confidentialite', 'TRES_CONFIDENTIEL')
                ->whereBetween('courriers.date_reception', [$dateDebut, Carbon::parse($dateFin)->endOfDay()])
                ->select('directions.libelle', DB::raw('COUNT(DISTINCT courriers.id) as total'))
                ->groupBy('directions.id', 'directions.libelle')
                ->get();

            return $this->success([
                'periode' => [
                    'debut' => $dateDebut,
                    'fin' => $dateFin,
                ],
                'par_confidentialite' => $parConfidentialite,
                'tres_confidentiels_par_direction' => $tresConfidentielsParDirection,
            ], 'Rapport de confidentialité');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors du rapport', $e->getMessage(), 500);
        }
    }

    /**
     * Export CSV d'un rapport.
     */
    public function export(Request $request)
    {
        try {
            $type = $request->get('type', 'courriers');
            $dateDebut = $request->get('date_debut', now()->startOfMonth()->toDateString());
            $dateFin = $request->get('date_fin', now()->toDateString());

            $filename = "rapport_{$type}_" . now()->format('Y-m-d') . '.csv';

            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            $callback = function () use ($type, $dateDebut, $dateFin) {
                $file = fopen('php://output', 'w');

                // BOM UTF-8 pour Excel
                fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

                if ($type === 'courriers') {
                    fputcsv($file, ['Numéro', 'Objet', 'Type', 'Priorité', 'Statut', 'Date réception', 'Date limite']);

                    Courrier::with(['typeCourrier', 'priorite', 'statut'])
                        ->whereBetween('date_reception', [$dateDebut, Carbon::parse($dateFin)->endOfDay()])
                        ->chunk(500, function ($courriers) use ($file) {
                            foreach ($courriers as $c) {
                                fputcsv($file, [
                                    $c->numero,
                                    $c->objet,
                                    $c->typeCourrier?->libelle,
                                    $c->priorite?->libelle,
                                    $c->statut?->libelle,
                                    $c->date_reception?->format('d/m/Y H:i'),
                                    $c->date_limite?->format('d/m/Y H:i'),
                                ]);
                            }
                        });
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de l\'export', $e->getMessage(), 500);
        }
    }
}