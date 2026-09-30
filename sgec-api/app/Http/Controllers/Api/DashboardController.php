<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Courrier;
use App\Models\CourrierAffectation;
use App\Models\CourrierHistorique;
use App\Models\TypeCourrier;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Vue d'ensemble : compteurs principaux pour les cartes du dashboard.
     */
    public function overview(Request $request)
    {
        try {
            $totalCourriers = Courrier::count();

            // Par type de courrier
            $entrants = Courrier::whereHas('typeCourrier', fn ($q) => $q->where('code', 'ENTRANT'))->count();
            $sortants = Courrier::whereHas('typeCourrier', fn ($q) => $q->where('code', 'SORTANT'))->count();
            $internes = Courrier::whereHas('typeCourrier', fn ($q) => $q->where('code', 'INTERNE'))->count();

            // Par statut
            $enCours = Courrier::whereHas('statut', fn ($q) => $q->whereIn('code', ['AFFECTE', 'EN_COURS']))->count();
            $traites = Courrier::whereHas('statut', fn ($q) => $q->where('code', 'TRAITE'))->count();
            $valides = Courrier::whereHas('statut', fn ($q) => $q->where('code', 'VALIDE'))->count();
            $clotures = Courrier::whereHas('statut', fn ($q) => $q->where('code', 'CLOTURE'))->count();

            // Courriers en retard (date_limite dépassée et non traités)
            $enRetard = Courrier::where('date_limite', '<', now())
                ->whereDoesntHave('statut', fn ($q) => $q->whereIn('code', ['TRAITE', 'VALIDE', 'CLOTURE', 'REJETE', 'ARCHIVE']))
                ->count();

            // Ce mois
            $ceMois = Courrier::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            // Mois précédent pour le calcul de tendance
            $moisPrecedent = Courrier::whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->count();

            $tendance = $moisPrecedent > 0
                ? round((($ceMois - $moisPrecedent) / $moisPrecedent) * 100, 1)
                : 0;

            // Pièces jointes totales
            $totalPieces = DB::table('courrier_pieces')->count();

            // Utilisateurs actifs
            $utilisateursActifs = DB::table('users')->where('actif', true)->count();

            return $this->success([
                'total_courriers' => $totalCourriers,
                'entrants' => $entrants,
                'sortants' => $sortants,
                'internes' => $internes,
                'en_cours' => $enCours,
                'traites' => $traites,
                'valides' => $valides,
                'clotures' => $clotures,
                'en_retard' => $enRetard,
                'ce_mois' => $ceMois,
                'mois_precedent' => $moisPrecedent,
                'tendance_pourcentage' => $tendance,
                'total_pieces_jointes' => $totalPieces,
                'utilisateurs_actifs' => $utilisateursActifs,
            ], 'Vue d\'ensemble');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    /**
     * Statistiques détaillées avec tous les agrégats.
     */
    public function statistiques(Request $request)
    {
        try {
            // Par type de courrier
            $parType = TypeCourrier::withCount('courriers')
                ->get()
                ->map(fn ($t) => [
                    'libelle' => $t->libelle,
                    'code' => $t->code,
                    'total' => $t->courriers_count,
                ]);

            // Par statut
            $parStatut = DB::table('courriers')
                ->join('statut_courriers', 'courriers.statut_id', '=', 'statut_courriers.id')
                ->select('statut_courriers.libelle', 'statut_courriers.code', DB::raw('COUNT(*) as total'))
                ->groupBy('statut_courriers.id', 'statut_courriers.libelle', 'statut_courriers.code')
                ->get();

            // Par priorité
            $parPriorite = DB::table('courriers')
                ->join('priorites', 'courriers.priorite_id', '=', 'priorites.id')
                ->select('priorites.libelle', 'priorites.code', 'priorites.niveau', DB::raw('COUNT(*) as total'))
                ->groupBy('priorites.id', 'priorites.libelle', 'priorites.code', 'priorites.niveau')
                ->orderByDesc('priorites.niveau')
                ->get();

            // Par catégorie
            $parCategorie = DB::table('courriers')
                ->leftJoin('categorie_courriers', 'courriers.categorie_id', '=', 'categorie_courriers.id')
                ->select('categorie_courriers.libelle', DB::raw('COUNT(*) as total'))
                ->groupBy('categorie_courriers.id', 'categorie_courriers.libelle')
                ->get();

            // Par confidentialité
            $parConfidentialite = DB::table('courriers')
                ->select('confidentialite', DB::raw('COUNT(*) as total'))
                ->groupBy('confidentialite')
                ->get();

            // Délai moyen de traitement (en jours)
            $delaiMoyen = Courrier::whereNotNull('date_cloture')
                ->whereNotNull('date_reception')
                ->selectRaw('AVG(DATEDIFF(date_cloture, date_reception)) as moyenne')
                ->value('moyenne');

            return $this->success([
                'par_type' => $parType,
                'par_statut' => $parStatut,
                'par_priorite' => $parPriorite,
                'par_categorie' => $parCategorie,
                'par_confidentialite' => $parConfidentialite,
                'delai_moyen_traitement_jours' => round($delaiMoyen ?? 0, 1),
            ], 'Statistiques détaillées');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    /**
     * Activité récente (basée sur le journal d'audit).
     */
    public function activiteRecente(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);

            $activites = AuditLog::with('user')
                ->orderByDesc('created_at')
                ->limit($limit)
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'event' => $log->event,
                    'url' => $log->url,
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                    ] : null,
                    'date' => $log->created_at,
                    'date_humaine' => $log->created_at->diffForHumans(),
                ]);

            return $this->success($activites, 'Activité récente');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    /**
     * Volume mensuel (12 derniers mois) pour graphique.
     */
    public function volumeMensuel(Request $request)
    {
        try {
            $mois = [];
            $entrants = [];
            $sortants = [];
            $internes = [];

            for ($i = 11; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $mois[] = $date->translatedFormat('M Y');

                $entrants[] = Courrier::whereHas('typeCourrier', fn ($q) => $q->where('code', 'ENTRANT'))
                    ->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->count();

                $sortants[] = Courrier::whereHas('typeCourrier', fn ($q) => $q->where('code', 'SORTANT'))
                    ->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->count();

                $internes[] = Courrier::whereHas('typeCourrier', fn ($q) => $q->where('code', 'INTERNE'))
                    ->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->count();
            }

            return $this->success([
                'labels' => $mois,
                'datasets' => [
                    'entrants' => $entrants,
                    'sortants' => $sortants,
                    'internes' => $internes,
                ],
            ], 'Volume mensuel');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    /**
     * Répartition globale pour graphiques circulaires.
     */
    public function repartition(Request $request)
    {
        try {
            $parStatut = DB::table('courriers')
                ->join('statut_courriers', 'courriers.statut_id', '=', 'statut_courriers.id')
                ->select('statut_courriers.libelle as label', DB::raw('COUNT(*) as value'))
                ->groupBy('statut_courriers.id', 'statut_courriers.libelle')
                ->get();

            $parPriorite = DB::table('courriers')
                ->join('priorites', 'courriers.priorite_id', '=', 'priorites.id')
                ->select('priorites.libelle as label', DB::raw('COUNT(*) as value'))
                ->groupBy('priorites.id', 'priorites.libelle')
                ->get();

            $parConfidentialite = DB::table('courriers')
                ->select('confidentialite as label', DB::raw('COUNT(*) as value'))
                ->groupBy('confidentialite')
                ->get();

            return $this->success([
                'par_statut' => $parStatut,
                'par_priorite' => $parPriorite,
                'par_confidentialite' => $parConfidentialite,
            ], 'Répartition');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    /**
     * Derniers courriers enregistrés.
     */
    public function courriersRecents(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);

            $courriers = Courrier::with([
                'typeCourrier', 'categorie', 'priorite', 'statut',
                'expediteur', 'destinataire', 'createur',
            ])
                ->orderByDesc('created_at')
                ->limit($limit)
                ->get();

            return $this->success($courriers, 'Courriers récents');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    /**
     * Courriers en retard (date_limite dépassée).
     */
    public function courriersRetard(Request $request)
    {
        try {
            $courriers = Courrier::with([
                'typeCourrier', 'priorite', 'statut', 'expediteur',
            ])
                ->where('date_limite', '<', now())
                ->whereDoesntHave('statut', fn ($q) => $q->whereIn('code', ['TRAITE', 'VALIDE', 'CLOTURE', 'REJETE', 'ARCHIVE']))
                ->orderBy('date_limite')
                ->limit($request->get('limit', 20))
                ->get()
                ->map(function ($c) {
                    $c->jours_retard = now()->diffInDays($c->date_limite);
                    return $c;
                });

            return $this->success($courriers, 'Courriers en retard');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    /**
     * Mes affectations en cours (courriers à traiter par l'utilisateur connecté).
     */
    public function mesAffectations(Request $request)
    {
        try {
            $user = $request->user();

            // Récupérer les IDs des courriers affectés à cet utilisateur
            $courrierIds = CourrierAffectation::where('user_id', $user->id)
                ->whereIn('statut', ['AFFECTE', 'PRIS_EN_CHARGE', 'EN_TRAITEMENT'])
                ->pluck('courrier_id');

            $courriers = Courrier::with([
                'typeCourrier', 'priorite', 'statut', 'expediteur',
            ])
                ->whereIn('id', $courrierIds)
                ->orderByDesc('date_limite')
                ->limit($request->get('limit', 20))
                ->get();

            return $this->success([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                ],
                'total' => $courriers->count(),
                'courriers' => $courriers,
            ], 'Mes affectations en cours');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }
}