<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Courrier;
use App\Models\CourrierAffectation;
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
            $user = $request->user();
            $base = Courrier::visiblePour($user)->visibleConfidentialite($user);

            $totalCourriers = (clone $base)->count();

            $entrants = (clone $base)->whereHas('typeCourrier', fn ($q) => $q->where('code', 'ENTRANT'))->count();
            $sortants = (clone $base)->whereHas('typeCourrier', fn ($q) => $q->where('code', 'SORTANT'))->count();
            $internes = (clone $base)->whereHas('typeCourrier', fn ($q) => $q->whereIn('code', ['INT_ENTRANT', 'INT_SORTANT']))->count();

            $enCours = (clone $base)->whereHas('statut', fn ($q) => $q->whereIn('code', ['AFFECTE', 'EN_COURS']))->count();
            $traites = (clone $base)->whereHas('statut', fn ($q) => $q->where('code', 'TRAITE'))->count();
            $valides = (clone $base)->whereHas('statut', fn ($q) => $q->where('code', 'VALIDE'))->count();
            $clotures = (clone $base)->whereHas('statut', fn ($q) => $q->where('code', 'CLOTURE'))->count();

            $enRetard = (clone $base)->where('date_limite', '<', now())
                ->whereDoesntHave('statut', fn ($q) => $q->whereIn('code', ['TRAITE', 'VALIDE', 'CLOTURE', 'REJETE', 'ARCHIVE']))
                ->count();

            $ceMois = (clone $base)->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            $moisPrecedent = (clone $base)->whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->count();

            $tendance = $moisPrecedent > 0
                ? round((($ceMois - $moisPrecedent) / $moisPrecedent) * 100, 1)
                : 0;

            // Pièces jointes des courriers visibles (sous-requête, sans matérialiser les IDs)
            $totalPieces = DB::table('courrier_pieces')
                ->whereIn('courrier_id', (clone $base)->select('id'))
                ->count();

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
            $user = $request->user();
            $base = Courrier::visiblePour($user)->visibleConfidentialite($user);

            // Par type de courrier
            $parType = TypeCourrier::withCount(['courriers' => function ($q) use ($user) {
                $q->visiblePour($user)->visibleConfidentialite($user);
            }])
                ->get()
                ->map(fn ($t) => [
                    'libelle' => $t->libelle,
                    'code' => $t->code,
                    'total' => $t->courriers_count,
                ]);

            // Par statut
            $parStatut = (clone $base)
                ->join('statut_courriers', 'courriers.statut_id', '=', 'statut_courriers.id')
                ->select('statut_courriers.libelle', 'statut_courriers.code', DB::raw('COUNT(*) as total'))
                ->groupBy('statut_courriers.id', 'statut_courriers.libelle', 'statut_courriers.code')
                ->get();

            // Par priorité
            $parPriorite = (clone $base)
                ->join('priorites', 'courriers.priorite_id', '=', 'priorites.id')
                ->select('priorites.libelle', 'priorites.code', 'priorites.niveau', DB::raw('COUNT(*) as total'))
                ->groupBy('priorites.id', 'priorites.libelle', 'priorites.code', 'priorites.niveau')
                ->orderByDesc('priorites.niveau')
                ->get();

            // Par catégorie
            $parCategorie = (clone $base)
                ->leftJoin('categorie_courriers', 'courriers.categorie_id', '=', 'categorie_courriers.id')
                ->select('categorie_courriers.libelle', DB::raw('COUNT(*) as total'))
                ->groupBy('categorie_courriers.id', 'categorie_courriers.libelle')
                ->get();

            // Par confidentialité
            $parConfidentialite = (clone $base)
                ->select('confidentialite', DB::raw('COUNT(*) as total'))
                ->groupBy('confidentialite')
                ->get();

            // Délai moyen de traitement (en jours)
            $delaiMoyen = (clone $base)->whereNotNull('date_cloture')
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
            $limit = min((int) $request->get('limit', 10), 50);

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
            $user = $request->user();
            $base = Courrier::visiblePour($user)->visibleConfidentialite($user);

            $rows = (clone $base)
                ->join('type_courriers', 'courriers.type_courrier_id', '=', 'type_courriers.id')
                ->where('courriers.created_at', '>=', now()->subMonths(11)->startOfMonth())
                ->selectRaw('YEAR(courriers.created_at) as annee, MONTH(courriers.created_at) as mois, type_courriers.code')
                ->selectRaw('COUNT(*) as total')
                ->groupBy(DB::raw('YEAR(courriers.created_at)'), DB::raw('MONTH(courriers.created_at)'), 'type_courriers.code')
                ->get();

            $byKey = [];
            foreach ($rows as $r) {
                $byKey[$r->annee . '-' . $r->mois][$r->code] = $r->total;
            }

            $mois = [];
            $entrants = [];
            $sortants = [];
            $internes = [];

            for ($i = 11; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $mois[] = $date->translatedFormat('M Y');

                $key = $date->year . '-' . $date->month;
                $m = $byKey[$key] ?? [];
                $entrants[] = $m['ENTRANT'] ?? 0;
                $sortants[] = $m['SORTANT'] ?? 0;
                $internes[] = ($m['INT_ENTRANT'] ?? 0) + ($m['INT_SORTANT'] ?? 0);
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
            $user = $request->user();
            $base = Courrier::visiblePour($user)->visibleConfidentialite($user);

            $parStatut = (clone $base)
                ->join('statut_courriers', 'courriers.statut_id', '=', 'statut_courriers.id')
                ->select('statut_courriers.libelle as label', DB::raw('COUNT(*) as value'))
                ->groupBy('statut_courriers.id', 'statut_courriers.libelle')
                ->get();

            $parPriorite = (clone $base)
                ->join('priorites', 'courriers.priorite_id', '=', 'priorites.id')
                ->select('priorites.libelle as label', DB::raw('COUNT(*) as value'))
                ->groupBy('priorites.id', 'priorites.libelle')
                ->get();

            $parConfidentialite = (clone $base)
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
            $user = $request->user();
            $limit = min((int) $request->get('limit', 10), 50);

            $courriers = Courrier::visiblePour($user)->visibleConfidentialite($user)
                ->with([
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
            $user = $request->user();

            $courriers = Courrier::visiblePour($user)->visibleConfidentialite($user)
                ->with(['typeCourrier', 'priorite', 'statut', 'expediteur'])
                ->where('date_limite', '<', now())
                ->whereDoesntHave('statut', fn ($q) => $q->whereIn('code', ['TRAITE', 'VALIDE', 'CLOTURE', 'REJETE', 'ARCHIVE']))
                ->orderBy('date_limite')
                ->limit(min((int) $request->get('limit', 20), 50))
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

            $courrierIds = CourrierAffectation::where('user_id', $user->id)
                ->whereIn('statut', ['AFFECTE', 'PRIS_EN_CHARGE', 'EN_TRAITEMENT'])
                ->pluck('courrier_id');

            $courriers = Courrier::with([
                'typeCourrier', 'priorite', 'statut', 'expediteur',
            ])
                ->whereIn('id', $courrierIds)
                ->orderByDesc('date_limite')
                ->limit(min((int) $request->get('limit', 20), 50))
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
